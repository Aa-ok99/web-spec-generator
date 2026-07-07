const express = require('express');
const {
  getShareData,
  generatePDF,
  getShareView
} = require('../controllers/shareController');
const router = express.Router();

router.get('/:id', getShareView);
router.get('/data/:id', getShareData);
router.get('/pdf/:id', generatePDF);

module.exports = router;
