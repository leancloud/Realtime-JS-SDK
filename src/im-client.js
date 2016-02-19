import Client from './client';
import Conversation from './conversation';
import ConversationQuery from './conversation-query';
import {
  GenericCommand,
  SessionCommand,
  ConvCommand,
  JsonObjectMessage,
} from '../proto/message';
import { Promise } from 'rsvp';
import { tap, Cache } from './utils';
import { default as d } from 'debug';
import { version as VERSION } from '../package.json';

const debug = d('LC:IMClient');

export default class IMClient extends Client {
  constructor(...args) {
    super(...args);
    this._conversationCache = new Cache(`client:${this.id}`);
  }

  _send(cmd) {
    const command = cmd;
    if (this.id) {
      command.peerId = this.id;
    }
    return this._connection.send(command);
  }

  _open(appId, isReconnect = false) {
    debug('open session');
    return Promise.resolve(new GenericCommand({
      cmd: 'session',
      op: 'open',
      appId,
      sessionMessage: new SessionCommand({
        ua: `js/${VERSION}`,
        r: isReconnect,
      }),
    }))
    .then(cmd => {
      const command = cmd;
      if (this.options.signatureFactory) {
        debug(`call signatureFactory with [${this.id}]`);
        return Promise.resolve()
          .then(() => this.options.signatureFactory(this.id))
          .then(tap(signatureResult => debug('signatureResult', signatureResult)))
          .then((signatureResult = {}) => {
            const {
              signature,
              timestamp,
              nonce,
            } = signatureResult;
            if (typeof signature !== 'string'
                || typeof timestamp !== 'number'
                || typeof nonce !== 'string') {
              throw new Error('malformed signature');
            }
            Object.assign(command.sessionMessage, {
              s: signature,
              t: timestamp,
              n: nonce,
            });
            return command;
          }, error => {
            debug(error);
            throw new Error(`signatureFactory error: ${error.message}`);
          });
      }
      return command;
    })
    .then(this._send.bind(this))
    .then(resCommand => {
      const peerId = resCommand.peerId;
      if (!peerId) {
        console.warn(`Unexpected session opened without peerId.`);
        return;
      }
      this.id = peerId;
    });
  }

  close() {
    debug('close session');
    const command = new GenericCommand({
      cmd: 'session',
      op: 'close',
    });
    return this._send(command).then(
      () => {
        this.emit('close', {
          code: 0,
        });
      }
    );
  }

  ping(ids) {
    debug('ping');
    if (!(ids instanceof Array)) {
      throw new TypeError(`ids ${ids} is not an Array`);
    }
    const command = new GenericCommand({
      cmd: 'session',
      op: 'query',
      sessionMessage: new SessionCommand({
        sessionPeerIds: ids,
      }),
    });
    return this._send(command)
      .then(resCommand => resCommand.sessionMessage.onlineSessionPeerIds);
  }

  getConversation(id) {
    if (typeof id !== 'string') {
      return new TypeError(`${id} is not a String`);
    }
    const cachedConversation = this._conversationCache.get(id);
    if (cachedConversation) {
      return Promise.resolve(cachedConversation);
    }
    return this.getQuery()
      .equalTo('objectId', id)
      .find()
      .then(conversations => conversations[0] || null);
  }

  getQuery() {
    return new ConversationQuery(this);
  }

  _executeQuery(query) {
    const queryJSON = query.toJSON();
    queryJSON.where = new JsonObjectMessage({
      data: JSON.stringify(queryJSON.where),
    });
    const command = new GenericCommand({
      cmd: 'conv',
      op: 'query',
      convMessage: new ConvCommand(queryJSON),
    });
    return this._send(command)
      .then(resCommand => JSON.parse(resCommand.convMessage.results.data))
      .then(conversations => conversations.map(
        conversation => new Conversation(conversation)
      ))
      .then(tap(conversations => conversations.map(conversation =>
        this._conversationCache.set(conversation.id, conversation)
      )));
  }

}