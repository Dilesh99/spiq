# SportIQ - Athlete Performance Tracking App

SportIQ is a mobile application built with React Native and Expo that helps coaches track and monitor athlete measurements and performance metrics.

## Features

- **Athlete Profiles**: View and manage athlete details including name, age, gender, and date of birth
- **Basic Measurements**: Record and track basic body measurements such as height, weight, and body composition
- **Performance Metrics**: Measure and track athletic performance metrics including:
  - Sprint times (30m, 100m)
  - Jumping ability (standing long jump, vertical jump)
  - Endurance (beep test)
  - Flexibility (sit and reach)
  - Reaction time
  - Strength (grip strength)
- **Multiple Trial Recording**: Record up to three trials for each performance metric with automatic average calculation
- **Measurement History**: View historical measurements to track progress over time
- **Performance Progress Charts**: Visualize performance improvements over time with interactive charts

## Technical Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js REST API
- **Database**: MongoDB
- **Navigation**: Expo Router
- **UI Components**: Native components with custom styling

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/sportiq.git
   cd sportiq
   ```

2. **Install dependencies**
   ```
   npm install
   ```
   
3. **Configure backend connection**
   - Open `app/services/PerformanceService.js` and update the `BACKEND_URL` value to your backend server's address

4. **Start the development server**
   ```
   npm start
   ```
   
5. **Run on device or emulator**
   - Use the Expo Go app to scan the QR code
   - Or press 'a' to run on Android emulator
   - Or press 'i' to run on iOS simulator

## Project Structure

- **app/** - Main application code
  - **athlete/** - Athlete-related screens
    - **details.tsx** - Athlete details screen
    - **measurements/** - Basic body measurements
    - **performance-measurements/** - Athletic performance measurements
    - **performance-history/** - Performance tracking and visualization
  - **services/** - Service classes for API communication
  - **components/** - Reusable UI components
  
## License

This project is licensed under the MIT License - see the LICENSE file for details.
