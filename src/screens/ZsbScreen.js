import React, { useState, useEffect, useMemo } from 'react';
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
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { getFavoriteZsbs, toggleFavoriteZsb } from '../services/storageService';

const ZSB_DIRECTORY = require('../../assets/data/zsb_directory.json');

export default function ZsbScreen({ onBack, defaultExpandedState = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedState, setExpandedState] = useState(defaultExpandedState);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (defaultExpandedState) {
      setExpandedState(defaultExpandedState);
    }
  }, [defaultExpandedState]);

  const loadFavorites = async () => {
    const list = await getFavoriteZsbs();
    setFavorites(list);
  };

  const handleToggleFavorite = async (stateName, district) => {
    const item = { state: stateName, name: district.name, url: district.url };
    const added = await toggleFavoriteZsb(item);
    await loadFavorites();
    Alert.alert(
      added ? 'Saved to Favorites ⭐' : 'Removed from Favorites',
      added
        ? `${district.name} ZSB has been saved for instant offline access.`
        : `${district.name} ZSB removed.`
    );
  };

  const isFavorite = (stateName, districtName) => {
    return favorites.some(f => f.state === stateName && f.name === districtName);
  };

  // Filtered dataset based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return ZSB_DIRECTORY;
    }
    const q = searchQuery.toLowerCase().trim();

    return ZSB_DIRECTORY.map(entry => {
      const stateMatch = entry.state.toLowerCase().includes(q);
      const matchedDistricts = (entry.districts || []).filter(d =>
        d.name.toLowerCase().includes(q)
      );

      if (stateMatch) {
        return entry; // return all districts if state name matches
      }
      if (matchedDistricts.length > 0) {
        return { ...entry, districts: matchedDistricts };
      }
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  // Total matching district count
  const totalMatchingDistricts = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.districts?.length || 0), 0);
  }, [filteredData]);

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        titlePrefix="ZSB"
        titleHighlight="PORTALS"
        subtitle="Zila Sainik Welfare Offices (Districts)"
        hindiText=""
        onBack={onBack}
      />

      {/* SEARCH BAR & TABS */}
      <View style={styles.topFilterBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search District (e.g. Pune, Kanpur, Amritsar)..."
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

        {/* TAB TOGGLE: ALL vs SAVED */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
              All Districts ({totalMatchingDistricts})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'favorites' && styles.tabBtnActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Ionicons
              name="star"
              size={13}
              color={activeTab === 'favorites' ? '#FDC010' : '#64748B'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tabBtnText, activeTab === 'favorites' && styles.tabBtnTextActive]}>
              Saved ({favorites.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 100 }}
      >
        {activeTab === 'favorites' ? (
          /* FAVORITES TAB */
          <View>
            {favorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Saved ZSBs</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the star icon next to your home district to save it here for instant offline access.
                </Text>
              </View>
            ) : (
              favorites.map((fav, index) => (
                <View key={index} style={styles.districtCard}>
                  <View style={styles.districtTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.districtName}>{fav.name} ZSB</Text>
                      <Text style={styles.stateSubtitle}>{fav.state}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(fav.state, fav)}
                      style={styles.starBtn}
                    >
                      <Ionicons name="star" size={20} color="#FDC010" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionRow}>
                    {fav.url && (
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => Linking.openURL(fav.url).catch(() => Alert.alert('Error', 'Cannot open link'))}
                      >
                        <Ionicons name="globe-outline" size={14} color="#0D47A1" />
                        <Text style={styles.actionPillText}>Open Portal</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* ALL STATES ACCORDION */
          <View style={{ flexDirection: 'column' }}>
            {filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Matching Districts</Text>
                <Text style={styles.emptySubtitle}>Try searching by state name or a different district keyword.</Text>
              </View>
            ) : (
              filteredData.map(link => {
                const isExpanded = expandedState === link.state || searchQuery.trim().length > 0;
                const districtCount = link.districts?.length || 0;

                return (
                  <View key={link.state} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.stateBlock, isExpanded && styles.stateBlockExpanded]}
                      onPress={() => setExpandedState(isExpanded && !searchQuery ? null : link.state)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={styles.stateBlockText}>{link.state}</Text>
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>{districtCount}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#0D47A1"
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.accordionContent}>
                        {link.url && (
                          <TouchableOpacity
                            style={styles.visitPortalBtn}
                            onPress={() =>
                              Linking.openURL(link.url).catch(() => Alert.alert('Error', 'Cannot open link'))
                            }
                          >
                            <Ionicons name="globe-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.visitPortalText}>Visit {link.state} RSB Portal</Text>
                          </TouchableOpacity>
                        )}

                        {districtCount > 0 ? (
                          <View style={styles.districtList}>
                            <Text style={styles.districtListTitle}>
                              Zila Sainik Boards in {link.state}:
                            </Text>
                            {link.districts.map(d => {
                              const fav = isFavorite(link.state, d.name);
                              return (
                                <View key={d.name} style={styles.districtCard}>
                                  <View style={styles.districtTopRow}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.districtName}>{d.name}</Text>
                                    </View>
                                    <TouchableOpacity
                                      onPress={() => handleToggleFavorite(link.state, d)}
                                      style={styles.starBtn}
                                    >
                                      <Ionicons
                                        name={fav ? 'star' : 'star-outline'}
                                        size={18}
                                        color={fav ? '#FDC010' : '#94A3B8'}
                                      />
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.actionRow}>
                                    {d.url ? (
                                      <TouchableOpacity
                                        style={styles.actionPill}
                                        onPress={() =>
                                          Linking.openURL(d.url).catch(() =>
                                            Alert.alert('Error', 'Cannot open link')
                                          )
                                        }
                                      >
                                        <Ionicons name="link-outline" size={14} color="#0D47A1" />
                                        <Text style={styles.actionPillText}>Visit District Portal</Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <Text style={styles.noLinkText}>Direct portal not available</Text>
                                    )}

                                    {/* Google Maps Search for ZSB Office */}
                                    <TouchableOpacity
                                      style={[styles.actionPill, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}
                                      onPress={() => {
                                        const query = encodeURIComponent(`Zila Sainik Welfare Office ${d.name} ${link.state}`);
                                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
                                      }}
                                    >
                                      <Ionicons name="location" size={13} color="#2E7D32" />
                                      <Text style={[styles.actionPillText, { color: '#2E7D32' }]}>Find Office</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <Text style={styles.noDistrictText}>
                            District-level portal not available online. Please visit the State RSB Portal for contact details.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
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
  tabRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  tabBtnActive: {
    backgroundColor: '#0D47A1',
  },
  tabBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  stateBlock: {
    width: '100%',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0D47A1',
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
    borderBottomWidth: 0,
  },
  stateBlockText: {
    color: '#0D47A1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  countBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    color: '#0D47A1',
    fontSize: 10,
    fontWeight: 'bold',
  },
  accordionContent: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#0D47A1',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  visitPortalBtn: {
    backgroundColor: '#0D47A1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  visitPortalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  districtList: {
    marginTop: 4,
  },
  districtListTitle: {
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 8,
    fontSize: 12,
  },
  districtCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  districtTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  districtName: {
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: 14,
  },
  stateSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  starBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    backgroundColor: '#E3F2FD',
    gap: 4,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D47A1',
  },
  noLinkText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  noDistrictText: {
    fontSize: 12,
    color: '#607D8B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
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
    lineHeight: 18,
  },
});
