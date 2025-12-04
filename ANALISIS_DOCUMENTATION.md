# Dokumentasi Tab Analisis - RainSpot

## 📋 Ringkasan
Tab Analisis telah diperbarui dengan integrasi **Open-Meteo API** untuk menampilkan data cuaca real-time dengan analisis mendalam. Kombinasi data dari Firebase dan API cuaca memberikan insight komprehensif tentang kondisi hujan dan rekomendasi aktivitas.

---

## 🎯 Fitur Utama

### 1. **Data Cuaca Real-Time (Open-Meteo API)**
- ✅ Intensitas hujan per jam (0-24 jam ke depan)
- ✅ Suhu udara (Temperature)
- ✅ Liputan awan (Cloud Cover)
- ✅ Prediksi 24 jam dengan update otomatis
- ✅ **Tanpa biaya** - API gratis tanpa autentikasi

### 2. **Grafik Tren Hujan 24 Jam**
- Visualisasi LineChart untuk intensitas hujan
- 12 jam ke depan ditampilkan dengan label waktu
- Styling responsif dengan dark theme
- Smooth bezier curves untuk tampilan profesional

### 3. **Kartu Ringkasan Cuaca**
Menampilkan 3 metrik utama:
- 💧 **Hujan**: Intensitas curah hujan (mm)
- 🌡️ **Suhu**: Temperatur lingkungan (°C)
- ☁️ **Awan**: Persentase liputan awan (%)

### 4. **Insight Otomatis**
Sistem insight cerdas yang menganalisis:
- Intensitas hujan saat ini dan memberikan rekomendasi
- Tingkat liputan awan
- Temperatur lingkungan
- Total laporan dari pengguna RainSpot

Contoh Insight:
- "🌧️ Intensitas hujan tinggi terdeteksi saat ini"
- "☀️ Cuaca cerah, cocok untuk aktivitas outdoor"
- "☁️ Liputan awan sangat tinggi"
- "📊 Total 25 laporan hujan tercatat"

### 5. **Rekomendasi Aktivitas Dinamis**
Rekomendasi berubah berdasarkan kondisi cuaca:

**Saat Hujan Lebat (>5mm):**
- Tetap di dalam ruangan
- Hindari aktivitas di luar
- Waspadai banjir

**Saat Hujan Sedang (2-5mm):**
- Bawa payung atau jas hujan
- Berjalan dengan hati-hati
- Perjalanan memerlukan waktu lebih

**Saat Cerah:**
- Cuaca baik untuk outdoor
- Cocok untuk olahraga
- Bagus untuk fotografi

### 6. **Ringkasan Data Firebase**
Statistik dari laporan pengguna:
- Total laporan terkumpul
- Rata-rata intensitas laporan
- Intensitas tertinggi yang pernah dilaporkan

---

## 🔧 Implementasi Teknis

### Dependencies Yang Digunakan
```json
{
  "react-native-chart-kit": "^6.12.0",  // Untuk LineChart
  "moment": "^2.30.1",                   // Format tanggal/waktu
  "firebase": "^12.6.0",                 // Real-time database
  "@expo/vector-icons": "^15.0.3"       // Icons Ionicons
}
```

### API Integration: Open-Meteo

**Endpoint:**
```
https://api.open-meteo.com/v1/forecast?
latitude={lat}&longitude={lng}
&hourly=precipitation,rain,cloud_cover,temperature_2m
&timezone=Asia/Jakarta&forecast_days=1
```

**Keuntungan:**
- ✅ Gratis selamanya
- ✅ Tanpa rate limiting untuk penggunaan wajar
- ✅ Akurat dan terpercaya (data meteorologi)
- ✅ Real-time updates
- ✅ Tidak perlu API key
- ✅ Dokumentasi lengkap

**Response Data:**
```typescript
interface ForecastData {
    hourly: {
        time: string[];              // ISO 8601 timestamps
        precipitation: number[];     // Total curah hujan (mm)
        rain: number[];             // Intensitas hujan (mm)
        cloud_cover: number[];      // Liputan awan (%)
        temperature_2m: number[];   // Suhu di 2m (°C)
    };
}
```

### Firebase Integration

**Path:** `rainpoints/`

**Struktur Data:**
```javascript
{
  "rainpointId": {
    "latitude": number,
    "longitude": number,
    "intensity": string,         // "Hujan Ringan", "Hujan Sedang", etc.
    "weight": number,            // 0-4 scale
    "kategori": string,          // Category/hazard
    "timestamp": number,         // Date.now()
    "kategorikhusus": string     // Custom hazard if "Lainnya" selected
  }
}
```

---

## 📊 Komponen UI

### 1. Header Section
```
┌─────────────────────────┐
│  📊 Analisis Cuaca      │
│  Prediksi 24 Jam        │
└─────────────────────────┘
```

