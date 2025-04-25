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
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');


// Backend URL
const BACKEND_URL = 'http://18.142.49.203:5000';

// Sport-specific metrics mapping
const sportMetrics: {
  [key: string]: Array<{
    key: string;
    name: string;
    unit: string;
    description: string;
    icon: string;
  }>
} = {
  '100m Sprint': [
    { key: 'sprint_time', name: 'Sprint Time', unit: 'sec', description: 'Time to complete sprint', icon: 'stopwatch' },
    { key: 'sprint_time_trial1', name: 'Trial 1', unit: 'sec', description: 'First trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial2', name: 'Trial 2', unit: 'sec', description: 'Second trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial3', name: 'Trial 3', unit: 'sec', description: 'Third trial time', icon: 'stopwatch' },
  ],
  '200m Sprint': [
    { key: 'sprint_time', name: 'Sprint Time', unit: 'sec', description: 'Time to complete sprint', icon: 'stopwatch' },
    { key: 'sprint_time_trial1', name: 'Trial 1', unit: 'sec', description: 'First trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial2', name: 'Trial 2', unit: 'sec', description: 'Second trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial3', name: 'Trial 3', unit: 'sec', description: 'Third trial time', icon: 'stopwatch' },
  ],
  '400m Sprint': [
    { key: 'sprint_time', name: 'Sprint Time', unit: 'sec', description: 'Time to complete sprint', icon: 'stopwatch' },
    { key: 'sprint_time_trial1', name: 'Trial 1', unit: 'sec', description: 'First trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial2', name: 'Trial 2', unit: 'sec', description: 'Second trial time', icon: 'stopwatch' },
    { key: 'sprint_time_trial3', name: 'Trial 3', unit: 'sec', description: 'Third trial time', icon: 'stopwatch' },
  ],
  'Hurdles': [
    { key: 'hurdle_time', name: 'Hurdle Time', unit: 'sec', description: 'Time to complete hurdles', icon: 'stopwatch' },
    { key: 'hurdle_time_trial1', name: 'Trial 1', unit: 'sec', description: 'First trial time', icon: 'stopwatch' },
    { key: 'hurdle_time_trial2', name: 'Trial 2', unit: 'sec', description: 'Second trial time', icon: 'stopwatch' },
    { key: 'hurdle_time_trial3', name: 'Trial 3', unit: 'sec', description: 'Third trial time', icon: 'stopwatch' },
  ],
  'Vertical Jump': [
    { key: 'jump_height', name: 'Jump Height', unit: 'cm', description: 'Height of vertical jump', icon: 'trending-up' },
    { key: 'jump_height_trial1', name: 'Trial 1', unit: 'cm', description: 'First trial height', icon: 'trending-up' },
    { key: 'jump_height_trial2', name: 'Trial 2', unit: 'cm', description: 'Second trial height', icon: 'trending-up' },
    { key: 'jump_height_trial3', name: 'Trial 3', unit: 'cm', description: 'Third trial height', icon: 'trending-up' },
  ],
  'Long Jump': [
    { key: 'distance', name: 'Jump Distance', unit: 'm', description: 'Distance of long jump', icon: 'resize' },
    { key: 'distance_trial1', name: 'Trial 1', unit: 'm', description: 'First trial distance', icon: 'resize' },
    { key: 'distance_trial2', name: 'Trial 2', unit: 'm', description: 'Second trial distance', icon: 'resize' },
    { key: 'distance_trial3', name: 'Trial 3', unit: 'm', description: 'Third trial distance', icon: 'resize' },
  ],
  'Triple Jump': [
    { key: 'distance', name: 'Jump Distance', unit: 'm', description: 'Distance of triple jump', icon: 'resize' },
    { key: 'distance_trial1', name: 'Trial 1', unit: 'm', description: 'First trial distance', icon: 'resize' },
    { key: 'distance_trial2', name: 'Trial 2', unit: 'm', description: 'Second trial distance', icon: 'resize' },
    { key: 'distance_trial3', name: 'Trial 3', unit: 'm', description: 'Third trial distance', icon: 'resize' },
  ],
  'Swimming': [
    { key: 'lap_time', name: 'Lap Time', unit: 'sec', description: 'Time to complete a single lap', icon: 'time' },
    { key: 'stroke_count', name: 'Stroke Count', unit: 'count', description: 'Number of strokes per lap', icon: 'repeat' },
    { key: 'distance', name: 'Distance', unit: 'm', description: 'Total distance covered', icon: 'resize' },
  ],
  // Add other sports as they were
  'Sprint Running': [
    { key: 'sprint_time', name: 'Sprint Time', unit: 'sec', description: 'Time to complete sprint', icon: 'stopwatch' },
    { key: 'max_speed', name: 'Maximum Speed', unit: 'm/s', description: 'Maximum speed reached', icon: 'speedometer' },
    { key: 'reaction_time', name: 'Reaction Time', unit: 'ms', description: 'Time to react to start signal', icon: 'flash' },
  ],
  'Basketball': [
    { key: 'free_throw_pct', name: 'Free Throw %', unit: '%', description: 'Free throw success rate', icon: 'basketball' },
    { key: 'points_scored', name: 'Points Scored', unit: 'pts', description: 'Total points scored', icon: 'stats-chart' },
    { key: 'rebounds', name: 'Rebounds', unit: 'count', description: 'Total rebounds', icon: 'hand-left' },
  ],
  'Weightlifting': [
    { key: 'max_lift', name: 'Maximum Lift', unit: 'kg', description: 'Maximum weight lifted', icon: 'barbell' },
    { key: 'reps', name: 'Repetitions', unit: 'count', description: 'Number of repetitions', icon: 'repeat' },
    { key: 'sets', name: 'Sets', unit: 'count', description: 'Number of sets completed', icon: 'layers' },
  ],
  'Long-Distance Running': [
    { key: 'distance', name: 'Distance', unit: 'km', description: 'Total distance covered', icon: 'map' },
    { key: 'pace', name: 'Pace', unit: 'min/km', description: 'Average pace', icon: 'timer' },
    { key: 'heart_rate', name: 'Heart Rate', unit: 'bpm', description: 'Average heart rate', icon: 'heart' },
  ],
  'Soccer/Football': [
    { key: 'goals', name: 'Goals', unit: 'count', description: 'Number of goals scored', icon: 'football' },
    { key: 'passes', name: 'Passes', unit: 'count', description: 'Number of successful passes', icon: 'git-network' },
    { key: 'distance', name: 'Distance Covered', unit: 'km', description: 'Total distance covered', icon: 'walk' },
  ],
  'Gymnastics': [
    { key: 'difficulty_score', name: 'Difficulty Score', unit: 'pts', description: 'Score for difficulty of routine', icon: 'star' },
    { key: 'execution_score', name: 'Execution Score', unit: 'pts', description: 'Score for execution quality', icon: 'checkmark-circle' },
    { key: 'final_score', name: 'Final Score', unit: 'pts', description: 'Total score', icon: 'ribbon' },
  ],
  'Cycling': [
    { key: 'distance', name: 'Distance', unit: 'km', description: 'Total distance covered', icon: 'bicycle' },
    { key: 'avg_speed', name: 'Average Speed', unit: 'km/h', description: 'Average speed maintained', icon: 'speedometer' },
    { key: 'power_output', name: 'Power Output', unit: 'watts', description: 'Average power output', icon: 'flash' },
  ],
  'Tennis': [
    { key: 'aces', name: 'Aces', unit: 'count', description: 'Number of aces served', icon: 'tennisball' },
    { key: 'first_serve_pct', name: 'First Serve %', unit: '%', description: 'First serve percentage', icon: 'percent' },
    { key: 'winners', name: 'Winners', unit: 'count', description: 'Number of winning shots', icon: 'checkmark-circle' },
  ],
  'Martial Arts': [
    { key: 'strikes', name: 'Strikes', unit: 'count', description: 'Number of successful strikes', icon: 'hand-right' },
    { key: 'takedowns', name: 'Takedowns', unit: 'count', description: 'Number of successful takedowns', icon: 'arrow-down' },
    { key: 'submissions', name: 'Submissions', unit: 'count', description: 'Number of submission attempts', icon: 'lock-closed' },
  ],
  // Default metrics for any other sport
  'default': [
    { key: 'duration', name: 'Duration', unit: 'min', description: 'Total training duration', icon: 'timer' },
    { key: 'intensity', name: 'Intensity', unit: '1-10', description: 'Training intensity level', icon: 'thermometer' },
    { key: 'notes', name: 'Notes', unit: '', description: 'Training notes', icon: 'create' },
  ]
};

