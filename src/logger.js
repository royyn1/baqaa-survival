// نظام تسجيل الأخطاء للعبة
export class GameLogger {
    constructor() {
        this.logs = [];
        this.errorContainer = document.getElementById('error-message');
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            this.logError({
                message: msg,
                source: url,
                line: lineNo,
                column: columnNo,
                error: error
            });
            return false;
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }

    logError(errorInfo) {
        const timestamp = new Date().toLocaleTimeString();
        const errorMessage = `[${timestamp}] خطأ: ${errorInfo.message}`;
        
        if (errorInfo.source) {
            errorMessage += `\nالمصدر: ${errorInfo.source}`;
        }
        if (errorInfo.line) {
            errorMessage += `\nالسطر: ${errorInfo.line}`;
        }
        if (errorInfo.column) {
            errorMessage += `\nالعمود: ${errorInfo.column}`;
        }
        if (errorInfo.error && errorInfo.error.stack) {
            errorMessage += `\nتفاصيل الخطأ: ${errorInfo.error.stack}`;
        }

        this.logs.push(errorMessage);
        this.showError(errorMessage);
        console.error(errorMessage);
    }

    logInfo(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] معلومة: ${message}`;
        this.logs.push(logMessage);
        console.info(logMessage);
    }

    showError(message) {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'block';
            this.errorContainer.innerHTML = message.replace(/\n/g, '<br>');
        }
    }

    clearError() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
    }

    getLogs() {
        return this.logs.join('\n');
    }

    downloadLogs() {
        const blob = new Blob([this.getLogs()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-logs-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
