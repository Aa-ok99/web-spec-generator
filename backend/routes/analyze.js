const express = require('express');
const { analyzeWebsite } = require('../controllers/analyzeController');
const router = express.Router();

router.post('/', analyzeWebsite);

module.exports = router;
