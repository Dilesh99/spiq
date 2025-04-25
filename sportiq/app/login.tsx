import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {

  const backend_url = "http://18.142.49.203:5000";

  const router = useRouter();
  const [nic, setNIC] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      const tempToken = await AsyncStorage.getItem('refreshToken');
      if (!tempToken) {
        return;
      }

      const response = await fetch(`${backend_url}/auth/refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tempToken }),
      });
      const data = await response.json();
      if (data.accessToken) {
        router.replace('/(tabs)');
      }
      else {
        await AsyncStorage.removeItem('refreshToken');
      }
    }
    catch (error) {
      Alert.alert(`Error : ${error}`);
    }
    finally {

    }
  }

  const handleLogin = async () => {
    if (!nic || !password) {
      Alert.alert('Error', 'Please enter both nic and password');
      return;
    }

    setIsLoading(true);
    try {
      // Connect to the backend auth endpoint
      const response = await fetch(`${backend_url}/auth/loginCoach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nic, password }),
      });
      const data = await response.json();
      if (data.successful) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = () => {
    // Development option to bypass login
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#e0ecff', '#f5faff']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Sign in to your SportIQ account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="NIC"
              value={nic}
              onChangeText={setNIC}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.form}>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bypassButton}
              onPress={handleBypassLogin}
            >
              <Text style={styles.bypassButtonText}>Bypass Login (Dev)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e2f50',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#4285F4',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  footerText: {
    color: '#444',
    fontSize: 14,
  },
  signupText: {
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bypassButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  bypassButtonText: {
    color: '#888',
    fontSize: 14,
  },
});