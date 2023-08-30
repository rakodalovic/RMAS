import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

import {getStorage, ref as storageReference, uploadBytes, getDownloadURL} from "firebase/storage";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  //const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const takePicture = async () => {
    console.log('Pokrenuta funkcija takePicture');
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const handleRegister = async () => {
    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora sadržati najmanje 6 karaktera.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju.');
      return;
    }

    const auth = getAuth();
    try {
      const emailMethods = await fetchSignInMethodsForEmail(auth, email);
      if (emailMethods && emailMethods.length > 0) {
        Alert.alert('Greška', 'Korisnik sa izabranom email adresom već postoji.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;

      const database = getDatabase();
      const userRef = ref(database, `users/${userId}`);

      const userData = {
        username,
        email,
        firstName,
        lastName,
        phoneNumber,
      };

      await set(userRef, userData);
      
        await uploadImage(userId);
        alert('Uspesna registracija');
      
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Greška', 'Registracija nije uspela.');
    }
  };
  const uploadImage = async (userId) => {
    if (userId) {
      const storage = getStorage();
      try {
        const imageRef = storageReference(storage, `images/${userId}.jpg`);
        const response = await fetch(profileImage);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);

        const downloadURL = await getDownloadURL(imageRef);
        console.log('Slika uspešno dodata');
      } catch (error) {
        console.error('Greška prilikom dodavanja slike', error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <CustomInput 
        placeholder="Ime"
        value={firstName}
        onChangeText={text => setFirstName(text)} />

      <CustomInput 
        placeholder="Prezime"
        value={lastName}
        onChangeText={text => setLastName(text)} />

      <CustomInput 
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)} />

      <CustomInput 
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)} />

      <CustomInput 
        placeholder="Lozinka"
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)} />

      <CustomInput 
        placeholder="Potvrdi lozinku"
        secureTextEntry
        value={confirmPassword}
        onChangeText={text => setConfirmPassword(text)} />

      <CustomInput 
        placeholder="Broj telefona"
        value={phoneNumber}
        onChangeText={text => setPhoneNumber(text)} />

      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageButtonLeft} onPress={pickImage}>
          <Text style={styles.buttonText}>Izaberi sliku iz galerije</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imagebuttonRight} onPress={takePicture}>
          <Text style={styles.buttonText}>Uslikaj sliku</Text>
        </TouchableOpacity>
      </View>
      
      {profileImage && <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderWidth:3, borderColor:'#3333ff', marginTop:10 }} />}
      
      <CustomButton title={"Prijavi se"} onPress={handleRegister} style={styles.button} />
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
  title: {
    fontSize: 44,
    marginBottom: 20,
    fontFamily: 'Avenir',
    fontWeight: '600',
    color:'#595959',
    position: 'relative',
    bottom: 50,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    padding: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontFamily:'Avenir',
  },
  imageButtons:{
    display:'flex',
    flexDirection: 'row',
    //width:400,
  },
  imagebuttonRight:{
    backgroundColor: '#cacafa',
    padding: 12,
    width: '30%',
    //marginTop: 30,
    marginBottom: 0,
    height: 44,
    borderTopRightRadius:25,
    borderBottomRightRadius:25,
  },
  imageButtonLeft:{
    backgroundColor: '#a8a8ff',
    padding: 12,
    //width: '80%',
    //marginTop: 30,
    marginBottom: 0,
    height: 44,
    borderTopLeftRadius:25,
    borderBottomLeftRadius:25,
    width: '50%',
  },
});

export default RegisterScreen;