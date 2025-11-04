// 1. Initialize Express
const express = require('express');
const app = express();
const port = 3000;

// 2. Serve static files from the 'public' folder
app.use(express.static('public'));

// 3. Create API Endpoint for subjects
app.get('/api/subjects', (req, res) => {

  // This is mock data
  const subjects = [
    { id: 'C101', name: 'คณิตศาสตร์พื้นฐาน' },
    { id: 'S201', name: 'วิทยาศาสตร์กายภาพ' },
    { id: 'T301', name: 'ภาษาไทย' }
  ];

  // Send data as JSON
  res.json(subjects);
});

// 4. Start the server
app.listen(port, () => {
  // (บรรทัดนี้ใช้ภาษาไทยได้ เพราะมันอยู่ใน "ข้อความ" ไม่ใช่ "โค้ด")
  console.log(`Server กำลังทำงานที่ http://localhost:${port}`);
});