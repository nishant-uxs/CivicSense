# 🚀 CivicSense - Quick Setup Guide (Sepolia Testnet)

## ✅ What's Been Done

1. ✅ **Smart Contract Fixed** - Syntax errors corrected
2. ✅ **Blockchain Integration Added** - Tamper-proof complaint reporting
3. ✅ **Database Model Updated** - Added blockchain fields
4. ✅ **Verification Endpoint Created** - Check data integrity
5. ✅ **Admin Actions Integrated** - Status updates on blockchain

---

## 🎯 Your Blockchain Implementation

### What Happens Now:

**When User Reports Complaint:**
```
1. Complaint saved in MongoDB ✅
2. SHA-256 hash generated ✅
3. Hash registered on Sepolia blockchain ✅
4. Transaction ID saved ✅
5. Complaint is now TAMPER-PROOF! 🔒
```

**When Admin Updates Status:**
```
1. Status updated in MongoDB ✅
2. Status change recorded on blockchain ✅
3. Immutable audit trail created ✅
```

**When Complaint Resolved:**
```
1. Resolution images uploaded ✅
2. Resolution hash created ✅
3. Proof stored on blockchain ✅
4. Cannot fake resolution! 🔒
```

---

## 📋 Setup Steps

### Step 1: Install Dependencies

```bash
cd e:\cs_final\CivicSense
npm run install-all
```

### Step 2: Get Sepolia ETH

1. **Install MetaMask** - https://metamask.io/
2. **Switch to Sepolia Network** in MetaMask
3. **Get Free Sepolia ETH**:
   - https://sepoliafaucet.com/
   - https://faucets.chain.link/sepolia
   - Paste your wallet address and request ETH

### Step 3: Deploy Smart Contract

```bash
cd smart-contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

**IMPORTANT:** Save the contract address that appears!

### Step 4: Configure Environment Variables

#### `smart-contract/.env`
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_metamask_private_key_here
```

**Get Alchemy Key (Free):**
1. Go to https://www.alchemy.com/
2. Sign up
3. Create new app → Select Sepolia
4. Copy API key

**Get Private Key:**
1. MetaMask → Account Details → Export Private Key
2. **⚠️ NEVER share this or commit to Git!**

#### `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your_super_secret_jwt_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CONTRACT_ADDRESS=your_deployed_contract_address_from_step3
PRIVATE_KEY=your_metamask_private_key
NODE_ENV=development
```

#### `client/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Get Mapbox Token (Free):**
1. Go to https://account.mapbox.com/
2. Sign up
3. Copy default public token

### Step 5: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongodb
```

### Step 6: Run Application

```bash
cd e:\cs_final\CivicSense
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api

---

## 🔒 How Blockchain Prevents Corruption

### Scenario 1: Admin Deletes Complaint
```
❌ Admin deletes from MongoDB
✅ Hash still exists on Sepolia blockchain
✅ Anyone can verify: "Complaint existed on [date]"
✅ Blockchain proof: https://sepolia.etherscan.io/tx/[transaction_id]
```

### Scenario 2: Data Tampering
```
❌ Someone changes complaint description
✅ New hash ≠ blockchain hash
✅ Verification endpoint returns: "TAMPERED!"
✅ Original data integrity proven
```

### Scenario 3: Fake Resolution
```
❌ Admin marks "Resolved" without fixing
✅ No resolution hash on blockchain
✅ Citizens can verify: "No proof uploaded"
✅ Transparent accountability
```

---

## 🧪 Testing Blockchain Integration

### Test 1: Create Complaint
```bash
POST http://localhost:5000/api/complaints
```

**Check Response:**
```json
{
  "success": true,
  "complaint": {
    "onChain": true,
    "blockchainHash": "abc123...",
    "transactionId": "0x123...",
    "blockNumber": 12345
  }
}
```

### Test 2: Verify Integrity
```bash
GET http://localhost:5000/api/verification/:id/verify
```

**Check Response:**
```json
{
  "verified": true,
  "onChain": true,
  "hashMatch": true,
  "message": "✅ Complaint data is verified and has not been tampered with."
}
```

### Test 3: Get Blockchain Proof
```bash
GET http://localhost:5000/api/verification/:id/proof
```

**Check Response:**
```json
{
  "proof": {
    "blockchain": {
      "transactionId": "0x123...",
      "explorerUrl": "https://sepolia.etherscan.io/tx/0x123..."
    }
  }
}
```

---

## 📊 New API Endpoints

### Verification Endpoints

