import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import CameraScreen from './screens/CameraScreen';
import ListScreen from './screens/ListScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Multimedia') {
              iconName = 'camera';
            } else if (route.name === 'Lista de archivos') {
              iconName = 'list';
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Multimedia" component={CameraScreen} />
        <Tab.Screen name="Lista de archivos" component={ListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}