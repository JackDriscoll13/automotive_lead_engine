// Utility functions for the lead finder app
// Loading spinner
export const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="spinner"></div>
        </div>
    );
};

// Download CSV
export const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  export const downloadCSV = (data, filename) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('Invalid data for CSV download');
      return;
    }
  
    const csvContent = convertToCSV(data);
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


