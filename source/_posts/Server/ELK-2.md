---
layout: post
title: ELK Stack - Kibana 편
date: 2019-05-21 22:25:00 +0900
description: Template description
thumbnail: /thumbnails/elk.png
category: 'server'
tags:
- elk
twitter_text: template twitter_text
---

정형 및 비정형 데이터를 시각화하고 분석하는데 용이한 ELK Stack을 사용하는 법을 알아보겠습니다.

<!-- more -->

이 글은 Ubuntu 18.04.2 LTS 사용자를 대상으로 작성했습니다.

## 목차
[1. Kibana 설치](#1-Kibana-설치)    
[2. Elasticsearch와 연동하기](#2-Elasticsearch와-연동하기)    
[3. 실행하기](#3-실행하기)    
[4. 로그 보기](#4-로그-보기)    
[5. Elasticsearch 데이터 보기](#5-Elasticsearch-데이터-보기)    
[6. 80번 포트로 실행시키기](#6-80번-포트로-실행시키기)    

---

# 1. Kibana 설치

#### 1) Kibana를 다운로드 받습니다.

```shell
$ wget https://artifacts.elastic.co/downloads/kibana/kibana-6.5.0-amd64.deb
```

다른 버전의 설치 링크를 알고 싶으시다면 <https://www.elastic.co/kr/downloads/past-releases>를 방문하시면 됩니다.
URL의 `6.5.0` 부분을 원하시는 버전으로 바꾸시면 그 버전이 다운로드 됩니다.

*Kibana 6.0.0 이상의 버전은 64bit 운영체제만 지원합니다*

#### 2) dpkg 명령어를 이용해 Kibana를 설치합니다.

```shell
$ sudo dpkg -i kibana-6.5.0-amd64.deb
```

Kibana는 다음과 같은 위치에 설치 됩니다.

내용             | 위치
-----------------|--------------------------
설치 경로        | /usr/share/kibana
설정 파일 경로   | /etc/kibana
데이터 저장 경로 | /var/lib/kibana
실행 파일 경로   | /etc/init.d/kibana

#### 3) 서버가 시작 될 때 자동으로 시작되게 설정합니다.

```shell
$ sudo systemctl enable kibana.service
```

*4) option : Kibana 삭제 방법*
```shell
$ sudo dpkg --purge kibana
$ find / -name kibana -exec rm -r "{}" \;
```

# 2. Elasticsearch와 연동하기

Elasticsearch와 Kibana를 같은 서버에서 구동하면 딱히 설정할 게 없지만
다른 서버에서 구동하면 `/etc/kibana/kibana.yml`을 수정해야 합니다.

파일에서 아래의 부분을 본인의 Elasticsearch 서버의 주소로 바꾸시고 앞의 주석 처리를 없앱니다.

```
#elasticsearch.url: "http://localhost:9200"
```

# 3. 실행하기

```shell
# Kibana 시작 명령어
$ sudo service kibana start

# Kibana 중지 명령어
$ sudo service kibana stop
```

아래 링크에 웹브라우저로 접속해서 정상적으로 실행이 되었는지 알 수 있습니다.
Kibana 시작 되는 데 시간이 좀 걸리므로 1분 정도 지나서 시도해 주시길 바랍니다.

```shell
$ curl -v http://localhost:5601
```

아래와 같이 뜨면 실행이 되고 있다는 뜻입니다.

```
Note: Unnecessary use of -X or --request, GET is already inferred.
* Rebuilt URL to: http://localhost:5601/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 5601 (#0)
> GET / HTTP/1.1
> Host: localhost:5601
> User-Agent: curl/7.58.0
> Accept: */*
> 
< HTTP/1.1 302 Found
< location: /app/kibana
< kbn-name: kibana
< kbn-xpack-sig: fd6e658a000b1fdd8c1408d85da429b6
< cache-control: no-cache
< content-length: 0
< connection: close
< Date: Tue, 21 May 2019 13:45:43 GMT
< 
* Closing connection 0
```

# 4. 로그 보기

Kibana는 기본적으로 로그를 파일에 저장하는 것이 아니라 stdout에 출력하므로 로그를 보시려면 다른 방법을 사용해야 합니다
Kibana의 로그를 보고 싶다면 아래의 명령어를 입력하시면 됩니다.

```shell
$ journalctl -u kibana.service -e
```

또는 Kibana의 설정파일을 수정하시면 됩니다.

/etc/kibana/kibana.yml
```
logging.dest: /var/log/kibana.log
```

# 5. Elasticsearch 데이터 보기

<img src="image1.png" width="400">

1. Management - Index Pattern을 클릭합니다.

<img src="image2.png" width="600">

2. Index Pattenr을 `records`라고 입력하고 다음으로 넘어갑니다.

<img src="image3.png" width="600">

3. Time filter field name을 `time`이라고 설정하고 완료합니다.

![image4](image4.png)

4. Discover에 들어가서 우측 상단의 시간을 적절히 조정하시면 우리가 저번에 넣었던 데이터 1000개를 볼 수 있습니다.

# 6. 80번 포트로 실행시키기

`/etc/kibana/kibana.yml`에서 포트를 그냥 80번으로 변경한 뒤 실행하면 그 포트를 사용하지 못한다는 에러가 발생합니다.
`sudo service kibana start` 명령어가 Kibana를 root 권한으로 실행시키지 않아서 발생하는 에러 입니다.
따라서 service가 Kibana를 root 권한으로 실행시키도록 수정해야 합니다.

```shell
$ sudo vi /etc/kibana/kibana.yml

server.port: 80

로 변경

$ sudo vi /etc/systemd/system/kibana.service

User=root
Group=root

로 변경

$ sudo systemctl daemon-reload
$ sudo service kibana start
```
