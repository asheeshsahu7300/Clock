import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
  Vibration,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import * as TaskManager from "expo-task-manager";
import AddAlarmModal from "./AddAlarmModal/AddAlarmModal";
import ToggleSwitch from "toggle-switch-react-native";
import EditAlarmModal from "./EditAlarmModal/EditAlarmModal";

// Background task name for handling notifications
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Enable system sound as fallback
    shouldSetBadge: false,
  }),
});

// Define background task for handling notifications
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error("Background task error:", error);
      return;
    }
    if (data) {
      const { notification } = data as any;
      const alarmId = notification.request.identifier;
      // Note: We can't play custom audio here directly due to background limitations
      // Instead, rely on notification sound or trigger foreground handling
    }
  }
);

// Map ringtone names to audio file paths (adjust paths based on your project)
const ringtoneMap: { [key: string]: string } = {
  Classic: require("../../../assets/ringtones/mixkit-classic-alarm-995.wav"),
  Beep: require("../../../assets/ringtones/mixkit-alarm-clock-beep-988.wav"),
  "Alert Alarm": require("../../../assets/ringtones/mixkit-alert-alarm-1005.wav"),
  "Critical Alarm": require("../../../assets/ringtones/mixkit-critical-alarm-1004.wav"),
};

export default function AlarmScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAlarms, setSelectedAlarms] = useState<string[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState<any>(null);
  const [ringingAlarm, setRingingAlarm] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Register background task
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(
      (error) => console.error("Error registering background task:", error)
    );

    requestPermissions();

    // Handle notifications when app is in foreground or background
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const alarmId = notification.request.identifier;
        const alarm = alarms.find((a) => a.id === alarmId);
        if (alarm) {
          setRingingAlarm(alarm);
          setIsRinging(true);
          Vibration.vibrate([500, 500, 500], true);
          await playRingtone(alarm.ringtone);
        }
      });

    // Handle notification response (e.g., user taps notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const alarmId = response.notification.request.identifier;
          const alarm = alarms.find((a) => a.id === alarmId);
          if (alarm) {
            setRingingAlarm(alarm);
            setIsRinging(true);
            Vibration.vibrate([500, 500, 500], true);
            await playRingtone(alarm.ringtone);
          }
        }
      );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
      Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(
        (error) => console.error("Error unregistering background task:", error)
      );
      Vibration.cancel();
      stopRingtone();
    };
  }, [alarms]);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need notification permission for alarms to work."
      );
    }
    // Request audio permissions
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  };

  const playRingtone = async (ringtone: string) => {
    try {
      // Stop any existing sound
      await stopRingtone();
      // Load and play the new sound
      const source = ringtoneMap[ringtone] || ringtoneMap["Classic"];
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        isLooping: true,
      });
      soundRef.current = sound;
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  const stopRingtone = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const handleSaveAlarm = async (alarm: any) => {
    console.log("Alarm set at:", alarm);

    // Schedule notification
    const trigger = {
      type: "date",
      timestamp: new Date(alarm.time).getTime(),
    };

    const schedulingOptions = {
      content: {
        title: "⏰ Alarm",
        body: `Your alarm for ${formatTime(alarm.time)} is ringing!`,
        sound: true, // Enable system sound as fallback
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    };

    const id = await Notifications.scheduleNotificationAsync(schedulingOptions);

    // Add to alarms list
    setAlarms((prev) => [
      ...prev,
      {
        ...alarm,
        id,
        enabled: true,
        ringtone: alarm.ringtone || "Classic",
      },
    ]);
    setModalVisible(false);
  };

  const handleUpdateAlarm = async (updatedAlarm: any) => {
    // Cancel the existing notification
    if (selectedAlarm?.id) {
      await Notifications.cancelScheduledNotificationAsync(selectedAlarm.id);
    }

    // Schedule new notification for updated alarm
    const trigger = new Date(updatedAlarm.time);
    const schedulingOptions = {
      content: {
        title: "⏰ Alarm",
        body: `Your alarm for ${formatTime(updatedAlarm.time)} is ringing!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    };
    const newId = await Notifications.scheduleNotificationAsync(
      schedulingOptions
    );

    // Update the alarms list
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === selectedAlarm.id
          ? {
              ...updatedAlarm,
              id: newId,
              enabled: updatedAlarm.enabled,
              ringtone: updatedAlarm.ringtone || "Classic",
            }
          : alarm
      )
    );
    setEditModalVisible(false);
    setSelectedAlarm(null);
  };

  const handleSnooze = async () => {
    if (!ringingAlarm) return;

    // Cancel the current notification
    await Notifications.cancelScheduledNotificationAsync(ringingAlarm.id);

    // Schedule a new alarm for 10 minutes later
    const snoozeTime = new Date(new Date().getTime() + 10 * 60 * 1000);
    const schedulingOptions = {
      content: {
        title: "⏰ Snoozed Alarm",
        body: `Your snoozed alarm for ${formatTime(snoozeTime)} is ringing!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: snoozeTime,
    };
    const newId = await Notifications.scheduleNotificationAsync(
      schedulingOptions
    );

    // Update the alarm with the new ID and time
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === ringingAlarm.id
          ? { ...alarm, id: newId, time: snoozeTime }
          : alarm
      )
    );

    // Stop ringing
    setIsRinging(false);
    setRingingAlarm(null);
    Vibration.cancel();
    await stopRingtone();
  };

  const handleStopAlarm = async () => {
    if (!ringingAlarm) return;

    // Cancel the current notification
    await Notifications.cancelScheduledNotificationAsync(ringingAlarm.id);

    // If the alarm is set to repeat, reschedule it for the next occurrence
    if (ringingAlarm.repeat) {
      const nextTime = calculateNextAlarmTime(ringingAlarm);
      const schedulingOptions = {
        content: {
          title: "⏰ Alarm",
          body: `Your alarm for ${formatTime(nextTime)} is ringing!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: nextTime,
      };
      const newId = await Notifications.scheduleNotificationAsync(
        schedulingOptions
      );
      setAlarms((prev) =>
        prev.map((alarm) =>
          alarm.id === ringingAlarm.id
            ? { ...alarm, id: newId, time: nextTime }
            : alarm
        )
      );
    } else {
      // Disable one-time alarm
      setAlarms((prev) =>
        prev.map((alarm) =>
          alarm.id === ringingAlarm.id ? { ...alarm, enabled: false } : alarm
        )
      );
    }

    // Stop ringing
    setIsRinging(false);
    setRingingAlarm(null);
    Vibration.cancel();
    await stopRingtone();
  };

  const calculateNextAlarmTime = (alarm: any) => {
    const now = new Date();
    const nextTime = new Date(alarm.time);
    nextTime.setDate(now.getDate() + 1); // Example: next day
    return nextTime;
  };

  const toggleAlarm = (index: number, isOn: boolean) => {
    setAlarms((prevAlarms) => {
      const updatedAlarms = [...prevAlarms];
      updatedAlarms[index].enabled = isOn;
      return updatedAlarms;
    });
  };

  const handleLongPress = (alarm: any) => {
    if (isSelectionMode) {
      toggleSelection(alarm.id);
    } else {
      setAlarmToDelete(alarm);
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Delete"],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              handleDeleteAlarm(alarm);
            }
          }
        );
      } else {
        setActionSheetVisible(true);
      }
      setIsSelectionMode(true);
      toggleSelection(alarm.id);
    }
  };

  const toggleSelection = (alarmId: string) => {
    setSelectedAlarms((prev) =>
      prev.includes(alarmId)
        ? prev.filter((id) => id !== alarmId)
        : [...prev, alarmId]
    );
  };

  const handleDeleteAlarm = async (alarm: any) => {
    if (alarm.id) {
      await Notifications.cancelScheduledNotificationAsync(alarm.id);
    }
    setAlarms((prev) => prev.filter((a) => a.id !== alarm.id));
    setActionSheetVisible(false);
    setAlarmToDelete(null);
    if (selectedAlarms.length === 1 && selectedAlarms.includes(alarm.id)) {
      setIsSelectionMode(false);
      setSelectedAlarms([]);
    } else {
      setSelectedAlarms((prev) => prev.filter((id) => id !== alarm.id));
    }
  };

  const handleDeleteSelectedAlarms = async () => {
    for (const alarmId of selectedAlarms) {
      await Notifications.cancelScheduledNotificationAsync(alarmId);
    }
    setAlarms((prev) =>
      prev.filter((alarm) => !selectedAlarms.includes(alarm.id))
    );
    setSelectedAlarms([]);
    setIsSelectionMode(false);
  };

  const cancelSelectionMode = () => {
    setSelectedAlarms([]);
    setIsSelectionMode(false);
  };

  const formatTime = (time: any) => {
    const date = new Date(time);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={cancelSelectionMode}>
            <MaterialIcons name="cancel" size={24} color="#0078d4" />
          </TouchableOpacity>
          <Text style={styles.selectionTitle}>
            {selectedAlarms.length} Selected
          </Text>
          <TouchableOpacity
            onPress={handleDeleteSelectedAlarms}
            disabled={selectedAlarms.length === 0}
          >
            <Text
              style={[
                styles.selectionButtonText,
                selectedAlarms.length === 0 && styles.disabledButton,
              ]}
            >
              <AntDesign name="delete" size={20} color="#0078d4" />
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={alarms}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.alarmCard,
              selectedAlarms.includes(item.id) && styles.selectedAlarmCard,
            ]}
            onPress={() => {
              if (isSelectionMode) {
                toggleSelection(item.id);
              } else {
                setSelectedAlarm(item);
                setEditModalVisible(true);
              }
            }}
            onLongPress={() => handleLongPress(item)}
          >
            <View style={styles.alarmContent}>
              <View style={styles.alarmDaysContainer}>
                <Text style={styles.alarmTime}>
                  {formatTime(item?.time ?? "")}
                </Text>
              </View>
              <View style={styles.alarmDaysContainer}>
                <Text style={styles.alarmDays}>{item.repeat || ""}</Text>
                {item?.label && (
                  <Text style={styles.alarmDays}> | {item.label}</Text>
                )}
                {item?.ringtone && (
                  <Text style={styles.alarmDays}> | {item.ringtone}</Text>
                )}
              </View>
            </View>
            {!isSelectionMode && (
              <ToggleSwitch
                isOn={item.enabled}
                onColor="#007bff"
                offColor="#f7f7f7"
                size="medium"
                onToggle={(isOn) => toggleAlarm(index, isOn)}
              />
            )}
            {isSelectionMode && (
              <Ionicons
                name={
                  selectedAlarms.includes(item.id)
                    ? "checkbox"
                    : "square-outline"
                }
                size={24}
                color={selectedAlarms.includes(item.id) ? "#007bff" : "#888"}
              />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No Alarms</Text>}
      />

      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#0078d4" />
        </TouchableOpacity>
      )}

      <AddAlarmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAlarm}
      />

      <EditAlarmModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedAlarm(null);
        }}
        onSave={handleUpdateAlarm}
        alarm={selectedAlarm}
      />

      <Modal visible={actionSheetVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          onPress={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => handleDeleteAlarm(alarmToDelete)}
            >
              <Text style={styles.actionSheetText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={styles.actionSheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isRinging} transparent animationType="fade">
        <View style={styles.ringingOverlay}>
          <View style={styles.ringingModal}>
            <Text style={styles.ringingTitle}>Alarm Ringing!</Text>
            <Text style={styles.ringingTime}>
              {ringingAlarm ? formatTime(ringingAlarm.time) : ""}
            </Text>
            {ringingAlarm?.label && (
              <Text style={styles.ringingLabel}>{ringingAlarm.label}</Text>
            )}
            {ringingAlarm?.ringtone && (
              <Text style={styles.ringingLabel}>
                Ringtone: {ringingAlarm.ringtone}
              </Text>
            )}
            <View style={styles.ringingButtons}>
              <TouchableOpacity
                style={[styles.ringingButton, styles.snoozeButton]}
                onPress={handleSnooze}
              >
                <Text style={[styles.ringingButtonText, { color: "#fff" }]}>
                  Snooze (10 min)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ringingButton, styles.stopButton]}
                onPress={handleStopAlarm}
              >
                <Text style={styles.ringingButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: "#f5f5f5",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectionButtonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
  },
  disabledButton: {
    color: "#888",
  },
  alarmCard: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedAlarmCard: {
    backgroundColor: "#e6f0ff",
  },
  alarmContent: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: "500",
    color: "#333",
  },
  alarmDaysContainer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  alarmDays: {
    fontSize: 16,
    color: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    backgroundColor: "white",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emptyText: {
    color: "grey",
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionSheetButton: {
    paddingVertical: 15,
    alignItems: "center",
  },
  actionSheetText: {
    fontSize: 18,
    color: "#007bff",
    fontWeight: "500",
  },
  ringingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  ringingModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  ringingTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  ringingTime: {
    fontSize: 32,
    fontWeight: "500",
    color: "#007bff",
    marginBottom: 10,
  },
  ringingLabel: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  ringingButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  ringingButton: {
    flex: 1,
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 5,
  },
  snoozeButton: {
    backgroundColor: "#007bff",
  },
  stopButton: {
    backgroundColor: "#f7f7f7",
  },
  ringingButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
});
