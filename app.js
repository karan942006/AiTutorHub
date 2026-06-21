// AITutorHub - Core Application Logic

// --- STATE MANAGEMENT & LOCALSTORAGE DEFAULTS ---
const DEFAULT_KEY = atob('QVEuQWI4Uk42S0NVeU5FaVpjTDFLclZqZTN4V2tNZGNDRi1fZURPRGIwY1FvcjRjSWdQR3c=');

const DEFAULT_STATE = {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    apiKey: DEFAULT_KEY,
    badges: {
        'first-steps': { id: 'first-steps', name: 'First Steps', desc: 'Welcome to AITutorHub!', icon: 'milestone', unlocked: false },
        'chat-novice': { id: 'chat-novice', name: 'AI Scholar', desc: 'Ask the AI Tutor 3 questions', icon: 'message-circle', unlocked: false },
        'quiz-master': { id: 'quiz-master', name: 'Quiz Master', desc: 'Complete a quiz with a perfect score', icon: 'check-square', unlocked: false },
        'goal-planner': { id: 'goal-planner', name: 'Goal Planner', desc: 'Generate a personalized study plan', icon: 'calendar', unlocked: false },
        'navigator': { id: 'navigator', name: 'Path Finder', desc: 'Complete the Career Compass assessment', icon: 'compass', unlocked: false },
        'forum-voice': { id: 'forum-voice', name: 'Active Voice', desc: 'Post a topic or reply on the forums', icon: 'users', unlocked: false }
    },
    tutorHistory: [],
    learningPath: null,
    currentStudyPlan: null,
    careerResponses: null,
    forumThreads: [
        {
            id: 'thread-1',
            title: 'How to understand Calculus limits intuitively?',
            body: 'I am struggling to visualize what a limit actually is. It feels like we are just plugging in numbers, but what does it represent in the real world?',
            author: 'Aarav Sharma',
            date: '2026-06-20T10:30:00Z',
            upvotes: 12,
            replies: [
                { author: 'Teacher Elena', date: '2026-06-20T11:15:00Z', body: 'Think of limits like driving towards a bridge that is out. You can get infinitely close to the edge of the chasm (the limit value) even if you can never stand on the empty air where the bridge used to be. It is about where you are *headed*, not where you *arrive*.' },
                { author: 'Liam Chen', date: '2026-06-20T14:22:00Z', body: 'Wow, that bridge analogy is actually amazing. Thanks!' }
            ]
        },
        {
            id: 'thread-2',
            title: 'Best resources to study for MCAER PG CET?',
            body: 'Hey everyone! I am starting my preparation for the PG CET. What are the key subjects and references I should focus on?',
            author: 'Sanika Patil',
            date: '2026-06-21T08:00:00Z',
            upvotes: 8,
            replies: [
                { author: 'Rohan Deshmukh', date: '2026-06-21T09:45:00Z', body: 'You should focus heavily on Agronomy, Horticulture, and Agriculture Botany. Standard reference textbooks from regional universities are highly recommended!' }
            ]
        }
    ],
    chatCount: 0
};

// Global application state
let appState = {};

