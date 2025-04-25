// Athlete statistics service
import ApiService from './ApiService';

/**
 * @typedef {Object} StatDefinition
 * @property {string} id - Unique identifier for the stat
 * @property {string} name - Display name
 * @property {string} description - Description of what the stat measures
 * @property {string} icon - Icon name (from Ionicons)
 */

class StatsService {
  /**
   * Get all available statistics for an athlete
   * @param {string} athleteId - The athlete's ID
   * @returns {Promise<Object>} - The athlete's statistics
   */
  static async getAthleteStats(athleteId) {
    try {
      return await ApiService.get(`athlete-stat-crud/${athleteId}`);
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      throw error;
    }
  }

  /**
   * Generate a specific statistic for an athlete
   * @param {string} athleteId - The athlete's ID
   * @param {string} statType - The type of stat to generate
   * @returns {Promise<Object>} - The generated statistic
   */
  static async generateStat(athleteId, statType) {
    try {
      let endpoint;
      
      // Use specific endpoints for different stat types based on backend routes
      switch (statType) {
        case 'bmi':
          endpoint = `bmi/${athleteId}`;
          break;
        case 'somatotype':
          endpoint = `somato/${athleteId}`;
          break;
        case 'vo2max':
          endpoint = `vo2max/${athleteId}`;
          break;
        case 'power_to_weight_ratio':
          endpoint = `ptw/${athleteId}`;
          break;
        case 'speed_index':
          endpoint = `speed/${athleteId}`;
          break;
        case 'fatigue_index':
          endpoint = `sfi/${athleteId}`;
          break;
        case 'grip_index':
          endpoint = `grip/${athleteId}`;
          break;
        case 'flexibility_index':
          endpoint = `flexibility/${athleteId}`;
          break;
        case 'jumping_index':
          endpoint = `jumpingpower/${athleteId}`;
          break;
        case 'neuromuscular_indexes':
          endpoint = `nme/${athleteId}`;
          break;
        case 'power_index':
          endpoint = `power/${athleteId}`;
          break;
        default:
          // Fallback to generic endpoint
          endpoint = `athlete-stat-crud/generate`;
          break;
      }

      console.log(`Making ${statType} request to: ${endpoint}`);

      // Use PUT for specific endpoints and POST for the fallback
      const method = statType === 'generic' ? 'POST' : 'PUT';
      const data = { athlete_id: athleteId, stat_type: statType };
      
      let result;
      if (method === 'PUT') {
        result = await ApiService.put(endpoint, data);
      } else {
        result = await ApiService.post(endpoint, data);
      }

      console.log(`${statType} response:`, result);
      
      // Create a response object with the stat type as key
      const responseObj = {};
      responseObj[statType] = result.value || result.data || result[statType] || result;
      
      return responseObj;
    } catch (error) {
      console.error(`Error generating stat ${statType}:`, error);
      throw error;
    }
  }

  /**
   * Get the appropriate unit for each statistic
   * @param {string} statId - The ID of the statistic
   * @returns {string} - The unit for that statistic
   */
  static getUnitForStat(statId) {
    switch (statId) {
      case 'bmi':
        return 'kg/m²';
      case 'vo2max':
        return 'ml/kg/min';
      case 'power_to_weight_ratio':
        return 'W/kg';
      case 'speed_index':
        return 'm/s';
      case 'fatigue_index':
        return '%';
      case 'grip_index':
        return 'kg';
      case 'flexibility_index':
        return 'cm';
      case 'jumping_index':
        return 'cm';
      default:
        return '';
    }
  }

  /**
   * Get all available stat definitions
   * @returns {StatDefinition[]} - Array of stat definitions
   */
  static getStatDefinitions() {
    return [
      {
        id: 'somatotype',
        name: 'Somatotype',
        description: 'Body type classification (endomorph, mesomorph, ectomorph)',
        icon: 'body',
      },
      {
        id: 'bmi',
        name: 'BMI',
        description: 'Body Mass Index',
        icon: 'calculator',
      },
      {
        id: 'flexibility_index',
        name: 'Flexibility Index',
        description: 'Measure of overall body flexibility',
        icon: 'fitness',
      },
      {
        id: 'grip_index',
        name: 'Grip Index',
        description: 'Measure of hand and forearm strength',
        icon: 'hand-right',
      },
      {
        id: 'jumping_index',
        name: 'Jumping Index',
        description: 'Measure of jumping ability',
        icon: 'trending-up',
      },
      {
        id: 'neuromuscular_indexes',
        name: 'Neuromuscular Indexes',
        description: 'Measurements of neuromuscular coordination and efficiency',
        icon: 'flash',
      },
      {
        id: 'power_index',
        name: 'Power Index',
        description: 'Overall measure of athletic power output',
        icon: 'speedometer',
      },
      {
        id: 'power_to_weight_ratio',
        name: 'Power to Weight Ratio',
        description: 'Power output relative to body weight',
        icon: 'barbell',
      },
      {
        id: 'fatigue_index',
        name: 'Fatigue Index',
        description: 'Measure of resistance to fatigue',
        icon: 'battery-half',
      },
      {
        id: 'speed_index',
        name: 'Speed Index',
        description: 'Overall measure of athletic speed',
        icon: 'stopwatch',
      },
      {
        id: 'vo2max',
        name: 'VO2 Max',
        description: 'Maximum oxygen uptake during exercise',
        icon: 'pulse',
      },
    ];
  }

  /**
   * Get a specific stat definition by ID
   * @param {string} statId - The ID of the statistic
   * @returns {StatDefinition} - The stat definition
   */
  static getStatDefinitionById(statId) {
    return this.getStatDefinitions().find(def => def.id === statId) || this.getStatDefinitions()[0];
  }
}

export default StatsService; 