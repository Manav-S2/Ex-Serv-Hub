import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITE_ZSBS: '@esm_favorite_zsbs',
  FAVORITE_CSD: '@esm_favorite_csd',
  RECENT_SEARCHES: '@esm_recent_searches',
  LAST_STATE: '@esm_last_state',
};

export async function getFavoriteZsbs() {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITE_ZSBS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteZsb(zsbItem) {
  try {
    const list = await getFavoriteZsbs();
    const key = `${zsbItem.state}-${zsbItem.name}`;
    const exists = list.some(i => `${i.state}-${i.name}` === key);
    let updated;
    if (exists) {
      updated = list.filter(i => `${i.state}-${i.name}` !== key);
    } else {
      updated = [...list, zsbItem];
    }
    await AsyncStorage.setItem(KEYS.FAVORITE_ZSBS, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export async function getFavoriteDealers() {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITE_CSD);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteDealer(dealerItem) {
  try {
    const list = await getFavoriteDealers();
    const key = `${dealerItem.dealer}-${dealerItem.phone || ''}`;
    const exists = list.some(i => `${i.dealer}-${i.phone || ''}` === key);
    let updated;
    if (exists) {
      updated = list.filter(i => `${i.dealer}-${i.phone || ''}` !== key);
    } else {
      updated = [...list, dealerItem];
    }
    await AsyncStorage.setItem(KEYS.FAVORITE_CSD, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}
