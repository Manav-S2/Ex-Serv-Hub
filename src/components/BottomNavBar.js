import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../context/LocalizationContext';

export default function BottomNavBar({ activeScreen, onSelectScreen }) {
  const insets = useSafeAreaInsets();
  const { t, fontScale } = useLocalization();

  const getBottomNavPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 0 ? insets.bottom + 4 : 12;
    }
    return 10;
  };

  const navItems = [
    {
      id: 'Home',
      label: t('tabHome'),
      icon: (color) => <Ionicons name="home" size={20 * fontScale} color={color} />,
    },
    {
      id: 'Jobs',
      label: t('tabJobs'),
      icon: (color) => <Ionicons name="briefcase" size={20 * fontScale} color={color} />,
    },
    {
      id: 'ChatAI',
      label: t('tabAi'),
      icon: (color) => <MaterialCommunityIcons name="robot-outline" size={20 * fontScale} color={color} />,
    },
    {
      id: 'RSB',
      label: t('tabRsb'),
      icon: (color) => <MaterialCommunityIcons name="shield-account" size={20 * fontScale} color={color} />,
    },
    {
      id: 'ZSB',
      label: t('tabZsb'),
      icon: (color) => <FontAwesome5 name="map-marked-alt" size={18 * fontScale} color={color} />,
    },
  ];

  return (
    <View style={[styles.bottomNav, { paddingBottom: getBottomNavPadding() }]}>
      {navItems.map(item => {
        const isActive = activeScreen === item.id;
        const color = isActive ? '#FDC010' : '#94A3B8';
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => onSelectScreen(item.id)}
            activeOpacity={0.7}
          >
            {item.icon(color)}
            <Text
              style={[
                styles.navLabel,
                { color, fontSize: 10 * fontScale },
                isActive && styles.navLabelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#001433',
    paddingTop: 8,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#0A2550',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 58,
  },
  navLabel: {
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    fontWeight: 'bold',
  },
});
