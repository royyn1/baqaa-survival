const fs = require('fs');
const path = require('path');

// تكوين المجلدات
const dirs = ['public', 'public/js', 'public/css', 'public/assets'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// نسخ الملفات الضرورية
function copyFiles() {
    // تحديث الإصدار في package.json
    const package = require('./package.json');
    const buildVersion = new Date().toISOString();
    package.version = buildVersion;
    fs.writeFileSync('package.json', JSON.stringify(package, null, 2));

    // إضافة معلومات الإصدار إلى ملف التكوين
    const config = {
        version: buildVersion,
        buildDate: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    };
    fs.writeFileSync('public/config.json', JSON.stringify(config, null, 2));
}

// تنفيذ عملية البناء
try {
    console.log('🏗️ Starting build process...');
    copyFiles();
    console.log('✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
