import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Crop, Type, Square, Circle, Minus, ImageIcon, FileImage, MousePointer2, RefreshCw } from 'lucide-react';
import Canvas, { PastedCrop } from './Canvas';
import Toolbar from './Toolbar';
import CropPanel from './CropPanel';
import TextTool from './TextTool';
import ShapeTool from './ShapeTool';
import UploadProgress from './UploadProgress';

export interface CropData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
}

export interface Tool {
  type: 'select' | 'crop' | 'text' | 'shape';
  subType?: 'rectangle' | 'circle' | 'line';
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string;
}

interface ShapeSettings {
  strokeColor: string;
  strokeWidth: number;
  fillShape: boolean;
}

interface TextSettings {
  fontSize: number;
  textColor: string;
  fontFamily: string;
}

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>({ type: 'select' });
  const [crops, setCrops] = useState<CropData[]>([]);
  const [pastedCrops, setPastedCrops] = useState<PastedCrop[]>([]);
  const [showCropPanel, setShowCropPanel] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  const [showShapeTool, setShowShapeTool] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileName: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [shapeSettings, setShapeSettings] = useState<ShapeSettings>({
    strokeColor: '#000000',
    strokeWidth: 2,
    fillShape: false,
  });
  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 20,
    textColor: '#000000',
    fontFamily: 'Arial',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const simulateUploadProgress = useCallback((file: File, onComplete: (result: string) => void) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      fileName: file.name
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      onComplete(e.target?.result as string);
    };

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20%
      
      if (progress >= 100) {
        progress = 100;
        setUploadState(prev => ({ ...prev, progress }));
        
        setTimeout(() => {
          reader.readAsDataURL(file);
          clearInterval(interval);
        }, 300);
      } else {
        setUploadState(prev => ({ ...prev, progress }));
      }
    }, 100);
  }, []);

  const handleImageUpload = useCallback((file: File, isReplace = false) => {
    simulateUploadProgress(file, (result) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setActiveTool({ type: 'select' });
        
        // Only clear pasted crops when replacing, keep crops list
        if (isReplace) {
          setPastedCrops([]);
        }
        
        setUploadState({
          isUploading: false,
          progress: 0,
          fileName: ''
        });
      };
      img.src = result;
    });
  }, [simulateUploadProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      const isReplace = !!image; // If there's already an image, this is a replace
      handleImageUpload(imageFile, isReplace);
    }
  }, [handleImageUpload, image]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleReplaceFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, true);
    }
  }, [handleImageUpload]);

  const handleReplaceImage = useCallback(() => {
    replaceFileInputRef.current?.click();
  }, []);

  const handleToolSelect = useCallback((tool: Tool) => {
    setActiveTool(tool);
    setShowCropPanel(tool.type === 'crop');
    setShowTextTool(tool.type === 'text');
    setShowShapeTool(tool.type === 'shape');
  }, []);

  const handleCropSave = useCallback((cropData: CropData) => {
    setCrops(prev => [...prev, cropData]);
  }, []);

  const handleCropDelete = useCallback((cropId: string) => {
    setCrops(prev => prev.filter(crop => crop.id !== cropId));
  }, []);

  const handleCropPaste = useCallback((crop: CropData) => {
    const newPastedCrop: PastedCrop = {
      id: `pasted-${Date.now()}`,
      x: 50, // Default position
      y: 50,
      width: crop.width,
      height: crop.height,
      imageData: crop.imageData,
    };
    setPastedCrops(prev => [...prev, newPastedCrop]);
    
    // Switch to select tool to allow immediate manipulation
    setActiveTool({ type: 'select' });
    setShowCropPanel(false);
    setShowTextTool(false);
    setShowShapeTool(false);
  }, []);

  const handlePastedCropsChange = useCallback((crops: PastedCrop[]) => {
    setPastedCrops(crops);
  }, []);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setCrops([]);
    setPastedCrops([]);
    setActiveTool({ type: 'select' });
    setShowCropPanel(false);
    setShowTextTool(false);
    setShowShapeTool(false);
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: ''
    });
  }, []);

  const handleShapeSettingsChange = useCallback((settings: ShapeSettings) => {
    setShapeSettings(settings);
  }, []);

  const handleTextSettingsChange = useCallback((settings: TextSettings) => {
    setTextSettings(settings);
  }, []);

  if (uploadState.isUploading) {
    return (
      <div className="max-w-4xl mx-auto">
        <UploadProgress 
          progress={uploadState.progress}
          fileName={uploadState.fileName}
        />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Icon Animation */}
            <div className={`mx-auto mb-6 transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
              {isDragOver ? (
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <FileImage className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-10 h-10 text-blue-600" />
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${
                isDragOver ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {isDragOver ? 'Drop your image here!' : 'Upload an Image'}
              </h3>
              
              <div className="space-y-2">
                <p className={`text-lg transition-colors duration-300 ${
                  isDragOver ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {isDragOver 
                    ? 'Release to start editing' 
                    : 'Drag and drop your image here, or click to browse'
                  }
                </p>
                
                {!isDragOver && (
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MousePointer2 className="w-4 h-4" />
                      <span>Click to browse</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    <div className="flex items-center space-x-1">
                      <Upload className="w-4 h-4" />
                      <span>Drag & drop</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Supported Formats */}
            {!isDragOver && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Supported formats:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['JPG', 'PNG', 'GIF', 'WebP', 'SVG'].map((format) => (
                    <span 
                      key={format}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`
                  inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform
                  ${isDragOver 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-md hover:shadow-lg'
                  }
                `}
              >
                <Upload className="w-6 h-6 mr-3" />
                {isDragOver ? 'Drop Now!' : 'Choose File'}
              </button>
            </div>
          </div>

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/10 rounded-xl border-2 border-blue-500 border-dashed animate-pulse" />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Main Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReplaceImage}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              title="Replace current image with a new one"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Replace Image
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Canvas Area with Replace Drop Zone */}
        <div className="flex-1">
          <Canvas
            ref={canvasRef}
            image={image}
            activeTool={activeTool}
            onCropSave={handleCropSave}
            shapeSettings={shapeSettings}
            textSettings={textSettings}
            pastedCrops={pastedCrops}
            onPastedCropsChange={handlePastedCropsChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            isDragOver={isDragOver}
          />
        </div>

        {/* Side Panels */}
        <div className="w-80 space-y-4">
          {showCropPanel && (
            <CropPanel 
              crops={crops} 
              onCropDelete={handleCropDelete}
              onCropPaste={handleCropPaste}
            />
          )}
          {showTextTool && (
            <TextTool onSettingsChange={handleTextSettingsChange} />
          )}
          {showShapeTool && (
            <ShapeTool 
              activeTool={activeTool} 
              onToolSelect={handleToolSelect}
              onSettingsChange={handleShapeSettingsChange}
            />
          )}
        </div>
      </div>

      {/* Hidden file input for replace functionality */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageEditor;