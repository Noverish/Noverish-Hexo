---
layout: post
title: Android에 푸쉬 알림 보내기 - 클라이언트편
date: 2019-01-02 14:43:39 +0900
cover: /covers/firebase-cloud-messaging.jpg
disqusId: a4c9faeae146a673e549bf115e7bb0576f72925d
toc: true
category: Android
tags:
- android
- kotlin
- firebase
- fcm
---

Node.js와 Google Firebase를 사용하여 Android에 푸쉬 알림 보내는 방법을 알아보겠습니다 (클라이언트 편)

<!-- more -->

# 1. 안드로이드 프로젝트 생성

<img src="001.jpg" width="auto" style="max-width:600px;" alt="그림 1. 안드로이드 프로젝트 셍성">

안드로이드 프로젝트를 만드는 법은 굳이 설명하지 않도록 하겠습니다.    
여기서 저 `Package Name`은 밑에서 쓰이므로 기억해두세요.

---

# 2. Firebase 프로젝트 생성

<img src="002.jpg" width="auto" alt="그림 2. Firebase Console 화면">

먼저 [Firebase Console](https://console.firebase.google.com)로 들어갑니다.
그런 다음 프로젝트 추가 버튼을 누릅니다.

<img src="003.jpg" width="400" alt="그림 3. Firebase 프로젝트 추가">

프로젝트 이름을 입력하여 프로젝트를 만듭니다.    
저는 간단하게 `FCM-Example`로 했습니다.

---

# 3. Firebase 프로젝트에 안드로에드 앱 추가

<img src="004.jpg" width="400" alt="그림 4. Firebase 프로젝트 추가 후 나오는 화면">

프로젝트가 생성되고 난 뒤 나타난 화면에서 안드로이드 버튼을 눌러 앱을 추가합니다.

<img src="005.jpg" width="400" alt="그림 5. Firebase 프로젝트에 안드로이드 앱 추가">

안드로이드 프로젝트를 생성할 때 나왔던 패키지 이름을 입력합니다.    
앱 닉네임은 적당히 적고 `앱 등록`을 누릅니다.

<img src="006.jpg" width="500" alt="그림 6. google-services.json 파일 다운로드">

그럼 이렇게 구성파일을 다운로드 하라고 하는데 `google-services.json` 파일을 다운로드 한 다음 아래와 같이 app 폴더 안에 넣어줍니다.

<img src="007.jpg" width="500" alt="그림 7. google-services.json 파일 삽입 위치">

<img src="008.jpg" width="400" alt="그림 8. 안드로이드 프로젝트에 Firebase SDK 추가">

위의 지시사항 대로 Firebase SDK를 gradle을 통해 추가 합니다.

<img src="009.jpg" width="600" alt="그림 9. 앱 실행후 Firebase 설치 확인 중">

앱을 실행하여 제대로 설정이 되었는지 확인합니다. 앱이 실행이 되면 자동으로 아래와 같이 바뀝니다.

<img src="010.jpg" width="600" alt="그림 10. 앱 실행후 Firebase 설치 확인 완료">

만약 앱을 실행 시켜도 콘솔로 이동하는 버튼이 활성화 되지 않는 다면 몇 번 더 앱을 재실행 시켜주시면 됩니다.

<img src="011.jpg" width="400" alt="image008">

위와 같이 하면 다음과 같이 앱이 제대로 추가 되어 있는 것을 볼 수 있습니다.

---

# 4. 안드로이드 프로젝트에 코드 작성

```gradle
implementation 'com.google.firebase:firebase-messaging:17.3.3'
```

위의 코드를 통해 fireabse messaging 라이브러리를 설치 합니다 2019-01-02 기준 라이브러리 버전은 17.3.1 입니다.
현재 버전을 알고 싶으면 [여기](https://firebase.google.com/support/release-notes/android)서 확인해 주세요

`MyFirebaseInstanceIDService.kt`를 만들고 아래의 코드를 입력합니다. 

#### MyFirebaseMessagingService.kt
```kotlin
package kim.hyunsub.fcm_example

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String?) {
        super.onNewToken(token)
        
        println("Refreshed token: " + token!!)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage?) {
        super.onMessageReceived(remoteMessage)
    
        remoteMessage?.notification?.let { noti ->
            println("title : ${noti.title}")
            println("body : ${noti.body}")
        }
    }
}
```

- onNewToken(token: String?)
기기의 Firebase Token 값이 변하면(생성되면) 이 메서드가 호출이 됩니다.
이 함수에서 본인의 서버로 token 값을 보내는 코드를 넣어서 이 토큰 값을 가지고 앱에 푸쉬 알림을 보내시면 됩니다.

- onMessageReceived(remoteMessage: RemoteMessage?)
Firebase 서버에서 푸쉬알림을 받으면 이 메서드가 호출이 됩니다.
이 메서드에서 사용자에게 알림을 보내시면 됩니다.

#### AndroidManifest.xml
`AndroidManifest.xml`의 `application`태그 안에 아래를 입력합니다.
```xml
<service
    android:name=".MyFirebaseMessagingService">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT"/>
    </intent-filter>
</service>
```

위의 코드를 전부 작성하고 앱을 실행하면 이렇게 창에 기기 token 값이 생성되서 나옵니다.    
기기에 따라 몇 초에서 몇 분정도는 걸릴 수 있습니다.

---

# 5. 기기 토큰 값 확인

#### MainActivity.kt
```kotlin
FirebaseInstanceId.getInstance().instanceId
    .addOnCompleteListener(OnCompleteListener { task ->
        if (!task.isSuccessful) {
            print("get token failed ${task.exception}")
            return@OnCompleteListener
        }

        val token = task.result!!.token
        print("get token : $token")
    })

```

토큰 값이 생성된 이후에 다시 기기의 token 값을 알아내려면 위의 코드를 통해 알아내시면 됩니다.
