# Advanced Guide - Tab Analisis RainSpot

## 🎯 Customization Tips

### 1. Mengubah Lokasi Default

**File:** `app/(tabs)/analisis.tsx` (Line ~75)

Current:
```typescript
const latitude = -6.2088;    // Jakarta
const longitude = 106.8456;
```

Ubah ke lokasi yang diinginkan:
```typescript
// Surabaya
const latitude = -7.2575;
const longitude = 112.7521;

// Bandung
const latitude = -6.9271;
const longitude = 107.6411;

// Medan
const latitude = 3.1957;
const longitude = 101.6858;
```

### 2. Mengubah Forecast Days

**Maksimal 16 hari forecast:**
```typescript
// Ubah dari forecast_days=1 menjadi
const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${latitude}&longitude=${longitude}` +
  `&hourly=precipitation,rain,cloud_cover,temperature_2m` +
  `&timezone=Asia/Jakarta&forecast_days=7`  // 7 hari ke depan
);
```

### 3. Menambah Variabel Cuaca Baru

**Contoh: Menambah Wind Speed & Humidity**

Ubah fetch URL:
```typescript
const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${latitude}&longitude=${longitude}` +
  `&hourly=precipitation,rain,cloud_cover,temperature_2m,wind_speed_10m,relative_humidity_2m` +
  `&timezone=Asia/Jakarta&forecast_days=1`
);
```

Update WeatherData interface:
```typescript
interface WeatherData {
    temperature: number;
    rainIntensity: number;
    cloudCover: number;
    windSpeed: number;
    humidity: number;  // Tambah ini
    time: string;
}
```

Mapping data:
```typescript
const weatherArray: WeatherData[] = data.hourly.time.map((time, index) => ({
    temperature: data.hourly.temperature_2m[index],
    rainIntensity: data.hourly.rain[index],
    cloudCover: data.hourly.cloud_cover[index],
    windSpeed: data.hourly.wind_speed_10m[index],  // Tambah ini
    humidity: data.hourly.relative_humidity_2m[index],  // Tambah ini
    time: time,
}));
```

Tambah card UI:
```typescript
<View style={styles.weatherItem}>
  <Ionicons name="water-outline" size={24} color={Colors.dark.primary} />
  <Text style={styles.weatherLabel}>Kelembaban</Text>
  <Text style={styles.weatherValue}>{currentWeather.humidity}%</Text>
</View>
```

### 4. Customizing Chart Colors

**File:** `constants/theme.ts`

Cari `darkChartConfig`:
```typescript
export const darkChartConfig = {
    backgroundColor: Colors.dark.background,
    backgroundGradientFrom: Colors.dark.background,
    backgroundGradientTo: Colors.dark.background,
    color: (opacity = 1) => `rgba(74, 158, 255, ${opacity})`,  // Ubah warna
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
};
```

Ubah opacity dan RGB values:
```typescript
// Lebih terang
color: (opacity = 1) => `rgba(100, 200, 255, ${opacity})`,

// Lebih gelap
color: (opacity = 1) => `rgba(50, 100, 200, ${opacity})`,

// Hijau untuk Hujan Positif
color: (opacity = 1) => `rgba(100, 255, 100, ${opacity})`,

// Merah untuk Peringatan
color: (opacity = 1) => `rgba(255, 100, 100, ${opacity})`,
```

### 5. Mengubah Threshold Rekomendasi

**File:** `app/(tabs)/analisis.tsx` (Line ~330)

Current:
```typescript
{currentWeather && currentWeather.rainIntensity > 5 ? (
  // Hujan Lebat
) : currentWeather && currentWeather.rainIntensity > 2 ? (
  // Hujan Sedang
) : (
  // Cerah
)}
```

Ubah threshold:
```typescript
{currentWeather && currentWeather.rainIntensity > 10 ? (
  // SANGAT LEBAT (>10mm)
  <>
    <RecommendationItem icon="alert-circle" text="EVAKUASI SEGERA" />
    <RecommendationItem icon="warning" text="Waspadai bencana" />
  </>
) : currentWeather && currentWeather.rainIntensity > 5 ? (
  // LEBAT (5-10mm)
  // ... existing code
```

---

## 🔌 Integrasi dengan Fitur Lain

### 1. Sinkronisasi dengan Location dari Map

