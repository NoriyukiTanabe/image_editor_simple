import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { Tool, CropData } from './ImageEditor';
import { RefreshCw } from 'lucide-react';

interface CanvasProps {
  image: HTMLImageElement;
  activeTool: Tool;
  onCropSave: (cropData: CropData) => void;
  shapeSettings?: {
    strokeColor: string;
    strokeWidth: number;
    fillShape: boolean;
  };
  textSettings?: {
    fontSize: number;
    textColor: string;
    fontFamily: string;
  };
  pastedCrops?: PastedCrop[];
  onPastedCropsChange?: (crops: PastedCrop[]) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

interface CropSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isSelecting: boolean;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
}

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
  fill?: boolean;
}

export interface PastedCrop {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
  image?: HTMLImageElement;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ 
    image, 
    activeTool, 
    onCropSave, 
    shapeSettings, 
    textSettings, 
    pastedCrops = [], 
    onPastedCropsChange,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave,
    isDragOver = false
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [displaySize, setDisplaySize] = useState({ width: 800, height: 600 });
    const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Calculate canvas size based on image
    useEffect(() => {
      if (image) {
        const maxWidth = 800;
        const maxHeight = 600;
        const aspectRatio = image.width / image.height;

        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        const finalWidth = Math.round(width);
        const finalHeight = Math.round(height);

        setCanvasSize({ width: finalWidth, height: finalHeight });
        
        // Calculate display size considering max viewport constraints
        const containerWidth = containerRef.current?.clientWidth || 800;
        const maxDisplayWidth = Math.min(containerWidth - 32, finalWidth); // 32px for padding
        
        if (finalWidth > maxDisplayWidth) {
          const scale = maxDisplayWidth / finalWidth;
          setDisplaySize({
            width: maxDisplayWidth,
            height: Math.round(finalHeight * scale)
          });
        } else {
          setDisplaySize({ width: finalWidth, height: finalHeight });
        }
      }
    }, [image]);

