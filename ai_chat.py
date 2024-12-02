from transformers import pipeline
import arabic_reshaper
from bidi.algorithm import get_display
import torch
from ai_learning import AILearningSystem
import re

class AIChatSystem:
    def __init__(self):
        # تهيئة نظام التعلم
        self.learning_system = AILearningSystem()
        
        # تهيئة نموذج معالجة اللغة العربية
        self.nlp = pipeline("text-classification", model="CAMeL-Lab/bert-base-arabic-camelbert-mix")
        
        # قائمة الأوامر المتاحة
        self.commands = {
            'هجوم': 'attack',
            'دفاع': 'defend',
            'جمع': 'gather',
            'بناء': 'build',
            'تعاون': 'cooperate',
            'استكشاف': 'explore',
            'صيد': 'fish',
            'مساعدة': 'help',
            'تعلم': 'learn',
            'ابحث': 'search',
            'استراتيجية': 'strategy'
        }
        
        # حالة الذكاء الاصطناعي
        self.current_state = {
            'aggressive': 0.5,
            'cooperative': 0.5,
            'resourceful': 0.5,
            'learning': 0.5
        }
        
        # سجل المحادثة
        self.chat_history = []

    def process_arabic_text(self, text):
        """معالجة النص العربي للعرض الصحيح"""
        reshaped_text = arabic_reshaper.reshape(text)
        return get_display(reshaped_text)

    def analyze_command(self, text):
        """تحليل الأمر المدخل وتحديد الإجراء المناسب"""
        # تحليل النص باستخدام نموذج اللغة العربية
        result = self.nlp(text)[0]
        
        # استخراج الكلمات الرئيسية
        words = text.split()
        command = None
        
        for word in words:
            if word in self.commands:
                command = self.commands[word]
                break
        
        # تحديث حالة الذكاء الاصطناعي بناءً على الأمر
        if command:
            self.update_ai_state(command)
        
        return command, result['score'], text

    def update_ai_state(self, command):
        """تحديث حالة الذكاء الاصطناعي بناءً على الأوامر"""
        if command in ['attack']:
            self.current_state['aggressive'] = min(1.0, self.current_state['aggressive'] + 0.1)
        elif command in ['defend', 'cooperate']:
            self.current_state['cooperative'] = min(1.0, self.current_state['cooperative'] + 0.1)
        elif command in ['gather', 'fish']:
            self.current_state['resourceful'] = min(1.0, self.current_state['resourceful'] + 0.1)
        elif command in ['learn', 'search']:
            self.current_state['learning'] = min(1.0, self.current_state['learning'] + 0.1)

    def get_response(self, text):
        """معالجة أمر المستخدم وإرجاع الرد المناسب"""
        command, confidence, full_text = self.analyze_command(text)
        
        if command == 'learn':
            # استخراج موضوع التعلم
            topic = text.replace('تعلم', '').strip()
            self.learning_system.learn_from_internet(topic, 'user_requested')
            response = f"بدأت التعلم عن: {topic}"
        
        elif command == 'search':
            # البحث في قاعدة المعرفة
            query = text.replace('ابحث', '').strip()
            knowledge = self.learning_system.get_knowledge()
            relevant = []
            for category, items in knowledge.items():
                for item in items:
                    if query.lower() in item['text'].lower():
                        relevant.append(item['text'][:200])
            if relevant:
                response = f"وجدت المعلومات التالية: {relevant[0]}..."
            else:
                response = "لم أجد معلومات متعلقة بهذا الموضوع"
        
        elif command == 'strategy':
            # توليد استراتيجية
            situation = text.replace('استراتيجية', '').strip()
            strategy = self.learning_system.generate_strategy(situation)
            response = strategy
        
        elif command:
            response = self.generate_response(command, confidence)
        else:
            response = "عذراً، لم أفهم الأمر. يمكنك استخدام: هجوم، دفاع، جمع، بناء، تعاون، استكشاف، صيد، مساعدة، تعلم، ابحث، استراتيجية"
        
        # إضافة المحادثة إلى السجل
        self.chat_history.append({
            'user': text,
            'ai': response,
            'command': command,
            'confidence': confidence
        })
        
        return self.process_arabic_text(response)

    def generate_response(self, command, confidence):
        """إنشاء رد مناسب بناءً على الأمر"""
        responses = {
            'attack': [
                "سأهاجم العدو فوراً!",
                "جاري تنفيذ الهجوم...",
                "سأستخدم أفضل استراتيجية للهجوم."
            ],
            'defend': [
                "سأدافع عن المنطقة.",
                "جاري تحصين الموقع...",
                "سأحمي الموارد والطوف."
            ],
            'gather': [
                "سأبحث عن الموارد القريبة.",
                "جاري جمع الموارد...",
                "سأركز على جمع الموارد الضرورية."
            ],
            'build': [
                "سأبدأ في البناء.",
                "جاري تحسين الطوف...",
                "سأضيف منشآت جديدة."
            ],
            'cooperate': [
                "سأتعاون معك.",
                "يمكننا العمل معاً.",
                "سأساعدك في مهمتك."
            ],
            'explore': [
                "سأستكشف المنطقة المحيطة.",
                "جاري البحث عن مناطق جديدة...",
                "سأبحث عن موارد وفرص جديدة."
            ],
            'fish': [
                "سأبدأ في صيد السمك.",
                "جاري البحث عن الأسماك...",
                "سأحاول صيد بعض الأسماك للطعام."
            ],
            'help': [
                "الأوامر المتاحة:\nهجوم: للهجوم على الأعداء\nدفاع: للدفاع عن المنطقة\nجمع: لجمع الموارد\nبناء: لبناء وتحسين الطوف\nتعاون: للعمل معاً\nاستكشاف: لاكتشاف المنطقة\nصيد: لصيد الأسماك\nتعلم: للبحث وتعلم معلومات جديدة\nابحث: للبحث في المعرفة المكتسبة\nاستراتيجية: لتوليد استراتيجية للموقف الحالي",
                "كيف يمكنني مساعدتك؟",
                "أنا هنا للمساعدة!"
            ]
        }
        
        # استخدام المعرفة المكتسبة لتحسين الرد
        knowledge = self.learning_system.apply_knowledge(command)
        if knowledge:
            responses[command].append(f"بناءً على معرفتي: {knowledge['text'][:100]}...")
        
        import random
        return random.choice(responses[command])
