---
layout: post
title: ELK Stack - Elasticsearch 편
date: 2019-05-12 09:18:00 +0900
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
[1. 설치하기](#1-설치하기)    
[1.1. Java 설치](#1-1-Java-설치)    
[1.2. Elasticsearch 설치](#1-2-Elasticsearch-설치)    
[2. 실행하기](#2-실행하기)    
[3. 기본 사용법](#3-기본-사용법)    

---

# 1. 설치하기

## 1.1. Java 설치

Elasticsearch는 Java를 사용하므로 먼저 Java를 설치하셔야 합니다.

*2019년 4월 16일부터 oracle-jdk를 다운로드 받으려면 무조건 License를 가지고 있어야 합니다. 따라서 OpenJDK를 설치하도록 하겠습니다*

```shell
# 1. OpenJDK를 설치합니다.
$ sudo apt-get install -y openjdk-8-jre
$ sudo apt-get install -y openjdk-8-jdk

# 2. 설치가 잘 되었나 확인합니다.
$ javac -version
$ java -version
```

## 1.2. Elasticsearch 설치

#### 1) Elasticsearch를 다운로드 받습니다.

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.5.0.deb
```

다른 버전의 설치 링크를 알고 싶으시다면 <https://www.elastic.co/kr/downloads/past-releases>를 방문하시면 됩니다.
URL의 `6.5.0` 부분을 원하시는 버전으로 바꾸시면 그 버전이 다운로드 됩니다.

#### 2) dpkg 명령어를 이용해 Elasticsearch를 설치합니다.

```shell
$ sudo dpkg -i elasticsearch-6.5.0.deb
```

Elasticsearch는 다음과 같은 위치에 설치 됩니다.

내용             | 위치
-----------------|--------------------------
설치 경로        | /usr/share/elasticsearch
설정 파일 경로   | /etc/elasticsearch
데이터 저장 경로 | /var/lib/elasticsearch
로그 저장 경로   | /var/log/elasticsearch
실행 파일 경로   | /etc/init.d/elasticsearch

#### 3) 서버가 시작 될 때 자동으로 시작되게 설정합니다.

```shell
$ sudo systemctl enable elasticsearch.service
```

*4) option : Elasticsearch 삭제 방법*
```shell
$ sudo dpkg --purge elasticsearch
$ find / -name elasticsearch -exec rm -r "{}" \;
```

# 2. 실행하기

```shell
# Elasticsearch 시작 명령어
$ sudo service elasticsearch start

# Elasticsearch 중지 명령어
$ sudo service elasticsearch stop
```

아래의 명령어를 통해 정상적으로 실행이 되었는지 알 수 있습니다.
Elasticsearch가 시작 되는 데 시간이 좀 걸리므로 1분 정도 지나서 시도해 주시길 바랍니다.

```shell
$ curl http://localhost:9200
```

# 3. 데이터 넣기

Elasticsearch에 대한 사용법은 다른 포스트에서 다루기로 하고 우리는 일단 ELK 스택을 실습해 보는 것을 목표로 하므로 일단 데이터를 넣어보는 것만 하겠습니다.

#### 1) index 만들기

```shell
$ curl -XPUT http://localhost:9200/records?pretty
```

#### 2) mapping 넣기

```shell
$ curl -XPUT http://localhost:9200/records/_mapping/_doc?pretty -d @mapping.txt -H "Content-Type:application/json"
```

[mapping.txt](./mapping.txt)

#### 3) document 넣기

```shell
$ curl -XPOST http://localhost:9200/records/_doc/_bulk?pretty --data-binary @bulk.txt -H "Content-Type:application/x-ndjson"
```

[bulk.txt](./bulk.txt)

---

이로써 우리는 Elasticsearch를 구동하고 거기에 1000개의 상품 판매 목록 데이터를 집어 넣었습니다.
그러면 다음 포스트에서 Kibana로 이 데이터를 시각화 하는 방법에 대해 알아보도록 하겠습니다.
