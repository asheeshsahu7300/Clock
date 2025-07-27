# 🕒 Clock App – React Native

A full-featured clock application built using **React Native**, offering essential time tools including **Alarm**, **World Clock**, **Stopwatch**, **Countdown Timer**, and customizable **Digital and Analog** clock views. Designed to be intuitive and functional across Android and iOS devices.

---

## 🚀 Features

### ⏰ Alarm
- Set multiple alarms with custom labels
- Repeat alarms on selected days
- Sound and vibration support
- Toggle on/off functionality

### 🌍 World Clock
- Add clocks from different time zones
- View current times in major cities
- Handles DST (Daylight Saving Time)

### ⏱️ Stopwatch
- Start, pause, reset functionality
- Lap recording with timestamps
- Accurate time tracking even in background

### ⏳ Countdown Timer
- Set custom countdown durations
- Alerts on completion
- Optional vibration or sound

### 🕹️ Clock Views
- Digital Clock: Clean, minimal UI with real-time updates
- Analog Clock: Smooth, animated hands with hour, minute, second dials
- Dark and Light themes support

---

## 🛠️ Tech Stack

- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: useState / useContext / Redux (if needed)
- **Time Management**: JavaScript Date APIs / moment.js / dayjs
- **Animations**: React Native Reanimated / Animated API
- **Notifications**: react-native-push-notification / expo-notifications
- **Time Zones**: moment-timezone / luxon

---

## 📁 Folder Structure

📦 clock-app/
├── 📂 components/ # Reusable UI components
├── 📂 screens/ # Main feature screens (Alarm, WorldClock, etc.)
├── 📂 utils/ # Helper functions and time logic
├── 📂 assets/ # Images, icons, sound files
├── App.js # Entry point
├── navigation.js # Navigation setup
└── README.md

yaml
Copy
Edit

---

## 📱 Setup & Installation

```bash
git clone https://github.com/your-username/clock-app.git
cd clock-app
npm install      # or yarn install
npx react-native run-android   # For Android
npx react-native run-ios       # For iOS (Mac only)
Note: For Expo users, replace with:

bash
Copy
Edit
npm install -g expo-cli
expo start
🧪 Testing
Manual testing on Android and iOS simulators/devices

Use jest and react-native-testing-library for unit tests

📅 Planned Enhancements
📦 Cloud sync for alarm and world clock settings
🗣 Voice assistant integration (e.g. "Set alarm for 6 AM")
📊 Weekly stats for stopwatch usage
🕳️ Widgets support for homescreen clocks

🙌 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

📄 License
This project is licensed under the MIT License.
