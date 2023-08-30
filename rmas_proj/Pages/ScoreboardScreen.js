import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';

const ScoreboardScreen = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const database = getDatabase();
    const usersRef = ref(database, 'users');
    try {
      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
          const usersList = Object.values(usersData);
          const sortedUsers = usersList.sort((a, b) => b.score - a.score).slice(0, 10);
          setUsers(sortedUsers);
        }
      });
    } catch (error) {
      console.error('Error fetching scoreboard data:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top 10 Korisnika</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()} 
        renderItem={({ item, index }) => (
          <View style={styles.userRow}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.username}>{item.username || 'anonimni_korisnik'}</Text>
            <Text style={styles.score}>Poeni: {item.score || 0}</Text>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
  },
  rank: {
    fontSize: 18,
    marginRight: 10,
  },
  username: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default ScoreboardScreen;
