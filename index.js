/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {firebase} from '@react-native-firebase/messaging';
import notifee, {EventType, AndroidImportance} from '@notifee/react-native';

firebase.messaging().setBackgroundMessageHandler(async remoteMessage => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'channel',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'noti_sound',
  });

  const android = Object.assign(remoteMessage.notification.android, {
    sound: 'noti_sound',
    channelId,
  });

  remoteMessage.android = android;
  await notifee.displayNotification({
    remoteMessage,
  });
  // await notifee.incrementBadgeCount();
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
