import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://localhost:5000';  // Replace with your computer's actual local IP address

// Define measurement types
interface Measurements {
  athlete_id: number;
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

// Define measurement instruction sources
const measurementInstructions = {
  uac: 'https://www.researchgate.net/profile/Donald-Dengel/publication/348566999/figure/fig2/AS:982778328346626@1611551010566/Mid-Upper-Arm-Circumference-Examiner-Standing-Behind-the-Subject-With-the-Subject-s.png',
  cc: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/02/calf-muscle-measurement.png?resize=768%2C432&ssl=1',
  triceps: 'https://www.researchgate.net/profile/Thomas-Barber-3/publication/9087613/figure/fig2/AS:394662550278146@1471104300584/Measurement-of-skinfold-thickness-at-the-triceps-site-All-skinfold-thicknesses-were.png',
  subscapular: 'https://www.researchgate.net/profile/Donald-Dengel/publication/348566999/figure/fig6/AS:982778336735233@1611551011143/Subscapular-Skinfold-Thickness-This-Skinfold-is-Measured-on-the-Diagonal-Line-Coming.png',
  supraspinale: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRmfLcf-3q-LUv8ov-Vs8JxZ-ahBpd-oxbA&usqp=CAU',
  medialCalf: 'https://www.researchgate.net/profile/Donald-Dengel/publication/348566999/figure/fig7/AS:982778340929538@1611551011358/Medial-Calf-Skinfold-Thickness-This-Skinfold-is-Measured-on-the-Inside-of-the-Calf-at.png',
  humerus: 'https://www.researchgate.net/profile/Roel-Vanholder/publication/12770610/figure/fig8/AS:601795231936521@1520492339589/Measurement-of-humerus-breadth-The-distance-across-the-epicondyles-of-the-right-humerus.png',
  femur: 'https://www.researchgate.net/profile/Roel-Vanholder/publication/12770610/figure/fig9/AS:601795231936520@1520492339568/Measurements-of-femur-breadth-The-distance-across-the-epicondyles-of-the-right-femur-was.png'
};

// Tab definitions
enum MeasurementTab {
  BASIC = 0,
  SKINFOLDS = 1,
  BONE_WIDTHS = 2
}

export default function AthleteMeasurementsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const athleteId = typeof id === 'string' ? parseInt(id, 10) : 0;

