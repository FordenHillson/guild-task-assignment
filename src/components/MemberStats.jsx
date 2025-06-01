import React, { useMemo } from 'react';
import { PieChart, BarChart, Users, TrendingUp } from 'lucide-react';

const MemberStats = ({ members, assignments, tierConfig, calculateMemberGP }) => {
  // Calculate statistics about GP distribution
  const stats = useMemo(() => {
    // Skip calculation if no data
    if (members.length === 0 || Object.keys(assignments).length === 0) {
      return {
        totalMembers: members.length,
        assignedMembers: 0,
        totalGP: 0,
        tierAssignments: {},
        averageGP: 0,
        maxGP: 0,
        minGP: 0,
        gpDistribution: []
      };
    }

    // Count members with assignments
    const memberGPs = members.map(member => {
      const { totalGP } = calculateMemberGP(member.id);
      return { member, totalGP };
    });
    
    const assignedMembers = memberGPs.filter(item => item.totalGP > 0);
    
    // Calculate total GP across all assignments
    const totalGP = assignedMembers.reduce((sum, item) => sum + item.totalGP, 0);
    
    // Calculate average, min, max GP
    const averageGP = assignedMembers.length > 0 
      ? Math.round(totalGP / assignedMembers.length) 
      : 0;
      
    const maxGP = assignedMembers.length > 0 
      ? Math.max(...assignedMembers.map(item => item.totalGP))
      : 0;
      
    const minGP = assignedMembers.length > 0 
      ? Math.min(...assignedMembers.map(item => item.totalGP).filter(gp => gp > 0))
      : 0;

    // Count assignments per tier
    const tierAssignments = {};
    Object.entries(assignments).forEach(([tierId, memberAssignments]) => {
      tierAssignments[tierId] = Object.keys(memberAssignments).length;
    });

    // Calculate GP distribution (for chart)
    // Group into ranges: 0-5k, 5k-10k, 10k-25k, 25k-50k, 50k+
    const ranges = [0, 5000, 10000, 25000, 50000, Infinity];
    const gpDistribution = Array(ranges.length - 1).fill(0);
    
    memberGPs.forEach(({ totalGP }) => {
      for (let i = 0; i < ranges.length - 1; i++) {
        if (totalGP > ranges[i] && totalGP <= ranges[i + 1]) {
          gpDistribution[i]++;
          break;
        }
      }
    });

    return {
      totalMembers: members.length,
      assignedMembers: assignedMembers.length,
      totalGP,
      tierAssignments,
      averageGP,
      maxGP,
      minGP,
      gpDistribution
    };
  }, [members, assignments, calculateMemberGP, tierConfig]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4 member-stats">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart className="text-purple-400" />
        Member Statistics
      </h2>

      {members.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Users size={48} className="mx-auto mb-2 opacity-50" />
          <p>No members yet</p>
          <p className="text-sm">Add members to see statistics</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Total Members</div>
              <div className="text-xl font-semibold">{stats.totalMembers}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Assigned Members</div>
              <div className="text-xl font-semibold">{stats.assignedMembers}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Total GP</div>
              <div className="text-xl font-semibold">{stats.totalGP.toLocaleString()}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Avg GP / Member</div>
              <div className="text-xl font-semibold">{stats.averageGP.toLocaleString()}</div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-400 mb-2">Members per Tier</div>
            {Object.keys(stats.tierAssignments).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.tierAssignments).map(([tierId, count]) => (
                  <div key={tierId} className="flex items-center">
                    <div className="w-20 text-sm">Tier {tierId}:</div>
                    <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (count / stats.totalMembers) * 100)}%`,
                          backgroundColor: {
                            1: '#3b82f6', // blue
                            2: '#10b981', // green
                            3: '#eab308', // yellow
                            4: '#f97316', // orange
                            5: '#ef4444'  // red
                          }[tierId] 
                        }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm ml-2">{count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-2">
                <p>No tier assignments yet</p>
              </div>
            )}
          </div>

          {/* GP Distribution */}
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-400 mb-2">GP Distribution</div>
            {stats.assignedMembers > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-20 text-sm">0-5k:</div>
                  <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-500" 
                      style={{ width: `${Math.min(100, (stats.gpDistribution[0] / stats.totalMembers) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{stats.gpDistribution[0]}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm">5k-10k:</div>
                  <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-500" 
                      style={{ width: `${Math.min(100, (stats.gpDistribution[1] / stats.totalMembers) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{stats.gpDistribution[1]}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm">10k-25k:</div>
                  <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-yellow-500" 
                      style={{ width: `${Math.min(100, (stats.gpDistribution[2] / stats.totalMembers) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{stats.gpDistribution[2]}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm">25k-50k:</div>
                  <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-orange-500" 
                      style={{ width: `${Math.min(100, (stats.gpDistribution[3] / stats.totalMembers) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{stats.gpDistribution[3]}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm">50k+:</div>
                  <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-red-500" 
                      style={{ width: `${Math.min(100, (stats.gpDistribution[4] / stats.totalMembers) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{stats.gpDistribution[4]}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-2">
                <p>No GP assigned yet</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Max GP</div>
              <div className="text-lg font-semibold">{stats.maxGP.toLocaleString()}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Min GP</div>
              <div className="text-lg font-semibold">{stats.minGP > 0 ? stats.minGP.toLocaleString() : 'N/A'}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-sm text-gray-400">Unassigned</div>
              <div className="text-lg font-semibold">{stats.totalMembers - stats.assignedMembers}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStats;
