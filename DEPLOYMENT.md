# 🚀 CivicSense Deployment Guide

## Render Deployment (Backend)

### Quick Deploy Commands

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
node server/server.js
```

### Environment Variables (Add in Render Dashboard)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicsense
JWT_SECRET=your_jwt_secret_minimum_32_characters
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=https://your-frontend.vercel.app
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=your_wallet_private_key
```

### Deployment Steps

1. **Connect GitHub Repository**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select `CivicSense` repository

2. **Configure Service**
   - Name: `civicsense-backend`
   - Region: Oregon (Free)
   - Branch: `main`
   - Root Directory: (leave blank)
   - Runtime: Node
   - Build Command: `cd server && npm install`
   - Start Command: `node server/server.js`

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add all variables listed above
   - Click "Save Changes"

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the deployed URL (e.g., `https://civicsense-backend.onrender.com`)

---

## Vercel Deployment (Frontend)

### Build Settings

**Framework Preset:** Create React App

**Root Directory:** `client`

**Build Command:**
```bash
npm install && npm run build
```

**Output Directory:** `build`

### Environment Variables

```env
REACT_APP_API_URL=https://civicsense-backend.onrender.com/api
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/your_key
```

### Deployment Steps

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import `CivicSense` repository

2. **Configure Project**
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: (auto-detected)
   - Output Directory: `build`

3. **Add Environment Variables**
   - Add all variables listed above
   - Click "Deploy"

4. **Update Backend CORS**
   - Copy Vercel URL (e.g., `https://civicsense.vercel.app`)
   - Update `CLIENT_URL` in Render environment variables
   - Redeploy backend

---

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Choose region closest to Render (Oregon)

2. **Create Database User**
   - Database Access → Add New User
   - Username: `civicsense`
   - Password: (generate strong password)
   - Role: Read and Write to any database

3. **Whitelist IPs**
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow from anywhere)
   - This is required for Render

4. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<username>`, `<password>`, `<dbname>`

---

## Troubleshooting

### Error: Cannot find module 'express'

**Solution:** Update Build Command to:
```bash
cd server && npm install
```

### Error: MongoDB connection failed

**Solution:** 
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string format
- Ensure database user has correct permissions

### Error: CORS policy blocked

**Solution:**
- Update `CLIENT_URL` in backend environment variables
- Must match exact frontend URL (including https://)
- Redeploy backend after changing

### Error: Smart contract not found

**Solution:**
- Verify `CONTRACT_ADDRESS` is correct
- Check `SEPOLIA_RPC_URL` is working
- Ensure wallet has Sepolia ETH for gas

---

## Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] Frontend deployed successfully on Vercel
- [ ] MongoDB Atlas connected
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Smart contract accessible
- [ ] Test user registration
- [ ] Test complaint submission
- [ ] Test map functionality
- [ ] Test admin panel
- [ ] Check blockchain integration

---

## Monitoring

### Render Logs
- Dashboard → Your Service → Logs
- Monitor for errors and performance

### Vercel Logs
- Dashboard → Your Project → Deployments → View Function Logs

### MongoDB Atlas
- Clusters → Metrics
- Monitor database performance and connections

---

**Need Help?** Check logs first, then refer to ENV_VARIABLES.md for setup details.