### 2. Current Weather Card
```
┌─────────────────────────────────┐
│ Kondisi Saat Ini        14:30    │
├──────────┬──────────┬──────────┐
│ 💧 Hujan │ 🌡️ Suhu │ ☁️ Awan │
│ 2.5 mm   │ 28.3°C   │ 65%     │
└──────────┴──────────┴──────────┘
```

### 3. 24-Hour Trend Chart
```
┌─────────────────────────────────┐
│ 📈 Tren Hujan 24 Jam            │
│                                 │
│      /\                         │
│     /  \        ___             │
│    /    \  ____/               │
│ 14 15 16 17 18 19 20 21 ...    │
└─────────────────────────────────┘
```

### 4. Insights Section
```
┌─────────────────────────────────┐
│ 💡 Insight                      │
│ 🌧️ Intensitas hujan tinggi      │
│ ☁️ Liputan awan sangat tinggi    │
│ 📊 Total 25 laporan tercatat    │
└─────────────────────────────────┘
```

### 5. Recommendations Section
```
┌─────────────────────────────────┐
│ 💡 Rekomendasi Aktivitas        │
│ 🏠 Tetap di dalam ruangan       │
│ 🚫 Hindari aktivitas di luar    │
│ ⚠️ Waspadai banjir              │
└─────────────────────────────────┘
```

---

## 🎨 Styling & Theme

### Colors Digunakan
```typescript
Colors.dark.background        // Background utama
Colors.dark.surface          // Card background
Colors.dark.primary          // Primary accent (biru)
Colors.dark.warning          // Warning color (oranye)
Colors.dark.success          // Success color (hijau)
Colors.dark.text             // Text utama
Colors.dark.textSecondary    // Text secondary
Colors.dark.border           // Border color
Colors.dark.cardSecondary    // Secondary card bg
```

### Spacing Constants
```typescript
Spacing.xs, sm, md, lg, xl  // Consistent spacing
BorderRadius.small, medium, large  // Border radius
Shadows.medium              // Elevation effect
```

---

## 📱 Responsivitas

Semua komponen responsive terhadap ukuran layar:
- ✅ Chart width: `screenWidth - 40` (padding 20+20)
- ✅ Grid layouts flex-based
- ✅ Typography scalable
- ✅ Touch targets minimum 44px (accessibility)

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────┐
│         AnalisisScreen Component Mount               │
├─────────────────────────────────────────────────────┤
│ 1. Call fetchWeatherData()                           │
│    └─> Open-Meteo API                               │
│        └─> Parse hourly forecast                     │
│            └─> Extract 12 jam pertama                │
│                └─> Generate chart labels & data      │
│                                                      │
│ 2. Setup Firebase listener (rainpointsRef)          │
│    └─> Real-time on every data change               │
│        └─> Calculate stats (total, avg, highest)     │
│                                                      │
│ 3. Generate insights (useEffect)                    │
│    └─> Analyze currentWeather + stats               │
│        └─> Create insight strings                    │
│                                                      │
│ 4. Render UI with all data                          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Performance Optimizations

1. **Memoization**: useEffect dependencies precise
2. **Lazy Rendering**: Insights generated on demand
3. **Efficient Filtering**: Chart data sliced to 12 hours
4. **Real-time Updates**: Firebase listeners optimized
5. **Network**: Open-Meteo request on mount only

---

## 🛠️ Troubleshooting

### API Not Responding
```javascript
// Try manual fetch test
fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&hourly=precipitation,rain,cloud_cover,temperature_2m&timezone=Asia/Jakarta&forecast_days=1')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Chart Not Showing
- Pastikan `darkChartConfig` imported dari theme
- Verify `chartData.labels.length > 0`
- Check console untuk errors

### Firebase Data Not Showing
- Verify `rainpointsRef` path benar
- Check Firebase rules allow read
- Check browser DevTools Network tab

---

## 📝 Kode Contoh: Custom Location

Untuk menggunakan lokasi pengguna (memerlukan permission):

```typescript
// Tambahkan ke fetchWeatherData()
import * as Location from 'expo-location';

const location = await Location.getCurrentPositionAsync({});
const { latitude, longitude } = location.coords;

// Ganti hardcoded coordinates dengan values ini
const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${latitude}&longitude=${longitude}` +
  // ... rest of URL
);
```

---

## 📚 Resources

- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [Firebase Real-time Database](https://firebase.google.com/docs/database)
- [Moment.js Documentation](https://momentjs.com/)

---

## ✅ Checklist Implementasi

- [x] Open-Meteo API integration
- [x] 24-hour forecast chart
- [x] Current weather cards
- [x] Automatic insights generation
- [x] Dynamic activity recommendations
- [x] Firebase data sync
- [x] Dark theme styling
- [x] Responsive layout
- [x] Error handling
- [x] Performance optimization

---

**Terakhir Diupdate:** December 4, 2025
**Versi:** 2.0 (Open-Meteo Integration)
**Status:** ✅ Production Ready
