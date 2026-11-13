import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import ProfileModal from '../components/ProfileModal';
import { SERVICES_DATA } from '../constants/servicesData';
import { useLocalization } from '../context/LocalizationContext';

export default function HomeScreen({ onNavigate }) {
  const { t, fontScale, language } = useLocalization();
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [homeChatQuery, setHomeChatQuery] = useState('');

  const handleHomeAsk = (query) => {
    const q = (typeof query === 'string' ? query : homeChatQuery).trim();
    if (!q) {
      onNavigate('ChatAI');
      return;
    }
    setHomeChatQuery('');
    onNavigate('ChatAI', q);
  };

  const renderIcon = (family, name, color, size) => {
    if (family === 'FontAwesome5') return <FontAwesome5 name={name} size={size * fontScale} color={color} />;
    if (family === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={name} size={size * fontScale} color={color} />;
    return <Ionicons name={name} size={size * fontScale} color={color} />;
  };

  const handleActionClick = (url, id) => {
    if (id === '6') {
      onNavigate('RSB');
    } else if (id === '7') {
      onNavigate('ZSB');
    } else if (id === '8') {
      onNavigate('CSDDealers');
    } else if (id === '10') {
      onNavigate('Jobs');
    } else if (id === '11') {
      onNavigate('Resume');
    } else if (url) {
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('Notice', 'Cannot open link: ' + url);
          }
        })
        .catch(() => Alert.alert('Notice', 'Failed to open link'));
    } else {
      Alert.alert('Notice', 'Official link unavailable.');
    }
  };

  const getLocalizedService = (item) => {
    switch (item.id) {
      case '1': return { title: t('deswTitle'), subtitle: t('deswSub') };
      case '2': return { title: t('sparshTitle'), subtitle: t('sparshSub') };
      case '3': return { title: t('echsTitle'), subtitle: t('echsSub') };
      case '4': return { title: t('dgrTitle'), subtitle: t('dgrSub') };
      case '5': return { title: t('ksbTitle'), subtitle: t('ksbSub') };
      case '6': return { title: t('rsbTitle'), subtitle: t('rsbSub') };
      case '7': return { title: t('zsbTitle'), subtitle: t('zsbSub') };
      case '8': return { title: t('csdTitle'), subtitle: t('csdSub') };
      case '10': return { title: t('awpoTitle'), subtitle: t('awpoSub') };
      default: return { title: item.title, subtitle: item.subtitle };
    }
  };

  const renderCardActions = (color, url, id) => (
    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => handleActionClick(url, id)}
        activeOpacity={0.7}
      >
        <Ionicons name="globe-outline" size={13 * fontScale} color={color} />
        <Text style={[styles.actionText, { fontSize: 8.5 * fontScale }]} numberOfLines={1}>
          {t('btnWebsite')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => Linking.openURL('https://www.youtube.com/@DeswIndia').catch(() => {})}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-youtube" size={13 * fontScale} color="#D32F2F" />
        <Text style={[styles.actionText, { fontSize: 8.5 * fontScale }]} numberOfLines={1}>
          {t('btnYoutube')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => onNavigate('ChatAI')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="robot-outline" size={13 * fontScale} color="#6A1B9A" />
        <Text style={[styles.actionText, { fontSize: 8.5 * fontScale }]} numberOfLines={1}>
          {t('btnAskAi')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        onNotification={() => Alert.alert('🔔 ' + t('dlcAlertTitle'), t('dlcAlertSub'))}
        onProfile={() => setIsProfileVisible(true)}
      />

      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* HERO BANNER */}
        <ImageBackground
          source={require('../../assets/hero-banner.png')}
          style={styles.heroBanner}
        >
          <View style={styles.heroOverlay}>
            <Text style={[styles.heroSmallText, { fontSize: 12.5 * fontScale }]}>
              {t('heroSmall')}
            </Text>
            <Text style={[styles.heroLargeText, { fontSize: 18 * fontScale }]}>
              {t('heroLine1')}
            </Text>
            <Text style={[styles.heroLargeText, { fontSize: 18 * fontScale }]}>
              {t('heroLine2')}
            </Text>

            <View style={styles.heroChecksRow}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={14 * fontScale} color="#4CAF50" />
                <Text style={[styles.checkText, { fontSize: 9 * fontScale }]}>{t('check1')}</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={14 * fontScale} color="#4CAF50" />
                <Text style={[styles.checkText, { fontSize: 9 * fontScale }]}>{t('check2')}</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={14 * fontScale} color="#4CAF50" />
                <Text style={[styles.checkText, { fontSize: 9 * fontScale }]}>{t('check3')}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* ANNUAL SPARSH LIFE CERTIFICATE ALERT BANNER */}
        <View style={styles.dlcBanner}>
          <View style={styles.dlcTopRow}>
            <View style={styles.dlcBadge}>
              <Text style={styles.dlcBadgeText}>URGENT NOTICE • जरूरी सूचना</Text>
            </View>
            <View style={styles.dlcDateWrap}>
              <Ionicons name="calendar-outline" size={12} color="#D84315" />
              <Text style={styles.dlcDateText}>30 NOV DEADLINE</Text>
            </View>
          </View>

          <Text style={[styles.dlcTitle, { fontSize: 13.5 * fontScale }]}>
            {t('dlcAlertTitle')}
          </Text>
          <Text style={[styles.dlcSubtitle, { fontSize: 11 * fontScale }]}>
            {t('dlcAlertSub')}
          </Text>

          <View style={styles.dlcActionsRow}>
            <TouchableOpacity
              style={styles.dlcPrimaryBtn}
              onPress={() => onNavigate('ChatAI')}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle-outline" size={14 * fontScale} color="#001433" />
              <Text style={[styles.dlcPrimaryBtnText, { fontSize: 11 * fontScale }]}>
                {t('dlcAlertBtnGuide')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dlcSecondaryBtn}
              onPress={() => Alert.alert('✅ Reminder Active', t('dlcAlertDismissed'))}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications" size={14 * fontScale} color="#FDC010" />
              <Text style={[styles.dlcSecondaryBtnText, { fontSize: 11 * fontScale }]}>
                {t('dlcAlertBtnRemind')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI ASSISTANT CHAT BOX */}
        <View style={styles.aiCardContainer}>
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiIconBg}>
              <FontAwesome5 name="robot" size={20 * fontScale} color="#FFF" />
            </View>
            <View style={styles.aiTextContainer}>
              <View style={styles.aiTitleRow}>
                <Text style={[styles.aiTitle, { fontSize: 13.5 * fontScale }]}>
                  {t('aiCardTitle')}
                </Text>
                <View style={styles.aiLiveBadge}>
                  <Text style={styles.aiLiveBadgeText}>24x7 ONLINE</Text>
                </View>
              </View>
              <Text style={[styles.aiSubtitle, { fontSize: 10 * fontScale }]}>
                {language === 'hi'
                  ? 'पेंशन, स्पर्श, ECHS, CSD, व अनुदान पर तुरंत सवाल पूछें'
                  : 'Ask any question on Pension, SPARSH, ECHS, CSD & Grants'}
              </Text>
            </View>
          </View>

          {/* INTERACTIVE CHAT INPUT BOX */}
          <View style={styles.homeChatBoxRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={17} color="#FDC010" style={{ marginLeft: 10, marginRight: 6 }} />
            <TextInput
              style={[styles.homeChatInput, { fontSize: 12 * fontScale }]}
              placeholder={language === 'hi' ? 'पूर्व सैनिक सवाल यहां टाइप करें...' : 'Ask your question here (Pension, ECHS, etc)...'}
              placeholderTextColor="#94A3B8"
              value={homeChatQuery}
              onChangeText={setHomeChatQuery}
              onSubmitEditing={() => handleHomeAsk()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.homeChatSendBtn}
              onPress={() => handleHomeAsk()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={13} color="#001433" />
              <Text style={[styles.homeChatSendBtnText, { fontSize: 11 * fontScale }]}>
                {language === 'hi' ? 'पूछें' : 'Ask'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* QUICK PROMPT CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.homeQuickChipsScroll}
          >
            {[
              { id: '1', title: '🎖️ Retirement Steps', query: 'Armed Forces Retirement procedural steps & transition checklist kya hai?' },
              { id: '2', title: '📌 SPARSH Life Certificate', query: 'SPARSH mein Digital Life Certificate kaise submit karein?' },
              { id: '3', title: '🏥 ECHS Renewal', query: 'ECHS 64-KB Smart Card kaise apply aur renew hota hai?' },
              { id: '4', title: '🚗 CSD Car Quota', query: 'CSD AFD portal se car khareedne ke rank-wise niyam kya hain?' },
              { id: '5', title: '💰 Marriage Grant', query: 'KSB se beti ki shaadi ke liye 50,000 grant kaise milta hai?' },
            ].map(chip => (
              <TouchableOpacity
                key={chip.id}
                style={styles.homeQuickChip}
                onPress={() => handleHomeAsk(chip.query)}
                activeOpacity={0.75}
              >
                <Text style={styles.homeQuickChipText}>{chip.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* MAIN SERVICES SECTION TITLE */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.line} />
          <Text style={styles.sectionTitleStar}>★</Text>
          <Text style={[styles.sectionTitle, { fontSize: 15 * fontScale }]}>
            {t('mainServicesTitle')}
          </Text>
          <Text style={styles.sectionTitleStar}>★</Text>
          <View style={styles.line} />
        </View>

        {/* CARDS 1-9 GRID */}
        <View style={styles.gridContainer}>
          {SERVICES_DATA.map(item => {
            const localized = getLocalizedService(item);
            return (
              <View key={item.id} style={[styles.card, { borderColor: item.color }]}>
                <View style={[styles.cornerBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.cornerBadgeText}>{item.id}</Text>
                </View>

                <View style={styles.cardTop}>
                  <TouchableOpacity
                    style={[styles.cardIconWrap, { backgroundColor: item.color }]}
                    onPress={() => handleActionClick(item.url, item.id)}
                    activeOpacity={0.7}
                  >
                    {renderIcon(item.family, item.icon, '#FFF', 18)}
                  </TouchableOpacity>
                  <View style={styles.cardTextWrap}>
                    <Text
                      style={[styles.cardTitle, { color: item.color, fontSize: 10.5 * fontScale }]}
                      numberOfLines={1}
                    >
                      {localized.title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitle, { fontSize: 8.5 * fontScale }]}
                      numberOfLines={3}
                    >
                      {localized.subtitle}
                    </Text>
                  </View>
                </View>
                {renderCardActions(item.color, item.url, item.id)}
              </View>
            );
          })}
          {SERVICES_DATA.length % 3 === 2 && <View style={{ width: '32%' }} />}
          {SERVICES_DATA.length % 3 === 1 && (
            <>
              <View style={{ width: '32%' }} />
              <View style={{ width: '32%' }} />
            </>
          )}
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomComplexSection}>
          <View style={styles.bottomLeftCol}>
            <View style={styles.row10and11}>
              {/* CARD 10 — JOBS */}
              <View style={[styles.card, styles.halfCard, { borderColor: '#00838F' }]}>
                <View style={[styles.cornerBadge, { backgroundColor: '#00838F' }]}>
                  <Text style={styles.cornerBadgeText}>10</Text>
                </View>
                <TouchableOpacity
                  style={styles.cardTop}
                  onPress={() => onNavigate('Jobs')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconWrap, { backgroundColor: '#00838F' }]}>
                    <FontAwesome5 name="briefcase" size={16 * fontScale} color="#FFF" />
                  </View>
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.cardTitle, { color: '#00838F', fontSize: 11 * fontScale }]} numberOfLines={1}>
                      {t('tabJobs')}
                    </Text>
                    <Text style={[styles.cardSubtitle, { fontSize: 8.5 * fontScale }]} numberOfLines={3}>
                      {t('dgrSub')}
                    </Text>
                  </View>
                </TouchableOpacity>
                {renderCardActions('#00838F', null, '10')}
              </View>

              {/* CARD 11 — RESUME */}
              <View style={[styles.card, styles.halfCard, { borderColor: '#4527A0' }]}>
                <View style={[styles.cornerBadge, { backgroundColor: '#4527A0' }]}>
                  <Text style={styles.cornerBadgeText}>11</Text>
                </View>
                <TouchableOpacity
                  style={styles.cardTop}
                  onPress={() => onNavigate('Resume')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconWrap, { backgroundColor: '#4527A0' }]}>
                    <FontAwesome5 name="file-invoice" size={16 * fontScale} color="#FFF" />
                  </View>
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.cardTitle, { color: '#4527A0', fontSize: 11 * fontScale }]} numberOfLines={1}>
                      {language === 'hi' ? 'बायोडाटा (CV)' : 'RESUME'}
                    </Text>
                    <Text style={[styles.cardSubtitle, { fontSize: 8.5 * fontScale }]} numberOfLines={3}>
                      {language === 'hi' ? 'AI द्वारा बायोडाटा बनाएं' : 'Make resume through AI'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {renderCardActions('#4527A0', null, '11')}
              </View>
            </View>

            {/* YELLOW FREE BANNER */}
            <View style={styles.freeBanner}>
              <View style={styles.freeLeft}>
                <Ionicons name="gift" size={22 * fontScale} color="#D84315" />
                <Text style={[styles.freeTitleText, { fontSize: 11 * fontScale }]}>
                  {language === 'hi' ? 'यह ऐप ' : 'This App is '}
                  <Text style={styles.freeHighlight}>100% FREE</Text>
                </Text>
              </View>
              <View style={styles.freeRight}>
                <View style={styles.freeBullets}>
                  <Text style={[styles.freeBulletText, { fontSize: 7.5 * fontScale }]}>
                    ✔ {language === 'hi' ? 'कोई फीस नहीं' : 'No Registration Fee'}
                  </Text>
                  <Text style={[styles.freeBulletText, { fontSize: 7.5 * fontScale }]}>
                    ✔ {language === 'hi' ? 'समर्पित पूर्व सैनिक सेवा' : 'Dedicated Veteran Service'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column (Red YouTube Box) */}
          <View style={styles.youtubePromoBox}>
            <View style={styles.ytHeader}>
              <Ionicons name="logo-youtube" size={18 * fontScale} color="#FFF" />
              <Text style={[styles.ytHeaderText, { fontSize: 10 * fontScale }]}>
                {language === 'hi' ? 'ऐप गाइड\nदेखें' : 'Watch\nApp Guide'}
              </Text>
            </View>
            <Text style={[styles.ytBodyText, { fontSize: 8 * fontScale }]}>
              {language === 'hi'
                ? 'फीचर्स व उपयोग के लिए\nYouTube पर देखें'
                : 'Watch full video guide\n& tutorial on YouTube'}
            </Text>

            <TouchableOpacity
              style={styles.ytBtnWhite}
              onPress={() => Linking.openURL('https://youtube.com').catch(() => {})}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={11 * fontScale} color="#D32F2F" />
              <Text style={[styles.ytBtnTextRed, { fontSize: 8 * fontScale }]}>
                {t('btnYoutube')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ytBtnRed}
              onPress={() => Linking.openURL('https://youtube.com').catch(() => {})}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications" size={11 * fontScale} color="#FFF" />
              <Text style={[styles.ytBtnTextWhite, { fontSize: 8 * fontScale }]}>
                Subscribe
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <MaterialCommunityIcons name="shield-check" size={22 * fontScale} color="#1976D2" style={styles.disclaimerIcon} />
          <Text style={[styles.disclaimerText, { fontSize: 8 * fontScale }]}>
            {language === 'hi'
              ? 'यह ऐप केवल जानकारी और पूर्व सैनिक मार्गदर्शन के लिए है। यह आधिकारिक सरकारी ऐप नहीं है। कृपया आधिकारिक पोर्टल (desw.gov.in, sparsh.defencepension.gov.in) पर भी पुष्टि करें।'
              : 'This application is a non-governmental welfare guide created to inform and assist Indian Armed Forces veterans and Veer Naris. Please refer to official portals (desw.gov.in, sparsh.defencepension.gov.in) for statutory orders.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#001433',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  heroBanner: {
    width: '100%',
    height: 145,
    backgroundColor: '#CFD8DC',
  },
  heroOverlay: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  heroSmallText: {
    color: '#37474F',
    fontWeight: '600',
    marginBottom: 2,
  },
  heroLargeText: {
    color: '#001433',
    fontWeight: '900',
    lineHeight: 22,
  },
  heroChecksRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 16,
  },
  checkText: {
    marginLeft: 3,
    fontWeight: 'bold',
    color: '#475569',
  },

  /* PENSION ALERT BANNER */
  dlcBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#FFA000',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  dlcTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dlcBadge: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dlcBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  dlcDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  dlcDateText: {
    color: '#D84315',
    fontSize: 9,
    fontWeight: 'bold',
  },
  dlcTitle: {
    color: '#B78103',
    fontWeight: '900',
    marginBottom: 3,
  },
  dlcSubtitle: {
    color: '#4E342E',
    lineHeight: 16,
    marginBottom: 8,
  },
  dlcActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dlcPrimaryBtn: {
    flex: 1,
    backgroundColor: '#FDC010',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  dlcPrimaryBtnText: {
    color: '#001433',
    fontWeight: 'bold',
  },
  dlcSecondaryBtn: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  dlcSecondaryBtnText: {
    color: '#FDC010',
    fontWeight: 'bold',
  },

  aiCardContainer: {
    backgroundColor: '#071032',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiLiveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  aiLiveBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  aiIconBg: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  aiSubtitle: {
    color: '#94A3B8',
    lineHeight: 14,
    marginTop: 2,
  },
  homeChatBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 3,
    paddingRight: 4,
    marginBottom: 8,
  },
  homeChatInput: {
    flex: 1,
    color: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  homeChatSendBtn: {
    backgroundColor: '#FDC010',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  homeChatSendBtnText: {
    color: '#001433',
    fontWeight: 'bold',
  },
  homeQuickChipsScroll: {
    gap: 6,
  },
  homeQuickChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  homeQuickChipText: {
    color: '#FDC010',
    fontSize: 9.5,
    fontWeight: '600',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#CFD8DC',
  },
  sectionTitleStar: {
    color: '#F59E0B',
    fontSize: 13,
    marginHorizontal: 6,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#263238',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1.5,
    marginBottom: 8,
    width: '32%',
    padding: 6,
    paddingTop: 12,
    elevation: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cornerBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 6,
  },
  cornerBadgeText: {
    color: '#FFF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 1,
  },
  cardSubtitle: {
    color: '#64748B',
    lineHeight: 12,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
    marginTop: 4,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 1,
  },
  actionText: {
    color: '#475569',
    fontWeight: '500',
  },
  bottomComplexSection: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bottomLeftCol: {
    width: '66%',
    justifyContent: 'space-between',
  },
  row10and11: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '49%',
  },
  freeBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#FBC02D',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freeTitleText: {
    fontWeight: 'bold',
    color: '#001433',
  },
  freeHighlight: {
    color: '#D84315',
    fontWeight: '900',
  },
  freeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeBullets: {
    marginLeft: 4,
  },
  freeBulletText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  youtubePromoBox: {
    width: '32%',
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-between',
  },
  ytHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ytHeaderText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  ytBodyText: {
    color: '#FFF',
    fontWeight: '600',
    marginVertical: 4,
    lineHeight: 12,
    textAlign: 'center',
  },
  ytBtnWhite: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
    gap: 3,
  },
  ytBtnTextRed: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  ytBtnRed: {
    backgroundColor: '#B71C1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
    gap: 3,
  },
  ytBtnTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 6,
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  disclaimerIcon: {
    marginRight: 6,
  },
  disclaimerText: {
    flex: 1,
    color: '#1565C0',
    lineHeight: 12,
    fontWeight: '600',
  },
});
