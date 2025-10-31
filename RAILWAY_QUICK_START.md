# 🚂 Railway Quick Setup Card

## Your Generated JWT Secrets

**IMPORTANT: Copy these to Railway NOW!**

```
JWT_SECRET=7511a0ddab5e7b31b4327034b11fbccac1c4d55cd634b45c891958a28dd9b1c9

JWT_REFRESH_SECRET=0c45779d1d8df8d64ab2762aecec553c9b2a7f9efd645dff5ac0e642ba5c13c8
```

## Railway Variables Checklist

In Railway → Your Service → Variables tab, add:

- [ ] `DB_HOST=${{MYSQL.MYSQL_HOST}}`
- [ ] `DB_USER=${{MYSQL.MYSQL_USER}}`
- [ ] `DB_PASSWORD=${{MYSQL.MYSQL_PASSWORD}}`
- [ ] `DB_NAME=${{MYSQL.MYSQL_DATABASE}}`
- [ ] `JWT_SECRET=` (paste value above)
- [ ] `JWT_REFRESH_SECRET=` (paste value above)
- [ ] `FRONTEND_ORIGIN=https://sparsh2321084.github.io`
- [ ] `NODE_ENV=production`

## Railway Service Settings

- [x] Root Directory: `server`
- [x] Build Command: `npm install`
- [x] Start Command: `npm start`
- [x] Health Check Path: `/health`

## MySQL Plugin

- [x] Add MySQL plugin to project
- [x] Wait for it to provision (takes ~1-2 minutes)

## After Deployment

1. Get your Railway URL from Settings → Networking
2. Update `src/config.js` with your Railway URL
3. Run `npm run deploy` to update frontend

---

**Full Guide**: See `RAILWAY_DEPLOYMENT.md` for detailed instructions
