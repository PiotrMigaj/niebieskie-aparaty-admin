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
  const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
  const toggleCamelGalleryBtn = document.getElementById('toggleCamelGalleryBtn');
  const createTokenBtn = document.getElementById('createTokenBtn');
  const tokenForm = document.getElementById('tokenForm');
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  const validDaysInput = document.getElementById('validDaysInput');
  const tokenErrorMsg = document.getElementById('tokenErrorMsg');

  let selectedFile = null;

  // Toggle camelGallery
  if (toggleCamelGalleryBtn) {
    toggleCamelGalleryBtn.addEventListener('click', async () => {
      const eventId = toggleCamelGalleryBtn.dataset.eventId;
      const newStatus = toggleCamelGalleryBtn.dataset.currentStatus !== 'true';

      toggleCamelGalleryBtn.disabled = true;
      toggleCamelGalleryBtn.textContent = 'Updating...';

      try {
        const response = await fetch(`/api/events/${eventId}/toggle-camel-gallery`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camelGallery: newStatus }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to update gallery status: ${response.status}`);
        }

        window.location.reload();
      } catch (error) {
        console.error('Error toggling gallery:', error);
        toggleCamelGalleryBtn.disabled = false;
        toggleCamelGalleryBtn.textContent = newStatus ? 'Disable Gallery' : 'Enable Gallery';
      }
    });
  }

  // Create / regenerate access token
  if (createTokenBtn) {
    createTokenBtn.addEventListener('click', () => {
      tokenForm.style.display = tokenForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (saveTokenBtn) {
    saveTokenBtn.addEventListener('click', async () => {
      const validDays = parseInt(validDaysInput.value, 10);
      if (!validDays || validDays < 1) {
        tokenErrorMsg.textContent = 'Please enter a valid number of days.';
        tokenErrorMsg.style.display = 'inline';
        return;
      }
      tokenErrorMsg.style.display = 'none';

      saveTokenBtn.disabled = true;
      saveTokenBtn.textContent = 'Saving...';

      try {
        const response = await fetch(`/api/events/${eventId}/token`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ validDays }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to save token: ${response.status}`);
        }

        window.location.reload();
      } catch (error) {
        console.error('Error creating token:', error);
        tokenErrorMsg.textContent = `Error: ${error.message}`;
        tokenErrorMsg.style.display = 'inline';
        saveTokenBtn.disabled = false;
        saveTokenBtn.textContent = 'Save';
      }
    });
  }

  // Toggle selection availability
  if (toggleSelectionBtn && !toggleSelectionBtn.disabled) {
    toggleSelectionBtn.addEventListener('click', async () => {
      const eventId = toggleSelectionBtn.dataset.eventId;
      const currentStatus = toggleSelectionBtn.dataset.currentStatus;
      
      // If currentStatus is undefined, the feature is not available
      if (currentStatus === 'undefined') {
        return;
      }
      
      const isCurrentlyEnabled = currentStatus === 'true';
      const newStatus = !isCurrentlyEnabled;

      try {
        toggleSelectionBtn.disabled = true;
        toggleSelectionBtn.textContent = 'Updating...';

        const response = await fetch(`/api/events/${eventId}/toggle-selection`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectionAvailable: newStatus
          }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to update selection status: ${response.status}`);
        }

        // Reload the page to update the UI and show/hide selection details button
        window.location.reload();

      } catch (error) {
        console.error('Error toggling selection:', error);
        
        if (statusMessage) {
          const originalText = statusMessage.textContent;
          const originalClass = statusMessage.className;
          statusMessage.textContent = `Error: ${error.message}`;
          statusMessage.className = 'status-message error';
          
          setTimeout(() => {
            statusMessage.textContent = originalText;
            statusMessage.className = originalClass;
          }, 5000);
        }
      } finally {
        toggleSelectionBtn.disabled = false;
        // Button text will be set correctly above based on the new status
      }
    });
  }

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
