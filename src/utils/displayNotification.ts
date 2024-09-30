import notifee, {AndroidImportance} from '@notifee/react-native';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

const displayNotification = async (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'channel',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'noti_sound',
  });

  await notifee.displayNotification({
    title: message?.notification?.title,
    body: message?.notification?.body,
    data: message.data,
    android: {
      sound: 'noti_sound',
      channelId,
      pressAction: {
        launchActivity: 'default',
        id: 'default',
      },
    },
    ios: {
      sound: 'noti_sound.wav',
      foregroundPresentationOptions: {
        badge: false,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });

  await notifee.incrementBadgeCount();
};

export {displayNotification};
