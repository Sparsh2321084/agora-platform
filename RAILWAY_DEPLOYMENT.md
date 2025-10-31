# 🚂 Railway Deployment Guide for Agora Platform

This guide will help you deploy the Agora Platform backend to Railway, keeping your server **always online** with automatic deploys.

## 📋 Prerequisites

- GitHub account (you already have this ✅)
- Railway account (free tier available at https://railway.app)
- Your repository pushed to GitHub ✅

## 🚀 Step-by-Step Deployment

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. Click **"New Project"** on Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **`Sparsh2321084/agora-platform`**
4. Railway will detect it as a Node.js project

### Step 3: Configure Service Settings

Railway will try to deploy from the root, but we need to deploy from the `server/` directory.

1. Click on your deployed service
2. Go to **Settings** tab
3. Under **"Build & Deploy"**, set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install` (or leave empty, Railway auto-detects)
   - **Start Command**: `npm start`
4. Click **"Save Changes"**

### Step 4: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway will provision a MySQL database
4. The database will automatically create these variables:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`
   - `MYSQL_URL`

### Step 5: Configure Environment Variables

1. Click on your **web service** (not the database)
2. Go to **"Variables"** tab
3. Add these variables:

#### Required Variables:

```bash
# Database Configuration (use Railway's MySQL variables)
DB_HOST=${{MYSQL.MYSQL_HOST}}
DB_USER=${{MYSQL.MYSQL_USER}}
DB_PASSWORD=${{MYSQL.MYSQL_PASSWORD}}
DB_NAME=${{MYSQL.MYSQL_DATABASE}}

# JWT Secrets (IMPORTANT: Generate unique values!)
JWT_SECRET=<paste-generated-secret-1>
JWT_REFRESH_SECRET=<paste-generated-secret-2>

# Frontend Origin (your GitHub Pages URL)
FRONTEND_ORIGIN=https://sparsh2321084.github.io

# Node Environment
NODE_ENV=production
```

#### Generate JWT Secrets:

Run these commands in PowerShell to generate secure secrets:

```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again for different value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy each output and paste into Railway variables.

#### Optional Variables:

```bash
# If you want to enable AI features (requires OpenAI API key)
ENABLE_AI=true
OPENAI_API_KEY=sk-your-openai-api-key

# If you add Redis for session management
REDIS_URL=${{REDIS.REDIS_URL}}
```

### Step 6: Set Up Database Schema

After your service deploys, you need to initialize the database:

#### Option A: Run Migration Script (Recommended)

1. Go to your Railway service
2. Click **"Settings"** → **"Deployments"**
3. Find the latest deployment and click on it
4. Click **"View Logs"** to ensure service is running
5. Go back to **"Settings"** tab
6. Scroll down to **"Networking"**
7. Copy your **Railway service URL** (e.g., `https://agora-platform-production.up.railway.app`)

Then, you'll need to manually run the database setup. Railway doesn't have a built-in way to run one-time scripts, so you have two options:

**Option 1: Use Railway CLI**
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database setup
railway run node server/setup-db.js
```

**Option 2: Temporarily modify start script**
1. In Railway Variables, temporarily change your start command or add a `SETUP_DB=true` variable
2. Modify `server/server.js` to check for this variable and run setup before starting
3. After setup completes, remove the variable and redeploy

#### Option B: Connect with MySQL Client

1. Get database credentials from Railway MySQL plugin variables
2. Use MySQL Workbench or command line:
```bash
mysql -h <MYSQL_HOST> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE>
```
3. Run the SQL from `server/database.sql` or `server/migrations/` files

### Step 7: Enable Health Checks

1. In your Railway service settings
2. Go to **"Healthcheck"** section
3. Set:
   - **Health Check Path**: `/health`
   - **Health Check Timeout**: `30` seconds
4. Railway will automatically restart your service if health checks fail

### Step 8: Enable Auto-Deploy

1. Go to **"Settings"** → **"Service"**
2. Under **"Deployment Trigger"**, ensure:
   - **"Watch Paths"** is set to `server/**` (only deploy when server code changes)
   - **"Auto-Deploy"** is enabled (should be on by default)
3. Now every time you push to `main` branch, Railway will automatically redeploy!

### Step 9: Get Your Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Copy your **Public URL** (e.g., `https://agora-platform-production.up.railway.app`)
3. **Save this URL** - you'll need it for the frontend!

### Step 10: Update Frontend Configuration

Now that your backend is live, update your frontend to use it:

1. Open `src/config.js` in your local project
2. Change the API_URL:

```javascript
const config = {
  API_URL: 'https://your-railway-app.up.railway.app'  // Replace with your Railway URL
};

export default config;
```

3. Commit and push:
```powershell
git add src/config.js
git commit -m "Update backend URL to Railway deployment"
git push
```

4. Redeploy frontend:
```powershell
npm run deploy
```

## 🎉 You're Live!

Your Agora Platform is now fully deployed:
- **Frontend**: https://sparsh2321084.github.io/agora-platform
- **Backend**: https://your-railway-app.up.railway.app

## 📊 Monitoring & Management

### View Logs
1. Go to your Railway service
2. Click on **"Deployments"**
3. Click on the latest deployment
4. Click **"View Logs"** to see real-time logs

### View Metrics
1. Railway dashboard shows:
   - CPU usage
   - Memory usage
   - Network traffic
   - Deployment history

### Restart Service
1. Go to **"Settings"**
2. Click **"Restart"** button if needed

## 💰 Railway Pricing

- **Free Tier**: $5 of usage credit per month (enough for small projects)
- **Usage-based**: Pay only for what you use after free tier
- **Sleep Policy**: Services don't sleep - they stay online 24/7 ✅

## 🔧 Troubleshooting

### Service Won't Start
- Check **Logs** for errors
- Verify all environment variables are set correctly
- Ensure `DB_HOST` and other MySQL variables reference the Railway MySQL plugin

### Database Connection Failed
- Verify MySQL plugin is running
- Check database variables are correctly referenced: `${{MYSQL.MYSQL_HOST}}`
- Make sure your database schema is initialized

### CORS Errors
- Verify `FRONTEND_ORIGIN` is set to `https://sparsh2321084.github.io`
- Check `server/server.js` CORS configuration includes your frontend URL

### Health Check Failing
- Test `/health` endpoint: `curl https://your-app.railway.app/health`
- Should return: `{"status":"ok"}`
- Check if server is listening on correct PORT

## 🔄 Making Updates

After initial deployment, updating is easy:

1. Make changes to your code locally
2. Commit and push to GitHub:
```powershell
git add .
git commit -m "Your changes"
git push
```
3. Railway automatically detects the push and redeploys!
4. Watch the deployment in Railway dashboard

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Discord: https://discord.gg/railway

## 🆘 Need Help?

If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables
3. Test backend endpoint directly: `https://your-app.railway.app/health`
4. Check Railway status page: https://status.railway.app

---

**Next Steps**: Follow this guide step by step, and your backend will be always online! 🚀
