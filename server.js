const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// معالجة الطلبات للصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('حدث خطأ في الخادم!');
});

// بدء تشغيل الخادم
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Press Ctrl+C to stop the server`);
});
