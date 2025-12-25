
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    const validTypes = ['application/pdf', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'];
    if (validTypes.includes(file.type)) {
      onUpload(file);
    } else {
      alert("Please upload a valid PDF or Audio file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,audio/*"
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full">
            <i className="fas fa-cloud-upload-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Upload Lecture Materials
          </h3>
          <p className="text-gray-500 max-w-sm px-4">
            Drag and drop your lecture PDF or audio recording here, or click to browse.
          </p>
          <div className="mt-4 flex gap-4 justify-center text-xs font-medium uppercase tracking-wider text-gray-400">
            <span><i className="fas fa-file-pdf mr-1"></i> PDF</span>
            <span><i className="fas fa-microphone mr-1"></i> MP3 / WAV</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
