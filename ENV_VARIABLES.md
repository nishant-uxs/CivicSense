# Environment Variables for CivicSense

## 🖥️ Backend Environment Variables (Server)

Create `server/.env` file with these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicsense?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_random_string

# Google Gemini AI (for AI chatbot features)
GEMINI_API_KEY=your_google_gemini_api_key_from_ai_google_dev

# Cloudinary (Image Upload Service)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
CLIENT_URL=https://your-frontend-app.vercel.app

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

---

## 🌐 Frontend Environment Variables (Client)

Create `client/.env` file with these variables:

```env
# Backend API URL
REACT_APP_API_URL=https://your-backend-app.onrender.com/api

# Mapbox (for interactive maps)
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_public_access_token

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
REACT_APP_POLYGON_RPC=https://polygon-rpc.com
```

---

## 📝 How to Get These Values

### 1. MongoDB Atlas (Database)
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster (M0 Sandbox)
- Click "Connect" → "Connect your application"
- Copy connection string
- Replace `<username>`, `<password>`, and `<dbname>`
- **Important:** In Network Access, add `0.0.0.0/0` to allow all IPs (for Render)

**Example:**
```
mongodb+srv://civicsense:MyPassword123@cluster0.abc123.mongodb.net/civicsense?retryWrites=true&w=majority
```

---

### 2. JWT Secret (Authentication)
Generate a random secure string (minimum 32 characters):

**Option 1 - Online Generator:**
- Go to [randomkeygen.com](https://randomkeygen.com)
- Use "Fort Knox Passwords"

**Option 2 - Command Line:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```
a7f3d9e2b8c4f1a6d5e9b3c7f2a8d4e1b9c6f3a7d2e5b8c1f4a9d6e3b7c2f5a8
```

---

### 3. Google Gemini API Key (AI Features)
- Go to [ai.google.dev](https://ai.google.dev)
- Click "Get API Key"
- Create new project or select existing
- Copy API key

**Example:**
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 4. Cloudinary (Image Upload)
- Sign up at [cloudinary.com](https://cloudinary.com)
- Go to Dashboard
- Copy:
  - **Cloud Name:** (e.g., `dxyz123abc`)
  - **API Key:** (e.g., `123456789012345`)
  - **API Secret:** (e.g., `abcdefghijklmnopqrstuvwxyz`)

**Example:**
```
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

### 5. Mapbox Token (Interactive Maps)
- Sign up at [mapbox.com](https://www.mapbox.com)
- Go to Account → Tokens
- Copy default public token (starts with `pk.`)

**Example:**
```
pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsXXXXXXXXXXXXXXXXXXX
```

---

### 6. Blockchain Configuration

**For Development (Mumbai Testnet):**
```env
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_metamask_private_key
```

**For Production (Polygon Mainnet):**
```env
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_metamask_private_key
```

**To get Private Key from MetaMask:**
1. Open MetaMask
2. Click three dots → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy private key (remove `0x` prefix if present)

**⚠️ WARNING:** Never share or commit private keys to GitHub!

---

## 🚀 Render Deployment Settings

### Backend (Web Service)

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server/server.js
```

**Environment Variables (Add in Render Dashboard):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend.vercel.app
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=your_private_key
```

---

### Frontend (Static Site on Vercel/Netlify)

**Build Command:**
```bash
cd client && npm install && npm run build
```

**Publish Directory:**
```
client/build
```

**Environment Variables:**
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_POLYGON_RPC=https://polygon-rpc.com
```

---

## ✅ Quick Setup Checklist

- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] JWT secret generated (32+ characters)
- [ ] Google Gemini API key obtained
- [ ] Cloudinary account created and credentials copied
- [ ] Mapbox token obtained
- [ ] Smart contract deployed and address copied
- [ ] MetaMask private key exported (keep secure!)
- [ ] Backend `.env` file created with all variables
- [ ] Frontend `.env` file created with all variables
- [ ] MongoDB Atlas IP whitelist set to `0.0.0.0/0`
- [ ] All environment variables added to Render dashboard
- [ ] Frontend deployed with correct backend URL
- [ ] Backend deployed with correct frontend URL (CORS)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to Git** - Already in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters, random
3. **Rotate keys regularly** - Change secrets periodically
4. **Use environment-specific values** - Different keys for dev/prod
5. **Limit API key permissions** - Only grant necessary access
6. **Monitor API usage** - Check for unusual activity
7. **Keep private keys secure** - Never share or expose

---

## 📞 Support

If you face issues:
- Check all environment variables are set correctly
- Verify MongoDB connection string format
- Ensure IP whitelist includes `0.0.0.0/0` for Render
- Check Render logs for specific errors
- Verify API keys are active and have correct permissions

---

**Built with ❤️ for transparent governance**
