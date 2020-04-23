
// create client 
var client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); // vp8 to work across mobile devices

// video profile settings
var cameraVideoProfile = '720p_6'; // 960 × 720 @ 30fps  & 750kbs

const agoraAppId = ''; // insert Agora AppID here
const channelName = 'WebAR'; 
var streamCount = 0;

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG); 

// keep track of streams
var localStreams = {
  uid: '',
  camera: {
    camId: '',
    micId: '',
    stream: {}
  },
  screen: {
    id: '',
    stream: {}
  }
};

// keep track of devices
var devices = {
  cameras: [],
  mics: []
}


client.init(agoraAppId, () => {
  console.log('AgoraRTC client initialized');
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log('[ERROR] : AgoraRTC client init failed', err);
});

client.on('stream-published', function (evt) {
  console.log('Publish local stream successfully');
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
  createBroadcaster(streamId)
});

client.on('stream-removed', (evt) => {
  const stream = evt.stream;
  stream.stop(); // stop the stream
  stream.close(); // clean up and close the camera stream
  console.log("Remote stream is removed " + stream.getId());
});

client.on('stream-subscribed', (evt) => {
  const remoteStream = evt.stream;
  const remoteId = remoteStream.getId();
  console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());
  
  // get the designated video element and connect it to the remoteStream
  var video = document.getElementById("faceVideo-" + remoteId);
  connectStreamToVideo(remoteStream, video);
});

