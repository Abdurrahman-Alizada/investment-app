import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../../constants/Colors';
import {AD_PERFORMANCE, AD_CONFIG, isAdTestMode} from '../../ads/adsConfig';

const AdDebugPanel = ({visible, onClose, interstitialStats, rewardedStats}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 2000); // Refresh every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [visible]);

  const adStats = AD_PERFORMANCE.getStats();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Ad Performance Debug</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={Colors[theme].textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {/* Configuration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configuration</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Test Mode:</Text>
                <View style={[styles.badge, isAdTestMode ? styles.badgeSuccess : styles.badgeError]}>
                  <Text style={styles.badgeText}>
                    {isAdTestMode ? 'ENABLED' : 'DISABLED'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Max Retries:</Text>
                <Text style={styles.value}>{AD_CONFIG.maxRetries}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Progressive Loading:</Text>
                <Text style={styles.value}>
                  {AD_CONFIG.progressiveLoading ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>

            {/* Banner Ad Performance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Banner Ad Performance</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Attempts:</Text>
                <Text style={styles.value}>{adStats.attempts}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Successes:</Text>
                <Text style={[styles.value, styles.successText]}>{adStats.successes}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Failures:</Text>
                <Text style={[styles.value, styles.errorText]}>{adStats.failures}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>No-Fill Errors:</Text>
                <Text style={[styles.value, styles.warningText]}>{adStats.noFillErrors}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fill Rate:</Text>
                <Text style={[
                  styles.value, 
                  parseFloat(adStats.fillRate) > 50 ? styles.successText : styles.errorText
                ]}>
                  {adStats.fillRate}
                </Text>
              </View>
            </View>

            {/* Interstitial Ad Status */}
            {interstitialStats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interstitial Ad Status</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Loaded:</Text>
                  <View style={[
                    styles.badge, 
                    interstitialStats.isLoaded ? styles.badgeSuccess : styles.badgeError
                  ]}>
                    <Text style={styles.badgeText}>
                      {interstitialStats.isLoaded ? 'YES' : 'NO'}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Loading:</Text>
                  <Text style={styles.value}>
                    {interstitialStats.isLoading ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Session Count:</Text>
                  <Text style={styles.value}>{interstitialStats.sessionCount}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Retry Count:</Text>
                  <Text style={styles.value}>{interstitialStats.retryCount}</Text>
                </View>
              </View>
            )}

            {/* Rewarded Ad Status */}
            {rewardedStats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rewarded Ad Status</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Loaded:</Text>
                  <View style={[
                    styles.badge, 
                    rewardedStats.isLoaded ? styles.badgeSuccess : styles.badgeError
                  ]}>
                    <Text style={styles.badgeText}>
                      {rewardedStats.isLoaded ? 'YES' : 'NO'}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Loading:</Text>
                  <Text style={styles.value}>
                    {rewardedStats.isLoading ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Retry Count:</Text>
                  <Text style={styles.value}>{rewardedStats.retryCount}</Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  AD_PERFORMANCE.attempts = 0;
                  AD_PERFORMANCE.successes = 0;
                  AD_PERFORMANCE.failures = 0;
                  AD_PERFORMANCE.noFillErrors = 0;
                  setRefreshKey(prev => prev + 1);
                }}>
                <Text style={styles.actionButtonText}>Reset Statistics</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    panel: {
      backgroundColor: Colors[theme].background,
      width: '90%',
      maxHeight: '80%',
      borderRadius: 16,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[theme].border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[theme].textColor,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      maxHeight: 400,
    },
    section: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[theme].border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    label: {
      fontSize: 14,
      color: Colors[theme].textSecondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: Colors[theme].textColor,
    },
    successText: {
      color: '#4CAF50',
    },
    errorText: {
      color: '#F44336',
    },
    warningText: {
      color: '#FF9800',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeSuccess: {
      backgroundColor: '#E8F5E9',
    },
    badgeError: {
      backgroundColor: '#FFEBEE',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    actionButton: {
      backgroundColor: '#6C63FF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default AdDebugPanel;