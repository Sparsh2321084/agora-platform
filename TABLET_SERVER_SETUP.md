# 📱 Turn Your Old Tablet into a 24/7 Server

This guide shows you how to run the Agora Platform backend on an old Android tablet using **Termux**. This is a **completely free** solution that gives you full control over your server.

## 💰 Cost: ~$1-2/month (electricity only)

---

## 📋 What You'll Need

- ✅ Old Android tablet (any version with Android 7+)
- ✅ Tablet charger (keep it plugged in 24/7)
- ✅ Stable WiFi/internet connection
- ✅ USB cable for charging
- ✅ Basic command line knowledge

---

## 🚀 Step-by-Step Setup

### Step 1: Install Termux

1. **Download Termux from F-Droid** (NOT Google Play Store):
   - Visit: https://f-droid.org/en/packages/com.termux/
   - Download and install F-Droid app first
   - Then install Termux from F-Droid

2. **Open Termux** and run initial setup:
```bash
# Update package lists
pkg update && pkg upgrade -y

# This will take a few minutes
```

### Step 2: Install Required Software

```bash
# Install Node.js (for backend)
pkg install nodejs -y

# Install MySQL/MariaDB (for database)
pkg install mariadb -y

# Install Git (to clone your repo)
pkg install git -y

# Install nano text editor
pkg install nano -y

# Install termux-services (for auto-start)
pkg install termux-services -y
```

### Step 3: Setup Storage Access

```bash
# Allow Termux to access device storage
termux-setup-storage

# You'll see a permission prompt - click "Allow"
```

### Step 4: Setup MySQL Database

```bash
# Initialize MySQL database
mysql_install_db

# Start MySQL server in background
mysqld_safe --datadir=$PREFIX/var/lib/mysql &

# Wait 5 seconds for MySQL to start
sleep 5

# Secure MySQL installation (set root password)
mysql_secure_installation
```

When prompted:
- Enter current password: (press Enter - no password yet)
- Set root password: **YES** (choose a strong password)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

### Step 5: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone the Agora Platform repository
git clone https://github.com/Sparsh2321084/agora-platform.git

# Enter the project directory
cd agora-platform
```

### Step 6: Create Database and Import Schema

```bash
# Login to MySQL
mysql -u root -p
# Enter the password you set earlier
```

In MySQL prompt, run these commands:
```sql
-- Create the database
CREATE DATABASE agora_platform;

-- Use the database
USE agora_platform;

-- Import main schema
SOURCE server/database.sql;

-- Import migrations
SOURCE server/migrations/add-voting-system.sql;
SOURCE server/migrations/add-reputation-system.sql;
SOURCE server/migrations/add-ai-search.sql;

-- Verify tables were created
SHOW TABLES;

-- Exit MySQL
EXIT;
```

### Step 7: Configure Backend Environment

```bash
# Navigate to server directory
cd ~/agora-platform/server

# Install Node.js dependencies
npm install

# Create environment configuration file
nano .env
```

**Add this content to `.env`:**
```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=agora_platform

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars

# Frontend Origin (your GitHub Pages URL)
FRONTEND_ORIGIN=https://sparsh2321084.github.io
```

**To generate secure JWT secrets:**
```bash
# Run this in Termux (generates random string)
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
# Copy the output and use it for JWT_SECRET

# Run again for JWT_REFRESH_SECRET
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

**Save and exit nano:**
- Press `Ctrl + X`
- Press `Y` (yes to save)
- Press `Enter` (confirm filename)

### Step 8: Test the Server

```bash
# Start the server manually
cd ~/agora-platform/server
node server.js
```

You should see:
```
✅ Backend server running on port 5000
✅ Database connected successfully
✅ Socket.IO initialized
```

**Test in a new Termux session:**
```bash
# Open new session (swipe from left → New Session)
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

Press `Ctrl + C` to stop the server for now.

---

## 🌐 Make Your Server Accessible from Internet

Your tablet server is currently only accessible locally. To access it from anywhere, use **ngrok** (free):

### Install and Setup ngrok

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
pkg install ngrok -y

# Sign up at https://ngrok.com (free account)
# Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

# Authenticate ngrok (replace YOUR_AUTH_TOKEN)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Start ngrok Tunnel

```bash
# Start ngrok in background
ngrok http 5000 > ~/ngrok.log &

# Wait 3 seconds
sleep 3

# Get your public URL
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*'
```

You'll get a URL like: `https://abc123.ngrok.io`
- This is your **public backend URL**
- Share this URL with your frontend
- Free tier includes: 1 agent, 40 connections/min, random URLs

---

## 🔄 Auto-Start Server on Boot

### Create Startup Script

```bash
# Create script directory
mkdir -p ~/.shortcuts

# Create startup script
nano ~/.shortcuts/start-agora.sh
```

**Add this content:**
```bash
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting Agora Platform Server..."

# Start MySQL if not running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "📊 Starting MySQL..."
    mysqld_safe --datadir=$PREFIX/var/lib/mysql &
    sleep 5
fi

# Start Backend Server
echo "⚙️  Starting Backend..."
cd ~/agora-platform/server
node server.js > ~/agora-server.log 2>&1 &

sleep 3

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 5000 > ~/ngrok.log 2>&1 &

sleep 3

# Show public URL
echo "✅ Server started!"
echo "📱 Getting public URL..."
sleep 2
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1

echo ""
echo "🎉 Agora Platform is now running!"
```

**Make it executable:**
```bash
chmod +x ~/.shortcuts/start-agora.sh
```

