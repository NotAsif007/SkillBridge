# 🚀 CareerOS Deployment Guide: Render (Backend) + Netlify (Frontend)

This guide walks you through deploying CareerOS to production using **Render** for the Express/Node backend and **Netlify** for the React/Vite frontend.

---

## 🔑 1. Quick Credentials Reference

### Generated 256-bit Production JWT Secret
```env
JWT_SECRET=685cefe7ae7afdba2c9022d98b8afc74ab79fbf4518acef0f7abe6389ab58513
```

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in/register.
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a user:
   - Username: `careeros_admin`
   - Password: `<your_secure_password>`
   - Role: `Read and write to any database`
4. Under **Network Access**, click **Add IP Address**:
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** → **Drivers (Node.js)** → Copy your connection string:
   ```text
   mongodb+srv://careeros_admin:<password>@cluster0.mongodb.net/careeros?retryWrites=true&w=majority
   ```

---

## 🖥️ Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New** → **Web Service**.
2. Connect your GitHub repository (`careerOS`).
3. Fill in the service configuration:

| Setting | Value |
| :--- | :--- |
| **Name** | `careeros-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `develop` (or `main`) |
| **Root Directory** | `apps/backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan Type** | `Free` |

4. Scroll down to **Advanced** → **Add Environment Variables**:

| Variable | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | *Your MongoDB Atlas connection string from Step 1* |
| `JWT_SECRET` | `685cefe7ae7afdba2c9022d98b8afc74ab79fbf4518acef0f7abe6389ab58513` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://your-app.netlify.app` *(update after Step 3)* |
| `API_BASE_URL` | `https://careeros-backend.onrender.com/api/v1` *(your Render service URL)* |
| `GEMINI_API_KEY` | *Your key from [Google AI Studio](https://aistudio.google.com/)* |
| `GOOGLE_CLIENT_ID` | *Your Google OAuth Client ID* |
| `GOOGLE_CLIENT_SECRET` | *Your Google OAuth Secret* |
| `ALLOW_DEV_LOGIN` | `true` |

5. Under **Health Check Path**, enter: `/api/v1/health`
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g. `https://careeros-backend-xyz.onrender.com`).

---

## 🌐 Step 3: Deploy Frontend to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** → **Import an existing project**.
2. Connect your GitHub repository.
3. Configure the build settings:

| Setting | Value |
| :--- | :--- |
| **Base directory** | `apps/frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `apps/frontend/dist` |

4. Click **Add environment variables**:

| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://careeros-backend-xyz.onrender.com/api/v1` *(Your Render backend URL + `/api/v1`)* |
| `VITE_GOOGLE_CLIENT_ID` | *Your Google OAuth Client ID* |

5. Click **Deploy Site**.
6. Netlify will build and provide your live URL (e.g. `https://careeros-app.netlify.app`).

---

## 🔄 Step 4: Final URL Sync & Google OAuth

1. **Update Render `CLIENT_URL`**:
   - Go back to your Render Backend Dashboard → **Environment**.
   - Set `CLIENT_URL` = `https://careeros-app.netlify.app` (your Netlify URL).
   - Save changes (Render will automatically re-deploy with updated CORS).

2. **Update Google Cloud Console (if using Google Login)**:
   - Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Edit your OAuth 2.0 Web Client ID:
     - **Authorized JavaScript Origins**: Add `https://careeros-app.netlify.app`
     - **Authorized Redirect URIs**: Add `https://careeros-backend-xyz.onrender.com/api/v1/auth/google/callback`

---

## ✅ Step 5: Verify Live Deployment

- [ ] **Backend Health**: Visit `https://your-backend.onrender.com/api/v1/health` → should return `{"status":"ok"}`.
- [ ] **Frontend**: Visit `https://your-app.netlify.app` → page loads with login screen.
- [ ] **1-Click Login**: Click "Continue as Student" (`Suraj`) → redirected to `/dashboard`.
- [ ] **Theme Switcher**: Click settings / theme toggle in top right → smooth transition between Light & Dark modes.
- [ ] **Career Gap Analysis**: Click **Career Paths** / **Career Gap Analysis** → live scores render cleanly.
- [ ] **AI Mock Interview & Resume**: Interactive interview and ATS resume upload function with AI evaluation.
