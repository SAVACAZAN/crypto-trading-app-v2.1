# 📦 Ghid de Transformare în EXE/MSI

## Opțiunea 1: Electron Desktop App (RECOMANDAT)

### Pașii pentru a transforma aplicația Nuxt în EXE cu Electron:

#### 1. Instalează dependențele Electron:

```bash
npm install --save-dev electron electron-builder electron-devtools-installer
npm install --save-dev concurrently cross-env wait-on
```

#### 2. Creează fișierul `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let nuxtProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png')
  })

  // Pornește serverul Nuxt
  nuxtProcess = spawn('node', [
    path.join(__dirname, '../.output/server/index.mjs')
  ], {
    env: { ...process.env, PORT: 3000 }
  })

  // Așteaptă să pornească serverul
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000')
  }, 3000)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (nuxtProcess) {
    nuxtProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
```

#### 3. Creează `electron/preload.js`:

```javascript
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron
})
```

#### 4. Modifică `package.json` - adaugă scripturi:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "build": "nuxt build",
    "build:electron": "nuxt build && electron-builder",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build:win": "npm run build && electron-builder --win --x64",
    "electron:build:msi": "npm run build && electron-builder --win --x64 --msi",
    "electron:build:portable": "npm run build && electron-builder --win portable"
  },
  "build": {
    "appId": "com.crypto.tradingapp",
    "productName": "Crypto Trading App",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      ".output/**/*",
      "electron/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "msi",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

#### 5. Build pentru Windows:

```bash
# Build EXE installer (NSIS)
npm run electron:build:win

# Build MSI installer
npm run electron:build:msi

# Build portable EXE (fără installer)
npm run electron:build:portable
```

**Rezultat:**
- `dist-electron/Crypto Trading App Setup.exe` - Installer NSIS
- `dist-electron/Crypto Trading App.msi` - MSI Installer
- `dist-electron/Crypto Trading App Portable.exe` - Versiune portable

---

## Opțiunea 2: PKG - Single Executable

PKG transformă Node.js app într-un singur executabil.

#### 1. Instalează PKG:

```bash
npm install -g pkg
```

#### 2. Build aplicația Nuxt:

```bash
npm run build
```

#### 3. Creează `package-config.json`:

```json
{
  "pkg": {
    "scripts": [".output/**/*.mjs", ".output/**/*.js"],
    "assets": [".output/**/*", "node_modules/**/*"],
    "targets": ["node18-win-x64"],
    "outputPath": "dist-pkg"
  }
}
```

#### 4. Creează script de pornire `start.js`:

```javascript
const { spawn } = require('child_process')
const path = require('path')

const serverPath = path.join(__dirname, '.output/server/index.mjs')
const server = spawn('node', [serverPath], {
  env: { ...process.env, PORT: 3000 }
})

server.stdout.on('data', (data) => {
  console.log(data.toString())
})

server.stderr.on('data', (data) => {
  console.error(data.toString())
})

console.log('🚀 Crypto Trading App started on http://localhost:3000')
```

#### 5. Build EXE:

```bash
pkg start.js --targets node18-win-x64 --output dist-pkg/crypto-trading-app.exe
```

**Problema:** Utilizatorul trebuie să deschidă browserul manual la `http://localhost:3000`

---

## Opțiunea 3: Docker Desktop App

Folosește Docker pentru a crea un container cu aplicația.

#### 1. Creează `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
```

#### 2. Creează `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/crypto-app
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### 3. Build și run:

```bash
docker-compose up -d
```

**Avantaj:** Include și MongoDB în pachet

---

## ⚠️ Considerații importante:

### 1. **MongoDB**
Aplicația ta folosește MongoDB. Ai 3 opțiuni:

**A) Bundle MongoDB în aplicație:**
```bash
# Download MongoDB portable
# Include în electron/resources/mongodb/
```

**B) Folosește MongoDB Atlas (cloud):**
- Free tier disponibil
- Conexiune prin internet

**C) Cere utilizatorului să instaleze MongoDB separat**

### 2. **Variabile de mediu**

Creează fișier `.env.production`:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crypto-app-V1
JWT_SECRET=your-production-secret-here
```

### 3. **Certificat de semnare (Code Signing)**

Pentru distribuție profesională:
- Cumpără certificat de code signing (~$100-400/an)
- Semnează executabilul pentru a evita warning-uri Windows SmartScreen

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

---

## 📋 Recomandarea mea:

**Pentru distribuție desktop profesională:**

1. **Electron** (Opțiunea 1) - Cea mai bună pentru:
   - Interfață desktop nativă
   - Installer profesional (.exe, .msi)
   - Auto-update integrat
   - Cross-platform (Windows, Mac, Linux)

2. **Include MongoDB portable** în pachet:
   - Download MongoDB Community portable
   - Include în `resources/mongodb/`
   - Pornește automat la startup

3. **Adaugă auto-updater:**
```bash
npm install electron-updater
```

---

## 🚀 Quick Start pentru Electron:

```bash
# 1. Instalează dependențele
npm install --save-dev electron electron-builder concurrently wait-on cross-env

# 2. Creează folderul electron/
mkdir electron

# 3. Copiază fișierele main.js și preload.js

# 4. Modifică package.json cu configurația de build

# 5. Build aplicația
npm run build

# 6. Build executabilul
npm run electron:build:win

# Rezultat: dist-electron/Crypto Trading App Setup.exe
```

---

## 📦 Dimensiunea finală estimată:

- **Electron EXE:** ~150-250 MB (include Chromium + Node.js)
- **Electron MSI:** ~150-250 MB
- **PKG EXE:** ~50-80 MB (doar Node.js)
- **Docker Image:** ~300-500 MB (include MongoDB)

---

## 🔧 Troubleshooting:

**Problemă:** MongoDB nu pornește
**Soluție:** Include MongoDB portable sau folosește MongoDB Atlas

**Problemă:** EXE prea mare
**Soluție:** Folosește `electron-builder` cu compresie `7z`

**Problemă:** Windows SmartScreen blochează
**Soluție:** Semnează executabilul cu certificat de code signing

---

## 📚 Resurse utile:

- Electron Builder: https://www.electron.build/
- PKG: https://github.com/vercel/pkg
- MongoDB Portable: https://www.mongodb.com/try/download/community
- Code Signing: https://learn.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools
