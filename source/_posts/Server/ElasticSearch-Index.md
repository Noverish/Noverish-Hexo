---
layout: post
title: ElasticSearch - Index 편
date: 2019-05-13 20:06:00 +0900
description: Template description
thumbnail: /thumbnails/elasticsearch.png
category: 'server'
tags:
- elk
- elasticsearch
twitter_text: template twitter_text
---

ElasticSearch - Index 편

<!-- more -->

# 모든 문서는 6.5.0 버전 기준으로 작성 되었습니다.

# 1. Index 만들기

```shell
$ curl -XPUT http://localhost:9200/twitter
```

## 1.1. Index 이름 규칙

- 소문자만 사용 가능
- `\, /, *, ?, ", <, >, |, ` ` (space character), ,, #` 사용 불가
- 7.0 이전 버전에서는 `:`을 사용할 수 있지만 그 이후 버전에서는 사용 불가
- `-, _, +`로 시작할 수 없음
- `.` 또는 `..` 으로 지을 수 없음
- 255 바이트 보다 길게 지을 수 없음 (한글 같은 경우는 한 글자에 1 바이트 보다 크므로 지을 수 있는 글자 수는 더 적음)

## 1.2. Setting과 함께 Index 만들기

```shell
$ curl -XPUT http://localhost:9200/twitter -H "Content-Type:application/json" -d '
{
  "settings" : {
    "index" : {
      "number_of_shards" : 3, 
      "number_of_replicas" : 2 
    }
  }
}
'
```

다음도 가능합니다.

```
{
  "settings" : {
    "number_of_shards" : 3,
    "number_of_replicas" : 2
  }
}
```

- `number_of_shards`의 기본값은 `5`입니다.
- `number_of_replicas`의 기본값은 `1`입니다. (각 primary shard 당 1개의 복사본)

## 1.3. Mapping과 함께 Index 만들기

```shell
$ curl -XPUT http://localhost:9200/test -H "Content-Type:application/json" -d '
{
  "mappings" : {
    "_doc" : {
      "properties" : {
        "field1" : { "type" : "text" }
      }
    }
  }
}
'
```

## 1.4. 별명 (Aliase)과 함께 Index 만들기

```shell
$ curl -XPUT http://localhost:9200/test -H "Content-Type:application/json" -d '
{
  "aliases" : {
    "alias_1" : {},
    "alias_2" : {
      "filter" : {
        "term" : {"user" : "kimchy" }
      },
      "routing" : "kimchy"
    }
  }
}
'
```

위의 Setting, Mapping, Aliase는 동시에 설정 할 수 있습니다.
