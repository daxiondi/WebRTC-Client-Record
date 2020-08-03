let recorder;
let recordingData = [];
let recorderStream;

/**
 * 混合音频
 * */
function mixer(stream1, stream2) {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    if(stream1.getAudioTracks().length > 0)
        ctx.createMediaStreamSource(stream1).connect(dest);

    if(stream2.getAudioTracks().length > 0)
        ctx.createMediaStreamSource(stream2).connect(dest);

    let tracks = dest.stream.getTracks();
    tracks = tracks.concat(stream1.getVideoTracks()).concat(stream2.getVideoTracks());

    return new MediaStream(tracks)

}

/**
 * 根据URL和时间戳中的Jitsi房间名称返回文件名
 * 
 */
function getFilename(){
    const now = new Date();
    const timestamp = now.toISOString();
    const room = new RegExp(/(^.+)\s\|/).exec(document.title);
    if(room && room[1]!=="")
        return `${room[1]}_${timestamp}`;
    else
        return `recording_${timestamp}`;
}

/**
 * 检查浏览器支持的编码
 *
 */
function checkCodecsSupported(){
    let options = {mimeType: 'video/webm;codecs=vp9,opus'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      options = {mimeType: 'video/webm;codecs=vp8,opus'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = {mimeType: 'video/webm'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`);
          options = {mimeType: ''};
        }
      }
    }
    return options;
}

/**
 * 开始录制
 * */
const start = document.getElementById('recordStart');
const frameRate = document.getElementById('frameRate');
start.addEventListener('click', async ()=> {

    const options = checkCodecsSupported();

    let gumStream, gdmStream;
    recordingData = [];

    try {
        gumStream = await navigator.mediaDevices.getUserMedia({video: false, audio: {
            echoCancellation: {exact: true}
          }});
        gdmStream = await navigator.mediaDevices.getDisplayMedia({video: {width: 1280, height: 720,displaySurface: "browser",frameRate: frameRate.value > 0 ? frameRate.value : 15}, audio: {
            echoCancellation: true
          }});

    } catch (e) {
        console.error("capture failure", e);
        return
    }

    recorderStream = gumStream ? mixer(gumStream, gdmStream) : gdmStream;
    recorder = new MediaRecorder(recorderStream, options);

    recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
            recordingData.push(e.data);
        }
    };

    recorder.onStop = () => {
        recorderStream.getTracks().forEach(track => track.stop());
        gumStream.getTracks().forEach(track => track.stop());
        gdmStream.getTracks().forEach(track => track.stop());

    };

    recorderStream.addEventListener('inactive', () => {
        console.log('Capture stream inactive');
        stopCapture();
    });

    recorder.start();
    console.log("started recording");
    start.innerText = "Recording";

    start.disabled = true;
    pause.disabled = false;
    stop.disabled = false;
    play.disabled = true;
    save.disabled = true;
});


/**
 * 停止录制
 */
const stop = document.getElementById('recordStop');
function stopCapture(){
    console.log("Stopping recording");
    recorder.stop();

    start.disabled = false;
    pause.disabled = true;
    stop.disabled = true;
    play.disabled = false;
    save.disabled = false;

    start.innerText = "Record";
    pause.innerText = "Pause";

}
stop.addEventListener('click', stopCapture);

/**
 * 暂停录制
 */
const pause = document.getElementById('recordPause');
pause.addEventListener('click', ()=>{
    if(recorder.state ==='paused'){
        recorder.resume();
        pause.innerText = "Pause"
    }
    else if (recorder.state === 'recording'){
        recorder.pause();
        pause.innerText = "Resume"

    }
    else
        console.error(`recorder in unhandled state: ${recorder.state}`);

    console.log(`recorder ${recorder.state === 'paused' ? "paused" : "recording"}`);

});

/**
 *   
 *  播放录制
 */
let isPlaying = false;
const play = document.getElementById('recordPlay');
play.addEventListener('click', ()=>{
    playback.hidden = !playback.hidden;
    if (!isPlaying && !playback.hidden){
        playback.src = window.URL.createObjectURL(new Blob(recordingData, {type: 'video/webm'}));
        playback.play();
        play.innerText = "Hide";
    }
    else
        play.innerText = "Play";

});

const playback = document.getElementById('recordPlayback');
// 添加处理事件
playback.addEventListener('play', ()=>{isPlaying = true});
playback.addEventListener('pause', ()=>{isPlaying = false});
playback.addEventListener('playing', ()=>{isPlaying = true});
playback.addEventListener('ended', ()=>{isPlaying = false});

/**
 * 保存录制
 * */
const save = document.getElementById('recordSave');
save.addEventListener('click', () => {
    const blob = new Blob(recordingData, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${getFilename()}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log(`${a.download} save option shown`);
    }, 100);
});
