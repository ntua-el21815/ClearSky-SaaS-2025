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
