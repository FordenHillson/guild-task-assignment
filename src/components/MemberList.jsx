import React from 'react';
import { Users, Upload, Trash2, FileText, TrendingUp, Loader } from 'lucide-react';

const MemberList = ({ 
  members, 
  selectedMembers, 
  fileInputRef, 
  calculateMemberGP,
  toggleMemberSelection, 
  selectAllMembers, 
  clearSelectedMembers,
  generateSampleCSV,
  startAutoAssignment,
  clearMembers,
  handleDragStart,
  isLoading
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="text-blue-400" />
          Guild Members
        </h2>
        <span className="text-sm text-gray-400">
          ({members.length} members)
        </span>
      </div>      {/* Member Management Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={`flex-1 bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>
        <button
          onClick={clearMembers}
          disabled={isLoading || members.length === 0}
          className={`flex-1 bg-red-600 hover:bg-red-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isLoading || members.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* Bulk Selection Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAllMembers}
          className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm font-medium transition-colors"
        >
          Select All
        </button>
        <button
          onClick={clearSelectedMembers}
          className="flex-1 bg-gray-600 hover:bg-gray-700 p-2 rounded text-sm font-medium transition-colors"
          disabled={selectedMembers.length === 0}
        >
          Clear Selection
        </button>
      </div>
      <button
        onClick={generateSampleCSV}
        className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <FileText size={16} />
        Download Sample CSV
      </button>

      <button
        onClick={startAutoAssignment}
        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <TrendingUp size={16} />
        Assign Auto
      </button>
      
      {/* Members List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {members.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users size={48} className="mx-auto mb-2 opacity-50" />
            <p>No members yet</p>
            <p className="text-sm">Upload a CSV to add members</p>
          </div>
        ) : (
          members.map(member => {
            const { totalGP } = calculateMemberGP(member.id);
            const isSelected = selectedMembers.some(m => m.id === member.id);
            return (
              <div
                key={member.id}
                draggable
                onDragStart={(e) => handleDragStart(e, member)}
                onClick={(e) => toggleMemberSelection(member, e)}
                className={`bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors border ${isSelected ? 'border-purple-500' : 'border-gray-600'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMemberSelection(member)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-2xl">{member.avatar}</span>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  {totalGP > 0 && (
                    <span className="text-sm text-purple-400 font-semibold">
                      {totalGP.toLocaleString()} GP
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {selectedMembers.length > 0 && (
        <div className="bg-purple-800 p-2 rounded my-4 flex justify-between items-center">
          <span className="text-sm font-medium">
            {selectedMembers.length} member(s) selected
          </span>
        </div>
      )}
      
      <p className="text-sm text-gray-400 mt-4">
        Drag members to assign them to tiers or select multiple for bulk assignment
      </p>
      <p className="text-xs text-gray-500 mt-2">
        CSV format: name,avatar (optional)
      </p>
    </div>
  );
};

export default MemberList;
