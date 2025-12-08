import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebViewScreen from '../screens/WebViewScreen';
import AuthService from '../services/AuthService';

const Tab = createBottomTabNavigator();

// Home screen
const HomeScreen = () => <WebViewScreen route="/" title="Home" />;

// Directory screen
const DirectoryScreen = () => <WebViewScreen route="/members/" title="Directory" />;

// Calendar screen
const CalendarScreen = () => <WebViewScreen route="/calendar/" title="Calendar" />;

// News screen
const NewsScreen = () => <WebViewScreen route="/news-and-announcements/" title="News" />;

// Emails screen
const EmailsScreen = () => <WebViewScreen route="/emails" title="Emails" />;

// More screen with options
const MoreScreen = ({ navigation }: any) => {
  const handleRefresh = () => {
    Alert.alert('Refresh', 'Pull down to refresh the current page');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out JC Amherst app! Download it now.',
        title: 'JC Amherst',
        url: 'https://social.jcamherst.org',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = await AuthService.getUser();
              const fcmToken = await AuthService.getFCMToken();
              if (user) {
                await AuthService.logout(user.id, fcmToken || undefined);
              }
              navigation.getParent()?.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.moreContainer}>
      <Text style={styles.moreTitle}>More Options</Text>
      
      <TouchableOpacity style={styles.menuItem} onPress={handleRefresh}>
        <Ionicons name="refresh" size={24} color="#0d6197" />
        <Text style={styles.menuItemText}>Refresh</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
        <Ionicons name="share-social" size={24} color="#0d6197" />
        <Text style={styles.menuItemText}>Share App</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#dc3545" />
        <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Logout</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </View>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0d6197',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Directory"
        component={DirectoryScreen}
        options={{
          tabBarLabel: 'Directory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Emails"
        component={EmailsScreen}
        options={{
          tabBarLabel: 'Emails',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  moreContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  moreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
  },
});

export default AppNavigator;