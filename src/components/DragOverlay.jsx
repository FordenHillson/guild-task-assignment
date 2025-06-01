import React from 'react';

const DragOverlay = ({ visible, type }) => {
  if (!visible) return null;

  const getStyle = () => {
    switch (type) {
      case 'member':
        return 'bg-blue-500 bg-opacity-20 border-blue-400';
      case 'tier':
        return 'bg-purple-500 bg-opacity-20 border-purple-400';
      default:
        return 'bg-gray-500 bg-opacity-20 border-gray-400';
    }
  };

  return (
    <div className={`absolute inset-0 rounded-lg border-2 border-dashed z-10 pointer-events-none ${getStyle()}`}>
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-semibold text-white bg-gray-800 bg-opacity-70 px-4 py-2 rounded-lg">
          Drop to {type === 'tier' ? 'assign' : 'select'}
        </p>
      </div>
    </div>
  );
};

export default DragOverlay;
