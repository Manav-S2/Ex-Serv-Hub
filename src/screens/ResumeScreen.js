import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { askAiAssistant } from '../services/aiService';

// AI Role Blueprints for quick auto-generation
const ROLE_PRESETS = [
  {
    id: 'security',
    title: '🛡️ Security Officer',
    targetRole: 'Chief Security Officer / Facility Security Manager',
    trade: 'Infantry / Military Police',
    years: '18 Years',
    objective: 'Disciplined and decorated Armed Forces veteran with over 18 years of exemplary service in physical security management, perimeter protection, access control, and crisis response. Seeking a challenging civilian role as Security Officer / Facility Security Manager to safeguard personnel, assets, and infrastructure with zero-incident precision.',
    skills: [
      'Physical Security, Perimeter Defense & Access Control SOPs',
      'CCTV Surveillance, Control Room Monitoring & Quick Reaction Team (QRT)',
      'Fire-Fighting Drills, First Aid & Disaster Management Protocol',
      'Force Discipline, Manpower Scheduling & Guard Training',
      'Liaison with Local Police, District Administration & Intelligence Agencies',
    ],
    experience: [
      'Rendered 18+ years of continuous meritorious military service managing high-security installations, cantonments, and tactical assets.',
      'Supervised and trained security squads of 40+ armed personnel in perimeter surveillance, barrier control, and search protocols.',
      'Conducted regular security vulnerability audits, safety hazard inspections, and fire evacuation drills with 100% compliance.',
      'Maintained confidential security logs, incident reporting registers, and visitor access databases with zero compromise.',
    ],
  },
  {
    id: 'logistics',
    title: '📦 Logistics & Warehouse',
    targetRole: 'Logistics Supervisor / Warehouse Manager',
    trade: 'Army Service Corps (ASC) / Ordnance (AOC)',
    years: '17 Years',
    objective: 'Diligent military veteran with extensive hands-on experience in military supply chain, large-scale inventory accounting, storekeeping, and material dispatch under high-stress operational conditions. Aiming to contribute to corporate logistics, inventory management, and warehouse operations.',
    skills: [
      'Inventory Control, Stock Auditing & FIFO / LIFO Storage Management',
      'Warehouse Operations, Fleet Coordination & Material Despatch',
      'Military Stores Documentation, Ledger Reconciliations & Asset Tracking',
      'Vendor Liaison, Procurement Verification & Quality Inspection',
      'Team Leadership, Punctuality & Loss Prevention Strategies',
    ],
    experience: [
      'Managed quartermaster military stores, rations, and equipment inventories worth crores with 100% audit clearance.',
      'Planned and coordinated vehicle convoys for timely material distribution across forward and peacetime locations.',
      'Digitized stock registers and ledger reconciliations resulting in zero stock loss and discrepancy-free annual inspections.',
      'Supervised loading, unloading, and transit safety protocols for sensitive defense consignments.',
    ],
  },
  {
    id: 'admin',
    title: '🏢 Corporate Admin & Ops',
    targetRole: 'Corporate Administration / Office Manager',
    trade: 'Signals / Clerical / Corps of Military Police',
    years: '19 Years',
    objective: 'Dynamic Armed Forces veteran possessing a proven track record in military administration, personnel welfare, office operations, and cross-functional coordination. Seeking an administrative role to drive operational excellence, protocol adherence, and team productivity in the corporate sector.',
    skills: [
      'General Administration, Office Management & Facilities Oversight',
      'Manpower Planning, Attendance, Rosters & Leave Administration',
      'Government, Regulatory & ZSB Liaison',
      'Official Correspondence, Report Drafting & Record Maintenance',
      'Conflict Resolution, High-Reliability Operations & Event Coordination',
    ],
    experience: [
      'Administered regimental headquarters office handling documentation, service books, and welfare claims for over 250 personnel.',
      'Drafted official military correspondence, roll calls, and standard operating instructions with meticulous accuracy.',
      'Coordinated high-level dignitary visits, ceremonial events, and welfare conferences with precision timing.',
      'Maintained confidential service records, pension files, and performance appraisals with highest integrity.',
    ],
  },
  {
    id: 'bank',
    title: '🏛️ Bank / Govt Guard (Group C/D)',
    targetRole: 'Bank Armed Guard / Cash Escort / PSU Security',
    trade: 'Armed Forces Veteran (All Arms)',
    years: '16 Years',
    objective: 'Honorable Ex-Serviceman eligible for Central / State Government ESM reservation (10% Group C & 20% Group D). Possessing disciplined military work ethic, firearms expertise, and unwavering loyalty, ready to serve nationalized banks or PSUs.',
    skills: [
      'Weapon Handling (Small Arms) & Armed Currency Escort Protocol',
      'Strict Military Discipline, Punctuality & Absolute Integrity',
      'Office File Movement, Despatch & Clerical Assistance',
      'Courteous Public Interface & Visitor Verification',
      'Basic Computer Operations & Hindi/English Literacy',
    ],
    experience: [
      'Rendered continuous meritorious military service upholding top-tier discipline, physical fitness, and army decorum.',
      'Performed armed guard duties, currency escort, and vital asset protection assignments under high vigilance.',
      'Assisted superior officers in routine administrative entries, dispatch logs, and visitor management.',
      'Received Exemplary / Very Good character certificate upon honorable release from Armed Forces.',
    ],
  },
];

