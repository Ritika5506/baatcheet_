# BaatCheet - Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account with your code pushed
- MongoDB Atlas cluster (for database)

## Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
cd C:\Users\ritik\OneDrive\Desktop\html\full stack\alpha_chat\alpha-chat
git init
git add .
git commit -m "Initial commit - BaatCheet"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baatcheet.git
git push -u origin main
```

## Step 2: Deploy Backend to Vercel

### Create a Vercel Project for Backend
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository
4. Choose the `backend` folder as the root directory
5. Configure project name: `baatcheet-backend`

### Set Environment Variables
In Vercel project settings, add these environment variables:
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:PASSWORD@cluster.mongodb.net/baatcheet
JWT_SECRET=your_super_secret_key_here
PORT=3001
```

6. Deploy by clicking "Deploy"
7. Copy your backend URL (e.g., `https://baatcheet-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

### Create a Vercel Project for Frontend
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository
4. Choose the `frontend` folder as the root directory
5. Configure project name: `baatcheet-frontend`

### Set Environment Variables
In Vercel project settings, add:
```
REACT_APP_API_URL=https://baatcheet-backend.vercel.app
```

### Update Frontend Code
Update the API base URL in your frontend files to use the Vercel backend:

In `frontend/src/index.js`, update axios config:
```javascript
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

In `frontend/src/socket.js`, update socket connection:
```javascript
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

6. Deploy by clicking "Deploy"

## Step 4: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with password
4. Get the connection string
5. Update MONGO_URI in Vercel backend project settings

## Step 5: Verify Deployment

- Frontend: https://baatcheet-frontend.vercel.app
- Backend: https://baatcheet-backend.vercel.app
- Test signup and login flows
- Check browser console for any errors

## Troubleshooting

**Database Connection Issues:**
- Ensure MongoDB whitelist includes Vercel's IP (use 0.0.0.0/0 or add Vercel's IPs)
- Check MONGO_URI format in environment variables

**CORS Issues:**
- Update backend `server.js` to allow Vercel frontend URL:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://baatcheet-frontend.vercel.app', 'http://localhost:3000']
}));
```

**Socket.io Issues:**
- Add CORS configuration to socket.io initialization:
```javascript
io(server, {
  cors: {
    origin: ['https://baatcheet-frontend.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});
```

## Production Checklist

- ✅ Update all hardcoded localhost URLs
- ✅ Set strong JWT_SECRET environment variable
- ✅ Enable MongoDB authentication
- ✅ Configure CORS properly
- ✅ Set up environment variables in Vercel
- ✅ Test all authentication flows
- ✅ Test messaging functionality
- ✅ Test file uploads (ensure Vercel storage is configured)

## Useful Links

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Custom Domain Setup: https://vercel.com/docs/concepts/projects/domains/add-a-domain

---

For questions or issues, check the Vercel logs in the dashboard.
