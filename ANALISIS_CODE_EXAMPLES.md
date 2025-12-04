# 💻 Code Examples & Snippets - Tab Analisis

## 🔧 Commonly Used Code Snippets

### 1. Change Location

**Jakarta → Surabaya**
```typescript
// File: app/(tabs)/analisis.tsx, line 75-76

// Before:
const latitude = -6.2088;
const longitude = 106.8456;

// After:
const latitude = -7.2575;   // Surabaya
const longitude = 112.7521;
```

**Jakarta → Bandung**
```typescript
const latitude = -6.9271;   // Bandung
const longitude = 107.6411;
```

**Jakarta → Medan**
```typescript
const latitude = 3.1957;    // Medan
const longitude = 101.6858;
```

**Get from GPS (Recommended)**
```typescript
import * as Location from 'expo-location';

const fetchWeatherData = async () => {
    try {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Location permission denied');
            return;
        }

        // Get location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        // Use dynamic coordinates
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${latitude}&longitude=${longitude}` +
            `&hourly=precipitation,rain,cloud_cover,temperature_2m` +
            `&timezone=Asia/Jakarta&forecast_days=1`
        );

        // ... rest of function
    } catch (error) {
        console.error('Location error:', error);
        // Fallback ke default location
    }
};
```

---

### 2. Add New Weather Parameter

**Tambah Wind Speed**

Step 1: Update URL
```typescript
const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&hourly=precipitation,rain,cloud_cover,temperature_2m,wind_speed_10m` +  // Tambah
    `&timezone=Asia/Jakarta&forecast_days=1`
);
```

Step 2: Update Interface
```typescript
interface WeatherData {
    temperature: number;
    rainIntensity: number;
    cloudCover: number;
    windSpeed: number;  // Already exists!
    time: string;
}
```

Step 3: Map Data
```typescript
const weatherArray: WeatherData[] = data.hourly.time.map((time, index) => ({
    temperature: data.hourly.temperature_2m[index],
    rainIntensity: data.hourly.rain[index],
    cloudCover: data.hourly.cloud_cover[index],
    windSpeed: data.hourly.wind_speed_10m[index],  // Map it
    time: time,
}));
```

Step 4: Display in UI
```typescript
<View style={styles.weatherItem}>
    <Ionicons name="wind" size={24} color={Colors.dark.primary} />
    <Text style={styles.weatherLabel}>Angin</Text>
    <Text style={styles.weatherValue}>{currentWeather.windSpeed.toFixed(1)} km/h</Text>
</View>
```

---

### 3. Customize Chart Colors

**Ubah dari Biru ke Hijau**
```typescript
// In setChartData() function, change:

// Before (Biru):
datasets: [{ data: data_points }]

// After (Hijau):
const config = {
    backgroundColor: Colors.dark.background,
    backgroundGradientFrom: Colors.dark.background,
    backgroundGradientTo: Colors.dark.background,
    color: (opacity = 1) => `rgba(100, 255, 100, ${opacity})`,  // Green
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
};

<LineChart
    data={chartData}
    width={screenWidth - 40}
    height={220}
    chartConfig={config}
    style={styles.chart}
    bezier
    withDots={true}
/>
```

**Rainbow Gradient**
```typescript
// Use multiple charts or complex config
const colors = [
    'rgba(255, 69, 58, 1)',   // Red
    'rgba(255, 149, 0, 1)',   // Orange
    'rgba(255, 214, 10, 1)',  // Yellow
    'rgba(100, 255, 100, 1)', // Green
    'rgba(74, 158, 255, 1)',  // Blue
];

// Index based on intensity
const intensityIndex = Math.floor(currentWeather.rainIntensity);
const color = colors[Math.min(intensityIndex, colors.length - 1)];
```

---

### 4. Add Alert for Heavy Rain

```typescript
import { Alert } from 'react-native';

useEffect(() => {
    if (currentWeather && currentWeather.rainIntensity > 8) {
        Alert.alert(
            '⚠️ PERINGATAN CUACA EKSTREM',
            `Hujan lebat (${currentWeather.rainIntensity.toFixed(1)}mm) terdeteksi!\n\nSaran: Tetap di dalam ruangan dan hindari berkendara.`,
            [
                {
                    text: 'Saya Mengerti',
                    onPress: () => console.log('Alert dismissed'),
                },
                {
                    text: 'Lihat Map',
                    onPress: () => navigation.navigate('map'),
                }
            ],
            { cancelable: false }
        );
    }
}, [currentWeather]);
```

---

### 5. Pull-to-Refresh

```typescript
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeatherData();
    setRefreshing(false);
};

// In render:
<ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
    showsVerticalScrollIndicator={false}
    refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
            title="Loading weather..."
        />
    }
>
    {/* ... content ... */}
</ScrollView>
```

---

### 6. Export Data to CSV

```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const exportToCSV = async () => {
    try {
        let csv = 'Waktu,Hujan(mm),Suhu(°C),Awan(%),Angin(km/h)\n';

        weatherData.forEach(w => {
            const time = moment(w.time).format('YYYY-MM-DD HH:mm');
            csv += `${time},${w.rainIntensity.toFixed(1)},${w.temperature.toFixed(1)},${w.cloudCover},${w.windSpeed.toFixed(1)}\n`;
        });

        const filename = `weather_${moment().format('YYYY-MM-DD_HHmmss')}.csv`;
        const filepath = `${FileSystem.DocumentDirectoryPath}/${filename}`;

        await FileSystem.writeAsStringAsync(filepath, csv);

        // Share file
        await Sharing.shareAsync(filepath, {
            mimeType: 'text/csv',
            dialogTitle: 'Bagikan Data Cuaca',
        });

    } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Error', 'Gagal export data');
    }
};

// Add button to UI:
<TouchableOpacity onPress={exportToCSV} style={styles.exportButton}>
    <Ionicons name="download" size={18} color={Colors.dark.onPrimary} />
    <Text style={styles.exportButtonText}>Export CSV</Text>
</TouchableOpacity>
```

---

### 7. Cache Weather Data

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWeatherData = async () => {
    try {
        // Check cache
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Using cached weather data');
                setWeatherData(data);
                return;
            }
        }

        // Fetch fresh data
        const response = await fetch(URL);
        const data = await response.json();

        // Parse and save
        const weatherArray = /* ... parse ... */;
        setWeatherData(weatherArray);

        // Cache it
        await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
                data: weatherArray,
                timestamp: Date.now(),
            })
        );

    } catch (error) {
        console.error('Fetch error:', error);

        // Try to use stale cache
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data } = JSON.parse(cached);
            setWeatherData(data);
        }
    }
};
```

---

### 8. Custom Insights Logic

```typescript
const generateCustomInsights = () => {
    const newInsights: string[] = [];

    if (!currentWeather) return newInsights;

    // Rain intensity
    if (currentWeather.rainIntensity > 10) {
        newInsights.push('🌧️ HUJAN EKSTREM - Cek keselamatan Anda');
    } else if (currentWeather.rainIntensity > 5) {
        newInsights.push('🌧️ Hujan lebat - Bawa payung');
    } else if (currentWeather.rainIntensity > 2) {
        newInsights.push('🌦️ Hujan sedang - Siap-siap');
    } else if (currentWeather.rainIntensity > 0) {
        newInsights.push('🌧️ Hujan ringan - Aman untuk aktivitas');
    } else {
        newInsights.push('☀️ Cerah - Aktivitas outdoor aman');
    }

    // Cloud cover
    if (currentWeather.cloudCover > 90) {
        newInsights.push('☁️ Mendung penuh - Kemungkinan hujan tinggi');
    } else if (currentWeather.cloudCover > 50) {
        newInsights.push('⛅ Berawan - Sebagian cerah');
    }

    // Temperature
    if (currentWeather.temperature > 35) {
        newInsights.push('🔥 Sangat panas - Tetap terhidrasi');
    } else if (currentWeather.temperature > 30) {
        newInsights.push('🌡️ Panas - Minum air yang cukup');
    } else if (currentWeather.temperature < 15) {
        newInsights.push('❄️ Dingin - Gunakan jaket');
    }

    // Firebase stats
    if (stats.total > 50) {
        newInsights.push('📊 Banyak laporan - Area aktif');
    } else if (stats.total > 20) {
        newInsights.push('📊 Laporan sedang - Aktivitas normal');
    }

    return newInsights;
};
```

---

### 9. Multi-Dataset Chart

```typescript
setChartData({
    labels,
    datasets: [
        {
            data: rainData,
            color: (opacity = 1) => `rgba(74, 158, 255, ${opacity})`,
            strokeWidth: 2,
            name: 'Hujan',
        },
        {
            data: temperatureData,
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 2,
            name: 'Suhu',
        },
    ],
});
```

---

### 10. Error Handling Best Practice

```typescript
const fetchWeatherData = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(URL, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate structure
        if (!data.hourly || !Array.isArray(data.hourly.time)) {
            throw new Error('Invalid API response structure');
        }

        // Process data
        const weatherArray = /* ... */;
        setWeatherData(weatherArray);
        setCurrentWeather(weatherArray[0]);

    } catch (error) {
        // Specific error handling
        if (error instanceof TypeError) {
            console.error('Network error:', error.message);
            Alert.alert('Error', 'Tidak dapat terhubung ke internet');
        } else if (error.name === 'AbortError') {
            console.error('Request timeout');
            Alert.alert('Error', 'Permintaan timeout - coba lagi');
        } else {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'Terjadi kesalahan - coba lagi nanti');
        }

        // Set fallback data
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

