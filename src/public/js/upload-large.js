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

    if (selectedFile.size <= 5 * 1024 * 1024 * 1024) {
      statusMessage.textContent = 'Please select a file larger than 5GB.';
      statusMessage.className = 'status-message error';
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Uploading...';

      // Initialize multipart upload
      const initRes = await fetch('/api/files/multipart/init', {
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

      if (!initRes.ok) {
        throw new Error('Failed to initialize upload');
      }

      const { uploadId, key } = await initRes.json();

      // Show progress container
      progressContainer.style.display = 'block';

      // Calculate chunk size (5MB)
      const chunkSize = 5 * 1024 * 1024;
      const chunks = Math.ceil(selectedFile.size / chunkSize);
      const parts = [];

      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        // Get presigned URL for part upload
        const partRes = await fetch('/api/files/multipart/part', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            uploadId,
            partNumber: i + 1,
          }),
          credentials: 'include',
        });

        if (!partRes.ok) {
          throw new Error('Failed to get part upload URL');
        }

        const { presignedUrl } = await partRes.json();

        // Upload chunk
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: chunk,
        });

        if (!uploadRes.ok) {
          throw new Error(`Failed to upload part ${i + 1}`);
        }

        const ETag = uploadRes.headers.get('ETag');
        parts.push({
          PartNumber: i + 1,
          ETag: ETag.replace(/"/g, ''),
        });

        // Update progress
        const progress = Math.round(((i + 1) / chunks) * 100);
        progressBarFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
      }

      // Complete multipart upload
      const completeRes = await fetch('/api/files/multipart/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          uploadId,
          parts,
        }),
        credentials: 'include',
      });

      if (!completeRes.ok) {
        throw new Error('Failed to complete upload');
      }

      // Create file record
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
});
