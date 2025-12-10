### Dự án Node.js đơn giản dùng Gemini API

Đây là ví dụ tối giản dùng **Google Gemini API** với **Node.js** để:

- **Nhập một prompt** (câu hỏi / yêu cầu) từ dòng lệnh
- **Gửi lên Gemini**
- **Nhận về phần trả lời (body)** và in ra màn hình

---

### 1. Chuẩn bị

- Cài **Node.js** (khuyến nghị Node 18+)
- Có **Gemini API Key** từ Google AI Studio

---

### 2. Cấu trúc dự án

- `package.json`: cấu hình Node.js project và dependencies
- `index.js`: mã nguồn chính, gửi prompt đến Gemini và in kết quả

Bạn có thể thêm file `.env` (không commit lên git) để chứa API key.

---

### 3. Cài đặt dependencies

Trong thư mục dự án `/Users/hung/Workspace/AI-Test` chạy:

```bash
cd /Users/hung/Workspace/AI-Test
npm install @google/generative-ai dotenv
```

Nếu `package.json` chưa được npm nhận, bạn có thể chạy:

```bash
npm install
```

trong đó `dependencies` đã được khai báo sẵn.

---

### 4. Tạo file `.env`

Trong thư mục dự án, tạo file `.env`:

```bash
cd /Users/hung/Workspace/AI-Test
cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
EOF
```

Thay `your_gemini_api_key_here` bằng API key thật của bạn.

---

### 5. Cách chạy chương trình

Ví dụ hỏi AI:

```bash
node index.js "Giải thích Node.js là gì bằng tiếng Việt đơn giản"
```

Hoặc:

```bash
node index.js "Viết một đoạn mô tả ngắn về trí tuệ nhân tạo"
```

Chương trình sẽ:

- Lấy nội dung prompt từ dòng lệnh
- Tạo prompt đầy đủ (ở hàm `buildPrompt`)
- Gọi `Gemini` với model `gemini-1.5-flash`
- In ra câu trả lời của AI trong terminal

---

### 6. Tùy biến logic AI

Bạn có thể chỉnh:

- **Hàm `buildPrompt` trong `index.js`** để thay đổi “cách nói chuyện” của AI
- Đổi model:

```js
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

- Thêm logic xử lý kết quả (lưu vào file, gửi API khác, v.v.)

---

### 7. Gợi ý mở rộng

- Tạo API server (Express) để gọi Gemini từ frontend
- Tạo UI web đơn giản nhập prompt, hiển thị trả lời
- Lưu lịch sử hội thoại vào database hoặc file JSON

Nếu bạn muốn, tôi có thể tiếp tục giúp bạn:

- Tạo một **REST API** đơn giản dùng Express
- Hoặc một **giao diện web** (HTML/JS) gọi đến backend này.


