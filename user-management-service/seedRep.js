require("dotenv").config();
const bcrypt    = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");

// Your provided mock users with specific _id values
const mockUsers = [
{
  _id: "685bda768a59ccd6ddcfff02",
  fullName: "ΚΑΡΑΓΙΑΝΝΗΣ ΕΛΕΝΗ",
  email: "el84623@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184623"
},
{
  _id: "685bda768a59ccd6ddcfff03",
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΧΡΙΣΤΙΝΑ",
  email: "el84610@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184610"
},
{
  _id: "685bda768a59ccd6ddcfff04",
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el84620@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184620"
},
{
  _id: "685bda768a59ccd6ddcfff05",
  fullName: "ΒΑΣΙΛΕΙΟΥ ΣΟΦΙΑ",
  email: "el84621@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184621"
},
{
  _id: "685bda768a59ccd6ddcfff06",
  fullName: "ΛΑΜΠΡΟΠΟΥΛΟΣ ΙΩΑΝΝΗΣ",
  email: "el84625@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184625"
},
{
  _id: "685bda768a59ccd6ddcfff07",
  fullName: "ΔΗΜΗΤΡΙΟΥ ΧΡΗΣΤΟΣ",
  email: "el70676@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03170676"
},
{
  _id: "685bda768a59ccd6ddcfff08",
  fullName: "ΣΠΥΡΙΔΩΝΟΣ ΓΕΩΡΓΙΑ",
  email: "el84618@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03184618"
},
{
  _id: "685bda768a59ccd6ddcfff09",
  fullName: "ΚΑΡΑΜΑΝΟΣ ΝΙΚΟΛΑΟΣ",
  email: "el80915@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180915"
},
{
  _id: "685bda768a59ccd6ddcfff0a",
  fullName: "ΒΑΣΙΛΕΙΟΥ ΓΙΩΡΓΟΣ",
  email: "el68190@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03168190"
},
{
  _id: "685bda768a59ccd6ddcfff0b",
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΧΡΗΣΤΟΣ",
  email: "el81137@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181137"
},
{
  _id: "685bda768a59ccd6ddcfff0c",
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΣΟΦΙΑ",
  email: "el81872@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181872"
},
{
  _id: "685bda768a59ccd6ddcfff0d",
  fullName: "ΚΑΡΑΓΙΑΝΝΗΣ ΧΡΗΣΤΟΣ",
  email: "el81873@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181873"
},
{
  _id: "685bda768a59ccd6ddcfff0e",
  fullName: "ΑΛΕΞΑΝΔΡΟΥ ΣΟΦΙΑ",
  email: "el80098@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180098"
},
{
  _id: "685bda768a59ccd6ddcfff0f",
  fullName: "ΒΑΣΙΛΕΙΟΥ ΑΓΓΕΛΙΚΗ",
  email: "el80877@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180877"
},
{
  _id: "685bda768a59ccd6ddcfff10",
  fullName: "ΠΑΠΑΔΟΠΟΥΛΟΣ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el81697@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181697"
},
{
  _id: "685bda768a59ccd6ddcfff11",
  fullName: "ΔΗΜΗΤΡΙΟΥ ΓΙΩΡΓΟΣ",
  email: "el78558@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03178558"
},
{
  _id: "685bda768a59ccd6ddcfff12",
  fullName: "ΝΙΚΟΛΑΪΔΗΣ ΑΓΓΕΛΙΚΗ",
  email: "el81097@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03181097"
},
{
  _id: "685bda768a59ccd6ddcfff13",
  fullName: "ΘΕΟΔΩΡΟΥ ΓΕΩΡΓΙΑ",
  email: "el80860@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180860"
},
{
  _id: "685bda768a59ccd6ddcfff14",
  fullName: "ΣΤΑΥΡΙΑΝΟΣ ΜΑΡΙΑ",
  email: "el75501@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03175501"
},
{
  _id: "685bda768a59ccd6ddcfff15",
  fullName: "ΣΤΑΥΡΙΑΝΟΣ ΑΝΔΡΕΑΣ",
  email: "el80489@mail.ntua.gr",
  password: "123456",
  role: "student",
  institutionId: "NTUA",
  userCode: "03180489"
},
{
  _id: "685bda768a59ccd6ddcfff16",
  fullName: "ΑΝΑΣΤΑΣΙΟΥ ΕΙΡΗΝΗ",
  email: "rep.ntua@mail.ntua.gr",
  password: "123456",
  role: "representative",
  institutionId: "NTUA",
  userCode: "REP2025NTUA"
},
{
  _id: "685bda768a59ccd6ddcfff17",
  fullName: "ΠΑΠΑΔΑΚΗΣ ΝΙΚΟΛΑΟΣ",
  email: "npapadakis@ece.ntua.gr",
  password: "123456",
  role: "instructor",
  institutionId: "NTUA",
  userCode: "PROF2025NTUA"
},
{
  _id: "685bda768a59ccd6ddcfffa1",
  fullName: "ΛΑΖΑΡΙΔΗΣ ΠΑΝΑΓΙΩΤΗΣ",
  email: "el90001@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025001"
},
{
  _id: "685bda768a59ccd6ddcfffa2",
  fullName: "ΠΑΠΑΔΗΜΗΤΡΙΟΥ ΕΛΕΝΗ",
  email: "el90002@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025002"
},
{
  _id: "685bda768a59ccd6ddcfffa3",
  fullName: "ΑΝΔΡΕΟΥ ΝΙΚΟΛΑΟΣ",
  email: "el90003@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025003"
},
{
  _id: "685bda768a59ccd6ddcfffa4",
  fullName: "ΜΑΡΙΑΔΗΜΟΥ ΚΑΤΕΡΙΝΑ",
  email: "el90004@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025004"
},
{
  _id: "685bda768a59ccd6ddcfffa5",
  fullName: "ΓΕΩΡΓΙΟΥ ΧΡΗΣΤΟΣ",
  email: "el90005@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025005"
},
{
  _id: "685bda768a59ccd6ddcfffa6",
  fullName: "ΚΑΡΑΛΗ ΣΟΦΙΑ",
  email: "el90006@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025006"
},
{
  _id: "685bda768a59ccd6ddcfffa7",
  fullName: "ΠΑΝΑΓΟΠΟΥΛΟΣ ΙΩΑΝΝΗΣ",
  email: "el90007@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025007"
},
{
  _id: "685bda768a59ccd6ddcfffa8",
  fullName: "ΑΛΕΞΑΚΗΣ ΜΙΧΑΗΛ",
  email: "el90008@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025008"
},
{
  _id: "685bda768a59ccd6ddcfffa9",
  fullName: "ΠΑΠΑΧΡΗΣΤΟΥ ΑΝΝΑ",
  email: "el90009@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025009"
},
{
  _id: "685bda768a59ccd6ddcfffaa",
  fullName: "ΣΤΑΜΑΤΟΠΟΥΛΟΣ ΘΕΟΔΩΡΟΣ",
  email: "el90010@mail.uoa.gr",
  password: "123456",
  role: "student",
  institutionId: "ΕΚΠΑ",
  userCode: "EKPA2025010"
},
{
  _id: "685bda768a59ccd6ddcfffb0",
  fullName: "ΔΡΑΚΟΠΟΥΛΟΥ ΑΝΑΣΤΑΣΙΑ",
  email: "adrakopoulou@philosophy.uoa.gr",
  password: "123456",
  role: "instructor",
  institutionId: "ΕΚΠΑ",
  userCode: "PROF2025EKPA"
},
{
  _id: "685bda768a59ccd6ddcfffb1",
  fullName: "ΓΡΗΓΟΡΙΟΥ ΕΥΓΕΝΙΑ",
  email: "egrigoriou@admin.uoa.gr",
  password: "123456",
  role: "representative",
  institutionId: "ΕΚΠΑ",
  userCode: "REP2025EKPA"
}
];

(async () => {
  try {
    await connectDB();

    for (const userData of mockUsers) {
      const exists = await User.findOne({ _id: userData._id });
      if (exists) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
        continue;
      }

      const hash = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hash });

      console.log(`✅  Created: ${userData.email} (${userData.role})`);
    }

    console.log("🎉 All users seeded with specific IDs.");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    process.exit(1);
  }
})();
