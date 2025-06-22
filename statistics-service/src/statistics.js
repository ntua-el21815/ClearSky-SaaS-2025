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

  const finalGradeDistribution = {};
  for (let i = 0; i <= 10; i++) {
    finalGradeDistribution[i] = grades.filter(g => g === i).length;
  }

  const questionDistributionsRaw = {};
  const questionDistributionsNormalized = {};

  const rawKeys = Object.keys(data[0].questionsRaw || {});
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

  // Skip normalized if not provided
  if (data[0]?.questionsNormalized) {
    const normKeys = Object.keys(data[0].questionsNormalized || {});
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

module.exports = {
  calculateStatistics
};
