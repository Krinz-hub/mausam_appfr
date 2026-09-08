import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../design';
import { useLocationStore } from '../../state/useLocationStore';
import { CitySearchResult } from '../../services/location/locationService';
import { DEFAULT_INDIAN_LOCATIONS } from '../../services/weather/openMeteoProvider';
import { audioManager } from '../../services/audio/audioManager';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
}

const POPULAR_HUBS = [
  { name: 'New Delhi (NCR)', latitude: 28.6139, longitude: 77.209 },
  { name: 'Mumbai, Maharashtra', latitude: 19.076, longitude: 72.8777 },
  { name: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata, West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Hyderabad, Telangana', latitude: 17.385, longitude: 78.4867 },
  { name: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Chandigarh, Punjab', latitude: 30.7333, longitude: 76.7794 },
  { name: 'Jaipur, Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Lucknow, Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
];

export const LocationModal: React.FC<LocationModalProps> = ({ visible, onClose }) => {
  const theme = useTheme();
  const {
    location,
    isLocating,
    detectLocation,
    detectIpLocation,
    setLocation,
    searchCities,
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleGpsDetect = async () => {
    audioManager.play('selection');
    await detectLocation();
    audioManager.play('success');
    onClose();
  };

  const handleIpDetect = async () => {
    audioManager.play('selection');
    await detectIpLocation();
    audioManager.play('success');
    onClose();
  };

  const handleSelectCity = async (name: string, lat: number, lon: number) => {
    audioManager.play('selection');
    await setLocation({ name, latitude: lat, longitude: lon }, true);
    audioManager.play('success');
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderTopLeftRadius: theme.radius.cardLarge,
              borderTopRightRadius: theme.radius.cardLarge,
              borderColor: theme.colors.border,
              ...theme.shadows.cardSelected,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text
                style={[
                  styles.sheetTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.headline,
                    fontWeight: theme.typography.weights.heavy,
                  },
                ]}
              >
                Choose Location
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.colors.textSecondary }]}>
                Current: {location.name} {location.isPrecise ? '🎯 (GPS locked)' : '🌐 (Estimated)'}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close location picker"
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.backgroundCardMuted },
              ]}
            >
              <Text style={[styles.closeIcon, { color: theme.colors.textPrimary }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Quick Auto-Detect Buttons */}
            <View style={styles.detectActionsRow}>
              <Pressable
                onPress={handleGpsDetect}
                disabled={isLocating}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Acquire live GPS location"
                style={[
                  styles.detectButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                {isLocating ? (
                  <ActivityIndicator color={theme.colors.textInverse} size="small" />
                ) : (
                  <>
                    <Text style={styles.detectButtonIcon}>🎯</Text>
                    <Text
                      style={[
                        styles.detectButtonText,
                        { color: theme.colors.textInverse, fontWeight: theme.typography.weights.bold },
                      ]}
                    >
                      Use GPS Location
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleIpDetect}
                disabled={isLocating}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Detect location via network IP"
                style={[
                  styles.detectButtonSecondary,
                  {
                    backgroundColor: theme.colors.backgroundCardMuted,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={styles.detectButtonIcon}>🌐</Text>
                <Text
                  style={[
                    styles.detectButtonTextSecondary,
                    { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.medium },
                  ]}
                >
                  Network / IP
                </Text>
              </Pressable>
            </View>

            {/* City Search Bar */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: theme.colors.backgroundSky,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search city, town or district..."
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.searchInput,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.body,
                  },
                ]}
                autoCapitalize="words"
                returnKeyType="search"
              />
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
              )}
              {searchQuery.length > 0 && !isSearching && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                  <Text style={[styles.clearSearch, { color: theme.colors.textMuted }]}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.resultsList}>
                <Text
                  style={[
                    styles.sectionHeading,
                    {
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.sizes.caption,
                      fontWeight: theme.typography.weights.semibold,
                    },
                  ]}
                >
                  Search Results
                </Text>
                {searchResults.map((item) => {
                  const label = item.region
                    ? `${item.name}, ${item.region}`
                    : `${item.name}, ${item.country}`;
                  return (
                    <Pressable
                      key={`${item.id}-${item.latitude}`}
                      onPress={() => handleSelectCity(label, item.latitude, item.longitude)}
                      style={[
                        styles.resultRow,
                        {
                          borderBottomColor: theme.colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={styles.resultPin}>📍</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.resultName,
                            { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={[styles.resultRegion, { color: theme.colors.textSecondary }]}>
                          {item.region ? `${item.region}, ` : ''}{item.country}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Popular Hubs */}
            <View style={styles.popularSection}>
              <Text
                style={[
                  styles.sectionHeading,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.caption,
                    fontWeight: theme.typography.weights.semibold,
                  },
                ]}
              >
                Popular Hubs
              </Text>
              <View style={styles.hubsWrap}>
                {POPULAR_HUBS.map((hub) => {
                  const isCurrent =
                    Math.abs(location.latitude - hub.latitude) < 0.05 &&
                    Math.abs(location.longitude - hub.longitude) < 0.05;

                  return (
                    <Pressable
                      key={hub.name}
                      onPress={() => handleSelectCity(hub.name, hub.latitude, hub.longitude)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${hub.name}`}
                      style={[
                        styles.hubChip,
                        {
                          backgroundColor: isCurrent
                            ? theme.colors.primaryLight
                            : theme.colors.backgroundCardMuted,
                          borderColor: isCurrent
                            ? theme.colors.borderSelected
                            : theme.colors.border,
                          borderRadius: theme.radius.pill,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.hubText,
                          {
                            color: isCurrent
                              ? theme.colors.primaryDark
                              : theme.colors.textPrimary,
                            fontWeight: isCurrent
                              ? theme.typography.weights.bold
                              : theme.typography.weights.medium,
                          },
                        ]}
                      >
                        {isCurrent ? '✓ ' : ''}{hub.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '85%',
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  detectActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  detectButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  detectButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  detectButtonText: {
    fontSize: 13,
  },
  detectButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  detectButtonTextSecondary: {
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  clearSearch: {
    fontSize: 14,
    paddingHorizontal: 6,
  },
  sectionHeading: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  resultsList: {
    marginBottom: 18,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  resultPin: {
    fontSize: 16,
    marginRight: 10,
  },
  resultName: {
    fontSize: 14,
  },
  resultRegion: {
    fontSize: 12,
    marginTop: 1,
  },
  popularSection: {
    marginTop: 6,
  },
  hubsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hubChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  hubText: {
    fontSize: 12,
  },
});
