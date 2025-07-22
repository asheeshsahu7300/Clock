import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AlarmScreen from "../Screens/AlarmScreen/AlarmScreen";
import ClockScreen from "../Screens/ClockScreen/ClockScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Easing } from "react-native";
import StopwatchScreen from "../Screens/StopwatchScreen/StopwatchScreen";
import TimerScreen from "../Screens/TimerScreen/TimerScreen";
const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleStyle: {
          fontSize: 28,
          fontWeight: "semibold",

          textAlign: "center",
        },
        tabBarStyle: {
          // background color
          borderTopWidth: 0, // remove border
          height: 55, // height of tab bar

          // rounded edges (for floating look)
          // optional: for floating tab bar
          position: "absolute", // optional: for floating effect
        },
        tabBarIconStyle: {},
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 150,
            easing: Easing.inOut(Easing.ease),
          },
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Alarm") {
            iconName = "alarm";
          } else if (route.name === "Clock") {
            iconName = "time";
          } else if (route.name === "Stopwatch") {
            iconName = "stopwatch";
          } else if (route.name === "Timer") {
            iconName = "timer";
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Alarm" component={AlarmScreen} />
      <Tab.Screen name="Clock" component={ClockScreen} />
      <Tab.Screen name="Stopwatch" component={StopwatchScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
    </Tab.Navigator>
  );
}