// Load state from localStorage or set defaults
function loadAppState() {
    const saved = localStorage.getItem('aitutorhub_state');
    if (saved) {
        try {
            appState = JSON.parse(saved);
            // Merge defaults in case new fields were added
            appState.badges = { ...DEFAULT_STATE.badges, ...appState.badges };
            if (!appState.forumThreads) appState.forumThreads = DEFAULT_STATE.forumThreads;
            if (appState.chatCount === undefined) appState.chatCount = 0;
            // Fill default API key if empty or placeholder
            if (!appState.apiKey || appState.apiKey === 'placeholder' || appState.apiKey === '') {
                appState.apiKey = DEFAULT_KEY;
            }
        } catch (e) {
            console.error("Error parsing saved state, resetting...", e);
            appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    } else {
        appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    
    // Auto unlock the first steps badge on load
    unlockBadge('first-steps');
    checkStreakOnLoad();
    updateUIHeader();
}

// Save state to localStorage
function saveAppState() {
    localStorage.setItem('aitutorhub_state', JSON.stringify(appState));
}

// --- APPDATA UPDATE FUNCTIONS ---
function addXP(amount) {
    appState.xp += amount;
    showToast(`+${amount} XP Earned!`);
    
    // Level calculation (500 XP per level)
    const newLevel = Math.floor(appState.xp / 500) + 1;
    if (newLevel > appState.level) {
        appState.level = newLevel;
        showToast(`🎉 Level Up! You are now Level ${newLevel}!`, 'award');
    }
    
    updateUIHeader();
    saveAppState();
    // Refresh dashboard and leaderboard if they are open
    if (activeTab === 'dashboard') renderDashboard();
    if (activeTab === 'leaderboard') renderLeaderboard();
}

function unlockBadge(badgeId) {
    if (appState.badges[badgeId] && !appState.badges[badgeId].unlocked) {
        appState.badges[badgeId].unlocked = true;
        showToast(`🏆 Badge Unlocked: ${appState.badges[badgeId].name}!`, 'award');
        saveAppState();
        if (activeTab === 'dashboard') renderDashboard();
    }
}

function checkStreakOnLoad() {
    const today = new Date().toDateString();
    if (appState.lastActiveDate === today) return; // Already active today

    if (appState.lastActiveDate) {
        const lastDate = new Date(appState.lastActiveDate);
        const diffTime = Math.abs(new Date(today) - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Studied yesterday, increment streak
            appState.streak += 1;
            showToast(`🔥 Streak continued! ${appState.streak} Days active.`, 'flame');
        } else if (diffDays > 1) {
            // Lost streak
            appState.streak = 1;
            showToast(`🔥 New streak started! Welcome back.`, 'flame');
        }
    } else {
        appState.streak = 1;
    }
    
    appState.lastActiveDate = today;
    saveAppState();
}

// --- TAB ROUTING ---
let activeTab = 'home';
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-pane');

function switchTab(tabId) {
    activeTab = tabId;
    
    // Update nav buttons
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update views
    views.forEach(view => {
        if (view.id === `view-${tabId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('hidden');
            view.classList.remove('active');
        }
    });

    // Scroll main panel to top
    document.querySelector('.main-content').scrollTop = 0;

    // View-specific renderer
    if (tabId === 'dashboard') {
        renderDashboard();
    } else if (tabId === 'leaderboard') {
        renderLeaderboard();
    } else if (tabId === 'forum') {
        renderForums();
    }
}

// Event Listeners for tabs
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
    });
});

document.getElementById('hero-start-learning').addEventListener('click', () => {
    switchTab('dashboard');
});

// --- UI UPDATERS ---
function updateUIHeader() {
    document.getElementById('stat-xp').textContent = `${appState.xp} XP`;
    document.getElementById('stat-level').textContent = `Lvl ${appState.level}`;
    document.getElementById('stat-streak').textContent = `${appState.streak} Days`;
    
    const keyBadge = document.getElementById('key-status-badge');
    if (appState.apiKey) {
        keyBadge.className = 'badge-status status-active';
        keyBadge.textContent = 'API Key Configured';
    } else {
        keyBadge.className = 'badge-status status-missing';
        keyBadge.textContent = 'API Key Missing';
    }
}

// Toast Notification
function showToast(message, iconName = 'info') {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    toastMsg.textContent = message;
    toastIcon.setAttribute('data-lucide', iconName);
    lucide.createIcons();
    
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// --- GEMINI API INTEGATION CLIENT ---
async function callGemini(systemPrompt, userPrompt, jsonFormat = false) {
    if (!appState.apiKey) {
        openSettingsModal();
        showToast('Please set your Gemini API key in settings.', 'key');
        throw new Error('Gemini API key not configured.');
    }

    const fullPrompt = `${systemPrompt}\n\nUser Input/Topic:\n${userPrompt}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${appState.apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: fullPrompt }
                    ]
                }
            ],
            // Request JSON mode if format flag is true
            generationConfig: jsonFormat ? {
                responseMimeType: "application/json"
            } : {}
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        throw new Error("Received empty response from Gemini model.");
    }
    
    return text.trim();
}

// Settings modal trigger
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings-btn');
const heroSetupBtn = document.getElementById('hero-setup-key');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveApiKeyBtn = document.getElementById('btn-save-api-key');
const clearApiKeyBtn = document.getElementById('btn-clear-api-key');
const apiKeyInput = document.getElementById('gemini-api-key-input');

function openSettingsModal() {
    apiKeyInput.value = appState.apiKey || '';
    settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
    settingsModal.classList.add('hidden');
}

openSettingsBtn.addEventListener('click', openSettingsModal);
heroSetupBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);

saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        showToast('Please input a valid key.', 'alert-triangle');
        return;
    }
    appState.apiKey = key;
    saveAppState();
    updateUIHeader();
    closeSettingsModal();
    showToast('Gemini API credentials saved successfully!', 'check-circle-2');
});

clearApiKeyBtn.addEventListener('click', () => {
    appState.apiKey = '';
    apiKeyInput.value = '';
    saveAppState();
    updateUIHeader();
    closeSettingsModal();
    showToast('Gemini API credentials cleared.', 'trash-2');
});

// --- DASHBOARD RENDER ---
function renderDashboard() {
    // Welcome and levels
    document.getElementById('dash-username').textContent = 'Learner';
    document.getElementById('dash-total-xp').textContent = `${appState.xp} XP`;
    document.getElementById('dash-current-level').textContent = appState.level;
    document.getElementById('dash-next-level').textContent = appState.level + 1;
    
    // XP Progress
    const xpInLevel = appState.xp % 500;
    const progressPercent = Math.floor((xpInLevel / 500) * 100);
    document.getElementById('dash-xp-progress-percent').textContent = `${progressPercent}%`;
    document.getElementById('dash-xp-progress-fill').style.width = `${progressPercent}%`;

    // Render badges
    const shelf = document.getElementById('badges-shelf');
    shelf.innerHTML = '';
    Object.values(appState.badges).forEach(badge => {
        const item = document.createElement('div');
        item.className = `badge-item ${badge.unlocked ? 'unlocked' : ''}`;
        item.title = `${badge.name}: ${badge.desc}`;
        item.innerHTML = `
            <div class="badge-icon-wrap" style="${badge.unlocked ? '' : 'background: #cbd5e1; box-shadow: none'}">
                <i data-lucide="${badge.icon}"></i>
            </div>
            <span>${badge.name}</span>
        `;
        shelf.appendChild(item);
    });
    
    // Render learning path
    renderLearningPath();
    renderPredictions();
    lucide.createIcons();
}

