import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";


interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: any) => void;
  alarm?: any;
  headerTitle?: string; // New prop for dynamic header
}

export default function AddAlarmModal({ visible, onClose, onSave, alarm, headerTitle = "Add Alarm" }: Props) {
  const [ampm, setAmPm] = useState(1); // 0: AM, 1: PM
  const [hour, setHour] = useState(7); // 0-11 (maps to 1-12)
  const [minute, setMinute] = useState(6); // 0-59
  const [vibrate, setVibrate] = useState(true);
  const [deleteAfter, setDeleteAfter] = useState(false);
  const [label, setLabel] = useState("");
  const [tempLabel, setTempLabel] = useState("");
  const [ringtone, setRingtone] = useState("Default ringtone (Fireflies)");
  const [repeat, setRepeat] = useState("Once");
  const [customDays, setCustomDays] = useState([]);
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [isRingtoneModalVisible, setIsRingtoneModalVisible] = useState(false);
  const [isRepeatModalVisible, setIsRepeatModalVisible] = useState(false);
  const [isCustomDaysModalVisible, setIsCustomDaysModalVisible] = useState(false);

  const ampmOptions = ["AM", "PM"];
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const repeatOptions = ["Once", "Every Day", "Weekdays", "Weekends", "Custom"];
  const ringtoneOptions = [
    { title: 'Classic', file: require('../../../../assets/ringtones/mixkit-classic-alarm-995.wav') },
    { title: 'Beep', file: require('../../../../assets/ringtones/mixkit-alarm-clock-beep-988.wav') },
    { title: 'Alert Alarm', file: require('../../../../assets/ringtones/mixkit-alert-alarm-1005.wav') },
    { title: 'Critical Alarm', file: require('../../../../assets/ringtones/mixkit-critical-alarm-1004.wav') },
  ];
  const dayOptions = ["Mon", "Tue", "Wed", "thu", "Fri", "Sat", "Sun"];

  // Initialize state with alarm data when editing
  useEffect(() => {
    if (alarm && visible) {
      const time = new Date(alarm.time);
      setAmPm(time.getHours() >= 12 ? 1 : 0);
      setHour(((time.getHours() % 12) || 12) - 1);
      setMinute(time.getMinutes());
      setVibrate(alarm.vibrate ?? true);
      setDeleteAfter(alarm.deleteAfter ?? false);
      setLabel(alarm.label || "");
      setTempLabel(alarm.label || "");
      setRingtone(alarm.ringtone);
      setRepeat(alarm.repeat || "Once");
      setCustomDays(alarm.customDays || []);
    }
  }, [alarm, visible]);
 
  // Reset state when modal closes (only if not editing)
  useEffect(() => {
    if (!visible && !alarm) {
      setAmPm(0);
      setHour(8);
      setMinute(9);
      setVibrate(true);
      setDeleteAfter(false);
      setLabel("");
      setTempLabel("");
      setRingtone(ringtoneOptions[0].title);
      setRepeat("Once");
      setCustomDays([]);
    }
  }, [visible, alarm]);

  const handleSave = () => {
    const now = new Date();
    let selectedHour = hour + 1;
    if (ampm === 1 && selectedHour !== 12) {
      selectedHour += 12;
    }
    if (ampm === 0 && selectedHour === 12) {
      selectedHour = 0;
    }

    const alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      selectedHour,
      minute
    );

    if (alarmTime < now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const alarmData = {
      time: alarmTime,
      vibrate,
      deleteAfter,
      label,
      ringtone,
      repeat,
      customDays: repeat === "Custom" ? customDays : [],
      enabled: alarm?.enabled ?? true, // Preserve enabled state
    };

    onSave(alarmData);
    onClose();
  };

  const toggleDay = (day) => {
    setCustomDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Alarm Modal */}
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={30} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons name="checkmark" size={30} color="#007bff" />
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.timePickerContainer}>
            <WheelPickerExpo
              height={300}
              width={80}
              initialSelectedIndex={ampm}
              items={ampmOptions.map((item) => ({ label: item, value: item }))}
              onChange={({ index }) => setAmPm(index)}
              renderItem={(props) => (
                <Text style={[styles.pickerText, { color: props.fontColor }]}>
                  {props.label}
                </Text>
              )}
            />
            <WheelPickerExpo
              height={300}
              width={80}
              initialSelectedIndex={hour}
              items={hourOptions.map((item) => ({ label: item, value: item }))}
              onChange={({ index }) => setHour(index)}
              renderItem={(props) => (
                <Text style={[styles.pickerText, { color: props.fontColor }]}>
                  {props.label}
                </Text>
              )}
            />
            <WheelPickerExpo
              height={300}
              width={80}
              initialSelectedIndex={minute}
              items={minuteOptions.map((item) => ({ label: item, value: item }))}
              onChange={({ index }) => setMinute(index)}
              renderItem={(props) => (
                <Text style={[styles.pickerText, { color: props.fontColor }]}>
                  {props.label}
                </Text>
              )}
            />
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Ringtone */}
            <View style={styles.option}>
              <Text style={styles.optionLabel}>Ringtone</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setIsRingtoneModalVisible(true)}
              >
                <Text style={styles.optionText}>{ringtone}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Repeat */}
            <View style={styles.option}>
              <Text style={styles.optionLabel}>Repeat</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setIsRepeatModalVisible(true)}
              >
                <Text style={styles.optionText}>
                  {repeat === "Custom" && customDays.length > 0
                    ? customDays.join(", ")
                    : repeat}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Vibrate */}
            <View style={styles.toggleOption}>
              <Text style={styles.optionText}>Vibrate when alarm sounds</Text>
              <ToggleSwitch
                isOn={vibrate}
                onColor="#007bff"
                offColor="#f7f7f7"
                size="medium"
                onToggle={setVibrate}
              />
            </View>

            {/* Delete After */}
            <View style={styles.toggleOption}>
              <Text style={styles.optionText}>Delete after goes off</Text>
              <ToggleSwitch
                isOn={deleteAfter}
                onColor="#007bff"
                offColor="#f7f7f7"
                size="medium"
                onToggle={setDeleteAfter}
              />
            </View>

            {/* Label */}
            <View style={styles.option}>
              <Text style={styles.optionLabel}>Label</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setTempLabel(label);
                  setIsLabelModalVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: label ? "#000" : "#888" },
                  ]}
                >
                  {label || "Enter label"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ringtone Selection Modal */}
      <Modal
        visible={isRingtoneModalVisible}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Ringtone</Text>
            <FlatList
              data={ringtoneOptions}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.title}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setRingtone(item.title);
                    setIsRingtoneModalVisible(false);
                  }}
                >
                  <Text style={styles.listItemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsRingtoneModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Repeat Selection Modal */}
      <Modal
        visible={isRepeatModalVisible}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Repeat</Text>
            <FlatList
              data={repeatOptions}

              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setRepeat(item);
                    if (item === "Custom") {
                      setIsRepeatModalVisible(false);
                      setIsCustomDaysModalVisible(true);
                    } else {
                      setIsRepeatModalVisible(false);
                    }
                  }}
                >
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsRepeatModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Days Selection Modal */}
      <Modal
        visible={isCustomDaysModalVisible}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Days</Text>
            <FlatList
              data={dayOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    customDays.includes(item) && styles.selectedDay,
                  ]}
                  onPress={() => toggleDay(item)}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      customDays.includes(item) && styles.selectedDayText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCustomDaysModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setIsCustomDaysModalVisible(false)}
                disabled={customDays.length === 0}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Label Input Modal */}
      <Modal visible={isLabelModalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Alarm Label</Text>
            <TextInput
              placeholder="Enter label"
              style={styles.textInput}
              value={tempLabel}
              onChangeText={setTempLabel}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsLabelModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setLabel(tempLabel.trim());
                  setIsLabelModalVisible(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "semibold",
    color: "#333",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  pickerText: {
    fontSize: 42,
    textAlign: "center",
    height: 60,
    textAlignVertical: "center",
  },
  optionsContainer: {
    marginTop: 10,
  },
  option: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 17,
    marginBottom: 8,
    marginLeft: 4,
    color: "#333",
  },
  optionButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 17,
    color: "#000",
  },
  toggleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 26,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  list: {
    width: "100%",
    maxHeight: 200,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  listItemText: {
    fontSize: 18,
    color: "#333",
  },
  selectedDay: {
    backgroundColor: "#e6f0ff",
  },
  selectedDayText: {
    color: "#007bff",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    backgroundColor: "#f7f7f7",
    borderRadius: 24,
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    backgroundColor: "#007bff",
    borderRadius: 24,
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 10,
  },
  textInput: {
    padding: 12,
    borderRadius: 16,
    fontSize: 18,
    backgroundColor: "#f7f7f7",
    marginBottom: 20,
    width: "100%",
    borderColor: "#007bff",
    borderWidth: 2,
  },
});