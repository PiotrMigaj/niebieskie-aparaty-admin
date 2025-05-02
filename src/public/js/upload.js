document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const submitButton = document.getElementById('submitButton');
  const progressContainer = document.getElementById('progressContainer');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentage = document.getElementById('progressPercentage');
  const statusMessage = document.getElementById('statusMessage');
  const username = document.getElementById('username').value;
  const eventId = document.getElementById('eventId').value;
  const description = document.getElementById('description');

  let selectedFile = null;

  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0] || null;
    progressContainer.style.display = 'none';
    progressBarFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile || !description.value.trim()) {
      statusMessage.textContent = 'Please fill in all required fields.';
      statusMessage.className = 'status-message error';
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Uploading...';

      // Get presigned URL from the events endpoint
      const presignedUrlRes = await fetch('/api/events/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          username: username,
          eventId: eventId,
        }),
        credentials: 'include',
      });

      if (!presignedUrlRes.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, key } = await presignedUrlRes.json();

      // Show progress container
      progressContainer.style.display = 'block';

      // Upload file using presigned URL
      await uploadFileWithProgress(presignedUrl, selectedFile, (progress) => {
        progressBarFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
      });

      // Create file record in database
      const fileRes = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.value,
          eventId: eventId,
          username: username,
          objectKey: key,
        }),
        credentials: 'include',
      });

      if (!fileRes.ok) {
        throw new Error('Failed to create file record');
      }

      statusMessage.textContent = 'File uploaded successfully!';
      statusMessage.className = 'status-message success';

      // Redirect back to event details page after successful upload
      setTimeout(() => {
        window.location.href = `/events/${eventId}`;
      }, 1500);
    } catch (err) {
      console.error(err);
      statusMessage.textContent = err.message;
      statusMessage.className = 'status-message error';
      progressContainer.style.display = 'none';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Upload File';
    }
  });

  function uploadFileWithProgress(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
});
