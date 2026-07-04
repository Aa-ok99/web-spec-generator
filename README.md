# Web Spec Generator Pro

> ใส่ลิงก์เว็บไซต์ → AI วิเคราะห์ → ได้ Spec + Prompt พร้อมใช้

```
https://github.com/Aa-ok99/web-spec-generator
```

---

## ✨ ความสามารถ

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| วิเคราะห์เว็บ | ใส่ URL → ดึงโครงสร้างเว็บ → AI วิเคราะห์ → ได้ Spec ครบ |
| Export PDF | ดาวน์โหลด Spec เป็นไฟล์ PDF |
| Download .md | ดาวน์โหลด Spec เป็นไฟล์ Markdown |
| คัดลอก Prompt | คัดลอก Prompt สำหรับให้ AI ตัวอื่นสร้างเว็บต่อ |
| แชร์ลิงก์ | สร้างลิงก์แชร์ให้คนอื่นดู Spec ได้ |
| ประวัติ | ดู/โหลดซ้ำ/ลบ ประวัติที่วิเคราะห์แล้ว (เก็บ 100 รายการ) |
| Dark Mode | สลับธีมสว่าง/มืดได้ |
| Responsive | ใช้ได้ทุกอุปกรณ์ มือถือ แท็บเล็ต คอมพิวเตอร์ |

---

## 🚀 วิธีใช้งาน (สำหรับผู้ใช้ทั่วไป)

### สิ่งที่ต้องมี
- **Node.js** — [ดาวน์โหลดที่นี่](https://nodejs.org/) (เลือก LTS)
- **OpenRouter API Key** — [สมัครฟรีที่นี่](https://openrouter.ai/keys) (กด "Create Key")

### ขั้นตอน (คัดลอกแล้ววางทีละคำสั่ง)

**1. ดาวน์โหลดโปรเจค**
```bash
git clone https://github.com/Aa-ok99/web-spec-generator.git
cd web-spec-generator
```

**2. ติดตั้ง dependencies**
```bash
cd backend
npm install
cd ..
```

**3. ตั้งค่า API Key**
```bash
# เปิดไฟล์ .env ด้วยโปรแกรม editor (หรือใช้คำสั่งด้านล่าง)
# แล้วเปลี่ยน sk-or-v1-xxxxxxxx... เป็น Key จริงของคุณ
nano backend/.env
```

หรือใช้คำสั่งแทนการเปิด editor:
```bash
# ใส่ Key จริงของคุณตรงนี้ (ไม่ต้องมี <>)
echo 'OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx' > backend/.env
echo 'PORT=5000' >> backend/.env
echo 'OPENROUTER_BASE_URL=https://openrouter.ai/api/v1' >> backend/.env
```

**4. รันเซิร์ฟเวอร์**
```bash
./start.sh
```

หรือรันแบบ manual:
```bash
cd backend
npm start
```

**5. เปิดเบราว์เซอร์**
ไปที่ **http://localhost:5000**

---

## 🎯 วิธีใช้

1. พิมพ์ลิงก์เว็บที่ต้องการวิเคราะห์ (เช่น `https://www.apple.com/th/iphone/`)
2. กดปุ่ม **"วิเคราะห์"**
3. รอ 5-15 วินาที (AI กำลังทำงาน)
4. ได้ Spec พร้อมใช้งาน:
   - กด **"คัดลอก Prompt"** → เอาไปให้ AI สร้างเว็บ
   - กด **"PDF"** → ดาวน์โหลดเป็น PDF
   - กด **"แชร์"** → ได้ลิงก์ส่งให้เพื่อน
   - กด **".md"** → ดาวน์โหลดเป็น Markdown

---

## 🧩 ใช้กับ AI CLI (opencode)

ติดตั้ง skill สำหรับใช้กับ opencode:

```bash
# ติดตั้ง skill
bash skill/install.sh

# เปิด opencode แล้วใช้คำสั่ง:
# "วิเคราะห์เว็บ https://example.com"
# "Clone this website https://example.com"
```

---

## 📋 API Endpoints (สำหรับนักพัฒนา)

| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| `POST` | `/api/analyze` | วิเคราะห์ URL `{ url, apiKey? }` |
| `GET` | `/api/history` | รายการประวัติทั้งหมด |
| `GET` | `/api/history/:id` | ดูประวัติรายการ |
| `DELETE` | `/api/history/:id` | ลบประวัติรายการ |
| `DELETE` | `/api/history` | ล้างประวัติทั้งหมด |
| `GET` | `/api/share/:id` | หน้าแชร์ Spec (HTML) |
| `GET` | `/api/share/data/:id` | ข้อมูล Spec (JSON) |
| `GET` | `/api/share/pdf/:id` | ดาวน์โหลด PDF |

---

## ⚙️ ตั้งค่าเพิ่มเติม

แก้ไขไฟล์ `backend/.env`:

```env
PORT=5000                               # พอร์ตเซิร์ฟเวอร์
OPENROUTER_API_KEY=sk-or-v1-xxxxx       # API Key ของคุณ
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # เปลี่ยน AI provider
RATE_LIMIT_MAX=10                       # จำกัด request ต่อนาที
```

---

## 🔒 ความปลอดภัย

- ป้องกัน SSRF (block localhost/private IP)
- ตรวจสอบ URL (เฉพาะ http/https)
- Helmet security headers
- Rate limiting
- ตรวจสอบ Input ทุกจุด

---

## 📝 หมายเหตุ

- ใช้ AI โมเดล `cohere/north-mini-code:free` (ฟรี) — เปลี่ยนได้ที่ `backend/services/openrouterService.js`
- ประวัติสูงสุด 100 รายการ (ลบอัตโนมัติเมื่อเกิน)
- API Key จะถูกเก็บใน Local Storage ของเบราว์เซอร์เท่านั้น
- เหมาะสำหรับการศึกษาและพัฒนาต่อยอด

---

## 📄 License

MIT
