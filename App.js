import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocalizationProvider } from './src/context/LocalizationContext';
import { AuthProvider } from './src/context/AuthContext';

import HomeScreen from './src/screens/HomeScreen';
import JobHub from './src/components/JobHub';
import RsbScreen from './src/screens/RsbScreen';
import ZsbScreen from './src/screens/ZsbScreen';
import CsdScreen from './src/screens/CsdScreen';
import AiChatScreen from './src/screens/AiChatScreen';
import ResumeScreen from './src/screens/ResumeScreen';
import BottomNavBar from './src/components/BottomNavBar';

export default function App() {
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [selectedZsbState, setSelectedZsbState] = useState(null);
  const [initialAiQuery, setInitialAiQuery] = useState('');

  const navigateTo = (screen, param) => {
    if (screen === 'ChatAI' && typeof param === 'string') {
      setInitialAiQuery(param);
    }
    setCurrentScreen(screen);
  };

  const handleNavigateToZsb = (state) => {
    setSelectedZsbState(state);
    setCurrentScreen('ZSB');
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'Jobs':
        return (
          <JobHub
            onBack={() => navigateTo('Home')}
            onOpenAI={() => navigateTo('ChatAI')}
          />
        );
      case 'RSB':
        return (
          <RsbScreen
            onBack={() => navigateTo('Home')}
            onNavigateToZsb={handleNavigateToZsb}
          />
        );
      case 'ZSB':
      case 'RSBZSB':
        return (
          <ZsbScreen
            onBack={() => navigateTo('Home')}
            defaultExpandedState={selectedZsbState}
          />
        );
      case 'CSDDealers':
        return (
          <CsdScreen
            onBack={() => navigateTo('Home')}
          />
        );
      case 'ChatAI':
        return (
          <AiChatScreen
            onBack={() => navigateTo('Home')}
            initialQuery={initialAiQuery}
            onClearInitialQuery={() => setInitialAiQuery('')}
          />
        );
      case 'Resume':
        return (
          <ResumeScreen
            onBack={() => navigateTo('Home')}
          />
        );
      case 'Home':
      default:
        return (
          <HomeScreen onNavigate={navigateTo} />
        );
    }
  };

  const showBottomNav = currentScreen !== 'CSDDealers';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <View style={styles.contentArea}>
        {renderActiveScreen()}
      </View>
      {showBottomNav && (
        <BottomNavBar
          activeScreen={currentScreen}
          onSelectScreen={navigateTo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001433',
  },
  contentArea: {
    flex: 1,
  },
});
