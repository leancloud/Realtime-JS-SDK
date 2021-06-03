(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leancloud-storage'), require('leancloud-realtime')) :
  typeof define === 'function' && define.amd ? define('typed-messages', ['exports', 'leancloud-storage', 'leancloud-realtime'], factory) :
  (global = global || self, factory(global.AV = global.AV || {}, global.AV, global.AV));
}(this, (function (exports, leancloudStorage, leancloudRealtime) { 'use strict';

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var inheritsLoose = _inheritsLoose;

  /* eslint-disable import/no-unresolved */

  if (!leancloudStorage.File) {
    throw new Error('LeanCloud Storage SDK not installed');
  }

  /* eslint-disable import/no-unresolved */

  if (!leancloudRealtime.TypedMessage) {
    throw new Error('LeanCloud Realtime SDK not installed');
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  var FileMessage = /*#__PURE__*/function (_TypedMessage) {
    inheritsLoose(FileMessage, _TypedMessage);

    /**
     * @extends TypedMessage
     * @param  {AV.File} file LeanCloud 存储 SDK 中的 AV.File 实例，且必须是已经保存到服务端上的 File 实例
     * （如果是刚刚创建的，必须 save 后才能用于创建 FileMessage）
     */
    function FileMessage(file) {
      var _this;

      if (!(file instanceof leancloudStorage.File)) {
        throw new TypeError('file must be an AV.File');
      }

      if (typeof file.id !== 'string') {
        throw new Error('file must be saved before used to create a Message');
      }

      _this = _TypedMessage.call(this) || this;
      _this._file = file;
      _this._lcfile = {
        objId: file.id,
        url: file.url(),
        metaData: Object.assign(file.metaData() || {}, {
          name: file.name()
        })
      };
      return _this;
    }
    /**
     * 在客户端需要以文本形式展示该消息时显示的文案，格式为 <code>[类型] file.name()</code>
     * @type {String}
     * @readonly
     */


    var _proto = FileMessage.prototype;

    /**
     * 获得 file 对象
     * @return {AV.File}
     */
    _proto.getFile = function getFile() {
      return this._file;
    };

    _proto.toJSON = function toJSON() {
      return _objectSpread(_objectSpread({}, _TypedMessage.prototype.toJSON.call(this)), {}, {
        file: this.getFile().toJSON()
      });
    };

    FileMessage._parseFileFromRawData = function _parseFileFromRawData(data) {
      if (!(data && data._lcfile)) {
        throw new Error('malformed FileMessage content');
      }

      var id = data._lcfile.objId;

      if (typeof id !== 'string') {
        id = '';
      }

      var file = leancloudStorage.File.createWithoutData(id);
      file.attributes = file.attributes || {};
      file._url = data._lcfile.url;
      file.attributes.url = file._url;
      file._metaData = data._lcfile.metaData || {};
      file.attributes.metaData = file._metaData;

      if (data._lcfile.metaData) {
        file._name = data._lcfile.metaData.name;
        file.attributes.name = file._name;
      }

      return file;
    };

    FileMessage.parse = function parse(json, message) {
      var file = this._parseFileFromRawData(json);

      return leancloudRealtime.TypedMessage.parse(json, message || new this(file));
    };

    createClass(FileMessage, [{
      key: "summary",
      get: function get() {
        return "[".concat(this.constructor._summaryType, "] ").concat(this._file.name() || '').trim();
      }
    }]);

    return FileMessage;
  }(leancloudRealtime.TypedMessage);
  FileMessage._summaryType = '文件';
  /**
   * @name TYPE
   * @memberof FileMessage
   * @type Number
   * @static
   * @const
   */

  leancloudRealtime.messageType(-6)(FileMessage);
  leancloudRealtime.messageField('_lcfile')(FileMessage);
  leancloudRealtime.IE10Compatible(FileMessage);

  /**
   * 构造方法参数同 {@link FileMessage}
   *
   * @extends FileMessage
   */

  var ImageMessage = /*#__PURE__*/function (_FileMessage) {
    inheritsLoose(ImageMessage, _FileMessage);

    function ImageMessage() {
      return _FileMessage.apply(this, arguments) || this;
    }

    return ImageMessage;
  }(FileMessage);

  ImageMessage._summaryType = '图片';
  /**
   * @name TYPE
   * @memberof ImageMessage
   * @type Number
   * @static
   * @const
   */

  leancloudRealtime.messageType(-2)(ImageMessage);
  leancloudRealtime.IE10Compatible(ImageMessage);

  /**
   * 构造方法参数同 {@link FileMessage}
   *
   * @extends FileMessage
   */

  var AudioMessage = /*#__PURE__*/function (_FileMessage) {
    inheritsLoose(AudioMessage, _FileMessage);

    function AudioMessage() {
      return _FileMessage.apply(this, arguments) || this;
    }

    return AudioMessage;
  }(FileMessage);

  AudioMessage._summaryType = '语音';
  /**
   * @name TYPE
   * @memberof AudioMessage
   * @type Number
   * @static
   * @const
   */

  leancloudRealtime.messageType(-3)(AudioMessage);
  leancloudRealtime.IE10Compatible(AudioMessage);

  /**
   * 构造方法参数同 {@link FileMessage}
   *
   * @extends FileMessage
   */

  var VideoMessage = /*#__PURE__*/function (_FileMessage) {
    inheritsLoose(VideoMessage, _FileMessage);

    function VideoMessage() {
      return _FileMessage.apply(this, arguments) || this;
    }

    return VideoMessage;
  }(FileMessage);

  VideoMessage._summaryType = '视频';
  /**
   * @name TYPE
   * @memberof VideoMessage
   * @type Number
   * @static
   * @const
   */

  leancloudRealtime.messageType(-4)(VideoMessage);
  leancloudRealtime.IE10Compatible(VideoMessage);

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  var LocationMessage = /*#__PURE__*/function (_TypedMessage) {
    inheritsLoose(LocationMessage, _TypedMessage);

    /**
     * @extends TypedMessage
     * @param  {AV.GeoPoint} geoPoint LeanCloud 存储 SDK 中的 AV.GeoPoint 实例
     */
    function LocationMessage(geoPoint) {
      var _this;

      if (!(geoPoint instanceof leancloudStorage.GeoPoint)) {
        throw new TypeError('geoPoint must be an AV.GeoPoint');
      }

      _this = _TypedMessage.call(this) || this;
      _this._geoPoint = geoPoint;
      var latitude = geoPoint.latitude,
          longitude = geoPoint.longitude;
      _this._lcloc = {
        latitude: latitude,
        longitude: longitude
      };
      return _this;
    }
    /**
     * 在客户端需要以文本形式展示该消息时显示的文案，格式为 <code>[位置] message.text</code>
     * @type {String}
     * @readonly
     */


    var _proto = LocationMessage.prototype;

    /**
     * 获得 geoPoint 对象
     * @return {AV.GeoPoint}
     */
    _proto.getLocation = function getLocation() {
      return this._geoPoint;
    };

    _proto.toJSON = function toJSON() {
      return _objectSpread$1(_objectSpread$1({}, _TypedMessage.prototype.toJSON.call(this)), {}, {
        location: this.getLocation().toJSON()
      });
    };

    LocationMessage.parse = function parse(json, message) {
      var _json$_lcloc = json._lcloc,
          latitude = _json$_lcloc.latitude,
          longitude = _json$_lcloc.longitude;
      var geoPoint = new leancloudStorage.GeoPoint({
        latitude: latitude,
        longitude: longitude
      });
      return leancloudRealtime.TypedMessage.parse(json, message || new this(geoPoint));
    };

    createClass(LocationMessage, [{
      key: "summary",
      get: function get() {
        return "[\u4F4D\u7F6E] ".concat(this.text || '').trim();
      }
    }]);

    return LocationMessage;
  }(leancloudRealtime.TypedMessage);
  leancloudRealtime.messageType(-5)(LocationMessage);
  leancloudRealtime.messageField('_lcloc')(LocationMessage);
  leancloudRealtime.IE10Compatible(LocationMessage);

  var name = "leancloud-realtime-plugin-typed-messages";

  /** @module leancloud-realtime-plugin-typed-messages */
  /**
   * TypedMessages 插件，使用后可支持接收 LeanCloud 提供的富媒体类型的消息
   * @example
   * var realtime = new Realtime({
   *   appId: appId,
   *   appKey: appKey,
   *   server: server,
   *   plugins: TypedMessagesPlugin,
   * });
   */

  var TypedMessagesPlugin = {
    name: name,
    messageClasses: [FileMessage, ImageMessage, AudioMessage, VideoMessage, LocationMessage]
  };

  exports.AudioMessage = AudioMessage;
  exports.FileMessage = FileMessage;
  exports.ImageMessage = ImageMessage;
  exports.LocationMessage = LocationMessage;
  exports.TypedMessagesPlugin = TypedMessagesPlugin;
  exports.VideoMessage = VideoMessage;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=typed-messages.js.map
