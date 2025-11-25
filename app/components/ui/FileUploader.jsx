import React, { useState, useRef } from 'react';

const FileUploader = ({
  onFileSelect,
  acceptedFileTypes = '.csv, .xlsx, .xls',
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  label = 'Upload files',
  description = 'CSV, XLSX up to 5MB',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (!disabled) validateFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { validateFiles(Array.from(e.target.files)); fileInputRef.current.value = ''; };

  const validateFiles = (files) => {
    setError('');
    if (!multiple && files.length > 1) return setError('Select only one file');

    const validFiles = [];
    const errors = [];
    const types = acceptedFileTypes.split(',').map(t => t.trim().toLowerCase());

    files.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (file.size > maxSize) return errors.push(`${file.name} exceeds ${maxSize / 1024 / 1024}MB`);
      if (!types.includes(ext) && !types.includes('*')) return errors.push(`${file.name} is not supported`);
      validFiles.push(file);
    });

    if (errors.length) setError(errors.join(', '));
    if (validFiles.length) onFileSelect(multiple ? validFiles : validFiles[0]);
  };

  const handleClick = () => { if (fileInputRef.current && !disabled) fileInputRef.current.click(); };
  const formatSize = (bytes) => { if (bytes === 0) return '0 Bytes'; const k = 1024, sizes = ['Bytes','KB','MB','GB']; const i = Math.floor(Math.log(bytes)/Math.log(k)); return (bytes/Math.pow(k,i)).toFixed(2)+' '+sizes[i]; };

  return (
    <div className={className}>
      <input type="file" ref={fileInputRef} onChange={handleFileInput} accept={acceptedFileTypes} multiple={multiple} className="hidden" disabled={disabled}/>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${loading ? 'pointer-events-none' : ''}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center space-y-3">
            <svg className="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-500">Uploading...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-2">
              <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-sm text-black font-medium">{label}</div>
              <div className="text-sm text-gray-500">{description}</div>
              <div className="text-xs text-gray-400">Max size: {formatSize(maxSize)}</div>
            </div>
          </>
        )}
      </div>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  );
};

export default FileUploader;
