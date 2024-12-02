class StoryUI {
    constructor() {
        this.currentChapter = 0;
        this.storyProgress = {
            discoveredSecrets: 0,
            relationWithCreatures: 0,
            researchProgress: 0
        };
        this.setupUI();
    }

    setupUI() {
        // إنشاء عناصر واجهة القصة
        const storyContainer = document.createElement('div');
        storyContainer.id = 'story-container';
        storyContainer.innerHTML = `
            <div id="story-overlay" class="hidden">
                <div id="story-content">
                    <h2 id="story-title"></h2>
                    <p id="story-text"></p>
                    <div id="story-choices"></div>
                    <div id="story-objectives"></div>
                </div>
            </div>
        `;
        document.body.appendChild(storyContainer);

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #story-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            #story-content {
                background: rgba(0, 0, 0, 0.9);
                padding: 2rem;
                border-radius: 10px;
                max-width: 600px;
                color: white;
                font-family: Arial, sans-serif;
                text-align: right;
                direction: rtl;
            }
            .hidden {
                display: none !important;
            }
            .story-choice {
                padding: 10px;
                margin: 5px;
                background: #2c3e50;
                border: none;
                color: white;
                cursor: pointer;
                border-radius: 5px;
            }
            .story-choice:hover {
                background: #34495e;
            }
            .objective {
                padding: 5px;
                margin: 5px 0;
                border-right: 3px solid #27ae60;
            }
            .objective.completed {
                border-right-color: #2ecc71;
                color: #2ecc71;
            }
        `;
        document.head.appendChild(style);
    }

    showStoryEvent(event) {
        const overlay = document.getElementById('story-overlay');
        const title = document.getElementById('story-title');
        const text = document.getElementById('story-text');
        const choices = document.getElementById('story-choices');

        title.textContent = event.title;
        text.textContent = event.text;
        choices.innerHTML = '';

        if (event.choices) {
            event.choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'story-choice';
                button.textContent = choice;
                button.onclick = () => this.makeChoice(choice);
                choices.appendChild(button);
            });
        }

        overlay.classList.remove('hidden');
    }

    showChapter(chapterId) {
        const chapter = gameStory.chapters.find(c => c.id === chapterId);
        if (chapter) {
            this.showStoryEvent(chapter);
            this.showObjectives(chapter.objectives);
        }
    }

    showObjectives(objectives) {
        const objectivesDiv = document.getElementById('story-objectives');
        objectivesDiv.innerHTML = '<h3>الأهداف:</h3>';
        objectives.forEach(objective => {
            const div = document.createElement('div');
            div.className = 'objective';
            div.textContent = objective;
            objectivesDiv.appendChild(div);
        });
    }

    makeChoice(choice) {
        // تأثير الاختيارات على مسار القصة
        switch(choice) {
            case 'استكشف الطوف':
                this.storyProgress.researchProgress += 1;
                break;
            case 'حاول تذكر ما حدث':
                this.storyProgress.discoveredSecrets += 1;
                break;
        }
        
        // تحديث القصة بناءً على التقدم
        this.updateStory();
    }

    updateStory() {
        // تحديث مسار القصة بناءً على تقدم اللاعب
        if (this.storyProgress.discoveredSecrets >= 3) {
            this.showChapter('chapter2');
        } else if (this.storyProgress.researchProgress >= 5) {
            this.showChapter('chapter3');
        }
    }

    // عرض حدث عشوائي من القصة
    triggerRandomEvent() {
        const events = gameStory.randomEvents;
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.showStoryEvent(randomEvent);
    }

    // تحقق من نهاية القصة
    checkEnding() {
        if (this.storyProgress.discoveredSecrets >= 10 && 
            this.storyProgress.relationWithCreatures >= 5) {
            this.showStoryEvent(gameStory.endings.good);
        } else if (this.storyProgress.researchProgress >= 8) {
            this.showStoryEvent(gameStory.endings.neutral);
        } else {
            this.showStoryEvent(gameStory.endings.bad);
        }
    }
}
