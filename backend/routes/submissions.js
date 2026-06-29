const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
} = require('../controllers/submissionController');

// POST /api/submissions - Submit images via URLs
router.post('/', auth, createSubmission);

// GET /api/submissions - List user's submissions
router.get('/', auth, getSubmissions);

// GET /api/submissions/:id - Get single submission
router.get('/:id', auth, getSubmissionById);

module.exports = router;
