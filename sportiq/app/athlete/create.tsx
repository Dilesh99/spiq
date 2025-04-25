import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// Import with type assertion to avoid TypeScript error
// @ts-ignore
// import DateTimePicker from '@react-native-community/datetimepicker';

const BACKEND_URL = 'http://18.142.49.203:5000';

export default function CreateAthleteScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [sex, setSex] = useState('M');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hardcoded coach NIC for demo (in real app, this would come from authentication/context)
  const coachNic = '199934567890';

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Custom date picker with year, month, day selection
  const renderCustomDatePicker = () => {
    const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    const [tempYear, setTempYear] = useState(dateOfBirth.getFullYear());
    const [tempMonth, setTempMonth] = useState(dateOfBirth.getMonth());
    const [tempDay, setTempDay] = useState(dateOfBirth.getDate());
    
    const confirmDate = () => {
      const newDate = new Date(tempYear, tempMonth, tempDay);
      setDateOfBirth(newDate);
      setDatePickerVisible(false);
    };
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.dateSelectors}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Year</Text>
                <ScrollView style={styles.dateScrollView}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.dateOption, year === tempYear && styles.selectedDateOption]}
                      onPress={() => setTempYear(year)}
                    >
                      <Text style={[styles.dateOptionText, year === tempYear && styles.selectedDateOptionText]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Month</Text>
                <ScrollView style={styles.dateScrollView}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[styles.dateOption, index === tempMonth && styles.selectedDateOption]}
                      onPress={() => setTempMonth(index)}
                    >
                      <Text style={[styles.dateOptionText, index === tempMonth && styles.selectedDateOptionText]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Day</Text>
                <ScrollView style={styles.dateScrollView}>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dateOption, day === tempDay && styles.selectedDateOption]}
                      onPress={() => setTempDay(day)}
                    >
                      <Text style={[styles.dateOptionText, day === tempDay && styles.selectedDateOptionText]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmDate}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSavePlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter player name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare player data for submission
      const playerData = {
        coach_nic: coachNic,
        name: playerName,
        dob: dateOfBirth.toISOString().split('T')[0], // Format: YYYY-MM-DD
        sex: sex,
        profile_pic: '' // Empty for now, photo upload to be implemented
      };
      
      // Send data to backend
      const response = await fetch(`${BACKEND_URL}/athlete-crud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Player profile created successfully', [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to create player');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Player</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person-outline" size={50} color="#777" />
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Player Information Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Player Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter player's full name"
              value={playerName}
              onChangeText={setPlayerName}
            />
          </View>
          
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setDatePickerVisible(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#777" style={styles.inputIcon} />
            <Text style={styles.dateText}>
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar" size={20} color="#777" />
          </TouchableOpacity>
          
          {/* Custom date picker modal */}
          {renderCustomDatePicker()}
          
          <Text style={styles.label}>Sex</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioOption, sex === 'M' && styles.radioOptionSelected]}
              onPress={() => setSex('M')}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, sex === 'M' && styles.radioOuterSelected]}>
                  {sex === 'M' && <View style={styles.radioInner} />}
                </View>
                <Ionicons name="male" size={16} color={sex === 'M' ? '#007bff' : '#777'} />
                <Text style={[styles.radioText, sex === 'M' && styles.radioTextSelected]}>Male</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.radioOption, sex === 'F' && styles.radioOptionSelected]}
              onPress={() => setSex('F')}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, sex === 'F' && styles.radioOuterSelected]}>
                  {sex === 'F' && <View style={styles.radioInner} />}
                </View>
                <Ionicons name="female" size={16} color={sex === 'F' ? '#007bff' : '#777'} />
                <Text style={[styles.radioText, sex === 'F' && styles.radioTextSelected]}>Female</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePlayer}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Player Profile</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  dateText: {
    flex: 1,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginRight: 10,
  },
  radioOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f0f7ff',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#777',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#007bff',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  radioText: {
    marginLeft: 5,
    color: '#333',
  },
  radioTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal date picker styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateColumnTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateScrollView: {
    height: 200,
  },
  dateOption: {
    padding: 10,
    alignItems: 'center',
  },
  selectedDateOption: {
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
  },
  dateOptionText: {
    fontSize: 16,
  },
  selectedDateOptionText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 