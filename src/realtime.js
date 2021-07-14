// eslint-disable-next-line max-classes-per-file
import d from 'debug';
import EventEmitter from 'eventemitter3';
import shuffle from 'lodash/shuffle';
import Connection, {
  OPEN,
  DISCONNECT,
  RECONNECT,
  RETRY,
  SCHEDULE,
  OFFLINE,
  ONLINE,
  ERROR,
  MESSAGE,
  EXPIRE,
} from './connection';
import { ErrorCode, createError } from './error';
import {
  tap,
  Cache,
  trim,
  internal,
  ensureArray,
  isWeapp,
  isCNApp,
} from './utils';
import request from './utils/request';
import { applyDecorators, applyDispatcher } from './plugin';
import { version as VERSION } from '../package.json';

const debug = d('LC:Realtime');
const routerCache = new Cache('push-router');

const initializedApp = {};

export default class Realtime extends EventEmitter {
  /**
   * @extends EventEmitter
   * @param  {Object} options
   * @param  {String} options.appId
   * @param  {String} options.appKey （since 4.0.0）
   * @param  {String|Object} [options.server] 指定服务器域名，中国节点应用此参数必填（since 4.0.0）
   * @param  {Boolean} [options.noBinary=false] 设置 WebSocket 使用字符串格式收发消息（默认为二进制格式）。
   *                                            适用于 WebSocket 实现不支持二进制数据格式的情况
   * @param  {Boolean} [options.ssl=true] 使用 wss 进行连接
   * @param  {String|String[]} [options.RTMServers] 指定私有部署的 RTM 服务器地址（since 4.0.0）
   * @param  {Plugin[]} [options.plugins] 加载插件（since 3.1.0）
   */
  constructor({ plugins, ...options }) {
    debug('initializing Realtime %s %O', VERSION, options);
    super();
    const { appId } = options;
    if (typeof appId !== 'string') {
      throw new TypeError(`appId [${appId}] is not a string`);
    }
    if (initializedApp[appId]) {
      throw new Error(`App [${appId}] is aleady initialized.`);
    }
    initializedApp[appId] = true;
    if (typeof options.appKey !== 'string') {
      throw new TypeError(`appKey [${options.appKey}] is not a string`);
    }
    if (isCNApp(appId)) {
      if (!options.server) {
        throw new TypeError(
          `server option is required for apps from CN region`
        );
      }
    }
    this._options = {
      appId: undefined,
      appKey: undefined,
      noBinary: false,
      ssl: true,
      RTMServerName:
        typeof process !== 'undefined'
          ? process.env.RTM_SERVER_NAME
          : undefined, // undocumented on purpose, internal use only
      ...options,
    };
    this._cache = new Cache('endpoints');
    const _this = internal(this);
    _this.clients = new Set();
    _this.pendingClients = new Set();
    const mergedPlugins = [
      ...ensureArray(Realtime.__preRegisteredPlugins),
      ...ensureArray(plugins),
    ];
    debug(
      'Using plugins %o',
      mergedPlugins.map(plugin => plugin.name)
    );
    this._plugins = mergedPlugins.reduce((result, plugin) => {
      Object.keys(plugin).forEach(hook => {
        if ({}.hasOwnProperty.call(plugin, hook) && hook !== 'name') {
          if (plugin.name) {
            ensureArray(plugin[hook]).forEach(value => {
              // eslint-disable-next-line no-param-reassign
              value._pluginName = plugin.name;
            });
          }
          // eslint-disable-next-line no-param-reassign
          result[hook] = ensureArray(result[hook]).concat(plugin[hook]);
        }
      });
      return result;
    }, {});
    // onRealtimeCreate hook
    applyDecorators(this._plugins.onRealtimeCreate, this);
  }

  async _request({
    method,
    url: _url,
    version = '1.1',
    path,
    query,
    headers,
    data,
  }) {
    let url = _url;
    if (!url) {
      const { appId, server } = this._options;
      const { api } = await this.constructor._getServerUrls({
        appId,
        server,
      });
      url = `${api}/${version}${path}`;
    }
    return request({
      url,
      method,
      query,
      headers: {
        'X-LC-Id': this._options.appId,
        'X-LC-Key': this._options.appKey,
        ...headers,
      },
      data,
    });
  }

