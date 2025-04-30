document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const eventId = document.getElementById('eventId')?.value;
  const username = document.getElementById('username')?.value;
  const fileInput = document.getElementById('fileInput');
  const submitButton = document.getElementById('submitButton');
  const progressContainer = document.getElementById('progressContainer');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentage = document.getElementById('progressPercentage');
  const statusMessage = document.getElementById('statusMessage');

  let selectedFile = null;

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      selectedFile = e.target.files[0] || null;
      if (progressContainer) progressContainer.style.display = 'none';
      if (progressBarFill) progressBarFill.style.width = '0%';
      if (progressPercentage) progressPercentage.textContent = '0%';
      if (statusMessage) {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!selectedFile) {
        if (statusMessage) {
          statusMessage.textContent = 'Please select an image file.';
          statusMessage.className = 'status-message error';
        }
        return;
      }

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Uploading...';
        }

        const res = await fetch('/api/events/upload-url', {
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

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || `Failed to get URL: ${res.status}`);
        }

        const { presignedUrl, key } = data;

        if (progressContainer) progressContainer.style.display = 'block';

        await uploadFileWithProgress(presignedUrl, selectedFile, (progress) => {
          if (progressBarFill) progressBarFill.style.width = `${progress}%`;
          if (progressPercentage) progressPercentage.textContent = `${progress}%`;
        });

        const updateRes = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imagePlaceholderObjectKey: key,
          }),
          credentials: 'include',
        });

        if (!updateRes.ok) {
          throw new Error('Failed to update event');
        }

        if (statusMessage) {
          statusMessage.textContent = 'Image uploaded successfully!';
          statusMessage.className = 'status-message success';
        }

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error(err);
        if (statusMessage) {
          statusMessage.textContent = err.message;
          statusMessage.className = 'status-message error';
        }
        if (progressContainer) progressContainer.style.display = 'none';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Upload Image';
        }
      }
    });
  }

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
