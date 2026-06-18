const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getVerdictByImageId } = require('../controllers/verdictController');

router.get('/:imageId', auth, getVerdictByImageId);

module.exports = router;
