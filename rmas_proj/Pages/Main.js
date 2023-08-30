import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Button, KeyboardAvoidingView, Text, TouchableOpacity, Alert} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDatabase, ref, push, onValue, set, update, get, remove } from 'firebase/database';
import Slider from '@react-native-community/slider';
import RadioButton from '../components/RadioButton';
import Navbar from '../components/Navbar';
import DateTimePicker from '@react-native-community/datetimepicker';
import CloseButton from '../components/CloseButton';



const sportsList = ['Fudbal', 'Košarka', 'Odbojka', 'Vaterpolo', 'Tenis', 'Stoni tenis'];

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (angle) => (Math.PI / 180) * angle;

  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};
const iconMappings = {
  Fudbal: require('../assets/football.png'),
  Košarka: require('../assets/basketball.png'),
  Odbojka: require('../assets/volleyball.png'),
  Vaterpolo: require('../assets/waterpolo.png'),
  Tenis: require('../assets/tennis.png'),
  'Stoni tenis': require('../assets/tabletennis.png'),
};

const Main = ( parameters ) => {

  const { userId } = parameters.route.params;
  const navigation = parameters.navigation;
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    address: '',
    //phoneNumber: '',
    difficulty: 5,
    sportName: sportsList[0],
    surface:'',
    neededPlayers:'',
  });
  const [sportsEvents, setSportsEvents] = useState([]);
  const [filteredSportEvents, setFilteredSportEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [neededPlayers, setNeededPlayers] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [eventDateTime, setEventDateTime] = useState(new Date());
  const [searchFilters, setSearchFilters] = useState({
    radius: 10, 
    sport: sportsList[0], 
    difficulty: 5, 
    availableSlots: "", 
  });
  const [isSearchFiltersApplied, setIsSearchFiltersApplied] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  

  const mapRef = useRef(null);

  const handleMapPress = (event) => {
    const clickedCoordinate = event.nativeEvent.coordinate;
    setSelectedLocation(clickedCoordinate);
    setShowSearchForm(false);
    setIsUserRegistered(false);
  };
  const handleCloseForms =()=>{
    setShowSearchForm(false);
    setSelectedLocation(null);
    setSelectedEvent(null);
  };

  const handleSave = () => {
    if (selectedLocation) {
      const database = getDatabase();
      const sportsRef = ref(database, 'sports');

      const userRef = ref(database, `users/${userId}`);

      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setUserPhoneNumber(userData.phoneNumber);
      });

      const newEvent = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        ...eventDetails,
        eventDateTime: eventDateTime.toISOString(),
        phoneNumber: userPhoneNumber,
      };

      push(sportsRef, newEvent)
        .then(() => {
          console.log('Novi sportski događaj dodat u bazu.');
          setSelectedLocation(null);
          setEventDetails({
            address: '',
            //phoneNumber: '',
            difficulty: 5,
            sportName: sportsList[0],
            surface: '',
            neededPlayers: '',
          });
        })
        .catch((error) => {
          console.error('Greška prilikom dodavanja događaja u bazu:', error);
        });
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Podaci o lokaciji nedostupni');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      mapRef.current.animateToRegion(region, 2000);
    }
  }, [location]);

  useEffect(() => {
    const database = getDatabase();
    const sportsRef = ref(database, 'sports');

    onValue(sportsRef, (snapshot) => {
      const eventData = snapshot.val();
      if (eventData) {

        const eventList=Object.keys(eventData).map((id)=>({
          eventId:id,
          ...eventData[id]
        }));
        setSportsEvents(eventList);
      }
    });
  }, []);

  const handleApplying = () => {
    //console.log(selectedEvent?.eventId);
    if (selectedEvent.eventId) {
      const distance = haversineDistance(
        location.latitude,
        location.longitude,
        selectedEvent.latitude,
        selectedEvent.longitude
      );
  
      if (distance > 5) {
        Alert.alert("Izabrani događaj je predaleko!", "Možete se prijaviti samo za događaje koji su u radiusu od 5 km.");
        return;
      }
      else{
        const database = getDatabase();
        const eventPath = `sports/${selectedEvent.eventId}`;
        const eventRef = ref(database, eventPath);
    
        get(eventRef)
          .then((snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
              if (!eventData.players) {
                eventData.players = [];
                //console.log(eventData);
              }
    
              const userRef = ref(database, `users/${userId}`);
              return get(userRef).then(async (userSnapshot) => {
                const userData = userSnapshot.val();
                if (!userData.score) {
                  userData.score = 0;
                }
    
                const userAlreadyRegistered = eventData.players.some(
                  (player) => player.playerId === userId
                );
                if(eventData.neededPlayers >= 0) {
                if (!userAlreadyRegistered) {
                  userData.score = userData.score + 1;
                  eventData.players.push({ playerId: userId, username: userData.username });
                  //console.log(eventData);
                  eventData.neededPlayers--;
                  setNeededPlayers(eventData.neededPlayers);
                  await set(userRef, userData);
                  await set(eventRef, eventData);
                  setIsUserRegistered(true); 
                  Alert.alert('Uspešno ste se prijavili za ovaj sportski događaj!', 'Dobili ste poen u ranglisti!');
                }
                else {
                  Alert.alert('Već ste prijavljeni na dati događaj!');
                }
                } else Alert.alert ("Popunjen broj mesta!","Kontaktirajte organizatora!");
              });
            }
          })

          .catch((error) => {
            console.error('Greška prilikom dodavanja pohadjanja:', error);
          });
        }
    }
  };
  
  
  
  const checkAndDeleteEvent = (event) => {
    const now = new Date();
    const eventDateTime = new Date(event.eventDateTime);
    const database = getDatabase();
  
    if (eventDateTime <= now) {
      const eventRef = ref(database, `sports/${event.eventId}`);
      remove(eventRef)
        .then(() => {
          Alert.alert('Događaj je istekao!');
          console.log('Događaj uspešno izbrisan iz baze.');
        })
        .catch((error) => {
          console.error('Greška prilikom brisanja događaja:', error);
        });
    }
  };

  const handleSearch = () => {
    const filteredEvents = sportsEvents.filter(event => {
      const distance = haversineDistance(
        location.latitude,
        location.longitude,
        event.latitude,
        event.longitude
      );
  
      return (
        distance <= searchFilters.radius &&
        event.sportName === searchFilters.sport &&
        event.difficulty >= searchFilters.difficulty &&
        (searchFilters.availableSlots === '' ||
          event.neededPlayers >= parseInt(searchFilters.availableSlots))
      );
    });
  
    setFilteredSportEvents(filteredEvents);
    
    setIsSearchFiltersApplied(true);
    setShowSearchForm(false); 
  };
  const handleResetFilters =()=>{
    setIsSearchFiltersApplied(false);
    setShowSearchForm(false);
  }
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };

    return new Date(dateString).toLocaleString('sr-Latn-RS', options);
  };
  
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location ? location.latitude : 44.0113,
            longitude: location ? location.longitude : 21.0000,
            latitudeDelta: 4.0922,
            longitudeDelta: 4.0421,
          }}
          ref={mapRef}
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
          {(isSearchFiltersApplied ? filteredSportEvents : sportsEvents).map((event, index) => {
            if (!location) return null;

            const eventLocation = {
              latitude: event.latitude,
              longitude: event.longitude,
            };

            const distance = haversineDistance(
              location.latitude,
              location.longitude,
              eventLocation.latitude,
              eventLocation.longitude
            );

            const markerImage = distance > 5 ? require('../assets/sports_small.png') : iconMappings[event.sportName];

            return (
              <Marker
                key={index}
                coordinate={eventLocation}
                title={event.sportName}
                image={markerImage}
                onPress={() => {
                  setSelectedEvent(event);
                  setNeededPlayers(event.neededPlayers);
                  checkAndDeleteEvent(event);
                  setTimeout(() => {
                    setSelectedLocation(null);
                  }, 10);}
                }
              />
              
            );
          })}
          {selectedLocation && (
            <Marker coordinate={selectedLocation} title="Izabrana lokacija" />
          )}
        </MapView>
        {selectedEvent && (
            <View style={styles.eventInfo}>
              <CloseButton onPress={handleCloseForms}></ CloseButton>
              <Text style={styles.searchFormTitle}>Detalji o događaju</Text>
              <Text style={styles.eventText}>Sport: {selectedEvent.sportName}</Text>
              <Text style={styles.eventText}>
                Datum i vreme: {formatDate(selectedEvent.eventDateTime)}
              </Text>
              <Text style={styles.eventText}>Adresa: {selectedEvent.address}</Text>
              <Text style={styles.eventText}>Broj telefona organizatora: {selectedEvent.phoneNumber}</Text>
              <Text style={styles.eventText}>Broj slobodnih mesta: {neededPlayers}</Text>
              <Text style={styles.eventText}>Teren: {selectedEvent.surface}</Text>
              <Text style={styles.eventText}>Ozbiljnost igre: {Math.floor(selectedEvent.difficulty * 10) / 10}</Text>
              

              <TouchableOpacity style={styles.button} onPress={handleApplying}>
                <Text style={styles.buttonText}>Dolazim</Text>
              </TouchableOpacity>

            </View>
          )}
        {selectedLocation && (
          <View style={styles.form}>
            <CloseButton onPress={handleCloseForms}></ CloseButton>
            <Text style={styles.searchFormTitle}>Objavi događaj</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresa"
              value={eventDetails.address}
              onChangeText={(text) => setEventDetails({ ...eventDetails, address: text })}
            />
            {/*<TextInput
              style={styles.input}
              placeholder="Broj telefona"
              keyboardType="numeric"
              value={eventDetails.phoneNumber}
              onChangeText={(text) => setEventDetails({ ...eventDetails, phoneNumber: text })}
        />*/}
            <Text>Ozbiljnost igre: {eventDetails.difficulty.toFixed(1)}</Text>
            <Slider
              style={{ width: '100%', marginBottom: 10 }}
              minimumValue={0}
              maximumValue={10}
              step={0.1}
              value={eventDetails.difficulty}
              onValueChange={(value) => setEventDetails({ ...eventDetails, difficulty: value })}
            />
            <Text>Izaberite sport:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {sportsList.map((sport, index) => (
                <RadioButton
                  key={index}
                  style={styles.radioBtn}
                  value={sport}
                  label={sport}
                  selected={eventDetails.sportName === sport}
                  onSelect={() => setEventDetails({ ...eventDetails, sportName: sport })}
                />
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.bottomInput]}
              placeholder="Broj slobodnih mesta"
              value={eventDetails.neededPlayers}
              keyboardType="numeric"
              onChangeText={(text) => setEventDetails({ ...eventDetails, neededPlayers: text })}
            />
            <TextInput
              style={[styles.input,styles.inputSurface]}
              placeholder="Podloga na kojoj se igra/Teren"
              value={eventDetails.surface}
              onChangeText={(text) => setEventDetails({ ...eventDetails, surface: text })}
            />
            <View style={styles.dateTime}>
            <DateTimePicker
              value={eventDateTime}
              
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || eventDateTime;
                setEventDateTime(currentDate);
              }}
            />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Objavi sportski događaj</Text>
            </TouchableOpacity>
          </View>
        )}
        {!selectedEvent && !selectedLocation && (
          <Text style={styles.bottomContainer}> 
            Klikom na mapu možete objaviti svoj sportski događaj. Klikom na već postojeći događaj na mapi možete se pridružiti sportskom dešavanju u Vašoj blizini.
          </Text>
        )}
        {showSearchForm && (
          <View style={styles.searchForm}>
            <CloseButton onPress={handleCloseForms}></ CloseButton>
            <Text style={styles.searchFormTitle}>Pretraga događaja</Text>
            <Text>Maksimalna udaljenost (km): {searchFilters.radius}</Text>
            <Slider
              style={{ width: '100%', marginBottom: 10 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={searchFilters.radius}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, radius: value })}
            />
            <Text>Izaberi sport:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, }}>
              {sportsList.map((sport, index) => (
                <RadioButton
                  key={index}
                  style={styles.radioBtn}
                  value={sport}
                  label={sport}
                  selected={searchFilters.sport === sport}
                  onSelect={() => setSearchFilters({ ...searchFilters, sport: sport })}
                />
              ))}
            </View>
            <Text>Minimalni broj slobodnih mesta:</Text>
            <TextInput
              style={[styles.input, styles.bottomInput]}
              placeholder="Minimalni broj slobodnih mesta"
              value={searchFilters.availableSlots}
              keyboardType="numeric"
              onChangeText={(text) => setSearchFilters({ ...searchFilters, availableSlots: text })}
            />
            <Text>Minimalna ozbiljnost igre: {searchFilters.difficulty.toFixed(1)}</Text>
            <Slider
              style={{ width: '100%', marginBottom: 10 }}
              minimumValue={0}
              maximumValue={10}
              step={0.1}
              value={searchFilters.difficulty}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, difficulty: value })}
            />
            
            <TouchableOpacity style={styles.buttonReset} onPress={handleResetFilters}>
              <Text style={styles.buttonResetText}>Poništi filtere</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSearch}>
              <Text style={styles.buttonText}>Filtriraj pretragu</Text>
            </TouchableOpacity>
          </View>
        )}



      </View>
      <Navbar navigation={navigation} setShowUserForm={setShowUserForm} setShowSearchForm={setShowSearchForm} userId={userId}/>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
  },
  map: {
    width: '90%',
    height: '52%',
    position: 'absolute',
    top: 10,
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  bottomContainer:{
    width: '85%',
    height: '33%',
    position: 'absolute',
    bottom: 10,
    borderRadius: 20,
    textAlign:'center',
    fontFamily:'Avenir',
    fontWeight:'600',
    fontSize: 20,
    color:'grey',
    marginBottom:20,
  },

  form: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30,
    elevation: 3,
    backgroundColor:"#ffffff",
    borderWidth:2,
    borderColor:'#808080',
    marginBottom:55,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 25,
    fontFamily: "Avenir",
  },
  bottomInput: {
    marginTop:10,
  },
  inputSurface:{
    
  },
  button: {
    backgroundColor: '#3333ff',
    padding: 10,
    borderRadius: 25,
    width: '100%',
    marginTop: 10,
    marginBottom: 0,
    height: 44,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonReset:{
    backgroundColor: 'transparent',
    borderWidth:1,
    borderColor:'red',
    padding: 10,
    borderRadius: 25,
    width: '100%',
    marginTop: 10,
    marginBottom: 0,
    height: 44,
  },
  buttonResetText:{
    color: 'red',
    textAlign: 'center',
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30,
    elevation: 3,
    borderColor: '#808080',
    borderWidth: 1,
    marginBottom:55
  },
  eventText: {
    marginBottom: 5,
    fontFamily: 'Avenir',
  },
  dateTime: {
    margin:5,
    marginBottom:0,
    width:"100%",
    display:"flex",
    alignItems:"center",
    paddingRight:20,
  },
  searchForm: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30,
    elevation: 3,
    borderColor: '#808080',
    borderWidth: 1,
    marginBottom:50,
  },
  searchFormTitle:{
    fontFamily:'Avenir',
    fontWeight:"600",
    fontSize:25,
    marginBottom:15,
    width:"80%"
  }
  
});

export default Main;
