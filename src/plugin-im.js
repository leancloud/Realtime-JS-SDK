/** @module leancloud-realtime */
import d from 'debug';
import uuid from 'uuid/v4';
import IMClient from './im-client';
import { RECONNECT, RECONNECT_ERROR } from './events/core';
import { Conversation } from './conversations';
import { MessageQueryDirection } from './conversations/conversation-base';
import Message, { MessageStatus } from './messages/message';
import BinaryMessage from './messages/binary-message';
import TextMessage from './messages/text-message';
import TypedMessage from './messages/typed-message';
import RecalledMessage from './messages/recalled-message';
import MessageParser from './message-parser';
import { trim, internal, finalize } from './utils';

const debug = d('LC:IMPlugin');

/**
 * 消息优先级枚举
 * @enum {Number}
 * @since 3.3.0
 */
const MessagePriority = {
  /** 高 */
  HIGH: 1,
  /** 普通 */
  NORMAL: 2,
  /** 低 */
  LOW: 3,
};
Object.freeze(MessagePriority);

/**
 * 为 Conversation 定义一个新属性
 * @param {String} prop 属性名
 * @param {Object} [descriptor] 属性的描述符，参见 {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor#Description getOwnPropertyDescriptor#Description - MDN}，默认为该属性名对应的 Conversation 自定义属性的 getter/setter
 * @returns void
 * @example
 *
 * conversation.get('type');
 * conversation.set('type', 1);
 *
 * // equals to
 * defineConversationProperty('type');
 * conversation.type;
 * conversation.type = 1;
 */
const defineConversationProperty = (
  prop,
  descriptor = {
    get() {
      return this.get(prop);
    },
    set(value) {
      this.set(prop, value);
    },
  }
) => {
  Object.defineProperty(Conversation.prototype, prop, descriptor);
};

export {
  /**
   * @see Message
   */
  Message,
  /**
   * @see BinaryMessage
   */
  BinaryMessage,
  /**
   * @see TypedMessage
   */
  TypedMessage,
  /**
   * @see TextMessage
   */
  TextMessage,
  /**
   * @see RecalledMessage
   */
  RecalledMessage,
  MessagePriority,
  MessageStatus,
  MessageQueryDirection,
  defineConversationProperty,
};

export {
  /**
   * decorator，定义消息类的类型常量
   * @function
   * @param {Number} type 自定义类型请使用正整数
   * @example @messageType(1)
   * class CustomMessage extends TypedMessage {}
   *
   * // 不支持 decorator 的情况下可以这样使用
   * class CustomMessage extends TypedMessage {
   *   //...
   * }
   * messageType(1)(CustomMessage);
   */
  messageType,
  /**
   * decorator，定义消息类的自定义字段
   * @function
   * @param {String[]} fields 自定义字段
   * @example @messageField(['foo'])
   * class CustomMessage extends TypedMessage {
   *   constructor(foo) {
   *     super();
   *     this.foo = foo;
   *   }
   * }
   *
   * // 不支持 decorator 的情况下可以这样使用
   * class CustomMessage extends TypedMessage {
   *   constructor(foo) {
   *     super();
   *     this.foo = foo;
   *   }
   *   //...
   * }
   * messageField(['foo'])(CustomMessage);
   */
  messageField,
  IE10Compatible,
} from './messages/helpers';

export { ConversationMemberRole } from './conversation-member-info';
export {
  /**
   * @see Conversation
   */
  Conversation,
  /**
   * @see ChatRoom
   */
  ChatRoom,
  /**
   * @see ServiceConversation
   */
  ServiceConversation,
  /**
   * @see TemporaryConversation
   */
  TemporaryConversation,
} from './conversations';

