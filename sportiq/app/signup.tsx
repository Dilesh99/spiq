import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NIC Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your NIC number"
              value={nic}
              onChangeText={setNic}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  signUpButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});