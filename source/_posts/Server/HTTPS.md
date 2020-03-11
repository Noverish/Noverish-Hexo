---
layout: post
title: 내 서버에 Https 적용하기 (Nginx)
date: 2020-03-10 19:36:00 +0900
description: Template description
thumbnail: /thumbnails/letsencrypt.jpg
category: 'server'
tags:
- https
- letsencrypt
- nginx
twitter_text: template twitter_text
---

무료 HTTPS 인증서 발급 기관인 Let's Encrypt를 통해 내 서버에 Https를 적용하는 법을 알아보겠습니다.

<!-- more -->

## 목차
[1. Certbot 설치](#1-Certbot-설치)    
[2. 인증서 발급](#2-인증서-발급)    
[3. Nginx 설정](#3-Nginx-설정)    
[4. 인증서 갱신](#4-인증서-갱신)    
[5. Crontab에 등록](#5-Crontab에-등록)    
[6. 내 사이트 테스트](#6-내-사이트-테스트)

---

인증서를 얻기 위해서는 해당 서버에 SSH로 접속해야 합니다.

# 1. Certbot 설치

Certbot은 Let's Encrypt의 인증서 발급을 편하게 도와주는 도구 입니다.
Certbot을 설치하기 위해서는 다음과 같은 명령어를 입력해 주시길 바랍니다.

```shell
$ sudo apt-get update
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository universe
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install certbot
```

# 2. 인증서 발급

인증서 발급은 인증 기관(여기서는 Let's Encrypt)이 인증서 발급을 요청한 서버가 실제로 이 도메인을 소유하고 있는 지를 검증하기 위해
요청 도메인의 특정 Path에 특정 내용을 담아보라고 요구합니다.

예를 들어 hyunsub.kim에 대한 인증서를 요청하면 인증 기관은 http\://hyunsub.kim/1q2w3e4r에 'asdfqwer'를 담아보라고 요구하고 이 것을 수행하면 이 도메인을 소유하고 있다고 판단하는 것입니다.

따라서 certbot이 이러한 작업을 할 수 있도록 명령어를 입력하는데 크게 2가지 경우가 있습니다.

## 2.1. 80 포트에 돌아가는 웹 서버를 잠시 정지 시킬 수 있는 경우

```shell
$ sudo certbot certonly -d www.example.com --standalone
```

certbot이 독자적인 웹 서버를 80 포트에 돌려서 위의 인증 기관의 요구 사항을 수행합니다.

## 2.2. 80 포트에 돌아가는 웹 서버를 잠시 정지 시킬 수 없는 경우

```shell
$ sudo certbot certonly -d www.example.com --webroot -w /var/www/example
```

만약에 80 포트에 돌아가는 웹 서버를 정지할 수 없는 경우 webroot 폴더 경로를 지정해 주면서 인증 기관의 요구 사항을 수행하게 합니다.

여기서 w 옵션의 값으로 들어간 /var/www/example 폴더가 webroot 폴더인데 예를 들어 /var/www/example/tmp.txt 에 파일을 생성하면
http\://www.example.com/tmp.txt로 접근할 수 있게 웹 서버 설정이 된 폴더를 webroot 폴더라고 합니다.

## 2.3. Finally

위의 명령어를 입력하고 나면 아래의 경로에 두 파일이 만들어집니다.

- /etc/letsencrypt/live/{도메인 주소}/fullchain.pem (인증서 + 공개키 파일)
- /etc/letsencrypt/live/{도메인 주소}/privkey.pem (개인키 파일)

이제 이 두 파일을 Nginx에 적용시켜 보겠습니다.

# 3. Nginx 설정

```nginx
server {
  listen       80 default;
  server_name  home.hyunsub.kim;

  location / {
    return 301 https://home.hyunsub.kim$request_uri;
  }
}

server {
  listen       443 ssl default;
  server_name  home.hyunsub.kim;

  ssl_certificate      /etc/letsencrypt/archive/home.hyunsub.kim/fullchain1.pem;
  ssl_certificate_key  /etc/letsencrypt/archive/home.hyunsub.kim/privkey1.pem;

  location / {
    root   /usr/share/nginx/html;
    index  index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

# 4. 인증서 갱신

Let's Encrypt 인증서는 3개월 후에 만료되므로 주기적으로 갱신시켜주어야 합니다.

인증서 갱신은 인증서 발급과 같은 과정을 거치기 때문에 80 포트를 쓸 수 있냐 없냐로 나뉘어서 명령어를 입력해야 합니다.

## 4.1. 80 포트에 돌아가는 웹 서버를 잠시 정지 시킬 수 있는 경우

```shell
$ sudo certbot renew --pre-hook "service nginx stop" --post-hook "service nginx start"
$ sudo certbot renew --pre-hook "service nginx stop" --post-hook "service nginx start" --dry-run # 갱신 테스트
```

prehook, posthook을 통해 갱신 전에 웹 서버를 잠시 정지시키고 인증서 갱신한 다음 다시 웹 서버를 실행시킵니다.

## 4.2. 80 포트에 돌아가는 웹 서버를 잠시 정지 시킬 수 없는 경우

하는 중...

# 5. Crontab에 등록

Crontab에 다음과 같이 추가해서 주기적으로 인증서 갱신을 하도록 합니다.

```crontab
0 0 1 * * sudo certbot renew ...
```

매달 1일 0시에 인증서를 갱신한다는 의미입니다.

하지만 인증서 갱신은 인증서 만료 30일 전부터 가능한다는 점 알아두셔야 합니다.

# 6. 내 사이트 테스트

아래 사이트를 통해 내 사이트의 HTTPS를 검증할 수 있습니다.

<https://www.ssllabs.com/ssltest/>
