const Complaint = require('../models/Complaint');
const {
  updateComplaintStatusOnChain,
  resolveComplaintOnChain,
  checkComplaintExistsOnChain
} = require('../utils/blockchain');

exports.verifyComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // MANDATORY: Push status to blockchain FIRST
    let bcResult;
    try {
      bcResult = await updateComplaintStatusOnChain(complaint._id.toString(), 'Verified');
    } catch (bcError) {
      console.error('❌ Blockchain status update failed:', bcError.message);
      return res.status(503).json({
        success: false,
        message: 'Blockchain transaction failed. Status NOT updated — on-chain sync is mandatory.',
        error: bcError.message
      });
    }

    complaint.status = 'Verified';
    complaint.verifiedBy = req.user.id;
    complaint.verifiedAt = new Date();
    complaint.statusHistory.push({
      status: 'Verified',
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint verified on blockchain and database',
      complaint,
      blockchain: { transactionId: bcResult.transactionId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying complaint',
      error: error.message
    });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Reported', 'Verified', 'InProgress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // MANDATORY: Push status to blockchain FIRST
    let bcResult;
    try {
      bcResult = await updateComplaintStatusOnChain(complaint._id.toString(), status);
    } catch (bcError) {
      console.error('❌ Blockchain status update failed:', bcError.message);
      return res.status(503).json({
        success: false,
        message: 'Blockchain transaction failed. Status NOT updated — on-chain sync is mandatory.',
        error: bcError.message
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Status updated on blockchain and database',
      complaint,
      blockchain: { transactionId: bcResult.transactionId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const resolutionImagePaths = req.files 
      ? req.files.map(file => `/uploads/complaints/${file.filename}`) 
      : [];

    const resolutionData = {
      complaintId: complaint._id.toString(),
      resolutionImages: resolutionImagePaths,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };

    // MANDATORY: Push resolution to blockchain FIRST
    let blockchainResult;
    try {
      blockchainResult = await resolveComplaintOnChain(
        complaint._id.toString(),
        resolutionData
      );
    } catch (bcError) {
      console.error('❌ Blockchain resolution failed:', bcError.message);
      return res.status(503).json({
        success: false,
        message: 'Blockchain transaction failed. Resolution NOT saved — on-chain proof-of-resolution is mandatory.',
        error: bcError.message
      });
    }

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.resolutionImages = resolutionImagePaths;
    complaint.resolutionHash = blockchainResult.resolutionHash;
    complaint.resolutionTransactionId = blockchainResult.transactionId;
    complaint.statusHistory.push({
      status: 'Resolved',
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint resolved on blockchain and database',
      complaint,
      blockchain: {
        transactionId: blockchainResult.transactionId,
        resolutionHash: blockchainResult.resolutionHash
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving complaint',
      error: error.message
    });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted (marked for anomaly detection)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

exports.detectAnomalies = async (req, res) => {
  try {
    const dbComplaints = await Complaint.find().select('_id');
    const dbComplaintIds = dbComplaints.map(c => c._id.toString());

    const anomalies = [];

    for (const id of dbComplaintIds) {
      const existsOnChain = await checkComplaintExistsOnChain(id);
      if (!existsOnChain) {
        anomalies.push({
          complaintId: id,
          type: 'missing_on_chain',
          message: 'Complaint exists in DB but not on blockchain'
        });
      }
    }

    res.status(200).json({
      success: true,
      anomalies,
      count: anomalies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: error.message
    });
  }
};
