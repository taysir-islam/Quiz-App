const quizTitles = {
  gk: "General Knowledge Quiz",
  sci: "Science Quiz",
  history: "History Quiz",
  sports: "Sports Quiz",
  ictob:'ICT level 1',
  ictob2:'ICT level 2',
  ictob3:'ICT Level 3',
  ictob4:'ICT Level 4'
};

async function loadQuiz() {
  // Check for custom quiz in sessionStorage
  let questions = null;
  let quizType = localStorage.getItem('quizType') || 'gk';
  let isCustom = false;
  if (sessionStorage.getItem('customQuiz')) {
    try {
      questions = JSON.parse(sessionStorage.getItem('customQuiz'));
      isCustom = true;
    } catch (e) {
      // fallback to default
      questions = null;
    }
  }
  if (!questions) {
    const quizFile = {
      gk: '../quiz_question/gk.json',
      sci: '../quiz_question/sci.json',
      history: '../quiz_question/history.json',
      sports: '../quiz_question/sports.json',
      ictob: '../quiz_question/ictob.json',
      ictob2: '../quiz_question/ictob2.json',
      ictob3: '../quiz_question/ictob3.json',
      ictob4: '../quiz_question/ictob4.json'
    }[quizType] || '../quiz_question/gk.json';
    const res = await fetch(quizFile);
    questions = await res.json();
  }

  // Set quiz title
  const titleEl = document.getElementById('quizTitle');
  if (titleEl) {
    if (isCustom) {
      // Use custom quiz name from sessionStorage if available
      const customQuizName = sessionStorage.getItem('customQuizName');
      if (customQuizName) {
        titleEl.textContent = customQuizName;
        sessionStorage.removeItem('customQuizName');
      } else {
        titleEl.textContent = 'Custom Quiz';
      }
    } else {
      titleEl.textContent = quizTitles[quizType] || "Quiz";
    }
  }

  // Clear customQuiz after loading so it doesn't persist
  if (isCustom) sessionStorage.removeItem('customQuiz');

  let form = document.getElementById('quiz');
  form.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.setAttribute('data-correct', q.correct);

    const qTitle = document.createElement('strong');
    qTitle.textContent = `${idx + 1}. ${q.question}`;
    qDiv.appendChild(qTitle);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'opts';

    q.options.forEach(opt => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `q${idx + 1}`;
      radio.value = opt.value;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + opt.text));
      optsDiv.appendChild(label);
    });

    qDiv.appendChild(optsDiv);
    form.appendChild(qDiv);
  });

  // Add submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.id = 'submit';
  submitBtn.className = 'btn';
  submitBtn.textContent = 'Submit';
  form.appendChild(submitBtn);

  // Remove any previous event listeners by cloning
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  // Add submit handler
  newForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const questionsEls = Array.from(document.querySelectorAll('.question'));
    let score = 0;

    // Calculate score and collect answers (allow blanks)
    const answers = questionsEls.map((q, idx) => {
      const correct = q.getAttribute('data-correct');
      const name = 'q' + (idx + 1);
      const checked = newForm.querySelector(`input[name="${name}"]:checked`);
      const selected = checked ? checked.value : null;
      if (selected === correct) score++;
      return {
        qIndex: idx + 1,
        question: q.querySelector('strong').textContent,
        options: Array.from(q.querySelectorAll('input')).map(input => ({
          value: input.value,
          text: input.parentElement.textContent.trim()
        })),
        correct,
        selected
      };
    });

    sessionStorage.setItem('quizResults', JSON.stringify({
      score,
      total: questionsEls.length,
      answers,
      quizType: isCustom ? 'custom' : quizType
    }));

    // Disable inputs and submit button
    const inputs = newForm.querySelectorAll('input');
    inputs.forEach(i => i.disabled = true);
    document.getElementById('submit').disabled = true;

    // Redirect to results page after a short delay
    setTimeout(() => {
      window.location.href = 'result.html';
    }, 400);
  });
}

loadQuiz();
