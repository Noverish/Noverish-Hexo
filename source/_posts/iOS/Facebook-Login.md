---
layout: post
title: Facebook으로 로그인하기
date: 2018-01-18 21:35:42 +0900
description: Template description
thumbnail: /thumbnails/swift.jpg
category: 'ios'
tags:
- swift
- facebook
twitter_text: template twitter_text
---

Facebook으로 로그인하기

<!-- more -->


### 1\. 앱 기본 설정

![image](000.jpg)
[페이스북 개발자 사이트](https://developers.facebook.com/)에 접속해서 새 앱을 추가합니다.

![image](001.jpg)
자신의 앱 이름을 적고 앱 ID를 만듭니다.

![image](002.jpg)
`Facebook으로 로그인`을 누릅니다.

<img src="003.jpg" width="300">
`설정`을 누릅니다.

![image](004.jpg)
`iOS`를 누릅니다.

![image](005.jpg)
`iOS SDK 다운로드`를 누릅니다.

![image](006.jpg)
다운로드 받은 뒤 압축을 풀면 위와 같은 파일이 들어있습니다.

![image](010.jpg)
`Bolts.framework`, `FBSDKCoreKit.framework`, `FBSDKLoginKit.framework` 을 드래그 앤 드롭해서
`Frameworks` 폴더에 넣어줍니다. 만약에 이 폴더가 없으면 만들어줍니다.

![image](009.jpg)
이 창이 뜰텐데 꼭 `Copy items if needed` 를 체크해줍니다.

![image](011.jpg)
자기 앱의 번들ID를 적고 Save를 누른 뒤 넘어갑니다.

![image](012.jpg)
저 버튼을 클릭해서 활성화 해주고 Save를 누른 뒤 넘어갑니다.

![image](013.jpg)
라고 합니다. 밑에 사진으로 쉽게 설명 드리겠습니다.

<img src="014.jpg" width="400">
이렇게 해서 `Info.plist` 를 코드로 엽니다.

<img src="015.jpg" width="400">
`<dict>` 태그 안에 제일 밑에 사진 같이 붙여 넣습니다.

![image](016.jpg)
objective-c 코드로 되어 있네요. swift 코드는 밑에 써두겠습니다.
`AppDelegate.swift` 에 아래 코드를 써주시면 됩니다.

```swift
//  AppDelegate.swift

import FBSDKCoreKit

func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey : Any]? = nil) -> Bool {
    FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
    // Add any custom logic here.
    return true
}

func application(_ application: UIApplication,
                 open url: URL,
                 options: [UIApplicationOpenURLOptionsKey: Any] = [:]) -> Bool {
    let handled: Bool =
        FBSDKApplicationDelegate
            .sharedInstance()
            .application(application,
                         open: url,
                         sourceApplication: options[.sourceApplication] as? String,
                         annotation: options[.annotation])
    // Add any custom logic here.
    return handled
}
```

위의 두 함수중 밑의 함수는 iOS 10 이상에서만 사용 할 수 있습니다.
따라서 그 밑 버전에서 사용하려면 아래의 코드를 사용해야 합니다.
```swift
func application(_ application: UIApplication,
                 open url: URL,
                 sourceApplication: String?,
                 annotation: Any) -> Bool {
    let handled: Bool =
        FBSDKApplicationDelegate
            .sharedInstance()
            .application(application,
                         open: url,
                         sourceApplication: sourceApplication,
                         annotation: annotation)
    // Add any custom logic here.
    return handled
}
```

![image](017.jpg)
여기까지 앱의 기본 설정을 마쳤습니다.    
위의 7, 8, 9, 10번 단계는 밑에서 설명 하므로 넘어가셔도 됩니다.

### 2\. Facebook 권한 요청

Facebook 아주 기본적인 로그인(userID)을 제외하고 다른 기능을 사용 하려면 로그인 할 때 따로 권한 요청을 해야 합니다.
사용자의 프로필(프로필 사진 등)과 이메일을 얻으려고 하면 따로 권한 요청을 해야 합니다.
사용 가능한 권한은 다음과 같습니다.

![image](026.jpg)

로그인 할 때 권한 요청 하는 방법은 밑에서 다루도록 하겠습니다.    
자세한 사항은 [여기](https://developers.facebook.com/docs/facebook-login/permissions/)
를 참고해 주세요.

### 3\. Facebook SDK 버튼으로 로그인 하기

Facebook SDK에서 제공하는 기본 버튼으로 로그인 하는 방법을 살펴보겠습니다.    
커스텀 버튼으로 로그인 하길 원하시는 분은 건너 뛰셔도 됩니다.

```swift
import FBSDKCoreKit
import FBSDKLoginKit

class UIViewController {
    func viewDidLoad() {
        super.viewDidLoad()

        let loginButton = FBSDKLoginButton()
        loginButton.center = view.center
        loginButton.delegate = self
        loginButton.readPermissions = ["public_profile"]
        view.addSubview(loginButton)
    }
}
```
위와 같이 코드로 버튼을 만들어 주셔도 되고 storyboard로 하셔도 됩니다.    
권한 요청 리스트는 `FBSDKLoginButton`의 `readPermissions`에 String Array로 넣어 주시면 됩니다.    
`FBSDKLoginButton`의 `delegate`는 `FBSDKLoginButtonDelegate`입니다.
자세한 코드는 밑에 있습니다.

```swift
extension UIViewController: FBSDKLoginButtonDelegate {
    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error?) {
        if let error = error {
            print("error : \(error)")
            return
        }

        if result.isCancelled {
            print("cancelled")
        } else {
            print("token \(result.token.userID!)")
        }
    }

    func loginButtonDidLogOut(_ sdkButton: FBSDKLoginButton!) {
        print("loginButtonDidLogOut")
    }

    func loginButtonWillLogin(_ sdkButton: FBSDKLoginButton!) {
        print("loginButtonWillLogin")
    }
}
```
loginButton 함수는 로그인 프로세스가 끝나면 호출 되는 함수입니다.    
loginButtonDidLogOut 함수는 로그아웃이 되면 호출 되는 함수입니다.    
loginButtonWillLogin 함수는 로그인 버튼이 클릭될 때 호출 되는 함수입니다.    

자세한 정보는
[FBSDKLoginButtonDelegate](https://developers.facebook.com/docs/reference/ios/current/protocol/FBSDKLoginButtonDelegate)
와
[FBSDKLoginManagerLoginResult](https://developers.facebook.com/docs/reference/ios/current/class/FBSDKLoginManagerLoginResult/)
를 확인해 주세요

<img src="021.jpg" width="400">
앱을 실행 하면 위와 같은 버튼이 뜹니다.    
이 버튼을 클릭하면 `loginButtonWillLogin` 함수가 호출 됩니다.

<img src="022.jpg" width="400">
버튼을 클릭하면 이런 AlertDialog가 뜹니다.

<img src="023.jpg" width="400">
그리고 로그인 화면으로 연결 됩니다.

<img src="024.jpg" width="400">
로그인하면 이 화면이 뜹니다.

<img src="025.jpg" width="400">
그리고 나면 다시 앱으로 돌아와서 로그인 버튼이 로그아웃 버튼으로 바뀌어 있습니다.
이 버튼을 클릭하면 로그아웃이 되고 `loginButtonDidLogOut` 함수가 호출 됩니다.

### 4\. Custom 버튼으로 로그인 하기

```swift
let fbLoginManager = FBSDKLoginManager()
fbLoginManager.logIn(withReadPermissions: ["public_profile"], from: self) { (result, error) -> Void in
    if let error = error {
        print("error : \(error)")
        return
    }

    if result.isCancelled {
        print("cancelled")
    } else {
        print("token \(result.token.userID!)")
    }
}
```
커스텀 버튼을 만들고 클릭 되면 위의 코드를 실행시키면 됩니다.    
권한 요청 리스트는 `withReadPermissions`에 String Array로 넣어 주시면 됩니다.    
로그아웃은 단순하게 `FBSDKLoginManager`의 `logOut()` 함수를 실행 시키면 됩니다.

```swift
typealias FBSDKLoginManagerRequestTokenHandler = (_ result: FBSDKLoginManagerLoginResult, _ error: Error?) -> Void
```
callback함수인 FBSDKLoginManagerRequestTokenHandler은 위와 같이 정의되어 있습니다.

자세한 정보는
[FBSDKLoginManager](https://developers.facebook.com/docs/reference/ios/current/class/FBSDKLoginManager/)
와
[FBSDKLoginManagerLoginResult](https://developers.facebook.com/docs/reference/ios/current/class/FBSDKLoginManagerLoginResult/)
를 확인해 주세요.

### 5\. 로그인 여부 확인하기

```swift
import FBSDKLoginKit

if let token = FBSDKAccessToken.current() {
    print("token \(token.userID!)")
    // 로그인 되어있음
} else {
    // 로그인 안 되어있음
}
```
위 코드를 사용하면 로그인 여부를 확인 할 수 있습니다.
