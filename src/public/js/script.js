// src/public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const usernameInput = document.getElementById('username');
  const eventIdInput = document.getElementById('eventId');
  const fileInput = document.getElementById('fileInput');
  const submitButton = document.getElementById('submitButton');
  const progressContainer = document.getElementById('progressContainer');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentage = document.getElementById('progressPercentage');
  const statusMessage = document.getElementById('statusMessage');
  const uploadSuccess = document.getElementById('uploadSuccess');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const fileType = document.getElementById('fileType');
  const uploadPath = document.getElementById('uploadPath');

  //   let isUploading = false;
  let selectedFile = null;

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0] || null;
    progressContainer.style.display = 'none';
    progressBarFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    statusMessage.textContent = '';
    statusMessage.className = '';
    uploadSuccess.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const eventId = eventIdInput.value;

    if (!username || !eventId || !selectedFile) {
      statusMessage.textContent = 'All fields are required.';
      statusMessage.className = 'error';
      return;
    }

    try {
      isUploading = true;
      submitButton.textContent = 'Uploading...';
      submitButton.disabled = true;
      uploadSuccess.style.display = 'none';

      // Request presigned URL from the backend
      const res = await fetch('/upload/presigned-url', {
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
      if (!presignedUrl) {
        throw new Error('Presigned URL not received');
      }

      // Upload the file using the presigned URL
      progressContainer.style.display = 'block';

      await uploadFileWithXHR(presignedUrl, selectedFile);

      // Display success message and file details
      statusMessage.textContent = '';

      // Update file details
      fileName.textContent = selectedFile.name;
      fileSize.textContent = formatFileSize(selectedFile.size);
      fileType.textContent = selectedFile.type || 'Unknown';
      uploadPath.textContent = key;

      // Show success details
      uploadSuccess.style.display = 'block';

      // Reset file input
      fileInput.value = '';
      selectedFile = null;

      setTimeout(() => {
        progressBarFill.style.width = '0%';
        progressPercentage.textContent = '0%';
      }, 5000);
    } catch (err) {
      console.error(err);
      statusMessage.textContent = err.message;
      statusMessage.className = 'error';
      progressContainer.style.display = 'none';
    } finally {
      isUploading = false;
      submitButton.textContent = 'Upload File';
      submitButton.disabled = false;
    }
  });

  function uploadFileWithXHR(url, file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          progressBarFill.style.width = `${percentComplete}%`;
          progressPercentage.textContent = `${percentComplete}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Set progress to 100% when complete
          progressBarFill.style.width = '100%';
          progressPercentage.textContent = '100%';
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(file);
    });
  }
});
