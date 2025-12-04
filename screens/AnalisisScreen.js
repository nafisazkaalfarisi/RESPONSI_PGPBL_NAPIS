import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
  Dimensions,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const CATEGORIES = {
  'Tidak Hujan': { color: '#87CEEB', weight: 0 },
  'Hujan Ringan': { color: '#4682B4', weight: 1 },
  'Hujan Sedang': { color: '#1E90FF', weight: 2 },
  'Hujan Lebat': { color: '#0000CD', weight: 3 },
  'Badai': { color: '#8B0000', weight: 4 },
};

// --- AnalisisScreen Component ---
const AnalisisScreen = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({ startDate: null, endDate: null });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('startDate');

  // --- Data Fetching & Processing ---
  useEffect(() => {
    const reportsRef = ref(database, 'rainpoints/');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const reportsArray = data ? Object.keys(data).map(key => ({ ...data[key] })) : [];
      setAllData(reportsArray);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      console.error(error);
    });
    return () => unsubscribe();
  }, []);

  const filteredData = useMemo(() => {
    if (!filters.startDate && !filters.endDate) return allData;
    return allData.filter(item => {
      const isAfterStart = !filters.startDate || item.timestamp >= filters.startDate;
      const isBeforeEnd = !filters.endDate || item.timestamp <= filters.endDate;
      return isAfterStart && isBeforeEnd;
    });
  }, [allData, filters]);

  const processedStats = useMemo(() => {
    if (filteredData.length === 0) return null;

    let totalWeight = 0;
    const categoryCounts = Object.keys(CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {});
    const dailyData = {};
    let highestIntensityDay = { intensity: -1, date: null };

    filteredData.forEach(report => {
      totalWeight += report.weight;
      if (categoryCounts.hasOwnProperty(report.intensity)) {
        categoryCounts[report.intensity]++;
      }

      const date = moment(report.timestamp).format('YYYY-MM-DD');
      if (!dailyData[date]) {
        dailyData[date] = { totalWeight: 0, count: 0 };
      }
      dailyData[date].totalWeight += report.weight;
      dailyData[date].count++;

      if(report.weight > highestIntensityDay.intensity) {
        highestIntensityDay = { intensity: report.weight, date: date };
      }
    });
    
    // LineChart Data
    const sortedDays = Object.keys(dailyData).sort();
    const lineChartLabels = sortedDays.map(date => moment(date).format('DD/MM'));
    const lineChartData = sortedDays.map(date => (dailyData[date].totalWeight / dailyData[date].count).toFixed(2));

    // Perkiraan Cuaca
    const lastTenReports = [...filteredData].sort((a,b) => b.timestamp - a.timestamp).slice(0, 10);
    let weatherPrediction = 'Data tidak cukup';
    if(lastTenReports.length > 0){
        const severeCount = lastTenReports.filter(r => ['Hujan Lebat', 'Badai'].includes(r.intensity)).length;
        const lightCount = lastTenReports.filter(r => ['Hujan Ringan', 'Hujan Sedang'].includes(r.intensity)).length;
        const clearCount = lastTenReports.filter(r => r.intensity === 'Tidak Hujan').length;

        if (severeCount > lightCount && severeCount > clearCount) weatherPrediction = "Hujan lebat kemungkinan terjadi.";
        else if (lightCount > clearCount) weatherPrediction = "Hujan ringan kemungkinan terjadi.";
        else weatherPrediction = "Diperkirakan cerah.";
    }

    return {
      totalReports: filteredData.length,
      averageIntensity: (totalWeight / filteredData.length).toFixed(2),
      categoryCounts,
      highestIntensityDay: highestIntensityDay.date ? `${moment(highestIntensityDay.date).format('DD MMM YYYY')}` : 'N/A',
      pieChartData: Object.keys(categoryCounts).map(cat => ({
        name: cat,
        population: categoryCounts[cat],
        color: CATEGORIES[cat].color,
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      })).filter(d => d.population > 0),
      barChartData: {
        labels: Object.keys(categoryCounts),
        datasets: [{ data: Object.values(categoryCounts) }],
      },
      lineChartData: {
        labels: lineChartLabels,
        datasets: [{ data: lineChartData }],
      },
      weatherPrediction,
    };
  }, [filteredData]);
  
  // --- Handlers ---
  const handleDateConfirm = (date) => {
    setFilters(prev => ({ ...prev, [datePickerTarget]: datePickerTarget === 'startDate' ? moment(date).startOf('day').valueOf() : moment(date).endOf('day').valueOf() }));
    setDatePickerVisibility(false);
  };

  const resetFilters = () => setFilters({ startDate: null, endDate: null });

  if (loading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }
  if (!processedStats) {
    return <View style={styles.center}><Text>Tidak ada data untuk ditampilkan. Coba reset filter.</Text></View>;
  }

  // --- Render ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analisis Laporan Hujan</Text>
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterButton}>🔍 Filter</Text>
        </TouchableOpacity>
      </View>
      
      {/* --- Filter Modal --- */}
      <Modal visible={isFilterVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Data</Text>
            <Button title={filters.startDate ? `Mulai: ${moment(filters.startDate).format('DD/MM/YY')}`: "Pilih Tanggal Mulai"} onPress={() => {setDatePickerTarget('startDate'); setDatePickerVisibility(true);}} />
            <View style={{marginVertical: 5}}/>
            <Button title={filters.endDate ? `Selesai: ${moment(filters.endDate).format('DD/MM/YY')}`: "Pilih Tanggal Selesai"} onPress={() => {setDatePickerTarget('endDate'); setDatePickerVisibility(true);}} />
            <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleDateConfirm} onCancel={() => setDatePickerVisibility(false)} />
            
            <Text style={styles.placeholderTitle}>Filter per Kecamatan (Placeholder)</Text>
            <Picker enabled={false}><Picker.Item label="Data GIS Dibutuhkan" value="" /></Picker>
            
            <View style={styles.modalActions}>
                <Button title="Reset" onPress={resetFilters} color="gray" />
                <Button title="Tutup" onPress={() => setFilterVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Cards --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Statistik Umum</Text>
        <Text>Total Laporan: {processedStats.totalReports}</Text>
        <Text>Rata-rata Intensitas (Weight): {processedStats.averageIntensity}</Text>
        <Text>Puncak Intensitas Terjadi Pada: {processedStats.highestIntensityDay}</Text>
      </View>
      
      <View style={[styles.card, {backgroundColor: '#e3f2fd'}]}>
        <Text style={styles.cardTitle}>Perkiraan Cuaca Sederhana</Text>
        <Text style={styles.predictionText}>{processedStats.weatherPrediction}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribusi Kategori</Text>
        <PieChart data={processedStats.pieChartData} width={screenWidth - 40} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Jumlah Laporan per Kategori</Text>
        <BarChart data={processedStats.barChartData} width={screenWidth - 40} height={250} chartConfig={chartConfig} fromZero yAxisLabel="" yAxisSuffix="" />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tren Intensitas Harian</Text>
        <LineChart data={processedStats.lineChartData} width={screenWidth - 40} height={220} chartConfig={chartConfig} bezier />
      </View>

      <View style={[styles.card, styles.placeholderCard]}>
          <Text style={styles.cardTitle}>Analisis per Kecamatan (Placeholder)</Text>
          <Text>Fitur ini memerlukan data GeoJSON untuk batas wilayah kecamatan. Setelah data tersedia, ranking kecamatan berdasarkan intensitas hujan akan ditampilkan di sini.</Text>
      </View>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  filterButton: { fontSize: 16, color: '#007AFF' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginHorizontal: 10, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  predictionText: { fontSize: 16, fontStyle: 'italic', color: '#0d47a1' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  placeholderCard: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
  placeholderTitle: { fontWeight: 'bold', marginTop: 15, color: '#999' },
});

export default AnalisisScreen;