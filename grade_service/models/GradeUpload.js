const mongoose = require('mongoose');

const gradeUploadSchema = new mongoose.Schema({
  timestamp: Date,
  "Περίοδος δήλωσης": String,
  "Τμήμα Τάξης": String,
  "Κλίμακα βαθμολόγησης": String,
  final: Boolean,
  weights: {
    type: Map,
    of: Number
  },
  grades: [
    {
      "Αριθμός Μητρώου": String,
      "Ονοματεπώνυμο": String,
      "Ακαδημαϊκό E-mail": String,
      "Βαθμολογία": Number,
      responses: {
        type: Map,
        of: Number
      }
    }
  ]
});

module.exports = mongoose.model('GradeUpload', gradeUploadSchema);