const XLSX = require("xlsx");
const fs = require("fs");

exports.parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headersIndex = rawData.findIndex(row => Array.isArray(row) && row.includes("Αριθμός Μητρώου"));
  const headers = rawData[headersIndex];
  const weightsRow = rawData[headersIndex - 1]; // η σειρά με τα βάρη Wxx
  console.log("headers:", headers);
  console.log("weightsRow:", weightsRow);
  const dataRows = rawData.slice(headersIndex + 1);

  const entries = dataRows.map(row => {
    const entry = {};
    headers.forEach((key, i) => {
      entry[key] = row[i];
    });

    const mapped = {
      "Αριθμός Μητρώου": entry["Αριθμός Μητρώου"],
      "Ονοματεπώνυμο": entry["Ονοματεπώνυμο"],
      "Ακαδημαϊκό E-mail": entry["Ακαδημαϊκό E-mail"],
      "Βαθμολογία": entry["Βαθμολογία"],
    };

    headers.forEach((header, i) => {
      const cleanHeader = String(header).trim();
      if (/^Q\d{2,}$/.test(cleanHeader)) {
        const index = parseInt(cleanHeader.slice(1), 10);
        mapped[`q${index}`] = row[i];
      }
    });

    return mapped;
  }).filter(row => row["Αριθμός Μητρώου"] && row["Βαθμολογία"]);

  // Έλεγχος για υποχρεωτικά πεδία σε κάθε entry
  entries.forEach((row, i) => {
    const line = i + headersIndex + 2; // 1-based line number
    ["Αριθμός Μητρώου", "Ονοματεπώνυμο", "Ακαδημαϊκό E-mail", "Βαθμολογία"].forEach(field => {
      if (row[field] === undefined || row[field] === null || row[field] === "") {
        throw new Error(`Το πεδίο '${field}' λείπει ή είναι κενό στη γραμμή ${line}`);
      }
    });
  });

  // Έλεγχος για διπλότυπες εγγραφές βάσει του πεδίου "Αριθμός Μητρώου"
  const seen = new Set();
  entries.forEach((row, i) => {
    const id = row["Αριθμός Μητρώου"];
    if (seen.has(id)) {
      const line = i + headersIndex + 2;
      throw new Error(`Διπλότυπη εγγραφή για 'Αριθμός Μητρώου' (${id}) στη γραμμή ${line}`);
    }
    seen.add(id);
  });

  // Βρες τα metadata από την πρώτη εγγραφή
  const first = rawData[headersIndex + 1];
  const metadata = {
    "Περίοδος δήλωσης": first[headers.indexOf("Περίοδος δήλωσης")],
    "Τμήμα Τάξης": first[headers.indexOf("Τμήμα Τάξης")],
    "Κλίμακα βαθμολόγησης": first[headers.indexOf("Κλίμακα βαθμολόγησης")],
  };

  // Πρόσθεσε τα w1–w10 από τη weightsRow
  // Ανίχνευσε βάρη για όλα τα Qxx που υπάρχουν
  headers.forEach((header, i) => {
    const cleanHeader = String(header).trim();
    if (/^Q\d{2,}$/.test(cleanHeader)) {
      const index = parseInt(cleanHeader.slice(1), 10);
      metadata[`w${index}`] = weightsRow[i];
    }
  });

  const totalWeight = Object.entries(metadata)
    .filter(([key]) => /^w\d+$/.test(key))
    .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);

  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new Error(`Το άθροισμα των βαρών είναι ${totalWeight}, δεν ισούται με 100`);
  }

  console.log("metadata:", metadata);
  fs.unlinkSync(filePath);
  return { grades: entries, metadata };
};