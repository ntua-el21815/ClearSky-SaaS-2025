const Course = require('../models/Course');

// Δημιουργία νέου μαθήματος
exports.createCourse = async (req, res) => {
  try {
    const { courseId, ...rest } = req.body;                 
    const payload = {
      courseId,
      ...rest,
      institutionId: req.params.institutionId      
    };
    const course = new Course(payload);
    await course.save();
    return res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Course already exists in institution' });
    return res.status(400).json({ error: err.message });
  }
};

//Ανανέωση μαθήματος
exports.updateCourse = async (req, res) => {
  try {
    const { courseId, institutionId, ...rest } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.courseId,
      rest,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Duplicate key' });
    return res.status(400).json({ error: err.message });
  }
};


// Λήψη όλων των μαθημάτων ενός ιδρύματος
exports.getCoursesByInstitution = async (req, res) => {
  try {
    const courses = await Course.find({ institutionId: req.params.institutionId });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