function renderLearningPath() {
    const container = document.getElementById('learning-path-content');
    if (!appState.learningPath) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="milestone" style="width: 48px; height: 48px; margin-bottom: 0.5rem; color: var(--text-muted);"></i>
                <p style="font-size: 0.9rem; color: var(--text-muted); text-align: center;">You don't have an active learning path. Generate one to start adaptive lessons.</p>
                <button class="btn btn-primary btn-sm" id="btn-create-path" style="margin-top: 1rem;">Setup Learning Path</button>
            </div>
        `;
        document.getElementById('btn-create-path').addEventListener('click', buildLearningPathDialog);
        lucide.createIcons();
        return;
    }

    container.innerHTML = '';
    appState.learningPath.lessons.forEach((lesson, index) => {
        const node = document.createElement('div');
        node.className = `timeline-node ${lesson.completed ? 'completed' : ''}`;
        node.innerHTML = `
            <div class="node-icon">
                <i data-lucide="${lesson.completed ? 'check' : 'book-open'}"></i>
            </div>
            <div class="node-content">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>Unit ${index + 1}: ${lesson.title}</h4>
                    ${!lesson.completed ? `<button class="btn btn-sm btn-primary" onclick="studyLessonNode(${index})">Study</button>` : '<span class="text-teal" style="font-size: 0.8rem; font-weight: 600;"><i data-lucide="check" style="display: inline-block; width: 14px; height: 14px; vertical-align: middle;"></i> Completed</span>'}
                </div>
                <p>${lesson.description}</p>
            </div>
        `;
        container.appendChild(node);
    });
}

function renderPredictions() {
    const engagement = document.getElementById('pred-engagement');
    const completion = document.getElementById('pred-completion');
    const weakness = document.getElementById('pred-weakness');

    if (appState.xp < 100) {
        engagement.textContent = 'Initiating...';
        completion.textContent = 'Need more data';
        weakness.textContent = 'Study some topics first';
    } else {
        engagement.className = 'pred-value text-teal';
        engagement.textContent = appState.streak > 3 ? 'Ultra High' : 'Good / Steady';
        completion.textContent = 'Approx. 3 weeks';
        weakness.textContent = 'Review Quiz history to identify';
    }
}

async function buildLearningPathDialog() {
    const goal = prompt("What main subject or topic are you learning? (e.g. High School Biology, Web Development with HTML/CSS, Algebra 1)");
    if (!goal) return;

    showToast("Generating custom curriculum nodes...", "loader");
    
    const sysPrompt = "You are an expert curriculum planner for under-resourced students. Design an adaptive study roadmap of exactly 4 sequentially building modules. Output ONLY a valid JSON object containing an array of objects named 'lessons'. Each lesson object must contain 'title' and 'description'. Do not add any formatting code fences or introductory texts.";
    const userPrompt = `Subject to master: "${goal}". Provide 4 modules from absolute basics to intermediate application.`;
    
    try {
        const resText = await callGemini(sysPrompt, userPrompt, true);
        const data = JSON.parse(cleanJSONString(resText));
        
        appState.learningPath = {
            goal: goal,
            lessons: data.lessons.map(l => ({ ...l, completed: false }))
        };
        
        saveAppState();
        renderDashboard();
        showToast("Adaptive learning path created!", "check-circle-2");
    } catch (e) {
        console.error(e);
        showToast("Failed to generate learning path. Try again.", "alert-triangle");
    }
}

document.getElementById('btn-rebuild-path').addEventListener('click', buildLearningPathDialog);

window.studyLessonNode = function(index) {
    const lesson = appState.learningPath.lessons[index];
    switchTab('tutor');
    
    // Inject tutorial setup into tutor chat
    const tutorMsgContainer = document.getElementById('tutor-chat-messages');
    tutorMsgContainer.innerHTML = `
        <div class="message system-msg">
            <p>Welcome to Module ${index + 1}: <strong>${lesson.title}</strong>. Ask me to teach this topic, explain its basics, or write a practical quiz for it.</p>
        </div>
    `;
    
    // Automatically trigger AI text
    document.getElementById('tutor-text-input').value = `Please explain the basics of "${lesson.title}": ${lesson.description}`;
    
    // Set node to completed
    appState.learningPath.lessons[index].completed = true;
    addXP(100);
    saveAppState();
};

// Clean JSON helper
function cleanJSONString(str) {
    return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

// --- AI TUTOR (TEXT & VOICE) ---
const tutorMicBtn = document.getElementById('tutor-mic-btn');
const tutorTextInput = document.getElementById('tutor-text-input');
const tutorSendBtn = document.getElementById('tutor-send-btn');
const tutorMessages = document.getElementById('tutor-chat-messages');
const tutorVoiceToggle = document.getElementById('tutor-voice-toggle');
const tutorClearChat = document.getElementById('tutor-clear-chat');

let voiceEnabled = true;
let recognition = null;
let isRecording = false;

// Initialize Web Speech API for voice recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        tutorMicBtn.classList.add('recording');
        showToast("Tutor is listening...", "mic");
    };

    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        tutorTextInput.value = speechToText;
        sendTutorMessage();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isRecording = false;
        tutorMicBtn.classList.remove('recording');
        showToast("Speech recognition failed: " + event.error, "alert-circle");
    };

    recognition.onend = () => {
        isRecording = false;
        tutorMicBtn.classList.remove('recording');
    };
} else {
    tutorMicBtn.style.display = 'none'; // Speech recognition not supported
}

// Microphone Click Handler
tutorMicBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

// Voice Toggle Handler
tutorVoiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    if (voiceEnabled) {
        tutorVoiceToggle.classList.remove('btn-secondary');
        tutorVoiceToggle.innerHTML = '<i data-lucide="volume-2"></i>';
        showToast("Voice Tutor output enabled");
    } else {
        tutorVoiceToggle.classList.add('btn-secondary');
        tutorVoiceToggle.innerHTML = '<i data-lucide="volume-x"></i>';
        window.speechSynthesis.cancel();
        showToast("Voice Tutor output muted");
    }
    lucide.createIcons();
});

tutorClearChat.addEventListener('click', () => {
    tutorMessages.innerHTML = `
        <div class="message system-msg">
            <p>Chat cleared. Ask me any learning questions.</p>
        </div>
    `;
    window.speechSynthesis.cancel();
});

async function sendTutorMessage() {
    const query = tutorTextInput.value.trim();
    if (!query) return;

    // Append User message
    appendMessage(query, 'user-msg');
    tutorTextInput.value = '';

    // Scroll to bottom
    tutorMessages.scrollTop = tutorMessages.scrollHeight;

    const loadingId = appendMessage('AI is thinking...', 'ai-msg loading');
    
    try {
        const systemPrompt = "You are AITutorHub, a highly patient, structured personal learning assistant. Provide structured, intuitive explanations using clear Markdown formats. Wrap equations or code samples correctly. Complete answers in under 150 words when possible.";
        const response = await callGemini(systemPrompt, query);
        
        // Remove loading state
        document.getElementById(loadingId).remove();
        
        appendMessage(response, 'ai-msg');
        
        // Speak response if voice output enabled
        if (voiceEnabled) {
            speakResponse(response);
        }

        // Gamification XP
        appState.chatCount += 1;
        if (appState.chatCount >= 3) {
            unlockBadge('chat-novice');
        }
        addXP(10);
    } catch (e) {
        console.error(e);
        document.getElementById(loadingId).remove();
        appendMessage(`Sorry, I encountered an error: ${e.message}. Please configure your API key.`, 'ai-msg error');
    }
    
    tutorMessages.scrollTop = tutorMessages.scrollHeight;
}

tutorSendBtn.addEventListener('click', sendTutorMessage);
tutorTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendTutorMessage();
});

function appendMessage(text, className) {
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const bubble = document.createElement('div');
    bubble.className = `message ${className}`;
    bubble.id = msgId;
    
    if (className.includes('ai-msg') && !className.includes('loading')) {
        bubble.innerHTML = parseMarkdown(text);
    } else {
        bubble.textContent = text;
    }
    
    tutorMessages.appendChild(bubble);
    return msgId;
}

// Custom Markdown parser for client-side rendering without external libraries
function parseMarkdown(text) {
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Pre-formatted code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Blockquotes
    html = html.replace(/^\s*>\s*(.+)/gm, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^\s*[-*+]\s+(.+)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Paragraph breaks
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('<pre>') || p.trim().startsWith('<ul>') || p.trim().startsWith('<blockquote>')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

function speakResponse(text) {
    window.speechSynthesis.cancel(); // Terminate existing synthesis
    
    // Strip markdown formatting symbols before speaking
    const cleanText = text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[-*#>_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
}

// --- AI QUIZZES ---
let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizTimerInterval = null;
let quizSeconds = 0;

const quizSetupPanel = document.getElementById('quiz-setup-panel');
const quizActivePanel = document.getElementById('quiz-active-panel');
const quizResultsPanel = document.getElementById('quiz-results-panel');

const btnGenerateQuiz = document.getElementById('btn-generate-quiz');
const activeTopicBadge = document.getElementById('quiz-active-topic');
const timeDisplay = document.getElementById('quiz-time-display');
const progressFill = document.getElementById('quiz-progress-fill');
const counterText = document.getElementById('quiz-question-counter');
const questionText = document.getElementById('quiz-question-text');
const optionsContainer = document.getElementById('quiz-options-container');

const btnQuizPrev = document.getElementById('btn-quiz-prev');
const btnQuizNext = document.getElementById('btn-quiz-next');
const btnQuizRestart = document.getElementById('btn-quiz-restart');

btnGenerateQuiz.addEventListener('click', async () => {
    const topic = document.getElementById('quiz-topic').value.trim();
    const diff = document.getElementById('quiz-difficulty').value;
    const count = parseInt(document.getElementById('quiz-count').value);

    if (!topic) {
        showToast('Please type a quiz topic.', 'alert-triangle');
        return;
    }

    showToast('AI is compiling quiz questions...', 'loader');
    
    const systemPrompt = `You are a dynamic educator quiz generator. Output ONLY a valid JSON array of objects representing a multiple-choice quiz.
The quiz MUST contain exactly ${count} questions.
JSON structure formatting target:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]
Do not output markdown code fences, comments, or intro/outro sentences. Output pure JSON only.`;

    const userPrompt = `Topic: "${topic}". Difficulty level: "${diff}". Generate exactly ${count} multiple choice questions.`;

    try {
        const result = await callGemini(systemPrompt, userPrompt, true);
        activeQuiz = JSON.parse(cleanJSONString(result));
        
        // Start quiz
        currentQuestionIndex = 0;
        userAnswers = Array(activeQuiz.length).fill(null);
        
        quizSetupPanel.classList.add('hidden');
        quizActivePanel.classList.remove('hidden');
        quizResultsPanel.classList.add('hidden');
        
        activeTopicBadge.textContent = topic;
        startQuizTimer();
        loadQuestion(0);
    } catch (e) {
        console.error(e);
        showToast('Failed to compile quiz: ' + e.message, 'alert-triangle');
    }
});

function startQuizTimer() {
    quizSeconds = 0;
    clearInterval(quizTimerInterval);
    timeDisplay.textContent = '00:00';
    quizTimerInterval = setInterval(() => {
        quizSeconds++;
        const mins = Math.floor(quizSeconds / 60).toString().padStart(2, '0');
        const secs = (quizSeconds % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function loadQuestion(index) {
    const question = activeQuiz[index];
    questionText.textContent = question.question;
    
    // Progress
    const progressPercent = Math.floor(((index + 1) / activeQuiz.length) * 100);
    progressFill.style.width = `${progressPercent}%`;
    counterText.textContent = `Question ${index + 1} of ${activeQuiz.length}`;

    // Options
    optionsContainer.innerHTML = '';
    question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (userAnswers[index] === idx) btn.classList.add('selected');
        
        btn.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + idx)}</div>
            <span>${opt}</span>
        `;
        
        btn.addEventListener('click', () => {
            selectOption(idx);
        });
        optionsContainer.appendChild(btn);
    });

    // Navigation buttons
    if (index === 0) {
        btnQuizPrev.classList.add('hidden');
    } else {
        btnQuizPrev.classList.remove('hidden');
    }

    if (index === activeQuiz.length - 1) {
        btnQuizNext.innerHTML = 'Submit Quiz <i data-lucide="check"></i>';
    } else {
        btnQuizNext.innerHTML = 'Next <i data-lucide="chevron-right"></i>';
    }
    lucide.createIcons();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Re-render options to show select state
    const btns = optionsContainer.querySelectorAll('.option-btn');
    btns.forEach((btn, idx) => {
        if (idx === optionIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

btnQuizPrev.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

btnQuizNext.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] === null) {
        showToast('Please select an option before proceeding.', 'alert-circle');
        return;
    }

    if (currentQuestionIndex < activeQuiz.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        // Complete Quiz
        completeQuiz();
    }
});

