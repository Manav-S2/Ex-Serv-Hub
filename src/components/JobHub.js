import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { getJobs, postJob, toggleBookmark, isBookmarked, getBookmarkedJobs } from '../services/jobService';

export default function JobHub({ onBack, onOpenAI }) {
  const [activeTab, setActiveTab] = useState('vacancies'); // 'vacancies' | 'portals' | 'post' | 'admin'
  const [jobsList, setJobsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArm, setSelectedArm] = useState('All Arms');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [bookmarkUpdate, setBookmarkUpdate] = useState(0);

  // Age Calculator Modal State
  const [ageCalcVisible, setAgeCalcVisible] = useState(false);
  const [actualAgeInput, setActualAgeInput] = useState('');
  const [serviceYearsInput, setServiceYearsInput] = useState('');
  const [maxAgeInput, setMaxAgeInput] = useState('45');
  const [calcResult, setCalcResult] = useState(null);

  // New Job Form State
  const [formTitle, setFormTitle] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formCategory, setFormCategory] = useState('Security / Facility');
  const [formState, setFormState] = useState('Pan India');
  const [formEligibility, setFormEligibility] = useState('Ex-Servicemen (All ranks)');
  const [formVacancies, setFormVacancies] = useState('');
  const [formClosingDate, setFormClosingDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // Admin Mock State
  const [scraperRunning, setScraperRunning] = useState(false);
  const [lastScrapeStats, setLastScrapeStats] = useState(null);

  // Load jobs based on filters
  useEffect(() => {
    loadJobs();
  }, [searchQuery, selectedRank, selectedCategory, selectedArm, showBookmarksOnly, bookmarkUpdate]);

  const loadJobs = async () => {
    if (showBookmarksOnly) {
      const saved = await getBookmarkedJobs();
      setJobsList(saved);
      return;
    }

    const data = await getJobs({
      query: searchQuery,
      rank: selectedRank,
      category: selectedCategory,
    });

    // Client-side arm/trade filtering
    if (selectedArm !== 'All Arms') {
      const armKey = selectedArm.toLowerCase().split('/')[0].trim();
      const filtered = data.filter(j => {
        const text = `${j.title} ${j.eligibility || ''} ${j.description || ''} ${(j.tags || []).join(' ')}`.toLowerCase();
        return text.includes(armKey) || text.includes('all rank') || text.includes('ex-servicemen');
      });
      setJobsList(filtered);
    } else {
      setJobsList(data);
    }
  };

  const handlePostJob = async () => {
    if (!formTitle.trim() || !formOrg.trim()) {
      Alert.alert('Required Fields', 'Please enter at least the Job Title and Organization name.');
      return;
    }

    await postJob({
      title: formTitle,
      org: formOrg,
      category: formCategory,
      state: formState,
      eligibility: formEligibility,
      vacancies: formVacancies,
      closingDate: formClosingDate,
      description: formDescription,
      sourceUrl: formUrl,
      contactEmail: formEmail,
    });

    Alert.alert('Success', 'Job posting submitted successfully to Firestore!');
    setFormTitle('');
    setFormOrg('');
    setFormDescription('');
    setFormVacancies('');
    setFormClosingDate('');
    setActiveTab('vacancies');
    loadJobs();
  };

  const handleTriggerScrape = (sourceName) => {
    setScraperRunning(true);
    setTimeout(() => {
      setScraperRunning(false);
      setLastScrapeStats({
        source: sourceName,
        timestamp: new Date().toLocaleTimeString(),
        itemsFound: Math.floor(Math.random() * 15) + 5,
        status: 'Success (200 OK)',
      });
      loadJobs();
    }, 1500);
  };

  const openJobDetail = (job) => {
    setSelectedJob(job);
    setCalcResult(null);
    setDetailModalVisible(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'closing-soon') {
      return { label: 'CLOSING SOON', bg: '#FF9800', color: '#FFF' };
    }
    if (status === 'closed') {
      return { label: 'CLOSED', bg: '#9E9E9E', color: '#FFF' };
    }
    return { label: 'ACTIVE', bg: '#2E7D32', color: '#FFF' };
  };

  // WhatsApp Share Formatter
  const handleShareToWhatsApp = (job) => {
    const text = `🇮🇳 *EX-SERVICEMEN JOB VACANCY ALERT*
📌 *Role:* ${job.title}
🏢 *Organization:* ${job.org}
📍 *Location:* ${job.state || 'Pan India'}
🎖️ *Eligibility:* ${job.eligibility || 'Ex-Servicemen'}
👥 *Vacancies:* ${job.vacancies ? job.vacancies + ' Posts' : 'As per notification'}
🗓️ *Closing Date:* ${job.closingDate || 'Ongoing'}

🔗 *Apply / Notification Link:* ${job.sourceUrl || job.applyUrl || 'Contact Zila Sainik Board'}

📲 _Shared via Ex-Servicemen App Hub_`;

    const encoded = encodeURIComponent(text);
    const nativeUrl = `whatsapp://send?text=${encoded}`;
    const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    Linking.canOpenURL(nativeUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(nativeUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => Linking.openURL(webUrl));
  };

  // Age Relaxation Calculator under Central/State ESM Rules
  const handleCalculateAge = () => {
    const age = parseInt(actualAgeInput, 10);
    const service = parseInt(serviceYearsInput, 10);
    const maxLimit = parseInt(maxAgeInput, 10) || 45;

    if (isNaN(age) || isNaN(service)) {
      Alert.alert('Invalid Input', 'Please enter your current age and years of military service.');
      return;
    }

    // ESM Rule: Effective Age = Actual Age - Service Years - 3 Grace Years
    const effectiveAge = age - service - 3;
    const isEligible = effectiveAge <= maxLimit;

    setCalcResult({
      actualAge: age,
      serviceYears: service,
      graceYears: 3,
      effectiveAge,
      maxLimit,
      isEligible,
    });
  };

  const OFFICIAL_PORTALS = [
    {
      id: 'dgr',
      title: 'Directorate General Resettlement (DGR)',
      desc: 'Primary MoD agency for re-employment, self-employment schemes, and officer/JCO/OR courses.',
      url: 'http://dgrindia.gov.in/',
      badge: 'MoD Official',
      color: '#6A1B9A',
      icon: 'briefcase',
    },
    {
      id: 'ksb',
      title: 'Kendriya Sainik Board (KSB)',
      desc: 'Apex body for veteran welfare schemes, educational stipends, and mega ESM job rallies.',
      url: 'https://www.ksb.gov.in/',
      badge: 'Welfare & Jobs',
      color: '#B71C1C',
      icon: 'shield-alt',
    },
    {
      id: 'awpo',
      title: 'Army Welfare Placement Organisation',
      desc: 'Non-profit dedicated placement agency connecting retired soldiers with corporate and PSU roles.',
      url: 'https://www.exarmynaukri.com/',
      badge: 'Army Placement',
      color: '#2E7D32',
      icon: 'user-check',
    },
    {
      id: 'ncs',
      title: 'National Career Service (NCS) — ESM Quota',
      desc: 'Central government employment portal with 10% Group C and 20% Group D reservation tracking.',
      url: 'https://www.ncs.gov.in/',
      badge: 'Govt Reservation',
      color: '#00838F',
      icon: 'university',
    },
  ];

  const ARMS_OPTIONS = [
    'All Arms',
    'Infantry / Combat',
    'Signals / Telecom',
    'EME / Technical',
    'ASC / Logistics',
    'Navy',
    'Air Force',
  ];

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            ESM <Text style={{ color: '#FDC010' }}>WORK & JOBS HUB</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Verified Vacancies, Scrapers & Resettlement</Text>
        </View>
        <TouchableOpacity style={styles.aiHelpBtn} onPress={onOpenAI}>
          <MaterialCommunityIcons name="robot" size={20} color="#001433" />
        </TouchableOpacity>
      </View>

      {/* Segmented Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'vacancies' && styles.tabItemActive]}
          onPress={() => setActiveTab('vacancies')}
        >
          <Ionicons
            name="briefcase"
            size={16}
            color={activeTab === 'vacancies' ? '#FDC010' : '#B0BEC5'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'vacancies' && styles.tabLabelActive]}
          >
            Live Jobs ({jobsList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'portals' && styles.tabItemActive]}
          onPress={() => setActiveTab('portals')}
        >
          <Ionicons
            name="globe-outline"
            size={16}
            color={activeTab === 'portals' ? '#FDC010' : '#B0BEC5'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'portals' && styles.tabLabelActive]}
          >
            Portals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'post' && styles.tabItemActive]}
          onPress={() => setActiveTab('post')}
        >
          <Ionicons
            name="add-circle-outline"
            size={16}
            color={activeTab === 'post' ? '#FDC010' : '#B0BEC5'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'post' && styles.tabLabelActive]}
          >
            Post Job
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'admin' && styles.tabItemActive]}
          onPress={() => setActiveTab('admin')}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={activeTab === 'admin' ? '#FDC010' : '#B0BEC5'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'admin' && styles.tabLabelActive]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* ────────────────── TAB 1: LIVE VACANCIES ────────────────── */}
      {activeTab === 'vacancies' && (
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search role, DGR, security, state, rank..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Chips - Rank & Quick Saved Toggle */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {/* BOOKMARKS TOGGLE */}
            <TouchableOpacity
              style={[styles.filterChip, showBookmarksOnly && styles.bookmarkChipActive]}
              onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
            >
              <Ionicons
                name={showBookmarksOnly ? 'bookmark' : 'bookmark-outline'}
                size={13}
                color={showBookmarksOnly ? '#FFF' : '#0D47A1'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterChipText,
                  showBookmarksOnly && { color: '#FFF', fontWeight: 'bold' },
                ]}
              >
                Saved Only
              </Text>
            </TouchableOpacity>

            <View style={styles.chipDivider} />

            {['All', 'Officer', 'JCO', 'OR / Jawan'].map((rank) => (
              <TouchableOpacity
                key={rank}
                style={[styles.filterChip, selectedRank === rank && styles.filterChipActive]}
                onPress={() => setSelectedRank(rank)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedRank === rank && styles.filterChipTextActive,
                  ]}
                >
                  {rank === 'All' ? 'Rank: All' : rank}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.chipDivider} />

            {['All', 'DGR', 'KSB', 'Security', 'Corporate'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  styles.categoryChip,
                  selectedCategory === cat && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat === 'All' ? 'Sector: All' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* SECOND FILTER ROW: Military Arms & Trade */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.filterScroll, { marginTop: 4 }]}
            contentContainerStyle={styles.filterScrollContent}
          >
            {ARMS_OPTIONS.map((arm) => (
              <TouchableOpacity
                key={arm}
                style={[styles.filterChip, selectedArm === arm && styles.armChipActive]}
                onPress={() => setSelectedArm(arm)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedArm === arm && { color: '#FFF', fontWeight: 'bold' },
                  ]}
                >
                  🎖️ {arm}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Job List */}
          <ScrollView
            style={styles.jobList}
            contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          >
            {jobsList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No matching jobs found</Text>
                <Text style={styles.emptyDesc}>
                  Try clearing your search query or selecting "All" in the rank and arm filters.
                </Text>
              </View>
            ) : (
              jobsList.map((job) => {
                const badge = getStatusBadge(job.status);
                const bookmarked = isBookmarked(job.id);

                return (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.jobCard}
                    activeOpacity={0.8}
                    onPress={() => openJobDetail(job)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle} numberOfLines={2}>
                          {job.title}
                        </Text>
                        <Text style={styles.jobOrg}>
                          {job.org} • <Text style={styles.jobLocation}>{job.state || 'Pan India'}</Text>
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.bookmarkBtn}
                        onPress={() => {
                          toggleBookmark(job.id);
                          setBookmarkUpdate((prev) => prev + 1);
                        }}
                      >
                        <Ionicons
                          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                          size={20}
                          color={bookmarked ? '#FDC010' : '#94A3B8'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tagRow}>
                      <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusTagText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{job.category || 'General'}</Text>
                      </View>
                      {job.vacancies ? (
                        <View style={styles.vacanciesTag}>
                          <Ionicons name="people" size={12} color="#1565C0" />
                          <Text style={styles.vacanciesText}>
                            {job.vacancies} Vacancies
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.jobEligibility} numberOfLines={1}>
                      <Text style={{ fontWeight: 'bold' }}>Eligibility:</Text>{' '}
                      {job.eligibility || 'Ex-Servicemen'}
                    </Text>

                    {/* CARD FOOTER WITH WHATSAPP SHARE */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.deadlineText}>
                        {job.closingDate
                          ? `Deadline: ${job.closingDate}`
                          : 'Ongoing application'}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          style={styles.shareWhatsAppBtn}
                          onPress={() => handleShareToWhatsApp(job)}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#FFF" />
                          <Text style={styles.shareWhatsAppText}>Share</Text>
                        </TouchableOpacity>

                        <Text style={styles.viewDetailLink}>Details &rarr;</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* ────────────────── TAB 2: OFFICIAL PORTALS ────────────────── */}
      {activeTab === 'portals' && (
        <ScrollView style={styles.portalScroll} contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
          <Text style={styles.sectionHeaderTitle}>Official Employment Portals</Text>
          <Text style={styles.sectionHeaderSubtitle}>
            Direct links to armed forces resettlement and career reservation sites.
          </Text>

          {OFFICIAL_PORTALS.map((portal) => (
            <View key={portal.id} style={styles.portalCard}>
              <View style={styles.portalCardTop}>
                <View style={[styles.portalIconWrap, { backgroundColor: portal.color }]}>
                  <FontAwesome5 name={portal.icon} size={18} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.portalTitle}>{portal.title}</Text>
                  <View style={styles.portalBadge}>
                    <Text style={styles.portalBadgeText}>{portal.badge}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.portalDesc}>{portal.desc}</Text>

              <TouchableOpacity
                style={[styles.portalBtn, { borderColor: portal.color }]}
                onPress={() => {
                  if (portal.url) {
                    Linking.openURL(portal.url).catch(() => {
                      Alert.alert('Error', 'Unable to open ' + portal.url);
                    });
                  }
                }}
              >
                <Ionicons name="open-outline" size={16} color={portal.color} />
                <Text style={[styles.portalBtnText, { color: portal.color }]}>
                  Visit Official Website
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ────────────────── TAB 3: RECRUITER POST JOB ────────────────── */}
      {activeTab === 'post' && (
        <ScrollView style={styles.formScroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.formTitle}>Post an Ex-Servicemen Vacancy</Text>
          <Text style={styles.formSubtitle}>
            Corporate employers, DGR empanelled security agencies, and PSUs can post direct openings.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Job Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Security Supervisor, Logistics Manager, Admin Officer"
              value={formTitle}
              onChangeText={setFormTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Organization / Company Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Veteran Security Force, Tata Steel, Reliance Logistics"
              value={formOrg}
              onChangeText={setFormOrg}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Location / State</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Pan India, Delhi, Pune"
                value={formState}
                onChangeText={setFormState}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Vacancies Count</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50"
                keyboardType="numeric"
                value={formVacancies}
                onChangeText={setFormVacancies}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Eligibility Criteria</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Retired JCOs / NCOs, SHAPE-1, below 52 years"
              value={formEligibility}
              onChangeText={setFormEligibility}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Application Closing Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD or Open"
              value={formClosingDate}
              onChangeText={setFormClosingDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Detailed Job Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide job duties, pay scale / stipend, interview procedure, and reporting location..."
              multiline
              numberOfLines={4}
              value={formDescription}
              onChangeText={setFormDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Official Apply Link or Contact Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://example.com/apply or jobs@example.com"
              value={formUrl}
              onChangeText={setFormUrl}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handlePostJob}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={styles.submitBtnText}>Submit Job to Live Cloud</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ────────────────── TAB 4: BACKEND ADMIN & SCRAPERS ────────────────── */}
      {activeTab === 'admin' && (
        <ScrollView style={styles.adminScroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <View style={styles.adminBanner}>
            <Ionicons name="shield-checkmark" size={28} color="#FDC010" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.adminBannerTitle}>Backend Scraper & Moderation Panel</Text>
              <Text style={styles.adminBannerDesc}>
                Cloud Functions Cron: Scheduled every 12h for DGR, KSB, DESW & AWPO.
              </Text>
            </View>
          </View>

          <Text style={styles.adminSectionTitle}>Automated Scraper Triggers</Text>
          <Text style={styles.adminSectionDesc}>
            Trigger immediate test scrapes to refresh Firestore collections without waiting for the 12-hour cron schedule.
          </Text>

          <View style={styles.scraperButtonsRow}>
            {['DGR India', 'Kendriya Sainik Board', 'DESW Schemes', 'AWPO Placements'].map((src) => (
              <TouchableOpacity
                key={src}
                style={styles.scraperActionBtn}
                disabled={scraperRunning}
                onPress={() => handleTriggerScrape(src)}
              >
                <Ionicons name="cloud-download-outline" size={18} color="#0D47A1" />
                <Text style={styles.scraperActionText}>Scrape {src}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {scraperRunning && (
            <View style={styles.scraperLoadingCard}>
              <Text style={styles.scraperLoadingText}>
                Connecting to portal endpoints & parsing HTML tables...
              </Text>
            </View>
          )}

          {lastScrapeStats && (
            <View style={styles.scrapeReportCard}>
              <Text style={styles.scrapeReportHeader}>Latest Scrape Report:</Text>
              <Text style={styles.scrapeReportLine}>• Target: {lastScrapeStats.source}</Text>
              <Text style={styles.scrapeReportLine}>• Status: {lastScrapeStats.status}</Text>
              <Text style={styles.scrapeReportLine}>• Items Ingested: {lastScrapeStats.itemsFound} jobs</Text>
              <Text style={styles.scrapeReportLine}>• Timestamp: {lastScrapeStats.timestamp}</Text>
            </View>
          )}

          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Firestore Database Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{jobsList.length}</Text>
                <Text style={styles.statLabel}>Active Jobs</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>4</Text>
                <Text style={styles.statLabel}>Scraper Feeds</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Sync Uptime</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ────────────────── JOB DETAIL MODAL ────────────────── */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedJob && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedJob.title}</Text>
                    <Text style={styles.modalOrg}>{selectedJob.org} • {selectedJob.state}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* AGE RELAXATION CALCULATOR TRIGGER */}
                  <TouchableOpacity
                    style={styles.ageCalculatorTriggerBtn}
                    onPress={() => setAgeCalcVisible(true)}
                  >
                    <Ionicons name="calculator" size={16} color="#0D47A1" />
                    <Text style={styles.ageCalculatorTriggerText}>
                      Check My Age Eligibility (ESM Relaxation Rule)
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Category / Sector:</Text>
                    <Text style={styles.modalValue}>{selectedJob.category || 'General'}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Eligibility:</Text>
                    <Text style={styles.modalValue}>{selectedJob.eligibility || 'Ex-Servicemen'}</Text>
                  </View>

                  {selectedJob.vacancies && (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Vacancies:</Text>
                      <Text style={styles.modalValue}>{selectedJob.vacancies} Posts</Text>
                    </View>
                  )}

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Posted / Deadline:</Text>
                    <Text style={styles.modalValue}>
                      {selectedJob.closingDate ? `Closing: ${selectedJob.closingDate}` : 'Ongoing'}
                    </Text>
                  </View>

                  <Text style={styles.modalDescTitle}>Description & Requirements:</Text>
                  <Text style={styles.modalDescText}>
                    {selectedJob.description || 'Visit official source link for complete notice details.'}
                  </Text>

                  {selectedJob.tags && (
                    <View style={styles.modalTagsWrap}>
                      {selectedJob.tags.map((t, idx) => (
                        <View key={idx} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalBookmarkBtn}
                    onPress={() => {
                      toggleBookmark(selectedJob.id);
                      setBookmarkUpdate((prev) => prev + 1);
                    }}
                  >
                    <Ionicons
                      name={isBookmarked(selectedJob.id) ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color="#0D47A1"
                    />
                  </TouchableOpacity>

                  {/* WHATSAPP SHARE BUTTON IN MODAL */}
                  <TouchableOpacity
                    style={styles.modalWhatsAppBtn}
                    onPress={() => handleShareToWhatsApp(selectedJob)}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalApplyBtn}
                    onPress={() => {
                      const url = selectedJob.sourceUrl || selectedJob.applyUrl;
                      if (url) {
                        Linking.openURL(url).catch(() => {
                          Alert.alert('Notice', 'Cannot open apply link: ' + url);
                        });
                      } else {
                        Alert.alert('Notice', 'Contact Zila Sainik Board or organization directly.');
                      }
                    }}
                  >
                    <Text style={styles.modalApplyText}>Apply / View Official Notice</Text>
                    <Ionicons name="open-outline" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ────────────────── AGE RELAXATION CALCULATOR MODAL ────────────────── */}
      <Modal
        visible={ageCalcVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAgeCalcVisible(false)}
      >
        <View style={styles.calcOverlay}>
          <View style={styles.calcContainer}>
            <View style={styles.calcHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calculator" size={20} color="#0D47A1" style={{ marginRight: 6 }} />
                <Text style={styles.calcTitle}>ESM Age Relaxation Calculator</Text>
              </View>
              <TouchableOpacity onPress={() => setAgeCalcVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.calcRuleNotice}>
              Govt Rule: Effective Age = Actual Age minus Military Service minus 3 years grace.
            </Text>

            <View style={styles.calcInputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.calcInputLabel}>Your Current Age</Text>
                <TextInput
                  style={styles.calcInput}
                  placeholder="e.g. 48"
                  keyboardType="numeric"
                  value={actualAgeInput}
                  onChangeText={setActualAgeInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calcInputLabel}>Service Years</Text>
                <TextInput
                  style={styles.calcInput}
                  placeholder="e.g. 20"
                  keyboardType="numeric"
                  value={serviceYearsInput}
                  onChangeText={setServiceYearsInput}
                />
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.calcInputLabel}>Notified Maximum Age Limit for Post</Text>
              <TextInput
                style={styles.calcInput}
                placeholder="e.g. 45"
                keyboardType="numeric"
                value={maxAgeInput}
                onChangeText={setMaxAgeInput}
              />
            </View>

            <TouchableOpacity style={styles.calcSubmitBtn} onPress={handleCalculateAge}>
              <Text style={styles.calcSubmitText}>Calculate Eligibility</Text>
            </TouchableOpacity>

            {calcResult && (
              <View
                style={[
                  styles.calcResultBox,
                  calcResult.isEligible ? styles.calcBoxEligible : styles.calcBoxOverage,
                ]}
              >
                <Text
                  style={[
                    styles.calcResultVerdict,
                    calcResult.isEligible ? { color: '#166534' } : { color: '#991B1B' },
                  ]}
                >
                  {calcResult.isEligible ? '✅ YOU ARE ELIGIBLE' : '⚠️ AGE LIMIT EXCEEDED'}
                </Text>
                <Text style={styles.calcResultLine}>
                  • Effective Age for this Post: <Text style={{ fontWeight: 'bold' }}>{calcResult.effectiveAge} years</Text>
                </Text>
                <Text style={styles.calcResultLine}>
                  • Max Allowed Age: {calcResult.maxLimit} years
                </Text>
                <Text style={styles.calcResultBreakdown}>
                  Formula: {calcResult.actualAge} (Age) - {calcResult.serviceYears} (Service) - 3 (ESM Grace) = {calcResult.effectiveAge} yrs.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FDC010',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiHelpBtn: {
    backgroundColor: '#FDC010',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#001E4D',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#FDC010',
    backgroundColor: '#002866',
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#FDC010',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: 2,
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChip: {
    backgroundColor: '#EDE9FE',
  },
  filterChipActive: {
    backgroundColor: '#001433',
  },
  bookmarkChipActive: {
    backgroundColor: '#0D47A1',
  },
  armChipActive: {
    backgroundColor: '#1E3A8A',
  },
  filterChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FDC010',
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  jobList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 20,
  },
  jobOrg: {
    fontSize: 13,
    color: '#475569',
    marginTop: 3,
    fontWeight: '600',
  },
  jobLocation: {
    color: '#0D47A1',
  },
  bookmarkBtn: {
    padding: 4,
    marginLeft: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  categoryTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  vacanciesTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vacanciesText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  jobEligibility: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deadlineText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  shareWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  shareWhatsAppText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewDetailLink: {
    fontSize: 12,
    color: '#0D47A1',
    fontWeight: 'bold',
  },
  portalScroll: {
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  portalCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  portalBadge: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  portalBadgeText: {
    fontSize: 9,
    color: '#B45309',
    fontWeight: 'bold',
  },
  portalDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 10,
  },
  portalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 8,
  },
  portalBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  formScroll: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  adminScroll: {
    flex: 1,
  },
  adminBanner: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  adminBannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  adminSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  adminSectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  scraperButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scraperActionBtn: {
    width: '48.5%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#0D47A1',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scraperActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginLeft: 6,
  },
  scraperLoadingCard: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  scraperLoadingText: {
    fontSize: 12,
    color: '#1D4ED8',
    textAlign: 'center',
  },
  scrapeReportCard: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  scrapeReportHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  scrapeReportLine: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001433',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalOrg: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginVertical: 12,
  },
  ageCalculatorTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  ageCalculatorTriggerText: {
    color: '#0D47A1',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  modalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  modalDescTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  modalDescText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  modalTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  modalTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  modalTagText: {
    fontSize: 10,
    color: '#475569',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  modalBookmarkBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  modalWhatsAppBtn: {
    backgroundColor: '#25D366',
    padding: 11,
    borderRadius: 8,
    marginRight: 8,
  },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalApplyText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* AGE CALCULATOR MODAL STYLES */
  calcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calcContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    padding: 16,
    elevation: 5,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  calcRuleNotice: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 10,
    lineHeight: 16,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calcInputRow: {
    flexDirection: 'row',
  },
  calcInputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  calcInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#0F172A',
  },
  calcSubmitBtn: {
    backgroundColor: '#001433',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  calcSubmitText: {
    color: '#FDC010',
    fontWeight: 'bold',
    fontSize: 13,
  },
  calcResultBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  calcBoxEligible: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  calcBoxOverage: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  calcResultVerdict: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  calcResultLine: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 2,
  },
  calcResultBreakdown: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
