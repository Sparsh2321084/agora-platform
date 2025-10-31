# 🚀 Deploy Agora Platform Backend to Render

This guide walks you through deploying your Agora Platform backend to **Render.com** - a Platform-as-a-Service that makes it easy to deploy Node.js applications with automatic HTTPS, health checks, and continuous deployment.

## 📋 Prerequisites

- GitHub account (already set up ✅)
- Render account (free tier available)
- Database provider account (we'll use PlanetScale for free MySQL)

---

## Step 1: Set Up Your Database (PlanetScale)

Since Render's free tier doesn't include MySQL, we'll use **PlanetScale** (free serverless MySQL):

### 1.1 Create PlanetScale Account
1. Go to https://planetscale.com
2. Sign up with GitHub
3. Create a new database:
   - Database name: `agora-platform`
   - Region: Choose closest to your users (e.g., AWS us-east-1)
   - Click **Create database**

### 1.2 Get Database Connection Details
1. In your PlanetScale dashboard, click **Connect**
2. Select **Node.js** from the dropdown
3. Click **Create password** (give it a name like "render-production")
4. Copy the connection details - you'll need:
   - `HOST` (e.g., `aws.connect.psdb.cloud`)
   - `USERNAME` (e.g., `abc123xyz`)
   - `PASSWORD` (starts with `pscale_pw_`)
   - `DATABASE` (e.g., `agora-platform`)
   
   **⚠️ Important:** Save these credentials securely - PlanetScale only shows the password once!

### 1.3 Initialize Database Schema
1. Download the PlanetScale CLI or use their web console
2. Connect to your database
3. Run the SQL schema from `server/database.sql` to create tables
4. Run migrations from `server/migrations/` folder:
   ```bash
   # Run these in order:
   - server/migrations/add-voting-system.sql
   - server/migrations/add-reputation-system.sql
   - server/migrations/add-ai-search.sql
   ```

**Alternative:** You can use the MySQL console in PlanetScale dashboard to paste and run the SQL files directly.

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Grant Render access to your repositories

### 2.2 Create New Web Service
1. From Render Dashboard, click **New +** → **Web Service**
2. Connect your repository:
   - Select `agora-platform` repository
   - Click **Connect**

### 2.3 Configure Service Settings
Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `agora-backend` (or any name you prefer) |
| **Region** | Choose closest to you (e.g., Oregon USA) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter if you need more resources) |

### 2.4 Add Environment Variables
Click **Advanced** → **Add Environment Variable** and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | Render will override this, but good to have |
| `DB_HOST` | `[your-planetscale-host]` | From PlanetScale connection details |
| `DB_USER` | `[your-planetscale-username]` | From PlanetScale |
| `DB_PASSWORD` | `[your-planetscale-password]` | From PlanetScale (starts with `pscale_pw_`) |
| `DB_NAME` | `agora-platform` | Your database name |
| `JWT_SECRET` | `[generate-random-string]` | Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | `[generate-random-string]` | Generate another unique one |
| `FRONTEND_ORIGIN` | `https://sparsh2321084.github.io` | Your GitHub Pages URL |

**To generate secure JWT secrets on Windows PowerShell:**
```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate JWT_REFRESH_SECRET (run again for different value)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2.5 Configure Health Check
1. Scroll down to **Health Check Path**
2. Enter: `/health`
3. This ensures Render knows your service is running properly

### 2.6 Enable Auto-Deploy
1. Check **Auto-Deploy**: `Yes`
2. This will automatically deploy whenever you push to `main` branch

### 2.7 Deploy!
1. Click **Create Web Service**
2. Render will start building and deploying
3. Wait 3-5 minutes for initial deployment
4. You'll see logs in real-time

---

## Step 3: Verify Deployment

### 3.1 Check Service Status
1. Once deployed, you'll see your service URL (e.g., `https://agora-backend.onrender.com`)
2. Click the URL or visit: `https://your-service-name.onrender.com/health`
3. You should see: `{"status":"ok"}`

### 3.2 Test Database Connection
Visit: `https://your-service-name.onrender.com/api/discussions`
- If you see `[]` (empty array) or discussion data: ✅ **Success!**
- If you see database errors: check your PlanetScale credentials

