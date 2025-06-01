import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

// Components
import MemberList from './components/MemberList';
import TierList from './components/TierList';
import MemberSummary from './components/MemberSummary';
import AssignmentModal from './components/AssignmentModal';
import EditEnhancementModal from './components/EditEnhancementModal';
import BulkAssignModal from './components/BulkAssignModal';

// Utils
import { assignAuto, exportAssignments, importAssignments, generateSampleCSV } from './utils/assignmentUtils';

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
    const [editingMember, setEditingMember] = useState(null); // { tierId, member }
    const fileInputRef = useRef(null);
    const importFileInputRef = useRef(null);

    // Add state for multi-select functionality
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [bulkAssignTier, setBulkAssignTier] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);

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

    // Toggle member selection for bulk assignment
    const toggleMemberSelection = (member, e) => {
        // If we're clicking on the checkbox directly, don't do anything
        // as the onChange handler of the checkbox will handle it
        if (e && e.target.type === 'checkbox') return;

        setSelectedMembers(prev => {
            const isSelected = prev.some(m => m.id === member.id);
            if (isSelected) {
                return prev.filter(m => m.id !== member.id);
            } else {
                return [...prev, member];
            }
        });
    };

    // Handle bulk assignment
    const handleBulkAssign = (enhancementCount) => {
        if (!bulkAssignTier || selectedMembers.length === 0) return;

        const updatedAssignments = { ...assignments };
        if (!updatedAssignments[bulkAssignTier]) {
            updatedAssignments[bulkAssignTier] = {};
        }

        selectedMembers.forEach(member => {
            updatedAssignments[bulkAssignTier][member.id] = {
                liberation: 1,
                enhancement: enhancementCount
            };
        });

        setAssignments(updatedAssignments);
        setBulkAssignTier(null);
        setShowBulkModal(false);
        setSelectedMembers([]);
    };

    // Start bulk assignment process
    const startBulkAssignment = (tierId) => {
        if (selectedMembers.length === 0) {
            alert("Please select members first");
            return;
        }

        setBulkAssignTier(tierId);
        setShowBulkModal(true);
    };

    // Select all members
    const selectAllMembers = () => {
        setSelectedMembers([...members]);
    };

    // Deselect all members
    const clearSelectedMembers = () => {
        setSelectedMembers([]);
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

    // Clear all assignments in a tier
    const clearTierAssignments = (tierId) => {
        if (window.confirm(`Are you sure you want to clear all assignments in Tier ${tierId}?`)) {
            setAssignments(prev => {
                const newAssignments = { ...prev };
                delete newAssignments[tierId];
                return newAssignments;
            });
        }
    };

    // Function to start auto assignment with confirmation
    const startAutoAssignment = () => {
        const confirmMessage =
            "⚠️ Automatic Assignment Warning ⚠️\n\n" +
            "- The system will randomly allocate Enhancements based on its algorithm\n" +
            "- The distribution may not have balanced GP spending\n" +
            "- Some members may be assigned to multiple Tiers\n\n" +
            "Do you want to continue?";

        if (window.confirm(confirmMessage)) {
            assignAuto(members, tierConfig, setAssignments);
        }
    };

    // Toggle tier collapse
    const toggleTierCollapse = (tierId) => {
        setCollapsedTiers(prev => ({
            ...prev,
            [tierId]: !prev[tierId]
        }));
    };

    // Handle import assignments
    const handleImportAssignments = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (window.confirm('Importing assignments will replace all current assignments. Continue?')) {
                importAssignments(file, members, tierConfig, setAssignments);
            }
        }
        // Reset file input
        event.target.value = '';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <img src="https://www.lotkeys.com/uploads/urunler/maplestorymlogolotkeys-yMU3.png.webp" 
                        alt="MapleStory M Logo" 
                        className="h-8 inline-block" />
                        Guild Task Assignment Tool For MapleStory M
                    </h1>                    
                    <p className="text-gray-400">Assign members to tiers and manage GP allocation</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Members */}
                    <div className="lg:col-span-1">
                        <MemberList
                            members={members}
                            selectedMembers={selectedMembers}
                            fileInputRef={fileInputRef}
                            calculateMemberGP={calculateMemberGP}
                            toggleMemberSelection={toggleMemberSelection}
                            selectAllMembers={selectAllMembers}
                            clearSelectedMembers={clearSelectedMembers}
                            generateSampleCSV={generateSampleCSV}
                            startAutoAssignment={startAutoAssignment}
                            clearMembers={clearMembers}
                            handleDragStart={handleDragStart}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Middle Panel - Tiers */}
                    <div className="lg:col-span-1">
                        <TierList
                            tierConfig={tierConfig}
                            assignments={assignments}
                            members={members}
                            selectedMembers={selectedMembers}
                            collapsedTiers={collapsedTiers}
                            calculateTierGP={calculateTierGP}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            toggleTierCollapse={toggleTierCollapse}
                            startBulkAssignment={startBulkAssignment}
                            clearTierAssignments={clearTierAssignments}
                            setEditingMember={setEditingMember}
                            removeAssignment={removeAssignment}
                        />
                    </div>

                    {/* Right Panel - Summary */}
                    <div className="lg:col-span-1">
                        <MemberSummary
                            members={members}
                            calculateMemberGP={calculateMemberGP}
                            exportAssignments={exportAssignments}
                            importFileInputRef={importFileInputRef}
                            assignments={assignments}
                            tierConfig={tierConfig}
                        />
                        <input
                            ref={importFileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportAssignments}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Modals */}
                <AssignmentModal
                    selectedTier={selectedTier}
                    selectedMember={selectedMember}
                    tierConfig={tierConfig}
                    handleAssign={handleAssign}
                    onClose={() => {
                        setSelectedTier(null);
                        setSelectedMember(null);
                    }}
                />

                <EditEnhancementModal
                    editingMember={editingMember}
                    tierConfig={tierConfig}
                    setAssignments={setAssignments}
                    onClose={() => setEditingMember(null)}
                />

                <BulkAssignModal
                    showBulkModal={showBulkModal}
                    selectedMembers={selectedMembers}
                    bulkAssignTier={bulkAssignTier}
                    tierConfig={tierConfig}
                    handleBulkAssign={handleBulkAssign}
                    onClose={() => {
                        setShowBulkModal(false);
                        setBulkAssignTier(null);
                    }}
                />
            </div>
        </div>
    );
};

export default TaskAssignmentTool;
