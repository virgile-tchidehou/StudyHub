export const TECHNICAL_TRACKS = {
  embedded: {
    id: 'embedded',
    title: 'Embedded Systems & Robotics',
    skills: ['c_cpp', 'rtos', 'linux', 'embedded_hw', 'iot'],
  },
  ai: {
    id: 'ai',
    title: 'Data Science & AI',
    skills: ['math', 'deep_learning', 'edge_ai'],
  },
};

const QUESTIONS = [
  // ── Embedded Systems ──────────────────────────────────────────
  { id: 'emb_c_1', track: 'embedded', skill: 'c_cpp', level: 'foundations', prompt: 'What does a pointer store in C?', options: ['A memory address', 'A floating-point value', 'A character only', 'The size of a variable'], answer: 0 },
  { id: 'emb_c_2', track: 'embedded', skill: 'c_cpp', level: 'intermediate', prompt: 'Which issue is most commonly caused by writing beyond an array boundary in embedded C?', options: ['Buffer overflow / memory corruption', 'Automatic garbage collection', 'Increased clock speed', 'Network latency'], answer: 0 },
  { id: 'emb_c_3', track: 'embedded', skill: 'c_cpp', level: 'advanced', prompt: 'In ARM Cortex-M, where are local variables typically allocated?', options: ['On the stack', 'In flash ROM only', 'In the GPU cache', 'In external SD card'], answer: 0 },

  { id: 'emb_rtos_1', track: 'embedded', skill: 'rtos', level: 'intermediate', prompt: 'In FreeRTOS, what is the main purpose of a Mutex?', options: ['Protect shared resources from concurrent access', 'Increase CPU clock speed', 'Compile code faster', 'Store persistent configuration'], answer: 0 },
  { id: 'emb_rtos_2', track: 'embedded', skill: 'rtos', level: 'advanced', prompt: 'What is priority inversion in RTOS scheduling?', options: ['A low-priority task blocks a high-priority task indirectly', 'A task runs faster than expected', 'A task uses too much RAM', 'A task never receives interrupts'], answer: 0 },

  { id: 'emb_linux_1', track: 'embedded', skill: 'linux', level: 'foundations', prompt: 'What is the role of a Device Tree in embedded Linux?', options: ['Describe hardware to the kernel at boot time', 'Replace the C compiler', 'Encrypt user passwords', 'Manage Wi-Fi passwords only'], answer: 0 },
  { id: 'emb_linux_2', track: 'embedded', skill: 'linux', level: 'intermediate', prompt: 'Which bus is commonly used to connect sensors to a microcontroller over two wires?', options: ['I2C', 'HDMI', 'USB-C DisplayPort', 'SATA'], answer: 0 },

  { id: 'emb_hw_1', track: 'embedded', skill: 'embedded_hw', level: 'foundations', prompt: 'What does GPIO stand for in embedded systems?', options: ['General Purpose Input/Output', 'Global Process Integrated Output', 'General Programmable Internet Object', 'Graphical Peripheral Interface Option'], answer: 0 },
  { id: 'emb_hw_2', track: 'embedded', skill: 'embedded_hw', level: 'intermediate', prompt: 'Which component is best suited for hard real-time control loops on a robot motor?', options: ['Microcontroller (MCU)', 'Relational database server', 'Web browser', 'Spreadsheet engine'], answer: 0 },

  { id: 'emb_iot_1', track: 'embedded', skill: 'iot', level: 'intermediate', prompt: 'In an IoT edge device, why is MQTT often preferred over HTTP for telemetry?', options: ['Lightweight publish/subscribe with low overhead', 'It requires more bandwidth than HTTP', 'It only works on desktop PCs', 'It cannot work over TCP'], answer: 0 },

  // ── Data Science & AI ─────────────────────────────────────────
  { id: 'ai_math_1', track: 'ai', skill: 'math', level: 'foundations', prompt: 'In machine learning, what does gradient descent optimize?', options: ['Model parameters to reduce loss', 'Screen resolution', 'Database indexes', 'Network cable length'], answer: 0 },
  { id: 'ai_math_2', track: 'ai', skill: 'math', level: 'intermediate', prompt: 'Matrix multiplication is fundamental in deep learning mainly because:', options: ['Neural layers apply linear transforms to tensors', 'It removes the need for data', 'It replaces activation functions', 'It stores files on disk'], answer: 0 },

  { id: 'ai_dl_1', track: 'ai', skill: 'deep_learning', level: 'intermediate', prompt: 'In a Transformer, Self-Attention computes relationships using:', options: ['Query, Key, and Value vectors', 'Only random numbers', 'File system paths', 'SQL joins'], answer: 0 },
  { id: 'ai_dl_2', track: 'ai', skill: 'deep_learning', level: 'advanced', prompt: 'What problem does overfitting describe?', options: ['The model memorizes training data and generalizes poorly', 'The model trains too quickly', 'The dataset is too large', 'The GPU is too powerful'], answer: 0 },

  { id: 'ai_edge_1', track: 'ai', skill: 'edge_ai', level: 'intermediate', prompt: 'Why quantize a neural network to INT8 for edge deployment?', options: ['Reduce model size and inference cost on embedded hardware', 'Increase model size for better accuracy always', 'Disable inference completely', 'Replace training with manual rules'], answer: 0 },
  { id: 'ai_edge_2', track: 'ai', skill: 'edge_ai', level: 'advanced', prompt: 'TensorRT / ONNX Runtime on edge devices mainly helps with:', options: ['Optimized inference execution', 'Writing scholarship essays', 'Managing university deadlines', 'Sending emails'], answer: 0 },
];

