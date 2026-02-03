// State management
const state = {
    answers: {},
    currentPart: 1,
    sectionScores: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    }
};

// Interpretation data
const interpretations = [
    {
        min: 0,
        max: 15,
        title: "Low indoctrination markers",
        description: "You appear to hold examined beliefs and maintain intellectual independence. Or you're not being honest with yourself.",
        className: "score-low"
    },
    {
        min: 16,
        max: 35,
        title: "Moderate markers",
        description: "You have some inherited beliefs you haven't fully examined. This is normal — awareness is the first step.",
        className: "score-moderate"
    },
    {
        min: 36,
        max: 55,
        title: "Significant markers",
        description: "Many of your political beliefs may be inherited rather than chosen. Consider seeking out perspectives that challenge your assumptions.",
        className: "score-significant"
    },
    {
        min: 56,
        max: 75,
        title: "High markers",
        description: "Your worldview may be largely constructed by others. This isn't your fault — Lebanese society is designed to produce this — but breaking free requires active effort.",
        className: "score-high"
    },
    {
        min: 76,
        max: 90,
        title: "Severe markers",
        description: "You are likely operating within a closed ideological system. The fact that you took this test is a positive sign. Consider: what would it take to change your mind about anything?",
        className: "score-severe"
    }
];

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeRatingButtons();
});

function initializeRatingButtons() {
    const questions = document.querySelectorAll('.question');

    questions.forEach(question => {
        const questionNumber = question.dataset.question;
        const buttons = question.querySelectorAll('.rating-btn');

        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove selected class from siblings
                buttons.forEach(btn => btn.classList.remove('selected'));

                // Add selected class to clicked button
                this.classList.add('selected');

                // Store answer
                const value = parseInt(this.dataset.value);
                state.answers[questionNumber] = value;

                // Update section score
                updateSectionScore(questionNumber);
            });
        });
    });
}

function updateSectionScore(questionNumber) {
    const qNum = parseInt(questionNumber);
    let section;

    if (qNum <= 6) section = 1;
    else if (qNum <= 12) section = 2;
    else if (qNum <= 18) section = 3;
    else if (qNum <= 24) section = 4;
    else section = 5;

    // Calculate section score
    const startQ = (section - 1) * 6 + 1;
    const endQ = section * 6;
    let sectionTotal = 0;

    for (let i = startQ; i <= endQ; i++) {
        if (state.answers[i] !== undefined) {
            sectionTotal += state.answers[i];
        }
    }

    state.sectionScores[section] = sectionTotal;

    // Update display
    const scoreElement = document.getElementById(`score${section}`);
    if (scoreElement) {
        scoreElement.textContent = sectionTotal;
    }
}

