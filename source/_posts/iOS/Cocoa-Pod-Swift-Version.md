---
layout: post
title: 낮은 Swift 버전을 쓰는 라이브러리 CocoaPod에서 사용하기
date: 2018-01-22 19:50:44 +0900
cover: /covers/swift.jpg
disqusId: 931fa39c581edda09d283e0ecf69b7f64864d57a
toc: true
category: iOS
tags:
- swift
- cocoapod
---

내 프로젝트의 swift 버전 보다 낮은 버전으로 작성 되어 있는 외부 라이브러리를 사용하고 싶을 때 어떻게 해야 하는 지 알아보자

<!-- more -->

```
  pod 'LibraryName1'
  pod 'LibraryName2'

  post_install do |installer|
      # Your list of targets here.
      myTargets = ['LibraryName1', 'LibraryName2']

      installer.pods_project.targets.each do |target|
          if myTargets.include? target.name
              target.build_configurations.each do |config|
                  config.build_settings['SWIFT_VERSION'] = '3.2'
              end
          end
      end
  end
```

LibraryName1, LibraryName2를 자신이 원하는 라이브러리 이름으로 바꾸면 된다.    
