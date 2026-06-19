import type {
  ChatMessage,
  DailyRecommendation,
  DiagnosticQuestion,
  DiagnosticResult,
  LearnRecommendation,
  ListeningTask,
  MockExamReport,
  ReadingPassage,
  RoadmapStage,
  SpeakingPrompt,
  UserProfile,
  WritingTask
} from "./types";

export const mockUserProfile: UserProfile = {
  fullName: "Amina Rahman",
  classLevel: "11",
  aboutMe: "I want to study abroad and need a stronger IELTS Writing score.",
  avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Amina%20Rahman",
  age: 17,
  country: "Kazakhstan",
  school: "Qyzylorda Lyceum",
  email: "amina@example.com",
  currentLevel: "B1",
  targetBand: 7.5,
  examDate: "2026-09-18",
  predictedBand: 6.2
};

export const initialDiagnosticResult: DiagnosticResult = {
  cefrLevel: "B1",
  baseBand: 6,
  sectionScores: {
    Reading: 6,
    Listening: 6.5,
    Writing: 5.5,
    Speaking: 6
  },
  summary:
    "Strong listening instincts and clear everyday speaking. Writing needs stronger paragraph control and more precise academic vocabulary."
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "reading-main-idea",
    section: "Reading",
    title: "Mini Reading",
    prompt:
      "A passage argues that urban parks improve health, reduce heat, and create public gathering places. What is the main idea?",
    options: [
      "Parks are expensive to maintain",
      "Urban parks provide several public benefits",
      "Cities should replace roads with trees",
      "Public gatherings need stricter rules"
    ],
    correctAnswer: "Urban parks provide several public benefits",
    skillTag: "Main idea"
  },
  {
    id: "reading-inference",
    section: "Reading",
    title: "Mini Reading",
    prompt:
      "The writer notes that students who review notes within 24 hours remember more later. What can be inferred?",
    options: [
      "Memory improves when review happens soon after learning",
      "Students should never study at night",
      "All exams test memory only",
      "Review is useful only for science subjects"
    ],
    correctAnswer: "Memory improves when review happens soon after learning",
    skillTag: "Inference"
  },
  {
    id: "listening-detail",
    section: "Listening",
    title: "Mini Listening",
    prompt:
      "A student says the library tour starts at 10:30 near the main desk. Where should new students meet?",
    options: ["Cafeteria", "Main desk", "Computer lab", "North gate"],
    correctAnswer: "Main desk",
    skillTag: "Detail"
  },
  {
    id: "listening-function",
    section: "Listening",
    title: "Mini Listening",
    prompt:
      "A speaker says, 'I was hoping you could clarify the deadline.' What is the speaker doing?",
    options: ["Making a complaint", "Asking for information", "Refusing an offer", "Ending a conversation"],
    correctAnswer: "Asking for information",
    skillTag: "Function"
  },
  {
    id: "writing-coherence",
    section: "Writing",
    title: "Mini Writing",
    prompt:
      "Which sentence best links a cause paragraph to a solution paragraph in an essay about traffic?",
    options: [
      "Traffic is very bad and many people dislike it.",
      "These causes suggest that policy changes should focus on commuting habits.",
      "Cars are faster than buses in some cities.",
      "In conclusion, technology is popular."
    ],
    correctAnswer: "These causes suggest that policy changes should focus on commuting habits.",
    skillTag: "Coherence"
  },
  {
    id: "writing-lexical",
    section: "Writing",
    title: "Mini Writing",
    prompt: "Choose the strongest academic replacement for 'a lot of people think'.",
    options: ["Many individuals argue", "Lots of humans say", "A big crowd thinks", "People are like"],
    correctAnswer: "Many individuals argue",
    skillTag: "Lexical resource"
  },
  {
    id: "speaking-fluency",
    section: "Speaking",
    title: "Mini Speaking",
    prompt:
      "Which answer sounds most natural for IELTS Speaking Part 1: 'Do you prefer studying alone or with others?'",
    options: [
      "Alone. Good.",
      "I usually prefer studying alone because I can focus, although group revision helps before exams.",
      "Study is people and my school is nice.",
      "No answer."
    ],
    correctAnswer:
      "I usually prefer studying alone because I can focus, although group revision helps before exams.",
    skillTag: "Fluency"
  },
  {
    id: "speaking-extension",
    section: "Speaking",
    title: "Mini Speaking",
    prompt: "What should a strong Part 2 answer include?",
    options: [
      "Only memorized idioms",
      "A clear story, specific details, and natural linking",
      "One short sentence",
      "A list of unrelated vocabulary"
    ],
    correctAnswer: "A clear story, specific details, and natural linking",
    skillTag: "Long turn"
  }
];

