import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import AnalogClock from "./AnalogClock";
import SmallClock from "./SmallClock";


const cities = [
  { id: "1", city: "Abidjan", country: "Côte d'Ivoire", offset: 0 },
  { id: "2", city: "Accra", country: "Ghana", offset: 0 },
  { id: "3", city: "Addis Ababa", country: "Ethiopia", offset: 3 },
  { id: "4", city: "Adelaide", country: "Australia", offset: 9.5 },
  { id: "5", city: "Aktau", country: "Kazakhstan", offset: 5 },
  { id: "6", city: "Albuquerque", country: "United States", offset: -6 },
  { id: "7", city: "Algiers", country: "Algeria", offset: 1 },
  { id: "8", city: "Almaty", country: "Kazakhstan", offset: 5 },
];

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [worldClocks, setWorldClocks] = useState([
    { id: "London", city: "London", offset: -4.5 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedClocks, setSelectedClocks] = useState<string[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [clockToDelete, setClockToDelete] = useState<any>(null);
  const [isAnalogClock, setIsAnalogClock] = useState(false);
  const [currentClockActionSheetVisible, setCurrentClockActionSheetVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalScrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade animation

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);
  

  useEffect(() => {
    // Fade in animation when switching clock type
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isAnalogClock]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const addCity = (city) => {
    const isDuplicate = worldClocks.some(
      (clock) => clock.city === city.city || clock.offset === city.offset
    );

    if (isDuplicate) {
      Alert.alert(
        "Duplicate Time Zone",
        `You are already displaying the time zone for ${city.city} or its offset (GMT${
          city.offset >= 0 ? "+" : ""
        }${city.offset}).`,
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
      return;
    }

    setWorldClocks((prev) => [
      ...prev,
      { id: city.id, city: city.city, offset: city.offset },
    ]);
    setModalVisible(false);
  };

  const handleLongPress = (clock: any) => {
    if (isSelectionMode) {
      toggleSelection(clock.id);
    } else {
      setClockToDelete(clock);
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Delete"],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              handleDeleteClock(clock);
            }
          }
        );
      } else {
        setActionSheetVisible(true);
      }
      setIsSelectionMode(true);
      toggleSelection(clock.id);
    }
  };
  function getRandomBlackWhiteScheme(idx) {
    return idx%2==0 ? 'black' : 'white';
  }
  const handleCurrentClockLongPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", `Switch to ${isAnalogClock ? "Digital" : "Analog"} Clock`],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            toggleClockType();
          }
        }
      );
    } else {
      setCurrentClockActionSheetVisible(true);
    }
  };

  const toggleClockType = () => {
    fadeAnim.setValue(0); // Reset fade animation
    setIsAnalogClock((prev) => !prev);
    setCurrentClockActionSheetVisible(false);
  };

  const toggleSelection = (clockId: string) => {
    setSelectedClocks((prev) =>
      prev.includes(clockId)
        ? prev.filter((id) => id !== clockId)
        : [...prev, clockId]
    );
  };

  const handleDeleteClock = (clock: any) => {
    setWorldClocks((prev) => prev.filter((c) => c.id !== clock.id));
    setActionSheetVisible(false);
    setClockToDelete(null);
    if (selectedClocks.length === 1 && selectedClocks.includes(clock.id)) {
      setIsSelectionMode(false);
      setSelectedClocks([]);
    } else {
      setSelectedClocks((prev) => prev.filter((id) => id !== clock.id));
    }
  };

  const handleDeleteSelectedClocks = () => {
    setWorldClocks((prev) =>
      prev.filter((clock) => !selectedClocks.includes(clock.id))
    );
    setSelectedClocks([]);
    setIsSelectionMode(false);
  };

  const cancelSelectionMode = () => {
    setSelectedClocks([]);
    setIsSelectionMode(false);
  };

  const renderCityItem = ({ item }) => (
    <TouchableOpacity style={styles.cityItem} onPress={() => addCity(item)}>
      <Text style={styles.cityName}>{item.city}</Text>
      <Text style={styles.countryName}>
        {item.country} GMT{item.offset >= 0 ? "+" : ""}
        {item.offset}:00
      </Text>
    </TouchableOpacity>
  );

  const filteredCities = cities.filter(
    (item) =>
      item.city.toLowerCase().includes(searchText.toLowerCase()) ||
      item.country.toLowerCase().includes(searchText.toLowerCase())
  );

  const clockTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const clockScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const titleTranslateY = modalScrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const titleScale = modalScrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { paddingTop: isSelectionMode ? 70 : 50 }]}
