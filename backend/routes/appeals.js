const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createAppeal, getAppealById } = require('../controllers/appealController');

router.post('/', auth, createAppeal);
router.get('/:id', auth, getAppealById);

module.exports = router;
