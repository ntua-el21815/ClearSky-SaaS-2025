require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db"); // adjust if your DB config file path is different
const UserEmail = require("./models/UserEmail"); // adjust path if needed

const mockUsers = [
{
  fullName: "ΚΑΡΑΓΙΑΝΝΗΣ ΕΛΕΝΗ",
  email: "el84623@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184623"
},
{
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΧΡΙΣΤΙΝΑ",
  email: "el84610@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184610"
},
{
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el84620@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184620"
},
{
  fullName: "ΒΑΣΙΛΕΙΟΥ ΣΟΦΙΑ",
  email: "el84621@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184621"
},
{
  fullName: "ΛΑΜΠΡΟΠΟΥΛΟΣ ΙΩΑΝΝΗΣ",
  email: "el84625@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184625"
},
{
  fullName: "ΔΗΜΗΤΡΙΟΥ ΧΡΗΣΤΟΣ",
  email: "el70676@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03170676"
},
{
  fullName: "ΣΠΥΡΙΔΩΝΟΣ ΓΕΩΡΓΙΑ",
  email: "el84618@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184618"
},
{
  fullName: "ΚΑΡΑΜΑΝΟΣ ΝΙΚΟΛΑΟΣ",
  email: "el80915@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180915"
},
{
  fullName: "ΒΑΣΙΛΕΙΟΥ ΓΙΩΡΓΟΣ",
  email: "el68190@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03168190"
},
{
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΧΡΗΣΤΟΣ",
  email: "el81137@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181137"
},
{
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΣΟΦΙΑ",
  email: "el81872@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181872"
},
{
  fullName: "ΚΑΡΑΓΙΑΝΝΗΣ ΧΡΗΣΤΟΣ",
  email: "el81873@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181873"
},
{
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΣΟΦΙΑ",
  email: "el80098@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181872"
},
{
  fullName: "ΒΑΣΙΛΕΙΟΥ ΑΓΓΕΛΙΚΗ",
  email: "el80877@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180877"
},
{
  fullName: "ΠΑΠΑΔΟΠΟΥΛΟΣ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el81697@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181697"
},
{
  fullName: "ΔΗΜΗΤΡΙΟΥ ΓΙΩΡΓΟΣ",
  email: "el78558@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03178558"
},
{
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΑΓΓΕΛΙΚΗ",
  email: "el81097@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181097"
},
{
  fullName: "ΘΕΟΔΩΡΟΥ ΓΕΩΡΓΙΑ",
  email: "el80860@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180860"
},
{
  fullName: "ΣΤΑΥΡΙΑΝΟΣ ΜΑΡΙΑ",
  email: "el75501@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03175501"
},
{
  fullName: "ΣΤΑΥΡΙΑΝΟΣ ΑΝΔΡΕΑΣ",
  email: "el80489@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180489"
},
{
  fullName: "ΑΝΑΣΤΑΣΙΟΥ ΕΙΡΗΝΗ",
  email: "rep.ntua@mail.ntua.gr",
  password: "123456",
  role: "institution_rep",
  institutionId: "NTUA",
  userCode: "REP2025NTUA"
},
{
  fullName: "ΠΑΠΑΔΑΚΗΣ ΝΙΚΟΛΑΟΣ",
  email: "npapadakis@ece.ntua.gr",
  password: "123456",
  role: "instructor",
  institutionId: "NTUA",
  userCode: "PROF2025NTUA"
},
{
  fullName: "ΛΑΖΑΡΙΔΗΣ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el90001@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025001"
},
{
  fullName: "ΠΑΠΑΔΗΜΗΤΡΙΟΥ ΕΛΕΝΗ",
  email: "el90002@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025002"
},
{
  fullName: "ΑΝΔΡΕΟΥ ΝΙΚΟΛΑΟΣ",
  email: "el90003@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025003"
},
{
  fullName: "ΜΑΡΙΑΔΗΜΟΥ ΚΑΤΕΡΙΝΑ",
  email: "el90004@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025004"
},
{
  fullName: "ΓΕΩΡΓΙΟΥ ΧΡΗΣΤΟΣ",
  email: "el90005@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025005"
},
{
  fullName: "ΚΑΡΑΛΗ ΣΟΦΙΑ",
  email: "el90006@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025006"
},
{
  fullName: "ΠΑΝΑΓΟΠΟΥΛΟΣ ΙΩΑΝΝΗΣ",
  email: "el90007@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025007"
},
{
  fullName: "ΑΛΕΞΑΚΗΣ ΜΙΧΑΗΛ",
  email: "el90008@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025008"
},
{
  fullName: "ΠΑΠΑΧΡΗΣΤΟΥ ΑΝΝΑ",
  email: "el90009@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025009"
},
{
  fullName: "ΣΤΑΜΑΤΟΠΟΥΛΟΣ ΘΕΟΔΩΡΟΣ",
  email: "el90010@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025010"
},
{
  fullName: "ΔΡΑΚΟΠΟΥΛΟΥ ΑΝΑΣΤΑΣΙΑ",
  email: "adrakopoulou@philosophy.uoa.gr",
  password: "123456",
  role: "instructor",
  institutionId: "ΕΚΠΑ",
  userCode: "PROF2025EKPA"
},
{
  fullName: "ΓΡΗΓΟΡΙΟΥ ΕΥΓΕΝΙΑ",
  email: "egrigoriou@admin.uoa.gr",
  password: "123456",
  role: "institution_rep",
  institutionId: "ΕΚΠΑ",
  userCode: "REP2025EKPA"
}
];

(async () => {
  try {
    await connectDB();

    for (const user of mockUsers) {
      if (user.role !== "student") continue; // ✅ Only seed students

      const exists = await UserEmail.findOne({ studentCode: user.userCode });
      if (exists) {
        console.log(`ℹ️  Already exists: ${user.userCode}`);
        continue;
      }

      await UserEmail.create({
        studentCode: user.userCode,
        email: user.email
      });

      console.log(`✅ Created: ${user.userCode} (${user.email})`);
    }

    console.log("🎉 Notification emails seeded.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
})();
