import Papa from 'papaparse';

// Auto assignment
export const assignAuto = (members, tierConfig, setAssignments) => {
  let assignments = {};
  let memberGpUsage = {};
  members.forEach(member => memberGpUsage[member.id] = 0);

  // จัดลำดับ tier ตาม maxGP จากมากไปน้อย (จะได้เติมที่ว่างเยอะก่อน)
  const tierEntries = Object.entries(tierConfig).sort((a, b) => b[1].maxGP - a[1].maxGP);

  // เก็บข้อมูลว่า tier ไหนอนุญาติให้ overflow ได้อีก 1 ครั้ง
  let tierOverflowAllowed = {};
  tierEntries.forEach(([tierId]) => tierOverflowAllowed[tierId] = true);

  // ในแต่ละ tier พยายาม assign สมาชิกให้ได้มากที่สุด
  tierEntries.forEach(([tierId, config]) => {
    if (!assignments[tierId]) assignments[tierId] = {};

    // คำนวณ GP ที่ใช้ไปในแต่ละ tier
    let currentGP = 0;

    // เรียงลำดับสมาชิกตาม GP ที่ใช้ไปแล้วจากน้อยไปมาก
    // เพื่อให้สมาชิกที่ยังไม่ได้ใช้งานมากได้รับการ assign ก่อน
    const sortedMembers = [...members].sort((a, b) =>
      (memberGpUsage[a.id] || 0) - (memberGpUsage[b.id] || 0)
    );

    // วน loop ผ่านสมาชิกทุกคน
    for (const member of sortedMembers) {
      // หา enhancement count ที่เหมาะสม (สุ่มระหว่าง 0-3)
      const enhancementCount = Math.floor(Math.random() * 4);
      const memberGP = config.liberation + (enhancementCount * config.enhancement);

      // ตรวจสอบว่า tier นี้ยังมีพื้นที่พอหรือไม่
      // หรือถ้าใกล้เต็มแล้ว และยังไม่เคย overflow ก็อนุญาติให้ overflow ได้ 1 ครั้ง
      const isNearlyFull = (config.maxGP - currentGP < config.liberation * 2); // ถือว่าใกล้เต็มถ้าเหลือน้อยกว่า liberation * 2

      if (currentGP + memberGP <= config.maxGP ||
        (isNearlyFull && tierOverflowAllowed[tierId] && currentGP > 0)) {

        // ถ้าเป็นการ overflow ให้เปลี่ยนสถานะ
        if (currentGP + memberGP > config.maxGP) {
          tierOverflowAllowed[tierId] = false;
        }

        assignments[tierId][member.id] = { liberation: 1, enhancement: enhancementCount };
        currentGP += memberGP;
        memberGpUsage[member.id] = (memberGpUsage[member.id] || 0) + memberGP;
      }
    }
  });

  // รอบที่ 2: พยายามเติม GP ที่เหลือในแต่ละ tier โดยให้สมาชิกสามารถรับได้หลาย tier
  let remainingAssignmentsMade = true;
  let maxRounds = 3; // ป้องกันการวนลูปไม่รู้จบ

  while (remainingAssignmentsMade && maxRounds > 0) {
    remainingAssignmentsMade = false;
    maxRounds--;

    // เรียงลำดับ tier ตาม GP ที่เหลืออยู่จากมากไปน้อย
    const tiersWithCapacity = [...tierEntries]
      .map(([tierId, config]) => {
        const usedGP = Object.values(assignments[tierId] || {}).reduce((sum, a) =>
          sum + (a.liberation * config.liberation) + (a.enhancement * config.enhancement), 0);
        return { tierId, config, remainingGP: config.maxGP - usedGP };
      })
      // ตัวกรองว่ามีที่เหลือหรือยังอนุญาติให้ overflow ได้อีก 1 ครั้ง
      .filter(t => t.remainingGP > 0 || (tierOverflowAllowed[t.tierId] && t.remainingGP > -t.config.maxGP * 0.05))
      .sort((a, b) => b.remainingGP - a.remainingGP);

    // วนลูป tier ที่ยังมี capacity เหลือ
    for (const { tierId, config, remainingGP } of tiersWithCapacity) {
      // เรียงลำดับสมาชิกตาม GP ที่ใช้ไปแล้วจากน้อยไปมาก
      const sortedMembers = [...members].sort((a, b) =>
        (memberGpUsage[a.id] || 0) - (memberGpUsage[b.id] || 0)
      );

      // ลองกับสมาชิกทุกคน
      for (const member of sortedMembers) {
        // ถ้าสมาชิกมี assignment ใน tier นี้แล้ว ให้ข้ามไป
        if (assignments[tierId] && assignments[tierId][member.id]) continue;

        // ทดลองกับ enhancement ค่าต่างๆ
        for (let enh = 0; enh <= 3; enh++) {
          const memberGP = config.liberation + (enh * config.enhancement);

          // อนุญาติให้ overflow ได้ถ้ายังไม่เคย overflow ใน tier นี้
          // และ tier มี assignments อยู่แล้ว (ไม่ว่าง)
          const canAssign = memberGP <= remainingGP ||
            (tierOverflowAllowed[tierId] &&
              Object.keys(assignments[tierId] || {}).length > 0 &&
              remainingGP > -config.maxGP * 0.05);

          if (canAssign) {
            if (!assignments[tierId]) assignments[tierId] = {};

            // ถ้าเป็นการ overflow ให้เปลี่ยนสถานะ
            if (memberGP > remainingGP) {
              tierOverflowAllowed[tierId] = false;
            }

            assignments[tierId][member.id] = { liberation: 1, enhancement: enh };
            memberGpUsage[member.id] = (memberGpUsage[member.id] || 0) + memberGP;
            remainingAssignmentsMade = true;
            break; // หยุด loop enhancement
          }
        }

        // ถ้า assign แล้วอาจจะเต็ม tier แล้ว ให้ไปต่อ tier ถัดไป
        const updatedUsedGP = Object.values(assignments[tierId] || {}).reduce((sum, a) =>
          sum + (a.liberation * config.liberation) + (a.enhancement * config.enhancement), 0);
        if (config.maxGP - updatedUsedGP < config.liberation && !tierOverflowAllowed[tierId]) {
          break; // หยุด loop member
        }
      }
    }
  }

  setAssignments(assignments);
};

