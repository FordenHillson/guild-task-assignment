import React from 'react';
import { TrendingUp, FileText, Upload, Loader } from 'lucide-react';

const MemberSummary = ({
  members,
  calculateMemberGP,
  exportAssignments,
  importFileInputRef,
  assignments,
  tierConfig,
  isImporting
}) => {
  return (
    <>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col h-[calc(100vh-12rem)]">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-400" />
          Member Summary
        </h2>
        <div className="space-y-4 overflow-y-auto flex-1">
          {members.map(member => {
            const { totalGP, tasks } = calculateMemberGP(member.id);
            if (tasks.length === 0) return null;

            return (
              <div key={member.id} className="bg-gray-700 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{member.avatar}</span>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    Total: {totalGP.toLocaleString()} GP
                  </span>
                </div>
                <div className="space-y-1">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="text-sm text-gray-300 pl-4">
                      • Tier {task.tier}: {task.gp.toLocaleString()} GP
                      <span className="text-gray-400 ml-1">
                        (L: {task.liberation}, E: {task.enhancement})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        {/* Export and Import Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => exportAssignments(members, assignments, tierConfig)}
          disabled={isImporting || Object.keys(assignments).length === 0}
          className={`flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isImporting || Object.keys(assignments).length === 0 ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <FileText size={16} />
          Export Report
        </button>
        <button
          onClick={() => importFileInputRef.current?.click()}
          disabled={isImporting}
          className={`flex-1 bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isImporting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isImporting ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {isImporting ? 'Importing...' : 'Import Assignments'}
        </button>
      </div>
    </>
  );
};

export default MemberSummary;
