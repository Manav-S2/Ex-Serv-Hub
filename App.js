import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Alert,
  TextInput
} from 'react-native';
import { 
  Ionicons, 
  FontAwesome5, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

const KNOWLEDGE_BASE = require('./assets/data/knowledge_base.json');

const retrieveContext = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Score each chunk based on how many keywords match the user's query
  const scoredChunks = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    chunk.keywords.forEach(kw => {
      if (lowerQuery.includes(kw.toLowerCase())) {
        score++;
      }
    });
    return { ...chunk, score };
  });

  // Filter out chunks with 0 score, sort by highest score, and pick all relevant ones
  const relevantChunks = scoredChunks
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (relevantChunks.length > 0) {
    return relevantChunks.map(c => c.content).join('\n\n');
  }
  return "No specific ex-servicemen context found in local database. Advise the user to contact their Zila Sainik Board.";
};

// Services Grid Data: 1. DESW, 2. SPARSH, 3. ECHS, 4. DGR, 5. KSB, 6. RSB, 7. ZSB, 8. CSD, 9. AWPO
const SERVICES_DATA = [
  { id: '1', title: 'DESW', subtitle: 'Ex-Servicemen Welfare\nSchemes & Benefits', icon: 'hand-heart', family: 'MaterialCommunityIcons', color: '#00695C', url: 'http://desw.gov.in/' },
  { id: '2', title: 'SPARSH', subtitle: 'Pension, PPO,\nGuidelines, Status', icon: 'user-alt', family: 'FontAwesome5', color: '#1B5E20', url: 'https://sparsh.defencepension.gov.in/' },
  { id: '3', title: 'ECHS', subtitle: 'Polyclinic, Hospital,\nEmpanelment, Claim', icon: 'hospital-building', family: 'MaterialCommunityIcons', color: '#1565C0', url: 'https://echs.gov.in/' },
  { id: '4', title: 'DGR', subtitle: 'Resettlement & Jobs,\nTraining & Placement', icon: 'briefcase', family: 'FontAwesome5', color: '#6A1B9A', url: 'http://dgrindia.gov.in/' },
  { id: '5', title: 'KSB', subtitle: 'Welfare Schemes,\nScholarships,\nFinancial Help', icon: 'shield-star', family: 'MaterialCommunityIcons', color: '#B71C1C', url: 'https://www.ksb.gov.in/' },
  { id: '6', title: 'RSB', subtitle: 'Rajya Sainik Board,\nState Welfare, Contact', icon: 'shield-account', family: 'MaterialCommunityIcons', color: '#1A237E', url: 'https://www.ksb.gov.in/rajya-sainik-board.htm' },
  { id: '7', title: 'ZSB', subtitle: 'राज्य व जिला की योजनाएं,\nसंपर्क व लाभ', icon: 'map', family: 'FontAwesome5', color: '#0D47A1' },
  { id: '8', title: 'CSD', subtitle: 'Canteen, Purchase\nFacility, Online Info', icon: 'cart', family: 'MaterialCommunityIcons', color: '#EF6C00', url: 'https://csdindia.gov.in/' },
  { id: '9', title: 'AWPO', subtitle: 'Army Welfare\nPlacement Org', icon: 'shield-check', family: 'MaterialCommunityIcons', color: '#2E7D32', url: 'https://www.exarmynaukri.com/' },
];

const ZSB_DIRECTORY = require('./assets/data/zsb_directory.json');
const CSD_DEALERS = require('./assets/data/csd_dealers.json');