const onRealtimeCreate = realtime => {
  /* eslint-disable no-param-reassign */
  const deviceId = uuid();
  realtime._IMClients = {};
  realtime._IMClientsCreationCount = 0;
  const messageParser = new MessageParser(realtime._plugins);
  realtime._messageParser = messageParser;

  const signAVUser = async user =>
    realtime._request({
      method: 'POST',
      path: '/rtm/sign',
      data: {
        session_token: user.getSessionToken(),
      },
    });

  /**
   * 注册消息类
   *
   * 在接收消息、查询消息时，会按照消息类注册顺序的逆序依次尝试解析消息内容
   *
   * @memberof Realtime
   * @instance
   * @param  {Function | Function[]} messageClass 消息类，需要实现 {@link AVMessage} 接口，
   * 建议继承自 {@link TypedMessage}
   * @throws {TypeError} 如果 messageClass 没有实现 {@link AVMessage} 接口则抛出异常
   */
  const register = messageParser.register.bind(messageParser);
  /**
   * 创建一个即时通讯客户端，多次创建相同 id 的客户端会返回同一个实例
   * @memberof Realtime
   * @instance
   * @param  {String|AV.User} [identity] 客户端 identity，如果不指定该参数，服务端会随机生成一个字符串作为 identity，
   * 如果传入一个已登录的 AV.User，则会使用该用户的 id 作为客户端 identity 登录。
   * @param  {Object} [options]
   * @param  {Function} [options.signatureFactory] open session 时的签名方法 // TODO need details
   * @param  {Function} [options.conversationSignatureFactory] 对话创建、增减成员操作时的签名方法
   * @param  {Function} [options.blacklistSignatureFactory] 黑名单操作时的签名方法
   * @param  {String} [options.tag] 客户端类型标记，以支持单点登录功能
   * @param  {String} [options.isReconnect=false] 单点登录时标记该次登录是不是应用启动时自动重新登录
   * @return {Promise.<IMClient>}
   */
  const createIMClient = async (
    identity,
    { tag, isReconnect, ...clientOptions } = {},
    lagecyTag
  ) => {
    let id;
    const buildinOptions = {};
    if (identity) {
      if (typeof identity === 'string') {
        id = identity;
      } else if (identity.id && identity.getSessionToken) {
        ({ id } = identity);
        const sessionToken = identity.getSessionToken();
        if (!sessionToken) {
          throw new Error('User must be authenticated');
        }
        buildinOptions.signatureFactory = signAVUser;
      } else {
        throw new TypeError('Identity must be a String or an AV.User');
      }
      if (realtime._IMClients[id] !== undefined) {
        return realtime._IMClients[id];
      }
    }
    if (lagecyTag) {
      console.warn(
        'DEPRECATION createIMClient tag param: Use options.tag instead.'
      );
    }
    const _tag = tag || lagecyTag;
    const promise = realtime
      ._open()
      .then(connection => {
        const client = new IMClient(
          id,
          { ...buildinOptions, ...clientOptions },
          {
            _connection: connection,
            _request: realtime._request.bind(realtime),
            _messageParser: messageParser,
            _plugins: realtime._plugins,
            _identity: identity,
          }
        );
        connection.on(RECONNECT, () =>
          client
            ._open(realtime._options.appId, _tag, deviceId, true)
            /**
             * 客户端连接恢复正常，该事件通常在 {@link Realtime#event:RECONNECT} 之后发生
             * @event IMClient#RECONNECT
             * @see Realtime#event:RECONNECT
             * @since 3.2.0
             */
            /**
             * 客户端重新登录发生错误（网络连接已恢复，但重新登录错误）
             * @event IMClient#RECONNECT_ERROR
             * @since 3.2.0
             */
            .then(
              () => client.emit(RECONNECT),
              error => client.emit(RECONNECT_ERROR, error)
            )
        );
        internal(client)._eventemitter.on(
          'beforeclose',
          () => {
            delete realtime._IMClients[client.id];
            if (realtime._firstIMClient === client) {
              delete realtime._firstIMClient;
            }
          },
          realtime
        );
        internal(client)._eventemitter.on(
          'close',
          () => {
            realtime._deregister(client);
          },
          realtime
        );
        return client
          ._open(realtime._options.appId, _tag, deviceId, isReconnect)
          .then(() => {
            realtime._IMClients[client.id] = client;
            realtime._IMClientsCreationCount += 1;
            if (realtime._IMClientsCreationCount === 1) {
              client._omitPeerId(true);
              realtime._firstIMClient = client;
            } else if (
              realtime._IMClientsCreationCount > 1 &&
              realtime._firstIMClient
            ) {
              realtime._firstIMClient._omitPeerId(false);
            }
            realtime._register(client);
            return client;
          })
          .catch(error => {
            delete realtime._IMClients[client.id];
            throw error;
          });
      })
      .then(
        ...finalize(() => {
          realtime._deregisterPending(promise);
        })
      )
      .catch(error => {
        delete realtime._IMClients[id];
        throw error;
      });
    if (identity) {
      realtime._IMClients[id] = promise;
    }
    realtime._registerPending(promise);
    return promise;
  };
  Object.assign(realtime, {
    register,
    createIMClient,
  });
  /* eslint-enable no-param-reassign */
};

const beforeCommandDispatch = (command, realtime) => {
  const isIMCommand = command.service === null || command.service === 2;
  if (!isIMCommand) return true;
  const targetClient = command.peerId
    ? realtime._IMClients[command.peerId]
    : realtime._firstIMClient;
  if (targetClient) {
    Promise.resolve(targetClient)
      .then(client => client._dispatchCommand(command))
      .catch(debug);
  } else {
    debug(
      '[WARN] Unexpected message received without any live client match: %O',
      trim(command)
    );
  }
  return false;
};

export const IMPlugin = {
  name: 'leancloud-realtime-plugin-im',
  onRealtimeCreate,
  beforeCommandDispatch,
  messageClasses: [Message, BinaryMessage, RecalledMessage, TextMessage],
};
