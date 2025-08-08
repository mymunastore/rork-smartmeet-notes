import { Audio } from "expo-av";
import { Platform } from "react-native";

class AudioRecorder {
  recording: Audio.Recording | null = null;
  private isInitialized = false;
  private permissionsGranted = false;
  
  private async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log("Requesting permissions...");
      const { status } = await Audio.requestPermissionsAsync();
      this.permissionsGranted = status === 'granted';
      
      if (!this.permissionsGranted) {
        throw new Error("Audio recording permission not granted");
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      this.isInitialized = true;
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      throw error;
    }
  }
  
  async startRecording(): Promise<void> {
    try {
      await this.initializeAudio();
      
      console.log("Starting recording...");
      
      // Optimized recording settings for better performance
      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 22050, // Reduced for better performance
          numberOfChannels: 1, // Mono for smaller file size
          bitRate: 64000, // Reduced bitrate
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MEDIUM, // Reduced quality
          sampleRate: 22050, // Reduced for better performance
          numberOfChannels: 1, // Mono for smaller file size
          bitRate: 64000, // Reduced bitrate
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 64000, // Reduced bitrate
        },
      };
      
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      throw err;
    }
  }

  async stopRecording(): Promise<{ uri: string; duration: number }> {
    console.log("Stopping recording...");
    if (!this.recording) {
      throw new Error("No active recording");
    }
    
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      if (Platform.OS === "ios") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }
      
      this.recording = null;
      
      if (!uri) {
        throw new Error("Recording URI is undefined");
      }
      
      return {
        uri,
        duration: status.durationMillis ? status.durationMillis / 1000 : 0,
      };
    } catch (err) {
      console.error("Failed to stop recording", err);
      throw err;
    }
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
  
  // Get recording status for debugging
  getRecordingStatus(): { isRecording: boolean; isInitialized: boolean; permissionsGranted: boolean } {
    return {
      isRecording: this.recording !== null,
      isInitialized: this.isInitialized,
      permissionsGranted: this.permissionsGranted,
    };
  }
  
  // Cleanup method
  async cleanup(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }
  }
}

export default new AudioRecorder();