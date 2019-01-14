---
layout: post
title: AWS EC2로 나만의 VPN 만들기
date: 2018-04-13 20:48:00 +0900
description: Template description
thumbnail: /thumbnails/ec2-vpn.jpg
category: 'server'
tags:
- ec2
- vpn
twitter_text: template twitter_text
---

복잡한 서버 설정 없이 VPN 사용하는 방법을 알아보자

<!-- more -->

우리는 세상 살면서 여러가지 이유로 해외 IP로 접속해야 하는 사이트가 존재합니다.
그게 무슨 사이트인지는 굳이 언급하지 않도록 하겠습니다 ㅎㅎ

시중에 있는 무료 VPN은 너무 속도가 느리고 그렇다고 유료 VPN을 쓰자니 좀 아깝고    

그래서 EC2로 VPN을 만드는 법을 알려드리도록 하겠습니다.

### 1\. 해외 Region에서 EC2 만들기

이건 쉬우므로 건너 뛰도록 하겠습니다.

### 2\. Mac에서 VPN 사용하기

먼저 터미널을 켜주신 후 pem 파일이 있는 폴더로 가서 아래 명령어를 입력합니다.

```shell
$ ssh -i key_pair.pem -D 8080 -C -N user@1.2.3.4
```

그러면 뭔가 실행된 상태로 되어 있을 텐데 그럼 정상적인겁니다.

그런 후 네트워크 환경설정에 들어갑니다.

<img src="000.jpg" width="600">
그리고 `고급` 버튼을 누릅니다.

<img src="001.jpg" width="600">
위 그림처럼 따라하시면 됩니다.

<img src="002.jpg" width="600">
그리고 `적용` 버튼을 누르면 VPN이 켜집니다.

VPN을 끌 때는 저 설정에 들어가서 `SOCKS 프록시`를 체크해제 하시고 적용하시면 됩니다.

근데 이렇게 일일이 환경설정 들어가서 VPN을 키거나 끄면 너무 귀찮으니까 터미널에서 명령어로 처리하는 법을 알아봅시다.

먼저 본인이 지금 사용하고 있는 네트워크 인터페이스 이름을 알아내야 합니다.
그러기 위해서 아래 명령어를 입력해 그 리스트를 알아냅니다.

```shell
$ networksetup -listnetworkserviceorder
```

<img src="003.jpg" width="600">

저는 위와 같이 나왔는데요. 저는 제 맥북을 와이파이로 쓰고 있으므로 저 `Wi-Fi`가 제 와이파이 네트워크 인터페이스 이름입니다.
저는 유선으로 인터넷을 쓰지 않아서 유선 네트워크 인터페이스 이름은 잘 모르겠습니다.

이제 이 이름을 바탕으로 아래 명령어를 실행하시면 됩니다.

VPN 켤 때
```shell
$ networksetup -setsocksfirewallproxy "Wi-Fi" localhost 8080
```

VPN 끌 때
```shell
$ networksetup -setsocksfirewallproxystate "Wi-Fi" off
```

### 3\. Windows에서 VPN 사용하기

Mac과 달리 Windows에서는 시스템 전체를 VPN 우회하는 방법이 없습니다. (아마도?)
잘 모르겠네요.

먼저 putty와 같이 ssh tunnel을 유지시키는 MyEnTunnel 프로그램을 다운받습니다.
알아서 다운받으세요.

<img src="004.jpg" width="600">
위와 같이 아이피 주소, 유저 네임, 비밀번호를 입력하고, `Enable Dynamic SOCKS`를 체크하시고 저 포트를 8080로 바꿔줍니다.

<img src="005.jpg" width="600">
그리고 `Connect` 버튼을 누르면 위와 같은 메시지가 뜰텐데 그냥 Yes 누르시면 됩니다.

<img src="006.jpg" width="600">
status 탭에 이렇게 로그가 뜰텐데 Connectino stable이라고 뜨면 성공적으로 ssh tunnel을 만든겁니다.

그리고 프로그램들을 가상 네트워크 인터페이스 상에 실행시켜줄 SocksCap64를 다운받습니다.

<img src="007.jpg" width="600">
여기서 `예`를 누르면 자동으로 웹 브로우저 목록을 불러옵니다.

<img src="008.jpg" width="600">
뭐라는지 잘 모르겠지만 Accept를 눌러줍시다.

<img src="009.jpg" width="600">
이와 같은 화면에서 좌상단의 Proxy 버튼을 누릅니다.

<img src="010.jpg" width="600">
여기서 127.0.0.1과 8080을 입력한 다음에 저장하고 이 프로그램상에서 웹브라우저를 실행시키시면 됩니다.
