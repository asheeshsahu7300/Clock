import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { Ionicons } from "@expo/vector-icons";

interface PickerItem {
  label: string;
  value: number;
}

interface WheelPickerProps {
  label: string;
  fontColor?: string;
  textAlign?: "center" | "left" | "right";
}

const TimerScreen: React.FC = () => {
  const [hours, setHours] = useState<number>(4);
  const [minutes, setMinutes] = useState<number>(12);
  const [seconds, setSeconds] = useState<number>(2);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hoursData: number[] = Array.from({ length: 24 }, (_, i) => i);
  const minutesSecondsData: number[] = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeLeft === 0 && isRunning) {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        Vibration.vibrate([500, 500, 500]);
      }
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const startTimer = (): void => {
    const totalSeconds: number = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    }
  };

  const handleStartPause = (): void => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(0);
    setHours(4);
    setMinutes(12);
    setSeconds(2);
  };

  const formatTime = (time: number): string => {
    const hrs: number = Math.floor(time / 3600);
    const mins: number = Math.floor((time % 3600) / 60);
    const secs: number = time % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const hrs: number = Math.floor(seconds / 3600);
    const mins: number = Math.floor((seconds % 3600) / 60);
    return `Total ${hrs} hour${hrs !== 1 ? "s" : ""} ${mins} minute${
      mins !== 1 ? "s" : ""
    }`;
  };

  return (
    <View style={styles.container}>
      {!isRunning && timeLeft === 0 ? (
        <>
         <View style={styles.pickerRow}>
  <WheelPickerExpo
    height={400}
    width={90}
    initialSelectedIndex={hours}
    items={hoursData.map((hour) => ({
      label: hour.toString().padStart(2, "0"),
      value: hour,
    }))}
    onChange={({ index }: { index: number }) => setHours(index)}
    renderItem={(props: WheelPickerProps) => (
      <Text
        style={[
          styles.text,
          {
            fontSize: 48,
            color: props.fontColor,
            textAlign: props.textAlign,
          },
        ]}
      >
        {props.label}
      </Text>
    )}
  />
  <View style={styles.separator} />
  <WheelPickerExpo
    height={400}
    width={90}
    initialSelectedIndex={minutes}
    items={minutesSecondsData.map((minute) => ({
      label: minute.toString().padStart(2, "0"),
      value: minute,
    }))}
    onChange={({ index }: { index: number }) => setMinutes(index)}
    renderItem={(props: WheelPickerProps) => (
      <Text
        style={[
          styles.text,
          {
            fontSize: 48,
            color: props.fontColor,
            textAlign: props.textAlign,
          },
        ]}
      >
        {props.label}
      </Text>
    )}
  />
  <View style={styles.separator} />
  <WheelPickerExpo
    height={400}
    width={90}
    initialSelectedIndex={seconds}
    items={minutesSecondsData.map((second) => ({
      label: second.toString().padStart(2, "0"),
      value: second,
    }))}
    onChange={({ index }: { index: number }) => setSeconds(index)}
    renderItem={(props: WheelPickerProps) => (
      <Text
        style={[
          styles.text,
          {
            fontSize: 48,
            color: props.fontColor,
            textAlign: props.textAlign,
          },
        ]}
      >
        {props.label}
      </Text>
    )}
  />
</View>
          <TouchableOpacity style={styles.playButton} onPress={startTimer}>
            <Ionicons name="play" size={40} color="#007bff" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.timerCircle}>
            <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.subText}>{formatTotalTime(timeLeft)}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <Ionicons name="stop" size={40} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStartPause}
            >
              <Ionicons
                name={isRunning ? "pause" : "play"}
                size={40}
                color="#007bff"
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 50,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  
  },
  text: {
    fontSize: 50,
  },
  playButton: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 100,
    marginTop: 30,
  },
  separator: {
    width: .5,
    height: 200, // Matches the height of WheelPickerExpo
    backgroundColor: "#ccc", // Thin grey color
    marginHorizontal: 5,
    marginTop:100,
    alignItems: "center", // Small margin for spacing
  },
  timerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
    borderColor: "#dfe2f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "semibold",
    padding:20
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 40,
  },
  controlButton: {
    backgroundColor: "#f0f0f0",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TimerScreen;