import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PerformanceService from '../../services/PerformanceService';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://18.142.49.203:5000';  // Replace with your computer's actual local IP address

// Performance Measurement Interface
interface PerformanceMeasurement {
  name: string;
  key: string;
  unit: string;
  icon: any; // Using 'any' for icon names to avoid TypeScript issues
  description: string;
}

// Performance Measurement Data Interface
interface PerformanceData {
  athlete_id: string;
  [key: string]: any;
}

export default function AthletePerformanceMeasurementsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Handle string athlete IDs
  let athleteId = '';
  if (id) {
    if (typeof id === 'string') {
      athleteId = id;
    } else if (Array.isArray(id) && id.length > 0) {
      athleteId = id[0];
    }
  }
  
  console.log('Performance Measurements - Athlete ID:', id, 'Parsed ID:', athleteId);

  // Get the list of performance measurements
  const performanceMeasurements = PerformanceService.getPerformanceMeasurementsList();

  const [athleteName, setAthleteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceData>({ athlete_id: athleteId });
  const [existingData, setExistingData] = useState<PerformanceData | null>(null);
  
  // State for the measurement input modal
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<PerformanceMeasurement | null>(null);
  const [trialValues, setTrialValues] = useState(['', '', '']);
  const [isSaving, setIsSaving] = useState(false);

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

      // Fetch existing performance data if available
      PerformanceService.getPerformanceMeasurements(athleteId)
        .then(data => {
          console.log('Existing performance data:', data);
          if (data) {
            setExistingData(data);
            setPerformanceData({ athlete_id: athleteId, ...data });
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching performance data:', err);
          setIsLoading(false);
        });
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [athleteId]);

  const handleMeasurementPress = (measurement: PerformanceMeasurement) => {
    setCurrentMeasurement(measurement);
    setTrialValues(['', '', '']);
    setModalVisible(true);
  };

  // Validate if the input value is a valid number format
  const isValidNumberInput = (value: string): boolean => {
    return value === '' || /^-?\d*\.?\d*$/.test(value);
  };

  const handleTrialValueChange = (index: number, value: string) => {
    // Only allow numeric input (digits, decimal point, and negative sign)
    if (isValidNumberInput(value)) {
      const newTrialValues = [...trialValues];
      newTrialValues[index] = value;
      setTrialValues(newTrialValues);
    }
  };

  // Check if any values are invalid
  const hasInvalidTrialValues = () => {
    return trialValues.some(val => val !== '' && !isValidNumberInput(val));
  };

  const handleSaveMeasurement = async () => {
    if (!currentMeasurement) return;
    
    // Check if any values are invalid
    if (hasInvalidTrialValues()) {
      Alert.alert('Error', 'Please correct the invalid values before saving');
      return;
    }
    
    const average = PerformanceService.calculateAverage(trialValues);
    if (average === null) {
      Alert.alert('Error', 'Please enter at least one valid measurement');
      return;
    }

    setIsSaving(true);

    // Update the performance data state
    const updatedData = {
      ...performanceData,
      [currentMeasurement.key]: average
    };
    setPerformanceData(updatedData);

    try {
      // Save data using the service
      await PerformanceService.savePerformanceMeasurements(updatedData, existingData !== null);
      
      // Update existing data reference if this was the first save
      if (!existingData) {
        setExistingData(updatedData);
      }

      // Close modal and show success message
      setModalVisible(false);
      Alert.alert('Success', `${currentMeasurement.name} saved successfully`);
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', `Failed to save measurement: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getMeasurementValue = (key: string) => {
    if (performanceData && performanceData[key] !== undefined) {
      const value = performanceData[key];
      // Check if the value is a valid number
      if (PerformanceService.isValidNumber(value)) {
        return value.toString();
      }
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Measurements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Measurements</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
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
        <Text style={styles.headerTitle}>Performance Measurements</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.athleteNameText}>{athleteName}</Text>
        
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Tap on any measurement to record or update values. You can enter up to three trials, and the average will be calculated automatically.
          </Text>
        </View>

        

        {performanceMeasurements.map((measurement) => (
          <TouchableOpacity
            key={measurement.key}
            style={styles.measurementCard}
            onPress={() => handleMeasurementPress(measurement)}
          >
            <View style={styles.measurementHeader}>
              <Ionicons name={measurement.icon as any} size={24} color="#007bff" />
              <Text style={styles.measurementName}>{measurement.name}</Text>
            </View>
            
            <Text style={styles.measurementDescription}>
              {measurement.description}
            </Text>
            
            <View style={styles.measurementValueContainer}>
              <Text style={styles.measurementValueLabel}>Current value:</Text>
              <Text 
                style={[
                  styles.measurementValue,
                  getMeasurementValue(measurement.key) === 'N/A' && styles.notMeasured
                ]}
              >
                {getMeasurementValue(measurement.key)} {performanceData[measurement.key] !== undefined && getMeasurementValue(measurement.key) !== 'N/A' ? measurement.unit : ''}
              </Text>
              {getMeasurementValue(measurement.key) === 'N/A' ? (
                <Ionicons name="alert-circle" size={20} color="#e74c3c" style={styles.statusIcon} />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" style={styles.statusIcon} />
              )}
              <Ionicons name="create-outline" size={20} color="#999" style={styles.editIcon} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Measurement Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentMeasurement?.name}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter up to three trial values ({currentMeasurement?.unit})
            </Text>

            <View style={styles.trialsContainer}>
              {trialValues.map((value, index) => (
                <View key={index} style={styles.trialInputContainer}>
                  <Text style={styles.trialLabel}>Trial {index + 1}</Text>
                  <TextInput
                    style={[styles.trialInput, !isValidNumberInput(value) && styles.inputError]}
                    value={value}
                    onChangeText={(newValue) => handleTrialValueChange(index, newValue)}
                    keyboardType="numeric"
                    placeholder={`Enter value (${currentMeasurement?.unit})`}
                  />
                  {!isValidNumberInput(value) && (
                    <Text style={styles.errorMessage}>Please enter a valid number</Text>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (isSaving || hasInvalidTrialValues()) && styles.disabledButton
              ]}
              onPress={handleSaveMeasurement}
              disabled={isSaving || hasInvalidTrialValues()}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Measurement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  instructionCard: {
    backgroundColor: '#eaf6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },
  measurementCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  measurementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  measurementValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
  },
  measurementValueLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  notMeasured: {
    color: '#999',
    fontStyle: 'italic',
  },
  editIcon: {
    marginLeft: 8,
  },
  statusIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  trialsContainer: {
    marginBottom: 20,
  },
  trialInputContainer: {
    marginBottom: 12,
  },
  trialLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  trialInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff8f8',
  },
  errorMessage: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b3d7ff',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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