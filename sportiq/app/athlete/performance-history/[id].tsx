import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PerformanceService from '../../services/PerformanceService';

// Conditionally import the chart component
let LineChart: any;
try {
  // @ts-ignore
  LineChart = require('react-native-chart-kit').LineChart;
} catch (error) {
  console.error('Failed to import LineChart:', error);
}

// Use IP address instead of localhost for mobile compatibility
const BACKEND_URL = 'http://18.142.49.203:5000';

// Performance History Data Interface
interface PerformanceHistory {
  athlete_id: string;
  measurements: {
    date: string;
    [key: string]: any;
  }[];
}

export default function AthletePerformanceHistoryScreen() {
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
  
  console.log('Performance History - Athlete ID:', id, 'Parsed ID:', athleteId);

  // Get the list of performance measurements
  const performanceMeasurements = PerformanceService.getPerformanceMeasurementsList();

  const [athleteName, setAthleteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

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

      // Get performance history data
      PerformanceService.getPerformanceHistory(athleteId)
        .then(data => {
          console.log('Performance history data:', data);
          setPerformanceHistory(data);
          setSelectedMetric(performanceMeasurements[0].key);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching performance history:', err);
          setError('Failed to load performance history');
          setIsLoading(false);
        });
    } else {
      setError('No athlete ID provided');
      setIsLoading(false);
    }
  }, [athleteId]);

  const handleMetricSelect = (metricKey: string) => {
    setSelectedMetric(metricKey);
  };

  const renderChart = () => {
    if (!performanceHistory || !selectedMetric || !LineChart) {
      // If LineChart is not available, show a message
      if (!LineChart) {
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.errorText}>Chart visualization not available</Text>
          </View>
        );
      }
      return null;
    }
    
    const selectedMeasurement = performanceMeasurements.find(m => m.key === selectedMetric);
    if (!selectedMeasurement) return null;
    
    // Extract dates and values for the selected metric
    const dates = performanceHistory.measurements.map(m => {
      const date = new Date(m.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const values = performanceHistory.measurements.map(m => m[selectedMetric] || 0);
    
    // For time measurements (where lower is better), we might want to invert the graph
    const isTimeMetric = selectedMetric.includes('time');
    
    // Create a component to render the chart
    const ChartComponent = () => (
      <LineChart
        data={{
          labels: dates,
          datasets: [
            {
              data: values,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#007bff',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {selectedMeasurement.name} ({selectedMeasurement.unit})
        </Text>
        
        {/* Render the chart component */}
        <ChartComponent />
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            First: {performanceHistory.measurements[0][selectedMetric]} {selectedMeasurement.unit}
          </Text>
          <Text style={styles.progressText}>
            Latest: {performanceHistory.measurements[performanceHistory.measurements.length - 1][selectedMetric]} {selectedMeasurement.unit}
          </Text>
          <Text style={styles.improvementText}>
            {isTimeMetric ? 
              (performanceHistory.measurements[0][selectedMetric] - performanceHistory.measurements[performanceHistory.measurements.length - 1][selectedMetric]).toFixed(2) :
              (performanceHistory.measurements[performanceHistory.measurements.length - 1][selectedMetric] - performanceHistory.measurements[0][selectedMetric]).toFixed(2)
            } {selectedMeasurement.unit} improvement
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance History</Text>
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
          <Text style={styles.headerTitle}>Performance History</Text>
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
        <Text style={styles.headerTitle}>Performance History</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.athleteNameText}>{athleteName}</Text>
        
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Select a performance metric below to view progress over time.
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.metricsScroll}
          contentContainerStyle={styles.metricsScrollContent}
        >
          {performanceMeasurements.map((measurement) => (
            <TouchableOpacity
              key={measurement.key}
              style={[
                styles.metricButton,
                selectedMetric === measurement.key && styles.metricButtonSelected
              ]}
              onPress={() => handleMetricSelect(measurement.key)}
            >
              <Ionicons 
                name={measurement.icon as any} 
                size={18} 
                color={selectedMetric === measurement.key ? 'white' : '#007bff'} 
              />
              <Text 
                style={[
                  styles.metricButtonText,
                  selectedMetric === measurement.key && styles.metricButtonTextSelected
                ]}
              >
                {measurement.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {renderChart()}
        
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Measurement History</Text>
          {performanceHistory?.measurements.map((measurement, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(measurement.date).toLocaleDateString()}
              </Text>
              <View style={styles.historyValueContainer}>
                {performanceMeasurements.map(metric => (
                  measurement[metric.key] ? (
                    <View key={metric.key} style={styles.historyMetric}>
                      <Text style={styles.historyMetricName}>{metric.name}:</Text>
                      <Text style={styles.historyMetricValue}>
                        {measurement[metric.key]} {metric.unit}
                      </Text>
                    </View>
                  ) : null
                ))}
              </View>
            </View>
          ))}
        </View>
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
  metricsScroll: {
    marginBottom: 20,
  },
  metricsScrollContent: {
    paddingHorizontal: 4,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  metricButtonSelected: {
    backgroundColor: '#007bff',
  },
  metricButtonText: {
    fontSize: 14,
    color: '#007bff',
    marginLeft: 6,
  },
  metricButtonTextSelected: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  improvementText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  historyContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historyValueContainer: {
    paddingLeft: 8,
  },
  historyMetric: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  historyMetricName: {
    fontSize: 14,
    color: '#555',
    width: 130,
  },
  historyMetricValue: {
    fontSize: 14,
    fontWeight: '500',
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