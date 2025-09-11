document.getElementById('quiz').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = document.getElementById('quiz');
  const questions = Array.from(document.querySelectorAll('.question'));
  let score = 0;
  let answeredAll = true;

  // Clear previous highlights and feedback
  questions.forEach(q => {
    q.classList.remove('correct','wrong');
    const old = q.querySelector('.feedback');
    if (old) old.remove();
  });

  questions.forEach((q, idx) => {
    const correct = q.getAttribute('data-correct');
    const name = 'q' + (idx + 1);
    // get the checked radio for this question
    const checked = form.querySelector(`input[name="${name}"]:checked`);

    if (!checked) {
      answeredAll = false;
      return;
    }

    const selected = checked.value;

    // create feedback element
    const fb = document.createElement('div');
    fb.className = 'feedback';
    fb.style.marginTop = '8px';
    fb.style.padding = '8px';
    fb.style.borderRadius = '6px';

    if (selected === correct) {
      q.classList.add('correct');
      fb.textContent = 'Correct!';
      score++;
    } else {
      q.classList.add('wrong');
      fb.textContent = 'Wrong!';
    }

    q.appendChild(fb);
  });

  const out = document.getElementById('output');
  if (!answeredAll) {
    out.textContent = 'Please answer all questions before submitting.';
    out.style.background = '#fff7cc';
    out.style.border = '1px solid #f0d36b';
    out.style.padding = '12px';
    return;
  }

  out.textContent = `You scored ${score} out of ${questions.length}.`;
  out.style.background = '#eef6ff';
  out.style.border = '1px solid #bcd3ff';
  out.style.padding = '12px';

  // Save results to sessionStorage and redirect to results page
  const answers = questions.map((q, idx) => {
    const correct = q.getAttribute('data-correct');
    const name = 'q' + (idx + 1);
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return {
      qIndex: idx + 1,
      question: q.querySelector('strong').textContent,
      options: Array.from(q.querySelectorAll('input')).map(input => ({
        value: input.value,
        text: input.parentElement.textContent.trim()
      })),
      correct,
      selected: checked ? checked.value : null
    };
  });

  sessionStorage.setItem('quizResults', JSON.stringify({
    score,
    total: questions.length,
    answers
  }));

  // disable inputs after submit to prevent changing answers
  const inputs = form.querySelectorAll('input');
  inputs.forEach(i => i.disabled = true);
  // disable submit too
  document.getElementById('submit').disabled = true;

  // Redirect to results page after a short delay
  setTimeout(() => {
    window.location.href = 'result.html';
  }, 1200);
});
