# Agora WebXR
This is an example of using Agora's Video SDK with WebXR. In this demo you can broadcast yourself from a WebVR environment using [Agora Web SDK](https://docs.agora.io/en/Video/API%20Reference/web/index.html) with [AFrame](https://github.com/aframevr/aframe), or you can watch a live broadcaster in WebAR using [Agora Web SDK](https://docs.agora.io/en/Video/API%20Reference/web/index.html) with [AR.js](https://github.com/AR-js-org/AR.js) and [AFrame](https://github.com/aframevr/aframe). This project also implements the [Agora RTM SDK](https://docs.agora.io/en/Real-time-Messaging/API%20Reference/RTM_web/index.html) for the data messaging.

Full tutorial: [Build a WebAR Live Video Streaming Web-App](https://medium.com/@hermes_11327/build-a-webar-live-video-streaming-web-app-e56196345d8c?source=friends_link&sk=59346a2fe8b6465ae0ad447d517355b2)

## Quick Start ##
- Download or clone this repo. 
- An [Agora.io developer account](https://sso.agora.io/en/signup/), and get your App ID in the [Projects section of your Agora Console](https://console.agora.io/projects).

## (WebVR) Broadcaster ##
1. Open `js/agora-broadcaster.js` and add your Agora AppID on line 2, `var agoraAppId = '';`
2. Depoly to: [localhost](https://medium.com/r/?url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FLearn%2FCommon_questions%2Fset_up_a_local_testing_server) - or use a plugin/app ([Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)/[Xampp](https://www.apachefriends.org/index.html)) with a tunnel out ([ngrok](https://ngrok.com)); or remote server
3. Open your desktop browser and view the `broadcaster.html` page. (**Broadcaster**)

### (AR) Audience ###
1. Open `js/agora-audience.js` and add your Agora AppID on line 5, `var agoraAppId = '';`
2. Open your mobile browser and view the `index.html` page (**Audience**)
3. Once the camera feed is visible, point the device at the marker to view the .


## Notes ##
> The `Channel name` is customizable within `js/agora-broadcaster.js` and `js/agora-audience.js`, but note that this values must match for the two users to be in the same channel.
To run this demo it is recommended to use a desktop or mobile device for either **Broadcaster** or **Audience**. If using desktop for audience, you may want to adjust the rotation of the model, as it it currently set for mobile viewing.
> If you are using an iPhone, make sure to use Safari for both the **Broadcaster** and **Audience**

## Traditional Broadcaster ##
To test the **Audience** with a traditional web broadcast ui:
1. Visit [https://digitallysavvy.github.io/group-video-chat](https://digitallysavvy.github.io/group-video-chat) in your Desktop browser
2. Input your Agora AppID
3. Input the channel name `WebAR`

## Experimental ##
I am still working on the Image Tracking integration. Currently there is an issue with dynamically loading content when using Image markers. For more details see issue: [https://github.com/AR-js-org/AR.js/issues/91](https://github.com/AR-js-org/AR.js/issues/91)
