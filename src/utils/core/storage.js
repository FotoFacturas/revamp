// src/utils/core/storage.js
// Helpers para AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guardar datos en AsyncStorage
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

/**
 * Obtener datos de AsyncStorage
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

/**
 * Remover datos de AsyncStorage
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Limpiar todos los datos de AsyncStorage
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Obtener todas las keys de AsyncStorage
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/**
 * Obtener múltiples items de AsyncStorage
 */
export const getMultipleData = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
  } catch (error) {
    console.error('Error getting multiple data:', error);
    return [];
  }
};

/**
 * Guardar múltiples items en AsyncStorage
 */
export const setMultipleData = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error setting multiple data:', error);
    return false;
  }
}; 