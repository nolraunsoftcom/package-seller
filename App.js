import messaging from '@react-native-firebase/messaging';
import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  AppState,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {PERMISSIONS, request, requestMultiple} from 'react-native-permissions';
import SplashScreen from 'react-native-splash-screen';
import {WebView} from 'react-native-webview';
import PushNotification from 'react-native-push-notification';
import VersionCheck from 'react-native-version-check';
import Geolocation from '@react-native-community/geolocation';
import {displayNotification} from './src/utils/displayNotification';
import notifee, {EventType} from '@notifee/react-native';

const w = Dimensions.get('window').width;

export default function App() {
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('앱 상태 변경:', nextAppState);
      if (nextAppState === 'active') {
        //PushNotification.setApplicationIconBadgeNumber(0);
      }
    };

    // AppState 변경 이벤트에 대한 리스너 등록
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // 컴포넌트가 unmount 될 때 리스너 정리
    return () => {
      subscription.remove();
    };
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때만 실행

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
    console.log(event.url);
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
    console.log('event.nativeEvent.data', event.nativeEvent.data);

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
  const [loading, setloading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      notifee.setBadgeCount(0);
      SplashScreen.hide();

      setloading(false);
    }, 3000);
  }, []);
  /////////메시지받기
  const getmessage = async () => {
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        if (remoteMessage.data) {
          if (remoteMessage.data.badge) {
            notifee
              .setBadgeCount(Number(remoteMessage.data.badge || 0))
              .then(console.log);
          }

          if (remoteMessage.data.click_action) {
            console.log('onNotificationOpenedApp');
            const newsourceUrl =
              'https://ten.members.markets' + remoteMessage.data.click_action;
            myWebWiew.current.injectJavaScript(`
              window.location.href = "${newsourceUrl}";
            `);
          }
        }
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          if (remoteMessage.data) {
            if (remoteMessage.data.badge) {
              notifee.setBadgeCount(Number(remoteMessage.data.badge || 0));

              PushNotification.setApplicationIconBadgeNumber(
                parseInt(remoteMessage.data.badge),
              );
            }

            if (remoteMessage.data.click_action) {
              console.log(
                'getInitialNotification',
                remoteMessage.data.click_action,
              );
              const newsourceUrl =
                'https://ten.members.markets' + remoteMessage.data.click_action;

              setsourceUrl(newsourceUrl);
              myWebWiew.current.injectJavaScript(`
                  window.location.href = "${newsourceUrl}";
                `);
            }
          }
        }
      });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification?.body) {
        displayNotification(remoteMessage).then(res => {});
      }

      if (remoteMessage.data) {
        if (remoteMessage.data.badge) {
          notifee
            .setBadgeCount(Number(remoteMessage.data.badge || 0))
            .then(console.log);
          PushNotification.setApplicationIconBadgeNumber(
            parseInt(remoteMessage.data.badge),
          );
        }
      }
    });

    return unsubscribe;
  };
  //////////
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
        const authorizationStatus = await messaging().requestPermission();
        const enabled =
          authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authorizationStatus);
        }
        {
        }
      }
    } catch (error) {
      console.log('권한이 없습니다.', error);
    }
  }

  useEffect(() => {
    requestUserPermission();
    getmessage();

    if (Platform.OS === 'ios') {
      const requestPhotoLibraryPermission = async () => {
        const platformPermissions = await request(
          PERMISSIONS.IOS.LOCATION_ALWAYS,
        );
      };
      requestPhotoLibraryPermission();
    }
  }, []);

  const injectJavaScript = `
    console.log = function(message) {
      window.ReactNativeWebView.postMessage('CONSOLE_LOG: ' + message);     
    };
  `;

  useEffect(() => {
    notifee.onBackgroundEvent(async event => {
      if (event.detail.notification?.data.badge) {
        notifee
          .setBadgeCount(Number(event.detail.notification?.data.badge || 0))
          .then(console.log);
      }
      if (event.detail.notification?.data.click_action) {
        console.log('onBackgroundEvent');
        const newsourceUrl =
          'https://ten.members.markets' +
          event.detail.notification?.data.click_action;
        myWebWiew.current.injectJavaScript(`
            window.location.href = "${newsourceUrl}";
          `);
      }
    });

    return notifee.onForegroundEvent(({type, detail}) => {
      if (detail.notification?.data.badge) {
        notifee
          .setBadgeCount(Number(detail.notification?.data.badge || 0))
          .then(console.log);
      }

      if (type === EventType.PRESS) {
        notifee.decrementBadgeCount();

        if (detail.notification?.data.click_action) {
          console.log('onForegroundEvent');
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
        //injectedJavaScript={injectJavaScript}
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
