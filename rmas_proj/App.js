import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
//import { StatusBar } from 'expo-status-bar';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import LoginScreen from './Pages/LoginScreen';
import RegisterScreen from './Pages/RegisterScreen';
import Main from './Pages/Main';
import AboutScreen from './Pages/AboutScreen';
import ScoreboardScreen from './Pages/ScoreboardScreen';
import UserScreen from './Pages/UserScreen';
import EventsScreen from './Pages/EventsScreen';

const Stack = createStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyAV9VvsuFTQbPgTbs6EjifeoARveaM1kTE",
  authDomain: "rmas-app.firebaseapp.com",
  projectId: "rmas-app",
  storageBucket: "rmas-app.appspot.com",
  messagingSenderId: "338568469633",
  appId: "1:338568469633:web:88b1399b45acf555aec180",
  databaseURL: "https://rmas-app-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
        <Stack.Screen name="User" component={UserScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
