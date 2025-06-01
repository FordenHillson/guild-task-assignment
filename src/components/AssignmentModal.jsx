import React from 'react';

const AssignmentModal = ({ selectedTier, selectedMember, tierConfig, handleAssign, onClose }) => {
  if (!selectedTier || !selectedMember) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">
          Assign {selectedMember.name} to Tier {selectedTier}
        </h3>
        <div className="bg-gray-700 p-3 rounded mb-4">
          <p className="text-sm text-gray-400 mb-1">
            Liberation: <span className="text-white font-semibold">1 time (default)</span>
          </p>
          <p className="text-sm text-purple-400">
            Cost: {tierConfig[selectedTier].liberation} GP
          </p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Enhancement Count:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map(count => {
              const libGP = tierConfig[selectedTier].liberation;
              const enhGP = count * tierConfig[selectedTier].enhancement;
              const totalGP = libGP + enhGP;
              return (
                <button
                  key={count}
                  onClick={() => handleAssign(count)}
                  className="bg-purple-600 hover:bg-purple-700 p-3 rounded text-center transition-colors"
                >
                  <div className="font-semibold text-lg mb-1">{count}</div>
                  <div className="text-xs space-y-1">
                    <div className="text-purple-200">Lib: {libGP.toLocaleString()}</div>
                    <div className="text-purple-200">Enh: {enhGP.toLocaleString()}</div>
                    <div className="text-white font-semibold border-t border-purple-500 pt-1">
                      Total: {totalGP.toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AssignmentModal;
