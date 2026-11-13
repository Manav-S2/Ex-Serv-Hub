import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';

export default function AppHeader({
  titlePrefix,
  titleHighlight,
  subtitle,
  hindiText,
  onBack = null,
  onMenu = null,
  onNotification = null,
  onProfile = null,
  badgeCount = 1,
}) {
  const insets = useSafeAreaInsets();
  const { language, toggleLanguage, seniorMode, toggleSeniorMode, t, fontScale } = useLocalization();
  const { user } = useAuth();

  const finalPrefix = titlePrefix !== undefined ? titlePrefix : t('appNamePrefix');
  const finalHighlight = titleHighlight !== undefined ? titleHighlight : t('appNameHighlight');
  const finalSubtitle = subtitle !== undefined ? subtitle : t('headerSubtitle');
  const finalHindi = hindiText !== undefined ? hindiText : t('headerHindi');

  const getHeaderPaddingTop = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.top + 12, 50);
    }
    if (Platform.OS === 'android') {
      return (StatusBar.currentHeight || 24) + 12;
    }
    return 42;
  };

  return (
    <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
      {onBack ? (
        <TouchableOpacity style={styles.headerMenu} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
      ) : onMenu ? (
        <TouchableOpacity style={styles.headerMenu} onPress={onMenu} activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color="#FFF" />
        </TouchableOpacity>
      ) : null}

      {!onBack && (
        <View style={styles.headerLogoContainer}>
          <View style={styles.logoWrap}>
            <Ionicons name="shield" size={40} color="#FDC010" style={styles.shieldIcon} />
            <Ionicons name="person" size={18} color="#000" style={styles.personIcon} />
          </View>
        </View>
      )}

      <View style={styles.headerTextContainer}>
        <Text style={[styles.headerTitle, { fontSize: 14.5 * fontScale }]}>
          <Text style={{ color: '#FFF' }}>{finalPrefix} </Text>
          <Text style={{ color: '#FDC010' }}>{finalHighlight}</Text>
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: 11 * fontScale }]}>
          {finalSubtitle}
        </Text>
        {finalHindi ? (
          <Text style={[styles.headerHindi, { fontSize: 9 * fontScale }]} numberOfLines={1}>
            {finalHindi}
          </Text>
        ) : null}
      </View>

      {/* RIGHT ACTION CONTROLS: LANGUAGE, SENIOR MODE & GOOGLE PROFILE */}
      <View style={styles.headerRightIcons}>
        <TouchableOpacity
          style={styles.langPill}
          onPress={toggleLanguage}
          activeOpacity={0.75}
        >
          <Text style={styles.langPillText}>
            {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 ENG'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.seniorPill, seniorMode && styles.seniorPillActive]}
          onPress={toggleSeniorMode}
          activeOpacity={0.75}
        >
          <Text style={[styles.seniorPillText, seniorMode && styles.seniorPillTextActive]}>
            👓 {seniorMode ? 'Large' : 'A+'}
          </Text>
        </TouchableOpacity>

        {onProfile && (
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={onProfile}
            activeOpacity={0.75}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.headerAvatar} />
            ) : user ? (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarText}>
                  {(user.displayName || 'V')[0].toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.guestProfileWrap}>
                <Ionicons name="person-circle-outline" size={24} color="#FDC010" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0A2550',
  },
  headerMenu: {
    marginRight: 8,
  },
  headerLogoContainer: {
    marginRight: 8,
  },
  logoWrap: {
    position: 'relative',
    width: 34,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIcon: {
    position: 'absolute',
  },
  personIcon: {
    marginTop: -4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFF',
    fontWeight: '700',
    marginTop: 1,
  },
  headerHindi: {
    color: '#94A3B8',
    marginTop: 1,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  langPillText: {
    color: '#FDC010',
    fontSize: 10.5,
    fontWeight: '700',
  },
  seniorPill: {
    backgroundColor: '#0F264A',
    borderWidth: 1,
    borderColor: '#1E3A66',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 14,
  },
  seniorPillActive: {
    backgroundColor: '#FDC010',
    borderColor: '#FDC010',
  },
  seniorPillText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  seniorPillTextActive: {
    color: '#001433',
    fontWeight: 'bold',
  },
  profileBtn: {
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FDC010',
  },
  headerAvatarFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FDC010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#001433',
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestProfileWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
