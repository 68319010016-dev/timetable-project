const express = require('express');
const app = express();
const port = 3000;

// USERS DATA
const USERS = [
  { username: "10001", password: "18052006", role: "student", name: "อัครเดช มีสุข", class: "ม.4/1", birth: "18 May 2006" },
  { username: "10226", password: "27021987", role: "teacher", name: "สมชาย แสงทอง", class: "", birth: "27 February 1987" }
];

app.post('/api/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user: { ...user, password: undefined } });
  } else {
    res.json({ success: false, message: "รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  }
});

// ตารางเรียน
const CLASSES = [
  { id: 'm4-1', name: 'ม.4/1', grade: 4, students: 25 },
  { id: 'm4-2', name: 'ม.4/2', grade: 4, students: 25 },
  { id: 'm4-3', name: 'ม.4/3', grade: 4, students: 25 },
  { id: 'm5-1', name: 'ม.5/1', grade: 5, students: 25 },
  { id: 'm5-2', name: 'ม.5/2', grade: 5, students: 25 },
  { id: 'm5-3', name: 'ม.5/3', grade: 5, students: 25 },
  { id: 'm6-1', name: 'ม.6/1', grade: 6, students: 25 },
  { id: 'm6-2', name: 'm.6/2', grade: 6, students: 25 },
  { id: 'm6-3', name: 'm.6/3', grade: 6, students: 25 }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = [1, 2, 3, 5, 6, 7, 8]; // 7 คาบเรียน/วัน
const BREAK_PERIOD = 4;

const SUBJECTS = {
  'bio': { id: 'bio', name: 'ชีวะ', periodsPerWeek: 4, roomType: 'standard' },
  'chem': { id: 'chem', name: 'เคมี', periodsPerWeek: 4, roomType: 'standard' },
  'phys': { id: 'phys', name: 'ฟิสิกส์', periodsPerWeek: 4, roomType: 'standard' },
  'math': { id: 'math', name: 'คณิตศาสตร์', periodsPerWeek: 4, roomType: 'standard' },
  'eng': { id: 'eng', name: 'ภาษาอังกฤษ', periodsPerWeek: 4, roomType: 'standard' },
  'comp': { id: 'comp', name: 'คอมพิวเตอร์', periodsPerWeek: 3, roomType: 'computer_lab' },
  'thai': { id: 'thai', name: 'ภาษาไทย', periodsPerWeek: 2, roomType: 'standard' },
  'pe': { id: 'pe', name: 'พละ', periodsPerWeek: 2, roomType: 'gym' }
};

const TEACHERS = {
  'math1': { id: 'math1', subject: 'math' },
  'math2': { id: 'math2', subject: 'math' },
  'eng1': { id: 'eng1', subject: 'eng' },
  'eng2': { id: 'eng2', subject: 'eng' },
  'bio1': { id: 'bio1', subject: 'bio' },
  'bio2': { id: 'bio2', subject: 'bio' },
  'chem1': { id: 'chem1', subject: 'chem' },
  'chem2': { id: 'chem2', subject: 'chem' },
  'phys1': { id: 'phys1', subject: 'phys' },
  'phys2': { id: 'phys2', subject: 'phys' },
  'comp1': { id: 'comp1', subject: 'comp' },
  'comp2': { id: 'comp2', subject: 'comp' },
  'thai1': { id: 'thai1', subject: 'thai' },
  'pe1': { id: 'pe1', subject: 'pe' }
};

const ROOMS = [
  { id: 'R101', type: 'standard', capacity: 30 },
  { id: 'R103', type: 'standard', capacity: 30 },
  { id: 'R104', type: 'standard', capacity: 30 },
  { id: 'R106', type: 'standard', capacity: 30 },
  { id: 'R201', type: 'standard', capacity: 30 },
  { id: 'R202', type: 'standard', capacity: 30 },
  { id: 'R203', type: 'standard', capacity: 30 },
  { id: 'R204', type: 'standard', capacity: 30 },
  { id: 'R205', type: 'standard', capacity: 30 },
  { id: 'R206', type: 'standard', capacity: 30 },
  { id: 'comp_lab_a', type: 'computer_lab', capacity: 60 },
  { id: 'comp_lab_b', type: 'computer_lab', capacity: 30 },
  { id: 'gym_a', type: 'gym', capacity: 100 },
  { id: 'gym_b', type: 'gym', capacity: 50 }
];

const ROOMS_BY_TYPE = {
  'standard': ROOMS.filter(r => r.type === 'standard'),
  'computer_lab': ROOMS.filter(r => r.type === 'computer_lab'),
  'gym': ROOMS.filter(r => r.type === 'gym')
};

let lessonsToSchedule = [];
let classSchedule = {};
let teacherSchedule = {};
let roomSchedule = {};
let maxLessonReached = -1;
const BACKTRACK_LIMIT = 10000000;
let backtrackCounter = 0;

function createLessonsList() {
  lessonsToSchedule = [];
  let lessonId = 0;
  const chemTeachers = ['chem2', 'chem1', 'chem1'];
  const bioTeachers = ['bio1', 'bio2', 'bio2'];
  const mathTeachers = ['math1', 'math1', 'math1', 'math1', 'math2', 'math2', 'math2', 'math2', 'math2'];
  const engTeachers = ['eng1', 'eng1', 'eng1', 'eng1', 'eng2', 'eng2', 'eng2', 'eng2', 'eng2'];
  const physTeachers = ['phys1', 'phys1', 'phys1', 'phys1', 'phys2', 'phys2', 'phys2', 'phys2', 'phys2'];
  const compTeachers = ['comp1', 'comp1', 'comp1', 'comp1', 'comp2', 'comp2', 'comp2', 'comp2', 'comp2'];

  CLASSES.forEach((classInfo, classIndex) => {
    Object.values(SUBJECTS).forEach(subject => {
      for (let i = 0; i < subject.periodsPerWeek; i++) {
        let teacher;
        if (subject.id === 'thai') teacher = TEACHERS['thai1'];
        else if (subject.id === 'pe') teacher = TEACHERS['pe1'];
        else if (subject.id === 'chem') teacher = TEACHERS[chemTeachers[classInfo.grade - 4]];
        else if (subject.id === 'bio') teacher = TEACHERS[bioTeachers[classInfo.grade - 4]];
        else if (subject.id === 'math') teacher = TEACHERS[mathTeachers[classIndex]];
        else if (subject.id === 'eng') teacher = TEACHERS[engTeachers[classIndex]];
        else if (subject.id === 'phys') teacher = TEACHERS[physTeachers[classIndex]];
        else if (subject.id === 'comp') teacher = TEACHERS[compTeachers[classIndex]];
        lessonsToSchedule.push({
          id: lessonId++,
          class: classInfo,
          subject: subject,
          teacher: teacher
        });
      }
    });
  });
  lessonsToSchedule.sort(() => Math.random() - 0.5);
}

function initializeSchedules() {
  classSchedule = {};
  CLASSES.forEach(c => {
    classSchedule[c.id] = {};
    DAYS.forEach(day => {
      classSchedule[c.id][day] = {};
      for (let p = 1; p <= 8; p++) {
        classSchedule[c.id][day][p] = null;
      }
      classSchedule[c.id][day][BREAK_PERIOD] = { isBreak: true };
    });
  });

  teacherSchedule = {};
  Object.values(TEACHERS).forEach(t => {
    teacherSchedule[t.id] = {};
    DAYS.forEach(day => {
      teacherSchedule[t.id][day] = {};
      for (let p = 1; p <= 8; p++) {
        teacherSchedule[t.id][day][p] = null;
      }
    });
  });

  roomSchedule = {};
  ROOMS.forEach(r => {
    roomSchedule[r.id] = {};
    DAYS.forEach(day => {
      roomSchedule[r.id][day] = {};
      for (let p = 1; p <= 8; p++) {
        roomSchedule[r.id][day][p] = null;
      }
    });
  });

  maxLessonReached = -1;
  backtrackCounter = 0;
}

function isSlotValid(lesson, day, period, room) {
  if (period === BREAK_PERIOD) return false;
  if (teacherSchedule[lesson.teacher.id][day][period] !== null) return false;
  if (roomSchedule[room.id][day][period] !== null) return false;
  if (classSchedule[lesson.class.id][day][period] !== null) return false;
  const prevPeriods = PERIODS.filter(p => p < period);
  const nextPeriods = PERIODS.filter(p => p > period);
  if (prevPeriods.includes(period - 1)) {
    const prevLesson = classSchedule[lesson.class.id][day][period - 1];
    if (prevLesson && prevLesson.subject && prevLesson.subject.id === lesson.subject.id) {
      if (prevLesson.room.id !== room.id) return false;
    }
  }
  if (nextPeriods.includes(period + 1)) {
    const nextLesson = classSchedule[lesson.class.id][day][period + 1];
    if (nextLesson && nextLesson.subject && nextLesson.subject.id === lesson.subject.id) {
      if (nextLesson.room.id !== room.id) return false;
    }
  }
  if (lesson.teacher.id === 'math2' && day === 'Fri' && ([5,6,7,8].includes(period))) return false;
  if (lesson.teacher.id === 'eng2' && day === 'Mon' && ([1,2,3].includes(period))) return false;
  if (lesson.teacher.id === 'comp2' && day === 'Fri' && ([1,2,3].includes(period))) return false;
  if (lesson.subject.id === 'pe') {
    for (let p of PERIODS) {
      const existingLesson = classSchedule[lesson.class.id][day][p];
      if (existingLesson && existingLesson.subject && existingLesson.subject.id === 'pe') return false;
    }
  }
  return true;
}

function solve(lessonIndex) {
  if (backtrackCounter > BACKTRACK_LIMIT) return false;
  if (lessonIndex > maxLessonReached) maxLessonReached = lessonIndex;
  if (lessonIndex >= lessonsToSchedule.length) return true;
  const lesson = lessonsToSchedule[lessonIndex];
  const possibleRooms = ROOMS_BY_TYPE[lesson.subject.roomType];
  for (let period of PERIODS) {
    for (let day of DAYS) {
      for (let room of possibleRooms) {
        if (isSlotValid(lesson, day, period, room)) {
          const placement = { ...lesson, room: room };
          classSchedule[lesson.class.id][day][period] = placement;
          teacherSchedule[lesson.teacher.id][day][period] = placement;
          roomSchedule[room.id][day][period] = placement;
          if (solve(lessonIndex + 1)) return true;
          classSchedule[lesson.class.id][day][period] = null;
          teacherSchedule[lesson.teacher.id][day][period] = null;
          roomSchedule[room.id][day][period] = null;
          backtrackCounter++;
        }
      }
    }
  }
  return false;
}

app.use(express.static('public'));

app.get('/api/generate-schedule', (req, res) => {
  createLessonsList();
  initializeSchedules();
  backtrackCounter = 0;
  const success = solve(0);
  if (success) {
    res.json({
      success: true,
      schedule: formatScheduleForFrontend(classSchedule),
      message: `สร้างตารางสำเร็จ!`
    });
  } else {
    let stuckLesson = lessonsToSchedule[maxLessonReached];
    let stuckDetail = '';
    if (stuckLesson) {
      stuckDetail = `ติดที่วิชา "${stuckLesson.subject.name}" ของ ${stuckLesson.class.name}, ครู: ${stuckLesson.teacher.id}`;
    } else {
      stuckDetail = 'ไม่พบข้อมูลบทเรียน';
    }
    let msg = `[ล้มเหลว] ที่บทเรียนที่ ${maxLessonReached} (${stuckDetail})`;
    if (backtrackCounter > BACKTRACK_LIMIT) {
      msg += " (หยุดเพราะ Backtrack Limit/Timeout)";
    }
    res.json({ success: false, schedule: null, message: msg });
  }
});

function formatScheduleForFrontend(fullClassSchedule) {
  let formatted = {};
  CLASSES.forEach(c => {
    formatted[c.id] = {};
    DAYS.forEach(day => {
      formatted[c.id][day] = [];
      for (let p = 1; p <= 8; p++) {
        const lesson = fullClassSchedule[c.id][day][p];
        if (p === BREAK_PERIOD) {
          formatted[c.id][day].push({
            period: p,
            subject: "พัก",
            teacher: "",
            room: "",
            isBreak: true
          });
        } else if (lesson && lesson.subject) {
          formatted[c.id][day].push({
            period: p,
            subject: lesson.subject.name,
            teacher: lesson.teacher.id,
            room: lesson.room.id
          });
        } else {
          formatted[c.id][day].push({
            period: p,
            subject: "",
            teacher: "",
            room: ""
          });
        }
      }
    });
  });
  return formatted;
}

// =========================
//  API ตรวจสอบตารางชนกัน
// =========================
app.post('/api/validate-schedule', express.json(), (req, res) => {
  const { schedule } = req.body;
  const errors = [];

  const teacherSlot = {};
  const roomSlot = {};

  for (const classId in schedule) {
    for (const day in schedule[classId]) {
      const lessons = schedule[classId][day];
      lessons.forEach(lesson => {
        if (lesson.isBreak) return;
        if (lesson.teacher && lesson.teacher !== "") {
          const key = `${lesson.teacher}_${day}_${lesson.period}`;
          if (teacherSlot[key] && teacherSlot[key] !== classId) {
            errors.push(`ครู ${lesson.teacher} สอนห้อง ${classId} และ ${teacherSlot[key]} ซ้ำกัน (${day} คาบ ${lesson.period})`);
          } else {
            teacherSlot[key] = classId;
          }
        }
        if (lesson.room && lesson.room !== "") {
          const roomKey = `${lesson.room}_${day}_${lesson.period}`;
          if (roomSlot[roomKey] && roomSlot[roomKey] !== classId) {
            errors.push(`ห้อง ${lesson.room} ถูกใช้ทั้งในห้อง ${classId} และ ${roomSlot[roomKey]} (${day} คาบ ${lesson.period})`);
          } else {
            roomSlot[roomKey] = classId;
          }
        }
      });
    }
  }
  res.json({
    valid: errors.length === 0,
    errors
  });
});


app.listen(port, () => {
  console.log(`Server กำลังทำงานที่ http://localhost:${port}`);
});