>
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={cancelSelectionMode}>
            <MaterialIcons name="cancel" size={24} color="#0078d4" />
          </TouchableOpacity>
          <Text style={styles.selectionTitle}>
            {selectedClocks.length} Selected
          </Text>
          <TouchableOpacity
            onPress={handleDeleteSelectedClocks}
            disabled={selectedClocks.length === 0}
          >
            <AntDesign name="delete" size={20} color="#0078d4" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onLongPress={handleCurrentClockLongPress}>
        <Animated.View
          style={{
            transform: [{ translateY: clockTranslateY }, { scale: clockScale }],
            alignItems: "center",
            opacity: fadeAnim,
            
           
            
          }}
        >
         {isAnalogClock ? (
            <AnalogClock currentTime={currentTime} colorScheme="white" style={{
              width: 250,
              height: 250,
              zIndex: 10 
           

            }} />
          ): (
            <>
              <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
              <Text style={styles.currentDate}>
                Current: {formatDate(currentTime)}
              </Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>

      <Animated.FlatList
        data={worldClocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const worldTime = new Date(
            currentTime.getTime() + item.offset * 60 * 60 * 1000
          );
          return (
            <TouchableOpacity
              style={[
                styles.clockItem,
                selectedClocks.includes(item.id) && styles.selectedClockItem,
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleSelection(item.id);
                }
              }}
              onLongPress={() => handleLongPress(item)}
            >
              <View style={styles.clockContent}>
                <Text style={styles.cityTime}>{formatTime(worldTime)}</Text>
                <Text style={styles.cityName}>{item.city}</Text>
                <Text style={styles.dateText}>
                  {formatDate(worldTime)} | {item.offset > 0 ? "+" : ""}
                  {item.offset} hrs
                </Text>
              </View>
              {isSelectionMode ? (
                <Ionicons
                  name={
                    selectedClocks.includes(item.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={selectedClocks.includes(item.id) ? "#007bff" : "#888"}
                />
              ) : (
                <SmallClock
            currentTime={worldTime} // Pass the adjusted world time
            style={{ width: 90, height: 90 }} // Smaller size for the list item
            colorScheme={getRandomBlackWhiteScheme(item.id)} // Use the black scheme to match the original design
          />
              )}
            </TouchableOpacity>
          );
        }}
        style={{ marginTop: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={<Text style={styles.emptyText}>No World Clocks</Text>}
      />

      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#007bff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="arrow-back" size={30} style={{ marginLeft: 10 }} />
          </TouchableOpacity>

          <Animated.View
            style={{
              transform: [{ translateY: titleTranslateY }, { scale: titleScale }],
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={styles.modalTitle}>Select city</Text>
            <Text style={styles.modalSubtitle}>Time zones</Text>
          </Animated.View>

          <View style={styles.searchBox}>
            <AntDesign
              name="search1"
              size={20}
              color="#aaa"
              style={{ marginHorizontal: 10 }}
            />
            <TextInput
              placeholder="Search for country or city"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <Animated.FlatList
            data={filteredCities}
            keyExtractor={(item) => item.id}
            renderItem={renderCityItem}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: modalScrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          />
        </View>
      </Modal>

      {/* Action Sheet for World Clocks (Android) */}
      <Modal visible={actionSheetVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          onPress={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => handleDeleteClock(clockToDelete)}
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

      {/* Action Sheet for Current Clock (Android) */}
      <Modal
        visible={currentClockActionSheetVisible}
        transparent
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          onPress={() => setCurrentClockActionSheetVisible(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={toggleClockType}
            >
              <Text style={styles.actionSheetText}>
                Switch to {isAnalogClock ? "Digital" : "Analog"} Clock
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => setCurrentClockActionSheetVisible(false)}
            >
              <Text style={styles.actionSheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  
    

    paddingHorizontal: 15,
   
    justifyContent: "center",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    marginTop: -60,
  },
  selectionTitle: {
    fontSize: 18,
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
  currentTime: {
    fontSize: 48,
    fontWeight: "500",
    textAlign: "center",
  },
  currentDate: {
    textAlign: "center",
    color: "#888",
    marginBottom: 30,
    fontSize: 16,
  },
  analogClockContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  clockItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 15,
  },
  selectedClockItem: {
    backgroundColor: "#e6f0ff",
  },
  clockContent: {
    flex: 1,
  },
  cityTime: {
    fontSize: 28,
    fontWeight: "500",
  },
  cityName: {
    fontSize: 16,
    marginTop: 4,
  },
  countryName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  fab: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 30,
    bottom: 70,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "left",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 45,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cityItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
});