// Quiz Creator Script
let questions = [
    { question: '', options: [ {value:'a',text:''}, {value:'b',text:''} ], correct: 'a' }
];

function createOptionInput(qIdx, oIdx, value = '', text = '', correct = false) {
    return `<div class="option-row">
        <input type="radio" name="correct${qIdx}" value="${oIdx}" ${correct ? 'checked' : ''} title="Mark as correct"> Correct
        <input type="text" name="optionValue${qIdx}" value="${value}" placeholder="Value (e.g. a)" style="width:40px"> 
        <input type="text" name="optionText${qIdx}" value="${text}" placeholder="Option text" style="width:200px">
        <button type="button" class="removeOptionBtn">Remove</button>
    </div>`;
}


function renderQuestions(questions) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    questions.forEach((q, qIdx) => {
        let optionsHtml = '';
        q.options.forEach((opt, oIdx) => {
            optionsHtml += createOptionInput(qIdx, oIdx, opt.value, opt.text, q.correct === opt.value);
        });
        container.innerHTML += `
        <div class="question-block" data-qidx="${qIdx}">
            <label>Question ${qIdx + 1}: <input type="text" class="questionText" value="${q.question}" style="width:300px"></label>
            <div class="optionsContainer">${optionsHtml}</div>
            <button type="button" class="addOptionBtn">Add Option</button>
            <button type="button" class="removeQuestionBtn">Remove Question</button>
            <hr>
        </div>
        `;
    });
    renderPreview(questions);
}

function renderPreview(questions) {
    const preview = document.getElementById('quizPreview');
    if (!preview) return;
    if (!questions.length) {
        preview.innerHTML = '<em>No questions to preview.</em>';
        return;
    }
    // Quiz title
    const quizTitle = document.getElementById('fileNameInput').value.trim() || 'Quiz Preview';
    let html = `<div class="quiz-container">
        <h2 id="quizTitle">${quizTitle.replace(/\.json$/i, '').replace(/_/g, ' ')}</h2>
        <form id="quiz" autocomplete="off">`;
    questions.forEach((q, idx) => {
        html += `<div class="question" data-correct="${q.correct}">
            <strong>${idx + 1}. ${q.question || '<span style=\'color:#aaa\'>(No question text)</span>'}</strong>
            <div class="opts">`;
        q.options.forEach(opt => {
            html += `<label><input type="radio" name="q${idx + 1}" value="${opt.value}" disabled> ${opt.text || '<span style=\'color:#bbb\'>(No option text)</span>'}</label>`;
        });
        html += `</div></div>`;
    });
    html += `<button type="button" class="btn" style="margin-top:18px; opacity:0.6; cursor:not-allowed;" disabled>Submit</button>`;
    html += `</form></div>`;
    preview.innerHTML = html;
}

function getQuestionsFromDOM() {
    const qBlocks = document.querySelectorAll('.question-block');
    const questions = [];
    qBlocks.forEach((block, qIdx) => {
        const question = block.querySelector('.questionText').value.trim();
        const options = [];
        let correct = null;
        const optionRows = block.querySelectorAll('.option-row');
        optionRows.forEach((row, oIdx) => {
            const value = row.querySelector(`input[name="optionValue${qIdx}"]`).value.trim();
            const text = row.querySelector(`input[name="optionText${qIdx}"]`).value.trim();
            options.push({ value, text });
            if (row.querySelector(`input[type="radio"]`).checked) correct = value;
        });
        questions.push({ question, options, correct });
    });
    return questions;
}

function validateQuestions(questions) {
    for (let q of questions) {
        if (!q.question || q.options.length < 2 || !q.correct) {
            alert('Each question must have text, at least 2 options, and a correct answer.');
            return false;
        }
        for (let opt of q.options) {
            if (!opt.value || !opt.text) {
                alert('All options must have a value and text.');
                return false;
            }
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {

    renderQuestions(questions);

    document.getElementById('addQuestionBtn').onclick = function() {
        questions.push({ question: '', options: [ {value:'a',text:''}, {value:'b',text:''} ], correct: 'a' });
        renderQuestions(questions);
    };

    document.getElementById('questionsContainer').addEventListener('click', function(e) {
        const qBlock = e.target.closest('.question-block');
        const qIdx = qBlock ? parseInt(qBlock.getAttribute('data-qidx')) : -1;
        if (e.target.classList.contains('addOptionBtn')) {
            questions[qIdx].options.push({ value: '', text: '' });
            renderQuestions(questions);
        } else if (e.target.classList.contains('removeOptionBtn')) {
            const oRows = qBlock.querySelectorAll('.option-row');
            const oIdx = Array.from(oRows).indexOf(e.target.parentElement);
            questions[qIdx].options.splice(oIdx, 1);
            if (questions[qIdx].correct === questions[qIdx].options[oIdx]?.value) {
                questions[qIdx].correct = questions[qIdx].options[0]?.value || '';
            }
            renderQuestions(questions);
        } else if (e.target.classList.contains('removeQuestionBtn')) {
            questions.splice(qIdx, 1);
            renderQuestions(questions);
        }
    });

    // Auto-update preview on any input or DOM change
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.addEventListener('input', function(e) {
        questions = getQuestionsFromDOM();
        renderPreview(questions);
    });

    // Also update preview if file name changes
    document.getElementById('fileNameInput').addEventListener('input', function() {
        renderPreview(getQuestionsFromDOM());
    });

    // MutationObserver for add/remove
    const observer = new MutationObserver(() => {
        questions = getQuestionsFromDOM();
        renderPreview(questions);
    });
    observer.observe(questionsContainer, { childList: true, subtree: true });

    let lastSaved = null;
    let lastSavedName = '';

    document.getElementById('downloadBtn').onclick = function() {
        questions = getQuestionsFromDOM();
        const fileName = document.getElementById('fileNameInput').value.trim() || 'quiz.json';
        if (!validateQuestions(questions)) return;
        const blob = new Blob([JSON.stringify(questions, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.endsWith('.json') ? fileName : fileName + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        lastSaved = JSON.stringify(questions);
        lastSavedName = fileName;
        document.getElementById('viewBtn').disabled = false;
    };

    document.getElementById('viewBtn').onclick = function() {
        questions = getQuestionsFromDOM();
        const fileName = document.getElementById('fileNameInput').value.trim() || 'quiz.json';
        if (!lastSaved || lastSaved !== JSON.stringify(questions) || lastSavedName !== fileName) {
            alert('Please save your quiz first before viewing.');
            return;
        }
        sessionStorage.setItem('customQuiz', lastSaved);
        // Store quiz name (before .json)
        const quizName = fileName.replace(/\.json$/i, '');
        sessionStorage.setItem('customQuizName', quizName);
        window.location.href = 'quizez.html';
    };

    // Initially disable view
    document.getElementById('viewBtn').disabled = true;
});
