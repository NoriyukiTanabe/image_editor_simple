import React, { useState } from 'react';
import { Type, Palette, Move } from 'lucide-react';

interface TextToolProps {
  onSettingsChange: (settings: {
    fontSize: number;
    textColor: string;
    fontFamily: string;
  }) => void;
}

const TextTool: React.FC<TextToolProps> = ({ onSettingsChange }) => {
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
  ];

  // Update settings whenever they change
  React.useEffect(() => {
    onSettingsChange({
      fontSize,
      textColor,
      fontFamily,
    });
  }, [fontSize, textColor, fontFamily, onSettingsChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Type className="w-5 h-5 mr-2" />
        Text Tool
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Palette className="w-4 h-4 mr-1" />
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-600 font-mono">{textColor}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Move className="w-4 h-4 mr-2" />
            Click on the canvas to add text
          </div>
        </div>

        {/* Text Preview */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <span
              style={{
                fontSize: `${Math.min(fontSize, 24)}px`,
                color: textColor,
                fontFamily: fontFamily,
              }}
            >
              Sample Text
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTool;