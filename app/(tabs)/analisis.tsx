// screens/analisis.tsx (Dark Theme with Open-Meteo Weather API)
import { Ionicons } from '@expo/vector-icons';
import { onValue, ref } from 'firebase/database';
import moment from 'moment';
import 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BorderRadius, Colors, darkChartConfig, Shadows, Spacing } from '../../constants/theme';
import { database } from '../../firebaseConfig';

const screenWidth = Dimensions.get('window').width;

interface DataPoint {
    id: string;
    timestamp: number;
    weight?: number;
    intensity?: string;
    [key: string]: any;
}

interface WeatherData {
    temperature?: number;
    rainIntensity: number;
    cloudCover: number;
    windSpeed?: number;
    time: string;
}

interface ForecastData {
    hourly: {
        time: string[];
        precipitation: number[];
        cloudcover: number[];
    };
}

interface Stats {
    total: number;
    average: number;
    highest: DataPoint | null;
}

const AnalisisScreen = () => {
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState<DataPoint[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        average: 0,
        highest: null,
    });
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        datasets: [{ data: [] as number[] }],
    });
    const [insights, setInsights] = useState<string[]>([]);

    // Fetch Open-Meteo weather data
    const fetchWeatherData = async () => {
        try {
            // Yogyakarta location
            const latitude = -7.79;
            const longitude = 110.36;

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?` +
                `latitude=${latitude}&longitude=${longitude}` +
                `&hourly=precipitation,cloudcover` +
                `&timezone=Asia/Jakarta&forecast_days=1`
            );

            const data: ForecastData = await response.json();
            
            if (data.hourly) {
                const weatherArray: WeatherData[] = data.hourly.time.map((time, index) => ({
                    temperature: 25, // Default temperature jika tidak dari API
                    rainIntensity: data.hourly.precipitation[index] || 0,
                    cloudCover: data.hourly.cloudcover[index] || 0,
                    windSpeed: 0,
                    time: time,
                }));

                setWeatherData(weatherArray);
                setCurrentWeather(weatherArray[0]);
                
                // Update chart with weather data
                const labels = weatherArray.slice(0, 12).map(w => moment(w.time).tz('Asia/Jakarta').format('HH:mm'));
                const data_points = weatherArray.slice(0, 12).map(w => w.rainIntensity);
                
                setChartData({
                    labels,
                    datasets: [{ data: data_points }],
                });
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    // Fetch Firebase data
    useEffect(() => {
        const rainpointsRef = ref(database, 'rainpoints/');
        const unsubscribe = onValue(
            rainpointsRef,
            (snapshot) => {
                const data = snapshot.val();
                const dataArray: DataPoint[] = data
                    ? Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }))
                    : [];

                setAllData(dataArray);

                // Calculate stats
                if (dataArray.length > 0) {
                    const total = dataArray.length;
                    const weights = dataArray
                        .map((d) => d.weight || 0)
                        .filter((w) => w > 0);
                    const average = weights.length > 0
                        ? (weights.reduce((a, b) => a + b, 0) / weights.length)
                        : 0;
                    const highest = dataArray.reduce((prev, current) =>
                        ((prev.weight || 0) > (current.weight || 0)) ? prev : current
                    );

                    setStats({ total, average, highest });
                }

                setLoading(false);
            },
            (error) => {
                console.error(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Fetch weather data on component mount
    useEffect(() => {
        fetchWeatherData();
    }, []);

    // Generate insights
    useEffect(() => {
        const newInsights: string[] = [];

        if (currentWeather) {
            if (currentWeather.rainIntensity > 5) {
                newInsights.push('🌧️ Intensitas hujan tinggi terdeteksi saat ini');
            } else if (currentWeather.rainIntensity > 2) {
                newInsights.push('🌦️ Hujan sedang, bawa payung jika bepergian');
            } else if (currentWeather.rainIntensity > 0) {
                newInsights.push('🌧️ Hujan ringan, tidak perlu khawatir');
            } else {
                newInsights.push('☀️ Cuaca cerah, cocok untuk aktivitas outdoor');
            }

            if (currentWeather.cloudCover > 80) {
                newInsights.push('☁️ Liputan awan sangat tinggi');
            }

            if (currentWeather.temperature && currentWeather.temperature > 30) {
                newInsights.push('🌡️ Suhu tinggi, pastikan tetap terhidrasi');
            }
        }

        if (stats.total > 10) {
            newInsights.push(`📊 Total ${stats.total} laporan hujan tercatat`);
        }

        setInsights(newInsights);
    }, [currentWeather, stats]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="stats-chart" size={28} color={Colors.dark.primary} />
                    </View>
                    <Text style={styles.title}>Analisis Cuaca</Text>
                    <Text style={styles.subtitle}>Prediksi 24 Jam</Text>
                </View>

                {/* Current Weather Card */}
                {currentWeather && (
                    <View style={styles.card}>
                        <View style={styles.weatherHeader}>
                            <Text style={styles.weatherTitle}>Kondisi Saat Ini</Text>
                            <Text style={styles.weatherTime}>
                                {moment(currentWeather.time).tz('Asia/Jakarta').format('HH:mm')}
                            </Text>
                        </View>
                        <View style={styles.weatherGrid}>
                            <View style={styles.weatherItem}>
                                <Ionicons name="water-outline" size={24} color={Colors.dark.primary} />
                                <Text style={styles.weatherLabel}>Hujan</Text>
                                <Text style={styles.weatherValue}>{currentWeather.rainIntensity.toFixed(1)} mm</Text>
                            </View>
                            <View style={styles.weatherItem}>
                                <Ionicons name="thermometer-outline" size={24} color={Colors.dark.warning} />
                                <Text style={styles.weatherLabel}>Suhu</Text>
                                <Text style={styles.weatherValue}>{currentWeather.temperature ? currentWeather.temperature.toFixed(1) : '-'}°C</Text>
                            </View>
                            <View style={styles.weatherItem}>
                                <Ionicons name="cloud-outline" size={24} color={Colors.dark.textSecondary} />
                                <Text style={styles.weatherLabel}>Awan</Text>
                                <Text style={styles.weatherValue}>{currentWeather.cloudCover}%</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 24-Hour Rain Trend Chart */}
                <View style={styles.card}>
                    <View style={styles.chartHeader}>
                        <Ionicons name="trending-up" size={20} color={Colors.dark.primary} />
                        <Text style={styles.chartTitle}>Tren Hujan 24 Jam</Text>
                    </View>
                    {chartData.labels.length > 0 ? (
                        <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={darkChartConfig}
                            style={styles.chart}
                            bezier
                            withDots={true}
                            withVerticalLabels={true}
                            fromZero={true}
                        />
                    ) : (
                        <ActivityIndicator size="large" color={Colors.dark.primary} />
                    )}
                </View>

                {/* Insights Section */}
                <View style={styles.card}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.dark.success} />
                        <Text style={styles.insightTitle}>Insight</Text>
                    </View>
                    <View style={styles.insightContent}>
                        {insights.map((insight, index) => (
                            <View key={index} style={styles.insightItem}>
                                <Text style={styles.insightText}>{insight}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Activity Recommendations */}
                <View style={styles.card}>
                    <View style={styles.recommendHeader}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.dark.warning} />
                        <Text style={styles.recommendTitle}>Rekomendasi Aktivitas</Text>
                    </View>
                    <View style={styles.recommendContent}>
                        {currentWeather && currentWeather.rainIntensity > 5 ? (
                            <>
                                <RecommendationItem icon="home" text="Tetap di dalam ruangan" />
                                <RecommendationItem icon="shield" text="Hindari aktivitas di luar" />
                                <RecommendationItem icon="alert-circle" text="Waspadai banjir" />
                            </>
                        ) : currentWeather && currentWeather.rainIntensity > 2 ? (
                            <>
                                <RecommendationItem icon="umbrella" text="Bawa payung atau jas hujan" />
                                <RecommendationItem icon="walk" text="Berjalan dengan hati-hati" />
                                <RecommendationItem icon="car" text="Perjalanan memerlukan waktu lebih" />
                            </>
                        ) : (
                            <>
                                <RecommendationItem icon="sunny" text="Cuaca baik untuk outdoor" />
                                <RecommendationItem icon="bicycle" text="Cocok untuk olahraga" />
                                <RecommendationItem icon="camera" text="Bagus untuk fotografi" />
                            </>
                        )}
                    </View>
                </View>

                {/* Summary Stats */}
                <View style={styles.card}>
                    <View style={styles.statsHeader}>
                        <Ionicons name="calculator-outline" size={20} color={Colors.dark.primary} />
                        <Text style={styles.statsTitle}>Ringkasan Data</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <StatItem label="Total Laporan" value={stats.total.toString()} />
                        <StatItem label="Rata-rata Intensitas" value={stats.average.toFixed(1)} />
                        <StatItem
                            label="Intensitas Tertinggi"
                            value={stats.highest?.intensity || 'N/A'}
                        />
                    </View>
                </View>

                {/* Info Footer */}
                <View style={styles.infoContainer}>
                    <Ionicons name="information-circle-outline" size={14} color={Colors.dark.textSecondary} />
                    <Text style={styles.infoText}>
                        Data cuaca menggunakan API Open-Meteo. Data laporan dari kontribusi pengguna RainSpot.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const RecommendationItem = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.recommendItem}>
        <Ionicons name={icon as any} size={18} color={Colors.dark.primary} />
        <Text style={styles.recommendItemText}>{text}</Text>
    </View>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    contentContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.large,
        backgroundColor: Colors.dark.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    card: {
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.medium,
    },
    weatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    weatherTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    weatherTime: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        backgroundColor: Colors.dark.cardSecondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.small,
    },
    weatherGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    weatherItem: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.dark.cardSecondary,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    weatherLabel: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginTop: Spacing.xs,
    },
    weatherValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginTop: Spacing.xs,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    chart: {
        borderRadius: BorderRadius.small,
        marginVertical: Spacing.md,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    insightContent: {
        gap: Spacing.md,
    },
    insightItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.dark.cardSecondary,
        borderRadius: BorderRadius.small,
        borderLeftWidth: 3,
        borderLeftColor: Colors.dark.primary,
    },
    insightText: {
        fontSize: 13,
        color: Colors.dark.text,
        lineHeight: 18,
    },
    recommendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    recommendTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    recommendContent: {
        gap: Spacing.md,
    },
    recommendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.dark.cardSecondary,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        gap: Spacing.md,
    },
    recommendItemText: {
        fontSize: 13,
        color: Colors.dark.text,
        flex: 1,
    },
    statsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    statItem: {
        flex: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        backgroundColor: Colors.dark.cardSecondary,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xs,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dark.primary,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        gap: Spacing.md,
    },
    infoText: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        flex: 1,
        lineHeight: 16,
    },
});

export default AnalisisScreen;
