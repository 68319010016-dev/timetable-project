const express = require('express');
const app = express();
const port = 3000;

// =================================================================
// เฟส 1: ฐานข้อมูลจำลอง (Data Model)
// =================================================================

// 1. ชั้นเรียน (9 ห้อง)
const CLASSES = [
  { id: 'm4-1', name: 'ม.4/1', grade: 4, students: 25 },
  { id: 'm4-2', name: 'ม.4/2', grade: 4, students: 25 },
  { id: 'm4-3', name: 'ม.4/3', grade: 4, students: 25 },
  { id: 'm5-1', name: 'ม.5/1', grade: 5, students: 25 },
  { id: 'm5-2', name: 'ม.5/2', grade: 5, students: 25 },
  { id: 'm5-3', name: 'ม.5/3', grade: 5, students: 25 },
  { id: 'm6-1', name: 'ม.6/1', grade: 6, students: 25 },
  { id: 'm6-2', name: 'ม.6/2', grade: 6, students: 25 },
  { id: 'm6-3', name: 'ม.6/3', grade: 6, students: 25 },
];

// 2. คาบเวลา (25 คาบต่อสัปดาห์)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = [1, 2, 3, 4, 5]; // (8:00, 9:00, 10:00, 12:00, 13:00)

// 3. รายวิชา (และประเภทห้อง)
const SUBJECTS = [
  { id: 'bio', name: 'ชีวะ', periodsPerWeek: 4, roomType: 'standard' },
  { id: 'chem', name: 'เคมี', periodsPerWeek: 4, roomType: 'standard' },
  { id: 'phys', name: 'ฟิสิกส์', periodsPerWeek: 4, roomType: 'standard' },
  { id: 'math', name: 'คณิตศาสตร์', periodsPerWeek: 3, roomType: 'standard' },
  { id: 'eng', name: 'ภาษาอังกฤษ', periodsPerWeek: 3, roomType: 'standard' },
  { id: 'comp', name: 'คอมพิวเตอร์', periodsPerWeek: 3, roomType: 'computer_lab' },
  { id: 'thai', name: 'ภาษาไทย', periodsPerWeek: 2, roomType: 'standard' },
  { id: 'pe', name: 'พละ', periodsPerWeek: 2, roomType: 'gym' },
];

// 4. ครูผู้สอน (14 ท่าน)
const TEACHERS = [
  // (เพิ่ม 'canTeachGrades' และ 'availability' ตามข้อจำกัด)
  { id: 'math1', subject: 'math', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'math2', subject: 'math', canTeachGrades: [4, 5, 6], availability: 'no_fri_pm' }, // ศุกร์บ่ายไม่ได้
  { id: 'eng1', subject: 'eng', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'eng2', subject: 'eng', canTeachGrades: [4, 5, 6], availability: 'no_mon_am' }, // จันทร์เช้าไม่ได้
  { id: 'bio1', subject: 'bio', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'bio2', subject: 'bio', canTeachGrades: [5, 6], availability: 'all' }, // ม.5, ม.6 เท่านั้น
  { id: 'chem1', subject: 'chem', canTeachGrades: [5, 6], availability: 'all' }, // ม.5, ม.6 เท่านั้น
  { id: 'chem2', subject: 'chem', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'phys1', subject: 'phys', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'phys2', subject: 'phys', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'comp1', subject: 'comp', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'comp2', subject: 'comp', canTeachGrades: [4, 5, 6], availability: 'no_fri_am' }, // ศุกร์เช้าไม่ได้
  { id: 'thai1', subject: 'thai', canTeachGrades: [4, 5, 6], availability: 'all' },
  { id: 'pe1', subject: 'pe', canTeachGrades: [4, 5, 6], availability: 'all' },
];

// 5. สถานที่ (16 ห้อง)
const ROOMS = [
  // ห้องเรียน (10 ห้องที่ใช้ได้, 2 ห้องใช้ไม่ได้)
  { id: 'R101', type: 'standard', capacity: 30 },
  // { id: 'R102', type: 'standard', capacity: 20 }, // ใช้ไม่ได้ (นักเรียน 25)
  { id: 'R103', type: 'standard', capacity: 30 },
  { id: 'R104', type: 'standard', capacity: 30 },
  // { id: 'R105', type: 'standard', capacity: 20 }, // ใช้ไม่ได้ (นักเรียน 25)
  { id: 'R106', type: 'standard', capacity: 30 },
  { id: 'R201', type: 'standard', capacity: 30 },
  { id: 'R202', type: 'standard', capacity: 30 },
  { id: 'R203', type: 'standard', capacity: 30 },
  { id: 'R204', type: 'standard', capacity: 30 },
  { id: 'R205', type: 'standard', capacity: 30 },
  { id: 'R206', type: 'standard', capacity: 30 },

  // ห้องคอม (2 ห้อง)
  { id: 'comp_lab_a', type: 'computer_lab', capacity: 60 },
  { id: 'comp_lab_b', type: 'computer_lab', capacity: 30 },

  // โรงยิม (2 ห้อง)
  { id: 'gym_a', type: 'gym', capacity: 100 },
  { id: 'gym_b', type: 'gym', capacity: 50 },
];

// =================================================================
// เฟส 2: อัลกอริทึมจัดตาราง (The Solver)
// =================================================================

// (เดี๋ยวเราจะมาเขียนโค้ดอัลกอริทึมตรงนี้)

// =================================================================
// เฟส 3: API Endpoint
// =================================================================

// ทำให้หน้าบ้าน (index.html) ใช้งานได้
app.use(express.static('public'));

// API Endpoint ใหม่สำหรับ "เริ่มจัดตาราง"
app.get('/api/generate-schedule', (req, res) => {
  // 1. (เรียกใช้อัลกอริทึม Solver)
  // 2. (Solver จะคืนค่าเป็นตารางที่จัดแล้ว หรือ Error)

  // ข้อมูลจำลอง (Mockup) ว่าจัดเสร็จแล้ว
  const mockSchedule = {
    'm4-1': {
      'Mon': [
        { period: 1, subject: 'math', teacher: 'math1', room: 'R101' },
        { period: 2, subject: 'eng', teacher: 'eng1', room: 'R101' },
        //...
      ],
      'Tue': [
        //...
      ]
    },
    'm4-2': {
      //...
    }
  };

  console.log('กำลังสร้างตารางสอนอัตโนมัติ...');
  // (เราจะเปลี่ยน mockSchedule เป็นผลลัพธ์จริงในอนาคต)
  res.json({ success: true, schedule: mockSchedule, message: 'สร้างตารางสำเร็จ (ข้อมูลจำลอง)' });
});


// 4. สั่งให้เซิร์ฟเวอร์ "สตาร์ท"
app.listen(port, () => {
  console.log(`Server กำลังทำงานที่ http://localhost:${port}`);
});