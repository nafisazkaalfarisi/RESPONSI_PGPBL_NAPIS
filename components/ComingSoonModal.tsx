import { Text } from '@/components/themed-react';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: string;
  features?: string[];
  eta?: string;
}

/**
 * Reusable Coming Soon Modal Component
 * 
 * Digunakan untuk menampilkan fitur yang sedang dalam pengembangan
 * dengan cara yang menarik dan informatif.
 */
export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  visible,
  onClose,
  title = 'Fitur Akan Datang',
  description = 'Fitur ini sedang dalam pengembangan dan akan segera tersedia.',
  icon = 'rocket-outline',
  features = [],
  eta = 'Segera Hadir',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => {
            // Prevent closing modal when tapping inside
          }}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon as any}
                size={48}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {/* Features List */}
            {features.length > 0 && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Yang akan datang:</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ETA */}
            <View style={styles.etaContainer}>
              <Ionicons
                name="hourglass-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.etaText}>{eta}</Text>
            </View>

            {/* Close Button */}
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </Pressable>
          </View>

          {/* Footer with Decoration */}
          <View style={styles.footer}>
            <View style={styles.decoration} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStyles = (colors: typeof Colors.dark) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },

  featuresContainer: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  featuresTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  featureText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.warning}15`,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },

  etaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },

  closeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  footer: {
    height: 4,
    backgroundColor: colors.primary,
  },

  decoration: {
    height: 4,
    backgroundColor: colors.primary,
  },
});

export default ComingSoonModal;
