# PubQuiz Deployment Guide - Volledig op Render

## 🚀 Volledige Deployment op Render (Backend + Frontend)

### Voordelen van alleen Render gebruiken:
- Eenvoudiger setup (één platform)
- Geen CORS problemen (alles op zelfde domein)
- Betere prestaties (geen cross-origin requests)
- Eenvoudiger environment variabelen beheer

## Stap 1: Repository Voorbereiding

Zorg dat je een `package.json` in je root directory hebt met build scripts:

```json
{
  "scripts": {
    "build": "npm run build:client",
    "build:client": "npm install && npm run build --prefix .",
    "start": "cd server && npm start",
    "install:server": "cd server && npm install"
  }
}
```

## Stap 2: Render Account & Repository
1. Ga naar [render.com](https://render.com) en maak een account
2. Connect je GitHub account
3. Push je code naar een GitHub repository

## Stap 3: Web Service Aanmaken
1. Klik op "New +" → "Web Service"
2. Connect je GitHub repository
3. Configureer als volgt:
   - **Name**: `pubquiz-app` (of eigen keuze)
   - **Environment**: `Node`
   - **Root Directory**: (leeg laten - root van je project)
   - **Build Command**: `npm run build && cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: `Free` (voor development)

## Stap 4: Environment Variables
In Render dashboard → Environment Variables:
- `NODE_ENV`: `production`
- Render stelt automatisch `PORT` in

## Stap 5: Deploy
- Klik "Create Web Service"
- Render zal automatisch deployen
- Je krijgt één URL voor alles: `https://pubquiz-app-xyz.onrender.com`

## 📊 Database Inzien op Render

### Optie 1: Render Shell (Aanbevolen)
1. Ga naar je Render dashboard
2. Klik op je service → "Shell" tab
3. Voer SQLite commando's uit:
```bash
cd server
sqlite3 db/pubquiz.db
.tables
SELECT * FROM quizzes;
SELECT * FROM teams;
SELECT * FROM scores;
.exit
```

### Optie 2: Debug API Endpoint (Development)
Voeg een debug endpoint toe aan je server (zie hieronder)

### Optie 3: Database Download
Via Render Shell kun je het database bestand downloaden:
```bash
# In Render Shell
cd server/db
ls -la pubquiz.db
# Gebruik de file browser in Render om te downloaden
```

## 🔧 Testing Lokaal

Test je volledige setup lokaal:

1. **Build de React app:**
```bash
npm run build
```

2. **Start server (serveert React build + API):**
```bash
cd server
npm start
```

3. **Ga naar:** `http://localhost:10000`

## 📝 URLs na Deployment

- **Volledige App**: `https://jouw-app.onrender.com`
- **API Endpoints**: `https://jouw-app.onrender.com/api/quizzes`
- **Health Check**: `https://jouw-app.onrender.com/health`

## ⚠️ Belangrijke Opmerkingen

1. **Geen CORS problemen**: Frontend en backend op zelfde domein
2. **Free Tier**: Service slaapt na 15 min inactiviteit
3. **Database Persistentie**: SQLite database blijft behouden
4. **Cold Starts**: Eerste request na slaap kan 30-60 seconden duren
5. **Build Time**: Volledige build duurt langer (React build + server install)

## 🐛 Troubleshooting

**Build fails:**
- Check dat alle dependencies in root package.json staan
- Zorg dat build script correct is

**App niet toegankelijk:**
- Check Render logs voor errors
- Zorg dat server correct luistert op 0.0.0.0

**Database problemen:**
- Gebruik Render Shell om database status te checken
- Check server logs voor SQLite errors
