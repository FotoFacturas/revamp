import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, Animated} from 'react-native';
import {Dimensions} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const {width, height} = Dimensions.get('window');

const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => (shortDimension / guidelineBaseWidth) * size;

const verticalScale = size => (longDimension / guidelineBaseHeight) * size;

const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const moderateVerticalScale = (size, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

const s = scale;
const vs = verticalScale;
const ms = moderateScale;
const mvs = moderateVerticalScale;

export const BUTTON_HEIGHT = s(50);
export const ANIM_CONFIG = {duration: 80, useNativeDriver: true};

export default function MainButton({
  label,
  type = 'primary',
  testID,
  disabled = false,
  callback,
  userPressStyle,
  userViewStyle,
  userSecondViewStyle,
  children,
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animate(-2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function animate(toValue) {
    Animated.timing(translateY, {
      toValue,
      ...ANIM_CONFIG,
    }).start();
  }

  function onPressIn() {
    animate(2);
  }

  function onPressOut() {
    animate(-2);
    callback();
  }

  if (disabled) {
    return (
      <View style={userPressStyle ? userPressStyle : {}}>
        <View style={[styles.mainGrap, userViewStyle ? userViewStyle : {}]}>
          <Animated.View
            style={[
              type === 'primary'
                ? styles.mainButton
                : styles.mainButtonSecondary,
              {transform: [{translateY}], backgroundColor: colors?.primary?.[300] || '#C4B5FD'},
              userSecondViewStyle ? userSecondViewStyle : {},
            ]}>
            {children ? (
              children
            ) : (
              <Text
                style={
                  type === 'primary'
                    ? styles.btnLabel
                    : styles.btnLabelSecondary
                }>
                {label}
              </Text>
            )}
          </Animated.View>
          <View
            style={[
              type === 'primary'
                ? styles.background
                : styles.backgroundSecondary,
              {backgroundColor: colors?.primary?.[400] || '#A78BFA'},
            ]}
          />
        </View>
      </View>
    );
  } else {
    return (
      <Pressable
        {...{onPressIn, onPressOut, testID}}
        style={userPressStyle ? userPressStyle : {}}>
        <View style={[styles.mainGrap, userViewStyle ? userViewStyle : {}]}>
          <Animated.View
            style={[
              type === 'primary'
                ? styles.mainButton
                : styles.mainButtonSecondary,
              {transform: [{translateY}]},
              userSecondViewStyle ? userSecondViewStyle : {},
            ]}>
            {children ? (
              children
            ) : (
              <Text
                style={
                  type === 'primary'
                    ? styles.btnLabel
                    : styles.btnLabelSecondary
                }>
                {label}
              </Text>
            )}
          </Animated.View>
          <View
            style={
              type === 'primary'
                ? styles.background
                : styles.backgroundSecondary
            }
          />
        </View>
      </Pressable>
    );
  }
}

// Colores actualizados para usar el sistema de tema correcto
const localColors = {
  gray: colors?.gray?.[200] || '#E5E7EB',
  grayDark: colors?.gray?.[400] || '#9CA3AF',
  red: colors?.error?.[500] || '#EF4444',
  black: colors?.text?.primary || '#111827',
  purple: colors?.primary?.[500] || '#5B22FA', // Color principal morado
  purpleDark: colors?.primary?.[600] || '#481ECC', // Sombra más oscura
  white: colors?.white || '#FFFFFF',
  orange: colors?.warning?.[400] || '#FBBF24',
};

const fonts = {
  title: {
    fontSize: ms(22),
    fontWeight: typography?.fontWeight?.bold || '700',
    color: localColors.black,
  },
  iconLabel: {
    fontSize: ms(16),
    fontWeight: typography?.fontWeight?.bold || '700',
    color: localColors.black,
  },
  activityLabel: {
    fontSize: ms(14),
    fontWeight: typography?.fontWeight?.bold || '700',
    color: localColors.black,
  },
  btnLabel: {
    fontSize: s(16), // Aumentado de 15 a 16
    fontWeight: typography?.fontWeight?.bold || '700',
    color: localColors.black,
  },
};

const styles = StyleSheet.create({
  mainDisabledButton: {
    width: '100%',
    height: BUTTON_HEIGHT,
    borderRadius: borderRadius?.md || 8,
    backgroundColor: colors?.primary?.[300] || '#C4B5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabledLabel: {
    ...fonts.btnLabel,
    color: colors?.text?.inverse || '#FFFFFF',
  },
  mainGrap: {
    height: BUTTON_HEIGHT,
  },
  background: {
    backgroundColor: localColors.purpleDark, // Sombra morada oscura
    width: '100%',
    height: BUTTON_HEIGHT - 2,
    borderRadius: borderRadius?.md || 8,
    position: 'absolute',
    zIndex: -1,
    bottom: 0,
  },
  mainButton: {
    backgroundColor: localColors.purple, // Botón primario morado
    width: '100%',
    height: BUTTON_HEIGHT - 2,
    borderRadius: borderRadius?.md || 8,
    paddingHorizontal: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundSecondary: {
    backgroundColor: localColors.gray, // Sombra gris
    width: '100%',
    height: BUTTON_HEIGHT - 2,
    borderRadius: borderRadius?.md || 8,
    position: 'absolute',
    zIndex: -1,
    bottom: 0,
  },
  mainButtonSecondary: {
    width: '100%',
    height: BUTTON_HEIGHT - 2,
    borderRadius: borderRadius?.md || 8,
    paddingHorizontal: ms(16),
    backgroundColor: localColors.white,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: localColors.gray,
    alignItems: 'center',
  },
  btnLabel: {
    ...fonts.btnLabel,
    color: localColors.white, // Texto blanco en botón primario
  },
  btnLabelSecondary: {
    ...fonts.btnLabel,
    color: localColors.purple, // Texto morado en botón secundario
  },
});
