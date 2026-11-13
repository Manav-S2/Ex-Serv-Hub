import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';

const MILITARY_RANKS = [
  'Sepoy / Gunner / Rifleman',
  'Naik / Lance Naik',
  'Havildar / Dafadar',
  'Naib Subedar',
  'Subedar',
  'Subedar Major',
  'Honorary Lieutenant / Captain',
  'Lieutenant / Captain',
  'Major',
  'Lt Colonel',
  'Colonel / Brigadier',
  'Veer Nari / Defense Widow',
  'Defense Family Dependent',
];

const SERVICE_BRANCHES = [
  'Indian Army (थल सेना)',
  'Indian Navy (नौसेना)',
  'Indian Air Force (वायु सेना)',
];

export default function ProfileModal({ visible, onClose }) {
  const { user, veteranProfile, signInWithGoogle, signOutUser, updateVeteranProfile } = useAuth();
  const { t, fontScale, language } = useLocalization();

  const [rank, setRank] = useState(veteranProfile?.rank || 'Havildar / Dafadar');
  const [serviceBranch, setServiceBranch] = useState(veteranProfile?.serviceBranch || 'Indian Army (थल सेना)');
  const [corps, setCorps] = useState(veteranProfile?.corps || 'Infantry');
  const [dischargeYear, setDischargeYear] = useState(veteranProfile?.dischargeYear || '2019');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (veteranProfile) {
      if (veteranProfile.rank) setRank(veteranProfile.rank);
      if (veteranProfile.serviceBranch) setServiceBranch(veteranProfile.serviceBranch);
      if (veteranProfile.corps) setCorps(veteranProfile.corps);
      if (veteranProfile.dischargeYear) setDischargeYear(veteranProfile.dischargeYear);
    }
  }, [veteranProfile]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      Alert.alert('जय हिंद, Sir!', 'Successfully signed in with Google.');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User cancelled popup
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        Alert.alert(
          'Google Provider Setup',
          'Google Authentication is enabled in the app! In Firebase Console > Authentication > Sign-in method, ensure "Google" is enabled.'
        );
      } else {
        Alert.alert('Sign-In Notice', err.message || 'Unable to complete Google sign-in.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateVeteranProfile({
        rank,
        serviceBranch,
        corps,
        dischargeYear,
      });
      Alert.alert('Profile Saved', 'Your defense service details have been updated.');
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOutUser();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.shieldWrap}>
                <Ionicons name="shield-checkmark" size={24} color="#FDC010" />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {user ? 'Veteran Profile' : 'Sign In With Google'}
                </Text>
                <Text style={styles.modalSub}>
                  {user ? 'सत्यापित पूर्व सैनिक खाता' : '100% Free • कोई चार्ज नहीं'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {!user ? (
              /* GUEST / SIGN-IN VIEW */
              <View style={styles.signInCard}>
                <View style={styles.iconEmblem}>
                  <FontAwesome5 name="medal" size={32} color="#FDC010" />
                </View>

                <Text style={styles.signInHeading}>
                  {language === 'hi' ? 'पूर्व सैनिक सेवा पोर्टल में आपका स्वागत है' : 'Welcome to Veteran Welfare Hub'}
                </Text>
                <Text style={styles.signInDescription}>
                  {language === 'hi'
                    ? 'Google (Gmail) से सुरक्षित लॉगिन करें। यह 100% निःशुल्क है। अपनी रैंक, रेजिमेंट और पसंद की नौकरियां एक क्लिक में सिंक करें।'
                    : 'Sign in with your Google account. It is 100% free with zero charges. Save your military rank, trade, and sync bookmarked vacancies across devices.'}
                </Text>

                {/* GOOGLE SIGN IN BUTTON */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleSignIn}
                  disabled={isSigningIn}
                  activeOpacity={0.85}
                >
                  {isSigningIn ? (
                    <ActivityIndicator color="#001433" size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                      <Text style={styles.googleBtnText}>
                        {language === 'hi' ? 'Google / Gmail से जारी रखें' : 'Continue with Google (Gmail)'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.freeGuaranteeRow}>
                  <Ionicons name="checkmark-done-circle" size={16} color="#4CAF50" />
                  <Text style={styles.freeGuaranteeText}>
                    {language === 'hi'
                      ? 'निःशुल्क सेवा • फोन OTP की कोई फीस नहीं'
                      : 'Zero Cost • Unlimited Free Sign-In'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.guestBtn} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.guestBtnText}>
                    {language === 'hi' ? 'अतिथि के रूप में जारी रखें (बिना लॉगिन)' : 'Continue as Guest (No Login Required)'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* SIGNED-IN USER PROFILE VIEW */
              <View style={styles.profileContent}>
                {/* USER BADGE CARD */}
                <View style={styles.userCard}>
                  {user.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <Text style={styles.userAvatarInitials}>
                        {(user.displayName || 'V')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.displayName || 'Veteran Sir'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                      <Text style={styles.verifiedBadgeText}>Google Account Active</Text>
                    </View>
                  </View>
                </View>

                {/* EDITABLE DEFENSE PROFILE DETAILS */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>
                    🎖️ {language === 'hi' ? 'सैन्य रैंक (Military Rank)' : 'Military Rank'}
                  </Text>
                  <View style={styles.chipRow}>
                    {MILITARY_RANKS.slice(0, 6).map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.rankChip, rank === r && styles.rankChipActive]}
                        onPress={() => setRank(r)}
                      >
                        <Text style={[styles.rankChipText, rank === r && styles.rankChipTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                    ⚓ {language === 'hi' ? 'सेवा शाखा (Service Branch)' : 'Service Branch'}
                  </Text>
                  <View style={styles.chipRow}>
                    {SERVICE_BRANCHES.map(b => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.rankChip, serviceBranch === b && styles.rankChipActive]}
                        onPress={() => setServiceBranch(b)}
                      >
                        <Text style={[styles.rankChipText, serviceBranch === b && styles.rankChipTextActive]}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                    🛡️ {language === 'hi' ? 'कोर / रेजिमेंट (Corps / Regimental Centre)' : 'Regiment / Corps / Trade'}
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    value={corps}
                    onChangeText={setCorps}
                    placeholder="e.g. Rajputana Rifles, Signals, EME, Navy Electrical"
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                    📅 {language === 'hi' ? 'रिटायरमेंट वर्ष (Discharge Year)' : 'Year of Discharge'}
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    value={dischargeYear}
                    onChangeText={setDischargeYear}
                    keyboardType="numeric"
                    placeholder="e.g. 2018"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#001433" size="small" />
                    ) : (
                      <>
                        <Ionicons name="save-outline" size={16} color="#001433" style={{ marginRight: 6 }} />
                        <Text style={styles.saveBtnText}>
                          {language === 'hi' ? 'प्रोफ़ाइल सुरक्षित करें' : 'Save Details'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={handleSignOut}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.signOutBtnText}>
                      {language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#001433',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#0F264A',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldWrap: {
    backgroundColor: '#071032',
    padding: 6,
    borderRadius: 8,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  signInCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconEmblem: {
    backgroundColor: '#071032',
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDC010',
    marginBottom: 16,
  },
  signInHeading: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  signInDescription: {
    color: '#94A3B8',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  googleBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 3,
    marginBottom: 12,
  },
  googleBtnText: {
    color: '#001433',
    fontWeight: 'bold',
    fontSize: 13.5,
  },
  freeGuaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 16,
  },
  freeGuaranteeText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
  guestBtn: {
    paddingVertical: 8,
  },
  guestBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071032',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDC010',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarInitials: {
    color: '#001433',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#071032',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#FDC010',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rankChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rankChipActive: {
    backgroundColor: '#FDC010',
    borderColor: '#FDC010',
  },
  rankChipText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  rankChipTextActive: {
    color: '#001433',
    fontWeight: 'bold',
  },
  inputField: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileActions: {
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#FDC010',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#001433',
    fontWeight: 'bold',
    fontSize: 13,
  },
  signOutBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  signOutBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 12,
  },
});
