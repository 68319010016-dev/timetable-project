// 1. เรียกใช้ "เครื่องยนต์" Express
const express = require('express');
const app = express();
const port = 3000; // เราจะให้เซิร์ฟเวอร์ทำงานที่พอร์ต 3000

// 2. สร้าง "เส้นทาง" (Route) สำหรับหน้าแรก
// ถ้ามีคนเข้ามาที่ http://localhost:3000/
app.get('/', (req, res) => {
  res.send('สวัสดี! นี่คือเซิร์ฟเวอร์ตารางสอนของฉัน');
});

// 3. สั่งให้เซิร์ฟเวอร์ "สตาร์ท" และรอฟัง
app.listen(port, () => {
  console.log(`Server กำลังทำงานที่ http://localhost:${port}`);
});