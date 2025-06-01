import React from 'react';

const EditEnhancementModal = ({ editingMember, tierConfig, setAssignments, onClose }) => {
  if (!editingMember) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">
          Edit Enhancement for {editingMember.member.name} (Tier {editingMember.tierId})
        </h3>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Enhancement Count:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map(count => {
              const libGP = tierConfig[editingMember.tierId].liberation;
              const enhGP = count * tierConfig[editingMember.tierId].enhancement;
              const totalGP = libGP + enhGP;
              return (
                <button
                  key={count}
                  onClick={() => {
                    setAssignments(prev => ({
                      ...prev,
                      [editingMember.tierId]: {
                        ...prev[editingMember.tierId],
                        [editingMember.member.id]: {
                          ...prev[editingMember.tierId][editingMember.member.id],
                          enhancement: count
                        }
                      }
                    }));
                    onClose();
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 p-3 rounded text-center transition-colors"
                >
                  <div className="font-semibold text-lg mb-1">{count}</div>
                  <div className="text-xs space-y-1">
                    <div className="text-yellow-200">Lib: {libGP.toLocaleString()}</div>
                    <div className="text-yellow-200">Enh: {enhGP.toLocaleString()}</div>
                    <div className="text-white font-semibold border-t border-yellow-500 pt-1">
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

export default EditEnhancementModal;
