/**
 * Data Source Service - RainSpot
 * 
 * Abstraction layer untuk mengelola multiple data sources:
 * - MANUAL: Data dari pengisian manual user dengan lokasi saat ini
 * - IOT_SENSOR: Data dari jaringan sensor IoT yang tersebar (coming soon)
 * 
 * Implementasi ini memudahkan switching antar data source tanpa perlu
 * mengubah komponen yang menggunakan data.
 */

export enum DataSource {
  MANUAL = 'manual',
  IOT_SENSOR = 'iot_sensor',
}

export interface RainDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  intensity: string; // 'Tidak Hujan', 'Hujan Ringan', etc.
  weight: number; // 0-4 based on intensity
  kategori?: string | null;
  timestamp: number;
  source: DataSource;
  accuracy?: number; // GPS accuracy in meters (for manual)
  sensorId?: string; // Sensor ID (for IoT)
  deviceName?: string; // Nama device sensor (for IoT)
}

export interface DataSourceConfig {
  activeSource: DataSource;
  allowedSources: DataSource[];
  manualConfig: {
    enabled: boolean;
    requireCurrentLocation: boolean;
  };
  iotConfig: {
    enabled: boolean;
    apiEndpoint?: string;
    refreshInterval?: number; // ms
  };
}

class DataSourceService {
  private activeSource: DataSource = DataSource.MANUAL;
  private config: DataSourceConfig;

  constructor(initialConfig?: Partial<DataSourceConfig>) {
    this.config = {
      activeSource: DataSource.MANUAL,
      allowedSources: [DataSource.MANUAL, DataSource.IOT_SENSOR],
      manualConfig: {
        enabled: true,
        requireCurrentLocation: true,
      },
      iotConfig: {
        enabled: false, // Akan diaktifkan nanti saat IoT siap
        apiEndpoint: process.env.EXPO_PUBLIC_IOT_API_ENDPOINT,
        refreshInterval: 5 * 60 * 1000, // 5 menit default
      },
      ...initialConfig,
    };

    this.activeSource = this.config.activeSource;
  }

  /**
   * Set data source yang aktif
   */
  setActiveSource(source: DataSource): void {
    if (!this.config.allowedSources.includes(source)) {
      throw new Error(`Data source ${source} tidak diizinkan`);
    }
    if (source === DataSource.IOT_SENSOR && !this.config.iotConfig.enabled) {
      throw new Error('IoT sensor belum tersedia');
    }
    this.activeSource = source;
  }

  /**
   * Get data source yang sedang aktif
   */
  getActiveSource(): DataSource {
    return this.activeSource;
  }

  /**
   * Get konfigurasi saat ini
   */
  getConfig(): DataSourceConfig {
    return { ...this.config };
  }

  /**
   * Check apakah IoT sensor sudah available
   */
  isIoTSensorAvailable(): boolean {
    return this.config.iotConfig.enabled;
  }

  /**
   * Check apakah manual input tersedia
   */
  isManualInputAvailable(): boolean {
    return this.config.manualConfig.enabled;
  }

  /**
   * Update konfigurasi IoT (akan digunakan nanti)
   */
  updateIoTConfig(newConfig: Partial<DataSourceConfig['iotConfig']>): void {
    this.config.iotConfig = {
      ...this.config.iotConfig,
      ...newConfig,
    };
  }

  /**
   * Get metadata tentang data source (untuk UI)
   */
  getSourceMetadata(source: DataSource): {
    label: string;
    description: string;
    icon: string;
    isAvailable: boolean;
    isBeta?: boolean;
    comingSoon?: boolean;
  } {
    switch (source) {
      case DataSource.MANUAL:
        return {
          label: 'Input Manual',
          description: 'Data dari pengisian manual dengan lokasi saat ini',
          icon: 'hand-left-outline',
          isAvailable: this.config.manualConfig.enabled,
        };
      case DataSource.IOT_SENSOR:
        return {
          label: 'Jaringan Sensor IoT',
          description: 'Data real-time dari sensor yang tersebar di berbagai lokasi',
          icon: 'radio-outline',
          isAvailable: this.config.iotConfig.enabled,
          comingSoon: !this.config.iotConfig.enabled,
          isBeta: true,
        };
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
  }
}

// Export singleton instance
export const dataSourceService = new DataSourceService();

export default dataSourceService;
