'use strict';

var APP_ID = 'nOmzEDu7NtMDBXUJJhIw9bNs-gzGzoHsz';
var APP_KEY = 'eRTm5hmmJ1Ki1dH9CA4qf3zL';
var realtime = new AV.Realtime({
  appId: APP_ID,
  appKey: APP_KEY,
  server: 'https://nomzedu7.api.lncld.net',
  plugins: AV.WebRTCPlugin,
});

var mediaConstraints = {
  audio: true,
  video: true,
};

var callParam = document.URL.match(/[\?&]call=([^&]*)/);
var autoCall;
if (callParam && callParam.length) {
  autoCall = callParam[1];
}
var idParam = document.URL.match(/[\?&]id=([^&]*)/);
var autoId;
if (idParam && idParam.length) {
  autoId = idParam[1];
}

var vm = new Vue({
  el: '#app',
  data: {
    supported: AV.isWebRTCSupported,
    client: null,
    state: 0,
    id: autoId || '',
    autoCall: autoCall,
    targetId: autoCall || '',
    incomingCall: null,
    currentCall: null,
    localVideoEnabled: true,
    localAudioEnabled: true,
    remoteAudioEnabled: true,
  },
  computed: {
    callLink: function callLink() {
      return document.URL.replace(/\?[\s\S]*/, '') + '?call=' + this.client.id;
    },
  },
  created: function created() {
    if (autoId) {
      this.login();
    }
  },
  methods: {
    login: function login() {
      var _this = this;
      _this.state = 'loggingin';
      return realtime
        .createWebRTCClient(this.id)
        .then(function(client) {
          _this.client = client;
          client.on('call', function(call) {
            _this.incomingCall = call;
            call.on('cancel', function() {
              _this.incomingCall = null;
            });
          });
          client.on('conflict', function() {
            alert(client.id + ' logged in another device');
          });
          _this.state = 'ready';
          if (autoCall) {
            _this.call();
            autoCall = false;
          }
        })
        .catch(console.error.bind(console));
    },
    logout: function logout() {
      var _this = this;
      this.hangup();
      return this.client.close().then(function() {
        _this._statue = 0;
        _this.client = null;
      });
    },
    getLocalStream: function getLocalStream() {
      var _this = this;

      if (!this.localStream) {
        this.localStream = navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
        this.localStream.then(function(localStream) {
          document.getElementById('local_video').srcObject = localStream;
          _this.localAudio = localStream.getAudioTracks()[0];
          _this.localVideo = localStream.getVideoTracks()[0];
        });
      }
      return this.localStream;
    },
    call: function call() {
      var _this = this;
      this.state = 'calling';
      return new Promise(function(resolve) {
        setTimeout(resolve, 16);
      })
        .then(function() {
          return _this.getLocalStream();
        })
        .then(function(localStream) {
          if (_this.targetId === '') {
            throw new Error('target id required');
          }
          if (!_this.client) {
            throw new Error('not logged in');
          }
          document.getElementById('local_video').srcObject = localStream;
          return _this.client.call(_this.targetId, localStream);
        })
        .then(function(outgoingCall) {
          _this.currentCall = outgoingCall;
          outgoingCall.on('connect', function(stream) {
            document.getElementById('remote_video').srcObject = stream;
            _this.remoteAudio = stream.getAudioTracks()[0];
            _this.state = 'connected';
          });
          outgoingCall.on('refuse', function() {
            alert(_this.targetId + ' refused the call');
            _this.reset();
          });
          outgoingCall.on('close', _this.reset.bind(_this));
          _this.state = 'waiting';
        })
        .catch(function(error) {
          _this.reset();
          return alert(error.message);
        });
    },
    accept: function accept() {
      var _this = this;

      return this.getLocalStream()
        .then(function(localStream) {
          var incomingCall = _this.incomingCall;
          _this.incomingCall = null;
          _this.currentCall = incomingCall;
          _this.targetId = incomingCall.from;
          _this.state = 'connected';
          incomingCall.on('connect', function(stream) {
            document.getElementById('remote_video').srcObject = stream;
            _this.remoteAudio = stream.getAudioTracks()[0];
          });
          incomingCall.on('close', _this.reset.bind(_this));
          return incomingCall.accept(localStream);
        })
        .catch(console.error.bind(console));
    },
    decline: function decline() {
      var _this = this;

      return this.incomingCall
        .refuse()
        .then(function() {
          return (_this.incomingCall = null);
        })
        .catch(console.error.bind(console));
    },
    hangup: function hungup() {
      if (this.currentCall) {
        this.currentCall.close();
      }
      this.reset();
    },
    reset: function reset() {
      this.state = 'ready';
      var localVideo = document.getElementById('local_video');
      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(function(track) {
          return track.stop();
        });
      }
      delete this.localStream;
      this.localVideoEnabled = true;
      this.localAudioEnabled = true;
      this.remoteAudioEnabled = true;
    },
    toggleCamera: function toggleCamera() {
      this.localVideoEnabled = !this.localVideoEnabled;
      this.localVideo.enabled = this.localVideoEnabled;
    },
    toggleMic: function toggleMic() {
      this.localAudioEnabled = !this.localAudioEnabled;
      this.localAudio.enabled = this.localAudioEnabled;
    },
    toggleMuted: function toggleMuted() {
      this.remoteAudioEnabled = !this.remoteAudioEnabled;
      this.remoteAudio.enabled = this.remoteAudioEnabled;
    },
  },
});
