import sys
import os
from cx_Freeze import setup, Executable

def build_exe():
    # تحديد المسار الحالي
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # تحديد مسار الملفات المطلوبة
    main_file = os.path.join(current_dir, 'main_3d.py')
    assets_dir = os.path.join(current_dir, 'assets')
    
    # تعيين المتغيرات
    build_exe_options = {
        "packages": [
            "ursina",
            "torch",
            "numpy",
            "gymnasium",
            "transformers",
            "arabic_reshaper",
            "python_bidi",
            "requests",
            "beautifulsoup4",
            "wikipedia"
        ],
        "include_files": [
            (assets_dir, "assets")
        ]
    }

    # إعداد البناء
    setup(
        name="Survival Game",
        version="1.0",
        description="3D Survival Game with AI",
        options={"build_exe": build_exe_options},
        executables=[Executable(main_file)]
    )
    
    print("تم إنشاء التطبيق بنجاح!")
    print(f"يمكنك العثور على الملف التنفيذي في: {os.path.join(current_dir, 'build', 'exe.win-amd64-3.10', 'Survival Game.exe')}")

if __name__ == '__main__':
    build_exe()