  _open() {
    if (this._openPromise) return this._openPromise;

    let format = 'protobuf2';
    if (this._options.noBinary) {
      // 不发送 binary data，fallback to base64 string
      format = 'proto2base64';
    }
    const version = 3;
    const protocol = {
      format,
      version,
    };
    this._openPromise = new Promise((resolve, reject) => {
      debug('No connection established, create a new one.');
      const connection = new Connection(
        () => this._getRTMServers(this._options),
        protocol
      );
      connection
        .on(OPEN, () => resolve(connection))
        .on(ERROR, error => {
          delete this._openPromise;
          reject(error);
        })
        .on(EXPIRE, async () => {
          debug('Connection expired. Refresh endpoints.');
          this._cache.set('endpoints', null, 0);
          connection.urls = await this._getRTMServers(this._options);
          connection.disconnect();
        })
        .on(MESSAGE, this._dispatchCommand.bind(this));
      /**
       * 连接断开。
       * 连接断开可能是因为 SDK 进入了离线状态（see {@link Realtime#event:OFFLINE}），或长时间没有收到服务器心跳。
       * 连接断开后所有的网络操作都会失败，请在连接断开后禁用相关的 UI 元素。
       * @event Realtime#DISCONNECT
       */
      /**
       * 计划在一段时间后尝试重新连接
       * @event Realtime#SCHEDULE
       * @param {Number} attempt 尝试重连的次数
       * @param {Number} delay 延迟的毫秒数
       */
      /**
       * 正在尝试重新连接
       * @event Realtime#RETRY
       * @param {Number} attempt 尝试重连的次数
       */
      /**
       * 连接恢复正常。
       * 请重新启用在 {@link Realtime#event:DISCONNECT} 事件中禁用的相关 UI 元素
       * @event Realtime#RECONNECT
       */

      /**
       * 客户端连接断开
       * @event IMClient#DISCONNECT
       * @see Realtime#event:DISCONNECT
       * @since 3.2.0
       */
      /**
       * 计划在一段时间后尝试重新连接
       * @event IMClient#SCHEDULE
       * @param {Number} attempt 尝试重连的次数
       * @param {Number} delay 延迟的毫秒数
       * @since 3.2.0
       */
      /**
       * 正在尝试重新连接
       * @event IMClient#RETRY
       * @param {Number} attempt 尝试重连的次数
       * @since 3.2.0
       */

      /**
       * 客户端进入离线状态。
       * 这通常意味着网络已断开，或者 {@link Realtime#pause} 被调用
       * @event Realtime#OFFLINE
       * @since 3.4.0
       */
      /**
       * 客户端恢复在线状态
       * 这通常意味着网络已恢复，或者 {@link Realtime#resume} 被调用
       * @event Realtime#ONLINE
       * @since 3.4.0
       */
      /**
       * 进入离线状态。
       * 这通常意味着网络已断开，或者 {@link Realtime#pause} 被调用
       * @event IMClient#OFFLINE
       * @since 3.4.0
       */
      /**
       * 恢复在线状态
       * 这通常意味着网络已恢复，或者 {@link Realtime#resume} 被调用
       * @event IMClient#ONLINE
       * @since 3.4.0
       */

      // event proxy
      [DISCONNECT, RECONNECT, RETRY, SCHEDULE, OFFLINE, ONLINE].forEach(event =>
        connection.on(event, (...payload) => {
          debug(`${event} event emitted. %o`, payload);
          this.emit(event, ...payload);
          if (event !== RECONNECT) {
            internal(this).clients.forEach(client => {
              client.emit(event, ...payload);
            });
          }
        })
      );
      // override handleClose
      connection.handleClose = function handleClose(event) {
        const isFatal = [
          ErrorCode.APP_NOT_AVAILABLE,
          ErrorCode.INVALID_LOGIN,
          ErrorCode.INVALID_ORIGIN,
        ].some(errorCode => errorCode === event.code);
        if (isFatal) {
          // in these cases, SDK should throw.
          this.throw(createError(event));
        } else {
          // reconnect
          this.disconnect();
        }
      };
      internal(this).connection = connection;
    });

    return this._openPromise;
  }

  async _getRTMServers(options) {
    if (options.RTMServers) return shuffle(ensureArray(options.RTMServers));
    let info;
    const cachedEndPoints = this._cache.get('endpoints');
    if (cachedEndPoints) {
      info = cachedEndPoints;
    } else {
      info = await this.constructor._fetchRTMServers(options);
      const { server, secondary, ttl } = info;
      if (
        typeof server !== 'string' &&
        typeof secondary !== 'string' &&
        typeof ttl !== 'number'
      ) {
        throw new Error(
          `malformed RTM route response: ${JSON.stringify(info)}`
        );
      }
      this._cache.set('endpoints', info, info.ttl * 1000);
    }
    debug('endpoint info: %O', info);
    return [info.server, info.secondary];
  }

