const express = require('express');
const router = express.Router();
const {
  verifyComplaint,
  updateComplaintStatus,
  resolveComplaint,
  deleteComplaint,
  detectAnomalies
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('admin'));

router.patch('/:id/verify', verifyComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/resolve', upload.array('resolutionImages', 5), resolveComplaint);
router.delete('/:id', deleteComplaint);
router.get('/anomalies', detectAnomalies);

module.exports = router;
