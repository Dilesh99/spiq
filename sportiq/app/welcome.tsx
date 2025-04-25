import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>

        {/* App Title */}
        <Text style={styles.title}>SportiQ</Text>

        {/* Tagline */}
        <Text style={styles.description}>
          Discover the Sport Meant for You
        </Text>

        {/* Illustration */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/landing-icon.jpg')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* CTA Button */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bypassButton: {
    marginTop: 8,
  },
  bypassButtonText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});