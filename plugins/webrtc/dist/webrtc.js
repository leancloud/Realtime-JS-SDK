(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leancloud-realtime')) :
  typeof define === 'function' && define.amd ? define('webrtc', ['exports', 'leancloud-realtime'], factory) :
  (global = global || self, factory(global.AV = global.AV || {}, global.AV));
}(this, (function (exports, leancloudRealtime) { 'use strict';

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var inheritsLoose = _inheritsLoose;

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

  var eventemitter3 = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty
    , prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once)
      , evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
      , events
      , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event
      , handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event
      , listeners = this._events[evt];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
      , len = arguments.length
      , args
      , i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1: return listeners.fn.call(listeners.context), true;
        case 2: return listeners.fn.call(listeners.context, a1), true;
        case 3: return listeners.fn.call(listeners.context, a1, a2), true;
        case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
  });

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  var stateMachine = createCommonjsModule(function (module, exports) {
  /*

    Javascript State Machine Library - https://github.com/jakesgordon/javascript-state-machine

    Copyright (c) 2012, 2013, 2014, 2015, Jake Gordon and contributors
    Released under the MIT license - https://github.com/jakesgordon/javascript-state-machine/blob/master/LICENSE

  */

  (function () {

    var StateMachine = {

      //---------------------------------------------------------------------------

      VERSION: "2.4.0",

      //---------------------------------------------------------------------------

      Result: {
        SUCCEEDED:    1, // the event transitioned successfully from one state to another
        NOTRANSITION: 2, // the event was successfull but no state transition was necessary
        CANCELLED:    3, // the event was cancelled by the caller in a beforeEvent callback
        PENDING:      4  // the event is asynchronous and the caller is in control of when the transition occurs
      },

      Error: {
        INVALID_TRANSITION: 100, // caller tried to fire an event that was innapropriate in the current state
        PENDING_TRANSITION: 200, // caller tried to fire an event while an async transition was still pending
        INVALID_CALLBACK:   300 // caller provided callback function threw an exception
      },

      WILDCARD: '*',
      ASYNC: 'async',

      //---------------------------------------------------------------------------

      create: function(cfg, target) {

        var initial      = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
        var terminal     = cfg.terminal || cfg['final'];
        var fsm          = target || cfg.target  || {};
        var events       = cfg.events || [];
        var callbacks    = cfg.callbacks || {};
        var map          = {}; // track state transitions allowed for an event { event: { from: [ to ] } }
        var transitions  = {}; // track events allowed from a state            { state: [ event ] }

        var add = function(e) {
          var from = Array.isArray(e.from) ? e.from : (e.from ? [e.from] : [StateMachine.WILDCARD]); // allow 'wildcard' transition if 'from' is not specified
          map[e.name] = map[e.name] || {};
          for (var n = 0 ; n < from.length ; n++) {
            transitions[from[n]] = transitions[from[n]] || [];
            transitions[from[n]].push(e.name);

            map[e.name][from[n]] = e.to || from[n]; // allow no-op transition if 'to' is not specified
          }
          if (e.to)
            transitions[e.to] = transitions[e.to] || [];
        };

        if (initial) {
          initial.event = initial.event || 'startup';
          add({ name: initial.event, from: 'none', to: initial.state });
        }

        for(var n = 0 ; n < events.length ; n++)
          add(events[n]);

        for(var name in map) {
          if (map.hasOwnProperty(name))
            fsm[name] = StateMachine.buildEvent(name, map[name]);
        }

        for(var name in callbacks) {
          if (callbacks.hasOwnProperty(name))
            fsm[name] = callbacks[name];
        }

        fsm.current     = 'none';
        fsm.is          = function(state) { return Array.isArray(state) ? (state.indexOf(this.current) >= 0) : (this.current === state); };
        fsm.can         = function(event) { return !this.transition && (map[event] !== undefined) && (map[event].hasOwnProperty(this.current) || map[event].hasOwnProperty(StateMachine.WILDCARD)); };
        fsm.cannot      = function(event) { return !this.can(event); };
        fsm.transitions = function()      { return (transitions[this.current] || []).concat(transitions[StateMachine.WILDCARD] || []); };
        fsm.isFinished  = function()      { return this.is(terminal); };
        fsm.error       = cfg.error || function(name, from, to, args, error, msg, e) { throw e || msg; }; // default behavior when something unexpected happens is to throw an exception, but caller can override this behavior if desired (see github issue #3 and #17)
        fsm.states      = function() { return Object.keys(transitions).sort() };

        if (initial && !initial.defer)
          fsm[initial.event]();

        return fsm;

      },

      //===========================================================================

      doCallback: function(fsm, func, name, from, to, args) {
        if (func) {
          try {
            return func.apply(fsm, [name, from, to].concat(args));
          }
          catch(e) {
            return fsm.error(name, from, to, args, StateMachine.Error.INVALID_CALLBACK, "an exception occurred in a caller-provided callback function", e);
          }
        }
      },

      beforeAnyEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbeforeevent'],                       name, from, to, args); },
      afterAnyEvent:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafterevent'] || fsm['onevent'],      name, from, to, args); },
      leaveAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleavestate'],                        name, from, to, args); },
      enterAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenterstate'] || fsm['onstate'],      name, from, to, args); },
      changeState:     function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onchangestate'],                       name, from, to, args); },

      beforeThisEvent: function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbefore' + name],                     name, from, to, args); },
      afterThisEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafter'  + name] || fsm['on' + name], name, from, to, args); },
      leaveThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleave'  + from],                     name, from, to, args); },
      enterThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenter'  + to]   || fsm['on' + to],   name, from, to, args); },

      beforeEvent: function(fsm, name, from, to, args) {
        if ((false === StateMachine.beforeThisEvent(fsm, name, from, to, args)) ||
            (false === StateMachine.beforeAnyEvent( fsm, name, from, to, args)))
          return false;
      },

      afterEvent: function(fsm, name, from, to, args) {
        StateMachine.afterThisEvent(fsm, name, from, to, args);
        StateMachine.afterAnyEvent( fsm, name, from, to, args);
      },

      leaveState: function(fsm, name, from, to, args) {
        var specific = StateMachine.leaveThisState(fsm, name, from, to, args),
            general  = StateMachine.leaveAnyState( fsm, name, from, to, args);
        if ((false === specific) || (false === general))
          return false;
        else if ((StateMachine.ASYNC === specific) || (StateMachine.ASYNC === general))
          return StateMachine.ASYNC;
      },

      enterState: function(fsm, name, from, to, args) {
        StateMachine.enterThisState(fsm, name, from, to, args);
        StateMachine.enterAnyState( fsm, name, from, to, args);
      },

      //===========================================================================

      buildEvent: function(name, map) {
        return function() {

          var from  = this.current;
          var to    = map[from] || (map[StateMachine.WILDCARD] != StateMachine.WILDCARD ? map[StateMachine.WILDCARD] : from) || from;
          var args  = Array.prototype.slice.call(arguments); // turn arguments into pure array

          if (this.transition)
            return this.error(name, from, to, args, StateMachine.Error.PENDING_TRANSITION, "event " + name + " inappropriate because previous transition did not complete");

          if (this.cannot(name))
            return this.error(name, from, to, args, StateMachine.Error.INVALID_TRANSITION, "event " + name + " inappropriate in current state " + this.current);

          if (false === StateMachine.beforeEvent(this, name, from, to, args))
            return StateMachine.Result.CANCELLED;

          if (from === to) {
            StateMachine.afterEvent(this, name, from, to, args);
            return StateMachine.Result.NOTRANSITION;
          }

          // prepare a transition method for use EITHER lower down, or by caller if they want an async transition (indicated by an ASYNC return value from leaveState)
          var fsm = this;
          this.transition = function() {
            fsm.transition = null; // this method should only ever be called once
            fsm.current = to;
            StateMachine.enterState( fsm, name, from, to, args);
            StateMachine.changeState(fsm, name, from, to, args);
            StateMachine.afterEvent( fsm, name, from, to, args);
            return StateMachine.Result.SUCCEEDED;
          };
          this.transition.cancel = function() { // provide a way for caller to cancel async transition if desired (issue #22)
            fsm.transition = null;
            StateMachine.afterEvent(fsm, name, from, to, args);
          };

          var leave = StateMachine.leaveState(this, name, from, to, args);
          if (false === leave) {
            this.transition = null;
            return StateMachine.Result.CANCELLED;
          }
          else if (StateMachine.ASYNC === leave) {
            return StateMachine.Result.PENDING;
          }
          else {
            if (this.transition) // need to check in case user manually called transition() but forgot to return StateMachine.ASYNC
              return this.transition();
          }

        };
      }

    }; // StateMachine

    //===========================================================================

    //======
    // NODE
    //======
    {
      if ( module.exports) {
        exports = module.exports = StateMachine;
      }
      exports.StateMachine = StateMachine;
    }

  }());
  });
  var stateMachine_1 = stateMachine.StateMachine;

  var createCallStateMachine = (function () {
    return stateMachine.create({
      initial: 'calling',
      events: [{
        name: 'connect',
        from: 'calling',
        to: 'connected'
      }, {
        name: 'close',
        from: 'connected',
        to: 'closed'
      }, {
        name: 'cancel',
        from: 'calling',
        to: 'canceled'
      }, {
        name: 'refuse',
        from: 'calling',
        to: 'refused'
      }]
    });
  });

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

  // to prevent TypedMessage from being included in the bundler

  var Signaling = inherit$1(leancloudRealtime.TypedMessage, {
    __constructor: function __constructor(payload) {
      this.__base();

      this.payload = payload;
    }
  });
  Signaling.sendOptions = {
    "transient": true
  };
  leancloudRealtime.messageField('payload')(Signaling);

  var _dec, _class;
  var Answer = (_dec = leancloudRealtime.messageType(-102), _dec(_class = /*#__PURE__*/function (_Signaling) {
    inheritsLoose(Answer, _Signaling);

    function Answer() {
      return _Signaling.apply(this, arguments) || this;
    }

    return Answer;
  }(Signaling)) || _class);

  var _dec$1, _class$1;
  var ICECandidate = (_dec$1 = leancloudRealtime.messageType(-103), _dec$1(_class$1 = /*#__PURE__*/function (_Signaling) {
    inheritsLoose(ICECandidate, _Signaling);

    function ICECandidate() {
      return _Signaling.apply(this, arguments) || this;
    }

    return ICECandidate;
  }(Signaling)) || _class$1);

  var _dec$2, _class$2;
  var Refusal = (_dec$2 = leancloudRealtime.messageType(-104), _dec$2(_class$2 = /*#__PURE__*/function (_Signaling) {
    inheritsLoose(Refusal, _Signaling);

    function Refusal() {
      return _Signaling.apply(this, arguments) || this;
    }

    return Refusal;
  }(Signaling)) || _class$2);

  var _dec$3, _class$3;
  var Cancelation = (_dec$3 = leancloudRealtime.messageType(-105), _dec$3(_class$3 = /*#__PURE__*/function (_Signaling) {
    inheritsLoose(Cancelation, _Signaling);

    function Cancelation() {
      return _Signaling.apply(this, arguments) || this;
    }

    return Cancelation;
  }(Signaling)) || _class$3);

  var Call = /*#__PURE__*/function (_EventEmitter) {
    inheritsLoose(Call, _EventEmitter);

    /**
     * {@link IncomingCall} 与 {@link OutgoingCall} 的基类
     * @abstract
     */
    function Call(conversation, RTCConfiguration) {
      var _this;

      _this = _EventEmitter.call(this) || this;

      _this._setConversation(conversation);

      _this._peerConnection = _this._createPeerConnection(RTCConfiguration);
      _this._call = createCallStateMachine();
      _this._promises = {};
      var streamReady = new Promise(function (resolve) {
        _this._promises.resolveStreamReady = resolve;
      });
      var accept = new Promise(function (resolve) {
        _this._promises.resolveAccept = resolve;
      });
      Promise.all([streamReady, accept]).then(function (_ref) {
        var _ref2 = slicedToArray(_ref, 1),
            stream = _ref2[0];

        if (_this._call.can('connect')) {
          _this._call.connect();
          /**
           * 通话连接成功
           * @event Call#connect
           * @param {MediaStream} stram 对方的媒体流
           */


          _this.emit('connect', stream);
        }
      });
      return _this;
    }
    /**
     * 当前通话状态
     * （<code>calling</code>, <code>connected</code>, <code>closed</code>,
     * <code>refused</code>, <code>canceled</code>）
     * @type {string}
     * @readonly
     */


    var _proto = Call.prototype;

    /**
     * 结束通话
     * @return {Promise}
     */
    _proto.close = function close() {
      var _this2 = this;

      return Promise.resolve().then(function () {
        _this2._call.close();

        _this2._destroyPeerConnection();

        _this2._peerConnection.close();

        _this2._destroy();
      });
    };

    _proto._handleCloseEvent = function _handleCloseEvent() {
      if (this._call.can('close')) {
        this.close();
        /**
         * 通话结束，可能是对方挂断或网络中断
         * @event Call#close
         */

        this.emit('close');
      }
    };

    _proto._setConversation = function _setConversation(conversation) {
      if (this._conversation) {
        this._conversation.off('message');
      }

      if (conversation) {
        this._conversation = conversation;
        conversation.on('message', this._handleMessage.bind(this));
      }
    };

    _proto._destroy = function _destroy() {
      this._conversation.off('message');
    };

    _proto._createPeerConnection = function _createPeerConnection(RTCConfiguration) {
      var connection = new RTCPeerConnection(RTCConfiguration);
      connection.onicecandidate = this._handleICECandidateEvent.bind(this);
      connection.onaddstream = this._handleAddStreamEvent.bind(this);
      connection.onnremovestream = this._handleRemoveStreamEvent.bind(this);
      connection.oniceconnectionstatechange = this._handleICEConnectionStateChangeEvent.bind(this);
      connection.onsignalingstatechange = this._handleSignalingStateChangeEvent.bind(this);
      return connection;
    };

    _proto._destroyPeerConnection = function _destroyPeerConnection() {
      var connection = this._peerConnection;
      delete connection.onaddstream;
      delete connection.onremovestream;
      delete connection.onnicecandidate;
      delete connection.oniceconnectionstatechange;
      delete connection.onsignalingstatechange;
    };

    _proto._handleMessage = function _handleMessage(message) {
      if (message instanceof Answer) {
        return this._handleAnswer(message);
      }

      if (message instanceof Refusal) {
        return this._handleRefusal();
      }

      if (message instanceof Cancelation) {
        return this._handleCancelation();
      }

      if (message instanceof ICECandidate) {
        return this._handleICECandidate(message);
      }

      return false;
    };

    _proto._handleICECandidate = function _handleICECandidate(message) {
      var candidate = new RTCIceCandidate(message.payload);

      if (this._peerConnection) {
        this._peerConnection.addIceCandidate(candidate)["catch"](console.error.bind(console));
      }
    };

    _proto._handleICECandidateEvent = function _handleICECandidateEvent(event) {
      if (event.candidate && this._conversation) {
        return this._conversation.send(new ICECandidate(event.candidate))["catch"](console.error.bind(console));
      }

      return false;
    };

    _proto._handleAddStreamEvent = function _handleAddStreamEvent(event) {
      this._promises.resolveStreamReady(event.stream);
    };

    _proto._handleRemoveStreamEvent = function _handleRemoveStreamEvent() {
      this._handleCloseEvent();
    };

    _proto._handleICEConnectionStateChangeEvent = function _handleICEConnectionStateChangeEvent() {
      switch (this._peerConnection.iceConnectionState) {
        case 'closed':
        case 'failed':
        case 'disconnected':
          this._handleCloseEvent();

          break;
      }
    };

    _proto._handleSignalingStateChangeEvent = function _handleSignalingStateChangeEvent() {
      switch (this._peerConnection.signalingState) {
        case 'closed':
          this._handleCloseEvent();

          break;
      }
    }
    /* eslint-disable class-methods-use-this */
    ;

    _proto._handleAnswer = function _handleAnswer() {
      throw new Error('not implemented');
    };

    _proto._handleRefusal = function _handleRefusal() {
      throw new Error('not implemented');
    };

    _proto._handleCancelation = function _handleCancelation() {
      throw new Error('not implemented');
    }
    /* eslint-enable class-methods-use-this */
    ;

    createClass(Call, [{
      key: "state",
      get: function get() {
        return this._call.current;
      }
    }]);

    return Call;
  }(eventemitter3);

  var OutgoingCall = /*#__PURE__*/function (_Call) {
    inheritsLoose(OutgoingCall, _Call);

    /**
     * 呼出的通话
     * @extends Call
     */
    function OutgoingCall(to, conversation, RTCConfiguration) {
      var _this;

      _this = _Call.call(this, conversation, RTCConfiguration) || this;
      /**
       * 呼叫目标 id
       * @type {string}
       */

      _this.to = to;
      return _this;
    }

    var _proto = OutgoingCall.prototype;

    _proto._handleAnswer = function _handleAnswer(answer) {
      var desc = new RTCSessionDescription(answer.payload);

      this._peerConnection.setRemoteDescription(desc);

      this._promises.resolveAccept();
    };

    _proto._handleRefusal = function _handleRefusal() {
      this._destroyPeerConnection();

      this._call.refuse();
      /**
       * 呼叫被对方拒绝
       * @event OutgoingCall#refuse
       */


      this.emit('refuse');

      this._destroy();
    }
    /**
     * 取消该次呼叫
     * @return {Promise}
     */
    ;

    _proto.cancel = function cancel() {
      var _this2 = this;

      this._call.cancel();

      return this._conversation.send(new Cancelation()).then(function () {
        return _this2._destroy();
      });
    }
    /**
     * 结束通话，如果在 <code>calling</code> 状态，则取消该次呼叫
     * @return {Promise}
     */
    ;

    _proto.close = function close() {
      if (this._call.can('cancel')) {
        return this.cancel();
      }

      return _Call.prototype.close.call(this);
    };

    return OutgoingCall;
  }(Call);

  var IncomingCall = /*#__PURE__*/function (_Call) {
    inheritsLoose(IncomingCall, _Call);

    /**
     * 呼入的通话
     * @extends Call
     */
    function IncomingCall(offer, conversation, RTCConfiguration) {
      var _this;

      _this = _Call.call(this, conversation, RTCConfiguration) || this;
      /**
       * 呼叫者 id
       * @type {string}
       */

      _this.from = offer.from;
      var desc = new RTCSessionDescription(offer.payload);
      _this._handleOfferPromise = _this._peerConnection.setRemoteDescription(desc);
      return _this;
    }
    /**
     * 接受该呼入通话
     * @param  {MediaStream} stream 本地流媒体，参见 {@link https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API MediaStream}
     * @return {Promise}
     */


    var _proto = IncomingCall.prototype;

    _proto.accept = function accept(stream) {
      var _this2 = this;

      if (!stream) {
        throw new TypeError('a MediaStream instance is required to accept a call');
      }

      return this._handleOfferPromise.then(function () {
        return _this2._peerConnection.addStream(stream);
      }).then(function () {
        return _this2._peerConnection.createAnswer();
      }).then(function (answer) {
        return _this2._peerConnection.setLocalDescription(answer);
      }).then(function () {
        return _this2._conversation.send(new Answer(_this2._peerConnection.localDescription));
      }).then(function () {
        return _this2._promises.resolveAccept();
      });
    }
    /**
     * 拒绝该呼入通话
     * @return {Promise}
     */
    ;

    _proto.refuse = function refuse() {
      var _this3 = this;

      return this._conversation.send(new Refusal()).then(function () {
        _this3._call.refuse();

        _this3._destroy();
      });
    };

    _proto._handleCancelation = function _handleCancelation() {
      this._call.cancel();
      /**
       * 呼叫被对方取消
       * @event IncomingCall#cancel
       */


      this.emit('cancel');

      this._destroy();
    };

    return IncomingCall;
  }(Call);

  var _dec$4, _class$4;
  var Offer = (_dec$4 = leancloudRealtime.messageType(-101), _dec$4(_class$4 = /*#__PURE__*/function (_Signaling) {
    inheritsLoose(Offer, _Signaling);

    function Offer() {
      return _Signaling.apply(this, arguments) || this;
    }

    return Offer;
  }(Signaling)) || _class$4);

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  var DEFAULT_RTCCONF = {
    iceServers: [{
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:stun4.l.google.com:19302', 'stun:stun.ekiga.net', 'stun:stun.ideasip.com', 'stun:stun.rixtelecom.se', 'stun:stun.schlund.de', 'stun:stun.stunprotocol.org:3478', 'stun:stun.voiparound.com', 'stun:stun.voipbuster.com', 'stun:stun.voipstunt.com', 'stun:stun.voxgratia.org']
    }]
  };

  var WebRTCClient = /*#__PURE__*/function (_EventEmitter) {
    inheritsLoose(WebRTCClient, _EventEmitter);

    /**
     * 无法直接实例化，请使用 {@link createWebRTCClient Realtime#createWebRTCClient} 创建新的 WebRTCClient
     */
    function WebRTCClient(id, options) {
      var _this;

      if (typeof id !== 'string') {
        throw new TypeError('id is not a string');
      }

      _this = _EventEmitter.call(this) || this;
      /** @type {string} */

      _this.id = id;
      _this.options = _objectSpread({
        RTCConfiguration: DEFAULT_RTCCONF
      }, options);
      return _this;
    }

    var _proto = WebRTCClient.prototype;

    _proto._open = function _open(realtime, clientOptions) {
      var _this2 = this;

      return realtime.createIMClient(this.id, clientOptions, 'webrtc').then(function (imClient) {
        _this2._imClient = imClient;
        _this2.id = imClient.id;
        imClient.on('message', function (message, conversation) {
          if (message instanceof Offer) {
            return _this2._handleOffer(message, conversation);
          }

          return false;
        });
        /**
         * 用户在其他客户端登录，当前客户端被服务端强行下线。详见文档「单点登录」章节。
         * @event WebRTCClient#conflict
         */

        imClient.on('conflict', function () {
          for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return _this2.emit.apply(_this2, ['conflict'].concat(payload));
        });
        return _this2;
      });
    }
    /**
     * 关闭客户端
     * @return {Promise}
     */
    ;

    _proto.close = function close() {
      return this._imClient.close();
    }
    /**
     * 呼叫另一个用户
     * @param  {string} targetId 用户 ID
     * @param  {MediaStream} stream 本地流媒体，参见 {@link https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API MediaStream}
     * @return {Promise.<OutgoingCall>} 呼出通话
     */
    ;

    _proto.call = function call(targetId, stream) {
      var _this3 = this;

      if (typeof targetId !== 'string') {
        throw new TypeError('target id is not a string');
      }

      if (!stream) {
        throw new TypeError('a MediaStream instance is required to make a call');
      }

      return this._imClient.ping([targetId]).then(function (onlineClients) {
        if (!onlineClients.length) {
          throw new Error("Call failed as ".concat(targetId, " is not online"));
        }

        var outgoingCall = new OutgoingCall(targetId, null, _this3.options.RTCConfiguration);
        var promise = new Promise(function (resolve) {
          outgoingCall._peerConnection.onnegotiationneeded = resolve;
        });

        outgoingCall._peerConnection.addStream(stream);

        return promise.then(function () {
          return Promise.all([_this3._imClient.createConversation({
            members: [targetId],
            unique: true
          }), outgoingCall._peerConnection.createOffer().then(function (localDescription) {
            outgoingCall._peerConnection.setLocalDescription(localDescription);
          })]);
        }).then(function (_ref) {
          var _ref2 = slicedToArray(_ref, 1),
              conversation = _ref2[0];

          outgoingCall._setConversation(conversation);

          return conversation.send(new Offer(outgoingCall._peerConnection.localDescription));
        }).then(function () {
          return outgoingCall;
        });
      });
    };

    _proto._handleOffer = function _handleOffer(offer, conversation) {
      var incomingCall = new IncomingCall(offer, conversation, this.options.RTCConfiguration);
      /**
       * 收到其他用户的呼叫
       * @event WebRTCClient#call
       * @param {incomingCall} incomingCall 呼入通话
       */

      this.emit('call', incomingCall);
    };

    return WebRTCClient;
  }(eventemitter3);

  var name = "leancloud-realtime-plugin-webrtc";

  /* eslint-disable import/prefer-default-export */
  var messageClasses = [Offer, Answer, ICECandidate, Refusal, Cancelation];

  var onRealtimeCreate = function onRealtimeCreate(realtime) {
    /**
     * 创建一个 WebRTC 客户端，多次创建相同 id 的客户端会返回同一个实例。应用 WebRTC 插件后，Realtime 类会增加该实例方法。
     * WebRTC 客户端是单点登录的，既在同一时刻，同一个 id 只允许一个客户端在线，后登录的客户端会将原来在线上的客户端踢下线。
     * @function createWebRTCClient
     * @global
     * @param  {String} id 客户端 id
     * @param  {Object} [clientOptions] 详细参数 @see {@link IMClient}
     * @param  {Object} [clientOptions.RTCConfiguration] @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration RTCConfiguration}
     * @return {Promise.<WebRTCClient>}
     */
    // eslint-disable-next-line no-param-reassign
    realtime.createWebRTCClient = function (id, clientOptions) {
      return new WebRTCClient(id)._open(realtime, clientOptions);
    };
  };
  /**
   * WebRTC 插件，使用后可通过 {@link createWebRTCClient Realtime#createWebRTCClient}
   * 创建 {@link WebRTCClient} 实现音视频通话
   * @example
   * var realtime = new Realtime({
   *   appId: appId,
   *   appKey: appKey,
   *   server: server,
   *   plugins: WebRTCPlugin,
   * });
   * realtime.createWebRTCClient(id);
   */


  var WebRTCPlugin = {
    name: name,
    messageClasses: messageClasses,
    onRealtimeCreate: onRealtimeCreate
  };
  /**
   * 当前浏览器是否支持 WebRTC 的标记
   * @type {Boolean}
   */

  var isWebRTCSupported = !!(window.RTCPeerConnection && window.RTCSessionDescription && window.RTCIceCandidate);

  exports.WebRTCPlugin = WebRTCPlugin;
  exports.isWebRTCSupported = isWebRTCSupported;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=webrtc.js.map
