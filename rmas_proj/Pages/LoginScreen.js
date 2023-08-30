import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

const LoginScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential)
      navigation.navigate('Main', { userId: userCredential.user.uid, navigation});
    } catch (error) {
      //console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        Alert.alert('Greška pri prijavi', 'Pogrešna email adresa.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Greška pri prijavi', 'Pogrešna lozinka.');
      } else {
        Alert.alert('Greška pri prijavi', 'Došlo je do greške prilikom prijave.');
      }
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <CustomInput 
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)} />
      <CustomInput 
        placeholder="Lozinka"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry={true} />

      <CustomButton title={"Login"} onPress={handleLogin} />

      <TouchableOpacity onPress={navigateToRegister} style={styles.registerNav}>
        <Text>Nemate nalog?</Text><Text style={styles.registerLink}> Registrujte se!</Text>
      </TouchableOpacity>
      <Image
        source={require('../assets/balls-sports.png')} 
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  logo: {
    width: 100,    
    height: 100,   
    resizeMode: 'contain',
    position:'relative',
    top:70,
    
  },
  title: {
    fontSize: 40,
    fontFamily: 'Avenir',
    fontWeight: '600',
    color:'#595959',
    position:'relative',
    bottom:70,
  },
  input: {

  },
  button: {

  },
  buttonText: {

  },
  registerLink: {
    color: '#3333ff',
    fontFamily: 'Avenir',
  },
  registerNav:{
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
  }
});

export default LoginScreen;
