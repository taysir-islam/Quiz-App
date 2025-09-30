const quizTitles = {
  gk: "General Knowledge Quiz",
  sci: "Science Quiz",
  history: "History Quiz",
  sports: "Sports Quiz"
};

const dataRaw = sessionStorage.getItem('quizResults');
const summaryEl = document.getElementById('summary');
const listEl = document.getElementById('list');
const retryBtn = document.getElementById('retry');
const titleEl = document.getElementById('quizTitle');

let quizType = "gk";
if (dataRaw) {
  try {
    const data = JSON.parse(dataRaw);
    quizType = data.quizType || "gk";
  } catch {}
}
if (titleEl) titleEl.textContent = quizTitles[quizType] + " Results";

if (!summaryEl || !listEl) {
  // Defensive: required elements not found
  console.error('Required DOM elements not found.');
} else if (!dataRaw) {
  summaryEl.textContent = 'No results found. Please take the quiz first.';
  summaryEl.style.padding = '12px';
  summaryEl.style.background = '#fff7cc';
  summaryEl.style.border = '1px solid #f0d36b';
  // show retry link (already present)
} else {
  try {
    const data = JSON.parse(dataRaw);
    summaryEl.textContent = `You scored ${data.score} out of ${data.total}.`;
    summaryEl.style.padding = '12px';
    summaryEl.style.background = '#eef6ff';
    summaryEl.style.border = '1px solid #bcd3ff';

    data.answers.forEach(item => {
      const qWrap = document.createElement('div');
      qWrap.className = 'q';

      // question text
      const h = document.createElement('div');
      h.innerHTML = `<strong>${item.qIndex}. ${item.question}</strong>`;
      qWrap.appendChild(h);

      // options list
      const opts = document.createElement('div');
      opts.className = 'opts';

      if (item.options && item.options.length > 0) {
        item.options.forEach(opt => {
          const el = document.createElement('div');
          el.className = 'opt';
          // mark classes
          if (opt.value === item.correct) {
            el.classList.add('correct');
            el.textContent = opt.text + ' (Correct)';
          } else {
            el.textContent = opt.text;
          }

          // highlight user's choice
          if (opt.value === item.selected) {
            const mark = document.createElement('div');
            mark.textContent = 'Your answer →';
            mark.className = 'you';
            el.appendChild(mark);
            // if user's answer is wrong, add wrong styling
            if (item.selected !== item.correct) {
              el.classList.add('wrong');
            }
          }

          opts.appendChild(el);
        });
        // If no answer selected, show "Not answered"
        if (!item.selected) {
          const notAnswered = document.createElement('div');
          notAnswered.className = 'opt wrong';
          notAnswered.textContent = 'Not answered';
          opts.appendChild(notAnswered);
        }
      } else {
        // No options at all
        const noOptions = document.createElement('div');
        noOptions.className = 'opt wrong';
        noOptions.textContent = 'No options provided for this question.';
        opts.appendChild(noOptions);
      }

      qWrap.appendChild(opts);
      listEl.appendChild(qWrap);
    });

  } catch (e) {
    summaryEl.textContent = 'Error reading results. Try retaking the quiz.';
    console.error(e);
  }
}

// Add handler for retry: clear stored results so quiz is fresh
if (retryBtn) {
  retryBtn.addEventListener('click', function (e) {
    sessionStorage.removeItem('quizResults');
    window.location.href = 'quizez.html'; // Go back to quiz selection
  });
}
