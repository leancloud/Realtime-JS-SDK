(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leancloud-realtime')) :
  typeof define === 'function' && define.amd ? define('groupchat-receipts', ['exports', 'leancloud-realtime'], factory) :
  (global = global || self, factory(global.AV = global.AV || {}, global.AV));
}(this, (function (exports, leancloudRealtime) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
      }
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var inherit = createCommonjsModule(function (module, exports) {
  /**
   * @module inherit
   * @version 2.2.7
   * @author Filatov Dmitry <dfilatov@yandex-team.ru>
   * @description This module provides some syntax sugar for "class" declarations, constructors, mixins, "super" calls and static members.
   */

  (function(global) {

  var noop = function() {},
      hasOwnProperty = Object.prototype.hasOwnProperty,
      objCreate = Object.create || function(ptp) {
          var inheritance = function() {};
          inheritance.prototype = ptp;
          return new inheritance();
      },
      objKeys = Object.keys || function(obj) {
          var res = [];
          for(var i in obj) {
              hasOwnProperty.call(obj, i) && res.push(i);
          }
          return res;
      },
      extend = function(o1, o2) {
          for(var i in o2) {
              hasOwnProperty.call(o2, i) && (o1[i] = o2[i]);
          }

          return o1;
      },
      extendStatic = Object.setPrototypeOf || extend,
      toStr = Object.prototype.toString,
      isArray = Array.isArray || function(obj) {
          return toStr.call(obj) === '[object Array]';
      },
      isFunction = function(obj) {
          return toStr.call(obj) === '[object Function]';
      },
      needCheckProps = true,
      testPropObj = { toString : '' };

  for(var i in testPropObj) { // It's a pity ie hasn't toString, valueOf in for
      testPropObj.hasOwnProperty(i) && (needCheckProps = false);
  }

  var specProps = needCheckProps? ['toString', 'valueOf'] : null;

  function getPropList(obj) {
      var res = objKeys(obj);
      if(needCheckProps) {
          var specProp, i = 0;
          while(specProp = specProps[i++]) {
              obj.hasOwnProperty(specProp) && res.push(specProp);
          }
      }

      return res;
  }

  function override(base, res, add) {
      var addList = getPropList(add),
          j = 0, len = addList.length,
          name, prop;
      while(j < len) {
          if((name = addList[j++]) === '__self') {
              continue;
          }
          prop = add[name];
          if(isFunction(prop) &&
                  (!prop.prototype || !prop.prototype.__self) && // check to prevent wrapping of "class" functions
                  (prop.toString().indexOf('.__base') > -1)) {
              res[name] = (function(name, prop) {
                  var baseMethod = base[name]?
                          base[name] :
                          name === '__constructor'? // case of inheritance from plain function
                              res.__self.__parent :
                              noop,
                      result = function() {
                          var baseSaved = this.__base;

                          this.__base = result.__base;
                          var res = prop.apply(this, arguments);
                          this.__base = baseSaved;

                          return res;
                      };
                  result.__base = baseMethod;

                  return result;
              })(name, prop);
          } else {
              res[name] = prop;
          }
      }
  }

  function applyMixins(mixins, res) {
      var i = 1, mixin;
      while(mixin = mixins[i++]) {
          res?
              isFunction(mixin)?
                  inherit.self(res, mixin.prototype, mixin) :
                  inherit.self(res, mixin) :
              res = isFunction(mixin)?
                  inherit(mixins[0], mixin.prototype, mixin) :
                  inherit(mixins[0], mixin);
      }
      return res || mixins[0];
  }

  /**
  * Creates class
  * @exports
  * @param {Function|Array} [baseClass|baseClassAndMixins] class (or class and mixins) to inherit from
  * @param {Object} prototypeFields
  * @param {Object} [staticFields]
  * @returns {Function} class
  */
  function inherit() {
      var args = arguments,
          withMixins = isArray(args[0]),
          hasBase = withMixins || isFunction(args[0]),
          base = hasBase? withMixins? applyMixins(args[0]) : args[0] : noop,
          props = args[hasBase? 1 : 0] || {},
          staticProps = args[hasBase? 2 : 1],
          res = props.__constructor || (hasBase && base.prototype && base.prototype.__constructor)?
              function() {
                  return this.__constructor.apply(this, arguments);
              } :
              hasBase?
                  function() {
                      return base.apply(this, arguments);
                  } :
                  function() {};

      if(!hasBase) {
          res.prototype = props;
          res.prototype.__self = res.prototype.constructor = res;
          return extend(res, staticProps);
      }

      extendStatic(res, base);

      res.__parent = base;

      var basePtp = base.prototype,
          resPtp = res.prototype = objCreate(basePtp);

      resPtp.__self = resPtp.constructor = res;

      props && override(basePtp, resPtp, props);
      staticProps && override(base, res, staticProps);

      return res;
  }

  inherit.self = function() {
      var args = arguments,
          withMixins = isArray(args[0]),
          base = withMixins? applyMixins(args[0], args[0][0]) : args[0],
          props = args[1],
          staticProps = args[2],
          basePtp = base.prototype;

      props && override(basePtp, basePtp, props);
      staticProps && override(base, base, staticProps);

      return base;
  };

  var defineAsGlobal = true;
  /* istanbul ignore next */
  {
      module.exports = inherit;
      defineAsGlobal = false;
  }
  /* istanbul ignore next */
  if(typeof modules === 'object' && typeof modules.define === 'function') {
      modules.define('inherit', function(provide) {
          provide(inherit);
      });
      defineAsGlobal = false;
  }
  /* istanbul ignore next */
  defineAsGlobal && (global.inherit = inherit);

  })(commonjsGlobal);
  });

  /*!
   * node-inherit
   * Copyright(c) 2011 Dmitry Filatov <dfilatov@yandex-team.ru>
   * MIT Licensed
   */

  var inherit$1 = inherit;

  /* eslint-disable import/no-unresolved */

  if (!leancloudRealtime.TypedMessage) {
    throw new Error('LeanCloud Realtime SDK not installed');
  }

  var ReadReceipt = inherit$1(leancloudRealtime.TypedMessage, {
    __constructor: function __constructor(timestamp) {
      this.__base();

      this.timestamp = new Date(timestamp);
    }
  });
  leancloudRealtime.messageType(-101)(ReadReceipt);
  leancloudRealtime.messageField(['timestamp'])(ReadReceipt);
  ReadReceipt.sendOptions = {
    "transient": true
  };

  var name = "leancloud-realtime-plugin-groupchat-receipts";

  /**
   * @typedef {Object.<String, Date>} GroupchatLastReadTimestamps 对话成员 ID - 最后已读消息时间
   */

  /**
   * 群聊已读状态插件。
   * 使用后多人 Conversation 会增加 lastReadTimestamps 属性，该属性是 对话成员 ID - 最后已读消息时间 的键值对。
   * 在首次查询该会话的消息记录后，lastReadTimestamps 将会得到初始值，
   * 之后在该属性有变化时 Conversation 会派发 lastreadtimestampsupdate 事件。
   * @example
   * var realtime = new Realtime({
   *   appId: appId,
   *   appKey: appKey,
   *   server: server,
   *   plugins: [GroupchatReceiptsPlugin],
   * });
   */

  var GroupchatReceiptsPlugin = {
    name: name,
    messageClasses: [ReadReceipt],
    onIMClientCreate: function onIMClientCreate(client) {
      var originalSendReadCommand = client._sendReadCommand; // eslint-disable-next-line no-param-reassign

      client._sendReadCommand = function (conversations) {
        conversations.forEach(function (conversation) {
          if (!conversation["transient"] && conversation.members.length > 2) {
            conversation.send(new ReadReceipt(conversation.lastMessageAt || new Date()))["catch"](function (error) {
              return console.warn("Sending groupchat receipt fail: ".concat(error.message));
            });
          }
        });

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return originalSendReadCommand.call.apply(originalSendReadCommand, [client, conversations].concat(args));
      };
    },
    onConversationCreate: function onConversationCreate(conversation) {
      var originalQueryMessages = conversation.queryMessages; // eslint-disable-next-line no-param-reassign

      conversation.queryMessages = function () {
        if (!conversation["transient"] && conversation.members.length > 2 && !conversation.lastReadTimestamps) {
          conversation._fetchAllReceiptTimestamps().then(function (maxReadTuple) {
            // eslint-disable-next-line no-param-reassign
            conversation.lastReadTimestamps = maxReadTuple.reduce(function (result, _ref) {
              var pid = _ref.pid,
                  lastReadAt = _ref.lastReadAt;
              return Object.assign(result, defineProperty({}, pid, lastReadAt));
            }, {});
            conversation.emit('lastreadtimestampsupdate', conversation.lastReadTimestamps);
          })["catch"](function (error) {
            return console.warn("Initialize group receipts fail: ".concat(error.message));
          });
        }

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return originalQueryMessages.call.apply(originalQueryMessages, [conversation].concat(args));
      };
    },
    beforeMessageDispatch: function beforeMessageDispatch(message, conversation) {
      if (message.type === ReadReceipt.TYPE) {
        if (conversation.lastReadTimestamps) {
          // eslint-disable-next-line no-param-reassign
          conversation.lastReadTimestamps[message.from] = message.timestamp;
          /**
           * 群聊的已读状态更新，由 Conversation 派发
           * @event lastreadtimestampsupdate
           * @param {GroupchatLastReadTimestamps} updatedTimestamps 有更新的成员的最后已读消息时间
           */

          conversation.emit('lastreadtimestampsupdate', defineProperty({}, message.from, message.timestamp));
        }

        return false;
      }

      return true;
    }
  };

  exports.GroupchatReceiptsPlugin = GroupchatReceiptsPlugin;
  exports.ReadReceipt = ReadReceipt;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=groupchat-receipts.js.map
