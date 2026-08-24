import { StyleSheet } from 'react-native';
import { COLORS } from './data';

export const hubStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.navy, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  headerMenu: { marginRight: 8 },
  headerLogoContainer: { marginRight: 8 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: 'bold' },
  headerSubtitle: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 2 },
  headerHindi: { color: '#A0B0C0', fontSize: 9, marginTop: 2 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12, position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E53935', borderRadius: 8, width: 15, height: 15, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  heroBanner: { width: '100%', height: 160, backgroundColor: '#1E3A5F' },
  heroOverlay: { flex: 1, padding: 15, justifyContent: 'center' },
  heroSmallText: { color: '#333', fontSize: 13, fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.75)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  heroLargeText: { color: COLORS.navy, fontSize: 21, fontWeight: '800', textShadowColor: 'rgba(255,255,255,0.85)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  heroChecksRow: { flexDirection: 'row', marginTop: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginRight: 7, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  checkText: { fontSize: 10, marginLeft: 4, fontWeight: '600', color: '#111' },

  aiCardContainer: { flexDirection: 'row', backgroundColor: COLORS.navy2, marginHorizontal: 12, marginTop: -25, borderRadius: 12, padding: 12, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, borderWidth: 1, borderColor: '#394A7E' },
  aiIconBg: { backgroundColor: '#394A7E', borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  aiTextContainer: { flex: 1 },
  aiTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  aiSubtitle: { color: '#A0AEC0', fontSize: 10, lineHeight: 14 },
  aiBtn: { backgroundColor: '#6543C1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20 },
  aiBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, paddingHorizontal: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#D1D5DB' },
  sectionTitleStar: { color: '#F59E0B', fontSize: 14, marginHorizontal: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1.5, marginBottom: 10, padding: 7, elevation: 1 },
  cardTop: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start', flex: 1 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 11, fontWeight: 'bold', lineHeight: 14 },
  cardSubtitle: { fontSize: 9, color: COLORS.muted, marginTop: 2, lineHeight: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 6 },
  actionBtn: { alignItems: 'center', width: '25%' },
  actionText: { fontSize: 8, color: '#4B5563', marginTop: 2, textAlign: 'center', fontWeight: '500' },

  disclaimerContainer: { flexDirection: 'row', backgroundColor: '#E6F0FA', marginHorizontal: 12, marginTop: 10, marginBottom: 20, padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#B9D5F0' },
  disclaimerIcon: { marginRight: 10 },
  disclaimerText: { flex: 1, fontSize: 9, color: '#334155', lineHeight: 14 },

  bottomNav: { flexDirection: 'row', backgroundColor: COLORS.navy, paddingVertical: 10, paddingBottom: 25, justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, marginTop: 4, color: '#8898AA' },
});
