# WebRTC-Client-Record
Local recording using webrtc

Use getdisplaymedia to capture the user selected screen and getusermedia local audio. If you use Chrome browser to capture the voice of a remote participant through system audio, make sure you click capture audio and the echocancellation parameter eliminates the local echo

# Installation
*This document applies to [Jitsi Meet](https://github.com/jitsi/jitsi-meet) client recording, but in theory it applies to client recording for all streaming media servers*


```
git clone https://github.com/daxiondi/WebRTC-Client-Record.git
cd WebRTC-Client-Record/
./install.sh
```

Let's assume that you are using a quick installation of `jitsi meet`. The web directory is in `/usr/share/jitsi meet/index.html` , if the file is in a different location, please `/install.sh {{meet_web_Dir}}` runs in the correct directory.

# Other streaming media servers
You just need to copy `recorder.html recorder.css recorder.js` Go to the static directory of your website

# Test
Open with browser `recorder.html`
