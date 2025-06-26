// controllers/gradeController.js
const GradeUpload  = require('../models/GradeUpload');
const { parseExcel } = require('../services/excelParser');

exports.uploadGrades = async (req, res) => {
  try {
    /* 1. Parse Excel */
    const { grades, metadata } = parseExcel(req.file.path);
    const isFinal = req.body.final === 'true' || req.body.final === true;
    const instructorId = req.body.instructorId;


    /* 2. Extract weights into a separate object */
    const weights = {};
    Object.entries(metadata).forEach(([k, v]) => {
      if (/^w\d+$/i.test(k)) {
        weights[k.replace(/[^\d]/g, '')] = v;
        delete metadata[k];
      }
    });

    /* 3. Re-format grades */
    const formattedGrades = grades.map(row => {
      const {
        "Αριθμός Μητρώου": studentId,
        "Ονοματεπώνυμο"  : studentName,
        "Ακαδημαϊκό E-mail": academicalEmail,
        "Βαθμολογία"     : grade,
        ...rest
      } = row;

      const responses = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (/^q\d+$/i.test(k)) responses[k.replace(/[^\d]/g,'')] = v;
      });

      return {  studentId, studentName, academicalEmail, grade, responses };
    });

    /* 4. Build document */
    const doc = { timestamp:new Date(), ...metadata, final:Boolean(isFinal), instructorId, weights, grades:formattedGrades };

    /* 5. Delete previous upload for same course/period */
    const filter = {
      academicPeriod: metadata.academicPeriod,
      ratingScale: metadata.ratingScale,
      final: isFinal ? { $in: [false, null] } : false
    };
    if (metadata.courseName) filter.courseName = metadata.courseName;
    if (metadata.courseId) filter.courseId = metadata.courseId;


    // 5b. Check for conflicting uploads
    const existingInitial = await GradeUpload.findOne({
      courseId: metadata.courseId,
      academicPeriod: metadata.academicPeriod,
      final: { $in: [false, null] }
    });

    const existingFinal = await GradeUpload.findOne({
      courseId: metadata.courseId,
      academicPeriod: metadata.academicPeriod,
      final: true
    });

    console.log('Checking for duplicates with:', {
      courseId: metadata.courseId,
      academicPeriod: metadata.academicPeriod,
      isFinal
    });


    // Rule 1: Prevent second initial
    if (!isFinal && existingInitial) {
      return res.status(400).json({
        success: false,
        message: 'Initial grades have already been uploaded. Only one initial upload allowed.'
      });
    }

    // Rule 2: Prevent final if no initial
    if (isFinal && !existingInitial) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload final grades before uploading initial grades.'
      });
    }

    // Rule 3: Prevent second final
    if (isFinal && existingFinal) {
      return res.status(400).json({
        success: false,
        message: 'Final grades have already been uploaded. Only one final upload allowed.'
      });
    }


    /* 6. Save */
    const savedDoc = await GradeUpload.create(doc);

    /* 7. Success response — now includes the two fields */
    return res.status(200).json({
      success : true,
      message : 'Upload successful',
      data    : {
        metadata,           // <-- here are Μάθημα & Κωδ. μαθήματος
        weights,
        grades   : formattedGrades,
        _id      : savedDoc._id
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success : false,
      message : 'Upload failed.',
      error   : err.message
    });
  }
};

exports.getGradesByCourse = async (req, res) => {
  const { academicPeriod, courseId, final } = req.query;

  if (!academicPeriod || !courseId) {
    return res.status(400).json({ error: "Missing academicPeriod or courseId." });
  }

  const query = { academicPeriod, courseId };
  if (final !== undefined) query.final = final === "true";

  try {
    const result = await GradeUpload.findOne(query).lean();
    if (!result) return res.status(404).json({ message: "No grades found." });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching grades.");
  }
};


exports.getStudentGradesById = async (req, res) => {
  const { academicPeriod, courseId, studentId } = req.query;

  if (!academicPeriod || !courseId || !studentId) {
    return res.status(400).json({ error: "Missing academicPeriod, courseId or studentId." });
  }

  const course = await GradeUpload.findOne({ academicPeriod, courseId }).lean();
  if (!course) return res.status(404).json({ error: "Course not found." });

  const student = course.grades.find(g => g.studentId === studentId);
  if (!student) return res.status(404).json({ error: "Student not found." });

  res.json({ academicPeriod: course.academicPeriod, courseId: course.courseId, final: course.final, student });
};


exports.getInitialCourses = async (req, res) => {
  const { userCode } = req.query;

  if (!userCode) {
    return res.status(400).json({ success: false, message: "Missing userCode in query." });
  }

  try {
    // Step 1: Find all initial uploads for this instructor
    const initialCourses = await GradeUpload.find({
      final: { $in: [false, null] },
      instructorId: userCode
    }).lean();

    // Step 2: Get courseId + academicPeriod pairs that have a final upload
    const finals = await GradeUpload.find(
      { final: true },
      { courseId: 1, academicPeriod: 1 }
    ).lean();

    const finalKeys = new Set(finals.map(f => `${f.courseId}-${f.academicPeriod}`));

    // Step 3: Filter out initial uploads that already have a final
    const result = initialCourses.filter(doc => {
      const key = `${doc.courseId}-${doc.academicPeriod}`;
      return !finalKeys.has(key);
    });

    // If none found, return message
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No initial courses",
        data: []
      });
    }

    // Step 4: Return only the needed fields
    const courses = result.map(doc => ({
      courseId: doc.courseId,
      courseName: doc.courseName,
      academicPeriod: doc.academicPeriod,
      timestamp: doc.timestamp
    }));

    return res.status(200).json({ success: true, data: courses });
  } catch (err) {
    console.error("getInitialCourses error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch initial-only courses." });
  }
};



