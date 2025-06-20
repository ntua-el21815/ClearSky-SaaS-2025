const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const courseController = require('../controllers/courseController');

// CRUD endpoints
router.post('/', institutionController.createInstitution);
router.get('/:id', institutionController.getInstitution);
router.put('/:id', institutionController.updateInstitution);
router.get('/', institutionController.getAllInstitutions);
router.post('/:institutionId/courses', courseController.createCourse);
router.get('/:institutionId/courses', courseController.getCoursesByInstitution);

module.exports = router;
