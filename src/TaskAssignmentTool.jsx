import React, { useState, useCallback, useRef } from 'react';
import { Users, Target, TrendingUp, Activity, AlertCircle, Upload, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';

const assignAuto = (members, tierConfig, setAssignments) => {
    let assignments = {};
    let assignedMemberIds = new Set();
    let memberOrder = [...members]; // clone

    // จัดลำดับ tier ตาม maxGP จากมากไปน้อย (จะได้เติมที่ว่างเยอะก่อน)
    const tierEntries = Object.entries(tierConfig).sort((a, b) => b[1].maxGP - a[1].maxGP);

    // วน assign จนกว่าสมาชิกจะครบทุกคน
    for (let round = 0; round < memberOrder.length; round++) {
        for (let t = 0; t < tierEntries.length; t++) {
            const [tierId, config] = tierEntries[t];
            if (!assignments[tierId]) assignments[tierId] = {};
            // หา member ที่ยังไม่ได้ assign
            const member = memberOrder[round];
            if (!member || assignedMemberIds.has(member.id)) continue;

            // enhancement สลับวน 1,2,3,...
            const enhancementCount = Math.floor(Math.random() * 3) + 0;
            const memberGP = config.liberation + (enhancementCount * config.enhancement);

            // รวม GP ใน tier นี้
            let currentGP = 0;
            Object.values(assignments[tierId]).forEach(a => {
                currentGP += (a.liberation * config.liberation) + (a.enhancement * config.enhancement);
            });

            if (currentGP + memberGP <= config.maxGP) {
                assignments[tierId][member.id] = { liberation: 1, enhancement: enhancementCount };
                assignedMemberIds.add(member.id);
            }
            // ถ้า assign ครบทุกคนแล้ว ให้ออกจากลูป
            if (assignedMemberIds.size === members.length) break;
        }
        if (assignedMemberIds.size === members.length) break;
    }

    // กรณี tier ยังเหลือ GP เติมต่อ (ใครจะได้หลาย tier ก็ได้)
    for (let t = 0; t < tierEntries.length; t++) {
        const [tierId, config] = tierEntries[t];
        let currentGP = 0;
        Object.values(assignments[tierId] || {}).forEach(a => {
            currentGP += (a.liberation * config.liberation) + (a.enhancement * config.enhancement);
        });
        let enhLoop = 1;
        for (let m = 0; m < members.length; m++) {
            const member = members[m];
            if (assignments[tierId] && assignments[tierId][member.id]) continue; // ข้ามคนที่ assign ไปแล้ว
            const enhancementCount = enhLoop;
            const memberGP = config.liberation + (enhancementCount * config.enhancement);
            if (currentGP + memberGP > config.maxGP) break;
            if (!assignments[tierId]) assignments[tierId] = {};
            assignments[tierId][member.id] = { liberation: 1, enhancement: enhancementCount };
            currentGP += memberGP;
            enhLoop++;
            if (enhLoop > 3) enhLoop = 1;
        }
    }

    setAssignments(assignments);
};

const exportAssignments = (members, assignments, tierConfig) => {
    // สร้าง rows
    let rows = [["Name", "Tier", "Liberation", "Enhancement", "GP (This Tier)", "GP (Total)"]];
    // คำนวณ GP รวมต่อ member
    const memberGPMap = {};
    members.forEach(member => {
        let total = 0;
        Object.entries(assignments).forEach(([tierId, tierAssign]) => {
            if (tierAssign[member.id]) {
                const conf = tierConfig[tierId];
                const c = tierAssign[member.id];
                total += (c.liberation * conf.liberation) + (c.enhancement * conf.enhancement);
            }
        });
        memberGPMap[member.id] = total;
    });

    Object.entries(assignments).forEach(([tierId, tierAssign]) => {
        Object.entries(tierAssign).forEach(([memberId, c]) => {
            const member = members.find(m => m.id.toString() === memberId.toString());
            if (!member) return;
            const conf = tierConfig[tierId];
            const tierGP = (c.liberation * conf.liberation) + (c.enhancement * conf.enhancement);
            rows.push([
                member.name,
                tierId,
                c.liberation,
                c.enhancement,
                tierGP,
                memberGPMap[member.id]
            ]);
        });
    });

    // แปลง array เป็น CSV string
    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};


const TaskAssignmentTool = () => {
    // Tier configuration
    const tierConfig = {
        1: { maxGP: 6750, liberation: 500, enhancement: 1250, color: 'blue' },
        2: { maxGP: 13250, liberation: 1250, enhancement: 2500, color: 'green' },
        3: { maxGP: 62500, liberation: 2500, enhancement: 5000, color: 'yellow' },
        4: { maxGP: 136500, liberation: 3500, enhancement: 7000, color: 'orange' },
        5: { maxGP: 200000, liberation: 5000, enhancement: 10000, color: 'red' }
    };

    // Initial sample members
    const [members, setMembers] = useState([
        { id: 1, name: 'Alice', avatar: '👤' },
        { id: 2, name: 'Bob', avatar: '👨' },
        { id: 3, name: 'Charlie', avatar: '👩' },
        { id: 4, name: 'David', avatar: '🧑' },
        { id: 5, name: 'Eve', avatar: '👱' }
    ]);

    // Track assignments: { tierId: { memberId: { liberation: 1, enhancement: count } } }
    const [assignments, setAssignments] = useState({});
    const [draggedMember, setDraggedMember] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [collapsedTiers, setCollapsedTiers] = useState({});
    const fileInputRef = useRef(null);

    // Calculate current GP for a tier
    const calculateTierGP = (tierId) => {
        const tierAssignments = assignments[tierId] || {};
        let totalGP = 0;

        Object.entries(tierAssignments).forEach(([memberId, counts]) => {
            const config = tierConfig[tierId];
            totalGP += (counts.liberation * config.liberation) + (counts.enhancement * config.enhancement);
        });

        return totalGP;
    };

    // Calculate member's total GP usage
    const calculateMemberGP = (memberId) => {
        let totalGP = 0;
        const memberTasks = [];

        Object.entries(assignments).forEach(([tierId, tierAssignments]) => {
            if (tierAssignments[memberId]) {
                const config = tierConfig[tierId];
                const counts = tierAssignments[memberId];
                const gpUsed = (counts.liberation * config.liberation) + (counts.enhancement * config.enhancement);
                totalGP += gpUsed;
                memberTasks.push({
                    tier: tierId,
                    liberation: counts.liberation,
                    enhancement: counts.enhancement,
                    gp: gpUsed
                });
            }
        });

        return { totalGP, tasks: memberTasks };
    };

    // Handle CSV upload
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const newMembers = results.data
                        .filter(row => row.name || row.Name) // Filter out empty rows
                        .map((row, index) => ({
                            id: Date.now() + index, // Generate unique IDs
                            name: row.name || row.Name || `Member ${index + 1}`,
                            avatar: row.avatar || row.Avatar || '👤'
                        }));

                    if (newMembers.length > 0) {
                        setMembers(prevMembers => [...prevMembers, ...newMembers]);
                    }
                },
                error: (error) => {
                    console.error('CSV parsing error:', error);
                    alert('Error parsing CSV file. Please check the format.');
                }
            });
        }
        // Reset file input
        event.target.value = '';
    };

    // Clear all members
    const clearMembers = () => {
        if (window.confirm('Are you sure you want to clear all members? This will also clear all assignments.')) {
            setMembers([]);
            setAssignments({});
        }
    };

    // Handle drag events
    const handleDragStart = (e, member) => {
        setDraggedMember(member);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, tierId) => {
        e.preventDefault();
        if (draggedMember) {
            setSelectedTier(tierId);
            setSelectedMember(draggedMember);
        }
    };

    // Handle assignment
    const handleAssign = (enhancementCount) => {
        if (!selectedTier || !selectedMember) return;

        setAssignments(prev => ({
            ...prev,
            [selectedTier]: {
                ...prev[selectedTier],
                [selectedMember.id]: {
                    liberation: 1,
                    enhancement: enhancementCount
                }
            }
        }));

        setSelectedTier(null);
        setSelectedMember(null);
    };

    // Remove assignment
    const removeAssignment = (tierId, memberId) => {
        setAssignments(prev => {
            const newAssignments = { ...prev };
            if (newAssignments[tierId]) {
                delete newAssignments[tierId][memberId];
                if (Object.keys(newAssignments[tierId]).length === 0) {
                    delete newAssignments[tierId];
                }
            }
            return newAssignments;
        });
    };

    // Toggle tier collapse
    const toggleTierCollapse = (tierId) => {
        setCollapsedTiers(prev => ({
            ...prev,
            [tierId]: !prev[tierId]
        }));
    };

    // Generate sample CSV
    const generateSampleCSV = () => {
        const csvContent = "name,avatar\nJohn,🧑\nJane,👩\nMike,👨\nSarah,👱\nTom,🧔";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_members.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Target className="text-purple-400" />
                        Guild Task Assignment Tool
                    </h1>
                    <p className="text-gray-400">Assign members to tiers and manage GP allocation</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Members */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Users className="text-blue-400" />
                                    Guild Members
                                </h2>
                                <span className="text-sm text-gray-400">
                                    ({members.length} members)
                                </span>
                            </div>

                            {/* Member Management Buttons */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload size={16} />
                                    Upload CSV
                                </button>
                                <button
                                    onClick={clearMembers}
                                    className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Clear All
                                </button>
                            </div>

                            <button
                                onClick={generateSampleCSV}
                                className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
                            >
                                <FileText size={16} />
                                Download Sample CSV
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => assignAuto(members, tierConfig, setAssignments)}
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
                                        return (
                                            <div
                                                key={member.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, member)}
                                                className="bg-gray-700 p-3 rounded cursor-move hover:bg-gray-600 transition-colors border border-gray-600"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
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
                            <p className="text-sm text-gray-400 mt-4">
                                Drag members to assign them to tiers
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                CSV format: name,avatar (optional)
                            </p>
                        </div>
                    </div>

                    {/* Middle Panel - Tiers */}
                    <div className="lg:col-span-1">
                        <div className="space-y-4">
                            {Object.entries(tierConfig).map(([tierId, config]) => {
                                const currentGP = calculateTierGP(tierId);
                                const percentage = (currentGP / config.maxGP) * 100;
                                const isOverBudget = currentGP > config.maxGP;

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
                    </div>

                    {/* Right Panel - Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="text-green-400" />
                                Member Summary
                            </h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                        <button
                            onClick={() => exportAssignments(members, assignments, tierConfig)}
                            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
                        >
                            <FileText size={16} />
                            Export Assignment Report
                        </button>
                    </div>

                </div>

                {/* Assignment Modal */}
                {selectedTier && selectedMember && (
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
                                onClick={() => {
                                    setSelectedTier(null);
                                    setSelectedMember(null);
                                }}
                                className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskAssignmentTool;