const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');

const ORG_ASSIGNMENT_STATUSES = ['acknowledged', 'accepted', 'in_progress', 'resolved'];

exports.listMyAssignments = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(400).json({
        success: false,
        message: 'Org user is not linked to an organization'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { organization: req.user.organization };
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('complaint')
      .populate('organization', 'name type')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const count = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      assignments,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

async function updateAssignmentStatus(req, res, nextStatus) {
  try {
    if (!req.user.organization) {
      return res.status(400).json({
        success: false,
        message: 'Org user is not linked to an organization'
      });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (String(assignment.organization) !== String(req.user.organization)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    if (!ORG_ASSIGNMENT_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment status'
      });
    }

    assignment.status = nextStatus;
    if (nextStatus === 'acknowledged') assignment.acknowledgedAt = new Date();
    if (nextStatus === 'accepted') assignment.acceptedAt = new Date();

    await assignment.save();

    const complaint = await Complaint.findById(assignment.complaint);
    if (complaint) {
      if (nextStatus === 'in_progress') {
        complaint.status = 'InProgress';
        complaint.statusHistory.push({
          status: 'InProgress',
          timestamp: new Date(),
          updatedBy: req.user.id
        });
      }
      if (nextStatus === 'resolved') {
        complaint.status = 'Resolved';
        complaint.resolvedAt = new Date();
        complaint.statusHistory.push({
          status: 'Resolved',
          timestamp: new Date(),
          updatedBy: req.user.id
        });
      }

      await complaint.save();
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('complaint')
      .populate('organization', 'name type');

    res.status(200).json({
      success: true,
      assignment: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
}

exports.acknowledgeAssignment = async (req, res) => updateAssignmentStatus(req, res, 'acknowledged');
exports.acceptAssignment = async (req, res) => updateAssignmentStatus(req, res, 'accepted');
exports.setInProgress = async (req, res) => updateAssignmentStatus(req, res, 'in_progress');
exports.setResolved = async (req, res) => updateAssignmentStatus(req, res, 'resolved');

async function findOrgAssignmentForComplaint(user, complaintId) {
  if (!user.organization) return null;
  return Assignment.findOne({ organization: user.organization, complaint: complaintId });
}

function statusHistoryPushIfChanged(complaint, status, userId) {
  const last = complaint.statusHistory?.[complaint.statusHistory.length - 1];
  if (last?.status === status) return;
  complaint.statusHistory = complaint.statusHistory || [];
  complaint.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId
  });
}

exports.uploadOngoingPhoto = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const assignment = await findOrgAssignmentForComplaint(req.user, complaintId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found for this complaint'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const imagePath = `/uploads/complaints/${req.file.filename}`;

    assignment.status = 'in_progress';
    await assignment.save();

    complaint.progressImages = complaint.progressImages || [];
    complaint.progressImages.push(imagePath);
    complaint.status = 'InProgress';
    statusHistoryPushIfChanged(complaint, 'InProgress', req.user.id);
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Ongoing photo uploaded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading ongoing photo',
      error: error.message
    });
  }
};

exports.uploadCompletionPhoto = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const confirm = String(req.body.confirm || '').toLowerCase();
    if (confirm !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required to mark as completed'
      });
    }

    const assignment = await findOrgAssignmentForComplaint(req.user, complaintId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found for this complaint'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const imagePath = `/uploads/complaints/${req.file.filename}`;

    assignment.status = 'resolved';
    await assignment.save();

    complaint.resolutionImages = complaint.resolutionImages || [];
    complaint.resolutionImages.push(imagePath);
    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    statusHistoryPushIfChanged(complaint, 'Resolved', req.user.id);
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Completion photo uploaded and complaint marked completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading completion photo',
      error: error.message
    });
  }
};