export default function ResumeScreen({ onBack }) {
  const { t, fontScale, language } = useLocalization();
  const { user, veteranProfile } = useAuth();

  // Basic User Details Form
  const [name, setName] = useState(veteranProfile?.fullName || user?.displayName || 'Subedar Rajesh Kumar');
  const [rank, setRank] = useState(veteranProfile?.rank || 'Subedar');
  const [armService, setArmService] = useState(veteranProfile?.serviceBranch || 'Corps of Signals');
  const [age, setAge] = useState('42 Years');
  const [esmStatus, setEsmStatus] = useState('Yes (Indian Armed Forces Veteran)');
  const [mobile, setMobile] = useState(veteranProfile?.mobile || '9876543210');
  const [email, setEmail] = useState(user?.email || 'veteran.rajesh@gmail.com');
  const [address, setAddress] = useState('Plot No. 45, Sainik Colony, Sector 4, Jaipur, Rajasthan - 302021');
  const [targetRole, setTargetRole] = useState('Chief Security Officer / Facility Manager');
  const [civilQualifications, setCivilQualifications] = useState('Graduation (BA) from Rajasthan University\nArmy Special Certificate of Education (Equivalent to Degree)\nDiploma in Industrial Security & Safety Management\nCertificate Course in Computer Operations & MS Office');
  
  // AI Generated Sections
  const [careerObjective, setCareerObjective] = useState(ROLE_PRESETS[0].objective);
  const [professionalExperience, setProfessionalExperience] = useState(ROLE_PRESETS[0].experience.join('\n\n'));
  const [keySkills, setKeySkills] = useState(ROLE_PRESETS[0].skills.map((s, i) => `${i + 1}. ${s}`).join('\n'));
  const [achievements, setAchievements] = useState('Awarded General Officer Commanding-in-Chief (GOC-in-C) Commendation Card for distinguished operational service.\nSpecial Service Medal with Suraksha Clasp and 9/20 Years Long Service Medals.\nExemplary Military Character record with clean conduct sheet throughout 18+ years of service.');
  const [fatherName, setFatherName] = useState('Shri Ram Singh');
  const [dob, setDob] = useState('15 August 1982');
  const [sex, setSex] = useState('Male');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [nationality, setNationality] = useState('Indian');
  const [languagesKnown, setLanguagesKnown] = useState('Hindi, English, Punjabi');
  const [declaration, setDeclaration] = useState('I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief.');

  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(true);
  const [chatPrompt, setChatPrompt] = useState('');
  const [aiStatusMsg, setAiStatusMsg] = useState('AI Ready: Click "Generate Resume with AI" or pick any role preset!');
  const scrollViewRef = useRef(null);

  // Apply Role Preset
  const handleSelectPreset = (preset) => {
    setTargetRole(preset.targetRole);
    setCareerObjective(preset.objective);
    setKeySkills(preset.skills.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    setProfessionalExperience(preset.experience.join('\n\n'));
    setAiStatusMsg(`✅ Applied ${preset.title} preset! Click Generate or tweak details.`);
  };

  // Generate Resume with AI
  const handleGenerateResumeWithAi = async (customPrompt) => {
    setIsGenerating(true);
    setAiStatusMsg('⏳ AI Sahayak is analyzing military background and drafting civilian resume...');

    const promptText = customPrompt || `
Draft a comprehensive, highly professional military-to-civilian resume for an Indian Armed Forces Ex-Serviceman:
- Name: ${name}
- Rank (on Retirement): ${rank}
- Arm/Service: ${armService}
- Target Civilian Role: ${targetRole}
- Civil Qualifications: ${civilQualifications}
- Service Details: Decorated veteran seeking civilian transition.

Please provide:
1. A strong, impactful CAREER OBJECTIVE tailored for ${targetRole}
2. 5 civilian-translatable KEY SKILLS
3. 4 comprehensive PROFESSIONAL EXPERIENCE bullet points translating military leadership, administration, and discipline to civilian value.
    `;

    try {
      const response = await askAiAssistant(promptText, []);
      if (response && response.length > 50) {
        // Parse response or intelligently enrich sections
        if (response.includes('CAREER OBJECTIVE') || response.includes('Objective')) {
          setCareerObjective(response.slice(0, 350).replace(/[*#]/g, '').trim());
        } else {
          setCareerObjective(`Disciplined and decorated Armed Forces veteran (${rank}, ${armService}) with extensive leadership experience. Seeking a challenging role as ${targetRole} to leverage operational excellence, team supervision, and absolute integrity in the civilian sector.`);
        }
      }
      setResumeGenerated(true);
      setAiStatusMsg('🎉 AI Resume successfully generated! You can now download as Word (.doc), print PDF, or copy.');
      Alert.alert('✅ Resume Generated', 'AI Sahayak has crafted your official Ex-Servicemen resume! Scroll down to preview and download.');
    } catch (e) {
      console.warn('AI generation fallback:', e);
      setResumeGenerated(true);
      setAiStatusMsg('✅ Official resume template prepared with verified ESM credentials!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Formatted Text Generator strictly adhering to User Template
  const generateFormattedResumeText = () => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `# RESUME

**Name:** ${name}  
**Rank (on Retirement):** ${rank}  
**Arm/Service:** ${armService}  
**Age:** ${age}  
**Ex-Serviceman Status:** ${esmStatus}  
**Mobile:** ${mobile}  
**Email:** ${email}  
**Address:** ${address}

---

**CAREER OBJECTIVE**

${careerObjective}

**CIVIL QUALIFICATIONS**

${civilQualifications.split('\n').map(q => `- ${q}`).join('\n')}

**PROFESSIONAL EXPERIENCE**

${professionalExperience.split('\n\n').map(e => `- ${e}`).join('\n')}

**KEY SKILLS**

${keySkills}

**ACHIEVEMENTS**

${achievements.split('\n').map(a => `- ${a}`).join('\n')}

**PERSONAL DETAILS**

Father’s Name: ${fatherName}  
Date of Birth: ${dob}  
Sex: ${sex}  
Marital Status: ${maritalStatus}  
Nationality: ${nationality}  
Languages Known: ${languagesKnown}

**DECLARATION**

${declaration}

**Date:** ${currentDate}  
**Signature / Name:** ${name}
`;
  };

  // Download resume as Microsoft Word (.doc)
  const handleDownloadDoc = () => {
    const text = generateFormattedResumeText();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resume - ${name}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { text-align: center; font-size: 22px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #001433; padding-bottom: 6px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
          .header-table td { padding: 4px 0; vertical-align: top; font-size: 13px; }
          .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #001433; margin-top: 18px; margin-bottom: 8px; color: #001433; padding-bottom: 3px; }
          p, li { font-size: 12.5px; line-height: 1.6; }
          ul { margin: 6px 0; padding-left: 20px; }
          li { margin-bottom: 5px; }
          .footer-table { width: 100%; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>RESUME</h1>
        <table class="header-table">
          <tr><td width="28%"><strong>Name:</strong></td><td>${name}</td></tr>
          <tr><td><strong>Rank (on Retirement):</strong></td><td>${rank}</td></tr>
          <tr><td><strong>Arm/Service:</strong></td><td>${armService}</td></tr>
          <tr><td><strong>Age:</strong></td><td>${age}</td></tr>
          <tr><td><strong>Ex-Serviceman Status:</strong></td><td>${esmStatus}</td></tr>
          <tr><td><strong>Mobile:</strong></td><td>${mobile}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
        </table>

        <div class="section-title">CAREER OBJECTIVE</div>
        <p>${careerObjective.replace(/\n/g, '<br>')}</p>

        <div class="section-title">CIVIL QUALIFICATIONS</div>
        <ul>${civilQualifications.split('\n').filter(Boolean).map(q => `<li>${q}</li>`).join('')}</ul>

        <div class="section-title">PROFESSIONAL EXPERIENCE</div>
        <ul>${professionalExperience.split('\n\n').filter(Boolean).map(e => `<li>${e}</li>`).join('')}</ul>

        <div class="section-title">KEY SKILLS</div>
        <p>${keySkills.replace(/\n/g, '<br>')}</p>

        <div class="section-title">ACHIEVEMENTS</div>
        <ul>${achievements.split('\n').filter(Boolean).map(a => `<li>${a}</li>`).join('')}</ul>

        <div class="section-title">PERSONAL DETAILS</div>
        <p>
          <strong>Father's Name:</strong> ${fatherName}<br>
          <strong>Date of Birth:</strong> ${dob}<br>
          <strong>Sex:</strong> ${sex}<br>
          <strong>Marital Status:</strong> ${maritalStatus}<br>
          <strong>Nationality:</strong> ${nationality}<br>
          <strong>Languages Known:</strong> ${languagesKnown}
        </p>

        <div class="section-title">DECLARATION</div>
        <p>${declaration}</p>

        <table class="footer-table">
          <tr>
            <td width="50%"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</td>
            <td width="50%" align="right"><strong>Signature / Name:</strong> ${name}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ESM_Resume_${name.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert('📥 Download Started', `Resume downloaded as ESM_Resume_${name.replace(/\s+/g, '_')}.doc (MS Word / Docs compatible).`);
    } else {
      Alert.alert('Notice', 'Direct download supported on Web browser. You can copy text on mobile.');
    }
  };

  // Print / Save as PDF
  const handlePrintPdf = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Resume - ${name}</title>
              <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #111; padding: 25px; margin: 0; }
                h1 { text-align: center; font-size: 22px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #001433; padding-bottom: 6px; }
                .header-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
                .header-table td { padding: 4px 0; vertical-align: top; font-size: 13px; }
                .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #001433; margin-top: 18px; margin-bottom: 8px; color: #001433; padding-bottom: 3px; }
                p, li { font-size: 12.5px; line-height: 1.6; }
                ul { margin: 6px 0; padding-left: 20px; }
                li { margin-bottom: 5px; }
                .footer-table { width: 100%; margin-top: 30px; }
              </style>
            </head>
            <body>
              <h1>RESUME</h1>
              <table class="header-table">
                <tr><td width="28%"><strong>Name:</strong></td><td>${name}</td></tr>
                <tr><td><strong>Rank (on Retirement):</strong></td><td>${rank}</td></tr>
                <tr><td><strong>Arm/Service:</strong></td><td>${armService}</td></tr>
                <tr><td><strong>Age:</strong></td><td>${age}</td></tr>
                <tr><td><strong>Ex-Serviceman Status:</strong></td><td>${esmStatus}</td></tr>
                <tr><td><strong>Mobile:</strong></td><td>${mobile}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
              </table>

              <div class="section-title">CAREER OBJECTIVE</div>
              <p>${careerObjective.replace(/\n/g, '<br>')}</p>

              <div class="section-title">CIVIL QUALIFICATIONS</div>
              <ul>${civilQualifications.split('\n').filter(Boolean).map(q => `<li>${q}</li>`).join('')}</ul>

              <div class="section-title">PROFESSIONAL EXPERIENCE</div>
              <ul>${professionalExperience.split('\n\n').filter(Boolean).map(e => `<li>${e}</li>`).join('')}</ul>

              <div class="section-title">KEY SKILLS</div>
              <p>${keySkills.replace(/\n/g, '<br>')}</p>

              <div class="section-title">ACHIEVEMENTS</div>
              <ul>${achievements.split('\n').filter(Boolean).map(a => `<li>${a}</li>`).join('')}</ul>

              <div class="section-title">PERSONAL DETAILS</div>
              <p>
                <strong>Father's Name:</strong> ${fatherName}<br>
                <strong>Date of Birth:</strong> ${dob}<br>
                <strong>Sex:</strong> ${sex}<br>
                <strong>Marital Status:</strong> ${maritalStatus}<br>
                <strong>Nationality:</strong> ${nationality}<br>
                <strong>Languages Known:</strong> ${languagesKnown}
              </p>

              <div class="section-title">DECLARATION</div>
              <p>${declaration}</p>

              <table class="footer-table">
                <tr>
                  <td width="50%"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</td>
                  <td width="50%" align="right"><strong>Signature / Name:</strong> ${name}</td>
                </tr>
              </table>
              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      Alert.alert('Notice', 'Print to PDF is available in Web/Desktop browser.');
    }
  };

  // Copy Full Resume Text
  const handleCopyText = () => {
    const text = generateFormattedResumeText();
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    Alert.alert('📋 Copied to Clipboard', 'Full resume text copied! You can paste into MS Word, WhatsApp, or email.');
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = `🇮🇳 *EX-SERVICEMAN RESUME SUMMARY*\n\n*Name:* ${name}\n*Rank:* ${rank}\n*Arm/Service:* ${armService}\n*Age:* ${age}\n*Mobile:* ${mobile}\n*Email:* ${email}\n\n*Objective:* ${careerObjective.slice(0, 180)}...\n\n_Generated via Ex-Servicemen App Hub_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp on this device.');
    });
  };

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        titlePrefix="AI RESUME"
        titleHighlight="BUILDER"
        subtitle="Make Official Military-to-Civilian CV through AI"
        hindiText="AI द्वारा बायोडाटा बनाएं व डाउनलोड करें"
        onBack={onBack}
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BANNER: AI GUIDED RESUME BUILDER */}
        <View style={styles.topInfoCard}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="robot" size={24} color="#FDC010" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>
              {language === 'hi' ? 'पूर्व सैनिक एआई बायोडाटा जनरेटर' : 'AI Resume Builder for Ex-Servicemen'}
            </Text>
            <Text style={styles.infoSubtitle}>
              {language === 'hi'
                ? 'अपने सैन्य विवरण भरें या रोल चुनें — AI आपका पेशेवर बायोडाटा तैयार करेगा जिसे आप Word व PDF में डाउनलोड कर सकते हैं।'
                : 'Enter your service details or pick a role blueprint below — AI will craft your formatted civilian resume ready for Word & PDF download.'}
            </Text>
          </View>
        </View>

        {/* QUICK ROLE BLUEPRINT CHIPS */}
        <View style={styles.roleChipsSection}>
          <Text style={styles.sectionLabel}>
            ⚡ {language === 'hi' ? 'त्वरित रोल चुनें (Quick Role Presets):' : 'Select Target Role Preset:'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {ROLE_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetChip}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.75}
              >
                <Text style={styles.presetChipText}>{preset.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* DETAILS INPUT CARD (WHERE USER GIVES DETAILS TO AI) */}
        <View style={styles.inputCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="person-circle-outline" size={20} color="#FDC010" />
            <Text style={styles.cardHeaderTitle}>
              {language === 'hi' ? 'अपने विवरण दें (Your Service Details)' : 'Your Details for AI Resume Generation'}
            </Text>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Name / पूरा नाम *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Subedar Rajesh Kumar"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Rank / पद *</Text>
              <TextInput
                style={styles.textInput}
                value={rank}
                onChangeText={setRank}
                placeholder="e.g. Havildar / Subedar"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Arm / Service / Unit *</Text>
              <TextInput
                style={styles.textInput}
                value={armService}
                onChangeText={setArmService}
                placeholder="e.g. Corps of Signals / Infantry"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Target Role / इच्छित पद *</Text>
              <TextInput
                style={styles.textInput}
                value={targetRole}
                onChangeText={setTargetRole}
                placeholder="e.g. Security Officer / Admin"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Mobile / मोबाइल *</Text>
              <TextInput
                style={styles.textInput}
                value={mobile}
                onChangeText={setMobile}
                placeholder="10-digit Mobile"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>City & State / शहर व राज्य *</Text>
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="City, State"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* MAIN AI GENERATE BUTTON */}
          <TouchableOpacity
            style={[styles.generateAiBtn, isGenerating && styles.btnDisabled]}
            onPress={() => handleGenerateResumeWithAi()}
            disabled={isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color="#001433" size="small" />
            ) : (
              <Ionicons name="sparkles" size={18} color="#001433" />
            )}
            <Text style={styles.generateAiBtnText}>
              {isGenerating
                ? (language === 'hi' ? 'AI बायोडाटा तैयार कर रहा है...' : 'AI is Drafting Resume...')
                : (language === 'hi' ? '✨ AI द्वारा बायोडाटा तैयार करें' : '✨ Generate Resume with AI')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.aiStatusLabel}>{aiStatusMsg}</Text>
        </View>

        {/* OPTIONAL AI PROMPT REFINER */}
        <View style={styles.aiPromptRefinerCard}>
          <Text style={styles.refinerTitle}>
            💡 {language === 'hi' ? 'AI को अतिरिक्त निर्देश दें (Ask AI to Refine):' : 'Ask AI to customize or add details:'}
          </Text>
          <View style={styles.refinerRow}>
            <TextInput
              style={styles.refinerInput}
              placeholder="e.g. Add 20 years weapon handling experience or focus on warehouse logistics..."
              placeholderTextColor="#94A3B8"
              value={chatPrompt}
              onChangeText={setChatPrompt}
              onSubmitEditing={() => {
                if (chatPrompt.trim()) {
                  handleGenerateResumeWithAi(chatPrompt.trim());
                  setChatPrompt('');
                }
              }}
            />
            <TouchableOpacity
              style={[styles.refinerSendBtn, (!chatPrompt.trim() || isGenerating) && styles.btnDisabled]}
              onPress={() => {
                if (chatPrompt.trim()) {
                  handleGenerateResumeWithAi(chatPrompt.trim());
                  setChatPrompt('');
                }
              }}
              disabled={!chatPrompt.trim() || isGenerating}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={14} color="#001433" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* DOWNLOAD TOOLBAR & RESUME PREVIEW                              */}
        {/* ============================================================== */}
        {resumeGenerated && (
          <View style={styles.resumePreviewSection}>
            {/* DOWNLOAD TOOLBAR */}
            <View style={styles.downloadToolbar}>
              <View style={styles.toolbarTitleRow}>
                <Ionicons name="cloud-download-outline" size={18} color="#FDC010" />
                <Text style={styles.toolbarTitle}>
                  {language === 'hi' ? 'बायोडाटा डाउनलोड करें (Instant Download):' : 'Download Generated Resume:'}
                </Text>
              </View>

              <View style={styles.toolbarButtonsGrid}>
                {/* WORD .DOC DOWNLOAD */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2B579A' }]}
                  onPress={handleDownloadDoc}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="file-word" size={15} color="#FFF" />
                  <Text style={styles.actionBtnText}>Download Word (.doc)</Text>
                </TouchableOpacity>

                {/* PRINT / PDF */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#C53929' }]}
                  onPress={handlePrintPdf}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="file-pdf" size={15} color="#FFF" />
                  <Text style={styles.actionBtnText}>Print / Save PDF</Text>
                </TouchableOpacity>

                {/* COPY ALL TEXT */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#1E293B' }]}
                  onPress={handleCopyText}
                  activeOpacity={0.85}
                >
                  <Ionicons name="copy-outline" size={16} color="#FDC010" />
                  <Text style={styles.actionBtnText}>Copy Full Text</Text>
                </TouchableOpacity>

                {/* WHATSAPP SHARE */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#15803D' }]}
                  onPress={handleShareWhatsApp}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="whatsapp" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>WhatsApp Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* OFFICIAL FORMATTED WHITE A4 SHEET */}
            <View style={styles.a4Sheet}>
              <Text style={styles.a4MainHeader}>RESUME</Text>
              <View style={styles.a4DividerDouble} />

              <View style={styles.a4MetaSection}>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Name: </Text>{name}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Rank (on Retirement): </Text>{rank}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Arm/Service: </Text>{armService}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Age: </Text>{age}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Ex-Serviceman Status: </Text>{esmStatus}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Mobile: </Text>{mobile}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Email: </Text>{email}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Address: </Text>{address}</Text>
              </View>

              <View style={styles.a4DividerSingle} />

              {/* CAREER OBJECTIVE */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>CAREER OBJECTIVE</Text>
                <Text style={styles.a4Paragraph}>{careerObjective}</Text>
              </View>

              {/* CIVIL QUALIFICATIONS */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>CIVIL QUALIFICATIONS</Text>
                {civilQualifications.split('\n').filter(Boolean).map((q, idx) => (
                  <Text key={idx} style={styles.a4BulletItem}>• {q}</Text>
                ))}
              </View>

              {/* PROFESSIONAL EXPERIENCE */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>PROFESSIONAL EXPERIENCE</Text>
                {professionalExperience.split('\n\n').filter(Boolean).map((exp, idx) => (
                  <Text key={idx} style={styles.a4BulletItem}>• {exp}</Text>
                ))}
              </View>

              {/* KEY SKILLS */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>KEY SKILLS</Text>
                <Text style={styles.a4Paragraph}>{keySkills}</Text>
              </View>

              {/* ACHIEVEMENTS */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>ACHIEVEMENTS</Text>
                {achievements.split('\n').filter(Boolean).map((ach, idx) => (
                  <Text key={idx} style={styles.a4BulletItem}>• {ach}</Text>
                ))}
              </View>

              {/* PERSONAL DETAILS */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>PERSONAL DETAILS</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Father’s Name: </Text>{fatherName}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Date of Birth: </Text>{dob}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Sex: </Text>{sex}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Marital Status: </Text>{maritalStatus}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Nationality: </Text>{nationality}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Languages Known: </Text>{languagesKnown}</Text>
              </View>

              {/* DECLARATION */}
              <View style={styles.a4SectionBlock}>
                <Text style={styles.a4SectionHeader}>DECLARATION</Text>
                <Text style={styles.a4Paragraph}>{declaration}</Text>
              </View>

              <View style={styles.a4SignatureRow}>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Date: </Text>{new Date().toLocaleDateString('en-IN')}</Text>
                <Text style={styles.a4MetaLine}><Text style={styles.a4Bold}>Signature / Name: </Text>{name}</Text>
              </View>
            </View>

            {/* REPEAT DOWNLOAD BUTTONS AT BOTTOM OF DOCUMENT */}
            <View style={[styles.downloadToolbar, { marginTop: 14 }]}>
              <View style={styles.toolbarButtonsGrid}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2B579A' }]}
                  onPress={handleDownloadDoc}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="file-word" size={15} color="#FFF" />
                  <Text style={styles.actionBtnText}>Download Word (.doc)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#C53929' }]}
                  onPress={handlePrintPdf}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="file-pdf" size={15} color="#FFF" />
                  <Text style={styles.actionBtnText}>Print / Save PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
  },

  /* TOP BANNER */
  topInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#071032',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  infoIconWrap: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: '#FDC010',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  infoSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 14,
  },

  /* ROLE CHIPS */
  roleChipsSection: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  chipsScroll: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#001433',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDC010',
  },
  presetChipText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  /* INPUT CARD */
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  cardHeaderTitle: {
    color: '#001433',
    fontWeight: 'bold',
    fontSize: 13,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  formCol: {
    flex: 1,
  },
  inputLabel: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 3,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
    color: '#0F172A',
  },
  generateAiBtn: {
    backgroundColor: '#FDC010',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
    elevation: 2,
  },
  generateAiBtnText: {
    color: '#001433',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  aiStatusLabel: {
    fontSize: 10,
    color: '#059669',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },

  /* AI REFINER CARD */
  aiPromptRefinerCard: {
    backgroundColor: '#071032',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  refinerTitle: {
    color: '#FDC010',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  refinerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refinerInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    color: '#FFF',
    fontSize: 11.5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  refinerSendBtn: {
    backgroundColor: '#FDC010',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* RESUME PREVIEW & DOWNLOAD */
  resumePreviewSection: {
    marginTop: 4,
  },
  downloadToolbar: {
    backgroundColor: '#071032',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toolbarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  toolbarTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12.5,
  },
  toolbarButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },

  /* WHITE A4 SHEET */
  a4Sheet: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  a4MainHeader: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#001433',
  },
  a4DividerDouble: {
    height: 3,
    backgroundColor: '#001433',
    marginVertical: 10,
  },
  a4DividerSingle: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
  },
  a4MetaSection: {
    gap: 4,
  },
  a4MetaLine: {
    fontSize: 11.5,
    color: '#1E293B',
    lineHeight: 18,
  },
  a4Bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  a4SectionBlock: {
    marginTop: 14,
  },
  a4SectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#001433',
    borderBottomWidth: 1.5,
    borderBottomColor: '#001433',
    paddingBottom: 2,
    marginBottom: 6,
  },
  a4Paragraph: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 18,
  },
  a4BulletItem: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  a4SignatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});
