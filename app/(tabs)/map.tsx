// screens/map.tsx (Dark Theme)
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { onValue, ref } from 'firebase/database';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BorderRadius, Colors, darkMapStyle, Shadows, Spacing } from '../../constants/theme';
import { database } from '../../firebaseConfig';

const screenWidth = Dimensions.get('window').width;

interface RainPoint {
  id: string;
  latitude: number;
  longitude: number;
  intensity: string;
  weight: number;
  timestamp: number;
}

const CATEGORIES = {
  'Tidak Hujan': { color: 'rgba(50, 215, 75, 0.4)', weight: 0 },
  'Hujan Ringan': { color: 'rgba(74, 158, 255, 0.5)', weight: 1 },
  'Hujan Sedang': { color: 'rgba(255, 214, 10, 0.6)', weight: 2 },
  'Hujan Lebat': { color: 'rgba(255, 149, 0, 0.7)', weight: 3 },
  'Badai': { color: 'rgba(255, 69, 58, 0.8)', weight: 4 },
};

const getCategoryStyle = (intensity: string) => {
  const normalizedIntensity = intensity?.trim() || 'Tidak Hujan';
  const style = (CATEGORIES as Record<string, any>)[normalizedIntensity];
  if (!style) {
    console.warn(`Intensity not found: "${intensity}", using default "Tidak Hujan"`);
    return CATEGORIES['Tidak Hujan'];
  }
  return style;
};

const getActivityRecommendation = (intensity: string) => {
  switch (intensity) {
    case 'Hujan Sedang': return '⚠️ Gunakan payung atau jas hujan jika bepergian.';
    case 'Hujan Lebat': return '🚨 Waspada genangan air. Hindari perjalanan jika tidak mendesak.';
    case 'Badai': return '⛔ Sangat disarankan tetap di dalam ruangan yang aman.';
    default: return '✓ Aktivitas di luar ruangan relatif aman.';
  }
};

// Calculate adaptive heatmap radius based on data density only
// Radius in meters: 300-1000m depending on density
// Tetap konsisten regardless of zoom level
const calculateAdaptiveRadius = (points: RainPoint[]): number => {
  if (points.length === 0) return 1000; // Default fallback

  // Calculate average distance between closest neighbors
  let totalMinDistances = 0;
  const sampleSize = Math.min(points.length, 30); // Sample points for performance

  for (let i = 0; i < sampleSize; i++) {
    let minDistance = Infinity;
    const point = points[i];

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const otherPoint = points[j];
        // Haversine formula for distance in meters
        const R = 6371000; // Earth radius in meters
        const lat1 = (point.latitude * Math.PI) / 180;
        const lat2 = (otherPoint.latitude * Math.PI) / 180;
        const dLat = ((otherPoint.latitude - point.latitude) * Math.PI) / 180;
        const dLng = ((otherPoint.longitude - point.longitude) * Math.PI) / 180;
        
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < minDistance && distance > 0) {
          minDistance = distance;
        }
      }
    }

    if (minDistance !== Infinity) {
      totalMinDistances += minDistance;
    }
  }

  const avgMinDistance = totalMinDistances / sampleSize;

  // Adaptive logic based on data density only:
  // Dense areas (< 300m avg distance): use smaller radius (300-500m)
  // Moderate areas (300-500m avg distance): use medium radius (500-700m)
  // Sparse areas (> 500m avg distance): use larger radius (800-1000m)
  
  if (avgMinDistance < 300) {
    return 500; // Very dense clustering
  } else if (avgMinDistance < 500) {
    return 700; // Moderate density
  } else {
    return 1000; // Sparse data
  }
};