const RSB_LINKS = ZSB_DIRECTORY.map(entry => ({
  state: entry.state,
  url: entry.url,
  districts: entry.districts
}));

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();

  const getHeaderPaddingTop = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.top + 16, 54);
    }
    if (Platform.OS === 'android') {
      return (StatusBar.currentHeight || 24) + 16;
    }
    return 48;
  };

  const getBottomNavPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 0 ? insets.bottom + 10 : 34;
    }
    return 24;
  };

  const [currentScreen, setCurrentScreen] = useState('Home');
  const [expandedState, setExpandedState] = useState(null);
  const [expandedRsbState, setExpandedRsbState] = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);

  const getDswName = (state) => {
    const dswMap = {
      'Punjab': 'Department of Sainik Welfare, Punjab (DSW)',
      'Assam': 'Directorate of Sainik Welfare, Assam (DSW)',
      'Maharashtra': 'Directorate of Sainik Welfare, Maharashtra (DSW)',
      'Rajasthan': 'Directorate of Sainik Kalyan, Rajasthan',
      'Haryana': 'Department of Sainik & Ardh Sainik Welfare, Haryana (DSW)',
      'Tamil Nadu': "Directorate of Ex-Servicemen's Welfare, Tamil Nadu",
      'Kerala': 'Department of Sainik Welfare, Kerala (DSW)',
      'Karnataka': 'Department of Sainik Welfare & Resettlement, Karnataka',
      'Uttar Pradesh': 'Sainik Welfare & Punarvas Department, Uttar Pradesh',
      'Madhya Pradesh': 'Directorate of Sainik Welfare, Madhya Pradesh (Sainik Kalyan)',
      'Bihar': 'Sainik Kalyan Nideshalaya, Bihar',
      'West Bengal': 'Directorate of Sainik Welfare, West Bengal (RSB)',
      'Delhi (NCT)': 'Rajya Sainik Board, Govt of NCT Delhi',
      'Telangana': 'Department of Sainik Welfare, Telangana (DSW)',
      'Andhra Pradesh': 'Directorate of Sainik Welfare, Andhra Pradesh',
      'Uttarakhand': 'Directorate of Sainik Kalyan, Uttarakhand',
      'Himachal Pradesh': 'Department of Sainik Welfare, Himachal Pradesh',
      'Jammu and Kashmir': 'Sainik Welfare Department, J&K',
      'Gujarat': 'Directorate of Sainik Welfare, Gujarat',
      'Chhattisgarh': 'Rajya Sainik Board & DSW, Chhattisgarh',
      'Goa': 'Department of Sainik Welfare, Goa (DSW)',
      'Meghalaya': 'Directorate of Sainik Welfare, Meghalaya (DSW)',
      'Mizoram': 'Directorate of Sainik Welfare, Mizoram (DSW)',
      'Nagaland': 'Directorate of Sainik Welfare, Nagaland (DSW)',
      'Puducherry (UT)': 'Department of Sainik Welfare, Puducherry',
    };
    return dswMap[state] || `Directorate of Sainik Welfare, ${state} (DSW / RSB)`;
  };
  
  const [messages, setMessages] = useState([
    { id: '0', text: 'Hello! I am your Ex-Servicemen AI Guide. How can I help you today with SPARSH, ECHS, CSD, or Pensions?', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "⚠️ API Key missing! Please add your Gemini API Key in App.js to enable the AI.", sender: 'ai' }]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const context = retrieveContext(userMsg.text);
      const systemPrompt = `You are a helpful Ex-Servicemen AI assistant. 
Use the following verified knowledge base context to answer the user if relevant:
<context>
${context}
</context>
Be concise, respectful, and answer in the language the user speaks.`;

      const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
      const finalPrompt = `${systemPrompt}\n\nChat History:\n${history}\nUser: ${userMsg.text}\nAI:`;

      const result = await model.generateContent(finalPrompt);
      const aiResponseText = result.response.text();

      setMessages(prev => [...prev, { id: Date.now().toString(), text: aiResponseText, sender: 'ai' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, I encountered an error connecting to the server.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderIcon = (family, name, color, size) => {
    if (family === 'FontAwesome5') return <FontAwesome5 name={name} size={size} color={color} />;
    if (family === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={name} size={size} color={color} />;
    return <Ionicons name={name} size={size} color={color} />;
  };

  const renderCardActions = (color, url, id) => (
    <View style={styles.cardActions}>
      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => {
          if (id === '6') {
            setCurrentScreen('RSB');
          } else if (id === '7') {
            setCurrentScreen('ZSB');
          } else if (id === '8') {
            setCurrentScreen('CSDDealers');
          } else if (id === '10') {
            setCurrentScreen('Jobs');
          } else if (id === '11') {
            setCurrentScreen('ChatAI');
          } else if (url) {
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert("Error", "Cannot open URL: " + url);
              }
            }).catch(err => {
              Alert.alert("Error", "Failed to open link");
            });
          } else {
            Alert.alert("Notice", "Website link is currently unavailable.");
          }
        }}
      >
        <Ionicons name="globe-outline" size={14} color={color} />
        <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>Website</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name="logo-youtube" size={14} color="#D32F2F" />
        <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>YouTube</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => setCurrentScreen('ChatAI')}>
        <MaterialCommunityIcons name="robot-outline" size={14} color="#6A1B9A" />
        <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>Ask AI</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────── JOBS SCREEN ───────────────────
  if (currentScreen === 'Jobs') {
    const JOB_PORTALS = [
      {
        id: 'dgr',
        title: 'DGR – Directorate General of Resettlement',
        subtitle: 'Official govt portal for ESM jobs, training & placement. New vacancies updated regularly.',
        tag: 'OFFICIAL GOVT',
        tagColor: '#1565C0',
        icon: 'briefcase',
        family: 'FontAwesome5',
        color: '#6A1B9A',
        url: 'http://dgrindia.gov.in/',
        badge: 'Most Jobs',
      },
      {
        id: 'ksb',
        title: 'KSB – Kendriya Sainik Board',
        subtitle: 'Job fairs, career counseling, scholarship & financial help for ex-servicemen & widows.',
        tag: 'WELFARE',
        tagColor: '#B71C1C',
        icon: 'shield-star',
        family: 'MaterialCommunityIcons',
        color: '#B71C1C',
        url: 'https://www.ksb.gov.in/',
        badge: null,
      },
      {
        id: 'desw',
        title: 'DESW – Dept of Ex-Servicemen Welfare',
        subtitle: 'Welfare schemes, employment assistance & re-employment policy orders from MoD.',
        tag: 'MINISTRY OF DEFENCE',
        tagColor: '#00695C',
        icon: 'hand-heart',
        family: 'MaterialCommunityIcons',
        color: '#00695C',
        url: 'http://desw.gov.in/',
        badge: null,
      },
      {
        id: 'sainik',
        title: 'Sainik Welfare – State Boards',
        subtitle: 'State-level job notifications, local employment camps & district welfare offices.',
        tag: 'STATE LEVEL',
        tagColor: '#0D47A1',
        icon: 'map-marked-alt',
        family: 'FontAwesome5',
        color: '#0D47A1',
        url: null,
        screenNav: 'RSB',
        badge: null,
      },
      {
        id: 'ncs',
        title: 'NCS – National Career Service Portal',
        subtitle: 'Govt of India job portal. Filter by "Ex-Servicemen" category for reserved vacancies.',
        tag: 'GOVT OF INDIA',
        tagColor: '#2E7D32',
        icon: 'laptop',
        family: 'FontAwesome5',
        color: '#2E7D32',
        url: 'https://www.ncs.gov.in/',
        badge: null,
      },
      {
        id: 'psu',
        title: 'PSU / Central Govt Reservation',
        subtitle: '10% reservation in Group C & D for ex-servicemen in Central Govt & PSUs per DoP&T orders.',
        tag: '10% RESERVATION',
        tagColor: '#EF6C00',
        icon: 'university',
        family: 'FontAwesome5',
        color: '#EF6C00',
        url: 'https://doptcirculars.nic.in/',
        badge: null,
      },
      {
        id: 'cpf',
        title: 'CPF / CAPF Jobs (BSF, CISF, CRPF…)',
        subtitle: 'Central Armed Police Forces offer direct entry / re-employment for ESM up to specific age limits.',
        tag: 'PARAMILITARY',
        tagColor: '#4527A0',
        icon: 'shield-alt',
        family: 'FontAwesome5',
        color: '#4527A0',
        url: 'https://www.mha.gov.in/en/recruitment',
        badge: null,
      },
      {
        id: 'echs_emp',
        title: 'ECHS – Polyclinic Staff Vacancies',
        subtitle: 'ECHS polyclinics hire ex-servicemen (medical background) as support & admin staff.',
        tag: 'HEALTH SECTOR',
        tagColor: '#1565C0',
        icon: 'hospital-building',
        family: 'MaterialCommunityIcons',
        color: '#1565C0',
        url: 'https://echs.gov.in/',
        badge: null,
      },
    ];

    return (
      <View style={styles.masterContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#001433" />
        {/* Header */}
        <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
          <TouchableOpacity style={styles.headerMenu} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              <Text style={{ color: '#FFF' }}>JOBS</Text>{' '}
              <Text style={{ color: '#FDC010' }}>PORTAL</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Ex-Servicemen Employment Hub</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={{
            backgroundColor: '#001433',
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#FDC010',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: '#00838F',
              borderRadius: 30,
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 14,
            }}>
              <FontAwesome5 name="briefcase" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FDC010', fontWeight: 'bold', fontSize: 15 }}>सरकारी नौकरी के अवसर</Text>
              <Text style={{ color: '#CBD5E1', fontSize: 11, marginTop: 3, lineHeight: 16 }}>
                Official government portals with reserved vacancies & resettlement support for Ex-Servicemen.
              </Text>
            </View>
          </View>

          {/* Portals List */}
          {JOB_PORTALS.map((portal) => (
            <View
              key={portal.id}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: portal.color + '55',
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                overflow: 'hidden',
              }}
            >
              {/* Top colored stripe */}
              <View style={{ height: 4, backgroundColor: portal.color }} />

              <View style={{ padding: 14 }}>
                {/* Tag row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={[
                    {
                      backgroundColor: portal.tagColor + '18',
                      borderRadius: 4,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: portal.tagColor + '55',
                    }
                  ]}>
                    <Text style={{ color: portal.tagColor, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>
                      {portal.tag}
                    </Text>
                  </View>
                  {portal.badge && (
                    <View style={{
                      marginLeft: 8,
                      backgroundColor: '#FDC010',
                      borderRadius: 4,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                    }}>
                      <Text style={{ color: '#001433', fontSize: 9, fontWeight: 'bold' }}>⭐ {portal.badge}</Text>
                    </View>
                  )}
                </View>

                {/* Icon + Title row */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{
                    backgroundColor: portal.color + '18',
                    borderRadius: 10,
                    width: 42,
                    height: 42,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: portal.color + '40',
                  }}>
                    {portal.family === 'FontAwesome5'
                      ? <FontAwesome5 name={portal.icon} size={18} color={portal.color} />
                      : portal.family === 'MaterialCommunityIcons'
                      ? <MaterialCommunityIcons name={portal.icon} size={18} color={portal.color} />
                      : <Ionicons name={portal.icon} size={18} color={portal.color} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1A1A2E', fontSize: 13, lineHeight: 18 }}>
                      {portal.title}
                    </Text>
                    <Text style={{ color: '#607D8B', fontSize: 11, marginTop: 4, lineHeight: 15 }}>
                      {portal.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: portal.color,
                      borderRadius: 8,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      if (portal.screenNav) {
                        setCurrentScreen(portal.screenNav);
                      } else if (portal.url) {
                        Linking.openURL(portal.url).catch(() => Alert.alert('Error', 'Cannot open link'));
                      }
                    }}
                  >
                    <Ionicons name="globe-outline" size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>
                      {portal.screenNav ? 'View State Boards' : 'Visit Portal'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#6A1B9A' + '18',
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#6A1B9A' + '44',
                    }}
                    onPress={() => setCurrentScreen('ChatAI')}
                  >
                    <MaterialCommunityIcons name="robot-outline" size={14} color="#6A1B9A" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#6A1B9A', fontWeight: 'bold', fontSize: 12 }}>Ask AI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Community Tip Banner */}
          <View style={{
            backgroundColor: '#F0FFF4',
            borderRadius: 12,
            padding: 16,
            marginTop: 4,
            borderWidth: 1.5,
            borderColor: '#2E7D32' + '44',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="people-outline" size={20} color="#2E7D32" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: 'bold', color: '#2E7D32', fontSize: 13 }}>Community Job Tips</Text>
            </View>
            <Text style={{ color: '#4A5568', fontSize: 12, lineHeight: 18 }}>
              Know of a job opening for ex-servicemen? Help your community by sharing it through our AI Assistant.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#2E7D32',
                borderRadius: 8,
                paddingVertical: 10,
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setCurrentScreen('ChatAI')}
            >
              <MaterialCommunityIcons name="robot-outline" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Share via AI Assistant</Text>
            </TouchableOpacity>
          </View>

          {/* Legal note */}
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={{ color: '#9E9E9E', fontSize: 10, textAlign: 'center', lineHeight: 15 }}>
              ⚖️ This app only links to official government portals. No job data is scraped or stored.
              All listings are sourced from verified govt sources as per IT Act 2000 & DPDP Act 2023.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────── RSB SCREEN (State Level DSW & Rajya Sainik Boards) ───────────────────
  if (currentScreen === 'RSB') {
    return (
      <View style={styles.masterContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#001433" />
        <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
          <TouchableOpacity style={styles.headerMenu} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}><Text style={{color: '#FFF'}}>RSB & DSW</Text> <Text style={{color: '#FDC010'}}>PORTALS</Text></Text>
            <Text style={styles.headerSubtitle}>State Sainik Welfare Departments & Directorates</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 20, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'column' }}>
            {RSB_LINKS.map(link => {
              const isExpanded = expandedRsbState === link.state;
              const dswTitle = getDswName(link.state);
              return (
                <View key={link.state} style={{ marginBottom: 12 }}>
                  <TouchableOpacity 
                    style={[
                      styles.stateBlock, 
                      isExpanded && styles.stateBlockExpanded,
                      { backgroundColor: '#1A237E' }
                    ]} 
                    onPress={() => setExpandedRsbState(isExpanded ? null : link.state)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.stateBlockText, { color: '#FFF', fontSize: 13 }]}>{link.state}</Text>
                      <Text style={{ fontSize: 10, color: '#90CAF9', marginTop: 2 }} numberOfLines={1}>{dswTitle}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FDC010" />
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
                        onPress={() => Linking.openURL(link.url).catch(() => Alert.alert('Error', 'Cannot open link'))}
                      >
                        <Ionicons name="globe-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.visitPortalText}>Visit Official {link.state} DSW Portal</Text>
                      </TouchableOpacity>

                      {/* DSW SERVICES INFO */}
                      <View style={{ backgroundColor: '#F1F5F9', borderRadius: 6, padding: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#334155', marginBottom: 4 }}>Key DSW Services & Welfare Benefits:</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• ESM Registration & Identity Card Issuance</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• Financial Assistance & Widows Welfare Grants</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• Prime Minister's Scholarship Scheme (PMSS) Verification</Text>
                        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 14 }}>• State Job Reservation Certificates & Self-Employment Loans</Text>
                      </View>

                      {/* SWITCH TO ZSB DISTRICTS BUTTON */}
                      <TouchableOpacity 
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: '#0D47A1',
                          borderRadius: 6,
                          backgroundColor: '#E3F2FD',
                        }}
                        onPress={() => {
                          setExpandedState(link.state);
                          setCurrentScreen('ZSB');
                        }}
                      >
                        <Ionicons name="location" size={14} color="#0D47A1" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#0D47A1', fontWeight: 'bold', fontSize: 11 }}>View {link.state} Zila Sainik Boards (Districts)</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────── ZSB SCREEN (Zila Sainik Boards) ───────────────────
  if (currentScreen === 'ZSB' || currentScreen === 'RSBZSB') {
    return (
      <View style={styles.masterContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#001433" />
        <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
          <TouchableOpacity style={styles.headerMenu} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}><Text style={{color: '#FFF'}}>ZSB</Text> <Text style={{color: '#FDC010'}}>PORTALS</Text></Text>
            <Text style={styles.headerSubtitle}>Zila Sainik Welfare Offices (Districts)</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 20, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'column' }}>
            {RSB_LINKS.map(link => (
              <View key={link.state} style={{ marginBottom: 12 }}>
                <TouchableOpacity 
                  style={[styles.stateBlock, expandedState === link.state && styles.stateBlockExpanded]} 
                  onPress={() => setExpandedState(expandedState === link.state ? null : link.state)}
                >
                  <Text style={styles.stateBlockText}>{link.state}</Text>
                  <Ionicons name={expandedState === link.state ? "chevron-up" : "chevron-down"} size={20} color="#0D47A1" />
                </TouchableOpacity>
                
                {expandedState === link.state && (
                  <View style={styles.accordionContent}>
                    <TouchableOpacity 
                      style={styles.visitPortalBtn}
                      onPress={() => Linking.openURL(link.url).catch(() => Alert.alert('Error', 'Cannot open link'))}
                    >
                      <Ionicons name="globe-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.visitPortalText}>Visit {link.state} RSB Portal</Text>
                    </TouchableOpacity>
                    
                    {link.districts && link.districts.length > 0 ? (
                      <View style={styles.districtList}>
                        <Text style={styles.districtListTitle}>Zila Sainik Boards ({link.state} Districts):</Text>
                        {link.districts.map(d => (
                          <View key={d.name} style={styles.districtCard}>
                            <Text style={styles.districtName}>{d.name}</Text>
                            {d.url && (
                              <TouchableOpacity 
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}
                                onPress={() => Linking.openURL(d.url).catch(() => Alert.alert('Error', 'Cannot open link'))}
                              >
                                <Ionicons name="link-outline" size={14} color="#00838F" />
                                <Text style={[styles.districtDetail, { color: '#00838F', marginLeft: 4, textDecorationLine: 'underline' }]}>Visit District Portal</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noDistrictText}>District-level portal not available online. Please visit the State RSB Portal for contact details.</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === 'CSDDealers') {
    return (
      <View style={styles.masterContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#001433" />
        <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
          <TouchableOpacity style={styles.headerMenu} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}><Text style={{color: '#FFF'}}>CSD AFD</Text> <Text style={{color: '#FDC010'}}>DEALERS</Text></Text>
            <Text style={styles.headerSubtitle}>Authorized Cars, Bikes, & Electronics</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 24, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'column' }}>
            {CSD_DEALERS.map(stateObj => (
              <View key={stateObj.state} style={{ marginBottom: 12 }}>
                <TouchableOpacity 
                  style={[styles.stateBlock, expandedState === stateObj.state && styles.stateBlockExpanded, {backgroundColor: '#EF6C00'}]} 
                  onPress={() => setExpandedState(expandedState === stateObj.state ? null : stateObj.state)}
                >
                  <Text style={styles.stateBlockText}>{stateObj.state}</Text>
                  <Ionicons name={expandedState === stateObj.state ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
                </TouchableOpacity>
                
                {expandedState === stateObj.state && (
                  <View style={styles.accordionContent}>
                    
                    {stateObj.districts && stateObj.districts.length > 0 ? (
                      <View style={styles.districtList}>
                        {stateObj.districts.map(d => {
                          const distKey = `${stateObj.state}-${d.name}`;
                          return (
                          <View key={d.name} style={[styles.districtCard, {marginBottom: 8}]}>
                            <TouchableOpacity 
                              style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
                              onPress={() => setExpandedDistrict(expandedDistrict === distKey ? null : distKey)}
                            >
                              <Text style={[styles.districtName, {color: '#EF6C00', fontSize: 16}]}>{d.name}</Text>
                              <Ionicons name={expandedDistrict === distKey ? "chevron-up" : "chevron-down"} size={16} color="#666" />
                            </TouchableOpacity>
                            
                            {expandedDistrict === distKey && (
                              <View style={{marginTop: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8}}>
                                {/* 4-Wheelers */}
                                <Text style={{fontWeight: 'bold', color: '#333'}}>🚗 4-Wheelers (Cars)</Text>
                            {d.four_wheelers.length > 0 ? (
                              d.four_wheelers.map((dealer, idx) => (
                                <View key={idx} style={{marginLeft: 10, marginTop: 4}}>
                                  <Text style={{fontWeight: '600'}}>{dealer.dealer}</Text>
                                  <Text style={{color: '#666', fontSize: 12}}>{dealer.address}</Text>
                                  <Text style={{color: '#00838F', fontSize: 12}}>📞 {dealer.phone}</Text>
                                </View>
                              ))
                            ) : (
                              <TouchableOpacity 
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 10}}
                                onPress={() => Linking.openURL('https://afd.csdindia.gov.in/').catch(() => Alert.alert('Error', 'Cannot open link'))}
                              >
                                <Ionicons name="search" size={14} color="#00838F" />
                                <Text style={[styles.districtDetail, { color: '#00838F', marginLeft: 4, textDecorationLine: 'underline' }]}>Find Cars on CSD Portal</Text>
                              </TouchableOpacity>
                            )}

                            {/* 2-Wheelers */}
                            <Text style={{fontWeight: 'bold', marginTop: 12, color: '#333'}}>🏍️ 2-Wheelers (Bikes/Scooters)</Text>
                            {d.two_wheelers.length > 0 ? (
                              d.two_wheelers.map((dealer, idx) => (
                                <View key={idx} style={{marginLeft: 10, marginTop: 4}}>
                                  <Text style={{fontWeight: '600'}}>{dealer.dealer}</Text>
                                  <Text style={{color: '#666', fontSize: 12}}>{dealer.address}</Text>
                                  <Text style={{color: '#00838F', fontSize: 12}}>📞 {dealer.phone}</Text>
                                </View>
                              ))
                            ) : (
                              <TouchableOpacity 
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 10}}
                                onPress={() => Linking.openURL('https://afd.csdindia.gov.in/').catch(() => Alert.alert('Error', 'Cannot open link'))}
                              >
                                <Ionicons name="search" size={14} color="#00838F" />
                                <Text style={[styles.districtDetail, { color: '#00838F', marginLeft: 4, textDecorationLine: 'underline' }]}>Find Bikes on CSD Portal</Text>
                              </TouchableOpacity>
                            )}

                            {/* Electronics */}
                            <Text style={{fontWeight: 'bold', marginTop: 12, color: '#333'}}>📺 Electronics & Durables</Text>
                            {d.electronics.length > 0 ? (
                              d.electronics.map((dealer, idx) => (
                                <View key={idx} style={{marginLeft: 10, marginTop: 4}}>
                                  <Text style={{fontWeight: '600'}}>{dealer.dealer}</Text>
                                  <Text style={{color: '#666', fontSize: 12}}>{dealer.address}</Text>
                                  <Text style={{color: '#00838F', fontSize: 12}}>📞 {dealer.phone}</Text>
                                </View>
                              ))
                            ) : (
                              <TouchableOpacity 
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 10}}
                                onPress={() => Linking.openURL('https://afd.csdindia.gov.in/').catch(() => Alert.alert('Error', 'Cannot open link'))}
                              >
                                <Ionicons name="search" size={14} color="#00838F" />
                                <Text style={[styles.districtDetail, { color: '#00838F', marginLeft: 4, textDecorationLine: 'underline' }]}>Find Electronics on CSD Portal</Text>
                              </TouchableOpacity>
                            )}
                            
                              </View>
                            )}
                          </View>
                        )})}
                      </View>
                    ) : (
                      <Text style={styles.noDistrictText}>District-level data not available. Please visit the CSD Portal.</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === 'ChatAI') {
    return (
      <View style={styles.masterContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#001433" />
        <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
          <TouchableOpacity style={styles.headerMenu} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}><Text style={{color: '#FFF'}}>ASK AI</Text> <Text style={{color: '#FDC010'}}>ASSISTANT</Text></Text>
            <Text style={styles.headerSubtitle}>Verified Ex-Servicemen Guide</Text>
          </View>
        </View>

        <View style={styles.chatContainer}>
          <ScrollView 
            style={styles.chatScroll} 
            contentContainerStyle={styles.chatScrollContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => (
              <View key={msg.id} style={[styles.chatBubbleWrapper, msg.sender === 'user' ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
                <View style={[styles.chatBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.chatBubbleWrapper, styles.bubbleWrapperLeft]}>
                <View style={[styles.chatBubble, styles.aiBubble, { width: 60 }]}>
                  <Text style={styles.aiText}>...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask about Pension, ECHS, etc..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    // Outer container ensures the notch/bezels take on the app's dark blue theme
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      
      {/* HEADER (Padded for iOS bezels / safe area and Android status bar) */}
      <View style={[styles.header, { paddingTop: getHeaderPaddingTop() }]}>
        <TouchableOpacity style={styles.headerMenu}>
          <Ionicons name="menu" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerLogoContainer}>
          <View style={{ position: 'relative', width: 38, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="shield" size={44} color="#FDC010" style={{ position: 'absolute' }} />
            <Ionicons name="person" size={20} color="#000" style={{ marginTop: -4 }} />
          </View>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}><Text style={{color: '#FFF'}}>EX-SERVICEMEN</Text> <Text style={{color: '#FDC010'}}>APP HUB</Text></Text>
          <Text style={styles.headerSubtitle}>ALL-IN-ONE With AI GUIDE</Text>
          <Text style={styles.headerHindi}>जानकारी • मार्गदर्शन और सहायता • एक ही जगह</Text>
        </View>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person-circle" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 140 }} // Prevents content hiding behind bottom nav
      >
        
        {/* HERO BANNER - Now exactly matching text styling without the white boxes */}
        <ImageBackground 
          source={require('./assets/hero-banner.png')} 
          style={styles.heroBanner}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSmallText}>We are here to</Text>
            <Text style={styles.heroLargeText}>Inform, Guide & Support</Text>
            <Text style={styles.heroLargeText}>Our Veterans</Text>
            
            <View style={styles.heroChecksRow}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.checkText}>सही जानकारी</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.checkText}>सही मार्गदर्शन</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.checkText}>सही सहायता</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* AI ASSISTANT CARD */}
        <View style={styles.aiCardContainer}>
          <View style={styles.aiIconBg}>
            <FontAwesome5 name="robot" size={24} color="#FFF" />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>Ask AI Assistant ✨</Text>
            <Text style={styles.aiSubtitle}>Pension, ECHS, CSD, Jobs, Schemes या</Text>
            <Text style={styles.aiSubtitle}>किसी भी जानकारी के लिए पूछें...</Text>
          </View>
          <TouchableOpacity style={styles.aiBtn} onPress={() => setCurrentScreen('ChatAI')}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#FFF" />
            <Text style={styles.aiBtnText}>Ask Now</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN SERVICES SECTION TITLE */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.line} />
          <Text style={styles.sectionTitleStar}>★</Text>
          <Text style={styles.sectionTitle}>मुख्य सेवाएं</Text>
          <Text style={styles.sectionTitleStar}>★</Text>
          <View style={styles.line} />
        </View>

        {/* CARDS 1-9 GRID */}
        <View style={styles.gridContainer}>
          {SERVICES_DATA.map((item) => (
            <View key={item.id} style={[styles.card, { borderColor: item.color }]}>
              <View style={[styles.cornerBadge, { backgroundColor: item.color }]}>
                <Text style={styles.cornerBadgeText}>{item.id}</Text>
              </View>

              <View style={styles.cardTop}>
                <TouchableOpacity 
                  style={[styles.cardIconWrap, { backgroundColor: item.color }]}
                  onPress={() => {
                    if (item.id === '6') {
                      setCurrentScreen('RSB');
                    } else if (item.id === '7') {
                      setCurrentScreen('ZSB');
                    } else if (item.id === '8') {
                      setCurrentScreen('CSDDealers');
                    } else if (item.url) {
                      Linking.openURL(item.url).catch(() => Alert.alert('Error', 'Cannot open link'));
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {renderIcon(item.family, item.icon, '#FFF', 20)}
                </TouchableOpacity>
                <View style={styles.cardTextWrap}>
                  <Text style={[styles.cardTitle, { color: item.color }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={3}>{item.subtitle}</Text>
                </View>
              </View>
              {renderCardActions(item.color, item.url, item.id)}
            </View>
          ))}
          {/* Spacer blocks to fix space-between layout on incomplete rows */}
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
              {/* Card 9 moved to grid */}

              {/* CARD 10 — JOBS */}
              <View style={[styles.card, styles.halfCard, { borderColor: '#00838F' }]}>
                <View style={[styles.cornerBadge, { backgroundColor: '#00838F' }]}>
                  <Text style={styles.cornerBadgeText}>10</Text>
                </View>
                <View style={styles.cardTop}>
                  <TouchableOpacity
                    style={[styles.cardIconWrap, { backgroundColor: '#00838F' }]}
                    onPress={() => setCurrentScreen('Jobs')}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="briefcase" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.cardTitle, { color: '#00838F' }]} numberOfLines={1}>JOBS</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={3}>Jobs, Training,{`\n`}Placement Options</Text>
                  </View>
                </View>
                {renderCardActions('#00838F', null, '10')}
              </View>

              {/* CARD 11 — RESUME */}
              <View style={[styles.card, styles.halfCard, { borderColor: '#4527A0' }]}>
                <View style={[styles.cornerBadge, { backgroundColor: '#4527A0' }]}>
                  <Text style={styles.cornerBadgeText}>11</Text>
                </View>
                <View style={styles.cardTop}>
                  <TouchableOpacity
                    style={[styles.cardIconWrap, { backgroundColor: '#4527A0' }]}
                    onPress={() => setCurrentScreen('ChatAI')}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="file-alt" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.cardTitle, { color: '#4527A0' }]} numberOfLines={1}>RESUME</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={3}>Make resume through AI</Text>
                  </View>
                </View>
                {renderCardActions('#4527A0', null, '11')}
              </View>
            </View>

            {/* YELLOW FREE BANNER */}
            <View style={styles.freeBanner}>
              <View style={styles.freeLeft}>
                <Ionicons name="gift" size={24} color="#D84315" />
                <Text style={styles.freeTitleText}>यह ऐप <Text style={styles.freeHighlight}>FREE</Text> है</Text>
              </View>
              <View style={styles.freeRight}>
                <View style={styles.badge100}>
                  <Text style={styles.badge100Text}>100%</Text>
                </View>
                <View style={styles.freeBullets}>
                  <Text style={styles.freeBulletText}>✔ कोई रजिस्ट्रेशन फीस नहीं</Text>
                  <Text style={styles.freeBulletText}>✔ कोई सदस्यता चार्ज नहीं</Text>
                  <Text style={styles.freeBulletText}>✔ पूरी तरह से निःशुल्क</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column (Red YouTube Box) */}
          <View style={styles.youtubePromoBox}>
             <View style={styles.ytHeader}>
               <Ionicons name="logo-youtube" size={20} color="#FFF" />
               <Text style={styles.ytHeaderText}>ऐप के बारे में{'\n'}जानें</Text>
             </View>
             <Text style={styles.ytBodyText}>इस ऐप की पूरी जानकारी,{'\n'}फीचर्स और उपयोग के लिए{'\n'}YouTube पर देखें</Text>
             
             {/* White Background, Red Text */}
             <TouchableOpacity style={styles.ytBtnWhite}>
               <Ionicons name="play" size={12} color="#D32F2F" />
               <Text style={styles.ytBtnTextRed}>Watch on YouTube</Text>
             </TouchableOpacity>
             
             {/* Red Background, White Text */}
             <TouchableOpacity style={styles.ytBtnRed}>
               <Ionicons name="notifications" size={12} color="#FFF" />
               <Text style={styles.ytBtnTextWhite}>Subscribe</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#1976D2" style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            यह ऐप केवल जानकारी और मार्गदर्शन के लिए है। यह सरकारी विभाग का आधिकारिक ऐप नहीं है।{'\n'}
            यहां दी गई जानकारी समय-समय पर अपडेट हो सकती है। कृपया आधिकारिक वेबसाइट पर जांच करें।
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR (Explicit bottom padding for safe area) */}
      <View style={[styles.bottomNav, { paddingBottom: getBottomNavPadding() }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#FDC010" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="robot-outline" size={22} color="#8898AA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={22} color="#8898AA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="star-outline" size={22} color="#8898AA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#8898AA" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#001433', // Forces top/bottom bezels to match theme
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Main app background color
  },
  stateBlock: {
    width: '100%',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 18,
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
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  visitPortalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  districtList: {
    marginTop: 4,
  },
  districtListTitle: {
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 8,
    fontSize: 13,
  },
  districtCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  districtName: {
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 4,
    fontSize: 13,
  },
  districtDetail: {
    fontSize: 11,
    color: '#546E7A',
    marginTop: 2,
  },
  noDistrictText: {
    fontSize: 12,
    color: '#607D8B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  stateBlockText: {
    color: '#0D47A1',
    fontWeight: 'bold',
    fontSize: 12,
    flex: 1,
  },
  header: {
    backgroundColor: '#001433',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  headerMenu: {
    marginRight: 8,
  },
  headerLogoContainer: {
    marginRight: 8,
  },
  fakeLogo: {
    backgroundColor: '#FDC010',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  headerHindi: {
    color: '#A0B0C0',
    fontSize: 9,
    marginTop: 2,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  heroBanner: {
    width: '100%',
    height: 150,
    backgroundColor: '#CFD8DC', // Fallback color
  },
  heroOverlay: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  heroSmallText: {
    color: '#37474F',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroLargeText: {
    color: '#001433',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  heroChecksRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  checkText: {
    fontSize: 9,
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#475569',
  },
  aiCardContainer: {
    flexDirection: 'row',
    backgroundColor: '#071032',
    marginHorizontal: 12,
    marginTop: -20,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  aiIconBg: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  aiSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
  },
  aiBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  aiBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#CFD8DC',
  },
  sectionTitleStar: {
    color: '#F59E0B',
    fontSize: 14,
    marginHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 16,
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
    paddingTop: 14,
    elevation: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cornerBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 6,
  },
  cornerBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
    flex: 1,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 8,
    color: '#546E7A',
    marginTop: 2,
    lineHeight: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 6,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 7,
    color: '#37474F',
    marginTop: 2,
    fontWeight: '600',
  },
  bottomComplexSection: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 10,
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
    width: '48.5%', 
  },
  freeBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FBC02D',
    borderRadius: 6,
    padding: 6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 4,
  },
  freeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  freeTitleText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    flexShrink: 1,
  },
  freeHighlight: {
    color: '#D84315',
    fontSize: 11,
  },
  freeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge100: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  badge100Text: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  freeBullets: {
    marginLeft: 2,
  },
  freeBulletText: {
    fontSize: 7,
    color: '#2E7D32',
    fontWeight: '700',
  },
  youtubePromoBox: {
    width: '32%',
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    padding: 8,
    justifyContent: 'space-between',
  },
  ytHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ytHeaderText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ytBodyText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '600',
    marginVertical: 6,
    lineHeight: 12,
    textAlign: 'center',
  },
  ytBtnWhite: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 4,
  },
  ytBtnTextRed: {
    color: '#D32F2F',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ytBtnRed: {
    backgroundColor: '#B71C1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  ytBtnTextWhite: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 6,
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  disclaimerIcon: {
    marginRight: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 8,
    color: '#1565C0',
    lineHeight: 12,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#001433',
    paddingTop: 12, // Explicit top padding for nav items
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  chatBubbleWrapper: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  chatBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#0D47A1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: '#334155',
    fontSize: 14,
  },
  chatSendBtn: {
    backgroundColor: '#0D47A1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
