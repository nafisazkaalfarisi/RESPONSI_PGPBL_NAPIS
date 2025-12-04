# ⚡ Quick Start: Push ke GitHub

## 3 Langkah Cepat

### 1️⃣ Buat Repository di GitHub

```
1. Buka https://github.com/new
2. Nama repository: RainSpot
3. Pilih Public/Private sesuai keinginan
4. JANGAN check "Initialize repository"
5. Click "Create repository"
```

### 2️⃣ Connect Repository Lokal ke GitHub

Ganti `USERNAME` dengan GitHub username Anda:

```powershell
cd d:\rainspot\RainSpot

git remote add origin https://github.com/USERNAME/RainSpot.git
git branch -M main
git push -u origin main
```

### 3️⃣ Minta Password/Token

GitHub akan minta authentication. Gunakan **Personal Access Token**:

**Generate Token:**
1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token"
3. Scope: check `repo` dan `workflow`
4. Copy token

**Saat login, gunakan:**
- Username: GitHub username Anda
- Password: Paste token yang sudah di-copy

---

## ✅ Done!

Sekarang project Anda ada di GitHub. Cek di: `https://github.com/USERNAME/RainSpot`

---

## 📝 Push Update Berikutnya

Setelah development, push ke GitHub:

```powershell
cd d:\rainspot\RainSpot

# Lihat perubahan
git status

# Add & commit
git add .
git commit -m "feat: Deskripsi fitur yang dikembangkan"

# Push
git push origin main
```

---

## 🆘 Common Issues

**Q: "Authentication failed"**
A: Gunakan Personal Access Token, bukan password GitHub

**Q: "Already exists"**  
A: Hapus remote dan tambah lagi:
```powershell
git remote remove origin
git remote add origin https://github.com/USERNAME/RainSpot.git
git push -u origin main
```

**Q: Mau bikin branch terpisah untuk fitur?**
A: 
```powershell
git checkout -b feature/nama-fitur
# ... develop ...
git push -u origin feature/nama-fitur

# Buat pull request di GitHub untuk merge ke main
```

---

**Need help? Lihat GITHUB_SETUP_GUIDE.md untuk dokumentasi lengkap**
