import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  ToastAndroid,
  Platform,
  RefreshControl,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StatsService from '../../services/StatsService';

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://localhost:5000';

// Stat data interface
interface StatData {
  id: string;
  value: any;
  unit?: string;
  status: 'available' | 'unavailable' | 'generating';
}

// Sport recommendation interface
interface SportRecommendation {
  name: string;
  score: number;
  reason: string;
  icon: string;
}

// Add these global variables at the top of the file after imports
// These variables will hold the recommendation data temporarily
declare global {
  var GLOBAL_RECOMMENDATIONS: any;
  var GLOBAL_ATHLETE_ID: string;
  var GLOBAL_ATHLETE_NAME: string;
  var SELECTED_SPORT: string;
}

export default function AthleteInsightsScreen() {
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
  const [stats, setStats] = useState<StatData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<SportRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // DB field to stat mapping
  const dbFieldToStatMapping = {
    'bmi': 'bmi',
    'power_to_weight': 'power_to_weight_ratio',
    'vo2_max': 'vo2max',
    'speed_index': 'speed_index',
    'power_output': 'power_index',
    'sprint_fatigue_index': 'fatigue_index',
    'jumping_power': 'jumping_index',
    'grip_index': 'grip_index',
    'neuromuscular_efficiency': 'neuromuscular_indexes',
    'flexibility_index': 'flexibility_index',
  };

  // Get the stat definitions from the service
  const statDefinitions = StatsService.getStatDefinitions();

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

      // Fetch athlete stats
      fetchAthleteStats();
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [athleteId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAthleteStats().finally(() => {
      setRefreshing(false);
    });
  }, [athleteId]);

  const fetchAthleteStats = async () => {
    setIsLoading(true);
    try {
      // First try to get stats directly from the database table
      const response = await fetch(`${BACKEND_URL}/athlete-stat-crud/${athleteId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Athlete stats data from DB:', data);
        
        if (data) {
          // Map DB fields to stat IDs
          const processedStats = statDefinitions.map(def => {
            // Find the DB field that corresponds to this stat
            const dbField = Object.entries(dbFieldToStatMapping).find(
              ([_, statId]) => statId === def.id
            )?.[0];
            
            // Check if the DB field exists and has a value
            const hasValue = dbField && data[dbField] !== null && data[dbField] !== undefined;
            
            return {
              id: def.id,
              value: hasValue ? data[dbField] : null,
              unit: StatsService.getUnitForStat(def.id),
              status: hasValue ? 'available' as const : 'unavailable' as const
            };
          });
          
          setStats(processedStats);
        } else {
          // No stats found for this athlete in the DB
          initializeEmptyStats();
        }
      } else if (response.status === 404) {
        // No stats entry in the DB, fallback to StatsService
        const serviceData = await StatsService.getAthleteStats(athleteId);
        
        if (serviceData) {
          console.log('Athlete stats data from service:', serviceData);
          
          // Process the data from StatsService
          const processedStats = statDefinitions.map(def => {
            return {
              id: def.id,
              value: serviceData && typeof serviceData === 'object' && def.id in serviceData ? serviceData[def.id as keyof typeof serviceData] : null,
              unit: StatsService.getUnitForStat(def.id),
              status: serviceData && typeof serviceData === 'object' && def.id in serviceData ? 'available' as const : 'unavailable' as const
            };
          });
          
          setStats(processedStats);
        } else {
          // No stats found in the service either
          initializeEmptyStats();
        }
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      setError('Failed to load athlete stats');
      initializeEmptyStats();
    } finally {
      setIsLoading(false);
    }
  };
  
  const initializeEmptyStats = () => {
    // Initialize all stats as unavailable
    const initialStats = statDefinitions.map(def => {
      return {
        id: def.id,
        value: null,
        unit: StatsService.getUnitForStat(def.id),
        status: 'unavailable' as const
      };
    });
    
    setStats(initialStats);
  };

  const getStatDefinition = (statId: string) => {
    return StatsService.getStatDefinitionById(statId);
  };

  const handleGenerateStat = async (statId: string) => {
    // Update the specific stat to show generating status
    setStats(prevStats => 
      prevStats.map(stat => 
        stat.id === statId ? { ...stat, status: 'generating' as const } : stat
      )
    );

    try {
      const result = await StatsService.generateStat(athleteId, statId);
      console.log(`Generated stat result for ${statId}:`, result);
      
      // Extract the value from the response
      let statValue = null;
      if (result && typeof result === 'object') {
        // First try to get directly from the statId property
        if (statId in result) {
          statValue = result[statId as keyof typeof result];
        } 
        // Try to find a value in common response formats
        else if ('data' in result && result.data && typeof result.data === 'object') {
          if (statId in result.data) {
            statValue = result.data[statId as keyof typeof result.data];
          } else if ('value' in result.data) {
            statValue = result.data.value;
          } else if ('result' in result.data) {
            statValue = result.data.result;
          }
        }
        // Check for direct value or result properties
        else if ('value' in result) {
          statValue = result.value;
        } else if ('result' in result) {
          statValue = result.result;
        }
        
        // If we still don't have a value, try to get it from other common structures
        if (statValue === null) {
          // Some endpoints might return the data directly
          if (typeof result === 'number' || typeof result === 'string') {
            statValue = result;
          } 
          // For somatotype which might return an object with the classification
          else if (statId === 'somatotype' && 'classification' in result) {
            statValue = result.classification;
          }
          
          // Check for DB field mappings in the response
          const dbField = Object.entries(dbFieldToStatMapping).find(
            ([_, id]) => id === statId
          )?.[0];
          
          if (dbField && typeof result === 'object' && dbField in result) {
            statValue = (result as Record<string, any>)[dbField];
          }
        }
      }
      
      console.log(`Extracted value for ${statId}:`, statValue);
      
      // Update the specific stat with the new value
      setStats(prevStats => 
        prevStats.map(stat => 
          stat.id === statId ? 
          { 
            ...stat, 
            value: statValue,
            status: 'available' as const 
          } : stat
        )
      );

      // After successful generation, refresh the stats from the database
      setTimeout(() => {
        fetchAthleteStats();
      }, 1000); // Small delay to ensure DB has updated

      Alert.alert('Success', `${getStatDefinition(statId).name} generated successfully`);
    } catch (error) {
      console.error('Error generating stat:', error);
      Alert.alert('Error', `Failed to generate ${getStatDefinition(statId).name}`);
      
      // Reset the status
      setStats(prevStats => 
        prevStats.map(stat => 
          stat.id === statId ? { ...stat, status: 'unavailable' as const } : stat
        )
      );
    }
  };

  const handleGenerateAllStats = async () => {
    setIsGenerating(true);
    
    try {
      const unavailableStats = stats.filter(stat => stat.status === 'unavailable');
      
      for (const stat of unavailableStats) {
        // Update the specific stat to show generating status
        setStats(prevStats => 
          prevStats.map(s => 
            s.id === stat.id ? { ...s, status: 'generating' as const } : s
          )
        );
        
        try {
          const result = await StatsService.generateStat(athleteId, stat.id);
          console.log(`Generated stat result for ${stat.id}:`, result);
          
          // Extract the value from the response
          let statValue = null;
          if (result && typeof result === 'object') {
            // First try to get directly from the statId property
            if (stat.id in result) {
              statValue = result[stat.id as keyof typeof result];
            } 
            // Try to find a value in common response formats
            else if ('data' in result && result.data && typeof result.data === 'object') {
              if (stat.id in result.data) {
                statValue = result.data[stat.id as keyof typeof result.data];
              } else if ('value' in result.data) {
                statValue = result.data.value;
              } else if ('result' in result.data) {
                statValue = result.data.result;
              }
            }
            // Check for direct value or result properties
            else if ('value' in result) {
              statValue = result.value;
            } else if ('result' in result) {
              statValue = result.result;
            }
            
            // If we still don't have a value, try to get it from other common structures
            if (statValue === null) {
              // Some endpoints might return the data directly
              if (typeof result === 'number' || typeof result === 'string') {
                statValue = result;
              } 
              // For somatotype which might return an object with the classification
              else if (stat.id === 'somatotype' && 'classification' in result) {
                statValue = result.classification;
              }
            }
          }
          
          console.log(`Extracted value for ${stat.id}:`, statValue);
          
          // Update the specific stat with the new value
          setStats(prevStats => 
            prevStats.map(s => 
              s.id === stat.id ? 
              { 
                ...s, 
                value: statValue,
                status: 'available' as const 
              } : s
            )
          );
        } catch (error) {
          console.error(`Error generating ${stat.id}:`, error);
          // Reset this stat's status
          setStats(prevStats => 
            prevStats.map(s => 
              s.id === stat.id ? { ...s, status: 'unavailable' as const } : s
            )
          );
          // Continue with next stat even if one fails
        }
      }
      
      Alert.alert('Success', 'Generated all available insights');
    } catch (error) {
      console.error('Error in generate all process:', error);
      Alert.alert('Error', 'Failed to generate all insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatStatValue = (stat: StatData) => {
    const { id, value, unit } = stat;
    
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return 'Not available';
    }

    // Handle different types of values based on the stat type
    if (typeof value === 'object') {
      // Extract the relevant data field based on stat type
      switch (id) {
        case 'jumping_index':
          if ('jumping_power' in value) {
            return `${value.jumping_power}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'bmi':
          if ('bmi' in value) {
            return `${value.bmi}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'flexibility_index':
          if ('flexibility' in value) {
            return `${value.flexibility}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'grip_index':
          if ('grip_strength' in value) {
            return `${value.grip_strength}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'fatigue_index':
          if ('fatigue' in value) {
            return `${value.fatigue}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'power_index':
          if ('power' in value) {
            return `${value.power}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'power_to_weight_ratio':
          if ('power_to_weight' in value) {
            return `${value.power_to_weight}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'speed_index':
          if ('speed' in value) {
            return `${value.speed}${unit ? ` ${unit}` : ''}`;
          }
          break;
          
        case 'vo2max':
          if ('vo2max' in value) {
            return `${value.vo2max}${unit ? ` ${unit}` : ''}`;
          }
          break;
        
        case 'neuromuscular_indexes':
          // Extract relevant fields for display
          const parts = [];
          if ('neuromuscular_efficiency' in value) {
            return `${value.neuromuscular_efficiency}${unit || ''}`;
          }
          if ('nme_leg' in value) parts.push(`Leg: ${value.nme_leg}`);
          if ('nme_arm' in value) parts.push(`Arm: ${value.nme_arm}`);
          if ('nme_sprint' in value) parts.push(`Sprint: ${value.nme_sprint}`);
          
          return parts.length > 0 ? parts.join(', ') : JSON.stringify(value);
          
        case 'somatotype':
          if ('classification' in value) {
            return value.classification;
          } else if ('somatotype' in value) {
            return value.somatotype;
          }
          break;
      }
      
      // Try to find any numeric or string value in the object that might be relevant
      // Look for common field names that might contain the actual value
      const commonValueFields = [
        id,                   // Same as the stat id
        id.replace('_index', ''), // For fields without _index
        'value',              // Generic value field
        'data',               // Generic data field
        'result'              // Generic result field
      ];
      
      for (const field of commonValueFields) {
        if (field in value && 
            (typeof value[field] === 'number' || 
             typeof value[field] === 'string')) {
          return `${value[field]}${unit ? ` ${unit}` : ''}`;
        }
      }
      
      // If we can't find a specific field, try to extract the first numeric value
      const numericKeys = Object.keys(value).filter(
        key => typeof value[key] === 'number' && 
               !['athlete_id', 'id'].includes(key) &&
               !key.includes('timestamp') &&
               !key.includes('date')
      );
      
      if (numericKeys.length > 0) {
        return `${value[numericKeys[0]]}${unit ? ` ${unit}` : ''}`;
      }
      
      // Last resort: convert to string but remove message and athlete_id properties
      const { message, athlete_id, ...relevantData } = value;
      if (Object.keys(relevantData).length > 0) {
        return JSON.stringify(relevantData);
      }
      
      return JSON.stringify(value);
    }
    
    // Return simple values with their units
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  // Helper function to extract stat values from the backend data
  const extractStatValue = (statId: string, stats: any): number => {
    if (!stats || typeof stats !== 'object') return 0;
    
    // Handle neuromuscular_indexes which might be an object
    if (statId === 'neuromuscular_indexes' && 'neuromuscular_efficiency' in stats) {
      return Number(stats.neuromuscular_efficiency) || 0;
    }
    
    // Try to get the value from the stats object
    if (statId in stats) {
      const value = stats[statId];
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return Number(value) || 0;
      if (typeof value === 'object') {
        // Extract from common field names
        const fields = [
          statId.replace('_index', ''),
          'value',
          'data',
          'result'
        ];
        
        for (const field of fields) {
          if (field in value && typeof value[field] === 'number') {
            return value[field];
          }
        }
        
        // Try to find the first numeric value
        const numericValues = Object.values(value).filter(
          v => typeof v === 'number' && !isNaN(v)
        );
        if (numericValues.length > 0) return numericValues[0] as number;
      }
    }
    
    // Handle specific property names
    const specificFields: {[key: string]: string[]} = {
      'bmi': ['bmi'],
      'vo2max': ['vo2max'],
      'power_to_weight_ratio': ['power_to_weight', 'ptw'],
      'speed_index': ['speed'],
      'fatigue_index': ['fatigue'],
      'grip_index': ['grip_strength', 'grip'],
      'flexibility_index': ['flexibility'],
      'jumping_index': ['jumping_power', 'jump'],
      'power_index': ['power']
    };
    
    if (statId in specificFields) {
      for (const field of specificFields[statId]) {
        if (field in stats && typeof stats[field] === 'number') {
          return stats[field];
        }
        if (stats[statId] && typeof stats[statId] === 'object' && field in stats[statId]) {
          return Number(stats[statId][field]) || 0;
        }
      }
    }
    
    return 0;
  };

  const getRecommendations = async () => {
    console.log("getRecommendations called");
    setIsGeneratingRecommendations(true);
    
    try {
      // Check if we have the required stats already generated
      const requiredStats = [
        'bmi',
        'vo2max',
        'power_to_weight_ratio',
        'speed_index',
        'fatigue_index',
        'grip_index',
        'flexibility_index',
        'jumping_index',
        'neuromuscular_indexes',
        'power_index'
      ];
      
      // Find which required stats are missing
      const missingStats = requiredStats.filter(stat => {
        const statObj = stats.find(s => s.id === stat);
        return !statObj || statObj.status !== 'available';
      });
      
      console.log("Missing stats:", missingStats);
      
      // If there are missing stats, show a toast message
      if (missingStats.length > 0) {
        // Get the proper names of the missing stats
        const missingStatNames = missingStats.map(statId => {
          const definition = getStatDefinition(statId);
          return definition.name;
        });
        
        // Construct the message
        let message = 'Please generate these insights first: ';
        if (missingStatNames.length > 3) {
          // If there are more than 3 missing stats, just show the count
          message = `${missingStatNames.length} insights need to be generated first`;
        } else {
          // Otherwise, list them
          message += missingStatNames.join(', ');
        }
        
        // Show a toast or alert depending on the platform
        if (Platform.OS === 'android') {
          ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
          Alert.alert('Missing Data', message);
        }
        
        setIsGeneratingRecommendations(false);
        return;
      }

      // Fetch complete athlete stats from the backend
      console.log('Fetching athlete stats for recommendations...');
      const response = await fetch(`${BACKEND_URL}/athlete-stat-crud/${athleteId}`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const athleteStats = await response.json();
      console.log('Stats for recommendations:', athleteStats);
      
      // Check for empty or null values in athlete stats from backend
      const emptyBackendStats = [];
      
      for (const statId of requiredStats) {
        const statValue = extractStatValue(statId, athleteStats);
        if (statValue === 0 || statValue === null || statValue === undefined) {
          emptyBackendStats.push(statId);
        }
      }
      
      if (emptyBackendStats.length > 0) {
        // Get the proper names of the empty stats
        const emptyStatNames = emptyBackendStats.map(statId => {
          const definition = getStatDefinition(statId);
          return definition.name;
        });
        
        // Construct the message
        let message = 'Cannot generate recommendations. Missing data for: ';
        if (emptyStatNames.length > 3) {
          // If there are more than 3 empty stats, just show the count
          message = `Cannot generate recommendations. ${emptyStatNames.length} stats have no values`;
        } else {
          // Otherwise, list them
          message += emptyStatNames.join(', ');
        }
        
        // Show a toast or alert depending on the platform
        if (Platform.OS === 'android') {
          ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
          Alert.alert('Incomplete Data', message);
        }
        
        setIsGeneratingRecommendations(false);
        return;
      }
      
      console.log('Generating sport recommendations based on stats...');
      // Generate sport recommendations based on the athlete's stats
      const recommendedSports = generateSportRecommendations(athleteStats);
      
      console.log('Recommendations generated:', recommendedSports);
      
      // Store recommendations in global variables that can be accessed from the recommendations page
      global.GLOBAL_RECOMMENDATIONS = recommendedSports;
      global.GLOBAL_ATHLETE_ID = athleteId;
      global.GLOBAL_ATHLETE_NAME = athleteName;
      
      // Show success message with manual navigation option
      Alert.alert(
        "Recommendations Generated",
        "Your sport recommendations are ready! Click 'View Recommendations' to see them.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "View Recommendations",
            onPress: () => {
              console.log("Manual navigation triggered");
              router.push(`/athlete/recommendations/${athleteId}` as any);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      Alert.alert('Error', 'Failed to generate sport recommendations');
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };
  
  // Algorithm to generate sport recommendations based on athlete stats
  const generateSportRecommendations = (athleteStats: any): SportRecommendation[] => {
    // Define sports and their ideal stat profiles
    const sportProfiles = [
      {
        name: 'Sprint Running',
        idealStats: {
          speed_index: { weight: 5, min: 8, optimal: 10 },
          power_index: { weight: 4, min: 6, optimal: 9 },
          power_to_weight_ratio: { weight: 4, min: 4, optimal: 6 },
          neuromuscular_indexes: { weight: 3, min: 70, optimal: 90 },
          fatigue_index: { weight: 3, min: 60, optimal: 85 },
          flexibility_index: { weight: 2, min: 30, optimal: 60 }
        },
        icon: 'run'
      },
      {
        name: 'Swimming',
        idealStats: {
          vo2max: { weight: 5, min: 50, optimal: 65 },
          power_index: { weight: 3, min: 5, optimal: 8 },
          fatigue_index: { weight: 4, min: 70, optimal: 90 },
          flexibility_index: { weight: 5, min: 60, optimal: 90 },
          neuromuscular_indexes: { weight: 3, min: 60, optimal: 80 }
        },
        icon: 'water'
      },
      {
        name: 'Basketball',
        idealStats: {
          jumping_index: { weight: 5, min: 60, optimal: 80 },
          speed_index: { weight: 4, min: 7, optimal: 9 },
          power_index: { weight: 3, min: 6, optimal: 8 },
          neuromuscular_indexes: { weight: 4, min: 70, optimal: 85 },
          fatigue_index: { weight: 3, min: 65, optimal: 80 }
        },
        icon: 'basketball'
      },
      {
        name: 'Weightlifting',
        idealStats: {
          power_index: { weight: 5, min: 8, optimal: 10 },
          grip_index: { weight: 4, min: 50, optimal: 70 },
          power_to_weight_ratio: { weight: 3, min: 3.5, optimal: 5 },
          neuromuscular_indexes: { weight: 4, min: 75, optimal: 95 },
          bmi: { weight: 2, min: 25, optimal: 30 }
        },
        icon: 'barbell'
      },
      {
        name: 'Long-Distance Running',
        idealStats: {
          vo2max: { weight: 5, min: 55, optimal: 70 },
          fatigue_index: { weight: 5, min: 75, optimal: 95 },
          bmi: { weight: 3, min: 18, optimal: 22 },
          power_to_weight_ratio: { weight: 4, min: 3, optimal: 4.5 },
          flexibility_index: { weight: 2, min: 40, optimal: 70 }
        },
        icon: 'walk'
      },
      {
        name: 'Soccer/Football',
        idealStats: {
          speed_index: { weight: 4, min: 7, optimal: 9 },
          fatigue_index: { weight: 4, min: 70, optimal: 90 },
          vo2max: { weight: 4, min: 50, optimal: 65 },
          power_index: { weight: 3, min: 6, optimal: 8 },
          flexibility_index: { weight: 3, min: 50, optimal: 75 },
          neuromuscular_indexes: { weight: 4, min: 65, optimal: 85 }
        },
        icon: 'football'
      },
      {
        name: 'Gymnastics',
        idealStats: {
          flexibility_index: { weight: 5, min: 70, optimal: 95 },
          power_to_weight_ratio: { weight: 5, min: 4, optimal: 6 },
          neuromuscular_indexes: { weight: 4, min: 75, optimal: 95 },
          grip_index: { weight: 3, min: 40, optimal: 60 },
          bmi: { weight: 3, min: 18, optimal: 23 }
        },
        icon: 'body'
      },
      {
        name: 'Cycling',
        idealStats: {
          vo2max: { weight: 5, min: 55, optimal: 75 },
          power_to_weight_ratio: { weight: 5, min: 4, optimal: 7 },
          fatigue_index: { weight: 4, min: 70, optimal: 90 },
          power_index: { weight: 4, min: 7, optimal: 9 },
          neuromuscular_indexes: { weight: 3, min: 65, optimal: 85 }
        },
        icon: 'bicycle'
      },
      {
        name: 'Tennis',
        idealStats: {
          speed_index: { weight: 4, min: 6, optimal: 8 },
          power_index: { weight: 3, min: 5, optimal: 8 },
          neuromuscular_indexes: { weight: 4, min: 65, optimal: 85 },
          fatigue_index: { weight: 3, min: 65, optimal: 85 },
          flexibility_index: { weight: 4, min: 60, optimal: 80 },
          grip_index: { weight: 4, min: 45, optimal: 65 }
        },
        icon: 'tennisball'
      },
      {
        name: 'Martial Arts',
        idealStats: {
          flexibility_index: { weight: 5, min: 65, optimal: 90 },
          neuromuscular_indexes: { weight: 5, min: 70, optimal: 90 },
          power_index: { weight: 4, min: 6, optimal: 8 },
          speed_index: { weight: 4, min: 6, optimal: 8 },
          fatigue_index: { weight: 3, min: 65, optimal: 85 },
          grip_index: { weight: 3, min: 40, optimal: 60 }
        },
        icon: 'fitness'
      }
    ];
    
    // Calculate scores for each sport
    const sportScores = sportProfiles.map(sport => {
      let totalScore = 0;
      let totalWeight = 0;
      let matchedStats = 0;
      let sportSpecificReasons = [];
      
      for (const [statId, criteria] of Object.entries(sport.idealStats)) {
        const athleteValue = extractStatValue(statId, athleteStats);
        
        if (athleteValue > 0) {
          matchedStats++;
          const { weight, min, optimal } = criteria;
          
          // Calculate how well the athlete's value matches the sport's ideal profile
          let matchScore = 0;
          if (athleteValue >= optimal) {
            matchScore = 1; // Perfect match
          } else if (athleteValue >= min) {
            matchScore = (athleteValue - min) / (optimal - min); // Partial match
          } else {
            matchScore = Math.max(0, athleteValue / min) * 0.5; // Below minimum but still has some value
          }
          
          // Add to total score with weighting
          totalScore += matchScore * weight;
          totalWeight += weight;
          
          // Add reason for this stat
          const statName = getStatDefinition(statId).name;
          if (matchScore > 0.7) {
            sportSpecificReasons.push(`Strong ${statName} (${Math.round(matchScore * 100)}% match)`);
          } else if (matchScore > 0.4) {
            sportSpecificReasons.push(`Good ${statName} (${Math.round(matchScore * 100)}% match)`);
          }
        }
      }
      
      // Calculate final weighted score (0-100)
      const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      
      // Create overall reason based on match quality
      let reason = '';
      if (matchedStats === 0) {
        reason = 'Insufficient data to make accurate recommendation';
      } else if (sportSpecificReasons.length === 0) {
        reason = 'Basic physical attributes match this sport';
      } else {
        // Take top 2 reasons
        reason = sportSpecificReasons.slice(0, 2).join('. ');
      }
      
      return {
        name: sport.name,
        score: Math.round(finalScore),
        reason,
        icon: sport.icon
      };
    });
    
    // Sort by score (highest first) and take top 3
    return sportScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Ionicons name="checkmark-circle" size={24} color="#28a745" />;
      case 'unavailable':
        return <Ionicons name="alert-circle" size={24} color="#dc3545" />;
      case 'generating':
        return <ActivityIndicator size="small" color="#007bff" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745'; // Green - excellent match
    if (score >= 60) return '#17a2b8'; // Blue - good match
    if (score >= 40) return '#ffc107'; // Yellow - moderate match
    return '#dc3545'; // Red - poor match
  };

  const renderRecommendationsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRecommendations}
        onRequestClose={() => {
          console.log("Modal closing via back button/gesture");
          setShowRecommendations(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          console.log("Clicked modal background");
          setShowRecommendations(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => {
              // Prevent clicks inside the modal from closing it
              e.stopPropagation();
            }}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sport Recommendations</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => {
                      console.log("Close button pressed");
                      setShowRecommendations(false);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.recommendationsContainer}>
                  {recommendations.length > 0 ? (
                    <>
                      <View style={styles.insightSummaryCard}>
                        <Ionicons name="bulb" size={24} color="#ffc107" style={styles.insightIcon} />
                        <Text style={styles.insightSummaryText}>
                          Based on your physical attributes and performance metrics, we've identified these sports as your best matches.
                          Your body type and specific strengths in {getTopMetrics()} make you particularly suited for these activities.
                        </Text>
                      </View>
                      
                      {recommendations.map((sport, index) => (
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
                        </View>
                      ))}
                    </>
                  ) : (
                    <View style={styles.noRecommendationsContainer}>
                      <Ionicons name="information-circle" size={48} color="#666" />
                      <Text style={styles.noRecommendationsText}>
                        Not enough data to generate recommendations. Please generate more athlete insights first.
                      </Text>
                    </View>
                  )}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    console.log("Bottom close button pressed");
                    setShowRecommendations(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Generate detailed insight for why a sport is recommended
  const generateDetailedInsight = (sport: SportRecommendation, rank: number) => {
    // Base insight on sport type and athlete's metrics
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
  
  // Get the athlete's top metrics for the summary
  const getTopMetrics = () => {
    // Find the available stats with values
    const availableStats = stats.filter(stat => 
      stat.status === 'available' && 
      stat.value !== null && 
      stat.value !== undefined
    );
    
    if (availableStats.length === 0) {
      return "various physical attributes";
    }
    
    // Get 2-3 stat names to mention
    const statNames = availableStats
      .slice(0, Math.min(3, availableStats.length))
      .map(stat => getStatDefinition(stat.id).name.toLowerCase());
    
    if (statNames.length === 1) {
      return statNames[0];
    } else if (statNames.length === 2) {
      return `${statNames[0]} and ${statNames[1]}`;
    } else {
      return `${statNames[0]}, ${statNames[1]}, and ${statNames[2]}`;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Athlete Insights</Text>
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
          <Text style={styles.headerTitle}>Athlete Insights</Text>
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

  const unavailableStatsCount = stats.filter(stat => stat.status === 'unavailable').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Athlete Insights</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
            tintColor={'#007bff'}
          />
        }
      >
        <Text style={styles.athleteNameText}>{athleteName}</Text>
        
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Text style={styles.instructionText}>
              View and generate calculated insights based on the athlete's measurements and performance data.
            </Text>
            <TouchableOpacity 
              style={styles.reloadButton} 
              onPress={onRefresh} 
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#007bff" />
              ) : (
                <Ionicons name="refresh" size={22} color="#007bff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          {unavailableStatsCount > 0 && (
            <TouchableOpacity 
              style={styles.generateAllButton}
              onPress={handleGenerateAllStats}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.generateAllButtonText}>
                    Generate All Missing Insights
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.recommendationsButton}
            onPress={getRecommendations}
            disabled={isGeneratingRecommendations}
          >
            {isGeneratingRecommendations ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="trophy" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.recommendationsButtonText}>
                  Get Sport Recommendations
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat) => {
            const definition = getStatDefinition(stat.id);
            return (
              <View key={stat.id} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.statTitleContainer}>
                    <Ionicons name={definition.icon as any} size={24} color="#007bff" />
                    <Text style={styles.statName}>{definition.name}</Text>
                  </View>
                  {renderStatusIcon(stat.status)}
                </View>
                
                <Text style={styles.statDescription}>
                  {definition.description}
                </Text>
                
                <View style={styles.statValueContainer}>
                  {stat.status === 'available' ? (
                    <View style={styles.statValueWrapper}>
                      <Text style={styles.statValue}>
                        {formatStatValue(stat)}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.generateButton}
                      onPress={() => handleGenerateStat(stat.id)}
                      disabled={stat.status === 'generating'}
                    >
                      {stat.status === 'generating' ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Ionicons name="analytics" size={18} color="white" style={styles.buttonIcon} />
                          <Text style={styles.generateButtonText}>Generate</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Render the recommendations modal */}
      {renderRecommendationsModal()}
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
  instructionCard: {
    backgroundColor: '#eaf6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  reloadButton: {
    padding: 5,
  },
  generateAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6f42c1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    flex: 1,
    marginRight: 10,
  },
  generateAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
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
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  statDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statValueContainer: {
    marginTop: 8,
  },
  statValueWrapper: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  generateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
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
  recommendationsContainer: {
    marginBottom: 20,
    maxHeight: 400,
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
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
  closeButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  recommendationsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginVertical: 10,
  },
  recommendationsButtonText: {
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
  detailedInsightContainer: {
    marginTop: 10,
  },
  detailedInsightTitle: {
    fontSize: 18,
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
    fontSize: 18,
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
}); 