
// create client 
const client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); // vp8 to work across mobile devices

const agoraAppId = '4fdfd402ce0a45ea94d850f2124f0b36';
const channelName = 'WebAR'; 
var streamCount = 0;
const parent = document.querySelector('a-nft'); // set as 'a-marker' or 'a-nft'

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG); 

client.init(agoraAppId, () => {
  console.log('AgoraRTC client initialized');
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log('[ERROR] : AgoraRTC client init failed', err);
});

// connect remote streams
client.on('stream-added', (evt) => {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('New stream added: ' + streamId);
  console.log('Subscribing to remote stream:' + streamId);
  // Subscribe to the stream.
  client.subscribe(stream, (err) => {
    console.log('[ERROR] : subscribe stream failed', err);
  });

  streamCount++;
  // create video element
  const video = document.createElement('video');
  video.id = "faceVideo-" + streamId;
  video.setAttribute('webkit-playsinline', 'webkit-playsinline');
  video.setAttribute('playsinline', 'playsinline');
  // add video object to the DOM
  document.querySelector("a-assets").appendChild(video);

  // add the new broadcaster
  const gltfModel = "#broadcaster";
  // const scale = "-0.55 -0.55 -0.55";
  const scale = "5 5 5";
  // const scale = { x: 5, y: 5, z: 5 }
  const offset = (streamCount-1); // offset used to space out models in the scene
  const position = offset + " 0 0";
  // const position = { x: offset, y: 0, z: 0 }
  const rotation = "270 0 0";
  // const rotation = { x: 270, y: 0, z: 0 };


  // var newBroadcaster = document.createElement('a-gltf-model');
  var newBroadcaster = document.createElement('a-entity');
  newBroadcaster.setAttribute('id', streamId);
  newBroadcaster.setAttribute('gltf-model', gltfModel);
  newBroadcaster.setAttribute('scale', scale);
  newBroadcaster.setAttribute('position', position);
  newBroadcaster.setAttribute('rotation', rotation);
  parent.appendChild(newBroadcaster);

  console.log(newBroadcaster);

  newBroadcaster.addEventListener('model-loaded', () => {
    var mesh = newBroadcaster.getObject3D('mesh');
    mesh.traverse((node) => {
      // search the mesh's children for the face-geo
      if (node.isMesh && node.name == 'face-geo') {
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

client.on('stream-removed', (evt) => {
  var stream = evt.stream;
  stream.stop(); // stop the stream
  stream.close(); // clean up and close the camera stream
  console.log("Remote stream is removed " + stream.getId());
});

client.on('stream-subscribed', (evt) => {
  var remoteStream = evt.stream;
  var remoteId = remoteStream.getId();
  console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());
  
  // get the designated video element and add the stream as its video source
  var video = document.getElementById("faceVideo-" + remoteId);
  video.srcObject = remoteStream.stream;
  video.onloadedmetadata = () => {
    // video.play();
    console.log("::::::: ready to play video ::::::::::::::");
  }

});

// remove the remote-container when a user leaves the channel
client.on('peer-leave', (evt) => {
  console.log('Remote stream has left the channel: ' + evt.uid);
  evt.stream.stop(); // stop the stream
  var remoteId = evt.stream.getId();
  document.getElementById(remoteId).remove();
  document.getElementById("faceVideo-" + remoteId);
  streamCount--;
});

// show mute icon whenever a remote has muted their mic
client.on('mute-audio', (evt) => {
  console.log("mute-audio for: " + evt.uid);
});

client.on('unmute-audio', (evt) => {
  console.log("unmute-audio for: " + evt.uid);
});

// show user icon whenever a remote has disabled their video
client.on('mute-video', (evt) => {
  console.log("mute-video for: " + evt.uid);
});

client.on('unmute-video', (evt) => {
  console.log("unmute-video for: " + evt.uid);
});

// join a channel
function joinChannel() {
  var token = generateToken();

  // set the role
  client.setClientRole('audience', () => {
    console.log('Client role set to audience');
  }, (e) => {
    console.log('setClientRole failed', e);
  });
  
  client.join(token, channelName, 0, (uid) => {
      console.log('User ' + uid + ' join channel successfully');
  }, function(err) {
      console.log('[ERROR] : join channel failed', err);
  });
}

function leaveChannel() {
  client.leave(() => {
    console.log('client leaves channel');
  }, (err) => {
    console.log('client leave failed ', err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}
