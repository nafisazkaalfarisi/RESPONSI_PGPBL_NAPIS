# 🌧️ RainSpot
Real-Time Rainfall Detection & Weather Reporting Application

Aplikasi mobile berbasis React Native untuk pelaporan cuaca real-time, analisis data cuaca, dan visualisasi data dalam bentuk heatmap interaktif di area geografis.

## 📖 Deskripsi Produk

RainSpot dirancang untuk membantu pengguna melaporkan kondisi cuaca berbahaya secara real-time, menganalisis data cuaca dengan visualisasi chart interaktif, serta melihat konsentrasi data cuaca dalam bentuk heatmap di Google Maps. Aplikasi ini menggunakan kombinasi manual data input (saat ini aktif) dan mempersiapkan integrasi sensor jaringan IoT untuk pengumpulan data yang lebih akurat.

## ✅ Fitur Utama

🌧️ Pelaporan cuaca real-time dengan GPS location picker  
📊 Analisis data cuaca dengan chart interaktif  
🗺️ Visualisasi heatmap data cuaca di Google Maps  
🔍 Filter data berdasarkan tanggal dan area geografis  
☁️ Integrasi Open-Meteo Weather API untuk data cuaca terkini  
🔌 Infrastructure siap untuk IoT sensor integration (Q1 2026)  

## 🧩 Komponen Pembangun Produk

| Komponen | Teknologi |
|----------|-----------|
| UI Framework | React Native + Expo Router |
| Language | TypeScript 5.3+ |
| Maps & Location | Google Maps + expo-location |
| Backend | Firebase Realtime Database |
| Weather Data | Open-Meteo API |
| UI Components | React Native Paper + Custom Stylesheet |
| Charts | Chart Library (Interactive Visualization) |

## 🗂️ Sumber Data

| Data | Sumber |
|------|--------|
| Laporan cuaca pengguna (real-time) | Firebase Realtime Database: `rainpoints/` |
| Data cuaca terkini & prediksi | Open-Meteo API (free, no API key required) |
| Lokasi pengguna | Device GPS (Expo Location) |

## 📱 Halaman & Fitur Utama

| Halaman | Fungsi |
|---------|--------|
| **Home** (`app/index.tsx`) | Dashboard overview & statistik cuaca real-time |
| **Lapor** (`app/(tabs)/lapor.tsx`) | Form pelaporan cuaca dengan GPS picker & kategori kejadian |
| **Analisis** (`app/(tabs)/analisis.tsx`) | Visualisasi chart data cuaca & statistik mendalam |
| **Map** (`app/(tabs)/map.tsx`) | Heatmap interaktif lokasi cuaca berbahaya di Google Maps |

## 🖼️ Tangkapan Layar Aplikasi

**Home / Dashboard**

![Home Screen](./assets/images/home.jpeg)

**Pelaporan Cuaca**

![Lapor Screen](./assets/images/lapor.jpeg)

**Detail Lapor**

![Lapor Detail](./assets/images/lapor1.jpeg)

**Analisis Data Cuaca**

![Analisis Screen](./assets/images/analisis.jpeg)

**Heatmap Visualization**

![Map Heatmap](./assets/images/map.jpeg)

## 🔧 Instalasi

Clone repository:
```bash
git clone https://github.com/nafisazkaalfarisi/RESPONSI_PGPBL_NAPIS.git
```

Masuk ke folder project:
```bash
cd RainSpot
```

Install dependencies:
```bash
npm install
```

Jalankan aplikasi:
```bash
npx expo start
```

⚠️ Pastikan firebaseConfig.js sudah dikonfigurasi dengan credentials Firebase Anda.

## 👨‍💻 Developer

Proyek ini dikembangkan oleh **Nafisa Azka Alfarisi** untuk memenuhi syarat Responsi PGPBL 2025.

**GitHub:** [@nafisazkaalfarisi](https://github.com/nafisazkaalfarisi)  
**Repository:** [RESPONSI_PGPBL_NAPIS](https://github.com/nafisazkaalfarisi/RESPONSI_PGPBL_NAPIS)
