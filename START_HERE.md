# 🚀 CivicSense - Start Here!

## ⚠️ IMPORTANT: MongoDB Required

**Your application is fully deployed but MongoDB is not installed.**

---

## 📥 Install MongoDB (5 Minutes)

### Option 1: Download & Install (Recommended)

**Step 1: Download**
```
https://www.mongodb.com/try/download/community
```
- Select: Windows
- Version: Latest (7.0+)
- Package: MSI

**Step 2: Install**
- Run the downloaded `.msi` file
- Choose "Complete" installation
- Check "Install MongoDB as a Service"
- Click Install

**Step 3: Verify**
```powershell
mongosh --version
```

**Step 4: Start MongoDB**
```powershell
net start MongoDB
```

---

### Option 2: Use Chocolatey (If Installed)

```powershell
choco install mongodb
```

---

### Option 3: Use MongoDB Atlas (Cloud - Free)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free M0 cluster
4. Get connection string
5. Update `server/.env`:
```env
MONGODB_URI=your_atlas_connection_string
```

---

## 🚀 Run Application

### After MongoDB is Installed:

**Terminal 1 - Backend:**
```powershell
cd e:\cs_final\CivicSense\server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd e:\cs_final\CivicSense\client
npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api

---

## ✅ What's Already Done

1. ✅ Smart Contract Deployed to Sepolia
   - Address: `0x59E0Ab9b20914DFBa0D68C7C53d28764c7F784A9`
   - View: https://sepolia.etherscan.io/address/0x59E0Ab9b20914DFBa0D68C7C53d28764c7F784A9

2. ✅ All Environment Files Configured
3. ✅ All Dependencies Installed
4. ✅ Blockchain Integration Complete

**Only MongoDB installation is pending!**

---

## 🧪 Test After Starting

1. **Register User:** http://localhost:3000/register
2. **Login:** http://localhost:3000/login
3. **Create Complaint** - Will auto-register on blockchain!
4. **Check Transaction:** https://sepolia.etherscan.io/tx/[transaction_id]
5. **Verify Integrity:** `GET /api/verification/:id/verify`

---

## 📚 Documentation

- **`DEPLOYMENT_COMPLETE.md`** - Full deployment details
- **`BLOCKCHAIN_IMPLEMENTATION.md`** - How blockchain works
- **`QUICK_SETUP.md`** - Setup guide

---

**Install MongoDB and you're ready to go! 🎉**
