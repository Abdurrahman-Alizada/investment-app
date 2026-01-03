import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../../constants/Colors';

const {width} = Dimensions.get('window');

const AdFallback = ({
  onRetry,
  showRetry = true,
  type = 'banner',
  customContent = null,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme, type);

  if (customContent) {
    return <View style={styles.container}>{customContent}</View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon
          name="wifi-off"
          size={type === 'banner' ? 20 : 32}
          color={Colors[theme].textSecondary}
          style={styles.icon}
        />
        <Text style={styles.message}>
          {type === 'banner' ? 'Ad not available' : 'Advertisement unavailable'}
        </Text>
        {showRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.7}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const InvestmentTip = ({tip, onDismiss}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme, 'banner');

  return (
    <View style={[styles.container, styles.tipContainer]}>
      <View style={styles.tipContent}>
        <Icon
          name="lightbulb-outline"
          size={18}
          color="#6C63FF"
          style={styles.tipIcon}
        />
        <Text style={styles.tipText}>{tip}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Icon name="close" size={16} color={Colors[theme].textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const PromotionalContent = ({title, subtitle, onPress, icon = 'star'}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme, 'banner');

  return (
    <TouchableOpacity
      style={[styles.container, styles.promoContainer]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.promoContent}>
        <Icon name={icon} size={20} color="#6C63FF" style={styles.promoIcon} />
        <View style={styles.promoText}>
          <Text style={styles.promoTitle}>{title}</Text>
          <Text style={styles.promoSubtitle}>{subtitle}</Text>
        </View>
        <Icon
          name="chevron-right"
          size={18}
          color={Colors[theme].textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme, type) =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors[theme].surface,
      borderRadius: type === 'banner' ? 8 : 12,
      padding: type === 'banner' ? 12 : 20,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: Colors[theme].border,
      minHeight: type === 'banner' ? 60 : 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginBottom: 8,
    },
    message: {
      fontSize: type === 'banner' ? 12 : 14,
      color: Colors[theme].textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    retryButton: {
      backgroundColor: '#6C63FF',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    retryText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    
    // Investment tip styles
    tipContainer: {
      backgroundColor: '#F8F9FF',
      borderColor: '#E8EAFF',
      borderLeftWidth: 4,
      borderLeftColor: '#6C63FF',
    },
    tipContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    tipIcon: {
      marginRight: 10,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: Colors[theme].textColor,
      lineHeight: 18,
    },
    dismissButton: {
      padding: 4,
    },
    
    // Promotional content styles
    promoContainer: {
      backgroundColor: '#F8F9FF',
      borderColor: '#E8EAFF',
    },
    promoContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    promoIcon: {
      marginRight: 12,
    },
    promoText: {
      flex: 1,
    },
    promoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginBottom: 2,
    },
    promoSubtitle: {
      fontSize: 12,
      color: Colors[theme].textSecondary,
    },
  });

export default AdFallback;
export {InvestmentTip, PromotionalContent};