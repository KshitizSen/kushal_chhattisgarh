/**
 * Export utilities for generating PDF and Excel reports
 */

export const generatePDF = (data, filename) => {
  try {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateExcel = (data, filename) => {
  try {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const exportToCSV = (data, headers, filename) => {
  try {
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header.key] || '';
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const prepareAttendanceDataForExport = (records, teacherName) => {
  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'status', label: 'Status' },
    { key: 'workHours', label: 'Work Hours' },
  ];

  const data = records.map((record) => ({
    date: record.date,
    checkIn: record.checkIn || '--:--',
    checkOut: record.checkOut || '--:--',
    status: record.status,
    workHours: record.workHours || '--',
  }));

  return { headers, data, filename: `${teacherName}_attendance_report.csv` };
};

export const downloadFile = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