function startSurvey() {
    document.getElementById('landing').classList.remove('active');
    document.getElementById('survey').classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToLanding() {
    document.getElementById('survey').classList.remove('active');
    document.getElementById('landing').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextPart(currentPart) {
    // Validate that all questions are answered
    const startQ = (currentPart - 1) * 6 + 1;
    const endQ = currentPart * 6;
    let allAnswered = true;

    for (let i = startQ; i <= endQ; i++) {
        if (state.answers[i] === undefined) {
            allAnswered = false;
            break;
        }
    }

    if (!allAnswered) {
        alert('Please answer all questions in this section before proceeding.');
        return;
    }

    // Hide current part
    document.getElementById(`part${currentPart}`).style.display = 'none';

    // Show next part
    const nextPartNum = currentPart + 1;
    document.getElementById(`part${nextPartNum}`).style.display = 'block';

    state.currentPart = nextPartNum;
    updateProgress();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevPart(currentPart) {
    // Hide current part
    document.getElementById(`part${currentPart}`).style.display = 'none';

    // Show previous part
    const prevPartNum = currentPart - 1;
    document.getElementById(`part${prevPartNum}`).style.display = 'block';

    state.currentPart = prevPartNum;
    updateProgress();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const percentage = (state.currentPart / 5) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Part ${state.currentPart} of 5`;
}

function showResults() {
    // Validate final section
    const startQ = 25;
    const endQ = 30;
    let allAnswered = true;

    for (let i = startQ; i <= endQ; i++) {
        if (state.answers[i] === undefined) {
            allAnswered = false;
            break;
        }
    }

    if (!allAnswered) {
        alert('Please answer all questions in this section before seeing results.');
        return;
    }

    // Calculate total score
    let totalScore = 0;
    for (let section = 1; section <= 5; section++) {
        totalScore += state.sectionScores[section];
    }

    // Update results page
    document.getElementById('totalScore').textContent = totalScore;

    // Find interpretation
    const interpretation = interpretations.find(i => totalScore >= i.min && totalScore <= i.max);
    const interpretationEl = document.getElementById('interpretation');
    interpretationEl.innerHTML = `<strong>${interpretation.title}</strong>${interpretation.description}`;

    // Update score color
    document.getElementById('totalScore').className = `score-number ${interpretation.className}`;

    // Update breakdown bars
    for (let section = 1; section <= 5; section++) {
        const score = state.sectionScores[section];
        const percentage = (score / 18) * 100;

        document.getElementById(`bar${section}`).style.width = `${percentage}%`;
        document.getElementById(`final${section}`).textContent = `${score}/18`;
    }

    // Show results page
    document.getElementById('survey').classList.remove('active');
    document.getElementById('results').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function retakeSurvey() {
    // Reset state
    state.answers = {};
    state.currentPart = 1;
    state.sectionScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Reset all buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Reset section scores display
    for (let i = 1; i <= 5; i++) {
        const scoreEl = document.getElementById(`score${i}`);
        if (scoreEl) scoreEl.textContent = '0';
    }

    // Reset parts visibility
    for (let i = 1; i <= 5; i++) {
        const part = document.getElementById(`part${i}`);
        part.style.display = i === 1 ? 'block' : 'none';
    }

    // Show survey page
    document.getElementById('results').classList.remove('active');
    document.getElementById('survey').classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shareSurvey() {
    const url = window.location.href;
    const text = "Take the Lebanese Indoctrination Self-Assessment — a reflective exercise for recognizing inherited beliefs vs. examined convictions.";

    if (navigator.share) {
        navigator.share({
            title: 'The Lebanese Indoctrination Self-Assessment',
            text: text,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        const shareText = `${text}\n\n${url}`;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            // Final fallback: show URL
            prompt('Copy this link to share:', url);
        });
    }
}

// Save progress to localStorage (optional feature)
function saveProgress() {
    localStorage.setItem('lebanese-assessment-progress', JSON.stringify(state));
}

function loadProgress() {
    const saved = localStorage.getItem('lebanese-assessment-progress');
    if (saved) {
        const savedState = JSON.parse(saved);
        Object.assign(state, savedState);

        // Restore button selections
        Object.entries(state.answers).forEach(([question, value]) => {
            const questionEl = document.querySelector(`.question[data-question="${question}"]`);
            if (questionEl) {
                const button = questionEl.querySelector(`.rating-btn[data-value="${value}"]`);
                if (button) {
                    button.classList.add('selected');
                }
            }
        });

        // Update section scores display
        for (let i = 1; i <= 5; i++) {
            const scoreEl = document.getElementById(`score${i}`);
            if (scoreEl && state.sectionScores[i]) {
                scoreEl.textContent = state.sectionScores[i];
            }
        }
    }
}

// Auto-save on answer selection
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rating-btn') || e.target.closest('.rating-btn')) {
        saveProgress();
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('rating-btn')) {
        const buttons = Array.from(e.target.parentElement.querySelectorAll('.rating-btn'));
        const currentIndex = buttons.indexOf(e.target);

        if (e.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
            buttons[currentIndex + 1].focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            buttons[currentIndex - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.target.click();
        }
    }
});