function completeQuiz() {
    clearInterval(quizTimerInterval);
    
    let correctCount = 0;
    activeQuiz.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) {
            correctCount++;
        }
    });

    // Calculate XP
    const baseXP = correctCount * 50;
    const perfectBonus = correctCount === activeQuiz.length ? 100 : 0;
    const totalEarnedXP = baseXP + perfectBonus;
    
    addXP(totalEarnedXP);
    
    if (correctCount === activeQuiz.length) {
        unlockBadge('quiz-master');
    }

    // Update results pane
    document.getElementById('results-score').textContent = `${correctCount} / ${activeQuiz.length}`;
    document.getElementById('reward-xp').textContent = `+${totalEarnedXP} XP`;

    // Render Review list
    const reviewContainer = document.getElementById('quiz-review-container');
    reviewContainer.innerHTML = '<h3>Detailed Question Review</h3>';
    activeQuiz.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        
        const isCorrect = userAnswers[idx] === q.correctIndex;
        
        item.innerHTML = `
            <h5>${idx + 1}. ${q.question}</h5>
            <div class="review-meta">
                <span class="${isCorrect ? 'review-correct' : 'review-wrong'}">
                    <strong>Your Answer:</strong> ${q.options[userAnswers[idx]]} ${isCorrect ? '✓' : '✗'}
                </span>
                ${!isCorrect ? `<span><strong>Correct Answer:</strong> ${q.options[q.correctIndex]}</span>` : ''}
            </div>
        `;
        reviewContainer.appendChild(item);
    });

    quizActivePanel.classList.add('hidden');
    quizResultsPanel.classList.remove('hidden');
}

