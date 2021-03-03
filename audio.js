const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const play = document.querySelector('.play');
const canvas = document.querySelector('.wave');
const mainSection = document.querySelector('.main-controls');

// disable stop button
stop.disabled = true;

let audioContext;
const canvasContext = canvas.getContext("2d");

//audio recording
if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    const constraints = { audio: true };
    let chunks = [];

    let onSuccess = function(stream) {
        const mediaRecorder = new MediaRecorder(stream);

        drawingWave(stream);

        record.onclick = function() {
            mediaRecorder.start();
            console.log(mediaRecorder.state);

            var image_x = document.getElementById('nosinging');
            if (image_x != null){
                image_x.parentNode.removeChild(image_x);
            }

            var image_y = document.getElementById('singing');
            if (image_y != null){
                image_y.parentNode.removeChild(image_y);
            }

            var img = new Image();
            img.src = "chipmunk.gif";
            img.id = "singing"
            document.getElementById("main").appendChild(img);

            record.style.background = "red";
            stop.disabled = false;
            record.disabled = true;
        }

        stop.onclick = function() {
            mediaRecorder.stop();
            // console.log(mediaRecorder.state);
            record.style.background = "";
            record.style.color = "";

            stop.disabled = true;
            record.disabled = false;
        }

        mediaRecorder.onstop = function(e) {
            const audio = document.createElement('audio');
            audio.setAttribute('controls', '');
            audio.controls = true;
            const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;
            console.log("recorder stopped");

            play.onclick = function (){
                var image_x = document.getElementById('nosinging');
                if (image_x != null){
                    image_x.parentNode.removeChild(image_x);
                }

                var image_y = document.getElementById('singing');
                if (image_y != null){
                    image_y.parentNode.removeChild(image_y);
                }

                audio.playbackRate = 1.8;
                audio.play()
                var img = new Image();
                img.src = "singing.gif";
                img.id = "singing"
                document.getElementById("main").appendChild(img);
            }

            audio.addEventListener("ended", function(){
                var image_x = document.getElementById('singing');
                image_x.parentNode.removeChild(image_x);
                audio.currentTime = 0;
                var img = new Image();
                img.src = "no.png";
                img.id = "nosinging"
                document.getElementById("main").appendChild(img);
            });
        }
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
    }
    let onError = function(err) {
        console.log('The following error occured: ' + err);
    }
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
    console.log('getUserMedia not supported on your browser!');
}

// visualize wave sound
function drawingWave(stream) {
    if(!audioContext) {
        audioContext = new AudioContext();
    }

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioContext.destination);

    draw()

    function draw() {
        const WIDTH = canvas.width
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasContext.fillStyle = 'rgb(200,200,200)';
        canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(0, 0, 0)';

        canvasContext.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;
        for(let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT/2;
            if(i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasContext.lineTo(canvas.width, canvas.height/2);
        canvasContext.stroke();
    }
}

window.onresize = function() {
    canvas.width = mainSection.offsetWidth;
}
window.onresize();
