const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

let stream = null;

async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        video.srcObject = stream;
        captureBtn.disabled = false;
        status.textContent = 'Camera ready! Click "Take Photo" to capture.';
        status.className = '';
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        status.textContent = 'Error: Could not access camera. Please ensure camera permissions are granted.';
        status.className = 'error';
    }
}

function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `photo-${timestamp}.png`;
        
        if (window.electronAPI) {
            const reader = new FileReader();
            reader.onload = function() {
                const arrayBuffer = reader.result;
                window.electronAPI.savePhoto(arrayBuffer, filename).then(() => {
                    status.textContent = `Photo saved as ${filename}`;
                    status.className = 'success';
                }).catch((error) => {
                    console.error('Error saving photo:', error);
                    status.textContent = 'Error saving photo. Please try again.';
                    status.className = 'error';
                });
            };
            reader.readAsArrayBuffer(blob);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            status.textContent = `Photo downloaded as ${filename}`;
            status.className = 'success';
        }
    }, 'image/png');
}

captureBtn.addEventListener('click', capturePhoto);

window.addEventListener('load', initCamera);

window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});