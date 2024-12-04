const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const expressApp = express();
const port = 3001;

let mainWindow = null;
let server = null;

// إعداد خادم Express
function setupServer() {
    expressApp.use(express.static(path.join(__dirname, 'public')));
    server = expressApp.listen(port, 'localhost', () => {
        console.log(`Express server running on port ${port}`);
        createWindow();
    }).on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
            console.log('Port is in use, trying to close existing server...');
            require('child_process').exec(`npx kill-port ${port}`, (err) => {
                if (!err) {
                    setupServer();
                }
            });
        }
    });
}

function createWindow() {
    // إنشاء نافذة التطبيق
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // تحميل الصفحة الرئيسية
    mainWindow.loadURL(`http://localhost:${port}`).catch(err => {
        console.error('Failed to load URL:', err);
    });

    // إظهار النافذة عندما تكون جاهزة
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // معالجة إغلاق النافذة
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (server) {
            server.close();
        }
    });
}

// عند جاهزية التطبيق
app.whenReady().then(() => {
    setupServer();
});

// معالجة إغلاق التطبيق
app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null && server) {
        createWindow();
    }
});
