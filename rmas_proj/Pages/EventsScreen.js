import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const database = getDatabase();
    const eventsRef = ref(database, 'sports');

    try {
      onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        if (eventsData) {
          const eventsList = Object.values(eventsData);
          setEvents(eventsList);
        }
      });
    } catch (error) {
      console.error('Error fetching events data:', error);
    }
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      //second: 'numeric',
      //timeZoneName: 'short',
    };

    return new Date(dateString).toLocaleString('sr-Latn-RS', options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista Događaja</Text>
      <FlatList
        data={events}
        keyExtractor={(item, index) => index.toString()} 
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text style={styles.eventName}>{item.sportName || 'Nepoznato'}</Text>
            <Text style={styles.eventAddress}>Adresa: {item.address || 'Nepoznato'}</Text>
            <Text style={styles.eventPhone}>Telefon: {item.phoneNumber || 'Nepoznato'}</Text>
            <Text style={styles.eventDate}>Datum i vreme: {formatDate(item.eventDateTime) || 'Nepoznato'}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventRow: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    marginBottom: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventAddress: {
    fontSize: 16,
    marginBottom: 5,
  },
  eventPhone: {
    fontSize: 16,
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 16,
  },
});

export default EventsScreen;