export const roadmapStages: RoadmapStage[] = [
  {
    id: "stage-grammar",
    name: "Grammar",
    focus: "Complex sentences, articles, and tense control",
    deadline: "Week 1",
    progress: 66,
    tasks: [
      { id: "grammar-clauses", title: "Use relative clauses in 8 essay sentences", minutes: 18, completed: true },
      { id: "grammar-articles", title: "Fix article errors in a band 6 sample", minutes: 15, completed: true },
      { id: "grammar-tense", title: "Record a 90 second past tense answer", minutes: 12, completed: false }
    ]
  },
  {
    id: "stage-vocabulary",
    name: "Vocabulary",
    focus: "Academic collocations and precise topic language",
    deadline: "Week 2",
    progress: 42,
    tasks: [
      { id: "vocab-education", title: "Learn 12 education collocations", minutes: 14, completed: true },
      { id: "vocab-paraphrase", title: "Paraphrase 10 Task 2 questions", minutes: 20, completed: false },
      { id: "vocab-review", title: "Review spaced repetition deck", minutes: 10, completed: false }
    ]
  },
  {
    id: "stage-reading",
    name: "Reading",
    focus: "Skimming, scanning, and True/False/Not Given",
    deadline: "Week 3",
    progress: 35,
    tasks: [
      { id: "reading-skim", title: "Skim a science passage in 4 minutes", minutes: 8, completed: true },
      { id: "reading-tfng", title: "Complete 12 TFNG questions", minutes: 18, completed: false },
      { id: "reading-review", title: "Review wrong answers with evidence lines", minutes: 16, completed: false }
    ]
  },
  {
    id: "stage-writing",
    name: "Writing",
    focus: "Task response, paragraph logic, and error control",
    deadline: "Week 4",
    progress: 28,
    tasks: [
      { id: "writing-task1", title: "Write one overview paragraph", minutes: 22, completed: false },
      { id: "writing-task2", title: "Plan a problem-solution essay", minutes: 18, completed: true },
      { id: "writing-rewrite", title: "Rewrite a weak body paragraph", minutes: 24, completed: false }
    ]
  },
  {
    id: "stage-speaking",
    name: "Speaking",
    focus: "Part 2 expansion and Part 3 opinion development",
    deadline: "Week 5",
    progress: 50,
    tasks: [
      { id: "speaking-part1", title: "Answer 8 Part 1 questions", minutes: 12, completed: true },
      { id: "speaking-part2", title: "Record a full cue card response", minutes: 16, completed: false },
      { id: "speaking-part3", title: "Practice abstract follow-ups", minutes: 14, completed: false }
    ]
  },
  {
    id: "stage-final",
    name: "Final Exam",
    focus: "Full mock exam, timing, and final band strategy",
    deadline: "Week 6",
    progress: 15,
    tasks: [
      { id: "final-reading", title: "Complete full Reading under 60 minutes", minutes: 60, completed: false },
      { id: "final-writing", title: "Complete both Writing tasks", minutes: 60, completed: false },
      { id: "final-review", title: "Review final report with Buddy", minutes: 20, completed: false }
    ]
  }
];

