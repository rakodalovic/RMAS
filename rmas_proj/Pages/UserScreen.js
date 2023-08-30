import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from 'firebase/database';
import { View, Text, StyleSheet, Image,TouchableOpacity } from 'react-native';



const UserScreen = ({ route }) => {
  const { userId } = route.params;
  const navigation = route.params.navigation;
  console.log(navigation);
  console.log(userId);
  const [userData, setUserData] = useState(null);
  const [userImageURL, setUserImageURL] = useState(null);

  useEffect(() => {
    const database = getDatabase();
    const userRef = ref(database, `users/${userId}`);

    const userListener = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      setUserData(userData);
      const userImage = `https://firebasestorage.googleapis.com/v0/b/rmas-app.appspot.com/o/images%2F${userId}.jpg?alt=media`;
      setUserImageURL(userImage);
    });

    return () => {
      userListener();
    };
  }, [userId]);

  handleLogOut=()=>{
    navigation.navigate('Login');
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
      <Image
        style={styles.profileImage} source={userImageURL ? { uri: userImageURL } : require('../assets/profile-picture.png')}
      />
        <Text style={styles.header}>{userData && userData.username}</Text>
      </View>
      <View style={styles.userDataContainer}>
        <Text style={styles.label}>First Name:</Text>
        <Text style={styles.value}>{userData && userData.firstName}</Text>
        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.value}>{userData && userData.lastName}</Text>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{userData && userData.phoneNumber}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData && userData.email}</Text>
        <Text style={styles.label}>Broj odigranih utakmica:</Text>
        <Text style={styles.value}>{userData && userData.score}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    display:"flex",
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 10,
  },
  header: {
    fontSize: 30,
    fontFamily: 'Avenir',
    fontWeight: '600',
  },
  userDataContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontWeight: '900',
    marginBottom: 5,
    fontSize: 18,
    fontFamily: 'Avenir',
  },
  value: {
    marginBottom: 15,
    fontSize: 20,
    fontFamily: 'Avenir',
  },
  button: {
    backgroundColor: '#3333ff',
    padding: 10,
    borderRadius: 27,
    width: '100%',
    marginTop: 15,
    marginBottom: 0,
    height: 50,
    paddingTop:11,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Avenir',
    fontWeight: '600',
    fontSize: 20,
  },
});

export default UserScreen;
