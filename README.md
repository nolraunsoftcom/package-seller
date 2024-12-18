# 생활배달 설정 순서

### 1. 프로젝트 ID 변경

- com.orora.\*

### 2. 앱이름 변경

- /android/app/src/main/res/values/strings.xml
- /app.json
- /ios/pungmuprugio/Info.plist

### 앱 아이콘 변경

### 스플레시 이미지 변경

### 파이어베이스 세팅

1. 위 프로젝트 ID로 ios/aos 프로젝트 세팅
2. 각 os별 파일 세팅
3. files내 푸시키 등록

### aos 운영키 등록

```
keytool -genkey -v -keystore orora.keystore -alias orora -keyalg RSA -keysize 2048 -validity 10000
```

~~비밀번호는 주로 프로젝트명+A1! 로 하고있음~~

### gradlew signingReport 등록

### 사운드 등록

---

윗딜브로스 모바일웹
https://witdeal-bros.members.markets

윗딜셀러 모바일웹
https://witdeal-seller.members.markets

윗딜영통신성 모바일웹
https://witdeal-002.members.markets
