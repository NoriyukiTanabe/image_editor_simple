import React from 'react';
import { Upload, FileImage, CheckCircle } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  fileName: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, fileName }) => {
  const isComplete = progress >= 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="mb-6">
          {isComplete ? (
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <FileImage className="w-8 h-8 text-blue-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isComplete ? 'Upload Complete!' : 'Uploading Image...'}
        </h3>

        {/* File Name */}
        <p className="text-sm text-gray-600 mb-6 truncate">
          {fileName}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isComplete 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ 
                width: `${progress}%`,
                transform: isComplete ? 'scale(1)' : 'scale(1.02)',
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-sm text-gray-500">
          {isComplete ? (
            <div className="flex items-center justify-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Ready to edit</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-1">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Processing image...</span>
            </div>
          )}
        </div>

        {/* Loading Animation */}
        {!isComplete && (
          <div className="mt-6">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;