  const [measurements, setMeasurements] = useState<Measurements>({
    athlete_id: athleteId,
    height: undefined,
    weight: undefined,
    uac: undefined,
    cc: undefined,
    skinfold_triceps: undefined,
    skinfold_subscapular: undefined,
    skinfold_supraspinale: undefined,
    skinfold_medial_calf: undefined,
    humerous_width: undefined,
    femur_width: undefined,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [athleteName, setAthleteName] = useState('');
  const [activeTab, setActiveTab] = useState<MeasurementTab>(MeasurementTab.BASIC);

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

      // Fetch existing measurements
      fetch(`${BACKEND_URL}/measurements-crud/${athleteId}`)
        .then(res => {
          if (!res.ok) {
            // If 404, it means no measurements yet, which is fine
            if (res.status === 404) {
              return null;
            }
            throw new Error(`Server responded with status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Existing measurements:', data);
          if (data) {
            setMeasurements({
              athlete_id: athleteId,
              height: data.height,
              weight: data.weight,
              uac: data.uac,
              cc: data.cc,
              skinfold_triceps: data.skinfold_triceps,
              skinfold_subscapular: data.skinfold_subscapular,
              skinfold_supraspinale: data.skinfold_supraspinale,
              skinfold_medial_calf: data.skinfold_medial_calf,
              humerous_width: data.humerous_width,
              femur_width: data.femur_width,
            });
          }
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

  const handleInputChange = (field: keyof Measurements, value: string) => {
    const numericValue = value === '' ? undefined : Number(value);
    setMeasurements(prev => ({ ...prev, [field]: numericValue }));
  };

  const handleSaveMeasurements = async () => {
    if (!athleteId) {
      Alert.alert('Error', 'No athlete ID provided');
      return;
    }

    // Validation - at minimum height and weight should be provided
    if (measurements.height === undefined || measurements.weight === undefined) {
      Alert.alert('Error', 'At minimum, height and weight must be provided');
      return;
    }

    setIsSaving(true);

    try {
      // Check if measurements already exist
      const checkResponse = await fetch(`${BACKEND_URL}/measurements-crud/${athleteId}`);
      const methodType = checkResponse.status === 404 ? 'POST' : 'PUT';
      
      // Send data to backend
      const response = await fetch(`${BACKEND_URL}/measurements-crud`, {
        method: methodType,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurements),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${methodType === 'POST' ? 'create' : 'update'} measurements`);
      }

      Alert.alert(
        'Success', 
        `Measurements ${methodType === 'POST' ? 'created' : 'updated'} successfully`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Update the button handler to either navigate to next tab or save based on current tab
  const handleButtonAction = async () => {
    if (activeTab === MeasurementTab.BASIC) {
      // Basic tab - move to Skinfolds tab
      setActiveTab(MeasurementTab.SKINFOLDS);
    } else if (activeTab === MeasurementTab.SKINFOLDS) {
      // Skinfolds tab - move to Bone Widths tab
      setActiveTab(MeasurementTab.BONE_WIDTHS);
    } else {
      // Bone Widths tab - save all measurements
      await handleSaveMeasurements();
    }
  };

  // Get button text based on active tab
  const getButtonText = () => {
    switch (activeTab) {
      case MeasurementTab.BASIC:
      case MeasurementTab.SKINFOLDS:
        return 'Next';
      case MeasurementTab.BONE_WIDTHS:
        return 'Save All Measurements';
      default:
        return 'Next';
    }
  };

  const renderBasicMeasurementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Basic Measurements</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={measurements.height?.toString() || ''}
            onChangeText={(value) => handleInputChange('height', value)}
            placeholder="0.0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={measurements.weight?.toString() || ''}
            onChangeText={(value) => handleInputChange('weight', value)}
            placeholder="0.0"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Circumferences</Text>
      
      {/* Upper Arm Circumference */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Upper Arm Circumference (cm)</Text>
        <Image 
          source={{ uri: measurementInstructions.uac }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure at the midpoint between the acromion (shoulder) and olecranon (elbow) processes, with the arm relaxed.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.uac?.toString() || ''}
          onChangeText={(value) => handleInputChange('uac', value)}
          placeholder="0.0"
        />
      </View>
      
      {/* Calf Circumference */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Calf Circumference (cm)</Text>
        <Image 
          source={{ uri: measurementInstructions.cc }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure at the maximum circumference of the calf with the subject's weight distributed equally on both feet.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.cc?.toString() || ''}
          onChangeText={(value) => handleInputChange('cc', value)}
          placeholder="0.0"
        />
      </View>
    </View>
  );

  const renderSkinfoldsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Skinfold Measurements</Text>
      
      {/* Triceps Skinfold */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Triceps Skinfold (mm)</Text>
        <Image 
          source={{ uri: measurementInstructions.triceps }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure a vertical fold on the back of the upper arm, halfway between the acromion and olecranon processes.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.skinfold_triceps?.toString() || ''}
          onChangeText={(value) => handleInputChange('skinfold_triceps', value)}
          placeholder="0.0"
        />
      </View>
      
      {/* Subscapular Skinfold */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Subscapular Skinfold (mm)</Text>
        <Image 
          source={{ uri: measurementInstructions.subscapular }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure a diagonal fold just below the inferior angle of the scapula.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.skinfold_subscapular?.toString() || ''}
          onChangeText={(value) => handleInputChange('skinfold_subscapular', value)}
          placeholder="0.0"
        />
      </View>
      
      {/* Supraspinale Skinfold */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Supraspinale Skinfold (mm)</Text>
        <Image 
          source={{ uri: measurementInstructions.supraspinale }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure a diagonal fold about 5-7 cm above the anterior superior iliac spine on a line to the anterior axillary border.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.skinfold_supraspinale?.toString() || ''}
          onChangeText={(value) => handleInputChange('skinfold_supraspinale', value)}
          placeholder="0.0"
        />
      </View>
      
      {/* Medial Calf Skinfold */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Medial Calf Skinfold (mm)</Text>
        <Image 
          source={{ uri: measurementInstructions.medialCalf }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure a vertical fold at the maximum circumference of the calf on the medial (inner) side.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.skinfold_medial_calf?.toString() || ''}
          onChangeText={(value) => handleInputChange('skinfold_medial_calf', value)}
          placeholder="0.0"
        />
      </View>
    </View>
  );

  const renderBoneWidthsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Bone Width Measurements</Text>
      
      {/* Humerus Width */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Humerus Width (cm)</Text>
        <Image 
          source={{ uri: measurementInstructions.humerus }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure the distance between the medial and lateral epicondyles of the humerus with the elbow flexed to 90°.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.humerous_width?.toString() || ''}
          onChangeText={(value) => handleInputChange('humerous_width', value)}
          placeholder="0.0"
        />
      </View>
      
      {/* Femur Width */}
      <View style={styles.measurementContainer}>
        <Text style={styles.label}>Femur Width (cm)</Text>
        <Image 
          source={{ uri: measurementInstructions.femur }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
        <Text style={styles.instructionText}>
          Measure the distance between the medial and lateral epicondyles of the femur with the knee flexed to 90°.
        </Text>
        <TextInput
          style={styles.fullInput}
          keyboardType="numeric"
          value={measurements.femur_width?.toString() || ''}
          onChangeText={(value) => handleInputChange('femur_width', value)}
          placeholder="0.0"
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case MeasurementTab.BASIC:
        return renderBasicMeasurementsTab();
      case MeasurementTab.SKINFOLDS:
        return renderSkinfoldsTab();
      case MeasurementTab.BONE_WIDTHS:
        return renderBoneWidthsTab();
      default:
        return renderBasicMeasurementsTab();
    }
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
          <Text style={styles.loadingText}>Loading...</Text>
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

      <Text style={styles.athleteNameText}>
        {athleteName}
      </Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === MeasurementTab.BASIC && styles.activeTabButton]}
          onPress={() => setActiveTab(MeasurementTab.BASIC)}
        >
          <Text style={[styles.tabButtonText, activeTab === MeasurementTab.BASIC && styles.activeTabButtonText]}>
            Basic
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === MeasurementTab.SKINFOLDS && styles.activeTabButton]}
          onPress={() => setActiveTab(MeasurementTab.SKINFOLDS)}
        >
          <Text style={[styles.tabButtonText, activeTab === MeasurementTab.SKINFOLDS && styles.activeTabButtonText]}>
            Skinfolds
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === MeasurementTab.BONE_WIDTHS && styles.activeTabButton]}
          onPress={() => setActiveTab(MeasurementTab.BONE_WIDTHS)}
        >
          <Text style={[styles.tabButtonText, activeTab === MeasurementTab.BONE_WIDTHS && styles.activeTabButtonText]}>
            Bone Widths
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.formCard}>
            {renderTabContent()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleButtonAction}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>{getButtonText()}</Text>
        )}
      </TouchableOpacity>
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
  athleteNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formCard: {
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
  tabContent: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 16,
    color: '#007bff',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  fullInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginTop: 8,
  },
  measurementContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  instructionImage: {
    width: '100%',
    height: 200,
    marginVertical: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
}); 