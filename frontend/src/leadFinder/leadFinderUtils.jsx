// Utility functions for the lead finder app
// Loading spinner
export const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="spinner"></div>
        </div>
    );
};

// Dowload CSV
// Dowload CSV
// Refactor these to a utils file
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

  export const downloadCSV = () => {
    if (!results) return;

    const csv = convertToCSV(results.results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    // Format the Results label (first word in location + _carwashes.csv) (special characters removed)
    function formatLabel(resultsLabel) {
      if (resultsLabel) {
        const firstWord = resultsLabel.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
        return `${firstWord}_carwashes.csv`;
      }
      return 'car_washes_carwashes.csv';
    }
    const fileLabel = formatLabel(resultsLabel);
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileLabel);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


