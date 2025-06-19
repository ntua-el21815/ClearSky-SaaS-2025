


# Grade Upload Microservice – clearSKY

Το microservice αυτό είναι υπεύθυνο για την αποδοχή, επεξεργασία και αποθήκευση βαθμολογιών φοιτητών σε μορφή Excel, στο πλαίσιο του συστήματος clearSKY.

## Τεχνολογίες

- Node.js + Express
- MongoDB (μέσω Mongoose)
- Multer (για ανέβασμα αρχείων)
- XLSX (για parsing αρχείων Excel)
- Docker + Docker Compose

## Εκκίνηση με Docker

1. Βεβαιώσου ότι έχεις Docker Desktop ενεργό
2. Εκτέλεσε:
   ```bash
   docker-compose up --build
   ```

Η εφαρμογή θα είναι διαθέσιμη στο: `http://localhost:3000`

## Ανέβασμα Excel

- Endpoint: `POST /gradeRoutes/upload-initial`
- Μέθοδος: `multipart/form-data`
- Πεδίο: `file` (το αρχείο `.xlsx`)
- Επιπλέον: `final=true` (αν είναι τελική βαθμολογία) αλλιώς `final=false`

Το αρχείο Excel πρέπει να περιέχει στήλες όπως:
- `Αριθμός Μητρώου`
- `Ονοματεπώνυμο`
- `Ακαδημαϊκό E-mail`
- `Βαθμολογία`
- Προαιρετικά: `Q01–Qxx` (βαθμοί) και `W01–Wxx` (βάρη)

## Ανάκτηση βαθμολογιών

- Endpoint: `GET /gradeRoutes`
- Παραδείγματα:
  ```
  /gradeRoutes?period=2024-2025 ΧΕΙΜ 2024&class=ΤΕΧΝΟΛΟΓΙΑ ΛΟΓΙΣΜΙΚΟΥ (3205)
  /gradeRoutes?period=...&class=...&final=true
  ```

## Επιπλέον Λειτουργίες

- Υποστήριξη `final` βαθμολογιών
- Επικύρωση Excel: υποχρεωτικά πεδία, μοναδικότητα φοιτητών, άθροισμα βαρών
- Αυτόματη αντικατάσταση προηγούμενων uploads για το ίδιο μάθημα

## Δομή MongoDB

```json
{
  "Περίοδος δήλωσης": "...",
  "Τμήμα Τάξης": "...",
  "Κλίμακα βαθμολόγησης": "...",
  "final": true,
  "weights": { "1": 5, "2": 10, ... },
  "grades": [
    {
      "Αριθμός Μητρώου": "...",
      "Βαθμολογία": ...,
      "responses": { "1": 8, "2": 9, ... }
    }
  ]
}
```