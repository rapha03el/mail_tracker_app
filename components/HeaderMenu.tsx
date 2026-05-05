import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function HeaderMenu() {
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? "dark"].text;

  const [menuVisible, setMenuVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.menuButton}
      >
        <Ionicons name="menu-outline" size={24} /*color={iconColor}*/ />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.dropdown,
              { backgroundColor: "#FFFFFF" }, // 👈 CHANGED: White background
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setPrivacyVisible(true);
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#000000" // 👈 CHANGED: Black icon
              />
              <Text style={[styles.menuText, { color: "#000000" }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.divider,
                { backgroundColor: "#E0E0E0" }, // 👈 CHANGED: Light gray divider
              ]}
            />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                // Add settings navigation here later
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#000000" />
              <Text style={[styles.menuText, { color: "#000000" }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Privacy Policy Bottom Sheet - Enhanced UI */}
      <Modal
        transparent
        visible={privacyVisible}
        animationType="slide"
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <Pressable
            style={styles.bottomSheetOverlay}
            onPress={() => setPrivacyVisible(false)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: "#FFFFFF" }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: "#110a0a" }, // 👈 CHANGED: Light gray
                ]}
              />
            </View>

            {/* Header with Icon */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        Colors[colorScheme ?? "dark"].tint + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                </View>
                <Text style={[styles.bottomSheetTitle, { color: "#000000" }]}>
                  Privacy Policy
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPrivacyVisible(false)}
                style={[styles.closeButton, { backgroundColor: "#F0F0F0" }]}
              >
                <Ionicons name="close" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Last Updated Badge */}
            <View style={styles.updatedBadgeContainer}>
              <View
                style={[
                  styles.updatedBadge,
                  {
                    backgroundColor: Colors[colorScheme ?? "dark"].tint + "15",
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors[colorScheme ?? "dark"].tint}
                />
                <Text
                  style={[
                    styles.updatedText,
                    { color: Colors[colorScheme ?? "dark"].tint },
                  ]}
                >
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Content with better formatting */}
            <ScrollView
              style={styles.bottomSheetContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Introduction Card */}
              <View style={[styles.card, { backgroundColor: "#F8F8F8" }]}>
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                  <Text style={[styles.cardTitle, { color: "#000000" }]}>
                    Your Privacy Matters
                  </Text>
                </View>
                <Text style={[styles.cardText, { color: "#333333" }]}>
                  Mail Tracker is designed with your privacy in mind. We believe
                  in transparency and giving you control over your data.
                </Text>
              </View>

              {/* Section 1 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                  <Text style={[styles.sectionTitle, { color: "#000000" }]}>
                    Information We Collect
                  </Text>
                </View>
                <Text style={[styles.sectionText, { color: "#333333" }]}>
                  • Email address for account creation{"\n"}• Mail tracking
                  numbers you provide{"\n"}• Delivery status updates{"\n"}• App
                  usage analytics (anonymous)
                </Text>
              </View>

              {/* Section 2 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                  <Text style={[styles.sectionTitle, { color: "#000000" }]}>
                    How We Protect Your Data
                  </Text>
                </View>
                <Text style={[styles.sectionText, { color: "#333333" }]}>
                  • End-to-end encryption for sensitive data{"\n"}• Secure cloud
                  storage with regular backups{"\n"}• Two-factor authentication
                  support{"\n"}• Regular security audits
                </Text>
              </View>

              {/* Section 3 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                  <Text style={[styles.sectionTitle, { color: "#000000" }]}>
                    Data Sharing
                  </Text>
                </View>
                <Text style={[styles.sectionText, { color: "#333333" }]}>
                  We never sell your personal information. Data is only shared
                  with:{"\n"}• Shipping carriers (to track your packages){"\n"}•
                  Service providers (hosting, analytics){"\n"}• Legal
                  authorities (when required by law)
                </Text>
              </View>

              {/* Section 4 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={Colors[colorScheme ?? "dark"].tint}
                  />
                  <Text style={[styles.sectionTitle, { color: "#000000" }]}>
                    Your Rights
                  </Text>
                </View>
                <Text style={[styles.sectionText, { color: "#333333" }]}>
                  • Access your personal data anytime{"\n"}• Request data
                  deletion{"\n"}• Opt-out of analytics{"\n"}• Export your
                  tracking history
                </Text>
              </View>

              {/* Contact Card */}
              <View
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: "#F0F0F0", // 👈 CHANGED: Light gray
                    borderColor: "#CCCCCC", // 👈 CHANGED: Light gray border
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors[colorScheme ?? "dark"].tint}
                />
                <Text style={[styles.contactText, { color: "#000000" }]}>
                  Questions? Reach out to us at{"\n"}
                  <Text
                    style={{
                      fontWeight: "600",
                      color: Colors[colorScheme ?? "dark"].tint,
                    }}
                  >
                    effahampem@vra.com
                  </Text>
                </Text>
              </View>

              {/* Bottom Spacing */}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // In the menuButton style, update to:
  menuButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: Dimensions.get("window").height * 0.6,
    maxHeight: Dimensions.get("window").height * 0.9,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  updatedBadgeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  updatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  updatedText: {
    fontSize: 12,
    fontWeight: "500",
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 28,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
