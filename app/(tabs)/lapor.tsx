import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { push, ref } from 'firebase/database';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper'; // Import useTheme
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '../../components/themed-react';
import { database } from '../../firebaseConfig';

import { Colors } from '@/constants/theme'; // Import global Colors

const { width } = Dimensions.get('window');

type LocationType = {
  latitude: number;
  longitude: number;
};

const LaporScreen: FC = () => {
  const theme = useTheme(); // Get the theme object
  const { colors } = theme; // Destructure colors for convenience
  const styles = getStyles(colors); // Initialize styles with colors

  const [location, setLocation] = useState<LocationType | null>(null);
  const [selectedRainIntensity, setSelectedRainIntensity] = useState<string>('');
  const [selectedHazardCategory, setSelectedHazardCategory] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'fetched' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [rainDropdownVisible, setRainDropdownVisible] = useState(false);
  const [hazardDropdownVisible, setHazardDropdownVisible] = useState(false);
  const [customHazardModalVisible, setCustomHazardModalVisible] = useState(false);
  const [customHazardInput, setCustomHazardInput] = useState<string>('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi Diperlukan', 'Aplikasi memerlukan akses lokasi untuk melaporkan kejadian.');
        setLocationStatus('error');
        setPermissionGranted(false);
      } else {
        setPermissionGranted(true);
        setLocationStatus('idle');
      }
    })();
  }, []);

  const handleGetLocation = async () => {
    if (!permissionGranted) {
      Alert.alert('Izin Ditolak', 'Berikan izin akses lokasi di pengaturan aplikasi.');
      return;
    }

    setLocationStatus('fetching');
    try {
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setLocationStatus('fetched');
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Gagal Mendapatkan Lokasi', 'Pastikan GPS aktif dan coba lagi.');
      setLocationStatus('error');
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Lokasi Tidak Tersedia', 'Silakan tampilkan lokasi Anda terlebih dahulu.');
      return;
    }
    if (!selectedRainIntensity && !selectedHazardCategory) {
      Alert.alert('Data Tidak Lengkap', 'Pilih minimal intensitas hujan atau kategori kejadian berbahaya.');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate weight based on intensity
      const intensityWeightMap: Record<string, number> = {
        'Tidak Hujan': 0,
        'Hujan Ringan': 1,
        'Hujan Sedang': 2,
        'Hujan Lebat': 3,
        'Badai': 4,
      };
      
      const weight = intensityWeightMap[selectedRainIntensity] || 0;

      await push(ref(database, 'rainpoints'), {
        latitude: location.latitude,
        longitude: location.longitude,
        intensity: selectedRainIntensity || 'Tidak Hujan',
        weight: weight,
        kategori: selectedHazardCategory || null,
        timestamp: Date.now(),
      });
      
      Alert.alert(
        '✓ Laporan Terkirim!',
        'Terima kasih telah melaporkan. Data Anda membantu menjaga keselamatan bersama.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedRainIntensity('');
              setSelectedHazardCategory('');
              setLocation(null);
              setLocationStatus('idle');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Gagal Mengirim', 'Terjadi kesalahan. Periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const rainIntensityOptions = [
    { label: 'Pilih Intensitas Hujan', value: '' },
    { label: 'Tidak Hujan', value: 'Tidak Hujan' },
    { label: 'Hujan Ringan', value: 'Hujan Ringan' },
    { label: 'Hujan Sedang', value: 'Hujan Sedang' },
    { label: 'Hujan Lebat', value: 'Hujan Lebat' },
    { label: 'Badai', value: 'Badai' },
  ];

  const hazardOptions = [
    { label: 'Pilih Kategori Kejadian', value: '' },
    { label: 'Pohon Tumbang', value: 'Pohon Tumbang' },
    { label: 'Banjir', value: 'Banjir' },
    { label: 'Tanah Longsor', value: 'Tanah Longsor' },
    { label: 'Angin Kencang', value: 'Angin Kencang' },
    { label: 'Jalan Berlumpur', value: 'Jalan Berlumpur' },
    { label: 'Rawan Tanah Longsor', value: 'Rawan Tanah Longsor' },
    { label: 'Drainase Tersumbat', value: 'Drainase Tersumbat' },
    { label: 'Kawasan Rawan Banjir', value: 'Kawasan Rawan Banjir' },
    { label: 'Lainnya', value: 'CUSTOM' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={28} color={Colors.dark.warning} />
          </View>
          <Text style={styles.title}>Lapor Kejadian</Text>
          <Text style={styles.subtitle}>
            Laporkan kondisi cuaca dan kejadian berbahaya di sekitar Anda
          </Text>
        </View>

        {/* Location Card with Map */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Lokasi Anda</Text>
          </View>

          {locationStatus === 'fetched' && location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                customMapStyle={darkMapStyle}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  pinColor={colors.error}
                />
              </MapView>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleGetLocation}
            loading={locationStatus === 'fetching'}
            disabled={locationStatus === 'fetching' || !permissionGranted}
            style={styles.locationButton}
            labelStyle={styles.buttonLabel}
            icon={() => <Ionicons name="navigate" size={16} color={colors.onPrimary} />}
          >
            {locationStatus === 'fetching' ? 'Mencari Lokasi...' : 'Tampilkan Lokasi Saat Ini'}
          </Button>

          {locationStatus === 'fetched' && location && (
            <View style={styles.locationDisplay}>
              <View style={styles.locationRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.dark.success} />
                <Text style={styles.locationLabel}>Lokasi Terdeteksi</Text>
              </View>
              <View style={styles.coordsContainer}>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Lat:</Text>
                  <Text style={styles.coordsText}>{location.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Lng:</Text>
                  <Text style={styles.coordsText}>{location.longitude.toFixed(6)}</Text>
                </View>
              </View>
            </View>
          )}

          {locationStatus === 'error' && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>
                Gagal mendapatkan lokasi. Periksa izin dan GPS.
              </Text>
            </View>
          )}
        </View>

        {/* Rain Intensity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="rainy" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Intensitas Hujan</Text>
          </View>
          <Text style={styles.cardDescription}>
            Pilih kondisi hujan saat ini di lokasi Anda
          </Text>

          <Pressable
            onPress={() => setRainDropdownVisible(true)}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedRainIntensity || 'Pilih Intensitas Hujan'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Hazard Category Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Kejadian Berbahaya</Text>
          </View>
          <Text style={styles.cardDescription}>
            Laporkan kejadian berbahaya yang Anda temui
          </Text>

          <Pressable
            onPress={() => setHazardDropdownVisible(true)}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedHazardCategory || 'Pilih Kategori Kejadian'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting || locationStatus !== 'fetched' || (!selectedRainIntensity && !selectedHazardCategory)}
          style={({ pressed }) => [
            styles.submitButton,
            (submitting || locationStatus !== 'fetched' || (!selectedRainIntensity && !selectedHazardCategory)) && styles.submitButtonDisabled,
            pressed && styles.submitButtonPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.onPrimary} style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>Kirim Laporan</Text>
            </>
          )}
        </Pressable>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color={Colors.dark.textSecondary} />
          <Text style={styles.infoText}>
            Laporan Anda akan membantu masyarakat untuk waspada terhadap kondisi cuaca dan bahaya di sekitar.
          </Text>
        </View>

        {/* Rain Intensity Dropdown Modal */}
        <Modal
          visible={rainDropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRainDropdownVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setRainDropdownVisible(false)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Pilih Intensitas Hujan</Text>
                <Pressable onPress={() => setRainDropdownVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {rainIntensityOptions.slice(1).map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSelectedRainIntensity(item.value);
                      setRainDropdownVisible(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      selectedRainIntensity === item.value && styles.dropdownItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedRainIntensity === item.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedRainIntensity === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Hazard Category Dropdown Modal */}
        <Modal
          visible={hazardDropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setHazardDropdownVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setHazardDropdownVisible(false)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Pilih Kategori Kejadian</Text>
                <Pressable onPress={() => setHazardDropdownVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {hazardOptions.slice(1).map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      if (item.value === 'CUSTOM') {
                        setCustomHazardInput('');
                        setCustomHazardModalVisible(true);
                        setHazardDropdownVisible(false);
                      } else {
                        setSelectedHazardCategory(item.value);
                        setHazardDropdownVisible(false);
                      }
                    }}
                    style={[
                      styles.dropdownItem,
                      selectedHazardCategory === item.value && styles.dropdownItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedHazardCategory === item.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedHazardCategory === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Custom Hazard Input Modal */}
        <Modal
          visible={customHazardModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCustomHazardModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setCustomHazardModalVisible(false)}
          >
            <View style={styles.customModalContent}>
              <View style={styles.customModalHeader}>
                <Text style={styles.customModalTitle}>Masukkan Kejadian Lainnya</Text>
              </View>
              <TextInput
                style={styles.customInput}
                placeholder="Deskripsi kejadian berbahaya"
                placeholderTextColor={Colors.dark.textSecondary}
                value={customHazardInput}
                onChangeText={setCustomHazardInput}
                maxLength={100}
                multiline
              />
              <View style={styles.customModalActions}>
                <Pressable
                  onPress={() => setCustomHazardModalVisible(false)}
                  style={styles.customModalButton}
                >
                  <Text style={styles.customModalButtonText}>Batal</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (customHazardInput.trim()) {
                      setSelectedHazardCategory(customHazardInput.trim());
                      setCustomHazardModalVisible(false);
                      setCustomHazardInput('');
                    } else {
                      Alert.alert('Validasi', 'Silakan masukkan deskripsi kejadian.');
                    }
                  }}
                  style={[styles.customModalButton, styles.customModalButtonConfirm]}
                >
                  <Text style={styles.customModalButtonConfirmText}>Simpan</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Coming Soon Modal for IoT Sensor */}
        <ComingSoonModal
          visible={comingSoonModalVisible}
          onClose={() => setComingSoonModalVisible(false)}
          title="Jaringan Sensor IoT"
          description="Fitur pengumpulan data real-time dari jaringan sensor yang tersebar sedang dalam pengembangan."
          icon="radio-outline"
          features={[
            'Data real-time dari multiple sensor',
            'Cakupan area yang lebih luas',
            'Akurasi tinggi tanpa input manual',
            'Automatic data aggregation',
          ]}
          eta="Segera Hadir - Q1 2026"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Dark Map Style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: colors.background, // Ensure container background matches theme
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface, // Card background for icon container
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.onSurface, // Text color on surface
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 19,
  },
  card: {
    backgroundColor: colors.surface, // Card background
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.shadow, // Use dark theme shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  dataSourceContainer: {
    marginBottom: 16,
    gap: 12,
  },
  dataSourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.cardSecondary,
    marginBottom: 8,
  },
  dataSourceOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  dataSourceOptionDisabled: {
    opacity: 0.6,
  },
  dataSourceIcon: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataSourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dataSourceDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  comingSoonBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.dark.warning,
    borderRadius: 6,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dataSourceHelperText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 4,
    elevation: 0,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: colors.onPrimary, // Text color on primary button
  },
  locationDisplay: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.dark.cardSecondary, // Lighter card background
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.success,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.success,
    marginLeft: 6,
  },
  coordsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginRight: 4,
  },
  coordsText: {
    fontSize: 12,
    color: colors.onSurface,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 69, 58, 0.1)', // Using rgba for transparency
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  pickerContainer: {
    borderColor: Colors.dark.border,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.dark.cardSecondary, // Lighter card background
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.onSurface, // Text color on surface
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.cardSecondary,
    gap: 6,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.cardSecondary,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    maxHeight: '70%',
    width: '85%',
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  customModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    gap: 16,
  },
  customModalHeader: {
    marginBottom: 8,
  },
  customModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
  },
  customInput: {
    backgroundColor: Colors.dark.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.onSurface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  customModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    backgroundColor: Colors.dark.cardSecondary,
  },
  customModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  customModalButtonConfirm: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  customModalButtonConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.dark.border,
    opacity: 0.5,
  },
  submitButtonPressed: {
    backgroundColor: colors.primary,
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default LaporScreen