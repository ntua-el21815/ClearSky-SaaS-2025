function calculateStatistics(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No student data provided");
  }

  const grades = data.map(s => s.finalGrade).filter(g => typeof g === 'number');
  const numberOfStudents = grades.length;

  const sum = grades.reduce((a, b) => a + b, 0);
  const average = sum / numberOfStudents;

  const sorted = [...grades].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  const variance = grades.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / numberOfStudents;
  const stdDev = Math.sqrt(variance);

  const numberOfPasses = grades.filter(g => g >= 5).length;
  const numberOfFails = numberOfStudents - numberOfPasses;

  // Κατανομή τελικού βαθμού
  const finalGradeDistribution = {};
  for (let i = 0; i <= 10; i++) {
    finalGradeDistribution[i] = grades.filter(g => g === i).length;
  }

  // --- Δύο κατανομές: πριν & μετά την κανονικοποίηση ---
  const questionDistributionsRaw = {};
  const questionDistributionsNormalized = {};

  // Βρες όλα τα κλειδιά ερωτήσεων από το πρώτο αντικείμενο
  const rawKeys = Object.keys(data[0].questionsRaw || {});
  const normKeys = Object.keys(data[0].questionsNormalized || {});

  for (const q of rawKeys) {
    questionDistributionsRaw[q] = {};
    for (let i = 0; i <= 10; i++) questionDistributionsRaw[q][i] = 0;

    for (const student of data) {
      const val = student.questionsRaw?.[q];
      if (typeof val === 'number' && val >= 0 && val <= 10) {
        questionDistributionsRaw[q][val]++;
      }
    }
  }

  for (const q of normKeys) {
    questionDistributionsNormalized[q] = {};
    for (let i = 0; i <= 10; i++) questionDistributionsNormalized[q][i] = 0;

    for (const student of data) {
      const val = student.questionsNormalized?.[q];
      const rounded = Math.round(val);
      if (typeof val === 'number' && rounded >= 0 && rounded <= 10) {
        questionDistributionsNormalized[q][rounded]++;
      }
    }
  }

  return {
    averageGrade: parseFloat(average.toFixed(2)),
    medianGrade: parseFloat(median.toFixed(2)),
    standardDeviation: parseFloat(stdDev.toFixed(2)),
    numberOfStudents,
    numberOfPasses,
    numberOfFails,
    finalGradeDistribution,
    questionDistributionsRaw,
    questionDistributionsNormalized,
    calculatedAt: new Date().toISOString()
  };
}

// 👇 Για δοκιμή standalone (μπορείς να τρέξεις `node src/statistics.js`)
if (require.main === module) {
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

  console.log(JSON.stringify(calculateStatistics(mockData), null, 2));
}

module.exports = {
  calculateStatistics
};
