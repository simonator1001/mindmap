import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../types';

function CustomNode({ data, selected }: NodeProps<NodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditing(false);
    if (label !== data.label) {
      data.label = label;
    }
  }, [data, label]);

  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(evt.target.value);
  }, []);

  const onKeyDown = useCallback((evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      evt.currentTarget.blur();
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!selected) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            data.image = event.target.result as string;
            setLabel(label); // Force re-render
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  }, [selected, data, label]);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      node.addEventListener('paste', handlePaste);
      return () => {
        node.removeEventListener('paste', handlePaste);
      };
    }
  }, [handlePaste]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  const getShapeClass = () => {
    switch (data.shape) {
      case 'circle':
        return 'rounded-full aspect-square';
      case 'diamond':
        return 'rotate-45';
      case 'hexagon':
        return 'hexagon';
      default:
        return 'rounded-lg';
    }
  };

  const getSizeStyles = (size?: string) => {
    switch (size) {
      case 'large':
        return {
          minWidth: '200px',
          minHeight: '80px',
          fontSize: '1.125rem',
          padding: '12px 24px',
        };
      case 'medium':
        return {
          minWidth: '150px',
          minHeight: '60px',
          fontSize: '0.875rem',
          padding: '8px 16px',
        };
      case 'small':
        return {
          minWidth: '100px',
          minHeight: '40px',
          fontSize: '0.75rem',
          padding: '4px 8px',
        };
      default:
        return getSizeStyles('medium');
    }
  };

  const sizeStyles = getSizeStyles(data.size);

  return (
    <div 
      ref={nodeRef}
      className={`shadow-lg border-2 ${getShapeClass()} ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      style={{ 
        ...sizeStyles,
        backgroundColor: data.backgroundColor || 'white',
        color: data.textColor || 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      onDoubleClick={onDoubleClick}
      tabIndex={0}
    >
      <Handle 
        type="target" 
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />
      <div className={`p-2 ${data.shape === 'diamond' ? '-rotate-45' : ''} flex flex-col items-center gap-2`}>
        {data.image && (
          <img 
            src={data.image} 
            alt=""
            className="w-20 h-20 object-cover rounded"
            style={{
              transform: data.shape === 'diamond' ? 'rotate(45deg)' : 'none'
            }}
          />
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:border-blue-500"
            style={{ fontSize: sizeStyles.fontSize }}
          />
        ) : (
          <div className="font-medium text-center" style={{ fontSize: sizeStyles.fontSize }}>
            {label}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(CustomNode);