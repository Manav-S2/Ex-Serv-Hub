// Services Grid Data: 1. DESW, 2. SPARSH, 3. ECHS, 4. DGR, 5. KSB, 6. RSB, 7. ZSB, 8. CSD, 9. AWPO
export const SERVICES_DATA = [
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

export const DSW_STATE_MAP = {
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

export const getDswName = (state) => {
  return DSW_STATE_MAP[state] || `Directorate of Sainik Welfare, ${state} (DSW / RSB)`;
};
