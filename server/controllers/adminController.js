const Complaint = require('../models/Complaint');
const exifParser = require('exif-parser');
const fs = require('fs');
const haversine = require('haversine-distance');
const { updateComplaintStatusOnChain, resolveComplaintOnChain } = require('../utils/blockchain');

const MAX_DISTANCE_METERS = 100; // 100 meters tolerance

exports.verifyComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
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

    // Update status on blockchain for immutable audit trail
    try {
      if (complaint.onChain) {
        await updateComplaintStatusOnChain(complaint._id.toString(), 'Verified');
        console.log(`✅ Complaint ${complaint._id} status updated on blockchain: Verified`);
      }
    } catch (blockchainError) {
      console.error('⚠️ Blockchain status update failed:', blockchainError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Complaint verified successfully',
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

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    // Update status on blockchain for immutable audit trail
    try {
      if (complaint.onChain) {
        await updateComplaintStatusOnChain(complaint._id.toString(), status);
        console.log(`✅ Complaint ${complaint._id} status updated on blockchain: ${status}`);
      }
    } catch (blockchainError) {
      console.error('⚠️ Blockchain status update failed:', blockchainError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      complaint
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

    // Require at least one resolution image to complete the complaint
    if (resolutionImagePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one resolution image is required to complete the complaint'
      });
    }

    // Verify image location
    try {
      const imagePath = req.files[0].path;
      const buffer = fs.readFileSync(imagePath);
      const parser = exifParser.create(buffer);
      const exifData = parser.parse();

      if (exifData && exifData.tags && exifData.tags.GPSLatitude && exifData.tags.GPSLongitude) {
        const imageLocation = {
          latitude: exifData.tags.GPSLatitude,
          longitude: exifData.tags.GPSLongitude
        };

        const complaintLocation = {
          latitude: complaint.location.coordinates[1],
          longitude: complaint.location.coordinates[0]
        };

        const distance = haversine(imageLocation, complaintLocation);

        if (distance > MAX_DISTANCE_METERS) {
          return res.status(400).json({
            success: false,
            message: `Image was taken too far from the complaint location. Distance: ${distance.toFixed(2)} meters. Max allowed: ${MAX_DISTANCE_METERS} meters.`
          });
        }
      } else {
        // Allow if exif data is not present, can be changed based on strictness
        console.log(`Warning: No EXIF GPS data found for resolution image of complaint ${complaint._id}. Skipping location verification.`);
      }
    } catch (exifError) {
      console.error('Error reading EXIF data:', exifError);
      // Do not block if EXIF reading fails, but log it.
    }


    const resolutionData = {
      complaintId: complaint._id.toString(),
      resolutionImages: resolutionImagePaths,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.resolutionImages = resolutionImagePaths;
    complaint.statusHistory.push({
      status: 'Resolved',
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    await complaint.save();

    // Register resolution on blockchain with proof
    try {
      if (complaint.onChain) {
        const blockchainResult = await resolveComplaintOnChain(
          complaint._id.toString(),
          resolutionData
        );
        complaint.resolutionHash = blockchainResult.resolutionHash;
        complaint.resolutionTransactionId = blockchainResult.transactionId;
        await complaint.save();
        console.log(`✅ Complaint ${complaint._id} resolved on blockchain: ${blockchainResult.transactionId}`);
      }
    } catch (blockchainError) {
      console.error('⚠️ Blockchain resolution failed:', blockchainError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully',
      complaint
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