### Install Termux:Boot (Auto-start on device reboot)

1. **Download Termux:Boot from F-Droid:**
   - https://f-droid.org/en/packages/com.termux.boot/

2. **Create boot script:**
```bash
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start-agora.sh
```

**Add this content:**
```bash
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
~/.shortcuts/start-agora.sh
```

**Make it executable:**
```bash
chmod +x ~/.termux/boot/start-agora.sh
```

3. **Enable auto-start:**
   - Open Termux:Boot app once (this activates it)
   - Reboot your tablet
   - Server will start automatically!

---

## 🔋 Keep Tablet Running 24/7

### Prevent Sleep & Battery Issues

1. **Enable Developer Options:**
   - Settings → About Tablet
   - Tap "Build Number" 7 times
   - Go back → Developer Options

2. **Configure Developer Settings:**
   - **Stay Awake:** ON (screen stays on while charging)
   - **Don't Keep Activities:** OFF

3. **Disable Battery Optimization:**
   - Settings → Apps → Termux
   - Battery → Battery Optimization
   - Select "Don't Optimize"

4. **Disable Auto-Sleep:**
   - Settings → Display → Sleep
   - Set to "Never" or maximum time

5. **Keep Screen Brightness Low:**
   - Settings → Display → Brightness
   - Set to minimum (saves battery and prevents burn-in)

### Prevent Overheating

- Remove any protective case
- Place tablet in cool, ventilated area
- Keep away from direct sunlight
- Consider a small USB-powered fan
- Monitor temperature occasionally

---

## 📊 Server Management Commands

### Check Server Status
```bash
# Check if MySQL is running
pgrep -a mysqld

# Check if Node.js is running
pgrep -a node

# Check if ngrok is running
pgrep -a ngrok
```

### View Server Logs
```bash
# View backend logs
tail -f ~/agora-server.log

# View ngrok logs
tail -f ~/ngrok.log
```

### Restart Server
```bash
# Stop all services
pkill node
pkill ngrok

# Restart using your script
~/.shortcuts/start-agora.sh
```

### Get Public URL
```bash
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1
```

### Update Code from GitHub
```bash
cd ~/agora-platform

# Stop server first
pkill node

# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
cd server
npm install

# Restart server
~/.shortcuts/start-agora.sh
```

---

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check MySQL is running
pgrep mysqld
# If not, start it:
mysqld_safe --datadir=$PREFIX/var/lib/mysql &

# Check for errors in logs
cat ~/agora-server.log
```

### Database Connection Failed
```bash
# Verify MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check .env file has correct password
cat ~/agora-platform/server/.env
```

### ngrok Not Working
```bash
# Check if ngrok is authenticated
ngrok config check

# Restart ngrok
pkill ngrok
ngrok http 5000 > ~/ngrok.log &
```

### Tablet Gets Hot
- Lower screen brightness
- Close other apps
- Improve ventilation
- Consider upgrading to better charger

### Server Stops After Screen Lock
- Ensure "Stay Awake" is enabled in Developer Options
- Disable battery optimization for Termux
- Use `termux-wake-lock` in startup script (already included)

---

## 🌟 Next Steps

### Update Frontend to Use Your Server

Once your tablet server is running and you have the ngrok URL:

1. **Update frontend configuration:**
```javascript
// In src/config.js
const config = {
  API_URL: 'https://your-ngrok-url.ngrok.io'
};
```

2. **Deploy frontend:**
```powershell
npm run deploy
```

### Optional: Use Custom Domain (Free)

Instead of random ngrok URLs, use a custom domain:

1. **Get free domain:**
   - Freenom.com (free .tk, .ml, .ga domains)
   - Or use DuckDNS.org (free subdomain)

2. **Setup with ngrok:**
```bash
# Edit ngrok config
nano ~/.config/ngrok/ngrok.yml
```

Add:
```yaml
tunnels:
  agora:
    proto: http
    addr: 5000
    domain: your-domain.com
```

---

## ✅ Checklist

- [ ] Installed Termux from F-Droid
- [ ] Installed Node.js, MySQL, Git
- [ ] Setup MySQL database with root password
- [ ] Cloned repository
- [ ] Created and imported database schema
- [ ] Configured `.env` file with credentials
- [ ] Tested server locally
- [ ] Installed and configured ngrok
- [ ] Created startup script
- [ ] Installed Termux:Boot
- [ ] Enabled "Stay Awake" in Developer Options
- [ ] Disabled battery optimization for Termux
- [ ] Tested auto-start after reboot
- [ ] Updated frontend with public URL
- [ ] Deployed frontend to GitHub Pages

---

## 🎉 You're Done!

Your old tablet is now a 24/7 server running:
- ✅ MySQL database
- ✅ Node.js backend
- ✅ Public HTTPS access via ngrok
- ✅ Auto-starts on boot
- ✅ **Completely FREE** (except ~$1-2/month electricity)

**Server Management:**
- Start: `~/.shortcuts/start-agora.sh`
- Stop: `pkill node && pkill ngrok`
- Logs: `tail -f ~/agora-server.log`
- URL: `curl -s http://localhost:4040/api/tunnels | grep public_url`

**Power consumption:** ~5-10W (less than a light bulb!)

---

## 📚 Resources

- [Termux Wiki](https://wiki.termux.com/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Node.js on Termux](https://wiki.termux.com/wiki/Node.js)
- [MariaDB on Termux](https://wiki.termux.com/wiki/MariaDB)

**Need help?** Check Termux subreddit: r/termux
