// Performance measurement service
import ApiService from './ApiService';

/**
 * @typedef {Object} PerformanceMeasurement
 * @property {string} name - Name of the measurement
 * @property {string} key - Unique key for the measurement
 * @property {string} unit - Unit of measurement (e.g., seconds, cm)
 * @property {string} icon - Ionicons icon name
 * @property {string} description - Description of the measurement
 */

class PerformanceService {
  // Get all performance measurements for an athlete
  static async getPerformanceMeasurements(athleteId) {
    try {
      return await ApiService.get(`basic-performance-crud/${athleteId}`);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw error;
    }
  }

  // Save performance measurements for an athlete
  static async savePerformanceMeasurements(data, isUpdate = false) {
    try {
      if (isUpdate) {
        return await ApiService.put('basic-performance-crud', data);
      } else {
        return await ApiService.post('basic-performance-crud', data);
      }
    } catch (error) {
      console.error('Error saving performance data:', error);
      throw error;
    }
  }

  // Utility function to validate if a value is a valid number
  static isValidNumber(value) {
    // Check if value is not null, not undefined, can be parsed to a number, and is not NaN
    return value !== null && 
           value !== undefined && 
           !isNaN(parseFloat(value)) && 
           isFinite(value);
  }

  // Calculate average from trial values
  static calculateAverage(values) {
    // Filter out empty strings, non-numeric values and convert to numbers
    const validValues = values
      .filter(val => val && val.trim() !== '' && !isNaN(parseFloat(val)))
      .map(val => parseFloat(val));
    
    if (validValues.length === 0) return null;
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  }

  // Get performance history for an athlete
  static async getPerformanceHistory(athleteId) {
    try {
      // This would be a real API call in production
      // For now, we'll return sample data
      return {
        athlete_id: athleteId,
        measurements: [
          {
            date: '2023-01-15',
            time_30m: 4.8,
            time_100m: 13.1,
            standing_long_jump: 215,
            vertical_jump: 45,
            beep_test: 8.5,
          },
          {
            date: '2023-02-20',
            time_30m: 4.7,
            time_100m: 12.9,
            standing_long_jump: 220,
            vertical_jump: 47,
            beep_test: 9.1,
          },
          {
            date: '2023-03-25',
            time_30m: 4.5,
            time_100m: 12.7,
            standing_long_jump: 225,
            vertical_jump: 48,
            beep_test: 9.4,
          },
          {
            date: '2023-04-30',
            time_30m: 4.3,
            time_100m: 12.5,
            standing_long_jump: 228,
            vertical_jump: 51,
            beep_test: 9.8,
          },
        ]
      };
    } catch (error) {
      console.error('Error fetching performance history:', error);
      throw error;
    }
  }

  // Performance Measurements List
  static getPerformanceMeasurementsList() {
    return [
      { 
        name: 'Time for 30m', 
        key: 'time_30m', 
        unit: 'seconds',
        icon: 'stopwatch',
        description: 'The time taken to sprint 30 meters from a standing start'
      },
      { 
        name: 'Time for 100m', 
        key: 'time_100m', 
        unit: 'seconds',
        icon: 'timer',
        description: 'The time taken to sprint 100 meters from a standing start'
      },
      { 
        name: 'Standing Long Jump', 
        key: 'standing_long_jump', 
        unit: 'cm',
        icon: 'resize',
        description: 'Distance covered in a standing long jump'
      },
      { 
        name: 'Vertical Jump', 
        key: 'vertical_jump', 
        unit: 'cm',
        icon: 'trending-up',
        description: 'Height reached in a vertical jump from standing position'
      },
      { 
        name: 'Beep Test', 
        key: 'beep_test', 
        unit: 'level',
        icon: 'pulse',
        description: 'Multi-stage fitness test (MSFT) level achieved'
      },
      { 
        name: 'Sit and Reach', 
        key: 'sit_and_reach', 
        unit: 'cm',
        icon: 'body',
        description: 'Flexibility test measuring hamstring and lower back flexibility'
      },
      { 
        name: 'Reaction Time', 
        key: 'reaction_time', 
        unit: 'ms',
        icon: 'flash',
        description: 'Time taken to react to a visual or auditory stimulus'
      },
      { 
        name: 'Grip Strength', 
        key: 'grip_strength', 
        unit: 'kg',
        icon: 'hand-right',
        description: 'Maximum isometric strength of the hand and forearm muscles'
      },
    ];
  }
}

export default PerformanceService; 