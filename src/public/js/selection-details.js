document.addEventListener('DOMContentLoaded', () => {
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const toggleBlockedBtn = document.getElementById('toggleBlockedBtn');
  
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => {
      console.log('CSV download button clicked');
      
      try {
        // Get the selection data from the JSON script tag
        const selectionDataElement = document.getElementById('selection-data');
        if (!selectionDataElement) {
          throw new Error('Selection data not found');
        }
        
        const selectionData = JSON.parse(selectionDataElement.textContent);
        console.log('Selection data:', selectionData);
        
        // Get image names from the DOM
        const imageItems = document.querySelectorAll('.image-name');
        const selectedImages = Array.from(imageItems).map(item => item.textContent.trim());
        
        console.log('Selected images from DOM:', selectedImages);
        
        if (selectedImages.length === 0) {
          alert('No images to download');
          return;
        }
        
        // Create CSV content
        const csvHeaders = ['Index', 'Image Name', 'Selection ID', 'Event Title', 'Event ID', 'Username'];
        const csvRows = selectedImages.map((imageName, index) => {
          return [
            index + 1,
            `"${imageName.replace(/"/g, '""')}"`,
            `"${selectionData.selectionId}"`,
            `"${selectionData.eventTitle}"`,
            `"${selectionData.eventId}"`,
            `"${selectionData.username}"`
          ];
        });
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\n');
        
        console.log('CSV content generated:', csvContent);
        
        // Format date for filename
        const date = new Date(selectionData.createdAt);
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create filename: username_eventTitle_date.csv
        const cleanEventTitle = selectionData.eventTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `${selectionData.username}_${cleanEventTitle}_${formattedDate}.csv`;
        console.log('Filename:', filename);
        
        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('CSV download completed successfully');
        
      } catch (error) {
        console.error('Error downloading CSV:', error);
        alert('Error downloading CSV: ' + error.message);
      }
    });
  } else {
    console.log('Download CSV button not found');
  }

  // Handle blocked status toggle
  if (toggleBlockedBtn) {
    toggleBlockedBtn.addEventListener('click', async () => {
      console.log('Toggle blocked button clicked');
      
      try {
        const selectionId = toggleBlockedBtn.dataset.selectionId;
        const currentBlocked = toggleBlockedBtn.dataset.currentBlocked === 'true';
        const newBlocked = !currentBlocked;
        
        console.log('Toggle blocked:', { selectionId, currentBlocked, newBlocked });
        
        // Disable button and show loading state
        toggleBlockedBtn.disabled = true;
        toggleBlockedBtn.textContent = 'Updating...';
        
        const response = await fetch(`/api/selections/${selectionId}/toggle-blocked`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocked: newBlocked
          }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to update blocked status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Toggle blocked result:', result);
        
        // Update the UI
        const blockedBadge = document.getElementById('blockedBadge');
        
        if (newBlocked) {
          blockedBadge.className = 'badge badge-danger';
          blockedBadge.textContent = 'true';
          toggleBlockedBtn.textContent = 'Unblock Selection';
        } else {
          blockedBadge.className = 'badge badge-success';
          blockedBadge.textContent = 'false';
          toggleBlockedBtn.textContent = 'Block Selection';
        }
        
        // Update the data attribute
        toggleBlockedBtn.dataset.currentBlocked = newBlocked.toString();
        
        console.log('Blocked status updated successfully');
        
      } catch (error) {
        console.error('Error toggling blocked status:', error);
        alert('Error updating blocked status: ' + error.message);
      } finally {
        toggleBlockedBtn.disabled = false;
      }
    });
  } else {
    console.log('Toggle blocked button not found');
  }
});