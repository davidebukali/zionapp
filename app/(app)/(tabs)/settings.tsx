import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../../store/store";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="titleMedium" style={styles.title}>
        Account Settings
      </Text>
      {user?.email && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          Logged in as: {user.email}
        </Text>
      )}
      <Button
        mode="contained-tonal"
        icon="logout"
        onPress={handleLogout}
        style={styles.button}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    minWidth: 160,
  },
});
