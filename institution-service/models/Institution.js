const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema(
  {
    _id:          { type: String, required: true },   
    name:         { type: String, required: true },
    address:      { type: String },
    region:       { type: String },   
    contactPhone: { type: String }
  },
  {
    timestamps: true,  
    id: false         
  }
);

module.exports = mongoose.model('Institution', InstitutionSchema);

