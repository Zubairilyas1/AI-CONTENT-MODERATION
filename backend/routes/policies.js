const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { getPolicies, updatePolicy } = require('../controllers/policyController');

router.get('/', auth, roleGuard, getPolicies);
router.patch('/:category', auth, roleGuard, updatePolicy);

module.exports = router;