const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [allPoints, setAllPoints] = useState<RainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // State untuk UI Interaktif
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isLayerControlVisible, setLayerControlVisible] = useState(false);
  const [isLegendVisible, setLegendVisible] = useState(true);
  
  // State untuk Pengaturan Filter
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    intensities: Object.keys(CATEGORIES),
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('startDate');

  // State untuk Visibilitas Layer
  const [layers, setLayers] = useState({
    heatmap: true,
    markers: true,
  });
  const [currentZoom, setCurrentZoom] = useState(12);

  useEffect(() => {
    const pointsRef = ref(database, 'rainpoints');
    const unsubscribe = onValue(
      pointsRef,
      (snapshot) => {
        const data = snapshot.val();
        const pointsArray: RainPoint[] = data
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
              latitude: data[key].latitude || data[key].lat,
              longitude: data[key].longitude || data[key].lng,
            }))
          : [];
        setAllPoints(pointsArray);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          // Zoom to user location
          mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }
    })();
  }, []);

  const filteredPoints = useMemo(() => {
    return allPoints.filter((point) => {
      const isAfterStartDate = !filters.startDate || point.timestamp >= filters.startDate;
      const isBeforeEndDate = !filters.endDate || point.timestamp <= filters.endDate;
      const normalizedIntensity = point.intensity?.trim() || 'Tidak Hujan';
      const hasIntensity = filters.intensities.includes(normalizedIntensity);
      return isAfterStartDate && isBeforeEndDate && hasIntensity;
    });
  }, [allPoints, filters]);

  // Calculate adaptive heatmap radius based on filtered points density
  // Radius tetap konsisten regardless of zoom level
  const adaptiveHeatmapRadius = useMemo(() => {
    return calculateAdaptiveRadius(filteredPoints);
  }, [filteredPoints]);

  const handleZoomToUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Izin akses lokasi ditolak!');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const showDatePicker = (target: 'startDate' | 'endDate') => {
    setDatePickerTarget(target);
    setDatePickerVisibility(true);
  };

  const handleDateConfirm = (date: Date) => {
    setFilters((prev) => ({
      ...prev,
      [datePickerTarget]:
        datePickerTarget === 'startDate'
          ? moment(date).startOf('day').valueOf()
          : moment(date).endOf('day').valueOf(),
    }));
    setDatePickerVisibility(false);
  };

  const toggleIntensityFilter = (intensity: string) => {
    setFilters((prev) => {
      const newIntensities = prev.intensities.includes(intensity)
        ? prev.intensities.filter((i) => i !== intensity)
        : [...prev.intensities, intensity];
      return { ...prev, intensities: newIntensities };
    });
  };

  const resetFilters = () => {
    setFilters({ startDate: null, endDate: null, intensities: Object.keys(CATEGORIES) });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -7.7956,
          longitude: 110.3695,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        customMapStyle={darkMapStyle}
        onRegionChangeComplete={(region) => {
          // Track zoom level for potential future use
          // Zoom level approximation: zoom = log2(360 / latitudeDelta)
          const zoom = Math.log2(360 / region.latitudeDelta);
          setCurrentZoom(Math.round(zoom));
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Lokasi Anda"
            description="Posisi pengguna saat ini"
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            {/* Custom marker for user location like Google Maps */}
            <View style={styles.userLocationMarkerContainer}>
              {/* Outer ring */}
              <View style={styles.userLocationRing} />
              {/* Inner circle with directional indicator */}
              <View style={styles.userLocationCircle}>
                <View style={styles.userLocationDirectionPointer} />
              </View>
            </View>
          </Marker>
        )}

        {layers.heatmap &&
          filteredPoints.map((point) => (
            <React.Fragment key={point.id}>
              <Circle
                center={{ latitude: point.latitude, longitude: point.longitude }}
                radius={adaptiveHeatmapRadius}
                fillColor={getCategoryStyle(point.intensity).color}
                strokeWidth={0}
                strokeColor="transparent"
              />
              {layers.markers && (
                <Marker
                  coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                  tracksViewChanges={false}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.markerDot} />
                  <Callout tooltip style={styles.callout}>
                    <View style={styles.calloutView}>
                      <View style={styles.calloutHeader}>
                        <Ionicons name="rainy" size={20} color={Colors.dark.primary} />
                        <Text style={styles.calloutTitle}>{point.intensity}</Text>
                      </View>
                      <View style={styles.calloutDivider} />
                      <View style={styles.calloutRow}>
                        <Ionicons name="time-outline" size={14} color={Colors.dark.textSecondary} />
                        <Text style={styles.calloutText}>
                          {moment(point.timestamp).format('DD MMM YYYY, HH:mm')}
                        </Text>
                      </View>
                      <View style={styles.calloutRow}>
                        <Ionicons name="location-outline" size={14} color={Colors.dark.textSecondary} />
                        <Text style={styles.calloutText}>
                          {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                        </Text>
                      </View>
                      <View style={styles.recommendationContainer}>
                        <Text style={styles.calloutRecommendation}>
                          {getActivityRecommendation(point.intensity)}
                        </Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              )}
            </React.Fragment>
          ))}
      </MapView>

      {/* Top Right Buttons */}
      <View style={styles.topRightButtons}>
        <TouchableOpacity style={styles.mapButton} onPress={handleZoomToUserLocation}>
          <Ionicons name="navigate" size={22} color={Colors.dark.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter" size={22} color={Colors.dark.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={() => setLayerControlVisible(true)}>
          <Ionicons name="layers" size={22} color={Colors.dark.primary} />
        </TouchableOpacity>
      </View>

      {/* Legend - Collapsible */}
      <View style={styles.legendContainer}>
        <TouchableOpacity
          style={styles.legendHeader}
          onPress={() => setLegendVisible(!isLegendVisible)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLegendVisible ? 'chevron-down' : 'chevron-forward'}
            size={14}
            color={Colors.dark.primary}
          />
          <Text style={styles.legendTitle}>Legenda</Text>
        </TouchableOpacity>
        {isLegendVisible && (
          <View style={styles.legendContent}>
            {Object.entries(CATEGORIES).map(([name, { color }]) => (
              <View key={name} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: color }]} />
                <Text style={styles.legendText} numberOfLines={1}>{name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Data</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Rentang Tanggal</Text>
              <View style={styles.dateButtonsContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => showDatePicker('startDate')}
                >
                  <Ionicons name="calendar-outline" size={18} color={Colors.dark.primary} />
                  <Text style={styles.dateButtonText}>
                    {filters.startDate ? moment(filters.startDate).format('DD/MM/YY') : 'Tgl Mulai'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => showDatePicker('endDate')}
                >
                  <Ionicons name="calendar-outline" size={18} color={Colors.dark.primary} />
                  <Text style={styles.dateButtonText}>
                    {filters.endDate ? moment(filters.endDate).format('DD/MM/YY') : 'Tgl Selesai'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>Intensitas Hujan</Text>
              <View style={styles.intensityFilterContainer}>
                {Object.keys(CATEGORIES).map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.intensityChip,
                      filters.intensities.includes(name) && styles.intensityChipSelected,
                    ]}
                    onPress={() => toggleIntensityFilter(name)}
                  >
                    <Text
                      style={[
                        styles.intensityChipText,
                        filters.intensities.includes(name) && styles.intensityChipTextSelected,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Ionicons name="refresh" size={18} color={Colors.dark.error} />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setFilterVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Terapkan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        isDarkModeEnabled={true}
      />

      {/* Layer Control Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLayerControlVisible}
        onRequestClose={() => setLayerControlVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kontrol Layer</Text>
              <TouchableOpacity onPress={() => setLayerControlVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.layerRow}>
              <View style={styles.layerInfo}>
                <Ionicons name="water" size={20} color={Colors.dark.primary} />
                <Text style={styles.layerText}>Heatmap Hujan</Text>
              </View>
              <Switch
                value={layers.heatmap}
                onValueChange={(v) => setLayers((p) => ({ ...p, heatmap: v }))}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor={Colors.dark.text}
              />
            </View>

            <View style={styles.layerRow}>
              <View style={styles.layerInfo}>
                <Ionicons name="location" size={20} color={Colors.dark.primary} />
                <Text style={styles.layerText}>Marker Lokasi</Text>
              </View>
              <Switch
                value={layers.markers}
                onValueChange={(v) => setLayers((p) => ({ ...p, markers: v }))}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor={Colors.dark.text}
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLayerControlVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  map: { ...StyleSheet.absoluteFillObject },
  userLocationMarkerContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(74, 158, 255, 0.3)',
  },
  userLocationCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  userLocationDirectionPointer: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.primary,
    borderWidth: 2,
    borderColor: Colors.dark.text,
  },
  callout: { width: screenWidth * 0.7 },
  calloutView: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...Shadows.medium,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.dark.text,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.sm,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  calloutText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  recommendationContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: BorderRadius.small,
  },
  calloutRecommendation: {
    fontStyle: 'italic',
    fontSize: 12,
    color: Colors.dark.text,
  },
  topRightButtons: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: Spacing.sm,
  },
  mapButton: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...Shadows.medium,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    maxWidth: 250,
    maxHeight: 280,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  legendTitle: {
    fontWeight: '600',
    fontSize: 12,
    color: Colors.dark.text,
  },
  legendContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.dark.border,
    opacity: 0.8,
  },
  legendText: {
    fontSize: 9,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.dark.modalBackground,
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  dateButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 13,
    color: Colors.dark.text,
  },
  intensityFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  intensityChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xlarge,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  intensityChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  intensityChipText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  intensityChipTextSelected: {
    color: Colors.dark.onPrimary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
    paddingVertical: 14,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.dark.error,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 15,
    color: Colors.dark.error,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    color: Colors.dark.onPrimary,
    fontWeight: '600',
  },
  layerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  layerText: {
    fontSize: 15,
    color: Colors.dark.text,
  },
  closeButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  closeButtonText: {
    fontSize: 15,
    color: Colors.dark.onPrimary,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.dark.text,
  },
});

export default MapScreen;