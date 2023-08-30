import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Navbar from '../components/Navbar';

const AboutScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/balls-sports.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>O nama</Text>
      <Text style={styles.description}>
        Dobrodošli na našu mobilnu aplikaciju za pronalaženje rekreativnih sportova u blizini. Mi Vam pomažemo da pronađete razne sportske aktivnosti koje su dostupne u Vašem okruženju.
      </Text>
      <Text style={styles.description}>
        Naš cilj je omogućiti ljudima da pronađu i uživaju u različitim sportovima, bez obzira na njihovu fizičku spremu ili iskustvo.
      </Text>
      <Text style={styles.description}>
        Pridružite nam se i započnite svoju sportsku avanturu!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logo: {
    marginBottom: 80,
    marginTop:0,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  width: 100,    
    height: 100,   
    resizeMode: 'contain',
    position:'relative',
    top:70,
});

export default AboutScreen;
