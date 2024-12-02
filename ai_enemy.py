from ursina import *
import random
import numpy as np

class AIEnemy(Entity):
    def __init__(self):
        super().__init__(
            model='cube',
            scale=1,
            color=color.red,
            collider='box'
        )
        self.health = 100
        self.speed = 2
        self.state = 'patrol'
        self.target = None
        self.respawn()
        
        # نظام التعلم
        self.experience = []
        self.learning_rate = 0.1
        
        # الحالات والإجراءات
        self.states = ['patrol', 'chase', 'attack', 'flee']
        self.actions = ['move_forward', 'move_back', 'turn_left', 'turn_right', 'attack']
        
        # مصفوفة Q-learning
        self.q_table = {}
        self.initialize_q_table()

    def initialize_q_table(self):
        """تهيئة جدول Q-learning"""
        for state in self.states:
            self.q_table[state] = {}
            for action in self.actions:
                self.q_table[state][action] = random.random()

    def choose_action(self, state):
        """اختيار إجراء بناءً على الحالة الحالية"""
        if random.random() < 0.1:  # استكشاف
            return random.choice(self.actions)
        else:  # استغلال
            return max(self.q_table[state].items(), key=lambda x: x[1])[0]

    def update_q_table(self, state, action, reward, next_state):
        """تحديث جدول Q-learning"""
        old_value = self.q_table[state][action]
        next_max = max(self.q_table[next_state].values())
        new_value = (1 - self.learning_rate) * old_value + self.learning_rate * (reward + 0.9 * next_max)
        self.q_table[state][action] = new_value

    def get_state(self, player):
        """تحديد الحالة بناءً على المسافة من اللاعب"""
        dist = distance(self, player)
        if dist < 2:
            return 'attack'
        elif dist < 5:
            return 'chase'
        elif dist < 10 and self.health < 50:
            return 'flee'
        else:
            return 'patrol'

    def execute_action(self, action, player):
        """تنفيذ الإجراء المختار"""
        if action == 'move_forward':
            self.position += self.forward * time.dt * self.speed
        elif action == 'move_back':
            self.position -= self.forward * time.dt * self.speed
        elif action == 'turn_left':
            self.rotation_y -= time.dt * 100
        elif action == 'turn_right':
            self.rotation_y += time.dt * 100
        elif action == 'attack' and distance(self, player) < 2:
            return -10 if self.health < 50 else 10
        return 0

    def update(self, player):
        """تحديث حالة العدو"""
        if self.health <= 0:
            self.respawn()
            return
        
        # تحديد الحالة والإجراء
        current_state = self.get_state(player)
        action = self.choose_action(current_state)
        
        # تنفيذ الإجراء وحساب المكافأة
        reward = self.execute_action(action, player)
        
        # تحديث الحالة الجديدة
        next_state = self.get_state(player)
        
        # تحديث جدول Q-learning
        self.update_q_table(current_state, action, reward, next_state)
        
        # تحديث الاتجاه نحو اللاعب
        if current_state in ['chase', 'attack']:
            self.look_at(player)

    def respawn(self):
        """إعادة ظهور العدو في موقع عشوائي"""
        x = random.uniform(-40, 40)
        z = random.uniform(-40, 40)
        self.position = (x, 1, z)
        self.health = 100
