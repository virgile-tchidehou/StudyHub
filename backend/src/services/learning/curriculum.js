import { pool } from '../../config/database.js';
import { env } from '../../config/env.js';

const EXERCISE_TEMPLATES = {
  grammar: [
    { title: 'Present Perfect vs Past Simple', type: 'writing', prompt: 'Write 5 sentences comparing experiences (Present Perfect) with specific past events (Past Simple). Example: "I have visited Paris twice" vs "I visited Paris in 2023".', hint: 'Use "have/has + past participle" for unfinished time periods.', durationMinutes: 20 },
    { title: 'Conditional Sentences Drill', type: 'quiz', prompt: 'Which sentence is correct?', content: { options: ['If I will study abroad, I improve my English.', 'If I study abroad, I will improve my English.', 'If I studied abroad, I will improve my English.'], answer: 1 }, durationMinutes: 15 },
    { title: 'Article Usage (a/an/the)', type: 'writing', prompt: 'Fill in the blanks mentally, then write the corrected paragraph:\n"___ university I applied to requires ___ IELTS score of 6.5 and ___ strong motivation letter."', hint: 'Think about specific vs general nouns.', durationMinutes: 15 },
  ],
  vocabulary: [
    { title: 'Academic Word List — Set 1', type: 'practice', prompt: 'Define and use in a sentence: analyze, demonstrate, significant, approach, establish.', hint: 'Focus on collocations: "demonstrate ability", "significant impact".', durationMinutes: 25 },
    { title: 'Scholarship & Application Vocabulary', type: 'quiz', prompt: 'What does "eligible" mean in a scholarship context?', content: { options: ['Meeting the requirements to apply', 'Already awarded the scholarship', 'Rejected from the program', 'Waiting for an interview'], answer: 0 }, durationMinutes: 10 },
    { title: 'Synonym Upgrade Exercise', type: 'writing', prompt: 'Rewrite this sentence using more academic vocabulary:\n"I want to go to a good university to learn more about computers."', hint: 'Replace: want→aim, good→prestigious, learn→pursue, computers→computer science.', durationMinutes: 20 },
  ],
  c_cpp: [
    { title: 'Pointer Arithmetic Basics', type: 'coding', prompt: 'Write a C function that reverses an integer array in-place using pointer arithmetic (no index notation).', hint: 'Use two pointers: one at start, one at end, swap and move inward.', durationMinutes: 30 },
    { title: 'Stack vs Heap', type: 'quiz', prompt: 'Where is a local variable typically stored on ARM Cortex-M?', content: { options: ['Stack', 'Heap', 'Flash ROM', 'External SDRAM only'], answer: 0 }, durationMinutes: 10 },
    { title: 'Memory Safety Review', type: 'practice', prompt: 'Explain what a buffer overflow is and describe one prevention technique used in embedded C.', hint: 'Mention bounds checking, static analysis, or safe string functions.', durationMinutes: 20 },
  ],
  rtos: [
    { title: 'FreeRTOS Task Design', type: 'practice', prompt: 'Design 3 FreeRTOS tasks for a temperature sensor system: acquisition, filtering, and UART transmission. Define priorities and synchronization.', hint: 'Higher priority for time-critical acquisition; use queue between tasks.', durationMinutes: 35 },
    { title: 'Mutex vs Semaphore', type: 'quiz', prompt: 'When should you use a Mutex instead of a Binary Semaphore?', content: { options: ['Protecting a shared resource with ownership', 'Signaling an event without ownership', 'Increasing CPU clock speed', 'Replacing interrupts'], answer: 0 }, durationMinutes: 15 },
    { title: 'Priority Inversion Scenario', type: 'writing', prompt: 'Describe a priority inversion scenario with 3 tasks (Low, Medium, High) and explain how priority inheritance solves it.', hint: 'Low holds mutex → High blocked → Medium preempts Low.', durationMinutes: 25 },
  ],
  linux: [
    { title: 'Device Tree Concepts', type: 'practice', prompt: 'Explain the role of a Device Tree in embedded Linux and what information it provides to the kernel at boot.', hint: 'Hardware description, compatible strings, register addresses.', durationMinutes: 20 },
    { title: 'I2C vs SPI', type: 'quiz', prompt: 'Which protocol uses fewer wires for multi-device communication on a PCB?', content: { options: ['I2C (2 wires + GND)', 'SPI (4+ wires per device)', 'Ethernet', 'HDMI'], answer: 0 }, durationMinutes: 10 },
    { title: 'Shell Automation', type: 'coding', prompt: 'Write a Bash script that finds all .c files modified in the last 7 days and counts them.', hint: 'Use find with -mtime and -name flags.', durationMinutes: 20 },
  ],
  embedded_hw: [
    { title: 'GPIO Configuration', type: 'practice', prompt: 'List the steps to configure a GPIO pin as output on a typical MCU (clock enable, mode, pull, speed).', hint: 'Enable peripheral clock → set MODER register → set output type.', durationMinutes: 20 },
    { title: 'ADC Sampling', type: 'quiz', prompt: 'What does ADC resolution (e.g. 12-bit) determine?', content: { options: ['Number of discrete levels the converter can represent', 'The CPU clock frequency', 'The UART baud rate', 'The flash memory size'], answer: 0 }, durationMinutes: 10 },
  ],
  iot: [
    { title: 'MQTT Topic Design', type: 'practice', prompt: 'Design an MQTT topic hierarchy for a fleet of 50 edge sensors reporting temperature and humidity.', hint: 'Use: devices/{id}/telemetry/{metric}', durationMinutes: 25 },
    { title: 'Edge vs Cloud', type: 'quiz', prompt: 'Why process sensor data at the edge before sending to cloud?', content: { options: ['Reduce bandwidth and latency', 'Increase cloud storage costs', 'Disable offline operation', 'Remove the need for encryption'], answer: 0 }, durationMinutes: 10 },
  ],
  math: [
    { title: 'Gradient Descent Intuition', type: 'practice', prompt: 'Explain gradient descent in your own words and write the update rule for a single parameter θ.', hint: 'θ_new = θ_old - α * ∂Loss/∂θ', durationMinutes: 20 },
    { title: 'Matrix Dimensions', type: 'quiz', prompt: 'Can you multiply a 3×4 matrix by a 4×2 matrix?', content: { options: ['Yes, result is 3×2', 'No, impossible', 'Yes, result is 4×4', 'Yes, result is 3×4'], answer: 0 }, durationMinutes: 10 },
  ],
  deep_learning: [
    { title: 'Self-Attention Explained', type: 'writing', prompt: 'Explain Query, Key, and Value in Transformer self-attention with a simple analogy.', hint: 'Query = what I am looking for; Key = what I offer; Value = content to aggregate.', durationMinutes: 25 },
    { title: 'Overfitting Detection', type: 'quiz', prompt: 'Which sign suggests overfitting?', content: { options: ['Training loss decreases but validation loss increases', 'Both losses decrease together', 'Training loss stays constant', 'Model trains very slowly'], answer: 0 }, durationMinutes: 10 },
  ],
  edge_ai: [
    { title: 'INT8 Quantization', type: 'practice', prompt: 'Explain why INT8 quantization helps deploy neural networks on embedded hardware.', hint: 'Smaller model, faster inference, lower power.', durationMinutes: 20 },
    { title: 'ONNX Runtime Purpose', type: 'quiz', prompt: 'What is the main benefit of ONNX Runtime on edge devices?', content: { options: ['Optimized cross-platform inference', 'Writing scholarship essays', 'Database management', 'Email delivery'], answer: 0 }, durationMinutes: 10 },
  ],
};

