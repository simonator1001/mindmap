import { Node } from 'reactflow';
import { NodeData } from '../../types';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface NodeSettingsProps {
  selectedNodes: Node<NodeData>[];
  onUpdateNodes: (updates: Partial<NodeData>) => void;
}

const shapes = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
];

const sizes = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const colors = [
  { id: 'white', label: 'White', bg: 'white', text: 'black' },
  { id: 'blue', label: 'Blue', bg: '#93c5fd', text: 'black' },
  { id: 'green', label: 'Green', bg: '#86efac', text: 'black' },
  { id: 'yellow', label: 'Yellow', bg: '#fde047', text: 'black' },
  { id: 'red', label: 'Red', bg: '#fca5a5', text: 'black' },
  { id: 'purple', label: 'Purple', bg: '#d8b4fe', text: 'black' },
];

export default function NodeSettings({ selectedNodes, onUpdateNodes }: NodeSettingsProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateNodes({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onUpdateNodes({ image: undefined });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-64">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <div className="flex gap-2">
            <label className="flex-1">
              <div className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                <PhotoIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">Upload Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {selectedNodes[0]?.data?.image && (
              <button
                onClick={removeImage}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape
          </label>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => onUpdateNodes({ 
                  shape: shape.id as 'rectangle' | 'circle' | 'diamond' | 'hexagon' 
                })}
                className={`px-3 py-2 text-sm border rounded-md hover:bg-gray-50 ${
                  selectedNodes[0]?.data?.shape === shape.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => onUpdateNodes({ 
                  size: size.id as 'small' | 'medium' | 'large' 
                })}
                className={`px-3 py-2 text-sm border rounded-md hover:bg-gray-50 ${
                  selectedNodes[0]?.data?.size === size.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateNodes({ 
                  backgroundColor: color.bg,
                  textColor: color.text
                })}
                className={`w-full h-8 rounded-md border hover:opacity-80 ${
                  selectedNodes[0]?.data?.backgroundColor === color.bg ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color.bg }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}