import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import AddAlarmModal from "../AddAlarmModal/AddAlarmModal"; // Import AddAlarmModal

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: any) => void;
  alarm?: any;
}

const EditAlarmModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  alarm,
}) => {
  const ampmOptions = ["AM", "PM"];
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const [ampm, setAmPm] = useState(0); // 0 -> AM, 1 -> PM
  const [hour, setHour] = useState(0); // index in hourOptions
  const [minute, setMinute] = useState(0); // index in minuteOptions
  const [isAddAlarmModalVisible, setIsAddAlarmModalVisible] = useState(false); // State for AddAlarmModal

  useEffect(() => {
    if (alarm?.time) {
      const time = new Date(alarm.time);
      setAmPm(time.getHours() >= 12 ? 1 : 0);
      setHour((time.getHours() % 12 || 12) - 1);
      setMinute(time.getMinutes());
    }
  }, [alarm]);

  const handleSave = () => {
    let selectedHour = parseInt(hourOptions[hour]);
    if (ampm === 1 && selectedHour !== 12) {
      selectedHour += 12;
    }
    if (ampm === 0 && selectedHour === 12) {
      selectedHour = 0;
    }
    const selectedMinute = parseInt(minuteOptions[minute]);
    const now = new Date();
    const selectedTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      selectedHour,
      selectedMinute
    );
    onSave({
      time: selectedTime,
      label: alarm?.label || "",
      enabled: alarm?.enabled ?? true,
      repeat: alarm?.repeat || "Once",
      customDays: alarm?.customDays || [],
      vibrate: alarm?.vibrate ?? true,
      deleteAfter: alarm?.deleteAfter ?? false,
      ringtone: alarm?.ringtone || "Default ringtone (Fireflies)",
    });
    onClose();
  };

  const handleAdditionalSettingsSave = (updatedAlarm: any) => {
    onSave(updatedAlarm); // Save the updated alarm from AddAlarmModal
    setIsAddAlarmModalVisible(false); // Close AddAlarmModal
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Days Display (Optional) */}
            {alarm?.label && <Text style={styles.daysText}>{alarm.label}</Text>}

            {/* Wheel Picker Row */}
            <View style={styles.wheelRow}>
              {/* AM/PM Picker */}
              <View style={styles.wheelItem}>
                <WheelPickerExpo
                  height={180}
                  width={80}
                  initialSelectedIndex={ampm}
                  items={ampmOptions.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                  onChange={({ index }) => setAmPm(index)}
                  renderItem={(props) => (
                    <Text style={styles.wheelText}>{props.label}</Text>
                  )}
                />
              </View>

              {/* Hour Picker */}
              <View style={styles.wheelItem}>
                <WheelPickerExpo
                  height={180}
                  width={80}
                  initialSelectedIndex={hour}
                  items={hourOptions.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                  onChange={({ index }) => setHour(index)}
                  renderItem={(props) => (
                    <Text style={styles.wheelText}>{props.label}</Text>
                  )}
                />
              </View>

              {/* Minute Picker */}
              <View style={styles.wheelItem}>
                <WheelPickerExpo
                  height={180}
                  width={80}
                  initialSelectedIndex={minute}
                  items={minuteOptions.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                  onChange={({ index }) => setMinute(index)}
                  renderItem={(props) => (
                    <Text style={styles.wheelText}>{props.label}</Text>
                  )}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAddAlarmModalVisible(true)} // Open AddAlarmModal
              >
                <Text style={styles.buttonText}>Additional settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AddAlarmModal for Additional Settings */}
      <AddAlarmModal
        visible={isAddAlarmModalVisible}
        onClose={() => setIsAddAlarmModalVisible(false)}
        onSave={handleAdditionalSettingsSave}
        alarm={alarm} // Pass current alarm data
        headerTitle="Edit Alarm" // Set header for editing
      />
    </>
  );
};

export default EditAlarmModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  daysText: {
    fontSize: 16,
    color: "grey",
    marginBottom: 15,
    textAlign: "center",
  },
  wheelRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  wheelItem: {
    marginHorizontal: 5,
  },
  wheelText: {
    fontSize: 32,
    color: "#333",
    textAlign: "center",
    height: 40,
    textAlignVertical: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f7f7f7",
  },
  saveButton: {
    backgroundColor: "#f7f7f7",
  },
  buttonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
});
