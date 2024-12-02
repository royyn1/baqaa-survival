from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

def run_server():
    # تحديد المنفذ
    port = 8000
    
    # إنشاء الخادم
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    
    # فتح المتصفح تلقائياً
    webbrowser.open(f'http://localhost:{port}')
    
    print(f'الخادم يعمل على المنفذ {port}...')
    print('اضغط Ctrl+C لإيقاف الخادم')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nتم إيقاف الخادم')
        httpd.server_close()

if __name__ == '__main__':
    run_server()
