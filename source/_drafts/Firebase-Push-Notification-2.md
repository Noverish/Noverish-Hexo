---
layout: post
title: Kotlin과 Firebase를 사용하여 Android에 푸쉬 알림 보내기 - 서버편
date: 2018-01-08 19:34:20 +0900
description: Template description
thumbnail: /thumbnails/kotlin-firebase.jpg
category: 'android'
tags:
- android
- kotlin
- firebase
- fcm
twitter_text: template twitter_text
---

Kotlin과 Firebase를 사용하여 Android에 푸쉬 알림 보내기 - 서버편

<!-- more -->

### 1\. FCM Server Side 설명

이제 Firebase 콘솔이 아니라 다른 방법으로 푸쉬 알림을 보내는 방법에 대해 설명하도록 하겠습니다.    
다음과 같은 방법이 있습니다.

1. Firebase Admin Node.js SDK 사용하기
1. FCM HTTP v1 API (새로 나온 HTTP Request 방법)
1. Legacy HTTP protocol (예전에 사용하던 HTTP Request 방법)
1. Legacy XMPP Protocol

여기서는 2번 방법을 사용해 보도록 하겠습니다.

### 2\. Firebase Cloud Messaging 켜기

![image002](002.jpg)
[Google Cloud 콘솔](https://console.cloud.google.com/)로 들어갑니다.    
여기 `Project ID`를 기억해 둡시다 뒤에 푸쉬를 보낼 때 쓰입니다.    
위와 같이 프로젝트가 `FCMExample`로 되어 있는지 확인하고 만약에 아니라면 프로젝트 이름을 클릭합니다.

![image003](003.jpg)
`FCMExample`를 클릭하고 프로젝트를 열립니다.

<img src="004.jpg" width="400">
위와 같이 클릭합니다.

![image005](005.jpg)
`ENABLE APIS AND SERVICES`를 클릭합니다.

![image006](006.jpg)
`Firebase Cloud Messaging`을 입력합니다.

![image007](007.jpg)
`Firebase Cloud Messaging`을 클릭합니다.

![image008](008.jpg)
`ENABLE`을 클릭합니다.

![image009](009.jpg)
위와 같은 화면이 나오면 성공입니다.

### 3\. HTTP Request Authentication

![image000](000.jpg)
[Firebase 콘솔](https://console.firebase.google.com)로 들어가서 설정 - `SERVICE ACCOUNTS` - `GENERATE NEW PRIVATE KEY`를 누릅니다.

<img src="001.jpg" width="500">
`GENERATE KEY`를 누릅니다.    
파일 이름을 `service-account.json`으로 합니다.    
이 json 파일을 통해 HTTP Request에 쓰일 access token를 생성해야 합니다.
찾는 방법은 여러 가지가 있는데 우리는 Python으로 하도록 하겠습니다.
Nodejs나 Java를 이용한 방법은 [문서](https://firebase.google.com/docs/cloud-messaging/auth-server)를 참고해 주세요

```shell
pip install --upgrade google-api-python-client
```
위의 명령어로 google-api-python-client를 설치합니다.

```python
from oauth2client.service_account import ServiceAccountCredentials

scopes = ['https://www.googleapis.com/auth/firebase.messaging']

def _get_access_token():
    credentials = ServiceAccountCredentials.from_json_keyfile_name('service-account.json', scopes)
    access_token_info = credentials.get_access_token()
    return access_token_info.access_token
```
위와 같은 코드로 access token을 알아냅니다.

### 4\. HTTP Request 보내기

저는 HTTP Request를 Postman으로 보냈습니다.
자유롭게 원하시는 방법으로 보내셔도 됩니다.

정확한 HTTP Request의 내용는 다음과 같습니다.

![image011](011.jpg)
![image012](012.jpg)

```
POST
https://fcm.googleapis.com/v1/projects/아까 그 project ID/messages:send

headers = {
  "Authorization": "Bearer " + 아까 그 access token,
  "Content-Type": "application/json; UTF-8",
}

body = {
    "message": {
        "token":"기기의 token 값",
        "notification": {
            "body": "This is an FCM notification message!",
            "title": "FCM Message"
        }
    }
}
```

위와 같이 HTTP Request를 하시면 성공적으로 앱에 푸쉬 알림이 도착합니다.

### 5\. Android에서의 알림 종류

Android에서는 notification 알림과 data 알림이 있습니다.   

```
body = {
    "message": {
        "token":"기기의 token 값",
        "notification": {
            "body": "This is an FCM notification message!",
            "title": "FCM Message"
        }
    }
}
```
이렇게 보내면 notification 알림이고

```
body = {
    "message": {
        "token":"기기의 token 값",
        "data": {
            "body": "This is an FCM notification message!",
            "title": "FCM Message"
        }
    }
}
```
이렇게 보내면 data 알림입니다.

데이터는 `com.google.firebase.messaging.RemoteMessage` 객체에서
각각 `notification` 과 `data` 로 접근 가능 합니다.

notification 알림은 앱이 백그라운드에 있을 때 알림을 내부로 넘기지 않고
`title` 과 `body` 값을 읽어내 알아서 기기에 알림을 띄웁니다.
즉 `FirebaseMessagingService` 의 `onMessageReceived()`가 실행 되지 않는 다는 말이죠.

앱이 백그라운드가 아닐 때는 똑같이 `FirebaseMessagingService` 의 `onMessageReceived()`가 실행이 됩니다.