---

## Step 4: Update Frontend to Use Deployed Backend

Now update your frontend (GitHub Pages) to connect to your deployed backend:

### 4.1 Update Configuration File
Edit `src/config.js`:

```javascript
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://agora-backend.onrender.com'
};

export default config;
```

Replace `agora-backend.onrender.com` with your actual Render service URL.

### 4.2 Commit and Deploy Frontend
```powershell
# Commit the change
git add src/config.js
git commit -m "Update API URL to deployed backend"
git push

# Deploy to GitHub Pages
npm run deploy
```

### 4.3 Test the Full Application
1. Visit your GitHub Pages site: `https://sparsh2321084.github.io/agora-platform`
2. Try registering a new user
3. Create a discussion
4. Test voting, replies, etc.

---

## 🎉 Your Backend is Now Always Online!

Your Render service will:
- ✅ Auto-restart if it crashes
- ✅ Auto-deploy when you push to GitHub
- ✅ Scale automatically (on paid plans)
- ✅ Provide HTTPS automatically
- ✅ Monitor health via `/health` endpoint

---

## 📊 Monitoring & Management

### View Logs
- Go to Render Dashboard → Your Service → **Logs** tab
- See real-time server logs, errors, and requests

### View Metrics
- **Metrics** tab shows CPU, memory, response times
- Set up alerts for downtime

### Update Environment Variables
- **Environment** tab to add/edit env vars
- Changes trigger automatic redeploy

---

## ⚡ Performance Tips

### Render Free Tier Notes
- **Spins down after 15 minutes of inactivity**
- **First request after sleep takes ~30 seconds** (cold start)
- To avoid: upgrade to paid plan ($7/month) for always-on service

### Keep Free Service Awake (Optional)
Use a free uptime monitoring service to ping your API every 10 minutes:
- **UptimeRobot** (https://uptimerobot.com) - free plan
- **Cron-job.org** (https://cron-job.org) - free plan
- Set them to ping: `https://your-service.onrender.com/health`

### Database Performance
- PlanetScale free tier includes:
  - 1 billion row reads/month
  - 10 million row writes/month
  - Usually enough for small-medium projects

---

## 🔧 Troubleshooting

### "Service Unavailable" Error
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure PlanetScale database is accessible

### Database Connection Errors
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct
- Check PlanetScale dashboard - database might be sleeping (poke it to wake)
- Test connection from Render shell (available in Dashboard)

### CORS Errors
- Ensure `FRONTEND_ORIGIN` matches your GitHub Pages URL exactly
- Include `https://` prefix
- No trailing slash

### Frontend Can't Connect
- Check browser console for errors
- Verify `src/config.js` has correct Render URL
- Make sure you ran `npm run deploy` after updating config

---

## 🔄 Making Updates

### Update Backend Code
```powershell
# Make your changes
git add .
git commit -m "Your changes"
git push
# Render auto-deploys from main branch
```

### Update Environment Variables
1. Go to Render Dashboard → Your Service
2. **Environment** tab
3. Edit or add variables
4. Click **Save Changes** (triggers redeploy)

### Rollback to Previous Version
1. Render Dashboard → **Events** tab
2. Find previous successful deploy
3. Click **Rollback**

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Render Web Service** | ✅ Free (with sleep) | $7/month (always-on) |
| **PlanetScale Database** | ✅ Free (1 DB, 10GB) | $29/month (more DBs) |
| **GitHub Pages** | ✅ Always Free | N/A |
| **Total** | **$0/month** | $7-36/month (optional) |

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Deployment Checklist

- [ ] Created PlanetScale database
- [ ] Initialized database schema
- [ ] Created Render web service
- [ ] Added all environment variables
- [ ] Verified health check endpoint
- [ ] Deployed successfully
- [ ] Updated frontend config
- [ ] Tested full application
- [ ] Set up uptime monitoring (optional)

---

**🎊 Congratulations! Your Agora Platform backend is now live and always online!**

Visit your live backend: `https://your-service-name.onrender.com/health`  
Visit your live frontend: `https://sparsh2321084.github.io/agora-platform`
