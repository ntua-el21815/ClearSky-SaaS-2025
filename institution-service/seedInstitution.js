require('dotenv').config();
const connectDB   = require('./config/db');
const Institution = require('./models/Institution');

const DEFAULT_INSTITUTION = {
  _id          : 'default',     
  institutionId: 'NTUA',           
  name         : 'National Technical University of Athens',
  address      : '123 Main St',
  contactEmail : 'mail@ntua.gr',
  contactPhone : '2101234567'
};

(async () => {
  try {
    await connectDB();

    const existing = await Institution.findById(DEFAULT_INSTITUTION._id);
    if (existing) {
      console.log('ℹ️  Institution already exists, skipping insert.');
    } else {
      await Institution.create(DEFAULT_INSTITUTION);
      console.log('✅  Default Institution inserted.');
    }

    process.exit(0); // success
  } catch (err) {
    console.error('❌ Failed to seed institution:', err.message);
    process.exit(1); // error
  }
})();
