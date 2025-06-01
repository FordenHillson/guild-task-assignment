import React from 'react';

const BulkAssignModal = ({ 
  showBulkModal,
  selectedMembers,
  bulkAssignTier, 
  tierConfig, 
  handleBulkAssign,
  onClose
}) => {
  if (!showBulkModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">
          Bulk Assign {selectedMembers.length} Member(s) to Tier {bulkAssignTier}
        </h3>
        <div className="bg-purple-800 p-3 rounded mb-4">
          <p className="text-sm">Selected Members:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedMembers.slice(0, 5).map(member => (
              <span key={member.id} className="bg-purple-700 rounded px-2 py-1 text-xs">
                {member.avatar} {member.name}
              </span>
            ))}
            {selectedMembers.length > 5 && (
              <span className="bg-purple-700 rounded px-2 py-1 text-xs">
                +{selectedMembers.length - 5} more
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded mb-4">
          <p className="text-sm text-gray-400 mb-1">
            Liberation: <span className="text-white font-semibold">1 time (default)</span>
          </p>
          <p className="text-sm text-purple-400">
            Cost: {tierConfig[bulkAssignTier].liberation} GP × {selectedMembers.length} members
          </p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Enhancement Count:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map(count => {
              const libGP = tierConfig[bulkAssignTier].liberation;
              const enhGP = count * tierConfig[bulkAssignTier].enhancement;
              const totalGP = libGP + enhGP;
              const totalForAllMembers = totalGP * selectedMembers.length;
              return (
                <button
                  key={count}
                  onClick={() => handleBulkAssign(count)}
                  className="bg-purple-600 hover:bg-purple-700 p-3 rounded text-center transition-colors"
                >
                  <div className="font-semibold text-lg mb-1">{count}</div>
                  <div className="text-xs space-y-1">
                    <div className="text-purple-200">Per member: {totalGP.toLocaleString()}</div>
                    <div className="text-white font-semibold border-t border-purple-500 pt-1">
                      Total: {totalForAllMembers.toLocaleString()}
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

export default BulkAssignModal;
