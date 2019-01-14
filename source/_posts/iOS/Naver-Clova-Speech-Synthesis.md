---
layout: post
title: iOS에서 Naver Clova Speech Synthesis(CSS) 사용하기
date: 2017-11-21 12:54:38 +0900
description: Template description
thumbnail: /thumbnails/swift-clova.jpg
category: 'swift'
tags:
- ios
- swift
- naver
- clova-speech-synthesis
twitter_text: template twitter_text
---

iOS에서 Naver Clova Speech Synthesis(CSS) 사용해서 audio를 text로 바꾸는 방법을 알아보자

<!-- more -->

![image001](001.jpg)

1\. `CSSTest`라는 이름의 프로젝트를 만듭니다. 여기서 Bundle Identifier는 뒤에서 쓰이니 기억해둡시다.

![image002](002.jpg)

2\. [네이버 개발자 센터](https://developers.naver.com/main/)에 가서 새로운 어플리케이션을 등록하는 페이지로 갑니다.

![image003](003.jpg)

3\. 휴대폰 인증을 하고 회사 이름은 아무거나 적어줍시다.

![image004](004.jpg)

4\. 어플리케이션 이름은 아무거나 적어도 상관 없습니다. 저는 `CSSTest` 라고 적었습니다. 그리고 사용 API에 `Clova Speech Synthesis`를 선택하고 iOS환경을 추가해서 1번의 Bundle Identifier를 적습니다.

![image005](005.jpg)

5\. 그러고 나면 이렇게 Client ID와 Client Secret이 보이는 페이지로 넘어갑니다. 이 두 개는 뒤에서 쓰이니 기억해둡시다.

```swift
import UIKit
import Alamofire
import AVFoundation

class ViewController: UIViewController {

    let URL = "https://openapi.naver.com/v1/voice/tts.bin"
    let headers: HTTPHeaders = [
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Naver-Client-Id": "아까 봤던 Client ID",
        "X-Naver-Client-Secret": "아까 봤던 Client Secret"
    ]
    let parameters: Parameters = [
        "speaker": "clara",
        "speed": 0,
        "text": "hello, world."
    ]

    var player = AVPlayer()

    override func viewDidLoad() {
        super.viewDidLoad()

        Alamofire.request(URL, method: .post, parameters: parameters, headers: headers).response { response in
            guard let data = response.data as NSData? else { return }

            let audioFileURL = self.save(data: data, fileName: "css.mp3")
            let playerItem = AVPlayerItem(url: audioFileURL as URL)
            self.player = AVPlayer(playerItem:playerItem)
            self.player.play()
        }
    }

    func save(data: NSData, fileName: String) -> NSURL {
        let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0] as String
        let fullPath:String = (path as NSString).appendingPathComponent(fileName)
        data.write(toFile: fullPath, atomically: true)
        return NSURL(fileURLWithPath: fullPath)
    }
}
```

6\. 아까 만들었던 프로젝트의 `ViewController`에 위와 같이 적어줍시다.

`X-Naver-Client-Id`와 `X-Naver-Client-Secret`에 위에서 봤던 Client ID와 Client Secret을 각각 적어줍니다.

저는 Alamofire를 이용해서 mp3파일을 받아왔습니다. 다른 방법을 사용해도 상관 없습니다.

위 코드는 받은 mp3파일을 css.mp3로 앱 내 documentDirectory에 저장 후 재생하는 코드입니다.

이제 앱을 실행하면 "hello, world" 라는 clara의 목소리가 들릴 것입니다.
