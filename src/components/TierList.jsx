import React from 'react';
import { Activity, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const TierList = ({
  tierConfig,
  assignments,
  members,
  selectedMembers,
  collapsedTiers,
  calculateTierGP,
  handleDragOver,
  handleDrop,
  toggleTierCollapse,
  startBulkAssignment,
  clearTierAssignments,
  setEditingMember,
  removeAssignment
}) => {
  return (
    <div className="space-y-4">
      {Object.entries(tierConfig).map(([tierId, config]) => {
        const currentGP = calculateTierGP(tierId);
        const percentage = (currentGP / config.maxGP) * 100;
        const isOverBudget = currentGP > config.maxGP;
        const memberCount = assignments[tierId] ? Object.keys(assignments[tierId]).length : 0;

        return (
          <div
            key={tierId}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tierId)}
            className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity
                  style={{
                    color: {
                      1: '#60a5fa', // blue-400
                      2: '#4ade80', // green-400
                      3: '#facc15', // yellow-400
                      4: '#fb923c', // orange-400
                      5: '#f87171'  // red-400
                    }[tierId]
                  }}
                />
                Tier {tierId}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                  {currentGP.toLocaleString()} / {config.maxGP.toLocaleString()} GP
                </span>
                <button
                  onClick={() => toggleTierCollapse(tierId)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {collapsedTiers[tierId] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? '#ef4444' : {
                    1: '#3b82f6', // blue
                    2: '#10b981', // green
                    3: '#eab308', // yellow
                    4: '#f97316', // orange
                    5: '#ef4444'  // red
                  }[tierId]
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              {/* Bulk Assignment Button */}
              {selectedMembers.length > 0 && (
                <button
                  onClick={() => startBulkAssignment(tierId)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm font-medium transition-colors"
                >
                  Assign {selectedMembers.length} member(s)
                </button>
              )}

              {/* Clear Tier Button - only show if there are assignments */}
              {memberCount > 0 && (
                <button
                  onClick={() => clearTierAssignments(tierId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear Tier ({memberCount})
                </button>
              )}
            </div>

            {/* Show member count when collapsed */}
            {collapsedTiers[tierId] && assignments[tierId] && Object.keys(assignments[tierId]).length > 0 && (
              <div className="text-sm text-gray-400">
                {Object.keys(assignments[tierId]).length} members assigned
              </div>
            )}

            {/* Collapsible Content */}
            {!collapsedTiers[tierId] && (
              <>
                {isOverBudget && (
                  <div className="flex items-center gap-1 text-red-400 text-sm mb-2">
                    <AlertCircle size={16} />
                    <span>Over budget by {(currentGP - config.maxGP).toLocaleString()} GP</span>
                  </div>
                )}

                <div className="text-sm text-gray-400 mb-3">
                  <div>Liberation: {config.liberation} GP (default)</div>
                  <div>Enhancement: {config.enhancement} GP each</div>
                </div>

                {/* Assigned Members */}
                <div className="space-y-2">
                  {assignments[tierId] && Object.entries(assignments[tierId]).map(([memberId, counts]) => {
                    const member = members.find(m => m.id === parseInt(memberId));
                    if (!member) return null;
                    const gpUsed = (counts.liberation * config.liberation) + (counts.enhancement * config.enhancement);
                    return (
                      <div key={memberId} className="bg-gray-700 p-2 rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{member.avatar}</span>
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-gray-400">
                            (L: {counts.liberation}, E: {counts.enhancement})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-purple-400">{gpUsed.toLocaleString()} GP</span>
                          <button
                            onClick={() => setEditingMember({ tierId, member })}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => removeAssignment(tierId, memberId)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TierList;
