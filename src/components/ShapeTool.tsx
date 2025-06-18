import React, { useState } from 'react';
import { Square, Circle, Minus, Palette } from 'lucide-react';
import { Tool } from './ImageEditor';

interface ShapeToolProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onSettingsChange: (settings: {
    strokeColor: string;
    strokeWidth: number;
    fillShape: boolean;
  }) => void;
}

const ShapeTool: React.FC<ShapeToolProps> = ({ activeTool, onToolSelect, onSettingsChange }) => {
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillShape, setFillShape] = useState(false);

  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'line', icon: Minus, label: 'Line' },
  ];

  // Update settings whenever they change
  React.useEffect(() => {
    onSettingsChange({
      strokeColor,
      strokeWidth,
      fillShape,
    });
  }, [strokeColor, strokeWidth, fillShape, onSettingsChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shape Tool</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => onToolSelect({ type: 'shape', subType: type as any })}
                className={`
                  flex flex-col items-center p-3 rounded-md border transition-colors duration-200
                  ${activeTool.subType === type
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stroke Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Palette className="w-4 h-4 mr-1" />
            Stroke Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-600 font-mono">{strokeColor}</span>
          </div>
        </div>

        {activeTool.subType !== 'line' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="fillShape"
              checked={fillShape}
              onChange={(e) => setFillShape(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="fillShape" className="text-sm font-medium text-gray-700">
              Fill shape
            </label>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Click and drag on the canvas to draw shapes
          </div>
        </div>

        {/* Color Preview */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div
              className="w-12 h-12 border-2 rounded"
              style={{
                borderColor: strokeColor,
                borderWidth: `${strokeWidth}px`,
                backgroundColor: fillShape ? strokeColor : 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeTool;