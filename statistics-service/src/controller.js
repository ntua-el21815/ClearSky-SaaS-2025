const { calculateStatistics } = require('./statistics');
const CourseStatistics = require('./model/courseStatistics');

exports.handleStatisticsSave = async (req, res) => {
  try {
    const { courseId, gradeSheetId, data } = req.body;

    if (!courseId || !gradeSheetId || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const stats = calculateStatistics(data);

    const saved = await CourseStatistics.create({
      courseId,
      gradeSheetId,
      ...stats
    });

    res.status(201).json({ message: 'Statistics saved', id: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate or save statistics' });
  }
};


exports.getAllStatistics = async (req, res) => {
  try {
    const all = await CourseStatistics.find().limit(100); // φέρνει έως 100
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

exports.calculateStatisticsFromInput = async (req, res) => {
  try {
    const wrapper = req.body?.data?.data;
    const gradesArray = wrapper?.grades;

    if (!Array.isArray(gradesArray)) {
      return res.status(400).json({ error: 'Invalid grades array' });
    }

    const transformed = gradesArray.map(student => ({
      studentId: student["Αριθμός Μητρώου"],
      finalGrade: student["Βαθμολογία"],
      questionsRaw: Object.fromEntries(
        Object.entries(student.responses || {}).map(([k, v]) => [`Q${k.padStart(2, '0')}`, v])
      )
    }));

    const stats = calculateStatistics(transformed);
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to calculate statistics' });
  }
};


exports.getStatisticsByCourse = async (req, res) => {
  try {
    const { institutionId, academicPeriod } = req.query;
    const courseId = req.params.courseId;

    if (!courseId || !institutionId || !academicPeriod) {
      return res.status(400).json({
        error: 'Missing courseId, institutionId, or academicPeriod'
      });
    }

    const stats = await CourseStatistics.find({
      courseId,
      institutionId,
      academicPeriod
    }).sort({ calculatedAt: -1 });

    if (!stats.length) {
      return res.status(404).json({
        error: 'No statistics found for the given course'
      });
    }

    res.json(stats[0]); // return latest stats
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course statistics' });
  }
};