  static async _getServerUrls({ appId, server }) {
    debug('fetch server urls');
    if (server) {
      if (typeof server !== 'string') return server;
      return {
        RTMRouter: server,
        api: server,
      };
    }
    const cachedRouter = routerCache.get(appId);
    if (cachedRouter) return cachedRouter;
    const defaultProtocol = 'https://';
    return request({
      url: 'https://app-router.com/2/route',
      query: {
        appId,
      },
      timeout: 20000,
    })
      .then(tap(debug))
      .then(
        ({
          rtm_router_server: RTMRouterServer,
          api_server: APIServer,
          ttl = 3600,
        }) => {
          if (!RTMRouterServer) {
            throw new Error('rtm router not exists');
          }
          const serverUrls = {
            RTMRouter: `${defaultProtocol}${RTMRouterServer}`,
            api: `${defaultProtocol}${APIServer}`,
          };
          routerCache.set(appId, serverUrls, ttl * 1000);
          return serverUrls;
        }
      )
      .catch(() => {
        const id = appId.slice(0, 8).toLowerCase();
        const domain = 'lncldglobal.com';
        return {
          RTMRouter: `${defaultProtocol}${id}.rtm.${domain}`,
          api: `${defaultProtocol}${id}.api.${domain}`,
        };
      });
  }

  static _fetchRTMServers({ appId, ssl, server, RTMServerName }) {
    debug('fetch endpoint info');
    return this._getServerUrls({ appId, server })
      .then(tap(debug))
      .then(({ RTMRouter }) =>
        request({
          url: `${RTMRouter}/v1/route`,
          query: {
            appId,
            secure: ssl,
            features: isWeapp ? 'wechat' : undefined,
            server: RTMServerName,
            _t: Date.now(),
          },
          timeout: 20000,
        }).then(tap(debug))
      );
  }

  _close() {
    if (this._openPromise) {
      this._openPromise.then(connection => connection.close());
    }
    delete this._openPromise;
  }

  /**
   * 手动进行重连。
   * SDK 在网络出现异常时会自动按照一定的时间间隔尝试重连，调用该方法会立即尝试重连并重置重连尝试计数器。
   * 只能在 `SCHEDULE` 事件之后，`RETRY` 事件之前调用，如果当前网络正常或者正在进行重连，调用该方法会抛异常。
   */
  retry() {
    const { connection } = internal(this);
    if (!connection) {
      throw new Error('no connection established');
    }
    if (connection.cannot('retry')) {
      throw new Error(
        `retrying not allowed when not disconnected. the connection is now ${connection.current}`
      );
    }
    return connection.retry();
  }

  /**
   * 暂停，使 SDK 进入离线状态。
   * 你可以在网络断开、应用进入后台等时刻调用该方法让 SDK 进入离线状态，离线状态下不会尝试重连。
   * 在浏览器中 SDK 会自动监听网络变化，因此无需手动调用该方法。
   *
   * @since 3.4.0
   * @see Realtime#event:OFFLINE
   */
  pause() {
    // 这个方法常常在网络断开、进入后台时被调用，此时 connection 可能没有建立或者已经 close。
    // 因此不像 retry，这个方法应该尽可能 loose
    const { connection } = internal(this);
    if (!connection) return;
    if (connection.can('pause')) connection.pause();
  }

  /**
   * 恢复在线状态。
   * 你可以在网络恢复、应用回到前台等时刻调用该方法让 SDK 恢复在线状态，恢复在线状态后 SDK 会开始尝试重连。
   *
   * @since 3.4.0
   * @see Realtime#event:ONLINE
   */
  resume() {
    // 与 pause 一样，这个方法应该尽可能 loose
    const { connection } = internal(this);
    if (!connection) return;
    if (connection.can('resume')) connection.resume();
  }

  _registerPending(value) {
    internal(this).pendingClients.add(value);
  }

  _deregisterPending(client) {
    internal(this).pendingClients.delete(client);
  }

  _register(client) {
    internal(this).clients.add(client);
  }

  _deregister(client) {
    const _this = internal(this);
    _this.clients.delete(client);
    if (_this.clients.size + _this.pendingClients.size === 0) {
      this._close();
    }
  }

  _dispatchCommand(command) {
    return applyDispatcher(this._plugins.beforeCommandDispatch, [
      command,
      this,
    ]).then(shouldDispatch => {
      // no plugin handled this command
      if (shouldDispatch)
        return debug('[WARN] Unexpected message received: %O', trim(command));
      return false;
    });
  }
}

// For test purpose only
// SHOULD NOT be public
export class MultitonRealtime extends Realtime {
  constructor({ appId, ...rest }) {
    delete initializedApp[appId];
    super({
      appId,
      ...rest,
    });
  }
}
