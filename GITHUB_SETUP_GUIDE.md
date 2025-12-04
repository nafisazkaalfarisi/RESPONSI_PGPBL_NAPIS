# 🚀 Setup GitHub untuk RainSpot Project

## Langkah-Langkah untuk Terhubung ke GitHub

### 1. **Buat Repository di GitHub**

Kunjungi https://github.com/new dan:
- Repository name: `RainSpot` (atau nama pilihan Anda)
- Description: `Real-time rainfall detection and reporting mobile application`
- Visibility: `Public` (jika ingin open-source) atau `Private`
- **JANGAN** check "Initialize this repository with:" (skip ini karena kita sudah punya repo lokal)
- Click **Create repository**

### 2. **Hubungkan Local Repository ke GitHub**

```powershell
# Ganti USERNAME dengan username GitHub Anda
# Ganti REPOSITORY dengan nama repository yang dibuat

cd d:\rainspot\RainSpot

# Tambahkan remote origin
git remote add origin https://github.com/USERNAME/REPOSITORY.git

# Verify remote sudah ditambahkan
git remote -v
```

Output yang diharapkan:
```
origin  https://github.com/USERNAME/REPOSITORY.git (fetch)
origin  https://github.com/USERNAME/REPOSITORY.git (push)
```

### 3. **Rename Branch ke Main (Optional tapi Recommended)**

```powershell
git branch -M main
```

### 4. **Push ke GitHub**

```powershell
git push -u origin main
```

Jika diminta authentication:
- Gunakan GitHub Personal Access Token (PAT) bukan password
- Lihat: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

### 5. **Verify di GitHub**

Buka https://github.com/USERNAME/REPOSITORY dan verifikasi file-file sudah terupload.

---

## 📋 Commit Convention untuk Project

Gunakan format ini untuk commit messages:

```
<type>: <subject>

<body>

<footer>
```

### Types:
- **feat**: Fitur baru (misal: `feat: Add IoT sensor integration`)
- **fix**: Bug fix (misal: `fix: Location permission on Android 12+`)
- **docs**: Documentation changes
- **style**: Code style changes (format, missing semicolons, etc.)
- **refactor**: Code refactoring tanpa perubahan functionality
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Build process, dependencies, tools

### Examples:

```
feat: Add data source abstraction for manual and IoT sensor inputs

- Implement DataSourceService for managing multiple data sources
- Add IoT configuration with Coming Soon roadmap
- Create ComingSoonModal component for feature teasing
- Update Lapor tab UI with data source selector

Closes #123
```

---

## 🔄 Daily Git Workflow

### Membuat Branch untuk Fitur Baru:

```powershell
# Update main branch
git checkout main
git pull origin main

# Buat branch baru untuk fitur
git checkout -b feature/nama-fitur

# Lakukan perubahan, test, commit
git add .
git commit -m "feat: Deskripsi fitur"

# Push branch ke GitHub
git push -u origin feature/nama-fitur

# Buat Pull Request di GitHub untuk review
```

### Melakukan Update dari Changes:

```powershell
# Check status
git status

# Lihat apa yang berubah
git diff

# Stage file-file yang ingin di-commit
git add app/(tabs)/lapor.tsx
git add services/dataSourceService.ts

# Commit dengan pesan deskriptif
git commit -m "feat: Update lapor screen with data source selector"

# Push ke remote
git push origin feature/nama-fitur
```

### Sync dengan Main Branch:

```powershell
# Jika ada perubahan di main branch
git fetch origin
git merge origin/main

# Atau rebase (lebih clean)
git rebase origin/main
```

---

## 🛡️ GitHub Best Practices

### 1. **Protect Main Branch**
- Masuk GitHub > Settings > Branches
- Add rule untuk "main" branch
- Require pull request reviews
- Require status checks to pass

### 2. **Use .gitignore untuk Sensitive Data**
```
firebaseConfig.js  # Jangan push config dengan API keys
.env               # Environment variables
node_modules/      # Dependencies
```

### 3. **Regular Commits**
```powershell
# Commit setiap fitur kecil yang selesai
git commit -m "feat: Add rain intensity selector"
git commit -m "fix: Fix GPS permission on iOS"
git commit -m "docs: Update README with setup instructions"
```

