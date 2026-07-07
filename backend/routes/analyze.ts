const express = require('express');
const { analyzeWebsite, generateCode, downloadZip, generateFromPrompt } = require('../controllers/analyzeController');
const router = express.Router();

router.post('/', analyzeWebsite);
router.post('/generate', generateCode);
router.post('/from-prompt', generateFromPrompt);
router.get('/generate/:id/download', downloadZip);

module.exports = router;
