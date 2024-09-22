import messaging from '@react-native-firebase/messaging';
import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {PERMISSIONS, request, requestMultiple} from 'react-native-permissions';
import SplashScreen from 'react-native-splash-screen';
import {WebView} from 'react-native-webview';
import VersionCheck from 'react-native-version-check';
import Geolocation from '@react-native-community/geolocation';
import {displayNotification} from './src/utils/displayNotification';
import notifee, {EventType} from '@notifee/react-native';

export default function App() {
  const myWebWiew = useRef();
  const [sourceUrl, setsourceUrl] = useState('https://ten.members.markets');
  const [pays, setpays] = useState([
    'supertoss://',
    'kb-acp://',
    'liivbank:/',
    'newliiv://',
    'kbbank://',
    'nhappcardansimclick://',
    'nhallonepayansimclick://',
    'nonghyupcardansimclick://',
    'lottesmartpay://',
    'lotteappcard://',
    'mpocket.online.ansimclick://',
    'ansimclickscard://',
    'tswansimclick://',
    'ansimclickipcollect://',
    'vguardstart://',
    'samsungpay://',
    'scardcertiapp://',
    'shinhan-sr-ansimclick://',
    'smshinhanansimclick://',
    'com.wooricard.wcard://',
    'newsmartpib://',
    'citispay://',
    'citicardappkr://',
    'citimobileapp://',
    'cloudpay://',
    'hanawalletmembers://',
    'hdcardappcardansimclick://',
    'smhyundaiansimclick://',
    'shinsegaeeasypayment://',
    'payco://',
    'lpayapp://',
    'ispmobile://',
    'tauthlink://',
    'ktauthexternalcall://',
    'upluscorporation://',
  ]);

  const onShouldStartLoadWithRequest = event => {
    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      return true;
    }

    if (event.url.startsWith('sms:')) {
      Linking.openURL(event.url);
      return false;
    }

    if (event.url.startsWith('intent://')) {
      Linking.openURL(event.url);
      return false;
    }
    if (event.url.startsWith('kakaotalk://')) {
      // 외부 브라우저로 연결
      Linking.openURL(event.url);
      return false; // 웹뷰에서 로드를 중지합니다.
    }
    if (event.url.startsWith('tel:')) {
      // 외부 브라우저로 연결
      Linking.openURL(event.url);
      return false; // 웹뷰에서 로드를 중지합니다.
    }
    if (pays.indexOf(event.url.split('//')[0] + '//') !== -1) {
      Linking.openURL(event.url);
      return false; // 웹뷰에서 로드를 중지합니다.
    }
    return true; // 다른 URL은 웹뷰 내에서 계속 로드됩니다
  };

  const onMessageReceived = async event => {
    // 객체를 JSON 문자열로 변환하여 출력
    try {
      const parsedObject = JSON.parse(event.nativeEvent.data);

      const MemberId = parsedObject[0];
      const local_info = parsedObject[1];
      const local_info_confirm = parsedObject[2];

      messaging()
        .getToken()
        .then(async token => {
          console.log('token', token);
          VersionCheck.needUpdate().then(async res => {
            console.log('res', res.isNeeded);
            const sAppType =
              Platform.OS +
              '_currentVersion:' +
              res.currentVersion +
              '_latestVersion:' +
              res.latestVersion;

            const sId = '';
            const sUId = '';
            const sDeviceUId = MemberId;
            const sPushToken = token;
            myWebWiew.current.injectJavaScript(`
      appLoginComplete('${sAppType}', '${sId}', '${sUId}', '${sDeviceUId}', '${sPushToken}');
  `);

            if (res.isNeeded) {
              const anurl =
                'https://play.google.com/store/apps/details?id=com.orora.tenpercent';
              const iosurl =
                'https://apps.apple.com/us/app/ten-percent-텐퍼센트/id6475812515';
              const gourl = Platform.OS === 'android' ? anurl : iosurl;
              Alert.alert(
                '앱이 최신버전이 아닙니다.',
                '앱을 최신버전으로 업데이트 하시겠습니까?',
                [
                  {
                    text: '아니요',
                    onDismiss: () => {},
                  },
                  {
                    text: '네',
                    onPress: () => Linking.openURL(res.storeUrl),
                  },
                ],
              );
            }
          });
        });
    } catch (error) {
      // JSON으로 파싱할 수 없는 경우 그대로 출력
      console.log(event.nativeEvent.data);
    }
  };

  //////////////////////Back button control
  const [exit, setexit] = useState(false);
  const [swexit, setswexit] = useState(0);
  const backAction = () => {
    // 500(0.5초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    setswexit(swexit => swexit + 1);
    return true;
  };
  useEffect(() => {
    let timer;
    if (exit === false) {
      myWebWiew?.current?.goBack();
      setexit(true);
      timer = setTimeout(function () {
        setexit(false);
      }, 500);
    } else {
      clearTimeout(timer);
      BackHandler.exitApp();
    }
  }, [swexit]);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  /////////////////////////////
  /////////로딩화면 길게

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, []);
  /////////메시지받기

  const getmessage = async () => {
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage?.data?.click_action) {
        console.log('onNotificationOpenedApp');
        const newsourceUrl =
          'https://ten.members.markets' + remoteMessage.data.click_action;
        myWebWiew.current.injectJavaScript(`
              window.location.href = "${newsourceUrl}";
            `);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage?.data?.click_action) {
          const newsourceUrl =
            'https://ten.members.markets' + remoteMessage.data.click_action;
          setsourceUrl(newsourceUrl);
          myWebWiew.current.injectJavaScript(`
                  window.location.href = "${newsourceUrl}";
                `);
        }
      });

    return messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification?.body) {
        displayNotification(remoteMessage).then(res => {});
      }

      if (remoteMessage?.data?.badge) {
        notifee
          .setBadgeCount(Number(remoteMessage.data.badge || 0))
          .then(() => {
            console.log('remoteMessage', Platform.OS, remoteMessage.data);
          });
      }
    });
  };

  async function requestUserPermission() {
    try {
      if (Platform.OS === 'android') {
        requestMultiple([
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.CALL_PHONE,
        ]).then(statuses => {
          console.log(statuses);
        });
      } else {
        await messaging().requestPermission();
        await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      }
    } catch (error) {}
  }

  useEffect(() => {
    requestUserPermission();
    getmessage();
  }, []);

  useEffect(() => {
    return notifee.onForegroundEvent(async ({type, detail}) => {
      const {notification, pressAction} = detail;

      if (
        type === EventType.PRESS ||
        (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read')
      ) {
        await notifee.decrementBadgeCount();
        await notifee.cancelNotification(notification.id);

        if (detail.notification?.data.click_action) {
          const newsourceUrl =
            'https://ten.members.markets' +
            detail.notification?.data.click_action;
          myWebWiew.current.injectJavaScript(`
              window.location.href = "${newsourceUrl}";
            `);
        }
      }
    });
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        javaScriptEnabled={true}
        style={{flex: 1}}
        ref={myWebWiew}
        originWhitelist={['*']}
        source={{uri: sourceUrl}}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        injectedJavaScript={``}
        androidHardwareAccelerationDisabled={true}
        onShouldStartLoadWithRequest={event => {
          return onShouldStartLoadWithRequest(event);
        }}
        onMessage={onMessageReceived}
        onLoad={() => {
          messaging()
            .getToken()
            .then(async token => {
              console.log('token', token);
              myWebWiew.current.injectJavaScript(`
          localStorage.setItem('pushid', '${token}');
          window.isWebview = true;
        `);
            });
          VersionCheck.needUpdate().then(async res => {
            const sAppType = res.currentVersion;

            myWebWiew.current.injectJavaScript(`
          localStorage.setItem('appversion', '${sAppType}');
        `);
          });
          Geolocation.getCurrentPosition(info => {
            myWebWiew.current.injectJavaScript(`
          localStorage.setItem('location', '${JSON.stringify(info.coords)}');
        `);
          });
        }}
        onContentProcessDidTerminate={() => {
          myWebWiew.current?.reload();
        }}
      />
      <StatusBar
        animated={true}
        backgroundColor="white"
        translucent={false}
        hidden={false}
        barStyle="dark-content"
      />
    </SafeAreaView>
  );
}
