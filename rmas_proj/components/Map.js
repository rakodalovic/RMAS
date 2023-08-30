import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

const Map = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null); // Dodajte ovu liniju

  const handleMapPress = (event) => {
    const clickedCoordinate = event.nativeEvent.coordinate;
    
    // Postavljanje markera na kliknutu lokaciju
    setSelectedLocation(clickedCoordinate);
    
    // Prikazivanje Alert sa koordinatama
    Alert.alert(
      'Koordinate lokacije',
      `Latitude: ${clickedCoordinate.latitude}\nLongitude: ${clickedCoordinate.longitude}`
    );
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) { // Dodajte ovaj uslov
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      mapRef.current.animateToRegion(region, 2000);
    }
  }, [location]); // Dodajte ovaj niz zavisnosti

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : 44.0113,
          longitude: location ? location.longitude : 21.0000,
          latitudeDelta: 4.0922,
          longitudeDelta: 4.0421,
        }}
        ref={mapRef} // Dodajt e ovu liniju
        onPress={handleMapPress}
      >
        {location && (
          <>
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Vi ste ovde"
            />
            <Circle
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={100}
              fillColor="rgba(0, 0, 255, 0.3)"
              strokeColor="blue"
              strokeWidth={1}
            />
          </>
        )}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Kliknuta lokacija"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  map: {
    width: '90%',
    height: '50%',
    position:'absolute',
    top:10,
    borderRadius:20,

  },
});

export default Map;