// remove the remote-container when a user leaves the channel
client.on('peer-leave', (evt) => {
  console.log('Remote stream has left the channel: ' + evt.uid);
  evt.stream.stop(); // stop the stream
  const remoteId = evt.stream.getId();
  document.getElementById(remoteId).remove();
  document.getElementById("faceVideo-" + remoteId).remove();
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
  const token = generateToken();

  // set the role
  client.setClientRole('audience', () => {
    console.log('Client role set to audience');
  }, (e) => {
    console.log('setClientRole failed', e);
  });
  
  client.join(token, channelName, 0, (uid) => {
      console.log('User ' + uid + ' join channel successfully');
      createBroadcaster(uid);
      createCameraStream(uid);
  }, (err) => {
      console.log('[ERROR] : join channel failed', err);
  });
}

function leaveChannel() {

  client.leave(() => {
    console.log('client leaves channel');
    localStreams.camera.stream.stop() // stop the camera stream playback
    localStreams.camera.stream.close(); // clean up and close the camera stream
    client.unpublish(localStreams.camera.stream); // unpublish the camera stream
    //disable the UI elements
    $('#mic-btn').prop('disabled', true);
    $('#video-btn').prop('disabled', true);
    $('#exit-btn').prop('disabled', true);
  }, (err) => {
    console.log('client leave failed ', err); //error handling
  });
}

// video streams for channel
function createCameraStream(uid) {
  
  const localStream = AgoraRTC.createStream({
    streamID: uid,
    // audio: true,
    audio: false,
    video: true,
    screen: false
  });

  localStream.setVideoProfile(cameraVideoProfile);

  // The user has granted access to the camera and mic.
  localStream.on("accessAllowed", () => {
    if(devices.cameras.length === 0 && devices.mics.length === 0) {
      console.log('[DEBUG] : checking for cameras & mics');
      getCameraDevices();
      getMicDevices();
    }
    console.log("accessAllowed");
  });
  // The user has denied access to the camera and mic.
  localStream.on("accessDenied", () => {
    console.log("accessDenied");
  });

  localStream.init(() => {
    console.log('getUserMedia successfully');
    // play the local stream 
    var video = document.getElementById("faceVideo-" + uid);
    connectStreamToVideo(localStream, video);
    enableUiControls(localStream);
    // publish local stream
    client.publish(localStream, (err) => {
      console.log('[ERROR] : publish local stream error: ' + err);
    });
    // keep track of the camera stream for later
    localStreams.camera.stream = localStream; 
  }, (err) => {
    console.log('[ERROR] : getUserMedia failed', err);
  });
}

function createBroadcaster(streamId) {
  // create video element
  var video = document.createElement('video');
  video.id = "faceVideo-" + streamId;
  video.setAttribute('webkit-playsinline', 'webkit-playsinline');
  video.setAttribute('playsinline', 'playsinline');
  console.log(video);
  // add video object to the DOM
  document.querySelector("a-assets").appendChild(video);

  // add the new broadcaster
  const gltfModel = "#broadcaster";
  const scale = "1 1 1"; 
  const offset = streamCount;
  const position = offset + " -1 0";
  // const position = "0 -1 0";
  const rotation = "0 0 0";

  // add broadcaster to the scene
  const parent = document.querySelector('a-scene');
  var newBroadcaster = document.createElement('a-gltf-model');
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
}

function connectStreamToVideo(agoraStream, video) {
  video.srcObject = agoraStream.stream;// add video stream to video element as source
  video.onloadedmetadata = () => {
    video.play();
    console.log("::::::: ready to play video ::::::::::::::");
  }
}

function changeStreamSource (deviceIndex, deviceType) {
  console.log('Switching stream sources for: ' + deviceType);
  var deviceId;
  
  if (deviceType === "video") {
    deviceId = devices.cameras[deviceIndex].deviceId
  } else if(deviceType === "audio") {
    deviceId = devices.mics[deviceIndex].deviceId;
  }

  localStreams.camera.stream.switchDevice(deviceType, deviceId, () => {
    console.log('successfully switched to new device with id: ' + JSON.stringify(deviceId));
    // set the active device ids
    if(deviceType === "audio") {
      localStreams.camera.micId = deviceId;
    } else if (deviceType === "video") {
      localStreams.camera.camId = deviceId;
    } else {
      console.log("unable to determine deviceType: " + deviceType);
    }
  }, () => {
    console.log('failed to switch to new device with id: ' + JSON.stringify(deviceId));
  });
}

// helper methods
function getCameraDevices() {
  console.log("Checking for Camera Devices.....")
  client.getCameras ((cameras) => {
    devices.cameras = cameras; // store cameras array
    cameras.forEach((camera, i) => {
      const name = camera.label.split('(')[0];
      const optionId = 'camera_' + i;
      const deviceId = camera.deviceId;
      if(i === 0 && localStreams.camera.camId === ''){
        localStreams.camera.camId = deviceId;
      }
      $('#camera-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
    });
    $('#camera-list a').click((event) => {
      const index = event.target.id.split('_')[1];
      changeStreamSource ({camIndex: index});
    });
  });
}

function getMicDevices() {
  console.log("Checking for Mic Devices.....")
  client.getRecordingDevices((mics) => {
    devices.mics = mics; // store mics array
    mics.forEach((mic, i) => {
      let name = mic.label.split('(')[0];
      const optionId = 'mic_' + i;
      const deviceId = mic.deviceId;
      if(i === 0 && localStreams.camera.micId === ''){
        localStreams.camera.micId = deviceId;
      }
      if(name.split('Default - ')[1] != undefined) {
        name = '[Default Device]' // rename the default mic - only appears on Chrome & Opera
      }
      $('#mic-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
    }); 
    $('#mic-list a').click((event) => {
      const index = event.target.id.split('_')[1];
      changeStreamSource ({micIndex: index});
    });
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}


// UI
function toggleBtn(btn){
  btn.toggleClass('btn-dark').toggleClass('btn-danger');
}

function toggleScreenShareBtn() {
  $('#screen-share-btn').toggleClass('btn-danger');
  $('#screen-share-icon').toggleClass('fas').toggleClass('fab').toggleClass('fa-slideshare').toggleClass('fa-times-circle');
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    $(elementID).attr("style", "display:block");
  } else {
    $(elementID).attr("style", "display:none");
  }
}

function toggleMic() {
  toggleBtn($("#mic-btn")); // toggle button colors
  toggleBtn($("#mic-dropdown"));
  $("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
  if ($("#mic-icon").hasClass('fa-microphone')) {
    localStreams.camera.stream.unmuteAudio(); // enable the local mic
  } else {
    localStreams.camera.stream.muteAudio(); // mute the local mic
  }
}

function toggleVideo() {
  toggleBtn($("#video-btn")); // toggle button colors
  toggleBtn($("#cam-dropdown"));
  if ($("#video-icon").hasClass('fa-video')) {
    localStreams.camera.stream.muteVideo(); // enable the local video
    console.log("muteVideo");
  } else {
    localStreams.camera.stream.unmuteVideo(); // disable the local video
    console.log("unMuteVideo");
  }
  $("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
}

function enableUiControls() {

  $("#mic-btn").prop("disabled", false);
  $("#video-btn").prop("disabled", false);
  $("#exit-btn").prop("disabled", false);

  $("#mic-btn").click(() => {
    toggleMic();
  });

  $("#video-btn").click(() => {
    toggleVideo();
  });

  $("#exit-btn").click(() => {
    console.log("so sad to see you leave the channel");
    leaveChannel(); 
  });

  $("#start-RTMP-broadcast").click(() => {
    startLiveTranscoding();
    $('#addRtmpConfigModal').modal('toggle');
    $('#rtmp-url').val('');
  });

  $("#add-external-stream").click(() => { 
    addExternalSource();
    $('#add-external-source-modal').modal('toggle');
  });

  // keyboard listeners 
  $(document).keypress((e) => {
    // ignore keyboard events when the modals are open
    if (($("#addRtmpUrlModal").data('bs.modal') || {})._isShown ||
        ($("#addRtmpConfigModal").data('bs.modal') || {})._isShown){
      return;
    }

    switch (e.key) {
      case "m":
        console.log("squick toggle the mic");
        toggleMic();
        break;
      case "v":
        console.log("quick toggle the video");
        toggleVideo();
        break; 
      case "q":
        console.log("so sad to see you quit the channel");
        leaveChannel(); 
        break;   
      default:  // do nothing
    }
  });
}