    // Update display size on window resize
    useEffect(() => {
      const handleResize = () => {
        if (image && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const maxDisplayWidth = Math.min(containerWidth - 32, canvasSize.width);
          
          if (canvasSize.width > maxDisplayWidth) {
            const scale = maxDisplayWidth / canvasSize.width;
            setDisplaySize({
              width: maxDisplayWidth,
              height: Math.round(canvasSize.height * scale)
            });
          } else {
            setDisplaySize({ width: canvasSize.width, height: canvasSize.height });
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [image, canvasSize]);

    // Load pasted crop images
    useEffect(() => {
      pastedCrops.forEach(crop => {
        if (!crop.image) {
          const img = new Image();
          img.onload = () => {
            crop.image = img;
            drawCanvas();
          };
          img.src = crop.imageData;
        }
      });
    }, [pastedCrops]);

    // Draw canvas content
    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !image) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw main image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw pasted crops
      pastedCrops.forEach(crop => {
        if (crop.image) {
          ctx.drawImage(crop.image, crop.x, crop.y, crop.width, crop.height);
          
          // Draw selection border if this crop is selected
          if (selectedCrop === crop.id) {
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(crop.x - 2, crop.y - 2, crop.width + 4, crop.height + 4);
            ctx.setLineDash([]);
            
            // Draw resize handles
            const handleSize = 8;
            const handles = [
              { x: crop.x - handleSize/2, y: crop.y - handleSize/2 }, // top-left
              { x: crop.x + crop.width - handleSize/2, y: crop.y - handleSize/2 }, // top-right
              { x: crop.x - handleSize/2, y: crop.y + crop.height - handleSize/2 }, // bottom-left
              { x: crop.x + crop.width - handleSize/2, y: crop.y + crop.height - handleSize/2 }, // bottom-right
            ];
            
            ctx.fillStyle = '#3B82F6';
            handles.forEach(handle => {
              ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            });
          }
        }
      });

      // Draw shapes
      shapeElements.forEach(shape => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.lineWidth;
        ctx.beginPath();

        switch (shape.type) {
          case 'rectangle':
            const width = shape.endX - shape.startX;
            const height = shape.endY - shape.startY;
            ctx.rect(shape.startX, shape.startY, width, height);
            if (shape.fill) {
              ctx.fillStyle = shape.color;
              ctx.fill();
            }
            break;
          case 'circle':
            const centerX = (shape.startX + shape.endX) / 2;
            const centerY = (shape.startY + shape.endY) / 2;
            const radius = Math.abs(shape.endX - shape.startX) / 2;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            if (shape.fill) {
              ctx.fillStyle = shape.color;
              ctx.fill();
            }
            break;
          case 'line':
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            break;
        }
        ctx.stroke();
      });

      // Draw text elements
      textElements.forEach(textEl => {
        ctx.font = `${textEl.fontSize}px ${textEl.font}`;
        ctx.fillStyle = textEl.color;
        ctx.fillText(textEl.text, textEl.x, textEl.y);
      });

      // Draw crop selection
      if (cropSelection && cropSelection.isSelecting) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const width = cropSelection.endX - cropSelection.startX;
        const height = cropSelection.endY - cropSelection.startY;
        ctx.strokeRect(cropSelection.startX, cropSelection.startY, width, height);
        ctx.setLineDash([]);
      }
    }, [image, textElements, shapeElements, cropSelection, pastedCrops, selectedCrop]);

    // Redraw canvas when dependencies change
    useEffect(() => {
      drawCanvas();
    }, [drawCanvas]);

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const findCropAtPosition = (x: number, y: number): PastedCrop | null => {
      // Check from top to bottom (reverse order for proper layering)
      for (let i = pastedCrops.length - 1; i >= 0; i--) {
        const crop = pastedCrops[i];
        if (x >= crop.x && x <= crop.x + crop.width && 
            y >= crop.y && y <= crop.y + crop.height) {
          return crop;
        }
      }
      return null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoordinates(e);

      // Check if clicking on a pasted crop first
      const clickedCrop = findCropAtPosition(pos.x, pos.y);
      
      if (clickedCrop && activeTool.type === 'select') {
        setSelectedCrop(clickedCrop.id);
        setIsDragging(true);
        setDragOffset({
          x: pos.x - clickedCrop.x,
          y: pos.y - clickedCrop.y
        });
        return;
      }

      // Clear selection if clicking elsewhere
      if (activeTool.type === 'select') {
        setSelectedCrop(null);
      }

      if (activeTool.type === 'crop') {
        setCropSelection({
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          isSelecting: true,
        });
      } else if (activeTool.type === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          const newText: TextElement = {
            id: Date.now().toString(),
            x: pos.x,
            y: pos.y,
            text,
            fontSize: textSettings?.fontSize || 20,
            color: textSettings?.textColor || '#000000',
            font: textSettings?.fontFamily || 'Arial',
          };
          setTextElements(prev => [...prev, newText]);
        }
      } else if (activeTool.type === 'shape') {
        setIsDrawing(true);
        const newShape: ShapeElement = {
          id: Date.now().toString(),
          type: activeTool.subType || 'rectangle',
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          color: shapeSettings?.strokeColor || '#000000',
          lineWidth: shapeSettings?.strokeWidth || 2,
          fill: shapeSettings?.fillShape || false,
        };
        setShapeElements(prev => [...prev, newShape]);
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoordinates(e);

      if (isDragging && selectedCrop && onPastedCropsChange) {
        const updatedCrops = pastedCrops.map(crop => {
          if (crop.id === selectedCrop) {
            return {
              ...crop,
              x: pos.x - dragOffset.x,
              y: pos.y - dragOffset.y
            };
          }
          return crop;
        });
        onPastedCropsChange(updatedCrops);
      } else if (cropSelection && cropSelection.isSelecting) {
        setCropSelection(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null);
      } else if (isDrawing && activeTool.type === 'shape') {
        setShapeElements(prev => {
          const newShapes = [...prev];
          const lastShape = newShapes[newShapes.length - 1];
          if (lastShape) {
            lastShape.endX = pos.x;
            lastShape.endY = pos.y;
          }
          return newShapes;
        });
      }
    };

    const handleMouseUp = () => {
      if (cropSelection && cropSelection.isSelecting) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { startX, startY, endX, endY } = cropSelection;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);

        if (width > 10 && height > 10) {
          const imageData = ctx.getImageData(x, y, width, height);
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.putImageData(imageData, 0, 0);
            const cropData: CropData = {
              id: Date.now().toString(),
              x,
              y,
              width,
              height,
              imageData: tempCanvas.toDataURL(),
            };
            onCropSave(cropData);
          }
        }

        setCropSelection(null);
      }

      setIsDrawing(false);
      setIsDragging(false);
    };

    // Handle keyboard events for deleting selected crops
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedCrop && onPastedCropsChange) {
            const updatedCrops = pastedCrops.filter(crop => crop.id !== selectedCrop);
            onPastedCropsChange(updatedCrops);
            setSelectedCrop(null);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCrop, pastedCrops, onPastedCropsChange]);

    // Sync refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(canvasRef.current);
        } else {
          ref.current = canvasRef.current;
        }
      }
    }, [ref]);

    // Update cursor based on tool and hover state
    const getCursor = () => {
      if (activeTool.type === 'select') {
        return 'default';
      }
      return 'crosshair';
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
        <div 
          className="flex justify-center relative" 
          ref={containerRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border border-gray-300 rounded"
            style={{ 
              width: `${displaySize.width}px`,
              height: `${displaySize.height}px`,
              maxWidth: '100%',
              maxHeight: '70vh',
              cursor: getCursor()
            }}
          />
          
          {/* Replace Image Drop Overlay - Only over canvas */}
          {isDragOver && (
            <div className="absolute inset-4 bg-blue-500/20 backdrop-blur-sm rounded-lg border-2 border-blue-500 border-dashed flex items-center justify-center z-10">
              <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-blue-500 border-dashed animate-pulse">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-700 mb-1">Replace Image</h3>
                  <p className="text-blue-600 text-sm">Drop to replace the current image</p>
                  <p className="text-xs text-gray-500 mt-1">Crops will be preserved</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Canvas Info */}
        <div className="mt-3 text-center text-xs text-gray-500">
          Canvas: {canvasSize.width} × {canvasSize.height}px
          {displaySize.width !== canvasSize.width && (
            <span className="ml-2">
              (Display: {displaySize.width} × {displaySize.height}px)
            </span>
          )}
          {selectedCrop && (
            <span className="ml-2 text-blue-600">
              • Crop selected (Press Delete to remove)
            </span>
          )}
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;