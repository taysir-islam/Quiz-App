document.getElementById('quiz').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = document.getElementById('quiz');
  const questions = Array.from(document.querySelectorAll('.question'));
  let score = 0;
  let answeredAll = true;

  // Check if all questions are answered
  questions.forEach((q, idx) => {
    const name = 'q' + (idx + 1);
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    if (!checked) answeredAll = false;
  });

  const out = document.getElementById('output');
  if (!answeredAll) {
    out.textContent = 'Please answer all questions before submitting.';
    out.style.background = '#fff7cc';
    out.style.border = '1px solid #f0d36b';
    out.style.padding = '12px';
    return;
  }

  // Calculate score and collect answers
  const answers = questions.map((q, idx) => {
    const correct = q.getAttribute('data-correct');
    const name = 'q' + (idx + 1);
    const checked = form.querySelector(`input[name="${name}"]:checked`);
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
    total: questions.length,
    answers
  }));

  // Disable inputs and submit button
  const inputs = form.querySelectorAll('input');
  inputs.forEach(i => i.disabled = true);
  document.getElementById('submit').disabled = true;

  // Redirect to results page after a short delay
  setTimeout(() => {
    window.location.href = 'result.html';
  }, 400);
});
