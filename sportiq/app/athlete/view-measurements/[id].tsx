import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://18.142.49.203:5000';  // Replace with your computer's actual local IP address

// Define measurement types
interface Measurements {
  athlete_id: string | number;
  height?: number; // cm
  weight?: number; // kg
  uac?: number; // Upper Arm Circumference (cm)
  cc?: number; // Calf Circumference (cm)
  skinfold_triceps?: number; // mm
  skinfold_subscapular?: number; // mm
  skinfold_supraspinale?: number; // mm
  skinfold_medial_calf?: number; // mm
  humerous_width?: number; // cm
  femur_width?: number; // cm
}

export default function AthleteViewMeasurementsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  // Ensure we properly handle the athlete ID from route params
  let athleteId = '';
  if (id) {
    if (typeof id === 'string') {
      athleteId = id;
    } else if (Array.isArray(id) && id.length > 0) {
      athleteId = id[0];
    }
  }
  
  console.log('View Measurements - Athlete ID:', id, 'Parsed ID:', athleteId);

  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [athleteName, setAthleteName] = useState('');

  useEffect(() => {
    if (athleteId) {
      // Fetch athlete name
      fetch(`${BACKEND_URL}/athlete-crud/${athleteId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAthleteName(data.name || 'Athlete');
          }
        })
        .catch(err => {
          console.error('Error fetching athlete details:', err);
        });

      // Fetch measurements
      fetch(`${BACKEND_URL}/measurements-crud/${athleteId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Server responded with status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Measurements:', data);
          setMeasurements(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching measurements:', err);
          setError('Failed to load measurements');
          setIsLoading(false);
        });
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [athleteId]);

  const handleEditMeasurements = () => {
    // Just pass the already extracted athlete ID
    router.push({
      pathname: "/athlete/measurements/[id]",
      params: { id: athleteId }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anthropometric Measurements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading measurements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !measurements) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anthropometric Measurements</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error || 'Measurements not found'}</Text>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anthropometric Measurements</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.athleteNameText}>{athleteName}</Text>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body-outline" size={22} color="#007bff" />
            <Text style={styles.sectionTitle}>Basic Measurements</Text>
          </View>
          
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Height:</Text>
            <Text style={styles.measurementValue}>{measurements.height} cm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Weight:</Text>
            <Text style={styles.measurementValue}>{measurements.weight} kg</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Ionicons name="resize-outline" size={22} color="#007bff" />
            <Text style={styles.sectionTitle}>Circumferences</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Upper Arm:</Text>
            <Text style={styles.measurementValue}>{measurements.uac} cm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Calf:</Text>
            <Text style={styles.measurementValue}>{measurements.cc} cm</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Ionicons name="git-branch-outline" size={22} color="#007bff" />
            <Text style={styles.sectionTitle}>Skinfolds</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Triceps:</Text>
            <Text style={styles.measurementValue}>{measurements.skinfold_triceps} mm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Subscapular:</Text>
            <Text style={styles.measurementValue}>{measurements.skinfold_subscapular} mm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Supraspinale:</Text>
            <Text style={styles.measurementValue}>{measurements.skinfold_supraspinale} mm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Medial Calf:</Text>
            <Text style={styles.measurementValue}>{measurements.skinfold_medial_calf} mm</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={22} color="#007bff" />
            <Text style={styles.sectionTitle}>Bone Widths</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Humerus:</Text>
            <Text style={styles.measurementValue}>{measurements.humerous_width} cm</Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Femur:</Text>
            <Text style={styles.measurementValue}>{measurements.femur_width} cm</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditMeasurements}
        >
          <Ionicons name="create-outline" size={20} color="#007bff" style={styles.buttonIcon} />
          <Text style={styles.editButtonText}>Edit Measurements</Text>
        </TouchableOpacity>
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
    height: height * 0.10,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
    marginTop: height * 0.01,
  },
  headerTitle: {
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginTop: height * 0.01,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  athleteNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 8,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  measurementLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#007bff',
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
}); 