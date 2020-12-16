---
layout: post
title: 커스텀 뷰 만드는 법
date: 2017-05-14 13:14:42 +0900
cover: /covers/swift.jpg
disqusId: 5a1ec816d52815d64633d7cf93022ecd3391855b
toc: true
category: iOS
tags:
- ios
- swift
- view
---

iOS에서 커스텀 뷰를 만드는 방법을 알아보자

<!-- more -->

![figure 1](001.jpg)

먼저 Cocoa Touch Class 새로운 파일을 하나 만듭니다.

![image002](002.jpg)

원하는 커스텀 뷰의 이름을 넣습니다. 여기서는 TestView라고 했습니다.

![image003](003.jpg)

그 다음 새로운 xib 파일을 하나 만듭니다.

![image004](004.jpg)

이 xib 파일의 이름도 아까와 같은 이름으로 해줍시다. 반드시 그래야 되는 건 아닌데 안 헷갈리기 위해 같게 해줍시다.

![image005](005.jpg)

File's Owner를 클릭한 다음에 아까 만들었던 Cocoa Touch Class 파일의 이름을 적습니다

![image006](006.jpg)

그런데 지금은 root 뷰의 크기를 바꿀 수가 없습니다. root 뷰의 Property의 Size를 Freedom으로 바꿔줍시다. 그러면 root뷰의 크기를 바꿀 수 있습니다. 그 다음 자유롭게 root 뷰의 내용을 채워줍시다.

```swift
import UIKit

class TestView: UIView {
    //코드에서 뷰를 생성할 때 호출 됨
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    //storyboard에 뷰를 사용할 때 호출 됨
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }

    func setup() {
        let view = Bundle.main.loadNibNamed("TestView", owner: self, options: nil)?.first as! UIView
        view.frame = bounds
        addSubview(view)

        //여기에 필요한 작업을 하세요
    }
}
```

아까만든 swift 파일을 다음과 같이 채워줍시다. instanceFromNib 메서드의 nibName는 우리가 만든 xib파일의 이름과 같게 해줍시다. 이러면 커스텀 뷰 만들기 끝입니다.

![image008](008.jpg)

storyboard에서 우리가 만든 뷰를 사용 하려면 위와 같이 해줍시다.

<img src="009.jpg" alt="image009" width="50%">

확인

![image010](010.jpg)

TableViewCell에서 했듯이 이렇게 화면 2개로 해서 코드에서 UI들을 다룰 수 있습니다.