export const dailyRecommendations: DailyRecommendation[] = [
  {
    id: "rec-writing",
    title: "Rewrite one Task 2 introduction",
    reason: "Your diagnostic showed good ideas but uneven thesis clarity.",
    action: "Open Writing Lab"
  }
];

export const buddyChatHistory: ChatMessage[] = [
  {
    id: "chat-1",
    role: "buddy",
    content:
      "Good morning, Amina. Today I recommend one Task 2 thesis rewrite and a short Part 2 speaking answer. Your quickest band gain is coherence.",
    time: "08:05"
  },
  {
    id: "chat-2",
    role: "user",
    content: "How can I make my essay sound more academic without memorizing phrases?",
    time: "08:06"
  },
  {
    id: "chat-3",
    role: "buddy",
    content:
      "Use precise verbs and clear cause-effect links. For example, replace 'this makes problems' with 'this intensifies pressure on public transport and reduces productivity.'",
    time: "08:06"
  }
];

export const speakingPrompts: SpeakingPrompt[] = [
  {
    id: "speaking-part-1",
    part: 1,
    prompt: "Do you prefer studying in the morning or in the evening?",
    followUp: "Why does that time help you focus?",
    transcriptSample:
      "I prefer studying in the morning because my mind feels fresher and I can finish difficult tasks before school becomes busy.",
    waveform: [24, 38, 31, 48, 42, 56, 35, 62, 45, 30, 52, 41]
  },
  {
    id: "speaking-part-2",
    part: 2,
    prompt: "Describe a skill you would like to learn. You should say what it is, why it is useful, how you would learn it, and how it could help your future.",
    followUp: "Would you prefer to learn it online or with a teacher?",
    transcriptSample:
      "A skill I would like to learn is public speaking because it would help me present ideas more confidently at university and later at work.",
    waveform: [42, 58, 61, 45, 69, 74, 52, 63, 77, 49, 55, 68]
  },
  {
    id: "speaking-part-3",
    part: 3,
    prompt: "Why do some adults find it difficult to learn new skills?",
    followUp: "Should governments support adult education?",
    transcriptSample:
      "Many adults struggle because they have limited time and may fear making mistakes, so flexible courses and supportive feedback are important.",
    waveform: [36, 44, 59, 64, 51, 70, 72, 57, 63, 75, 54, 66]
  }
];

export const writingTasks: WritingTask[] = [
  {
    id: "writing-task-1",
    taskType: "Task 1",
    title: "Line Graph: Public Transport Use",
    prompt:
      "The graph shows changes in public transport use in three cities between 2010 and 2025. Summarize the main features and make comparisons where relevant.",
    sampleBandNine:
      "Overall, public transport use rose in all three cities, although the rate of growth varied considerably. Metroville recorded the sharpest increase, while Lakeside grew more steadily from a lower base."
  },
  {
    id: "writing-task-2",
    taskType: "Task 2",
    title: "Essay: Technology and Education",
    prompt:
      "Some people believe that digital devices improve education, while others think they distract students. Discuss both views and give your own opinion.",
    sampleBandNine:
      "Digital devices can broaden access to information and personalize learning, but their value depends on purposeful classroom use. In my view, schools should integrate technology with clear limits rather than treat it as a complete replacement for traditional teaching."
  }
];

export const readingPassage: ReadingPassage = {
  id: "reading-passage-climate",
  title: "Urban Heat and Green Roofs",
  minutes: 18,
  passage:
    "Cities often absorb and retain more heat than rural areas because concrete and asphalt store solar energy. Green roofs can reduce this effect by adding vegetation to building surfaces. Researchers have found that these roofs also slow rainwater runoff and improve insulation, although installation costs remain a barrier for smaller buildings.",
  questions: [
    {
      id: "reading-green-benefit",
      section: "Reading",
      title: "Green Roofs",
      prompt: "Which benefit is mentioned in the passage?",
      options: ["Faster traffic", "Reduced rainwater runoff", "Lower food prices", "Longer school hours"],
      correctAnswer: "Reduced rainwater runoff",
      skillTag: "Detail"
    },
    {
      id: "reading-green-barrier",
      section: "Reading",
      title: "Green Roofs",
      prompt: "What is a barrier for smaller buildings?",
      options: ["Installation cost", "Too much vegetation", "Lack of sunlight", "Rainwater shortages"],
      correctAnswer: "Installation cost",
      skillTag: "Scanning"
    }
  ]
};