btnQuizRestart.addEventListener('click', () => {
    quizSetupPanel.classList.remove('hidden');
    quizActivePanel.classList.add('hidden');
    quizResultsPanel.classList.add('hidden');
});

// --- STUDY PLANNER ---
const btnGeneratePlan = document.getElementById('btn-generate-plan');
const planGoalInput = document.getElementById('plan-goal');
const planDurationInput = document.getElementById('plan-duration');
const planIntensityInput = document.getElementById('plan-intensity');
const plannerScheduleContainer = document.getElementById('planner-schedule-container');

btnGeneratePlan.addEventListener('click', async () => {
    const goal = planGoalInput.value.trim();
    const duration = planDurationInput.value;
    const intensity = planIntensityInput.value;

    if (!goal) {
        showToast('Please type a learning goal.', 'alert-triangle');
        return;
    }

    showToast('Gemini is tailoring your study timeline...', 'loader');

    const systemPrompt = `You are a study calendar planner. Output ONLY a valid JSON object matching the requested schema. No markdown fences or annotations.
Required schema:
{
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1 Broad Theme",
      "days": [
        {
          "dayNumber": 1,
          "title": "Day 1 study topic",
          "description": "Specific focus item and resources (e.g. read chapter 1, do 3 exercises)"
        }
      ]
    }
  ]
}
Design details: Include exactly ${duration} weeks. Provide exactly 3 major day study nodes per week to avoid overwhelming students.`;

    const userPrompt = `Learning goal: "${goal}". Target schedule duration: ${duration} weeks. Commitment intensity: "${intensity}".`;

    try {
        const resText = await callGemini(systemPrompt, userPrompt, true);
        const data = JSON.parse(cleanJSONString(resText));

        appState.currentStudyPlan = data;
        saveAppState();
        renderStudyPlan();
        
        unlockBadge('goal-planner');
        addXP(50);
    } catch (e) {
        console.error(e);
        showToast('Failed to generate study schedule: ' + e.message, 'alert-triangle');
    }
});

