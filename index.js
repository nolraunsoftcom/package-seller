/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {firebase} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

firebase.messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage?.notification?.body) {
    await notifee.displayNotification(remoteMessage);
    await notifee.incrementBadgeCount();
  }
});

notifee.onBackgroundEvent(async event => {
  const {type, detail} = event;
  const {notification, pressAction} = detail;
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    await notifee.decrementBadgeCount();
    await notifee.cancelNotification(notification.id);
  }
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
