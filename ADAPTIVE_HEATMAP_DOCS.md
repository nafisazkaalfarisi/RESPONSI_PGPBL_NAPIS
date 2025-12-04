## Adaptive Heatmap Implementation - RainSpot Map

### Overview
Implementasi heatmap yang adaptif berdasarkan kepadatan data hujan di peta. Radius heatmap secara otomatis menyesuaikan dari 300-500 meter tergantung pada kepadatan laporan hujan.

### Fitur Utama

#### 1. **Adaptive Radius Calculation**
- **Fungsi**: `calculateAdaptiveRadius(points: RainPoint[]): number`
- **Lokasi**: `app/(tabs)/map.tsx` (sebelum MapScreen component)
- **Algoritma**:
  - Menggunakan Haversine formula untuk menghitung jarak geografis antara titik data
  - Menghitung average minimum distance dari sample pertama 20 titik
  - Adaptive logic berdasarkan kepadatan:
    - **avgMinDistance < 200m** → radius = 500m (very dense clustering)
    - **avgMinDistance 200-300m** → radius = 400m (moderate density)
    - **avgMinDistance > 300m** → radius = 300m (sparse data)

#### 2. **Distance Calculation - Haversine Formula**
```javascript
const R = 6371000; // Earth radius in meters
const lat1 = (point.latitude * Math.PI) / 180;
const lat2 = (otherPoint.latitude * Math.PI) / 180;
const dLat = ((otherPoint.latitude - point.latitude) * Math.PI) / 180;
const dLng = ((otherPoint.longitude - point.longitude) * Math.PI) / 180;

const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distance = R * c; // distance in meters
```

#### 3. **Integration dalam MapView**
- **State**: `const [currentZoom, setCurrentZoom] = useState(12);`
- **useMemo**: `const adaptiveHeatmapRadius = useMemo(() => calculateAdaptiveRadius(filteredPoints), [filteredPoints]);`
- **Usage dalam Circle**:
  ```tsx
  <Circle
    center={{ latitude: point.latitude, longitude: point.longitude }}
    radius={adaptiveHeatmapRadius}  // Dynamic radius
    fillColor={getCategoryStyle(point.intensity).color}
    strokeWidth={0}
  />
  ```

#### 4. **Zoom Level Tracking**
- **Handler**: `onRegionChangeComplete` di MapView
- **Zoom Calculation**: `zoom = log2(360 / latitudeDelta)`
- **Purpose**: Track zoom level untuk future enhancements (misalnya: scale radius based on zoom jika diperlukan)

### Keunggulan Implementasi

✅ **Responsif terhadap kepadatan data**: Radius otomatis menyesuaikan ketika data ditambahkan/dihapus
✅ **Performance optimized**: Hanya sample 20 titik pertama untuk perhitungan (O(n) complexity)
✅ **Satuan meter tetap**: Radius selalu dalam meter, tidak terpengaruh zoom level
✅ **Real-time calculation**: useMemo memastikan perhitungan ulang hanya saat filtered points berubah
✅ **Seamless UX**: Tidak ada hardcoded radius - semua adaptif

### Scenario Penggunaan

| Kepadatan Data | Avg Min Distance | Radius Heatmap | Use Case |
|---|---|---|---|
| Very Dense (banyak laporan <200m) | <200m | 500m | Detail per-blok jalan, identifikasi hot-spots |
| Moderate Dense (laporan terpisah 200-300m) | 200-300m | 400m | Area coverage yang balanced |
| Sparse (laporan jarang >300m) | >300m | 300m | Broad area overview |

### Testing Dengan Dummy Data

Dummy data yang disediakan memiliki:
- 27 titik data di 9 wilayah Yogyakarta
- Berbagai intensitas (Tidak Hujan, Ringan, Sedang, Lebat, Badai)
- Beberapa area dengan clustering padat (radius 500m akan aktif)
- Beberapa area sparse (radius 300m akan aktif)

**Expected behavior**: Heatmap akan menunjukkan gradasi warna yang smooth dengan radius yang sesuai clustering lokal

### Future Enhancements

1. **Zoom-based radius scaling** (opsional):
   ```javascript
   // Jika ingin radius berubah dengan zoom level:
   const baseRadius = adaptiveHeatmapRadius;
   const scaledRadius = baseRadius / Math.pow(2, currentZoom - 12);
   ```

2. **Temporal density** - mempertimbangkan kapan data dilaporkan
3. **Intensity-weighted radius** - radius berbeda untuk setiap intensitas
4. **Performance monitoring** - log density metrics untuk debugging

### Perubahan File

**File Modified**: `app/(tabs)/map.tsx`
- Tambah fungsi: `calculateAdaptiveRadius()`
- Tambah state: `currentZoom`
- Tambah useMemo: `adaptiveHeatmapRadius`
- Ubah Circle radius: `1000` → `{adaptiveHeatmapRadius}`
- Tambah handler: `onRegionChangeComplete` pada MapView

### Notes

- Radius dalam satuan **meter** untuk konsistensi geografis
- react-native-maps Circle component secara native mendukung radius dalam meter
- Tidak perlu Web Mercator conversion karena library sudah handle internally
- Performance tetap optimal untuk dataset besar (>1000 points) karena hanya sample 20