const SKILL_LABELS = {
  c_cpp: 'C/C++',
  rtos: 'RTOS',
  linux: 'Linux Embedded',
  embedded_hw: 'Hardware & MCU',
  iot: 'IoT & Protocols',
  math: 'Math & Linear Algebra',
  deep_learning: 'Deep Learning',
  edge_ai: 'Edge AI & Optimization',
};

function levelFromPercent(percent) {
  if (percent >= 88) return 'expert';
  if (percent >= 63) return 'advanced';
  if (percent >= 38) return 'intermediate';
  return 'beginner';
}

export function getAvailableTracks() {
  return Object.values(TECHNICAL_TRACKS).map(({ id, title, skills }) => ({
    id,
    title,
    skills: skills.map((s) => ({ id: s, label: SKILL_LABELS[s] || s })),
    questionCount: QUESTIONS.filter((q) => q.track === id).length,
  }));
}

export function getTechnicalQuestions(trackId = 'embedded') {
  return QUESTIONS
    .filter((q) => q.track === trackId)
    .map(({ answer, ...publicQuestion }) => ({
      ...publicQuestion,
      skillLabel: SKILL_LABELS[publicQuestion.skill] || publicQuestion.skill,
    }));
}

export function scoreTechnicalDiagnostic(trackId = 'embedded', answers = {}) {
  const trackQuestions = QUESTIONS.filter((q) => q.track === trackId);
  if (!trackQuestions.length) {
    throw new Error(`Unknown track: ${trackId}`);
  }

  const skillScores = {};
  let correct = 0;

  for (const q of trackQuestions) {
    const given = Number(answers[q.id]);
    const ok = given === q.answer;
    if (ok) correct += 1;

    skillScores[q.skill] ||= { correct: 0, total: 0, label: SKILL_LABELS[q.skill] || q.skill };
    skillScores[q.skill].total += 1;
    if (ok) skillScores[q.skill].correct += 1;
  }

  const percent = Math.round((correct / trackQuestions.length) * 100);
  const level = levelFromPercent(percent);

  const weaknesses = Object.entries(skillScores)
    .filter(([, s]) => s.correct / s.total < 0.7)
    .map(([skill]) => skill);

  return {
    track: trackId,
    trackTitle: TECHNICAL_TRACKS[trackId]?.title || trackId,
    score: percent,
    level,
    correct,
    total: trackQuestions.length,
    skillScores,
    weaknesses,
    weaknessLabels: weaknesses.map((s) => SKILL_LABELS[s] || s),
  };
}
