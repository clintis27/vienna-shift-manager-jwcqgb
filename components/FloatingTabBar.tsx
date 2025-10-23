
import React, { useEffect } from 'react';
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
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
  borderRadius = 30,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDark = theme.dark;
  const currentColors = isDark ? darkColors : colors;

  const activeIndex = tabs.findIndex(tab => pathname.includes(tab.route));
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);
  const tabScales = tabs.map(() => useSharedValue(1));

  useEffect(() => {
    const newIndex = tabs.findIndex(tab => pathname.includes(tab.route));
    if (newIndex >= 0) {
      indicatorPosition.value = withSpring(newIndex, {
        damping: 20,
        stiffness: 120,
      });
    }
  }, [pathname]);

  const handleTabPress = (route: string, index: number) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate tab scale
    tabScales[index].value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
      tabScales[index].value = withSpring(1, { damping: 10, stiffness: 400 });
    });

    // Navigate
    router.push(route as any);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    return {
      transform: [
        {
          translateX: withSpring(indicatorPosition.value * tabWidth, {
            damping: 20,
            stiffness: 120,
          }),
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
            intensity={95} 
            tint={isDark ? 'dark' : 'light'} 
            style={[styles.blur, { borderRadius }]}
          >
            <View style={[
              styles.content, 
              { 
                backgroundColor: isDark 
                  ? 'rgba(37, 37, 37, 0.88)' 
                  : 'rgba(255, 255, 255, 0.88)',
                borderWidth: 1.5,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(45, 45, 45, 0.08)',
              }
            ]}>
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: (containerWidth - 20) / tabs.length - 10,
                    backgroundColor: currentColors.sage,
                  },
                  indicatorStyle,
                ]}
              />
              {tabs.map((tab, index) => {
                const isActive = pathname.includes(tab.route);
                
                const animatedTabStyle = useAnimatedStyle(() => ({
                  transform: [{ scale: tabScales[index].value }],
                }));

                return (
                  <Animated.View key={tab.name} style={[styles.tab, animatedTabStyle]}>
                    <TouchableOpacity
                      style={styles.tabButton}
                      onPress={() => handleTabPress(tab.route, index)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.iconContainer,
                        isActive && {
                          backgroundColor: isDark 
                            ? 'rgba(184, 197, 184, 0.15)' 
                            : 'rgba(184, 197, 184, 0.2)',
                        }
                      ]}>
                        <IconSymbol
                          name={tab.icon}
                          size={isActive ? 24 : 22}
                          color={isActive ? currentColors.sage : currentColors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.label,
                          {
                            color: isActive ? currentColors.text : currentColors.textSecondary,
                            fontWeight: isActive ? '700' : '500',
                            fontSize: isActive ? 11 : 10,
                          },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </BlurView>
        ) : (
          <View style={[
            styles.content, 
            { 
              backgroundColor: currentColors.card,
              borderWidth: 1.5,
              borderColor: currentColors.border,
            }
          ]}>
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: (containerWidth - 20) / tabs.length - 10,
                  backgroundColor: currentColors.sage,
                },
                indicatorStyle,
              ]}
            />
            {tabs.map((tab, index) => {
              const isActive = pathname.includes(tab.route);
              
              const animatedTabStyle = useAnimatedStyle(() => ({
                transform: [{ scale: tabScales[index].value }],
              }));

              return (
                <Animated.View key={tab.name} style={[styles.tab, animatedTabStyle]}>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => handleTabPress(tab.route, index)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.iconContainer,
                      isActive && {
                        backgroundColor: 'rgba(184, 197, 184, 0.2)',
                      }
                    ]}>
                      <IconSymbol
                        name={tab.icon}
                        size={isActive ? 24 : 22}
                        color={isActive ? currentColors.sage : currentColors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isActive ? currentColors.text : currentColors.textSecondary,
                          fontWeight: isActive ? '700' : '500',
                          fontSize: isActive ? 11 : 10,
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
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
    boxShadow: '0px 10px 40px rgba(45, 45, 45, 0.15)',
    elevation: 8,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: 'relative',
    borderRadius: 30,
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    top: '10%',
    left: 15,
    borderRadius: 22,
    opacity: 0.25,
  },
  tab: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  label: {
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
