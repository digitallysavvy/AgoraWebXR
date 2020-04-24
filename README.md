# Agora WebXR
This is an example of using Agora's Video SDK with WebXR. In this demo you can broadcast yourself from a WebVR environment using Agora with [AFrame](https://github.com/aframevr/aframe), or you can watch a live broadcaster in WebAR using Agora with [AR.js](https://github.com/AR-js-org/AR.js) and [AFrame](https://github.com/aframevr/aframe).

This project implements the [Agora Web SDK](https://docs.agora.io/en/Video/API%20Reference/web/index.html) for the live video streaming, and the [Agora RTM SDK](https://docs.agora.io/en/Real-time-Messaging/API%20Reference/RTM_web/index.html) for the data messaging.

## Quick Start ##
Clone this repo

## (WebVR) Broadcaster ##
1. Open `js/agora-broadcaster.js` and add your Agora AppID on line 2, `var agoraAppId = '';`
2. Depoly to: localhost ([Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)/[Xampp](https://www.apachefriends.org/index.html)) with a tunnel out ([ngrok](https://ngrok.com)); or remote server
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
1. Visit [https://agora-group-video-chat.herokuapp.com](https://agora-group-video-chat.herokuapp.com) in your Desktop browser
2. Input your Agora AppID
3. Input the channel name `WebAR`

## Experimental ##
I am still working on the Image Tracking integration. Currently there is an issue with dynamically loading content when using Image markers. For more details see issue :[https://github.com/AR-js-org/AR.js/issues/91](https://github.com/AR-js-org/AR.js/issues/91)
