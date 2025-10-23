
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
import { colors, darkColors } from '@/styles/commonStyles';
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
  containerWidth = Dimensions.get('window').width - 40,
  borderRadius = 28,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDark = theme.dark;
  const currentColors = isDark ? darkColors : colors;

  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.route));
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  const handleTabPress = (route: string) => {
    const newIndex = tabs.findIndex(tab => tab.route === route);
    indicatorPosition.value = withSpring(newIndex, {
      damping: 18,
      stiffness: 100,
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
          <BlurView 
            intensity={90} 
            tint={isDark ? 'dark' : 'light'} 
            style={[styles.blur, { borderRadius }]}
          >
            <View style={[
              styles.content, 
              { 
                backgroundColor: isDark 
                  ? 'rgba(37, 37, 37, 0.85)' 
                  : 'rgba(255, 255, 255, 0.85)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(45, 45, 45, 0.06)',
              }
            ]}>
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: (containerWidth - 16) / tabs.length - 8,
                    backgroundColor: currentColors.sage,
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
                      size={22}
                      color={isActive ? currentColors.text : currentColors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isActive ? currentColors.text : currentColors.textSecondary,
                          fontWeight: isActive ? '600' : '500',
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
          <View style={[
            styles.content, 
            { 
              backgroundColor: currentColors.card,
              borderWidth: 1,
              borderColor: currentColors.border,
            }
          ]}>
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: (containerWidth - 16) / tabs.length - 8,
                  backgroundColor: currentColors.sage,
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
                    size={22}
                    color={isActive ? currentColors.text : currentColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isActive ? currentColors.text : currentColors.textSecondary,
                        fontWeight: isActive ? '600' : '500',
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
    boxShadow: '0px 8px 32px rgba(45, 45, 45, 0.12)',
    elevation: 6,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    position: 'relative',
    borderRadius: 28,
  },
  indicator: {
    position: 'absolute',
    height: '75%',
    top: '12.5%',
    left: 12,
    borderRadius: 20,
    opacity: 0.2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
