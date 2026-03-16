export const formatters = {
  date: (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  time: (time) => {
    if (!time) return '-';
    return time;
  },

  datetime: (datetime) => {
    if (!datetime) return '-';
    const d = new Date(datetime);
    return d.toLocaleString();
  },

  relativeTime: (date) => {
    if (!date) return '-';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  phone: (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{4})(\d{7})/, '$1-$2');
  },

  cnic: (cnic) => {
    if (!cnic) return '-';
    return cnic.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3');
  },

  currency: (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  percentage: (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
};