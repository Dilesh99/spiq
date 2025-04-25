import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  // Obtain router via hook
  const router = useRouter();
  // Function to handle the bypass login for development
  const handleBypassLogin = () => {
    // Navigate to the main app (Home tab)
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Sport Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="fitness" size={40} color="white" />
        </View>

        {/* App Title */}
        <Text style={styles.title}>Sport Match AI</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Discover your perfect sport match based on your body type and preferences
        </Text>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Get Started Button */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>

        {/* Previous Results Button */}
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View Previous Results</Text>
        </TouchableOpacity>

        {/* Development Bypass Button */}
        <TouchableOpacity style={styles.bypassButton} onPress={handleBypassLogin}>
          <Text style={styles.bypassButtonText}>Bypass Login (Dev)</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#4285F4" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#777" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={24} color="#777" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 16,
  },
  bypassButton: {
    padding: 10,
    marginTop: 10,
  },
  bypassButtonText: {
    color: '#888',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },
}); 