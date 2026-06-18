const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/', auth, roleGuard, getAnalytics);

module.exports = router;
