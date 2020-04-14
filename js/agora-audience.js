
// create client 
var client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); // vp8 to work across mobile devices

var agoraAppId = '';
var channelName = 'WebAR'; 
var streamCount = 0;

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG); 

client.init(agoraAppId, function () {
  console.log('AgoraRTC client initialized');
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log('[ERROR] : AgoraRTC client init failed', err);
});

// connect remote streams
client.on('stream-added', function (evt) {
  var stream = evt.stream;
  var streamId = stream.getId();
  console.log('New stream added: ' + streamId);
  console.log('Subscribing to remote stream:' + streamId);
  // Subscribe to the stream.
  client.subscribe(stream, function (err) {
    console.log('[ERROR] : subscribe stream failed', err);
  });

  streamCount++;
  // add the new broadcaster
  var gltfModel = "#broadcaster";
  var scale = "-0.55 -0.55 -0.55";
  var offset = (streamCount-1);
  var position = offset + " 0 0";
  var rotation = "170 0 0";
  // var rotation = "90 0 0";
  var parent = document.querySelector('a-marker');

  var newBroadcaster = document.createElement('a-gltf-model');
  newBroadcaster.setAttribute('id', streamId);
  newBroadcaster.setAttribute('gltf-model', gltfModel);
  newBroadcaster.setAttribute('scale', scale);
  newBroadcaster.setAttribute('position', position);
  newBroadcaster.setAttribute('rotation', rotation);
  parent.appendChild(newBroadcaster);

  newBroadcaster.addEventListener('model-loaded', function () {
    var mesh = newBroadcaster.getObject3D('mesh');
    mesh.traverse(function(node) {
      // search the mesh's children for the face-geo
      if (node.isMesh && node.name == 'face-geo') {
        // create video element
        var video = document.createElement('video');
        video.id = "faceVideo-" + streamId;
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        video.setAttribute('playsinline', 'playsinline');
        // add video object to the DOM
        document.querySelector("a-assets").appendChild(video);
        // create video texture from video element
        var texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter; 
        texture.magFilter = THREE.LinearFilter; 
        texture.flipY = false;
        // set node's material map to video texture
        node.material.map = texture
        node.material.color = new THREE.Color();
        node.material.metalness = 0;
      }
    });
  }); 
});

client.on('stream-removed', function (evt) {
  var stream = evt.stream;
  stream.stop(); // stop the stream
  stream.close(); // clean up and close the camera stream
  console.log("Remote stream is removed " + stream.getId());
});

client.on('stream-subscribed', function (evt) {
  var remoteStream = evt.stream;
  var remoteId = remoteStream.getId();
  console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());
  
  // get the designated video element and add the stream as its video source
  var video = document.getElementById("faceVideo-" + remoteId);
  video.srcObject = remoteStream.stream;
  video.onloadedmetadata = function() {
    video.play();
  }

});

// remove the remote-container when a user leaves the channel
client.on('peer-leave', function(evt) {
  console.log('Remote stream has left the channel: ' + evt.uid);
  evt.stream.stop(); // stop the stream
  var remoteId = evt.stream.getId();
  document.getElementById(remoteId).remove();
  document.getElementById("faceVideo-" + remoteId);
  streamCount--;
});

// show mute icon whenever a remote has muted their mic
client.on('mute-audio', function (evt) {
  console.log("mute-audio for: " + evt.uid);
});

client.on('unmute-audio', function (evt) {
  console.log("unmute-audio for: " + evt.uid);
});

// show user icon whenever a remote has disabled their video
client.on('mute-video', function (evt) {
  console.log("mute-video for: " + evt.uid);
});

client.on('unmute-video', function (evt) {
  console.log("unmute-video for: " + evt.uid);
});

// join a channel
function joinChannel() {
  var token = generateToken();

  // set the role
  client.setClientRole('audience', function() {
    console.log('Client role set to audience');
  }, function(e) {
    console.log('setClientRole failed', e);
  });
  
  client.join(token, channelName, 0, function(uid) {
      console.log('User ' + uid + ' join channel successfully');
  }, function(err) {
      console.log('[ERROR] : join channel failed', err);
  });
}

function leaveChannel() {
  client.leave(function() {
    console.log('client leaves channel');
  }, function(err) {
    console.log('client leave failed ', err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}