export const listeningTask: ListeningTask = {
  id: "listening-orientation",
  title: "Campus Orientation",
  duration: "03:20",
  transcript:
    "Welcome to the campus orientation. The tour begins at the main desk at 10:30. Please bring your student card, and remember that the writing workshop has moved from Room 204 to Room 218.",
  questions: [
    {
      id: "listening-room",
      section: "Listening",
      title: "Campus Orientation",
      prompt: "Where is the writing workshop now held?",
      options: ["Room 204", "Room 218", "Main desk", "Student cafe"],
      correctAnswer: "Room 218",
      skillTag: "Numbers"
    },
    {
      id: "listening-item",
      section: "Listening",
      title: "Campus Orientation",
      prompt: "What should students bring?",
      options: ["Passport", "Laptop", "Student card", "Printed essay"],
      correctAnswer: "Student card",
      skillTag: "Detail"
    }
  ],
  waveform: [38, 44, 52, 66, 41, 58, 72, 60, 48, 68, 55, 63, 45, 70]
};

export const latestMockExamReport: MockExamReport = {
  id: "mock-report-1",
  date: "2026-06-18",
  overallBand: 6.5,
  readiness: 68,
  sections: {
    Reading: 6.5,
    Listening: 7,
    Writing: 6,
    Speaking: 6.5
  },
  nextActions: [
    "Write one Task 2 body paragraph with a clear topic sentence.",
    "Practice Reading questions where evidence is spread across two sentences.",
    "Record Part 3 answers with one example and one consequence."
  ]
};

export const learnRecommendations: LearnRecommendation[] = [
  {
    id: "learn-friends",
    category: "TV Show",
    title: "Friends",
    level: "B1",
    reason: "Clear everyday dialogue helps with natural responses in Speaking Part 1.",
    weeklyTask: "Watch 15 minutes and copy five useful expressions.",
    link: "https://www.netflix.com/title/70153404"
  },
  {
    id: "learn-office",
    category: "TV Show",
    title: "The Office",
    level: "B2",
    reason: "Workplace conversations build informal and semi-formal vocabulary.",
    weeklyTask: "Summarize one scene using reported speech.",
    link: "https://www.netflix.com/title/70136120"
  },
  {
    id: "learn-movie",
    category: "Movie",
    title: "The Social Network",
    level: "B2",
    reason: "Fast academic and business dialogue trains listening for attitude and purpose.",
    weeklyTask: "Pause after three scenes and predict the speaker's intention.",
    link: "https://www.netflix.com/title/70132721"
  },
  {
    id: "learn-podcast",
    category: "Podcast",
    title: "BBC 6 Minute English",
    level: "B1",
    reason: "Short episodes with topic vocabulary suit daily listening practice.",
    weeklyTask: "Write a 60 word summary after one episode.",
    link: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english"
  },
  {
    id: "learn-book",
    category: "Book",
    title: "Atomic Habits",
    level: "B2",
    reason: "Accessible non-fiction supports Task 2 examples about behavior and education.",
    weeklyTask: "Extract three cause-effect sentences.",
    link: "https://jamesclear.com/atomic-habits"
  }
];

export const bandDescriptors = [
  { label: "Task Achievement", detail: "Answer every part of the question with a controlled position." },
  { label: "Coherence", detail: "Use topic sentences, paragraph logic, and precise referencing." },
  { label: "Lexical Resource", detail: "Choose topic-specific words instead of memorized phrases." },
  { label: "Grammar Range", detail: "Mix accurate simple sentences with controlled complex forms." }
];
