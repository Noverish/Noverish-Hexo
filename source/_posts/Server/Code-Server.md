---
layout: post
title: VSCode 원격으로 사용해보기
date: 2020-03-16 19:59:00 +0900
description: Template description
thumbnail: /thumbnails/vscode.png
category: 'server'
tags: 
- server
- vscode
- code-server
twitter_text: template twitter_text
---

서버에 VSCode를 설치 한 후 브라우저를 통해서 접속할 수 있는 프로젝트가 있습니다.
바로 [code-server](https://github.com/cdr/code-server)라는 프로젝트입니다. 이를 사용할 수 있는 방법을 알아보겠습니다.

<!-- more -->

## 목차
[1\. 빠르게 Docker로 시작해 보기](#1-빠르게-Docker로-시작해-보기)    
[2\. 서버에 설치해서 사용하기](#2-서버에-설치해서-사용하기)    
[3\. Run over HTTPS](#3-Run-over-HTTPS)
---

# 1. 빠르게 Docker로 시작해 보기

```shell
$ docker run -it -p 8080:8080 -v "$PWD:/home/coder/project" codercom/code-server
```

위의 명령어를 입력한 후 8080 포트를 통해 접속하면 우리에게 익숙한 VSCode 화면을 볼 수 있습니다.

# 2. 서버에 설치해서 사용하기

하지만 위처럼 Docker로 실행하여 code-server의 터미널을 사용하게 되면 컨테이너 내부의 명령어만 사용 할 수 있어서
Host에 있는 명령어를 아무 것도 사용할 수 없게 됩니다.

따라서 서버에 설치를 해서 사용하는 편을 추천드립니다.
서버에 설치해서 사용하는 법을 아래를 따라하면 됩니다.

## 1) 바이너리 다운로드

![image000](000.jpg)

먼저 <https://github.com/cdr/code-server/releases>에 들어간 다음에
위의 다운로드 목록 중에 본인에게 맞는 버전에 마우스 오른쪽 클릭을 누르고 링크를 복사하면 됩니다.
일반적으로 `linux-x86_64.tar.gz`를 선택하면 됩니다.

그런 다음 아래의 명령어를 입력해서 `/usr/local/bin`에 바이너리를 넣어주면 됩니다.
아래의 명령어는 예시이며 본인의 상황에 맞게 바꾸면 됩니다.

```shell
$ wget https://github.com/cdr/code-server/releases/download/2.1698/code-server2.1698-vsc1.41.1-linux-x86_64.tar.gz
$ tar -xvzf code-server2.1698-vsc1.41.1-linux-x86_64.tar.gz
$ mv code-server2.1698-vsc1.41.1-linux-x86_64/code-server /usr/local/bin
```

## 2) 서비스에 등록하기

서버가 재시작 될 때마다 자동으로 실행되기 위해서 서비스에 등록합니다.

`/etc/systemd/system/code-server.service` 파일을 만드신 후 아래 내용을 작성하면 됩니다.

저는 유저가 hyunsub이므로 아래에 등장하는 모든 hyunsub을 본인의 유저에 맞게 바꾸면 됩니다.

```
[Unit]
Description=code-server
After=network.target

[Service]
Type=simple
User=hyunsub
ExecStart=/usr/local/bin/code-server --port 8443 --user-data-dir /var/lib/code-server /home/hyunsub
Environment="PASSWORD=some-password"
Restart=always

[Install]
WantedBy=multi-user.target
```

위의 파일을 한 번 살펴 보겠습니다.
- `--port 8443`: code-server가 실행되는 포트입니다. 기본 값은 8080입니다.
- `--user-data-dir /var/lib/code-server`: VSCode Extension, 설정, 로그 등이 저장되는 장소 입니다.
- `/home/hyunsub`: code-server에 접속했을 때 기본으로 뜨는 경로를 지정할 수 있습니다.
- `Environment="PASSWORD=some-password"`: 환경변수로 비밀번호를 지정함으로써 code-server에 접속할 때 비밀번호를 입력해야만 접속 할 수 있게 합니다.

위 파일 작성 후 아래 명령어를 실행하면 됩니다.

```shell
$ sudo mkdir /var/lib/code-server
$ sudo chown hyunsub:hyunsub /var/lib/code-server
$ sudo systemctl daemon-reload
$ sudo systemctl enable code-server
$ sudo systemctl start code-server
```

# 3. Run over HTTPS

code-server가 HTTPS 프로토콜 위에 동작하지 않으면 클립보드를 사용할 수 없습니다.
따라서 다른 곳에서 복사한 내용을 붙여넣기 할 수 없게 되는 것입니다.

## 3.1. 이미 HTTPS 인증서가 있는 경우

위에서 작성한 `code-server.service` 파일에서 `ExecStart`의 명령어에 `--cert`와 `--cert-key` 옵션을 추가해주면 됩니다.

`--cert`에는 인증서 경로를, `--cert-key`에는 Private Key 경로를 입력해 주면됩니다.

## 3.2. HTTPS 인증서가 없는 경우

`code-server.service`에서 `ExecStart`의 명령어에 단순히 `--cert` 옵션만 추가해 주면됩니다.
그러면 code-server가 알아서 인증서와 Private Key를 생성합니다.
하지만 이런 방식으로 할 경우 웹 브라우저에서 신용할 수 없는 인증서라는 경고 화면을 띄울 텐데 그냥 무시하고 들어가면 정상적으로 사용할 수 있습니다.
