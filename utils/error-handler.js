// نظام معالجة الأخطاء والتسجيل

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 1000;
    }

    logError(error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                type: error.name
            },
            context: {
                ...context,
                url: context.url || '',
                userId: context.userId || '',
                action: context.action || ''
            }
        };

        this.errors.push(errorLog);

        // حفظ في قاعدة البيانات أو إرسال إلى نظام المراقبة
        this.saveError(errorLog);

        // إزالة الأخطاء القديمة إذا تجاوزنا الحد الأقصى
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        return errorLog;
    }

    async saveError(errorLog) {
        try {
            // يمكنك هنا إضافة كود لحفظ الخطأ في قاعدة البيانات
            console.error('خطأ:', errorLog);
            
            // إرسال إشعار للمطورين إذا كان الخطأ خطيراً
            if (this.isCriticalError(errorLog.error)) {
                await this.notifyDevelopers(errorLog);
            }
        } catch (error) {
            console.error('فشل في حفظ سجل الخطأ:', error);
        }
    }

    isCriticalError(error) {
        const criticalTypes = [
            'SecurityError',
            'DatabaseError',
            'NetworkError',
            'ServerError'
        ];
        
        return criticalTypes.includes(error.type) || 
               error.message.includes('critical') ||
               error.message.includes('fatal');
    }

    async notifyDevelopers(errorLog) {
        try {
            // إرسال إشعار عبر Discord أو Slack أو البريد الإلكتروني
            const notification = {
                title: `خطأ خطير في اللعبة!`,
                description: errorLog.error.message,
                timestamp: errorLog.timestamp,
                details: JSON.stringify(errorLog, null, 2)
            };

            // يمكنك هنا إضافة كود الإشعارات الخاص بك
            console.warn('إشعار للمطورين:', notification);
        } catch (error) {
            console.error('فشل في إرسال الإشعار:', error);
        }
    }

    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }

    clearErrors() {
        this.errors = [];
    }
}

module.exports = new ErrorHandler();
