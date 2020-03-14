---
layout: post
title: Android에 푸쉬 알림 보내기 - 서버편
date: 2019-01-02 16:10:38 +0900
description: Template description
thumbnail: /thumbnails/firebase-cloud-messaging.jpg
category: 'android'
tags:
- android
- kotlin
- firebase
- fcm
---

Node.js와 Google Firebase를 사용하여 Android에 푸쉬 알림 보내는 방법을 알아보겠습니다 (서버 편)

<!-- more -->

# 1\. Firebase 콘솔에서 비공개 키 받기

![001.jpg](001.jpg)

프로젝트 콘솔페이지에서 설정 - 프로젝트 설정으로 들어갑니다.

![002.jpg](002.jpg)

서비스 계정 탭으로 이동합니다.

![003.jpg](003.jpg)

새 비공개 키 생성을 클릭하여 json 파일을 다운로드 받습니다.

# 2\. Node.js 프로젝트에 Firebase 추가

```shell
$ npm install firebase-admin --save
```

위의 명령어를 통해 npm 프로젝트에 firebase 패키지를 설치 합니다.

```javascript
var admin = require('firebase-admin');

var serviceAccount = require('path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
```

위의 코드를 통해 admin을 초기화 합니다.

# 3\. 개별 기기로 메시지 전송

```javascript
// Registration Token 은 안드로이드 앱에서 나온 Token 입니다.
var registrationToken = 'YOUR_REGISTRATION_TOKEN';

// See documentation on defining a message payload.
var message = {
  data: {
    score: '850',
    time: '2:45'
  },
  token: registrationToken
};

// 메시지를 보냅니다.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

성공적으로 완료되면 `send()` 메소드는 메시지 ID 문자열을 `projects/{project_id}/messages/{message_id}` 형식으로 반환합니다.
그렇지 않은 경우 오류가 표시됩니다. 설명 및 해결 단계가 포함된 전체 오류 코드 목록은 [Admin FCM API 오류](https://firebase.google.com/docs/cloud-messaging/admin/errors)를 참조하세요.

[자세한 문서](https://firebase.google.com/docs/cloud-messaging/admin/send-messages)