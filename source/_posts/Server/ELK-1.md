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
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.0.0-amd64.deb
```

다른 버전의 설치 링크를 알고 싶으시다면 <https://www.elastic.co/kr/downloads/past-releases>를 방문하시면 됩니다.

#### 2) dpkg 명령어를 이용해 ElasticSearch를 설치합니다.

```shell
$ sudo dpkg -i elasticsearch-7.0.0-amd64.deb
```

이 명령어를 통해 `/usr/share/elasticsearch` 에 설치 됩니다.
`/etc/elasticsearch` 에는 설정 파일이, `/etc/init.d/elasticsearch` 에는 실행 파일이 만들어 집니다.

#### 3) 서버가 시작 될 때 자동으로 시작되게 설정합니다.

```shell
$ sudo systemctl enable elasticsearch.service
```

*4) option : ElasticSearch 삭제 방법*
```shell
$ sudo dpkg -r elasticsearch
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
아래와 같은 출력이 나오면 정상적으로 실행이 되고 있다는 것입니다.

```shell
$ curl -XGET 'localhost:9200'
{
  "name" : "ip-172-31-28-128",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "cJnguwItTeOvplAKLzDtIQ",
  "version" : {
    "number" : "7.0.0",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "b7e28a7",
    "build_date" : "2019-04-05T22:55:32.697037Z",
    "build_snapshot" : false,
    "lucene_version" : "8.0.0",
    "minimum_wire_compatibility_version" : "6.7.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
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

### Index

```shell
# 1. Index 정보를 얻어내는 방법입니다. 여기서 noverish는 Index 이름입니다.
$ curl -XGET http://localhost:9200/noverish

# 2. Index를 만드는 방법입니다.
$ curl -XPUT http://localhost:9200/noverish

# 3. Index를 삭제하는 방법입니다.
$ curl -XDELETE http://localhost:9200/noverish
```

### Type, Mapping

Mapping을 만드는 것이 Type(Table)을 만드는 것이라고 생각하시면 됩니다.
Mapping없이 Document를 삽입하면 자동으로 Type이 만들어 지는데 각 Field의 자료형이 마구잡이로 지정됩니다.
이렇게 되면 나중에 검색할 때 힘들어 지므로 미리 Mapping을 만들어 놓도록 하겠습니다.

```shell
# 1. Mapping 넣기
$ curl -XPUT http://localhost:9200/noverish/products/_mapping -d @mapping.json
```

```json
{
  "properties" : {
    "code" : {
      "type" : "keyword"
    },
    "name" : {
      "type" : "text"
    },
    "price" : {
      "type" : "long"
    },
    "purchase_time" : {
      "type" : "date",
      "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
    }
  }
}
```