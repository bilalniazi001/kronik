import React, { useState } from 'react';
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import documentService from '../../services/documentService';
import { useAlert } from '../../hooks/useAlert';

const DocumentList = ({ documents, onDelete }) => {
  const [deleting, setDeleting] = useState(null);
  const { showSuccess, showError } = useAlert();

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    setDeleting(documentId);
    try {
      await documentService.deleteDocument(documentId);
      showSuccess('Document deleted successfully');
      onDelete(documentId);
    } catch (error) {
      showError(error.message || 'Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (documentId) => {
    documentService.downloadDocument(documentId);
  };

  const handleView = (documentId) => {
    window.open(documentService.getDocumentUrl(documentId), '_blank');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType?.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
            <div>
              <p className="font-medium text-gray-900">{doc.file_name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(doc.id)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="View"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDownload(doc.id)}
              className="p-1 text-green-600 hover:text-green-800"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
              title="Delete"
            >
              {deleting === doc.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
              ) : (
                <TrashIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;