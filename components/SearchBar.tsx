import { StyleSheet, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import React, { memo, useCallback } from "react";
import Colors from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchBar = memo(function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);
  return (
    <View style={styles.container} testID="search-bar">
      <Search size={22} color={Colors.light.nature.moss} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search your notes..."
        placeholderTextColor={Colors.light.gray[500]}
        value={value}
        onChangeText={onChangeText}
        testID="search-input"
      />
      {value.length > 0 && (
        <X
          size={22}
          color={Colors.light.nature.coral}
          style={styles.clearIcon}
          onPress={handleClear}
          testID="clear-search"
        />
      )}
    </View>
  );
});

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.nature.sand,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.nature.sage,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "500",
  },
  clearIcon: {
    padding: 6,
  },
});