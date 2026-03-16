import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const PdfDownloadButton = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="btn-primary-premium group"
    >
      <div className="btn-shimmer"></div>
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
};

export default PdfDownloadButton;