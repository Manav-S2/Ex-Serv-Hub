import React from 'react';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function Icon({ family, name, size = 18, color = '#FFF', style }) {
  if (family === 'FontAwesome5') return <FontAwesome5 name={name} size={size} color={color} style={style} />;
  if (family === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
  if (family === 'Ionicons') return <Ionicons name={name} size={size} color={color} style={style} />;
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
