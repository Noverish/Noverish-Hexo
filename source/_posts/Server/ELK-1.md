---
layout: post
title: ELK Stack - ElasticSearch 편
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
[1.2. ElasticSearch 설치](#1-2-ElasticSearch-설치)    
[2. 실행하기](#2-실행하기)    
[3. 기본 사용법](#3-기본-사용법)    

---

# 1. 설치하기

## 1.1. Java 설치

ElasticSearch는 Java를 사용하므로 먼저 Java를 설치하셔야 합니다.

*2019년 4월 16일부터 oracle-jdk를 다운로드 받으려면 무조건 License를 가지고 있어야 합니다. 따라서 OpenJDK를 설치하도록 하겠습니다*

```shell
# 1. OpenJDK를 설치합니다.
$ sudo apt-get install -y openjdk-8-jre
$ sudo apt-get install -y openjdk-8-jdk

# 2. 설치가 잘 되었나 확인합니다.
$ javac -version
$ java -version
```

## 1.2. ElasticSearch 설치

#### 1) ElasticSearch를 다운로드 받습니다.

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.5.0.deb
```

다른 버전의 설치 링크를 알고 싶으시다면 <https://www.elastic.co/kr/downloads/past-releases>를 방문하시면 됩니다.
URL의 `6.5.0` 부분을 원하시는 버전으로 바꾸시면 그 버전이 다운로드 됩니다.

#### 2) dpkg 명령어를 이용해 ElasticSearch를 설치합니다.

```shell
$ sudo dpkg -i elasticsearch-6.5.0.deb
```

이 명령어를 통해 `/usr/share/elasticsearch` 에 설치 됩니다.
`/etc/elasticsearch` 에는 설정 파일이, `/etc/init.d/elasticsearch` 에는 실행 파일이 만들어 집니다.

#### 3) 서버가 시작 될 때 자동으로 시작되게 설정합니다.

```shell
$ sudo systemctl enable elasticsearch.service
```

*4) option : ElasticSearch 삭제 방법*
```shell
$ sudo dpkg --purge elasticsearch
$ find / -name elasticsearch -exec rm -r "{}" \;
```

# 2. 실행하기

```shell
# ElasticSearch 시작 명령어
$ sudo service elasticsearch start

# ElasticSearch 중지 명령어
$ sudo service elasticsearch stop
```

아래의 명령어를 통해 정상적으로 실행이 되었는지 알 수 있습니다.
ElasticSearch가 시작 되는 데 시간이 좀 걸리므로 1분 정도 지나서 시도해 주시길 바랍니다.

```shell
$ curl -XGET localhost:9200
```

# 3. 기본 사용법

먼저 일반적인 RDBMS와의 용어의 차이를 익히시길 바랍니다.

RDBMS | ElasticSearch
------|--------------
Database | Index
Table | Type
Row | Document
Column | Field
Schema | Mapping

**앞으로 설명할 모든 Request의 URL뒤에 붙는 `?pretty`는 Response JSON이 예쁘게 나오게 하기 위함입니다. 안 붙여도 딱히 상관은 없습니다.**

## 1) Index (Database)

### 1.1) Index를 만드는 방법입니다. 여기서 `coupang`은 Index 이름입니다.

```shell
$ curl -XPUT http://localhost:9200/coupang?pretty
```
```SQL
CREATE DATABASE coupang;
```

### 1.2) Index의 정보를 얻어내는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/coupang?pretty
```
```SQL
USE coupang;
SHOW TABLES;
```

### 1.3) Index를 삭제하는 방법입니다.

```shell
$ curl -XDELETE http://localhost:9200/coupang?pretty
```
```SQL
DROP DATABASE coupang;
```

## 2) Type (Table), Mapping (Schema)

Mapping을 만드는 것이 Type(Table)을 만드는 것이라고 생각하시면 됩니다.
Mapping없이 Document를 삽입하면 자동으로 Type이 만들어 지는데 각 Field의 자료형이 마구잡이로 지정됩니다.
이렇게 되면 나중에 검색할 때 힘들어 지므로 미리 Mapping을 만들어 놓도록 하겠습니다.

### 2.1) Index의 모든 Mapping 정보를 얻어내는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/coupang/_mapping?pretty
```
```SQL
SHOW TABLES;
```

### 2.2) Index에 Mapping을 넣는 방법입니다.

```shell
$ curl -XPUT http://localhost:9200/coupang/sold_items/_mapping?pretty -d @mapping.json -H "Content-Type:application/json"
```
```SQL
CREATE TABLE sold_items (...);
```

mapping.json
```json
{
  "properties" : {
    "code": {
      "type" : "keyword"
    },
    "name": {
      "type" : "keyword"
    },
    "user": {
      "type" : "keyword"
    },
    "price": {
      "type" : "long"
    },
    "purchase_time": {
      "type" : "date",
      "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
    }
  }
}
```

### 2.3) Mapping을 변경하는 방법입니다.

### 2.4) Mapping을 삭제하는 방법입니다.

Index를 제거한 다음에 다시 만드는 수 밖에 없습니다. 자세한 것은 [여기](https://www.elastic.co/guide/en/elasticsearch/reference/6.4/indices-delete-mapping.html)를 참고해 주세요.

## 3) Document (Row)

### 3.1) Index에 Document를 넣는 방법입니다.

```shell
$ curl -XPOST http://localhost:9200/coupang/sold_items/1?pretty -d @document.json -H "Content-Type:application/json"
```
```SQL
INSERT INTO sold_items VALUES (...);
```

document.json
```json
{
  "code": "food",
  "name": "apple",
  "user": "john"
  "price": "1000",
  "purchase_time": "2019-05-12 18:37:12"
}
```

### 3.2) Index의 Document를 찾는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/coupang/sold_items/_search?pretty
```
```SQL
SELECT * FROM sold_items;
```

### 3.3) 아래는 query 옵션을 줘서 Index의 Document를 찾는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/coupang/sold_items/_search?q=name:pensil&pretty
```
```SQL
SELECT * FROM sold_items WHERE name LIKE 'pensil';
```

#### 3.4) Document를 Index에서 삭제하는 방법입니다.