// Tracking data interface
interface TrackingData {
  id?: string;
  athlete_id: string;
  sport: string;
  date: string;
  metrics: {
    [key: string]: number | string;
  };
}

export default function SportTrackingScreen() {
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
  
  const [athleteName, setAthleteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [trackingEntries, setTrackingEntries] = useState<TrackingData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [metrics, setMetrics] = useState<{[key: string]: number | string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<TrackingData[]>([]);

  useEffect(() => {
    if (athleteId) {
      fetchAthleteDetails();
      fetchTrackingData();
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [athleteId]);

  const fetchAthleteDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/athlete-crud/${athleteId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setAthleteName(data.name || 'Athlete');
          
          // Get selected sport from global variable if available
          if (global.SELECTED_SPORT) {
            setSelectedSport(global.SELECTED_SPORT);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching athlete details:', error);
    }
  };

  const fetchTrackingData = async () => {
    setIsLoading(true);
    try {
      // Replace with actual endpoint when available
      const response = await fetch(`${BACKEND_URL}/athlete-tracking/${athleteId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTrackingEntries(data);
          setHistoryData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricsForSport = (sport: string) => {
    return sportMetrics[sport] || sportMetrics.default;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const handleMetricChange = (key: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTrackingData = async () => {
    if (!selectedSport || !selectedDate) {
      Alert.alert('Error', 'Please select a sport and date');
      return;
    }

    try {
      setIsSaving(true);

      // Find the metrics for the selected sport or use default
      const sportMetricsList = getMetricsForSport(selectedSport);
      
      // Extract trial values for the main measurement from the tracking data
      const trialValues = [];
      let mainMetricName = '';
      
      // Determine which sport is selected and extract trial values
      if (selectedSport.includes('Sprint') || selectedSport === 'Hurdles') {
        // For sprints and hurdles, we measure time
        const trial1 = parseFloat(metrics['sprint_time_trial1']?.toString() || '0');
        const trial2 = parseFloat(metrics['sprint_time_trial2']?.toString() || '0');
        const trial3 = parseFloat(metrics['sprint_time_trial3']?.toString() || '0');
        
        if (trial1 > 0) trialValues.push(trial1);
        if (trial2 > 0) trialValues.push(trial2);
        if (trial3 > 0) trialValues.push(trial3);
        
        mainMetricName = selectedSport.includes('Sprint') ? 'sprint_time' : 'hurdle_time';
      } 
      else if (selectedSport === 'Vertical Jump') {
        // For vertical jump, we measure height
        const trial1 = parseFloat(metrics['jump_height_trial1']?.toString() || '0');
        const trial2 = parseFloat(metrics['jump_height_trial2']?.toString() || '0');
        const trial3 = parseFloat(metrics['jump_height_trial3']?.toString() || '0');
        
        if (trial1 > 0) trialValues.push(trial1);
        if (trial2 > 0) trialValues.push(trial2);
        if (trial3 > 0) trialValues.push(trial3);
        
        mainMetricName = 'jump_height';
      }
      else if (selectedSport === 'Long Jump' || selectedSport === 'Triple Jump') {
        // For jumps, we measure distance
        const trial1 = parseFloat(metrics['distance_trial1']?.toString() || '0');
        const trial2 = parseFloat(metrics['distance_trial2']?.toString() || '0');
        const trial3 = parseFloat(metrics['distance_trial3']?.toString() || '0');
        
        if (trial1 > 0) trialValues.push(trial1);
        if (trial2 > 0) trialValues.push(trial2);
        if (trial3 > 0) trialValues.push(trial3);
        
        mainMetricName = 'distance';
      }

      // Calculate mean of trial values if we have any
      let meanValue = 0;
      if (trialValues.length > 0) {
        meanValue = trialValues.reduce((sum, val) => sum + val, 0) / trialValues.length;
      }

      // Calculate athlete's age
      let athleteAge = 0;
      if (global.ATHLETE_DATA && global.ATHLETE_DATA.dob) {
        const birthDate = new Date(global.ATHLETE_DATA.dob);
        const today = new Date();
        athleteAge = today.getFullYear() - birthDate.getFullYear();
        
        // Adjust age if birthday hasn't occurred yet this year
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          athleteAge--;
        }
      }

      // Prepare the tracking data for submission
      const submissionData = {
        athlete_id: global.ATHLETE_DATA?.id,
        date: selectedDate,
        sport: selectedSport,
        age: athleteAge,
        [mainMetricName]: meanValue.toFixed(2)
      };

      // Submit to general tracking endpoint
      await fetch(`${BACKEND_URL}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${global.TOKEN}`,
        },
        body: JSON.stringify(submissionData),
      });

      // Submit to specific sport endpoint based on the sport type
      let sportEndpoint = '';
      
      if (selectedSport === '100m Sprint') {
        sportEndpoint = '/100m-crud';
      } else if (selectedSport === '200m Sprint') {
        sportEndpoint = '/200m-crud';
      } else if (selectedSport === '400m Sprint') {
        sportEndpoint = '/400m-crud';
      } else if (selectedSport === 'Hurdles') {
        sportEndpoint = '/hurdles-crud';
      } else if (selectedSport === 'Vertical Jump') {
        sportEndpoint = '/vertical-jump-crud';
      } else if (selectedSport === 'Long Jump') {
        sportEndpoint = '/long-jump-crud';
      } else if (selectedSport === 'Triple Jump') {
        sportEndpoint = '/triple-jump-crud';
      }

      if (sportEndpoint) {
        // Sport-specific data submission
        const sportData = {
          athlete_id: global.ATHLETE_DATA?.id,
          age: athleteAge,
          output: meanValue.toFixed(2)
        };

        await fetch(`${BACKEND_URL}${sportEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${global.TOKEN}`,
          },
          body: JSON.stringify(sportData),
        });
      }

      Alert.alert('Success', 'Tracking data saved successfully');
      
      // Reset form
      setMetrics({});
      setSelectedDate(new Date());
      
    } catch (error) {
      console.error('Error saving tracking data:', error);
      Alert.alert('Error', 'Failed to save tracking data');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sport Tracking</Text>
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
          <Text style={styles.headerTitle}>Sport Tracking</Text>
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

  // Render history modal
  const renderHistoryModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Training History</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHistory(false)}
              >
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyContainer}>
              {historyData.length > 0 ? (
                historyData
                  .filter(entry => entry.sport === selectedSport)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry, index) => (
                    <View key={index} style={styles.historyCard}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                        <Ionicons 
                          name={(sportMetrics[selectedSport]?.[0]?.icon as any) || 'fitness'} 
                          size={24} 
                          color="#007bff" 
                        />
                      </View>
                      
                      <View style={styles.metricsContainer}>
                        {Object.entries(entry.metrics).map(([key, value], idx) => {
                          const metricDef = getMetricsForSport(selectedSport).find((m: { key: string }) => m.key === key);
                          if (!metricDef) return null;
                          
                          return (
                            <View key={idx} style={styles.metricItem}>
                              <Text style={styles.metricLabel}>{metricDef.name}:</Text>
                              <Text style={styles.metricValue}>
                                {value} {metricDef.unit}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))
              ) : (
                <View style={styles.emptyHistoryContainer}>
                  <Ionicons name="calendar" size={60} color="#aaa" />
                  <Text style={styles.emptyHistoryText}>No training history yet</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHistory(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sport Tracking</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.athleteNameText}>{athleteName}</Text>
        
        <View style={styles.sportSection}>
          <Text style={styles.sectionTitle}>Selected Sport</Text>
          
          {selectedSport ? (
            <View style={styles.selectedSportCard}>
              <Ionicons name="trophy" size={24} color="#007bff" />
              <Text style={styles.selectedSportText}>{selectedSport}</Text>
            </View>
          ) : (
            <View style={styles.noSportSelectedCard}>
              <Text style={styles.noSportText}>No sport selected. Please select a sport in the recommendations screen.</Text>
            </View>
          )}
        </View>

        {selectedSport && (
          <>
            <View style={styles.dateSection}>
              <Text style={styles.sectionTitle}>Training Date</Text>
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={24} color="#007bff" />
                <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.metricsSection}>
              <View style={styles.metricsSectionHeader}>
                <Text style={styles.sectionTitle}>Measurements</Text>
                <TouchableOpacity 
                  style={styles.historyButton}
                  onPress={() => setShowHistory(true)}
                >
                  <Ionicons name="time" size={18} color="#007bff" />
                  <Text style={styles.historyButtonText}>View History</Text>
                </TouchableOpacity>
              </View>
              
              {getMetricsForSport(selectedSport).map((metric: { key: string; name: string; unit: string; description: string; icon: string }, index: number) => (
                <View key={index} style={styles.metricInputContainer}>
                  <View style={styles.metricLabelContainer}>
                    <Ionicons name={metric.icon as any} size={20} color="#007bff" />
                    <Text style={styles.metricInputLabel}>{metric.name}</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.metricInput}
                      placeholder={`Enter ${metric.name.toLowerCase()}`}
                      value={metrics[metric.key]?.toString() || ''}
                      onChangeText={(text) => handleMetricChange(metric.key, text)}
                      keyboardType={metric.key === 'notes' ? 'default' : 'numeric'}
                    />
                    {metric.unit && <Text style={styles.unitText}>{metric.unit}</Text>}
                  </View>
                  <Text style={styles.metricDescription}>{metric.description}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveTrackingData}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>Save Training Data</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Render history modal */}
      {renderHistoryModal()}
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
  sportSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedSportCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedSportText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
    color: '#333',
  },
  noSportSelectedCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noSportText: {
    fontSize: 14,
    color: '#666',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSelector: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  historyButtonText: {
    color: '#007bff',
    marginLeft: 5,
    fontSize: 14,
  },
  metricInputContainer: {
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
  metricLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  metricInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  unitText: {
    color: '#777',
    marginLeft: 5,
    fontSize: 14,
  },
  metricDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  historyContainer: {
    maxHeight: 400,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#555',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 