const XLSX = require("xlsx");
const fs   = require("fs");

exports.parseExcel = (filePath) => {
  /* -------- read sheet -------- */
  const wb  = XLSX.readFile(filePath);
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  /* -------- locate headers row -------- */
  const headersIdx = raw.findIndex(r => Array.isArray(r) && r.includes("Αριθμός Μητρώου"));
  if (headersIdx === -1) throw new Error("Δεν βρέθηκε γραμμή κεφαλίδων");
  const headers    = raw[headersIdx].map(h => String(h).trim());
  const weightsRow = raw[headersIdx - 1] || [];
  const dataRows   = raw.slice(headersIdx + 1);

  /* -------- helper: column index by trimmed header -------- */
  const col = (name) => headers.findIndex(h => h === name);

  /* -------- map each student row -------- */
  const grades = dataRows
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    })
    .filter(r => r["Αριθμός Μητρώου"] && r["Βαθμολογία"]);

  /* -------- basic validations -------- */
  grades.forEach((row, i) => {
    const line = i + headersIdx + 2;
    ["Αριθμός Μητρώου","Ονοματεπώνυμο","Ακαδημαϊκό E-mail","Βαθμολογία"].forEach(f => {
      if (row[f] == null || row[f] === "") {
        throw new Error(`Το πεδίο '${f}' λείπει στη γραμμή ${line}`);
      }
    });
  });

  const seen = new Set();
  grades.forEach((row, i) => {
    if (seen.has(row["Αριθμός Μητρώου"])) {
      const line = i + headersIdx + 2;
      throw new Error(`Διπλότυπη εγγραφή για '${row["Αριθμός Μητρώου"]}' στη γραμμή ${line}`);
    }
    seen.add(row["Αριθμός Μητρώου"]);
  });

  /* -------- metadata -------- */
  const first = raw[headersIdx + 1] || [];
  const metadata = {};

  if (col("Περίοδος δήλωσης") !== -1)
    metadata.academicPeriod = first[col("Περίοδος δήλωσης")];

  if (col("Τμήμα Τάξης") !== -1)
    metadata._classField = first[col("Τμήμα Τάξης")];   // temp store

  if (col("Κλίμακα βαθμολόγησης") !== -1)
    metadata.ratingScale = first[col("Κλίμακα βαθμολόγησης")];

  /* -------- add weights w1..wN -------- */
  headers.forEach((h, i) => {
    if (/^Q\d{2,}$/i.test(h)) {
      metadata[`w${parseInt(h.slice(1), 10)}`] = weightsRow[i];
    }
  });

  /* -------- check weights total -------- */
  const totalW = Object.entries(metadata)
    .filter(([k]) => /^w\d+$/.test(k))
    .reduce((s, [,v]) => s + (typeof v === "number" ? v : 0), 0);
  if (totalW !== 0 && Math.abs(totalW - 100) > 0.01) {
    throw new Error(`Το άθροισμα των βαρών είναι ${totalW}, δεν ισούται με 100`);
  }

  /* =========================================================
     ✨  CUSTOM TRANSFORMATIONS
     ========================================================= */
  /* split Τμήμα Τάξης -> Μάθημα & Κωδ. μαθήματος */
  if (metadata._classField) {
    const m = metadata._classField.match(/^(.*)\s+\((\d+)\)\s*$/);
    if (m) {
      metadata.courseName = m[1].trim();
      metadata.courseId   = m[2];
    }
    delete metadata._classField;
  }

  /* normalise academicPeriod (ΧΕΙΜΕΡΙΝΗ / ΕΑΡΙΝΗ) */
  if (metadata.academicPeriod) {
    metadata.academicPeriod =
      metadata.academicPeriod
        .replace(/ΧΕΙΜ\s+\d{4}$/i, "ΧΕΙΜΕΡΙΝΗ")
        .replace(/ΕΑΡΙΝ\s+\d{4}$/i, "ΕΑΡΙΝΗ");
  }

  console.log("metadata:", metadata);     // ➜ should now show English keys
  fs.unlinkSync(filePath);

  return { grades, metadata };
};