---

## 🎨 Styling Customizations

### 1. Change Card Styling

```typescript
// Make cards more prominent
card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.medium,
    borderWidth: 2,  // Increase from 1
    borderColor: Colors.dark.primary,  // Use primary color
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.large,  // Increase shadow
},
```

### 2. Gradient Background

```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
    colors={[Colors.dark.background, Colors.dark.surface]}
    style={styles.container}
>
    {/* Content */}
</LinearGradient>
```

### 3. Custom Font Styles

```typescript
title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
    letterSpacing: 1,  // Add letter spacing
    textTransform: 'uppercase',  // Uppercase text
},
```

---

## 🧪 Testing Examples

### Unit Test (Jest)

```typescript
// __tests__/analisis.test.ts

describe('Weather Analysis', () => {
    it('should parse weather API response', () => {
        const mockData = {
            hourly: {
                time: ['2024-01-01T00:00'],
                rain: [2.5],
                cloud_cover: [65],
                temperature_2m: [28],
            },
        };

        expect(mockData.hourly.rain[0]).toBe(2.5);
    });

    it('should generate correct insights', () => {
        const weather = { rainIntensity: 8 };
        const expectsAlert = weather.rainIntensity > 5;
        expect(expectsAlert).toBe(true);
    });
});
```

### Component Test (React Native Testing Library)

```typescript
import { render, screen } from '@testing-library/react-native';

describe('AnalisisScreen', () => {
    it('renders title', () => {
        render(<AnalisisScreen />);
        expect(screen.getByText('Analisis Cuaca')).toBeTruthy();
    });
});
```

---

## 🚀 Performance Tips

### 1. Memoize Expensive Calculations

```typescript
const memoizedStats = useMemo(() => {
    if (allData.length === 0) {
        return { total: 0, average: 0, highest: null };
    }

    const total = allData.length;
    const average = allData.reduce((sum, d) => sum + (d.weight || 0), 0) / total;
    const highest = allData.reduce((prev, curr) =>
        ((prev.weight || 0) > (curr.weight || 0)) ? prev : curr
    );

    return { total, average, highest };
}, [allData]);
```

### 2. Optimize Re-renders

```typescript
// Use useMemo for chart data
const memoizedChartData = useMemo(() => ({
    labels,
    datasets: [{ data: data_points }],
}), [labels, data_points]);
```

### 3. Debounce Updates

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedFetchWeather = useDebouncedCallback(
    async () => {
        await fetchWeatherData();
    },
    500  // Wait 500ms after last call
);
```

---

## 📚 References

- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

**Last Updated:** December 4, 2025
**Version:** 1.0
