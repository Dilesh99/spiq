import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Backend URL
const BACKEND_URL = 'http://localhost:5000';

// Import global variables from insights page
// Access these through the global scope
declare global {
  var GLOBAL_RECOMMENDATIONS: any;
  var GLOBAL_ATHLETE_ID: string;
  var GLOBAL_ATHLETE_NAME: string;
  var SELECTED_SPORT: string;
}

// Sport recommendation interface
interface SportRecommendation {
  name: string;
  score: number;
  reason: string;
  icon: string;
}

export default function AthleteRecommendationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  
  // Parse the athleteId
  const athleteId = id as string;
  
  // State for recommendations and athlete info
  const [recommendations, setRecommendations] = useState<SportRecommendation[]>([]);
  const [athleteName, setAthleteName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (!athleteId) {
      setError('No athlete ID provided');
      setIsLoading(false);
      return;
    }
    
    // Try to get recommendations from global variables
    if (global.GLOBAL_RECOMMENDATIONS && global.GLOBAL_ATHLETE_ID === athleteId) {
      setRecommendations(global.GLOBAL_RECOMMENDATIONS);
      
      if (global.GLOBAL_ATHLETE_NAME) {
        setAthleteName(global.GLOBAL_ATHLETE_NAME);
      } else {
        // Fetch athlete name if not in global vars
        fetchAthleteName(athleteId);
      }
    } else {
      // If no recommendations in global vars, fetch athlete name and show empty state
      fetchAthleteName(athleteId);
    }
    
    setIsLoading(false);
  }, [athleteId]);
  
  const fetchAthleteName = async (athleteId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/athlete-crud/${athleteId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          setAthleteName(data.name);
        }
      }
    } catch (error) {
      console.error('Error fetching athlete name:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745'; // Green - excellent match
    if (score >= 60) return '#17a2b8'; // Blue - good match
    if (score >= 40) return '#ffc107'; // Yellow - moderate match
    return '#dc3545'; // Red - poor match
  };

  // Generate detailed insight for why a sport is recommended
  const generateDetailedInsight = (sport: SportRecommendation, rank: number) => {
    // Base insight on sport type
    const insights = {
      'Sprint Running': 'Your combination of fast-twitch muscle fibers and power output gives you excellent acceleration capability. Your body is built for explosive movements, which is essential for sprint events.',
      'Swimming': 'Your cardiovascular endurance and upper body strength are well-balanced, which is ideal for swimming. Your flexibility also gives you an advantage in executing efficient strokes.',
      'Basketball': 'Your jumping power and agility make you well-suited for basketball. Your height-to-strength ratio and neuromuscular coordination help with both offensive and defensive play.',
      'Weightlifting': 'You have exceptional strength-to-weight ratio and core power. Your body structure allows for generating significant force, which is crucial in weightlifting competitions.',
      'Long-Distance Running': 'Your VO2 max and fatigue resistance are standout qualities. Your body efficiently uses oxygen and manages lactic acid buildup, essential for endurance events.',
      'Soccer/Football': 'Your combination of endurance, speed, and agility creates a solid foundation for soccer. Your lower body power and coordination help with both sprinting and ball control.',
      'Gymnastics': 'Your exceptional flexibility and power-to-weight ratio are key advantages. Your body control and balance make you well-suited for gymnastics disciplines.',
      'Cycling': 'Your lower body power output and cardiovascular endurance are particularly strong. Your body efficiently generates sustained power, which is ideal for cycling.',
      'Tennis': 'Your hand-eye coordination and full-body power generation work well for tennis. Your agility and reaction time help you cover the court effectively.',
      'Martial Arts': 'Your balance of strength, flexibility, and coordination is ideal for martial arts. Your body type supports both striking and grappling techniques.'
    };
    
    // Get sport-specific insight
    const sportName = sport.name as keyof typeof insights;
    const baseInsight = insights[sportName] || 'Your physical attributes align well with this sport\'s requirements.';
    
    // Add rank-specific commentary
    let rankInsight = '';
    if (rank === 0) {
      rankInsight = ' This appears to be your top match based on current metrics.';
    } else if (rank === 1) {
      rankInsight = ' This is a strong secondary option that complements your physical attributes.';
    } else {
      rankInsight = ' While not your top match, you still have significant potential in this area.';
    }
    
    return baseInsight + rankInsight;
  };
  
  // Generate training tips based on the recommended sport
  const generateTrainingTips = (sport: SportRecommendation) => {
    const tips = {
      'Sprint Running': 'Focus on explosive power training, proper sprint technique, and start practice. Include plyometrics and weight training to improve power output.',
      'Swimming': 'Work on stroke efficiency, breathing techniques, and building shoulder strength. Regular technique drills will help maximize your natural advantages.',
      'Basketball': 'Develop your vertical jump, agility drills, and ball handling skills. Combine court practice with plyometric training for optimal results.',
      'Weightlifting': 'Prioritize proper form, progressive overload, and periodized training. Include mobility work to maintain flexibility while building strength.',
      'Long-Distance Running': 'Build your weekly mileage gradually, include tempo runs, and focus on recovery nutrition. Strength train to prevent injuries.',
      'Soccer/Football': 'Practice ball control drills, short sprints, and game situation awareness. Combine cardio endurance work with agility training.',
      'Gymnastics': 'Focus on core strength, flexibility training, and skill progression. Regular balance and body control exercises are essential.',
      'Cycling': 'Develop a structured training plan with interval work, hill climbs, and recovery rides. Core strength is also important for stability.',
      'Tennis': 'Practice footwork drills, stroke consistency, and court movement. Include agility and reaction time training in your routine.',
      'Martial Arts': 'Balance strength training with flexibility work, and focus on technique mastery. Include regular sparring to develop practical skills.'
    };
    
    const sportName = sport.name as keyof typeof tips;
    return tips[sportName] || 'Focus on balanced training that develops the key physical attributes needed for this sport.';
  };
  
  const startTrackingSport = (sport: SportRecommendation) => {
    // Navigate to a sport tracking page or show options for tracking
    Alert.alert(
      "Track Performance",
      `Would you like to start tracking your performance in ${sport.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Start Tracking",
          onPress: () => {
            // Store selected sport in a global var
            global.SELECTED_SPORT = sport.name;
            
            // Navigate to performance measurements page
            router.push(`/athlete/performance-measurements/${athleteId}`);
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sport Recommendations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
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
          <Text style={styles.headerTitle}>Sport Recommendations</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Sport Recommendations" }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sport Recommendations</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.athleteNameText}>{athleteName}</Text>
        
        <View style={styles.insightSummaryCard}>
          <Ionicons name="bulb" size={24} color="#ffc107" style={styles.insightIcon} />
          <Text style={styles.insightSummaryText}>
            Based on your physical attributes and performance metrics, we've identified these sports as your best matches.
            Each card shows a recommended sport with personalized insights and training tips.
          </Text>
        </View>
        
        {recommendations.length > 0 ? (
          recommendations.map((sport, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.sportIconContainer}>
                  <Ionicons name={sport.icon as any} size={32} color="#007bff" />
                </View>
                <View style={styles.sportInfoContainer}>
                  <Text style={styles.sportName}>{sport.name}</Text>
                  <View style={styles.matchScoreContainer}>
                    <Text style={styles.matchScoreLabel}>Match Score:</Text>
                    <View style={styles.matchScoreBar}>
                      <View 
                        style={[
                          styles.matchScoreFill, 
                          { width: `${sport.score}%`, backgroundColor: getScoreColor(sport.score) }
                        ]} 
                      />
                    </View>
                    <Text style={styles.matchScoreValue}>{sport.score}%</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.reasonText}>{sport.reason}</Text>
              
              <View style={styles.detailedInsightContainer}>
                <Text style={styles.detailedInsightTitle}>Why This Sport Suits You:</Text>
                <Text style={styles.detailedInsightText}>
                  {generateDetailedInsight(sport, index)}
                </Text>
                <Text style={styles.trainingTipsTitle}>Training Tips:</Text>
                <Text style={styles.trainingTipsText}>
                  {generateTrainingTips(sport)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.trackButton}
                onPress={() => startTrackingSport(sport)}
              >
                <Ionicons name="analytics" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.trackButtonText}>Track Performance</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noRecommendationsContainer}>
            <Ionicons name="information-circle" size={48} color="#666" />
            <Text style={styles.noRecommendationsText}>
              No sport recommendations available. Please go back and generate recommendations first.
            </Text>
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.generateButtonText}>Generate Recommendations</Text>
            </TouchableOpacity>
          </View>
        )}
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
  athleteNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  generateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  insightSummaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  insightIcon: {
    marginBottom: 10,
  },
  insightSummaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sportIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#eaf6ff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sportInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  matchScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  matchScoreBar: {
    width: 80,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 5,
  },
  matchScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  matchScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 5,
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noRecommendationsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  detailedInsightContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  detailedInsightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailedInsightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trainingTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  trainingTipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 