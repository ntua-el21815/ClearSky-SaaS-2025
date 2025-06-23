const connectDB = require('./db');
const { calculateStatistics } = require('./statistics');
const CourseStatistics = require('./model/courseStatistics');

async function run() {
  await connectDB();

  const mockData = [
    {
      studentId: "03184623",
      finalGrade: 6,
      questionsRaw: { Q01: 7, Q02: 4, Q03: 3 },
      questionsNormalized: { Q01: 8, Q02: 5, Q03: 4 }
    },
    {
      studentId: "03184610",
      finalGrade: 8,
      questionsRaw: { Q01: 9, Q02: 7, Q03: 6 },
      questionsNormalized: { Q01: 10, Q02: 8, Q03: 6 }
    },
    {
      studentId: "03184611",
      finalGrade: 4,
      questionsRaw: { Q01: 5, Q02: 3, Q03: 2 },
      questionsNormalized: { Q01: 6, Q02: 4, Q03: 3 }
    }
  ];

  const stats = calculateStatistics(mockData);

  const result = await CourseStatistics.create({
    courseId: 'CS101',
    gradeSheetId: 'mock2025-test',
    ...stats
  });

  console.log('📦 Statistics saved with _id:', result._id);
  process.exit();
}

run();
