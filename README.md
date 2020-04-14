# AgoraARjs
This is an example of using Agora's Video SDK with AR.js

## Quick Start ##
To run this demo it is recommended to use a desktop device and a mobile device. 
> If you are using an iPhone, make sure to use Safari 

## Broadcaster ##
1. Visit [https://agora-group-video-chat.herokuapp.com](https://agora-group-video-chat.herokuapp.com) in your Desktop browser
2. Input your Agora AppID
3. Input the channel name `WebAR`

### (AR) Audience ###
1. Clone this repo
2. Open `js/agora-audience.js` and add your Agora AppID on line 5, `var agoraAppId = '';`
3. Depoly to a localhost with a tunnel out ([ngrok](https://ngrok.com)) or remote server
4. Open your mobile browser and view the `index.html` page
5. Once the camera feed is visible, point the device at the marker to view the **Broadcaster**.

> The `Channel name` is customizable on line 6 of `js/agora-audience.js`, but note that this value must match the value input for the **Broadcast** user
