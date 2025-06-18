import React from 'react';
import { MousePointer, Crop, Type, Square, Circle, Minus } from 'lucide-react';
import { Tool } from './ImageEditor';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select', tool: { type: 'select' as const } },
    { id: 'crop', icon: Crop, label: 'Crop', tool: { type: 'crop' as const } },
    { id: 'text', icon: Type, label: 'Text', tool: { type: 'text' as const } },
    { id: 'rectangle', icon: Square, label: 'Rectangle', tool: { type: 'shape' as const, subType: 'rectangle' as const } },
    { id: 'circle', icon: Circle, label: 'Circle', tool: { type: 'shape' as const, subType: 'circle' as const } },
    { id: 'line', icon: Minus, label: 'Line', tool: { type: 'shape' as const, subType: 'line' as const } },
  ];

  const isActive = (tool: Tool) => {
    return activeTool.type === tool.type && activeTool.subType === tool.subType;
  };

  return (
    <div className="flex items-center space-x-2">
      {tools.map(({ id, icon: Icon, label, tool }) => (
        <button
          key={id}
          onClick={() => onToolSelect(tool)}
          className={`
            inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${isActive(tool)
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-100 border border-transparent'
            }
          `}
          title={label}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;