const SKILL_LABELS = {
  grammar: 'Grammar', vocabulary: 'Vocabulary', c_cpp: 'C/C++', rtos: 'RTOS',
  linux: 'Linux Embedded', embedded_hw: 'Hardware & MCU', iot: 'IoT',
  math: 'Math', deep_learning: 'Deep Learning', edge_ai: 'Edge AI',
};

function pickTemplate(skill) {
  const pool = EXERCISE_TEMPLATES[skill];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildFocusAreas(state) {
  const areas = [];

  if (state.english?.diagnostic?.weaknesses?.length) {
    for (const skill of state.english.diagnostic.weaknesses) {
      areas.push({ domain: 'english', skill, label: SKILL_LABELS[skill] || skill, reason: 'English diagnostic weakness' });
    }
  } else if (state.english?.status === 'not_assessed') {
    areas.push({ domain: 'english', skill: 'grammar', label: 'Grammar', reason: 'Take English diagnostic first' });
  }

  if (state.technical?.diagnostic?.weaknesses?.length) {
    for (const skill of state.technical.diagnostic.weaknesses) {
      areas.push({ domain: 'technical', skill, label: SKILL_LABELS[skill] || skill, reason: 'Technical diagnostic weakness' });
    }
  } else if (state.technical?.status === 'not_assessed') {
    areas.push({ domain: 'technical', skill: 'c_cpp', label: 'C/C++', reason: 'Take technical diagnostic first' });
  }

  if (!areas.length) {
    areas.push(
      { domain: 'english', skill: 'vocabulary', label: 'Vocabulary', reason: 'Maintenance practice' },
      { domain: 'technical', skill: 'c_cpp', label: 'C/C++', reason: 'Maintenance practice' },
    );
  }

  return areas.slice(0, 4);
}

async function tryGenerateAIExercise(domain, skill, level, profile) {
  if (!env.geminiApiKey) return null;

  const systemPrompt = `You are StudyHub's Adaptive Learning Engine. Generate ONE focused practice exercise as JSON only.
Domain: ${domain}, Skill: ${skill}, Level: ${level || 'intermediate'}
Return strict JSON: {"title":"...","type":"practice|quiz|writing|coding","prompt":"...","hint":"...","durationMinutes":15,"content":null}
For quiz type include content: {"options":["..."],"answer":0}`;

  const userPrompt = `Student profile: ${profile.fieldOfStudy || 'engineering'} targeting ${profile.targetDegree || 'Master'}.
Weakness: ${skill}. Create a unique, practical exercise.`;

  try {
    const url = `${env.geminiApiUrl}/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.6, maxOutputTokens: 800, responseMimeType: 'application/json' },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    if (!parsed.title || !parsed.prompt) return null;
    return { ...parsed, source: 'ai' };
  } catch {
    return null;
  }
}

export async function getCurriculumExercises(userId) {
  const { rows } = await pool.query(
    `SELECT id, domain, skill, title, exercise_type, prompt, content, status, source, duration_minutes, created_at, completed_at
     FROM learning_exercises
     WHERE user_id = $1
     ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END, created_at DESC
     LIMIT 20`,
    [userId]
  );
  return rows;
}

export async function getCurriculumStats(userId) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
       COUNT(*) FILTER (WHERE status = 'skipped')::int AS skipped,
       COUNT(*)::int AS total
     FROM learning_exercises WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || { pending: 0, completed: 0, skipped: 0, total: 0 };
}

export async function generateCurriculum(userId, state) {
  const pending = await pool.query(
    `SELECT COUNT(*)::int AS count FROM learning_exercises WHERE user_id = $1 AND status = 'pending'`,
    [userId]
  );
  const pendingCount = pending.rows[0]?.count || 0;
  if (pendingCount >= 6) {
    return { generated: 0, message: 'Complete or skip existing exercises before generating new ones.' };
  }

  const focusAreas = buildFocusAreas(state);
  const maxNew = Math.min(4, 6 - pendingCount);
  const profile = state.profile || {};
  let generated = 0;

  for (const area of focusAreas.slice(0, maxNew)) {
    const level = area.domain === 'english'
      ? state.english?.diagnostic?.level
      : state.technical?.diagnostic?.level;

    let exercise = await tryGenerateAIExercise(area.domain, area.skill, level, profile);
    if (!exercise) {
      const template = pickTemplate(area.skill);
      if (!template) continue;
      exercise = { ...template, source: 'template' };
    }

    await pool.query(
      `INSERT INTO learning_exercises
        (user_id, domain, skill, title, exercise_type, prompt, content, duration_minutes, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, 'pending')`,
      [
        userId,
        area.domain,
        area.skill,
        exercise.title,
        exercise.type || 'practice',
        exercise.prompt,
        JSON.stringify({ hint: exercise.hint || null, ...(exercise.content || {}) }),
        exercise.durationMinutes || 20,
        exercise.source || 'template',
      ]
    );
    generated += 1;
  }

  return { generated, focusAreas, message: generated ? `Generated ${generated} personalised exercise(s).` : 'No exercises generated.' };
}

export async function updateExerciseStatus(userId, exerciseId, status) {
  const allowed = new Set(['completed', 'skipped']);
  if (!allowed.has(status)) throw new Error('Invalid status');

  const { rows } = await pool.query(
    `UPDATE learning_exercises
     SET status = $3, completed_at = CASE WHEN $3 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $1 AND user_id = $2
     RETURNING id, domain, skill, title, exercise_type, prompt, content, status, source, duration_minutes, created_at, completed_at`,
    [exerciseId, userId, status]
  );
  return rows[0] || null;
}

export { buildFocusAreas, SKILL_LABELS };
