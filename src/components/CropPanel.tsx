import React from 'react';
import { Trash2, Download, Copy } from 'lucide-react';
import { CropData } from './ImageEditor';
import { PastedCrop } from './Canvas';

interface CropPanelProps {
  crops: CropData[];
  onCropDelete: (cropId: string) => void;
  onCropPaste: (crop: CropData) => void;
}

const CropPanel: React.FC<CropPanelProps> = ({ crops, onCropDelete, onCropPaste }) => {
  const handleDownloadCrop = (crop: CropData) => {
    const link = document.createElement('a');
    link.download = `crop-${crop.id}.png`;
    link.href = crop.imageData;
    link.click();
  };

  const handlePasteCrop = (crop: CropData) => {
    onCropPaste(crop);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Crops</h3>
      
      {crops.length === 0 ? (
        <p className="text-gray-500 text-sm">No crops saved yet. Use the crop tool to create selections.</p>
      ) : (
        <div className="space-y-3">
          {crops.map((crop) => (
            <div key={crop.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <img
                src={crop.imageData}
                alt={`Crop ${crop.id}`}
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Crop {crop.id}
                </p>
                <p className="text-xs text-gray-500">
                  {crop.width} × {crop.height}px
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePasteCrop(crop)}
                  className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors duration-200"
                  title="Paste to canvas"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadCrop(crop)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  title="Download crop"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCropDelete(crop.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
                  title="Delete crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {crops.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click the copy icon to paste crops onto the canvas. Use the select tool to move them around.
          </p>
        </div>
      )}
    </div>
  );
};

export default CropPanel;