import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Purumi',
  showBack = false,
  onBackPress,
  rightComponent,
}) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      <View style={styles.container}>
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="뒤로가기"
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.logo}>Purumi</Text>
          )}
        </View>
        
        {title && (
          <View style={styles.center}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        
        <View style={styles.right}>
          {rightComponent || (
            <View style={styles.icons}>
              <TouchableOpacity
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="알림"
              >
                <Text style={styles.icon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="프로필"
              >
                <Text style={styles.icon}>👤</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary[500],
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  backIcon: {
    fontSize: Layout.fontSize.xl,
    color: Colors.text.primary,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Layout.spacing.sm,
    marginLeft: Layout.spacing.sm,
  },
  icon: {
    fontSize: Layout.fontSize.lg,
  },
});