// Export assignments to CSV
export const exportAssignments = (members, assignments, tierConfig) => {
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

// Import assignments from CSV
export const importAssignments = (file, members, tierConfig, setAssignments) => {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const newAssignments = {};
      
      // Group rows by tier
      results.data.forEach(row => {
        if (!row.Tier && !row.tier) return; // Skip invalid rows
        
        const tierId = row.Tier || row.tier;
        const memberName = row.Name || row.name;
        const liberation = parseInt(row.Liberation || row.liberation) || 1;
        const enhancement = parseInt(row.Enhancement || row.enhancement) || 0;
        
        // Find the member by name
        const member = members.find(m => m.name === memberName);
        if (!member) {
          console.warn(`Member ${memberName} not found. Skipping assignment.`);
          return;
        }
        
        // Initialize tier if needed
        if (!newAssignments[tierId]) {
          newAssignments[tierId] = {};
        }
        
        // Add assignment
        newAssignments[tierId][member.id] = {
          liberation,
          enhancement
        };
      });
      
      setAssignments(newAssignments);
    },
    error: (error) => {
      console.error('CSV parsing error:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  });
};

// Generate sample CSV
export const generateSampleCSV = () => {
  const csvContent = "name,avatar\nJohn,🧑\nJane,👩\nMike,👨\nSarah,👱\nTom,🧔";
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_members.csv';
  a.click();
  URL.revokeObjectURL(url);
};
