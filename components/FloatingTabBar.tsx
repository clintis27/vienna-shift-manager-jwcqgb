
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface TabBarItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 48,
  borderRadius = 24,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.route));
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  const handleTabPress = (route: string) => {
    const newIndex = tabs.findIndex(tab => tab.route === route);
    indicatorPosition.value = withSpring(newIndex, {
      damping: 20,
      stiffness: 90,
    });
    router.push(route as any);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            tabs.map((_, i) => i),
            tabs.map((_, i) => i * tabWidth)
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { marginBottom: bottomMargin }]}
    >
      <View style={[styles.container, { width: containerWidth, borderRadius }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint={theme.dark ? 'dark' : 'light'} style={styles.blur}>
            <View style={[styles.content, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: containerWidth / tabs.length,
                    backgroundColor: theme.colors.primary,
                  },
                  indicatorStyle,
                ]}
              />
              {tabs.map((tab) => {
                const isActive = pathname.includes(tab.route);
                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={styles.tab}
                    onPress={() => handleTabPress(tab.route)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={tab.icon}
                      size={24}
                      color={isActive ? theme.colors.primary : theme.colors.text}
                    />
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isActive ? theme.colors.primary : theme.colors.text,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        ) : (
          <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: containerWidth / tabs.length,
                  backgroundColor: theme.colors.primary,
                },
                indicatorStyle,
              ]}
            />
            {tabs.map((tab) => {
              const isActive = pathname.includes(tab.route);
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name={tab.icon}
                    size={24}
                    color={isActive ? theme.colors.primary : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isActive ? theme.colors.primary : theme.colors.text,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  container: {
    overflow: 'hidden',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: 24,
  },
  content: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    top: '10%',
    borderRadius: 16,
    opacity: 0.15,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
});
