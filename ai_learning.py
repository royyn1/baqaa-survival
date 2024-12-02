import requests
from bs4 import BeautifulSoup
from googlesearch import search
import wikipedia
import json
import os
import openai
from threading import Thread
import time
import torch
import numpy as np
from transformers import pipeline

class AILearningSystem:
    def __init__(self):
        self.knowledge_base = {}
        self.learning_history = []
        self.search_threads = []
        self.is_learning = False
        
        # تهيئة نماذج معالجة اللغة
        self.arabic_classifier = pipeline("text-classification", 
                                       model="CAMeL-Lab/bert-base-arabic-camelbert-mix")
        
        # تحميل قاعدة المعرفة إذا كانت موجودة
        self.load_knowledge_base()
        
        # بدء عملية التعلم المستمر
        self.start_continuous_learning()

    def load_knowledge_base(self):
        """تحميل قاعدة المعرفة من الملف"""
        try:
            if os.path.exists('knowledge_base.json'):
                with open('knowledge_base.json', 'r', encoding='utf-8') as f:
                    self.knowledge_base = json.load(f)
        except Exception as e:
            print(f"خطأ في تحميل قاعدة المعرفة: {e}")

    def save_knowledge_base(self):
        """حفظ قاعدة المعرفة إلى ملف"""
        try:
            with open('knowledge_base.json', 'w', encoding='utf-8') as f:
                json.dump(self.knowledge_base, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"خطأ في حفظ قاعدة المعرفة: {e}")

    def search_wikipedia(self, query, lang='ar'):
        """البحث في ويكيبيديا"""
        try:
            wikipedia.set_lang(lang)
            results = wikipedia.search(query)
            if results:
                page = wikipedia.page(results[0])
                return {
                    'title': page.title,
                    'content': page.content[:500],
                    'url': page.url
                }
        except Exception as e:
            print(f"خطأ في البحث في ويكيبيديا: {e}")
        return None

    def search_web(self, query):
        """البحث في الويب"""
        try:
            search_results = []
            for url in search(query, num_results=5):
                try:
                    response = requests.get(url, timeout=5)
                    soup = BeautifulSoup(response.text, 'html.parser')
                    text = soup.get_text()[:1000]
                    search_results.append({
                        'url': url,
                        'content': text
                    })
                except:
                    continue
            return search_results
        except Exception as e:
            print(f"خطأ في البحث على الويب: {e}")
        return []

    def analyze_and_learn(self, text, category):
        """تحليل النص والتعلم منه"""
        try:
            # تحليل النص باستخدام نموذج اللغة العربية
            analysis = self.arabic_classifier(text)
            
            # استخراج المعلومات المهمة
            important_info = {
                'text': text,
                'category': category,
                'confidence': analysis[0]['score'],
                'timestamp': time.time()
            }
            
            # إضافة إلى قاعدة المعرفة
            if category not in self.knowledge_base:
                self.knowledge_base[category] = []
            self.knowledge_base[category].append(important_info)
            
            # حفظ قاعدة المعرفة
            self.save_knowledge_base()
            
            return True
        except Exception as e:
            print(f"خطأ في التحليل والتعلم: {e}")
            return False

    def learn_from_internet(self, query, category):
        """التعلم من الإنترنت"""
        try:
            # البحث في ويكيبيديا
            wiki_result = self.search_wikipedia(query)
            if wiki_result:
                self.analyze_and_learn(wiki_result['content'], category)
            
            # البحث في الويب
            web_results = self.search_web(query)
            for result in web_results:
                self.analyze_and_learn(result['content'], category)
            
            return True
        except Exception as e:
            print(f"خطأ في التعلم من الإنترنت: {e}")
            return False

    def start_continuous_learning(self):
        """بدء عملية التعلم المستمر في الخلفية"""
        def learning_loop():
            self.is_learning = True
            while self.is_learning:
                try:
                    # قائمة المواضيع للتعلم
                    topics = [
                        'استراتيجيات البقاء على قيد الحياة',
                        'تقنيات بناء القوارب',
                        'صيد الأسماك',
                        'جمع الموارد',
                        'الطقس البحري',
                        'تكتيكات القتال'
                    ]
                    
                    for topic in topics:
                        if not self.is_learning:
                            break
                        self.learn_from_internet(topic, topic)
                        time.sleep(300)  # انتظار 5 دقائق بين كل موضوع
                        
                except Exception as e:
                    print(f"خطأ في حلقة التعلم: {e}")
                    time.sleep(60)
        
        # بدء عملية التعلم في خيط منفصل
        learning_thread = Thread(target=learning_loop, daemon=True)
        learning_thread.start()

    def stop_learning(self):
        """إيقاف عملية التعلم"""
        self.is_learning = False

    def get_knowledge(self, category=None):
        """استرجاع المعرفة المخزنة"""
        if category:
            return self.knowledge_base.get(category, [])
        return self.knowledge_base

    def apply_knowledge(self, situation):
        """تطبيق المعرفة المكتسبة على موقف معين"""
        try:
            relevant_knowledge = []
            
            # البحث عن المعرفة ذات الصلة
            for category, items in self.knowledge_base.items():
                for item in items:
                    if any(word in situation.lower() for word in item['text'].lower().split()):
                        relevant_knowledge.append(item)
            
            if not relevant_knowledge:
                return None
            
            # ترتيب المعرفة حسب الثقة
            relevant_knowledge.sort(key=lambda x: x['confidence'], reverse=True)
            
            return relevant_knowledge[0]
            
        except Exception as e:
            print(f"خطأ في تطبيق المعرفة: {e}")
            return None

    def generate_strategy(self, situation):
        """توليد استراتيجية بناءً على المعرفة المكتسبة"""
        try:
            knowledge = self.apply_knowledge(situation)
            if not knowledge:
                return "لم أجد معرفة كافية لهذا الموقف"
            
            # تحليل الموقف وتوليد استراتيجية
            strategy = f"بناءً على معرفتي، أقترح: {knowledge['text'][:200]}..."
            
            return strategy
            
        except Exception as e:
            print(f"خطأ في توليد الاستراتيجية: {e}")
            return "حدث خطأ في توليد الاستراتيجية"
