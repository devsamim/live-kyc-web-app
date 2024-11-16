const cameraFeed = document.getElementById('cameraFeed');
    const photoCanvas = document.getElementById('photoCanvas');
    const recordButton = document.getElementById('recordButton');
    const photoButton = document.getElementById('photoButton');
    const beautifyButton = document.getElementById('beautifyButton');
    const downloadButton = document.getElementById('downloadButton');
    const timerElement = document.getElementById('timer');
    const videoContainer = document.getElementById('videoContainer');

    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    let timerInterval;
    let seconds = 0;
    let isBeautyModeOn = false;

    // Format time in mm:ss
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Start timer
    function startTimer() {
      seconds = 0;
      timerInterval = setInterval(() => {
        seconds++;
        timerElement.textContent = formatTime(seconds);
      }, 1000);
    }

    // Stop timer
    function stopTimer() {
      clearInterval(timerInterval);
    }

    // Access the camera and microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        cameraFeed.srcObject = stream;

        // Initialize MediaRecorder for video recording
        mediaRecorder = new MediaRecorder(stream);

        // Handle video data
        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        // Handle stopping video recording
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/mp4' });
          recordedChunks = [];

          // Enable video download button
          downloadButton.style.display = 'block';
          downloadButton.onclick = () => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recorded_video_with_sound.mp4';
            a.click();
            downloadButton.style.display = 'none'; // Hide after download
          };
        };
      })
      .catch(error => {
        console.error('Error accessing camera or microphone:', error);
      });

    // Start/Stop recording
    recordButton.addEventListener('click', () => {
      if (!isRecording) {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
          mediaRecorder.start();
          isRecording = true;
          recordButton.innerHTML = '&#9632;'; // Stop icon
          recordButton.classList.add('active');
          startTimer();
          console.log('Recording started');
        }
      } else {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          isRecording = false;
          recordButton.innerHTML = '&#9654;'; // Play icon
          recordButton.classList.remove('active');
          stopTimer();
          console.log('Recording stopped');
        }
      }
    });

    // Capture photo
    photoButton.addEventListener('click', () => {
      const context = photoCanvas.getContext('2d');
      photoCanvas.width = cameraFeed.videoWidth;
      photoCanvas.height = cameraFeed.videoHeight;
      context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);

      // Convert canvas to image and trigger download
      const image = photoCanvas.toDataURL('image/jpeg');
      const a = document.createElement('a');
      a.href = image;
      a.download = 'captured_photo.jpg';
      a.click();
      console.log('Photo captured');
    });

    // Toggle beauty mode
    beautifyButton.addEventListener('click', () => {
      isBeautyModeOn = !isBeautyModeOn;
      if (isBeautyModeOn) {
        videoContainer.classList.add('beauty-mode');
      } else {
        videoContainer.classList.remove('beauty-mode');
      }
      console.log(`Beauty Mode ${isBeautyModeOn ? 'Activated' : 'Deactivated'}`);
    });