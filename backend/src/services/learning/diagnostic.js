const QUESTIONS = [
  { id: 'grammar_1', skill: 'grammar', level: 'A1', prompt: 'Choose the correct sentence.', options: ['She go to university every day.', 'She goes to university every day.', 'She going to university every day.', 'She gone to university every day.'], answer: 1 },
  { id: 'vocab_1', skill: 'vocabulary', level: 'A1', prompt: 'What does "improve" mean?', options: ['To make something better', 'To make something disappear', 'To copy something', 'To forget something'], answer: 0 },
  { id: 'grammar_2', skill: 'grammar', level: 'A2', prompt: 'Choose the correct option: "I ___ English for two years."', options: ['study', 'studied', 'have studied', 'am study'], answer: 2 },
  { id: 'vocab_2', skill: 'vocabulary', level: 'A2', prompt: 'In an academic context, "deadline" means:', options: ['A final date by which something must be done', 'A university holiday', 'A study method', 'A type of examination'], answer: 0 },
  { id: 'grammar_3', skill: 'grammar', level: 'B1', prompt: 'Choose the best sentence.', options: ['If I had more time, I would practice every day.', 'If I have more time, I would practiced every day.', 'If I had more time, I will practice every day.', 'If I would have more time, I practiced every day.'], answer: 0 },
  { id: 'vocab_3', skill: 'vocabulary', level: 'B1', prompt: 'Which word is closest to "reliable"?', options: ['Uncertain', 'Dependable', 'Temporary', 'Difficult'], answer: 1 },
  { id: 'grammar_4', skill: 'grammar', level: 'B2', prompt: 'Choose the correct completion: "The project, ___ was developed last year, is now being tested."', options: ['who', 'where', 'which', 'what'], answer: 2 },
  { id: 'vocab_4', skill: 'vocabulary', level: 'B2', prompt: 'To "assess" a candidate means to:', options: ['Evaluate their abilities or performance', 'Invite them to a party', 'Ignore their application', 'Replace their documents'], answer: 0 },
];

function getDiagnosticQuestions() {
  return QUESTIONS.map(({ answer, ...publicQuestion }) => publicQuestion);
}

function scoreDiagnostic(answers = {}) {
  const skillScores = {};
  let correct = 0;
  for (const q of QUESTIONS) {
    const given = Number(answers[q.id]);
    const ok = given === q.answer;
    if (ok) correct += 1;
    skillScores[q.skill] ||= { correct: 0, total: 0 };
    skillScores[q.skill].total += 1;
    if (ok) skillScores[q.skill].correct += 1;
  }

  const percent = Math.round((correct / QUESTIONS.length) * 100);
  let level = 'A1';
  if (percent >= 88) level = 'B2';
  else if (percent >= 63) level = 'B1';
  else if (percent >= 38) level = 'A2';

  const weaknesses = Object.entries(skillScores)
    .filter(([, s]) => s.correct / s.total < 0.7)
    .map(([skill]) => skill);

  return { score: percent, level, correct, total: QUESTIONS.length, skillScores, weaknesses };
}

module.exports = { getDiagnosticQuestions, scoreDiagnostic };
