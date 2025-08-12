import { StyleSheet, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import React, { memo, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchBar = memo(function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  const { colors } = useTheme();
  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);
  return (
    <View style={[styles.container, { backgroundColor: colors.nature.sand, borderColor: colors.border, shadowColor: colors.nature.sage }]} testID="search-bar">
      <Search size={22} color={colors.nature.moss} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Search your notes..."
        placeholderTextColor={colors.gray[500]}
        value={value}
        onChangeText={onChangeText}
        testID="search-input"
      />
      {value.length > 0 && (
        <X
          size={22}
          color={colors.nature.coral}
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
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "500",
  },
  clearIcon: {
    padding: 6,
  },
});