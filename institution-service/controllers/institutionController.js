const Institution = require('../models/Institution');

// Δημιουργία ιδρύματος
exports.createInstitution = async (req, res) => {
  try {
    const { id, ...rest } = req.body;          
    const institution = new Institution({ _id: id, ...rest });
    await institution.save();
    return res.status(201).json(institution);
  } catch (err) {
    if (err.code === 11000)                  
      return res.status(409).json({ message: 'Institution ID already exists' });
    return res.status(400).json({ error: err.message });
  }
};

// Ανάκτηση ιδρύματος
exports.getInstitution = async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    res.json(inst);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ενημέρωση
exports.updateInstitution = async (req, res) => {
  try {
    const updated = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// φέρνει όλα τα ιδρύματα
exports.getAllInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find(); 
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
