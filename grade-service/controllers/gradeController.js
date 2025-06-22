// controllers/gradeController.js
const GradeUpload  = require('../models/GradeUpload');
const { parseExcel } = require('../services/excelParser');

exports.uploadGrades = async (req, res) => {
  try {
    /* 1. Parse Excel */
    const { grades, metadata } = parseExcel(req.file.path);
    const isFinal = req.body.final === 'true' || req.body.final === true;

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
        "Αριθμός Μητρώου": id,
        "Ονοματεπώνυμο"  : name,
        "Ακαδημαϊκό E-mail": email,
        "Βαθμολογία"     : grade,
        ...rest
      } = row;

      const responses = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (/^q\d+$/i.test(k)) responses[k.replace(/[^\d]/g,'')] = v;
      });

      return { "Αριθμός Μητρώου": id, "Ονοματεπώνυμο": name,
               "Ακαδημαϊκό E-mail": email, "Βαθμολογία": grade, responses };
    });

    /* 4. Build document */
    const doc = { timestamp:new Date(), final:isFinal, ...metadata, weights, grades:formattedGrades };

    /* 5. Delete previous upload for same course/period */
    const filter = {
      "Περίοδος δήλωσης": metadata["Περίοδος δήλωσης"],
      "Κλίμακα βαθμολόγησης": metadata["Κλίμακα βαθμολόγησης"],
      final: isFinal ? { $in:[false,null] } : false
    };
    if (metadata["Μάθημα"])             filter["Μάθημα"]             = metadata["Μάθημα"];
    if (metadata["Κωδικός μαθήματος"])  filter["Κωδικός μαθήματος"]  = metadata["Κωδικός μαθήματος"];
    await GradeUpload.deleteMany(filter);

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

exports.getStudentGradesById = async (req, res) => {
  const { period, courseName, courseCode, id } = req.query;

  console.log("Query parameters:", req.query);

  if (!period || !courseName || !courseCode || !id) {
    return res.status(400).json({ error: "Missing period, courseName, courseCode, or id query parameters." });
  }

  try {
    const course = await GradeUpload.findOne({
      "Περίοδος δήλωσης": period,
      "Μάθημα": courseName,
      "Κωδικός μαθήματος": courseCode,
    }).lean();

    if (!course) {
      return res.status(404).json({ error: "Μάθημα δεν βρέθηκε." });
    }

    const student = course.grades.find(g => g["Αριθμός Μητρώου"] === id);

    if (!student) {
      return res.status(404).json({ error: "Ο φοιτητής δεν βρέθηκε." });
    }

    return res.json({
      "Περίοδος δήλωσης": course["Περίοδος δήλωσης"],
      "Μάθημα": course["Μάθημα"],
      "Κωδικός μαθήματος": course["Κωδικός μαθήματος"],
      final: course.final,
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Σφάλμα κατά την αναζήτηση φοιτητή.");
  }
};

exports.getGradesByCourse = async (req, res) => { /* unchanged */ };

