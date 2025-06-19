const GradeUpload = require('../models/GradeUpload');
const { parseExcel } = require('../services/excelParser');

exports.uploadGrades = async (req, res) => {
  try {
    const { grades, metadata } = parseExcel(req.file.path);
    const isFinal = req.body.final === 'true' || req.body.final === true;

    const weights = {};
    Object.entries(metadata).forEach(([key, value]) => {
      if (/^w\d+$/i.test(key)) {
        const num = key.replace(/[^\d]/g, '');
        weights[num] = value;
        delete metadata[key];
      }
    });

    const formattedGrades = grades.map(({ "Αριθμός Μητρώου": id, "Ονοματεπώνυμο": name, "Ακαδημαϊκό E-mail": email, "Βαθμολογία": grade, ...rest }) => {
      const responses = {};
      Object.entries(rest).forEach(([key, value]) => {
        if (/^q\d+$/i.test(key)) {
          const num = key.replace(/[^\d]/g, '');
          responses[num] = value;
        }
      });
      return {
        "Αριθμός Μητρώου": id,
        "Ονοματεπώνυμο": name,
        "Ακαδημαϊκό E-mail": email,
        "Βαθμολογία": grade,
        responses
      };
    });

    const result = {
      timestamp: new Date(),
      final: isFinal,
      ...metadata,
      weights,
      grades: formattedGrades
    };

    // Διαγραφή προηγούμενης υποβολής για το ίδιο μάθημα
    await GradeUpload.deleteMany({
      "Περίοδος δήλωσης": metadata["Περίοδος δήλωσης"],
      "Τμήμα Τάξης": metadata["Τμήμα Τάξης"],
      "Κλίμακα βαθμολόγησης": metadata["Κλίμακα βαθμολόγησης"],
      final: isFinal ? { $in: [false, null] } : false
    }); 
    
    const saved = await GradeUpload.create(result);
    res.json({ message: "Upload successful", data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed.");
  }
};
exports.getGradesByCourse = async (req, res) => {
  const { period, class: className, final } = req.query;

  if (!period || !className) {
    return res.status(400).json({ error: "Missing query parameters: period and class are required." });
  }

  const query = {
    "Περίοδος δήλωσης": period,
    "Τμήμα Τάξης": className,
  };

  if (final !== undefined) {
    query.final = final === "true";
  }

  try {
    const result = await GradeUpload.findOne(query).lean();
    if (!result) {
      return res.status(404).json({ message: "Δεν βρέθηκαν βαθμολογίες για το συγκεκριμένο μάθημα." });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Σφάλμα στη λήψη βαθμολογιών.");
  }
};