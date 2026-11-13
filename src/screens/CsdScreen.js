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
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { getFavoriteDealers, toggleFavoriteDealer } from '../services/storageService';

const CSD_DEALERS = require('../../assets/data/csd_dealers.json');

export default function CsdScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | '4w' | '2w' | 'electronics'
  const [expandedState, setExpandedState] = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [viewFavoritesOnly, setViewFavoritesOnly] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const list = await getFavoriteDealers();
    setFavorites(list);
  };

  const handleToggleFavorite = async (dealer) => {
    const added = await toggleFavoriteDealer(dealer);
    await loadFavorites();
    Alert.alert(
      added ? 'Saved Showroom ⭐' : 'Removed Showroom',
      added ? `${dealer.dealer} saved to favorites.` : `${dealer.dealer} removed.`
    );
  };

  const isFavorite = (dealer) => {
    return favorites.some(f => f.dealer === dealer.dealer && f.phone === dealer.phone);
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'N/A') {
      Alert.alert('Notice', 'Phone number not available for this dealer.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Phone Number', `Contact: ${phoneNumber}`);
    });
  };

  const handleOpenMap = (dealerName, address, district, state) => {
    const query = encodeURIComponent(`${dealerName}, ${address}, ${district}, ${state}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return CSD_DEALERS.map(stateObj => {
      const stateMatch = stateObj.state.toLowerCase().includes(q);

      const matchedDistricts = (stateObj.districts || []).map(dist => {
        const distMatch = dist.name.toLowerCase().includes(q);

        const filterDealers = (list) => {
          if (!list) return [];
          if (!q) return list;
          return list.filter(
            d =>
              distMatch ||
              stateMatch ||
              d.dealer.toLowerCase().includes(q) ||
              d.address.toLowerCase().includes(q) ||
              (d.phone && d.phone.includes(q))
          );
        };

        const fourW = activeCategory === 'all' || activeCategory === '4w' ? filterDealers(dist.four_wheelers) : [];
        const twoW = activeCategory === 'all' || activeCategory === '2w' ? filterDealers(dist.two_wheelers) : [];
        const elec = activeCategory === 'all' || activeCategory === 'electronics' ? filterDealers(dist.electronics) : [];

        const hasMatches = fourW.length > 0 || twoW.length > 0 || elec.length > 0;

        if (hasMatches || distMatch || stateMatch) {
          return {
            ...dist,
            four_wheelers: fourW,
            two_wheelers: twoW,
            electronics: elec,
          };
        }
        return null;
      }).filter(Boolean);

      if (matchedDistricts.length > 0) {
        return { ...stateObj, districts: matchedDistricts };
      }
      return null;
    }).filter(Boolean);
  }, [searchQuery, activeCategory]);

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        titlePrefix="CSD AFD"
        titleHighlight="DEALERS"
        subtitle="Authorized Cars, Bikes, & Electronics"
        hindiText=""
        onBack={onBack}
      />

      {/* FILTER & SEARCH BAR */}
      <View style={styles.topFilterBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Dealer or City (e.g. Maruti, Hero, Chandigarh)..."
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

        {/* CATEGORY TABS */}
        <View style={styles.categoryRow}>
          {[
            { id: 'all', label: 'All' },
            { id: '4w', label: '🚗 Cars' },
            { id: '2w', label: '🏍️ Bikes' },
            { id: 'electronics', label: '📺 Electronics' },
          ].map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBtn, activeCategory === cat.id && styles.categoryBtnActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryBtnText,
                  activeCategory === cat.id && styles.categoryBtnTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 100 }}
      >
        {/* CSD OFFICIAL AFD PORTAL BANNER */}
        <View style={styles.afdPortalBanner}>
          <View style={styles.afdLeft}>
            <Text style={styles.afdTitle}>Official CSD AFD Online Portal</Text>
            <Text style={styles.afdSubtitle}>Apply for CSD Car/Bike Quota, Purchase Indent & Payment</Text>
          </View>
          <TouchableOpacity
            style={styles.afdBtn}
            onPress={() => Linking.openURL('https://afd.csdindia.gov.in/')}
          >
            <Text style={styles.afdBtnText}>Open Portal</Text>
            <Ionicons name="open-outline" size={12} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Dealerships Found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching by brand name (e.g. Maruti, Tata, Hyundai, Hero) or clear your filter.
            </Text>
          </View>
        ) : (
          filteredData.map(stateObj => {
            const isStateExpanded = expandedState === stateObj.state || searchQuery.trim().length > 0;
            const totalDealersInState = (stateObj.districts || []).reduce(
              (acc, d) => acc + (d.four_wheelers?.length || 0) + (d.two_wheelers?.length || 0) + (d.electronics?.length || 0),
              0
            );

            return (
              <View key={stateObj.state} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.stateBlock,
                    isStateExpanded && styles.stateBlockExpanded,
                    { backgroundColor: '#EF6C00' },
                  ]}
                  onPress={() => setExpandedState(isStateExpanded && !searchQuery ? null : stateObj.state)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={styles.stateBlockText}>{stateObj.state}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{totalDealersInState} dealers</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isStateExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>

                {isStateExpanded && (
                  <View style={styles.accordionContent}>
                    {stateObj.districts && stateObj.districts.length > 0 ? (
                      <View style={styles.districtList}>
                        {stateObj.districts.map(d => {
                          const distKey = `${stateObj.state}-${d.name}`;
                          const isDistExpanded = expandedDistrict === distKey || searchQuery.trim().length > 0;
                          const dealerCount = (d.four_wheelers?.length || 0) + (d.two_wheelers?.length || 0) + (d.electronics?.length || 0);

                          return (
                            <View key={d.name} style={[styles.districtCard, { marginBottom: 8 }]}>
                              <TouchableOpacity
                                style={styles.districtCardHeader}
                                onPress={() => setExpandedDistrict(isDistExpanded && !searchQuery ? null : distKey)}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Text style={[styles.districtName, { color: '#EF6C00', fontSize: 15 }]}>
                                    {d.name}
                                  </Text>
                                  <Text style={styles.dealerCountText}>({dealerCount} dealers)</Text>
                                </View>
                                <Ionicons
                                  name={isDistExpanded ? 'chevron-up' : 'chevron-down'}
                                  size={16}
                                  color="#666"
                                />
                              </TouchableOpacity>

                              {isDistExpanded && (
                                <View style={styles.districtDetailsWrap}>
                                  {/* 4-Wheelers */}
                                  {(activeCategory === 'all' || activeCategory === '4w') && d.four_wheelers?.length > 0 && (
                                    <View style={styles.sectionWrap}>
                                      <Text style={styles.categoryTitle}>🚗 4-Wheelers (Cars)</Text>
                                      {d.four_wheelers.map((dealer, idx) => {
                                        const fav = isFavorite(dealer);
                                        return (
                                          <View key={idx} style={styles.dealerCard}>
                                            <View style={styles.dealerTopRow}>
                                              <View style={{ flex: 1 }}>
                                                <Text style={styles.dealerName}>{dealer.dealer}</Text>
                                                <Text style={styles.dealerAddress}>{dealer.address}</Text>
                                              </View>
                                              <TouchableOpacity
                                                onPress={() => handleToggleFavorite(dealer)}
                                                style={styles.starBtn}
                                              >
                                                <Ionicons
                                                  name={fav ? 'star' : 'star-outline'}
                                                  size={16}
                                                  color={fav ? '#FDC010' : '#94A3B8'}
                                                />
                                              </TouchableOpacity>
                                            </View>

                                            <View style={styles.dealerActionRow}>
                                              {dealer.phone && dealer.phone !== 'N/A' && (
                                                <TouchableOpacity
                                                  style={styles.callBtn}
                                                  onPress={() => handleCall(dealer.phone)}
                                                >
                                                  <Ionicons name="call" size={12} color="#FFF" />
                                                  <Text style={styles.callBtnText}>Call {dealer.phone}</Text>
                                                </TouchableOpacity>
                                              )}
                                              <TouchableOpacity
                                                style={styles.mapBtn}
                                                onPress={() =>
                                                  handleOpenMap(dealer.dealer, dealer.address, d.name, stateObj.state)
                                                }
                                              >
                                                <Ionicons name="navigate" size={12} color="#0D47A1" />
                                                <Text style={styles.mapBtnText}>Directions</Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        );
                                      })}
                                    </View>
                                  )}

                                  {/* 2-Wheelers */}
                                  {(activeCategory === 'all' || activeCategory === '2w') && d.two_wheelers?.length > 0 && (
                                    <View style={styles.sectionWrap}>
                                      <Text style={[styles.categoryTitle, { marginTop: 10 }]}>
                                        🏍️ 2-Wheelers (Bikes/Scooters)
                                      </Text>
                                      {d.two_wheelers.map((dealer, idx) => {
                                        const fav = isFavorite(dealer);
                                        return (
                                          <View key={idx} style={styles.dealerCard}>
                                            <View style={styles.dealerTopRow}>
                                              <View style={{ flex: 1 }}>
                                                <Text style={styles.dealerName}>{dealer.dealer}</Text>
                                                <Text style={styles.dealerAddress}>{dealer.address}</Text>
                                              </View>
                                              <TouchableOpacity
                                                onPress={() => handleToggleFavorite(dealer)}
                                                style={styles.starBtn}
                                              >
                                                <Ionicons
                                                  name={fav ? 'star' : 'star-outline'}
                                                  size={16}
                                                  color={fav ? '#FDC010' : '#94A3B8'}
                                                />
                                              </TouchableOpacity>
                                            </View>

                                            <View style={styles.dealerActionRow}>
                                              {dealer.phone && dealer.phone !== 'N/A' && (
                                                <TouchableOpacity
                                                  style={styles.callBtn}
                                                  onPress={() => handleCall(dealer.phone)}
                                                >
                                                  <Ionicons name="call" size={12} color="#FFF" />
                                                  <Text style={styles.callBtnText}>Call {dealer.phone}</Text>
                                                </TouchableOpacity>
                                              )}
                                              <TouchableOpacity
                                                style={styles.mapBtn}
                                                onPress={() =>
                                                  handleOpenMap(dealer.dealer, dealer.address, d.name, stateObj.state)
                                                }
                                              >
                                                <Ionicons name="navigate" size={12} color="#0D47A1" />
                                                <Text style={styles.mapBtnText}>Directions</Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        );
                                      })}
                                    </View>
                                  )}

                                  {/* Electronics */}
                                  {(activeCategory === 'all' || activeCategory === 'electronics') && d.electronics?.length > 0 && (
                                    <View style={styles.sectionWrap}>
                                      <Text style={[styles.categoryTitle, { marginTop: 10 }]}>
                                        📺 Electronics & Durables
                                      </Text>
                                      {d.electronics.map((dealer, idx) => {
                                        const fav = isFavorite(dealer);
                                        return (
                                          <View key={idx} style={styles.dealerCard}>
                                            <View style={styles.dealerTopRow}>
                                              <View style={{ flex: 1 }}>
                                                <Text style={styles.dealerName}>{dealer.dealer}</Text>
                                                <Text style={styles.dealerAddress}>{dealer.address}</Text>
                                              </View>
                                              <TouchableOpacity
                                                onPress={() => handleToggleFavorite(dealer)}
                                                style={styles.starBtn}
                                              >
                                                <Ionicons
                                                  name={fav ? 'star' : 'star-outline'}
                                                  size={16}
                                                  color={fav ? '#FDC010' : '#94A3B8'}
                                                />
                                              </TouchableOpacity>
                                            </View>

                                            <View style={styles.dealerActionRow}>
                                              {dealer.phone && dealer.phone !== 'N/A' && (
                                                <TouchableOpacity
                                                  style={styles.callBtn}
                                                  onPress={() => handleCall(dealer.phone)}
                                                >
                                                  <Ionicons name="call" size={12} color="#FFF" />
                                                  <Text style={styles.callBtnText}>Call {dealer.phone}</Text>
                                                </TouchableOpacity>
                                              )}
                                              <TouchableOpacity
                                                style={styles.mapBtn}
                                                onPress={() =>
                                                  handleOpenMap(dealer.dealer, dealer.address, d.name, stateObj.state)
                                                }
                                              >
                                                <Ionicons name="navigate" size={12} color="#0D47A1" />
                                                <Text style={styles.mapBtnText}>Directions</Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        );
                                      })}
                                    </View>
                                  )}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>No dealerships found matching the current search.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
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
  categoryRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  categoryBtnActive: {
    backgroundColor: '#EF6C00',
  },
  categoryBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  categoryBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  afdPortalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  afdLeft: {
    flex: 1,
    marginRight: 8,
  },
  afdTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E65100',
  },
  afdSubtitle: {
    fontSize: 10,
    color: '#795548',
    marginTop: 2,
    lineHeight: 14,
  },
  afdBtn: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  afdBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
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
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  accordionContent: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#EF6C00',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  districtList: {
    marginTop: 4,
  },
  districtCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  districtCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  districtName: {
    fontWeight: 'bold',
  },
  dealerCountText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
  },
  districtDetailsWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  sectionWrap: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: 'bold',
    color: '#334155',
    fontSize: 12,
    marginBottom: 6,
  },
  dealerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dealerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dealerName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  dealerAddress: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  starBtn: {
    padding: 4,
  },
  dealerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  callBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    gap: 4,
  },
  callBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mapBtn: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    gap: 4,
  },
  mapBtnText: {
    color: '#0D47A1',
    fontSize: 11,
    fontWeight: '600',
  },
  noDataText: {
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
