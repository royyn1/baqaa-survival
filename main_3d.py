from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
import random
import math
from ai_enemy import AIEnemy
from ai_chat import AIChatSystem

# تعريف واجهة المحادثة
class ChatInterface(Entity):
    def __init__(self):
        super().__init__(
            parent=camera.ui,
            model='quad',
            scale=(0.8, 0.2),
            position=(0, -0.4),
            color=color.black66
        )
        self.chat_system = AIChatSystem()
        self.text = Text(
            parent=self,
            text='اضغط T للمحادثة',
            origin=(0, 0),
            scale=2
        )
        self.visible = False

    def toggle(self):
        self.visible = not self.visible

    def send_message(self, message):
        response = self.chat_system.get_response(message)
        self.text.text = response

app = Ursina()
window.fullscreen = True
window.exit_button.visible = False

class Player(FirstPersonController):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.health = 100
        self.inventory = {'wood': 0, 'metal': 0, 'food': 0}
        self.current_tool = 'hand'
        self.tools = ['hand', 'sword', 'hammer']
        self.tool_index = 0

    def update(self):
        super().update()
        if self.health <= 0:
            print('Game Over!')
            application.quit()

class Raft(Entity):
    def __init__(self):
        super().__init__(
            model='cube',
            scale=(5,0.5,5),
            color=color.brown,
            collider='box'
        )
        self.size = 1

    def expand(self):
        self.size += 1
        self.scale = (5 * self.size, 0.5, 5 * self.size)

class Resource(Entity):
    def __init__(self, type='wood'):
        super().__init__(
            model='cube',
            scale=0.5,
            color=color.brown if type == 'wood' else color.gray,
            collider='box'
        )
        self.type = type
        self.respawn()

    def respawn(self):
        x = random.uniform(-20, 20)
        z = random.uniform(-20, 20)
        self.position = (x, 0.5, z)

class Game(Entity):
    def __init__(self):
        super().__init__()
        self.player = Player(position=(0,2,0))
        self.raft = Raft()
        self.resources = []
        self.enemies = []
        self.weather = 'sunny'
        
        # إضافة الموارد
        for _ in range(20):
            self.resources.append(Resource('wood'))
            self.resources.append(Resource('metal'))
        
        # إضافة الأعداء
        for _ in range(5):
            self.enemies.append(AIEnemy())
        
        # إضافة واجهة المحادثة
        self.chat_interface = ChatInterface()
        
        # التعليمات
        self.instructions = Text(
            text='''
            WASD: التحرك | مسافة: القفز | نقر يمين: التقاط/استخدام
            E: توسيع الطوف | 1-3: تغيير الأداة | F: صيد السمك
            B: بناء | R: تغيير الطقس | نقر يسار: هجوم
            T: فتح/إغلاق المحادثة مع الذكاء الاصطناعي
            '''.strip(),
            position=(-0.85, 0.45),
            scale=1,
            color=color.white
        )

    def update(self):
        # تحديث حالة اللعبة
        pass

    def input(self, key):
        if key == 't':
            self.chat_interface.toggle()
        elif key == 'e':
            self.raft.expand()
        elif key in ['1', '2', '3']:
            self.switch_tool(int(key) - 1)
        elif key == 'r':
            self.toggle_weather()

    def switch_tool(self, index):
        if 0 <= index < len(self.player.tools):
            self.player.tool_index = index
            self.player.current_tool = self.player.tools[index]
            print(f'تم التغيير إلى: {self.player.current_tool}')

    def toggle_weather(self):
        if self.weather == 'sunny':
            self.weather = 'rainy'
            scene.fog_density = 0.1
        else:
            self.weather = 'sunny'
            scene.fog_density = 0

# إعداد البيئة
game = Game()
Sky()

# تشغيل اللعبة
app.run()
