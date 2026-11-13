import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { getDswName } from '../constants/servicesData';

const ZSB_DIRECTORY = require('../../assets/data/zsb_directory.json');

const RSB_LINKS = ZSB_DIRECTORY.map(entry => ({
  state: entry.state,
  url: entry.url,
  districts: entry.districts,
}));

export default function RsbScreen({ onBack, onNavigateToZsb }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRsbState, setExpandedRsbState] = useState(null);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return RSB_LINKS;
    const q = searchQuery.toLowerCase().trim();
    return RSB_LINKS.filter(link => {
      const dsw = getDswName(link.state).toLowerCase();
      return link.state.toLowerCase().includes(q) || dsw.includes(q);
    });
  }, [searchQuery]);

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        titlePrefix="RSB & DSW"
        titleHighlight="PORTALS"
        subtitle="State Sainik Welfare Departments & Directorates"
        hindiText=""
        onBack={onBack}
      />

      {/* SEARCH BAR */}
      <View style={styles.topFilterBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search State Directorate (e.g. Punjab, Rajasthan)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 100 }}
      >
        <View style={{ flexDirection: 'column' }}>
          {filteredLinks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No States Found</Text>
              <Text style={styles.emptySubtitle}>Try searching by a different state keyword.</Text>
            </View>
          ) : (
            filteredLinks.map(link => {
              const isExpanded = expandedRsbState === link.state || searchQuery.trim().length > 0;
              const dswTitle = getDswName(link.state);
              const districtCount = link.districts?.length || 0;

              return (
                <View key={link.state} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.stateBlock,
                      isExpanded && styles.stateBlockExpanded,
                      { backgroundColor: '#1A237E' },
                    ]}
                    onPress={() => setExpandedRsbState(isExpanded && !searchQuery ? null : link.state)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.stateBlockText, { color: '#FFF', fontSize: 13 }]}>
                        {link.state}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#90CAF9', marginTop: 2 }} numberOfLines={1}>
                        {dswTitle}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{districtCount} ZSBs</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#FDC010"
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.accordionContent, { borderColor: '#1A237E' }]}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 }}>
                        {dswTitle}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#475569', lineHeight: 16, marginBottom: 12 }}>
                        Official State Government Department responsible for Ex-Servicemen Welfare, Resettlement Schemes, Financial Grants, and PMSS Scholarship verifications in {link.state}.
                      </Text>

                      {/* VISIT DSW PORTAL BUTTON */}
                      <TouchableOpacity
                        style={[styles.visitPortalBtn, { backgroundColor: '#1A237E', marginBottom: 10 }]}
                        onPress={() =>
                          Linking.openURL(link.url).catch(() => Alert.alert('Error', 'Cannot open link'))
                        }
                      >
                        <Ionicons name="globe-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.visitPortalText}>Visit Official {link.state} DSW Portal</Text>
                      </TouchableOpacity>

                      {/* DSW SERVICES INFO */}
                      <View style={{ backgroundColor: '#F1F5F9', borderRadius: 6, padding: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#334155', marginBottom: 4 }}>
                          Key DSW Services & Welfare Benefits:
                        </Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• ESM Registration & Identity Card Issuance</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• Financial Assistance & Widows Welfare Grants</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• Prime Minister's Scholarship Scheme (PMSS) Verification</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• State Job Reservation Certificates & Self-Employment Loans</Text>
                      </View>

                      {/* SWITCH TO ZSB DISTRICTS BUTTON */}
                      <TouchableOpacity
                        style={styles.viewDistrictsBtn}
                        onPress={() => onNavigateToZsb && onNavigateToZsb(link.state)}
                      >
                        <Ionicons name="location" size={14} color="#0D47A1" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#0D47A1', fontWeight: 'bold', fontSize: 11 }}>
                          View {link.state} Zila Sainik Boards ({districtCount} Districts)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  topFilterBar: {
    backgroundColor: '#071032',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  clearBtn: {
    padding: 4,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  stateBlock: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  stateBlockExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  stateBlockText: {
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  accordionContent: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  visitPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
  },
  visitPortalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  viewDistrictsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#0D47A1',
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
});
