import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Navbar = ({ navigation, setShowUserForm, setShowSearchForm, userId}) => {
  const tabs = [
    { icon: require('../assets/search.png'), screen: 'Screen1', type: 'formSearch' },  
    { icon: require('../assets/trophy.png'), screen: 'Scoreboard', type: 'screen' },
    { icon: require('../assets/more.png'), screen: 'Events', type: 'screen' },
    { icon: require('../assets/user.png'), screen: 'User', type: 'formUser' },
    { icon: require('../assets/information.png'), screen: 'About', type: 'screen' },
    
    
  ];

  const handleTabPress = (tab) => {  
    if (tab.type === 'screen') {
      navigation.navigate(tab.screen);
    } else if (tab.type === 'formUser') {
      navigation.navigate('User',{userId: userId, navigation: navigation});
      console.log('nav je', navigation);
    } else if(tab.type === 'formSearch') {
      setShowSearchForm(true);
      setShowUserForm(false);
      //console.log('Otvorio sam search form');
    }
  };

  return (
    <View style={styles.navbarContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity key={index} onPress={() => handleTabPress(tab)} style={styles.tabButton}>
          <Image source={tab.icon} style={styles.tabIcon} resizeMode="contain" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 65,

    shadowColor: 'black',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  tabButton: {
    padding: 10,
  },
  tabIcon: {
    width: 28,
    height: 28,
    marginBottom: 10,
  },
});

export default Navbar;
