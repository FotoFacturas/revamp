import './gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

global.APP_VERSION = '3.0.28';

global._try = (func, fallbackValue) => {
  try {
    var value = func();
    return value === null || value === undefined ? fallbackValue : value;
  } catch (e) {
    return fallbackValue;
  }
};

AppRegistry.registerComponent(appName, () => App);
