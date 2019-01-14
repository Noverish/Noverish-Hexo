---
layout: post
title: 웹에 있는 오디오 재생하기
date: 2017-11-20 20:24:48 +0900
description: Template description
thumbnail: /thumbnails/swift.jpg
category: 'swift'
tags:
- ios
- swift
- audio
twitter_text: template twitter_text
---

웹에 있는 오디오를 재생하는 방법을 알아보자

<!-- more -->

![image001](001.jpg)

1\. 프로젝트의 `Info.plist`에 `App Transport Security Settings`를 추가합니다. 그리고 그 안에 `Allow Arbitrary Loads`를 추가하고 그 값을 `YES`로 바꿔줍니다.

```swift
import UIKit
import AVFoundation

class ViewController: UIViewController {
    var player = AVPlayer()

    override func viewDidLoad() {
        let url = "http://radio.spainmedia.es/wp-content/uploads/2015/12/tailtoddle_lo4.mp3"
        let playerItem = AVPlayerItem(url: NSURL(string: url)! as URL)
        player = AVPlayer(playerItem: playerItem)
        player.play()
    }
}
```

2\. 위와 같이 하면 저 URL의 mp3파일이 재생됩니다.
