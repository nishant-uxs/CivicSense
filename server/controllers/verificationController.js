const Complaint = require('../models/Complaint');
const { verifyComplaintIntegrity, checkComplaintExistsOnChain, generateHash } = require('../utils/blockchain');

exports.verifyComplaintIntegrity = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!complaint.onChain) {
      return res.status(200).json({
        success: true,
        verified: false,
        onChain: false,
        message: 'Complaint not registered on blockchain',
        complaint
      });
    }

    const complaintDataForHash = {
      id: complaint._id.toString(),
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      reporter: complaint.reporter._id.toString(),
      timestamp: complaint.createdAt
    };

    const currentHash = generateHash(complaintDataForHash);
    const hashMatch = currentHash === complaint.blockchainHash;

    let blockchainVerified = false;
    try {
      blockchainVerified = await verifyComplaintIntegrity(
        complaint._id.toString(),
        complaintDataForHash
      );
    } catch (error) {
      console.error('Blockchain verification error:', error);
    }

    const existsOnChain = await checkComplaintExistsOnChain(complaint._id.toString());

    const isTampered = !hashMatch || !blockchainVerified;

    res.status(200).json({
      success: true,
      verified: !isTampered,
      onChain: existsOnChain,
      hashMatch: hashMatch,
      blockchainVerified: blockchainVerified,
      transactionId: complaint.transactionId,
      blockNumber: complaint.blockNumber,
      blockchainHash: complaint.blockchainHash,
      currentHash: currentHash,
      message: isTampered 
        ? '⚠️ WARNING: Data has been tampered with! Hash mismatch detected.' 
        : '✅ Complaint data is verified and has not been tampered with.',
      cannotBeDeleted: existsOnChain,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying complaint',
      error: error.message
    });
  }
};

exports.getBlockchainProof = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('verifiedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!complaint.onChain) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not registered on blockchain'
      });
    }

    const proof = {
      complaintId: complaint._id,
      title: complaint.title,
      category: complaint.category,
      status: complaint.status,
      reporter: complaint.reporter.name,
      createdAt: complaint.createdAt,
      blockchain: {
        onChain: complaint.onChain,
        hash: complaint.blockchainHash,
        transactionId: complaint.transactionId,
        blockNumber: complaint.blockNumber,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${complaint.transactionId}`
      },
      statusHistory: complaint.statusHistory,
      resolution: complaint.resolutionHash ? {
        hash: complaint.resolutionHash,
        transactionId: complaint.resolutionTransactionId,
        resolvedAt: complaint.resolvedAt,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${complaint.resolutionTransactionId}`
      } : null
    };

    res.status(200).json({
      success: true,
      proof
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blockchain proof',
      error: error.message
    });
  }
};
