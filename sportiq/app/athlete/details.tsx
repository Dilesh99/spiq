import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://localhost:5000';  // Replace with your computer's actual local IP address

// Interface for the Athlete data
interface Athlete {
  athlete_id: number;
  name: string;
  age: number;
  sex: string;
  dob: string;
  profile_pic: string;
  coach_nic: string;
}

export default function AthleteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMeasurements, setHasMeasurements] = useState(false);

  useEffect(() => {
    // Fetch athlete details from the backend
    if (id) {
      console.log("hello world")
      setIsLoading(true);
      fetch(`${BACKEND_URL}/athlete-crud/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Server responded with status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Athlete details:', data);
          setAthlete(data);
          
          // Check if athlete has measurements
          return fetch(`${BACKEND_URL}/measurements-crud/${id}`);
        })
        .then(res => {
          if (res.ok) {
            setHasMeasurements(true);
          } else if (res.status === 404) {
            setHasMeasurements(false);
          } else {
            console.error('Error checking measurements:', res.status);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching athlete details or measurements:', err.message || err);
          setError('Failed to load athlete details');
          setIsLoading(false);
        });
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [id]);

  // Format the date of birth to MM/DD/YYYY
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Function to handle measurements navigation
  const handleAddMeasurements = () => {
    if (!athlete) return;
    console.log('Navigate to add measurements page for athlete:', athlete.athlete_id);
    router.push({
      pathname: '/athlete/measurements/[id]',
      params: { id: athlete.athlete_id.toString() }
    });
  };

  // Function to handle viewing measurements
  const handleViewMeasurements = () => {
    if (!athlete) return;
    console.log('Navigate to view measurements page for athlete:', athlete.athlete_id);
    router.push({
      pathname: '/athlete/view-measurements/[id]',
      params: { id: athlete.athlete_id.toString() }
    });
  };

  // Function to handle performance measurements navigation
  const handlePerformanceMeasurements = () => {
    if (!athlete) return;
    console.log('Navigate to performance measurements page for athlete:', athlete.athlete_id);
    router.push({
      pathname: '/athlete/performance-measurements/[id]',
      params: { id: athlete.athlete_id.toString() }
    });
  };

  // Function to handle performance history navigation
  const handlePerformanceHistory = () => {
    if (!athlete) return;
    console.log('Navigate to performance history page for athlete:', athlete.athlete_id);
    router.push({
      pathname: '/athlete/performance-history/[id]',
      params: { id: athlete.athlete_id.toString() }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading athlete details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !athlete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error || 'An error occurred'}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          {/* Profile Image */}
          <Image 
            source={{ uri: athlete.profile_pic || 'https://via.placeholder.com/150?text=No+Image' }} 
            style={styles.profileImage}
            resizeMode="contain"
          />
          
          {/* Athlete Details */}
          <Text style={styles.athleteName}>{athlete.name}</Text>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Age: {athlete.age}</Text>
            <Text style={styles.detailText}>Sex: {athlete.sex.toLowerCase()}</Text>
            <Text style={styles.detailText}>Date of Birth: {formatDate(athlete.dob)}</Text>
          </View>
          
          {/* Conditional Measurements Button */}
          {hasMeasurements ? (
            <TouchableOpacity 
              style={styles.viewMeasurementsButton} 
              onPress={handleViewMeasurements}
            >
              <Ionicons name="list" size={20} color="#28a745" style={styles.buttonIcon} />
              <Text style={styles.viewMeasurementsButtonText}>View Measurements</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.measurementsButton} 
              onPress={handleAddMeasurements}
            >
              <Ionicons name="add-circle" size={20} color="#007bff" style={styles.buttonIcon} />
              <Text style={styles.measurementsButtonText}>Add Measurements</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.performanceButton} onPress={handlePerformanceMeasurements}>
            <Ionicons name="stats-chart" size={20} color="#007bff" style={styles.buttonIcon} />
            <Text style={styles.performanceButtonText}>Performance Measurements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.historyButton} onPress={handlePerformanceHistory}>
            <Ionicons name="trending-up" size={20} color="#28a745" style={styles.buttonIcon} />
            <Text style={styles.historyButtonText}>View Performance History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 200,
    height: 150,
    marginBottom: 20,
  },
  athleteName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  measurementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 12,
  },
  viewMeasurementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: '#f0f9f1',
    marginBottom: 12,
  },
  performanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: '#eaf6ff',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: '#f0f9f1',
  },
  buttonIcon: {
    marginRight: 8,
  },
  measurementsButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  viewMeasurementsButtonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '500',
  },
  performanceButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  historyButtonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: '#f0f9f1',
    marginBottom: 12,
  },
  buttonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '500',
  },
}); 