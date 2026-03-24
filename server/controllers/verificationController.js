const supabase = require('../utils/supabase');
const { verifyComplaintIntegrity, checkComplaintExistsOnChain, generateHash } = require('../utils/blockchain');
const { formatComplaintResponse } = require('./complaintController');

exports.verifyComplaintIntegrity = async (req, res) => {
  try {
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Fetch reporter
    const { data: reporter } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', complaint.reporter_id)
      .single();

    if (!complaint.on_chain) {
      return res.status(200).json({
        success: true,
        verified: false,
        onChain: false,
        message: 'Complaint not registered on blockchain',
        complaint: formatComplaintResponse(complaint, reporter)
      });
    }

    const complaintDataForHash = {
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: {
        type: 'Point',
        coordinates: [complaint.location_lng, complaint.location_lat],
        address: complaint.location_address
      },
      reporter: complaint.reporter_id,
      timestamp: complaint.created_at
    };

    const currentHash = generateHash(complaintDataForHash);
    const hashMatch = currentHash === complaint.blockchain_hash;

    let blockchainVerified = false;
    try {
      blockchainVerified = await verifyComplaintIntegrity(
        complaint.id,
        complaintDataForHash
      );
    } catch (err) {
      console.error('Blockchain verification error:', err);
    }

    const existsOnChain = await checkComplaintExistsOnChain(complaint.id);

    const isTampered = !hashMatch || !blockchainVerified;

    res.status(200).json({
      success: true,
      verified: !isTampered,
      onChain: existsOnChain,
      hashMatch,
      blockchainVerified,
      transactionId: complaint.transaction_id,
      blockNumber: complaint.block_number,
      blockchainHash: complaint.blockchain_hash,
      currentHash,
      message: isTampered
        ? '⚠️ WARNING: Data has been tampered with! Hash mismatch detected.'
        : '✅ Complaint data is verified and has not been tampered with.',
      cannotBeDeleted: existsOnChain,
      complaint: formatComplaintResponse(complaint, reporter)
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
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!complaint.on_chain) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not registered on blockchain'
      });
    }

    // Fetch reporter and verifiedBy
    const { data: reporter } = await supabase.from('users').select('id, name, email').eq('id', complaint.reporter_id).single();

    // Fetch status history
    const { data: statusHistory } = await supabase
      .from('status_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .order('timestamp', { ascending: true });

    const proof = {
      complaintId: complaint.id,
      title: complaint.title,
      category: complaint.category,
      status: complaint.status,
      reporter: reporter ? reporter.name : 'Unknown',
      createdAt: complaint.created_at,
      blockchain: {
        onChain: complaint.on_chain,
        hash: complaint.blockchain_hash,
        transactionId: complaint.transaction_id,
        blockNumber: complaint.block_number,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${complaint.transaction_id}`
      },
      statusHistory: (statusHistory || []).map(s => ({
        status: s.status,
        timestamp: s.timestamp,
        updatedBy: s.updated_by
      })),
      resolution: complaint.resolution_hash ? {
        hash: complaint.resolution_hash,
        transactionId: complaint.resolution_transaction_id,
        resolvedAt: complaint.resolved_at,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${complaint.resolution_transaction_id}`
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