function renderStudyPlan() {
    if (!appState.currentStudyPlan) return;

    plannerScheduleContainer.innerHTML = '';
    appState.currentStudyPlan.weeks.forEach(week => {
        const weekWrap = document.createElement('div');
        weekWrap.className = 'timeline-week';
        weekWrap.innerHTML = `<h4>Week ${week.weekNumber}: ${week.title}</h4>`;

        week.days.forEach(day => {
            const dayNode = document.createElement('div');
            dayNode.className = 'timeline-day';
            dayNode.innerHTML = `
                <div class="day-badge">Day ${day.dayNumber}</div>
                <div class="day-content">
                    <h5>${day.title}</h5>
                    <p>${day.description}</p>
                </div>
            `;
            weekWrap.appendChild(dayNode);
        });

        plannerScheduleContainer.appendChild(weekWrap);
    });
}

// Initial render if plan exists
renderStudyPlan();

// --- CAREER COMPASS ---
let careerIndex = 0;
let careerAnswers = [];

const CAREER_QUESTIONS = [
    {
        q: "Which general subject excites you the most in school?",
        opts: ["Solving Math & Coding Problems", "Studying plants, animals, and earth systems", "Reading literature and creative writing", "Understanding society, history, and people"]
    },
    {
        q: "What is your preferred method of building or learning things?",
        opts: ["Designing systems and coding apps", "Doing hands-on laboratory or field work", "Writing, drawing, or media creation", "Teaching, coaching, or organizing team work"]
    },
    {
        q: "Which global issue do you feel most passionate about solving?",
        opts: ["Digitization and technology divides", "Climate change and clean food resources", "Cultural preservation and artistic expression", "Poverty, health, and education access"]
    },
    {
        q: "How do you prefer to handle challenging problems?",
        opts: ["Logical analysis and debugging files", "Experimental testing and observation", "Creative thinking and brainstorming alternative ideas", "Collaborating and discussing with a team"]
    }
];

const careerStartPanel = document.getElementById('career-start-panel');
const careerQuizPanel = document.getElementById('career-quiz-panel');
const careerResultsPanel = document.getElementById('career-results-panel');

const btnStartCareer = document.getElementById('btn-start-career-test');
const btnRestartCareer = document.getElementById('btn-restart-career');
const careerProgress = document.getElementById('career-progress-fill');
const careerCounter = document.getElementById('career-question-counter');
const careerQText = document.getElementById('career-question-text');
const careerOptsContainer = document.getElementById('career-options-container');

btnStartCareer.addEventListener('click', () => {
    careerIndex = 0;
    careerAnswers = [];
    careerStartPanel.classList.add('hidden');
    careerQuizPanel.classList.remove('hidden');
    careerResultsPanel.classList.add('hidden');
    loadCareerQuestion(0);
});