### 4. **Review Sebelum Push**
```powershell
# Lihat commits yang akan di-push
git log origin/main..HEAD

# Lihat detail perubahan
git diff origin/main
```

---

## 📊 Project Structure untuk GitHub

```
RainSpot/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab screens
│   │   ├── lapor.tsx      # Report screen with data source selector
│   │   ├── analisis.tsx   # Analysis screen
│   │   ├── map.tsx        # Map screen
│   │   └── explore.tsx
│   └── index.tsx
├── components/             # Reusable components
│   ├── ComingSoonModal.tsx # New: Coming Soon modal
│   ├── themed-react.tsx
│   └── ...
├── services/              # Business logic
│   └── dataSourceService.ts # New: Data source abstraction
├── config/                # Configuration
│   └── iotConfig.ts       # New: IoT configuration
├── constants/             # Constants
│   └── theme.ts
├── screens/               # Legacy screens
├── firebaseConfig.js      # Firebase config (PRIVATE!)
├── package.json           # Dependencies
├── app.json               # Expo config
├── tsconfig.json          # TypeScript config
├── .gitignore
├── README.md              # Project overview
└── [DOCUMENTATION_FILES]  # Analysis docs

```

---

## ⚙️ Troubleshooting

### "fatal: remote already exists"
```powershell
# Remove existing remote
git remote remove origin

# Add again
git remote add origin https://github.com/USERNAME/REPOSITORY.git
```

### "Permission denied (publickey)"
- Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Atau gunakan Personal Access Token (PAT) dengan HTTPS

### "Your branch is behind by N commits"
```powershell
git fetch origin
git merge origin/main
# atau
git pull origin main
```

### Accidental push sensitive data (firebaseConfig.js)
```powershell
# Remove file dari history
git filter-branch --tree-filter 'rm -f firebaseConfig.js' HEAD

# Force push (hati-hati!)
git push origin --force
```

---

## 📝 README Template untuk GitHub

Buat `README.md` di root project:

```markdown
# 🌧️ RainSpot - Real-Time Rainfall Detection App

Aplikasi mobile untuk pelaporan cuaca dan deteksi hujan real-time menggunakan data manual dan IoT sensor.

## ✨ Features

- 📍 Pelaporan berbasis lokasi GPS
- 📊 Analisis data cuaca real-time
- 🗺️ Visualisasi heatmap
- 🔄 Integrasi Firebase untuk sinkronisasi data
- 🚀 Coming Soon: Integrasi IoT sensor network

## 🛠️ Tech Stack

- React Native + Expo Router
- TypeScript
- Firebase Realtime Database
- React Native Maps
- Open-Meteo Weather API

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI

### Installation

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/RainSpot.git
cd RainSpot
npm install
\`\`\`

### Development

\`\`\`bash
npx expo start
\`\`\`

## 📋 Project Roadmap

- [x] Manual rainfall reporting
- [x] Data analysis & visualization
- [x] Heatmap display
- [ ] IoT sensor integration (Q1 2026)
- [ ] Push notifications
- [ ] Offline support

## 📚 Documentation

- [Tab Analisis](./ANALISIS_DOCUMENTATION.md)
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)

## 🤝 Contributing

Pull requests welcome! Untuk perubahan besar, buka issue dulu untuk diskusi.

## 📄 License

MIT License
```

---

## ✅ Checklist

- [ ] Buat GitHub repository
- [ ] Tambahkan remote origin
- [ ] Push initial commit ke GitHub
- [ ] Buat `.gitignore` proper (sudah ada)
- [ ] Write README.md
- [ ] Setup branch protection rules (optional)
- [ ] Invite collaborators (jika perlu)
- [ ] Setup CI/CD workflows (GitHub Actions - optional)

---

## 🎯 Next Steps

Setelah setup GitHub:

1. **Buat branch untuk fitur baru:**
   ```powershell
   git checkout -b feature/iot-sensor-integration
   ```

2. **Implement IoT integration** (lanjutan dari Lapor tab update)

3. **Create Pull Request** untuk review sebelum merge ke main

4. **Setup GitHub Actions** untuk automated testing (optional)

---

**Happy Coding! 🚀**
