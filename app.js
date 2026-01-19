let questions = [];
let current = 0;
let score = 0;
let answered = new Set(); // track which questions were answered correctly/incorrectly

async function loadQuestions() {
  const res = await fetch("neuro_qbank.json");
  questions = await res.json();
  current = 0;
  score = 0;
  answered = new Set();
  render();
}

function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  current = 0;
  score = 0;
  answered = new Set();
  render();
}

function render() {
  const q = questions[current];
  const meta = document.getElementById("meta");
  const card = document.getElementById("card");
  const feedback = document.getElementById("feedback");

  meta.textContent = `Question ${current + 1}/${questions.length} | Score: ${score}`;

  let choicesHtml = "";
  for (const [letter, text] of Object.entries(q.choices)) {
    choicesHtml += `
      <label class="choice">
        <input type="radio" name="ans" value="${letter}">
        <span><strong>${letter}.</strong> ${escapeHtml(text)}</span>
      </label>
    `;
  }

  card.innerHTML = `
    <div class="stem"><strong>Q${q.id}.</strong> ${escapeHtml(q.stem)}</div>
    <div class="choices">${choicesHtml}</div>
  `;

  feedback.innerHTML = "";
}

function getSelected() {
  const selected = document.querySelector('input[name="ans"]:checked');
  return selected ? selected.value : null;
}

function submitAnswer() {
  const q = questions[current];
  const feedback = document.getElementById("feedback");
  const selected = getSelected();

  if (!selected) {
    feedback.innerHTML = `<div class="warn">Pick an answer first.</div>`;
    return;
  }

  const key = current;
  if (!answered.has(key)) {
    if (selected === q.answer) score += 1;
    answered.add(key);
  }

  const correct = selected === q.answer;

  feedback.innerHTML = `
    <div class="${correct ? "ok" : "bad"}">
      ${correct ? "✅ Correct" : `❌ Incorrect. Correct answer: <b>${q.answer}</b>`}
    </div>
    <div class="explain"><b>Explanation:</b> ${escapeHtml(q.explanation)}</div>
  `;

  document.getElementById("meta").textContent =
    `Question ${current + 1}/${questions.length} | Score: ${score}`;
}

function next() {
  if (current < questions.length - 1) {
    current += 1;
    render();
  }
}

function prev() {
  if (current > 0) {
    current -= 1;
    render();
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("submitBtn").addEventListener("click", submitAnswer);
document.getElementById("nextBtn").addEventListener("click", next);
document.getElementById("prevBtn").addEventListener("click", prev);
document.getElementById("shuffleBtn").addEventListener("click", shuffleQuestions);
document.getElementById("restartBtn").addEventListener("click", loadQuestions);

loadQuestions();