**1. Verify Complaint Integrity**
```
GET /api/verification/:id/verify
```
Returns: Whether complaint data has been tampered with

**2. Get Blockchain Proof**
```
GET /api/verification/:id/proof
```
Returns: Complete blockchain proof with transaction links

---

## 🎨 What Users See

### For Citizens:
- ✅ Transaction ID after reporting
- ✅ "Verified on Blockchain" badge
- ✅ Link to view on Etherscan
- ✅ Tamper-proof guarantee

### For Admins:
- ✅ Automatic blockchain recording
- ✅ Transparent audit trail
- ✅ Cannot be accused of deletion
- ✅ Proof of work done

---

## 💰 Cost (Sepolia Testnet)

**Development (Testnet):**
- ✅ **FREE** - Unlimited testing
- ✅ Get free Sepolia ETH from faucets
- ✅ Same security as mainnet

**Production (Ethereum Mainnet):**
- ~$5-10 per complaint registration
- ~$3-5 per status update
- **Too expensive for production!**

**Recommendation:** Use **Polygon Mainnet** for production:
- ~$0.001 per complaint
- ~$0.0005 per status update
- **100 complaints = ~$0.15 USD**

---

## 🔍 View Transactions on Blockchain

After any blockchain operation, check:

**Sepolia Etherscan:**
```
https://sepolia.etherscan.io/tx/[your_transaction_id]
```

You'll see:
- Transaction hash
- Block number
- Timestamp
- Gas used
- Smart contract interaction

---

## 🚨 Troubleshooting

### "Blockchain registration failed"
**Solution:**
- Check if you have Sepolia ETH
- Verify SEPOLIA_RPC_URL is correct
- Ensure CONTRACT_ADDRESS is deployed

### "Cannot connect to RPC"
**Solution:**
- Get Alchemy API key (free)
- Use: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

### "Wallet has 0 ETH"
**Solution:**
- Get free Sepolia ETH from faucets
- Wait 1-2 minutes for confirmation

### MongoDB Connection Error
**Solution:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community
```

---

## 📝 Database Changes

### New Fields in Complaint Model:
```javascript
{
  blockchainHash: String,           // SHA-256 hash on blockchain
  transactionId: String,             // Blockchain transaction ID
  blockNumber: Number,               // Block number
  resolutionHash: String,            // Resolution proof hash
  resolutionTransactionId: String,   // Resolution TX ID
  onChain: Boolean                   // Is registered on blockchain
}
```

---

## 🎯 What You Achieved

### Before Blockchain:
- ❌ Complaints can be deleted
- ❌ Data can be modified
- ❌ No proof of submission
- ❌ No accountability

### After Blockchain:
- ✅ Immutable complaint records
- ✅ Tamper detection
- ✅ Permanent proof on Sepolia
- ✅ Transparent audit trail
- ✅ Cannot be corrupted

---

## 🔄 Migration to Polygon (Later)

When ready for production, just change:

**In `.env` files:**
```env
# Change from:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...

# To:
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/...
```

**Redeploy contract:**
```bash
npx hardhat run scripts/deploy.js --network polygon
```

**Much cheaper for production!**

---

## 📚 Files Modified/Created

### Modified:
- ✅ `smart-contract/contracts/CivicSense.sol` - Fixed syntax errors
- ✅ `server/models/Complaint.js` - Added blockchain fields
- ✅ `server/controllers/complaintController.js` - Blockchain integration
- ✅ `server/controllers/adminController.js` - Status updates on-chain
- ✅ `server/utils/blockchain.js` - Updated ABI
- ✅ `server/server.js` - Registered verification routes

### Created:
- ✅ `server/controllers/verificationController.js` - Tamper detection
- ✅ `server/routes/verification.js` - Verification endpoints
- ✅ `BLOCKCHAIN_IMPLEMENTATION.md` - Full documentation
- ✅ `QUICK_SETUP.md` - This guide

---

## 🎉 You're Ready!

Your CivicSense platform now has:
- 🔒 **Tamper-proof complaint reporting**
- 📝 **Immutable audit trail**
- ✅ **Corruption resistance**
- 🌐 **Public verifiability**

**Next Steps:**
1. Follow setup steps above
2. Deploy smart contract to Sepolia
3. Configure environment variables
4. Test the application
5. Verify blockchain integration works

**Questions? Check:**
- `BLOCKCHAIN_IMPLEMENTATION.md` - Detailed explanation
- `README.md` - Project overview
- `SETUP.md` - Original setup guide

---

**Happy Building! 🚀**
