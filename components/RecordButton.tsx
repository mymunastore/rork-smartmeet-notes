import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import { Mic, Square } from "lucide-react-native";
import React, { useEffect, useRef, memo } from "react";
import Colors from "@/constants/colors";

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

const RecordButton = memo(function RecordButton({ isRecording, onPress }: RecordButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <View style={styles.container} testID="record-button-container">
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.7, 0],
              }),
            },
          ]}
        />
      )}
      <TouchableOpacity
        style={[
          styles.button,
          isRecording ? styles.recordingButton : styles.notRecordingButton,
        ]}
        onPress={onPress}
        testID="record-button"
      >
        {isRecording ? (
          <Square size={28} color="#fff" />
        ) : (
          <Mic size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
});

export default RecordButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  notRecordingButton: {
    backgroundColor: Colors.light.primary,
  },
  recordingButton: {
    backgroundColor: Colors.light.nature.coral,
  },
  pulseCircle: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.nature.coral,
  },
});