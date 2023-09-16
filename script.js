const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const newRecordingButton = document.getElementById("newRecordingButton");
const recordedVideo = document.getElementById("recordedVideo");
const microphoneToggle = document.getElementById("microphoneToggle");

let mediaRecorder;
let recordedChunks = [];
let audioStream;

async function startRecording() {
    try {
      
        if (microphoneToggle.checked) {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
            audioStream = null;
        }

        const videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

      
        let combinedStream;
        if (audioStream) {
            combinedStream = new MediaStream([...audioStream.getTracks(), ...videoStream.getTracks()]);
        } else {
            combinedStream = videoStream;
        }

        mediaRecorder = new MediaRecorder(combinedStream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            recordedChunks = [];
            recordedVideo.src = URL.createObjectURL(blob);

            startButton.disabled = true;
            stopButton.disabled = true;
            newRecordingButton.disabled = false;
        };

        mediaRecorder.start();

        startButton.disabled = true;
        stopButton.disabled = false;
        newRecordingButton.disabled = true;
        microphoneToggle.disabled = true;
    } catch (error) {
        console.error("Error starting recording:", error);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
}

function startNewRecording() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }

    recordedVideo.src = ""; 
    URL.revokeObjectURL(recordedVideo.src);
    startButton.disabled = false;
    stopButton.disabled = true;
    newRecordingButton.disabled = true;
    microphoneToggle.disabled = false;
}

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
newRecordingButton.addEventListener("click", startNewRecording);
