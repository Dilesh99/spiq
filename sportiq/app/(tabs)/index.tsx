import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Real backend URL - adjust as needed
const BACKEND_URL = 'http://localhost:5000';

// Define athlete type
interface Athlete {
  id: number;
  name: string;
  age?: number;
  photoUrl?: string;
  sex: string;
  athlete_id: number;
  coach_nic: string;
  dob: string;
  profile_pic: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`${BACKEND_URL}/athlete-crud`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched athletes:', data);
        
        if (!Array.isArray(data)) {
          console.error('Data is not an array:', data);
          throw new Error('Invalid data format: expected an array');
        }

        const processedAthletes = data.map((athlete: any) => {
          console.log('Processing athlete:', athlete);
          try {
            let age = 0;
            if (athlete.dob) {
              try {
                const birthDate = new Date(athlete.dob);
                if (!isNaN(birthDate.getTime())) {
                  const today = new Date();
                  age = today.getFullYear() - birthDate.getFullYear();
                  if (
                    today.getMonth() < birthDate.getMonth() || 
                    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }
                }
              } catch (dateError) {
                console.error('Error parsing date:', athlete.dob, dateError);
              }
            }

            return {
              ...athlete,
              id: athlete.athlete_id ?? athlete.id ?? 0,
              sex: athlete.sex || 'Male',
              age: age || 0,
              profile_pic: athlete.profile_pic || '',
              name: athlete.name || 'Unknown'
            };
          } catch (athleteError) {
            console.error('Error processing athlete:', athleteError);
            return {
              athlete_id: 0,
              id: 0,
              name: 'Error',
              age: 0,
              sex: 'Male',
              coach_nic: '',
              dob: '',
              profile_pic: ''
            };
          }
        });
        
        console.log('Processed athletes:', processedAthletes);
        setAthletes(processedAthletes);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching athletes:', err.message || err);
        setError('Failed to load athletes');
        setIsLoading(false);
      });
  }, []);

  const renderHeader = () => (
    <TouchableOpacity 
      style={styles.addCard} 
      onPress={() => {
        router.navigate({pathname: '/athlete/create'});
      }}
    >
      <View style={styles.addIconContainer}>
        <Ionicons name="person-add-outline" size={32} color="#4285F4" />
      </View>
      <Text style={styles.addTitle}>Add New Player</Text>
      <Text style={styles.addSubtitle}>Create a profile for a new athlete</Text>
    </TouchableOpacity>
  );

  const renderAthlete = ({ item }: { item: Athlete }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        router.push(`/athlete/details?id=${item.athlete_id}`);
      }}
    >
      <Image 
        source={{ 
          uri: item.profile_pic || 'https://via.placeholder.com/60?text=N' 
        }} 
        style={styles.avatar} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>Age: {item.age}</Text>
        
        {/* Stats section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>No Stats Yet</Text>
          <Ionicons name="chevron-forward" size={16} color="#777" />
        </View>
      </View>
      
      {/* Sex badge */}
      <View style={[
        styles.sexBadge, 
        item.sex.toLowerCase() === 'female' ? styles.femaleBadge : styles.maleBadge
      ]}>
        <Text style={styles.sexBadgeText}>
          {item.sex}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={40} color="#777" />
      </View>
      <Text style={styles.emptyTitle}>No Players Yet</Text>
      <Text style={styles.emptySubtitle}>Add your first player to get started</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Coach Dashboard</Text>
        <Text style={styles.coachName}>vihanga</Text>
      </View>
      <FlatList
        data={athletes}
        keyExtractor={(item) => item.athlete_id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderAthlete}
        ListEmptyComponent={isLoading ? null : renderEmptyList}
        contentContainerStyle={styles.listContainer}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading athletes...</Text>
        </View>
      )}
      
      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
  },
  headerBar: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  coachName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  addCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bbb',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  addIconContainer: {
    backgroundColor: '#e6f2ff',
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
  },
  addTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    position: 'relative',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: '#ccc',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 120,
  },
  statsText: {
    fontSize: 12,
    color: '#444',
  },
  sexBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  maleBadge: {
    backgroundColor: '#007bff',
  },
  femaleBadge: {
    backgroundColor: '#ff4081',
  },
  sexBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});