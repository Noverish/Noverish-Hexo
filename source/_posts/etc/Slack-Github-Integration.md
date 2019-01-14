---
layout: post
title: 슬랙과 깃허브 연동하기
date: 2018-07-26 14:15:00 +0900
description: Template description
thumbnail: /thumbnails/slack.jpg
category: 'etc'
tags:
- slack
- github
twitter_text: template twitter_text
---

슬랙과 깃허브 연동하기

<!-- more -->

## 목차
[1\. Slack에 Github 앱 추가하기](#1-Slack에-Github-앱-추가하기)    
[2\. Github Repository와 연동하기](#2-Github-Repository와-연동하기)    
[3\. Slack에서 Github Issue 만들기](#3-Slack에서-Github-Issue-만들기) 

---

### 1\. Slack에 Github 앱 추가하기

먼저 좌상단의 워크스페이스 이름을 클릭한 후 `Administration` - `Manage apps`를 클릭합니다.

---

![](./001.jpg)
`Browse the App Directory`를 누릅니다. 만약 이전에 설치해 놓은 앱이 있으면 아래의 사진과 같이 뜨는데 그러면 `App Directory`를 누릅니다.

![](./022.jpg)

---

![](./002.jpg)
`github`를 검색한 후 맨 처음에 나온 `Github`를 클릭합니다. `Legacy`가 적힌 것은 Enterprise 계정 전용이라고 합니다.

---

![](./003.jpg)
`Install`을 누릅니다.

---

![](./004.jpg)
`Continue`를 누릅니다.

---

<img src="./005.jpg" width="400">
이 Github 앱을 사용할 채널을 선택하는데 저와같이 원하는 채널만 선택하셔도 되고, 모든 채널을 선택하셔도 됩니다.
나중에 채널을 추가 할 수 있습니다. 여기서 선택 되지 않은 채널에서는 Github와의 연동을 할 수 없습니다.

---

![](./006.jpg)
설치를 하게 되면 위와 같이 좌하단의 Apps에 Github가 추가된 것을 알 수 있습니다.

---

### 2\. Github Repository와 연동하기

![](./008.jpg)
`/github subscribe [연동하고 싶은 Repository URL]`    
원하는 채널에 가서 위와 같은 명령어를 입력합니다.

---

![](./009.jpg)
그러면 위와 같이 Github account를 연결해달라는 요청이 뜹니다.

---

<img src="./010.jpg" width="400">
`Authorize Slack By Github`를 클릭하면 됩니다.

---

<img src="./011.jpg" width="400">
연결을 원하는 Repository의 계정을 클릭합니다.

---

<img src="./012.jpg" width="400">
원하는 Repository를 선택합니다.

---

![](./014.jpg)
그려면 위와 같이 Repository와의 연결이 성공했다는 메시지가 뜹니다.

---

![](./015.jpg)
이 Repository에 누군가 Commit을 하고 Push를 한다면 위와 같은 커멧 메시지가 뜹니다.

---

### 3\. Slack에서 Github Issue 만들기

![](./016.jpg)
`/github open [Issue를 만들고 싶은 Repository URL]`    
Issue를 만들고 싶은 Repository를 위와 같이 입력합니다.

---

<img src="./017.jpg" width="400">
그러면 위와 같이 Issue를 만들 수 있는 창이 뜹니다. 원하는 정보를 입력한 후 `Open`을 누릅니다.

---

![](./018.jpg)
그러면 위와 같이 Issue가 만들어졌다고 뜹니다.

---

![](./019.jpg)
실제 Github에 가서도 정상적으로 Issue가 생성된 것을 알 수 있습니다.

---

![](./021.jpg)
`/github help` 명령어를 통해 어떤 명령어가 있는지 알 수 있습니다.