**Implementasi:**
```typescript
import * as Location from 'expo-location';

const fetchWeatherData = async () => {
    try {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        
        const { latitude, longitude } = location.coords;
        
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${latitude}&longitude=${longitude}` +
            // ... rest
        );
        // ...
    } catch (error) {
        console.error('Error:', error);
        // Fallback ke default location
    }
};
```

### 2. Notifikasi Alert Cuaca

**Tambahkan ke insights generation:**
```typescript
useEffect(() => {
    const newInsights: string[] = [];
    
    if (currentWeather && currentWeather.rainIntensity > 8) {
        // Trigger notification
        Alert.alert(
            '⚠️ PERINGATAN CUACA',
            'Hujan deras terdeteksi. Hati-hati di jalan!',
            [{ text: 'OK' }]
        );
    }
    
    // ... existing insight logic
}, [currentWeather, stats]);
```

### 3. Export Data ke CSV

**Buat fungsi baru:**
```typescript
const exportWeatherData = async () => {
    let csv = 'Waktu,Hujan(mm),Suhu(°C),Awan(%)\n';
    
    weatherData.forEach(w => {
        csv += `${w.time},${w.rainIntensity},${w.temperature},${w.cloudCover}\n`;
    });
    
    // Save atau share
    console.log(csv);
};
```

---

## 📊 Data Visualization Enhancements

### 1. Menambah Multiple Datasets ke Chart

```typescript
setChartData({
    labels,
    datasets: [
        {
            data: rainData,
            color: (opacity = 1) => `rgba(74, 158, 255, ${opacity})`,
            strokeWidth: 2,
        },
        {
            data: temperatureData,
            color: (opacity = 1) => `rgba(255, 158, 74, ${opacity})`,
            strokeWidth: 2,
        },
    ],
});
```

### 2. Bar Chart untuk Perbandingan

```typescript
import { BarChart } from 'react-native-chart-kit';

<BarChart
    data={chartData}
    width={screenWidth - 40}
    height={220}
    chartConfig={darkChartConfig}
/>
```

### 3. Pie Chart untuk Distribusi

```typescript
import { PieChart } from 'react-native-chart-kit';

const pieData = [
    { name: 'Hujan Ringan', population: count1, color: 'rgba(74, 158, 255, 1)' },
    { name: 'Hujan Sedang', population: count2, color: 'rgba(255, 214, 10, 1)' },
    { name: 'Hujan Lebat', population: count3, color: 'rgba(255, 69, 58, 1)' },
];

<PieChart
    data={pieData}
    width={screenWidth - 40}
    height={220}
    chartConfig={darkChartConfig}
    accessor="population"
/>
```

---

## 🐛 Debugging & Testing

### 1. Console Logging untuk API Response

```typescript
const fetchWeatherData = async () => {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        console.log('=== Weather API Response ===');
        console.log('Current time:', data.hourly.time[0]);
        console.log('Current rain:', data.hourly.rain[0]);
        console.log('Current cloud:', data.hourly.cloud_cover[0]);
        console.log('Current temp:', data.hourly.temperature_2m[0]);
        
        // ...
    }
};
```

### 2. Mock Data untuk Testing

```typescript
const mockWeatherData: WeatherData[] = [
    {
        temperature: 28.5,
        rainIntensity: 2.3,
        cloudCover: 65,
        windSpeed: 8.5,
        time: new Date().toISOString(),
    },
    {
        temperature: 27.8,
        rainIntensity: 5.1,
        cloudCover: 80,
        windSpeed: 9.2,
        time: new Date(Date.now() + 3600000).toISOString(),
    },
];

// Gunakan di development
const weatherData = __DEV__ ? mockWeatherData : realData;
```

### 3. Performance Monitoring

```typescript
useEffect(() => {
    const startTime = performance.now();
    
    fetchWeatherData().then(() => {
        const endTime = performance.now();
        console.log(`API fetch took ${endTime - startTime}ms`);
    });
}, []);
```

---

## 🔐 Best Practices

### 1. Error Handling

```typescript
const fetchWeatherData = async () => {
    try {
        const response = await fetch(URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.hourly) {
            throw new Error('Invalid API response structure');
        }
        
        // Process data
        
    } catch (error) {
        console.error('Weather API Error:', error);
        
        // Set default/fallback values
        setCurrentWeather({
            temperature: 25,
            rainIntensity: 0,
            cloudCover: 50,
            windSpeed: 5,
            time: new Date().toISOString(),
        });
    }
};
```

### 2. Caching API Response

```typescript
let cachedWeatherData: WeatherData[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWeatherData = async () => {
    const now = Date.now();
    
    if (cachedWeatherData && (now - lastFetchTime) < CACHE_DURATION) {
        setWeatherData(cachedWeatherData);
        return;
    }
    
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        // Process dan cache
        cachedWeatherData = weatherArray;
        lastFetchTime = now;
        
    } catch (error) {
        // Use cache if available
        if (cachedWeatherData) {
            setWeatherData(cachedWeatherData);
        }
    }
};
```

### 3. Rate Limiting

```typescript
let isApiCallInProgress = false;

const fetchWeatherData = async () => {
    if (isApiCallInProgress) {
        console.warn('API call already in progress');
        return;
    }
    
    isApiCallInProgress = true;
    
    try {
        // API call
    } finally {
        isApiCallInProgress = false;
    }
};
```

---

## 📈 Performance Metrics

Metrics untuk monitor:
- API response time: target < 500ms
- Chart rendering: target < 300ms
- Firebase sync: real-time (< 1s)
- Memory usage: < 50MB
- Battery: minimal impact

---

## 🎓 Learning Resources

- [Open-Meteo Full API Docs](https://open-meteo.com/en/docs)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Firebase Best Practices](https://firebase.google.com/docs/database/usage/best-practices)
- [React Hooks Pattern](https://react.dev/reference/react/hooks)

---

**Last Updated:** December 4, 2025