function loadCareerQuestion(index) {
    const q = CAREER_QUESTIONS[index];
    careerQText.textContent = q.q;
    careerCounter.textContent = `Question ${index + 1} of ${CAREER_QUESTIONS.length}`;
    
    const progress = Math.floor(((index + 1) / CAREER_QUESTIONS.length) * 100);
    careerProgress.style.width = `${progress}%`;

    careerOptsContainer.innerHTML = '';
    q.opts.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <div class="option-label">${idx + 1}</div>
            <span>${opt}</span>
        `;
        btn.addEventListener('click', () => {
            selectCareerOption(index, opt);
        });
        careerOptsContainer.appendChild(btn);
    });
}

function selectCareerOption(questionIndex, chosenText) {
    careerAnswers.push({ question: CAREER_QUESTIONS[questionIndex].q, answer: chosenText });
    
    if (careerIndex < CAREER_QUESTIONS.length - 1) {
        careerIndex++;
        loadCareerQuestion(careerIndex);
    } else {
        evaluateCareerCompass();
    }
}

async function evaluateCareerCompass() {
    showToast('AI is compiling career directions...', 'loader');
    
    const systemPrompt = `You are an academic career counselor. Analyze the student assessment responses and output ONLY a valid JSON array of objects representing matching careers.
Return exactly 2 recommended paths.
JSON schema format required:
[
  {
    "title": "Career Path Title",
    "description": "Brief summary of career path details.",
    "topics": ["Key Subject 1", "Key Subject 2", "Key Subject 3", "Key Subject 4"]
  }
]
Do not output markdown code fences, comments, or intro sentences. Output pure JSON.`;

    const userPrompt = `Student assessment survey replies:
${JSON.stringify(careerAnswers, null, 2)}`;

    try {
        const resText = await callGemini(systemPrompt, userPrompt, true);
        const data = JSON.parse(cleanJSONString(resText));

        appState.careerResponses = data;
        saveAppState();
        renderCareerResults();
        
        unlockBadge('navigator');
        addXP(100);
    } catch (e) {
        console.error(e);
        showToast('Failed to compile career guide: ' + e.message, 'alert-triangle');
    }
}

function renderCareerResults() {
    if (!appState.careerResponses) return;

    const cardsGrid = document.getElementById('career-results-cards');
    cardsGrid.innerHTML = '';

    appState.careerResponses.forEach(career => {
        const card = document.createElement('div');
        card.className = 'career-result-card';
        card.innerHTML = `
            <h3>${career.title}</h3>
            <p>${career.description}</p>
            <div class="blueprint-topics">
                <h5>Recommended Study Topics</h5>
                <ul>
                    ${career.topics.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
        `;
        cardsGrid.appendChild(card);
    });

    careerQuizPanel.classList.add('hidden');
    careerResultsPanel.classList.remove('hidden');
}

btnRestartCareer.addEventListener('click', () => {
    careerStartPanel.classList.remove('hidden');
    careerQuizPanel.classList.add('hidden');
    careerResultsPanel.classList.add('hidden');
});

// --- DISCUSSION FORUM ---
const threadDetailEmpty = document.getElementById('forum-detail-empty');
const threadDetailView = document.getElementById('forum-detail-view');
const threadsScroll = document.getElementById('forum-threads-container');
const btnNewThread = document.getElementById('btn-new-thread');
const newThreadModal = document.getElementById('new-thread-modal');
const closeThreadBtn = document.getElementById('close-thread-modal-btn');
const cancelThreadBtn = document.getElementById('btn-cancel-thread');
const submitThreadBtn = document.getElementById('btn-submit-thread');
const searchThreadInput = document.getElementById('forum-search-input');

const threadTitleDisplay = document.getElementById('thread-title-display');
const threadAuthorDisplay = document.getElementById('thread-author-name');
const threadDateDisplay = document.getElementById('thread-post-date');
const threadBodyDisplay = document.getElementById('thread-body-display');
const threadUpvotes = document.getElementById('thread-upvotes-count');
const btnUpvoteThread = document.getElementById('btn-upvote-thread');
const replyList = document.getElementById('thread-replies-list');
const replyTextarea = document.getElementById('reply-textarea');
const submitReplyBtn = document.getElementById('btn-submit-reply');

let selectedThreadId = null;

function renderForums(filterText = '') {
    threadsScroll.innerHTML = '';
    
    const filtered = appState.forumThreads.filter(t => 
        t.title.toLowerCase().includes(filterText.toLowerCase()) || 
        t.body.toLowerCase().includes(filterText.toLowerCase())
    );

    filtered.forEach(thread => {
        const item = document.createElement('div');
        item.className = `forum-thread-item ${selectedThreadId === thread.id ? 'active' : ''}`;
        item.innerHTML = `
            <h4>${thread.title}</h4>
            <div class="thread-item-meta">
                <span>By ${thread.author}</span>
                <span>${thread.replies.length} replies</span>
            </div>
        `;
        item.addEventListener('click', () => {
            selectThread(thread.id);
        });
        threadsScroll.appendChild(item);
    });
}

function selectThread(threadId) {
    selectedThreadId = threadId;
    
    // Toggle active classes on items
    const items = threadsScroll.querySelectorAll('.forum-thread-item');
    renderForums(searchThreadInput.value);

    const thread = appState.forumThreads.find(t => t.id === threadId);
    if (!thread) return;

    threadDetailEmpty.classList.add('hidden');
    threadDetailView.classList.remove('hidden');

    threadTitleDisplay.textContent = thread.title;
    threadAuthorDisplay.textContent = thread.author;
    threadDateDisplay.textContent = new Date(thread.date).toLocaleDateString();
    threadBodyDisplay.textContent = thread.body;
    threadUpvotes.textContent = thread.upvotes;

    // Load replies
    replyList.innerHTML = '';
    thread.replies.forEach(reply => {
        const rCard = document.createElement('div');
        rCard.className = 'forum-reply-card';
        rCard.innerHTML = `
            <div class="reply-meta">
                <strong>${reply.author}</strong> • <span>${new Date(reply.date || Date.now()).toLocaleDateString()}</span>
            </div>
            <div class="reply-content">${reply.body}</div>
        `;
        replyList.appendChild(rCard);
    });
    
    replyList.scrollTop = replyList.scrollHeight;
}

btnUpvoteThread.addEventListener('click', () => {
    if (!selectedThreadId) return;
    const thread = appState.forumThreads.find(t => t.id === selectedThreadId);
    if (thread) {
        thread.upvotes++;
        threadUpvotes.textContent = thread.upvotes;
        saveAppState();
    }
});

submitReplyBtn.addEventListener('click', () => {
    const text = replyTextarea.value.trim();
    if (!text) return;

    const thread = appState.forumThreads.find(t => t.id === selectedThreadId);
    if (thread) {
        thread.replies.push({
            author: 'You (Learner)',
            date: new Date().toISOString(),
            body: text
        });
        replyTextarea.value = '';
        saveAppState();
        selectThread(selectedThreadId);
        
        unlockBadge('forum-voice');
        addXP(25);
    }
});

// Modal toggle
btnNewThread.addEventListener('click', () => {
    newThreadModal.classList.remove('hidden');
});

function closeForumModal() {
    newThreadModal.classList.add('hidden');
    document.getElementById('new-thread-title').value = '';
    document.getElementById('new-thread-body').value = '';
}

closeThreadBtn.addEventListener('click', closeForumModal);
cancelThreadBtn.addEventListener('click', closeForumModal);

submitThreadBtn.addEventListener('click', () => {
    const title = document.getElementById('new-thread-title').value.trim();
    const body = document.getElementById('new-thread-body').value.trim();

    if (!title || !body) {
        showToast('Please fill out all fields.', 'alert-triangle');
        return;
    }

    const newThread = {
        id: 'thread-' + Date.now(),
        title: title,
        body: body,
        author: 'You (Learner)',
        date: new Date().toISOString(),
        upvotes: 0,
        replies: []
    };

    appState.forumThreads.unshift(newThread);
    saveAppState();
    closeForumModal();
    renderForums();
    selectThread(newThread.id);
    
    unlockBadge('forum-voice');
    addXP(50);
});

searchThreadInput.addEventListener('input', (e) => {
    renderForums(e.target.value);
});

// --- LEADERBOARD ---
const RANKING_MOCKS = [
    { name: 'Sofia Rodriguez', country: 'Mexico', xp: 2450 },
    { name: 'Hiroshi Sato', country: 'Japan', xp: 2100 },
    { name: 'Maya Lin', country: 'Taiwan', xp: 1850 },
    { name: 'Liam Chen', country: 'Canada', xp: 1400 },
    { name: 'Aarav Sharma', country: 'India', xp: 950 }
];

function renderLeaderboard() {
    const container = document.getElementById('ranking-list-container');
    container.innerHTML = '';

    // Create list containing mock users + current user
    const currentUserRow = { name: 'You (Learner)', country: 'Local Workspace', xp: appState.xp, isUser: true };
    const allUsers = [...RANKING_MOCKS, currentUserRow];
    
    // Sort descending by XP
    allUsers.sort((a, b) => b.xp - a.xp);

    allUsers.forEach((user, index) => {
        const row = document.createElement('div');
        row.className = `ranking-row ${user.isUser ? 'current-user' : ''}`;
        
        let rankBadgeClass = '';
        if (index === 0) rankBadgeClass = 'rank-number-1';
        else if (index === 1) rankBadgeClass = 'rank-number-2';
        else if (index === 2) rankBadgeClass = 'rank-number-3';

        row.innerHTML = `
            <div class="rank-number ${rankBadgeClass}">${index + 1}</div>
            <div class="rank-avatar">${user.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="rank-info">
                <h4>${user.name}</h4>
                <span>${user.country}</span>
            </div>
            <div class="rank-xp">${user.xp} XP</div>
        `;
        container.appendChild(row);
    });
}

// --- INIT APP ---
window.addEventListener('DOMContentLoaded', () => {
    loadAppState();
    lucide.createIcons();
});
