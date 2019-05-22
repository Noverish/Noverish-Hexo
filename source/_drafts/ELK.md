

# 3. 기본 사용법

먼저 일반적인 RDBMS와의 용어의 차이를 익히시길 바랍니다.

RDBMS | ElasticSearch
------|--------------
Table | Index
Row | Document
Column | Field
Schema | Mapping

*elasticsearch 6 버전 부터는 type의 기능을 점차 삭제하고 7 버전 부터는 완전히 삭제합니다!! 따라서 6.5.0 버전을 쓰는 이 블로그에서는 Type에 대한 설명을 최대한 하지 않도록 하겠습니다.*

**앞으로 설명할 모든 Request의 URL뒤에 붙는 `?pretty`는 Response JSON이 예쁘게 나오게 하기 위함입니다. 안 붙여도 딱히 상관은 없습니다.**
**curl 명령어 밑에 있는 SQL 쿼리는 curl 명령어와 유사한 역할을 하는 쿼리라고 생각하시면 됩니다.**

## 1) Index (Table)

### 1.1) Index를 만드는 방법입니다.

```shell
$ curl -XPUT http://localhost:9200/sold_items?pretty
```

여기서 `sold_items`은 Index의 이름입니다.

### 1.2) Index의 정보를 얻어내는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/sold_items?pretty
```

위의 명령어를 통해 Index의 별명(aliase), 스키마(mapping), 설정(setting) 등을 볼 수 있습니다.

### 1.3) Index 리스트 보기

```shell
$ curl -XGET http://localhost:9200/_cat/indices?v
```

### 1.4) Index를 삭제하는 방법입니다.

```shell
$ curl -XDELETE http://localhost:9200/sold_items?pretty
```

## 2) Mapping (Schema)

일반적인 RDBMS와는 다르게 ElasticSearch는 Mapping(Schema) 없이 Index(Table)만 만들 수 있습니다.
만약 Mapping 없이 Document를 삽입하면 Document의 값에 따라 알아서 Mapping이 생성됩니다.
하지만 각 Field들의 자료형이 원하는 대로 나오지 않을 수 있으니 미리 Mapping을 만들어 놓고 데이터를 삽입하는 것이 좋습니다.

### 2.1) Index에 Mapping을 넣는 방법입니다.

```shell
$ curl -XPUT http://localhost:9200/sold_items/_mapping/_doc?pretty -d @mapping.json -H "Content-Type:application/json"
```

mapping.json
```json
{
  "properties" : {
    "class": {
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

### 2.2) Index의 모든 Mapping 정보를 얻어내는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/sold_items/_mapping?pretty
```

### 2.3) Mapping을 변경하는 방법입니다.

한 번 넣은 Mapping은 변경할 수 없습니다.
하지만 몇 가지 예외가 있는데 다음과 같습니다.

1. field를 추가하는 경우
2. object field에 property를 추가하는 경우
3. 한 field에 여러 type을 추가하는 경우
4. ignore_above를 변경하는 경우

### 2.4) Mapping을 삭제하는 방법입니다.

Index를 제거한 다음에 다시 만드는 수 밖에 없습니다.
자세한 것은 [여기](https://www.elastic.co/guide/en/elasticsearch/reference/6.4/indices-delete-mapping.html)를 참고해 주세요.

## 3) Document (Row)

### 3.1) Index에 Document를 넣는 방법입니다.

```shell
$ curl -XPOST http://localhost:9200/sold_items/_doc?pretty -d @document.json -H "Content-Type:application/json"
```

document.json
```json
{
  "class": "food",
  "name": "apple",
  "user": "john",
  "price": "1000",
  "purchase_time": "2019-05-12 18:37:12"
}
```

### 3.2) Index의 모든 Document를 찾는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/sold_items/_doc/_search?pretty
```

### 3.3) query 옵션을 줘서 Index에서 원하는 Document만 찾는 방법입니다.

```shell
$ curl -XGET http://localhost:9200/sold_items/_doc/_search?q=name:apple&pretty
$ curl -XPOST http://localhost:9200/sold_items/_search?pretty -d @search_query.json -H "Content-Type:application/json"
```

### 3.4) 특정 Document의 한 Field를 업데이트 하는 방법입니다.

```shell
$ curl -XPUT http://localhost:9200/sold_items/_doc/jwnAsGoBGP2VtaGUAAJb?pretty -d @update_query.json -H "Content-Type:application/json"
```

### 3.4) Document를 Index에서 삭제하는 방법입니다.

```shell
$ curl -XPOST http://localhost:9200/sold_items/_delete_by_query?pretty -d @delete_query.json -H "Content-Type:application/json"
```

### 3.5) 모든 Document를 Index에서 삭제하는 방법입니다.

```shell
$ curl -XPOST 'http://localhost:9200/records/_doc/_delete_by_query?conflicts=proceed&pretty' -H "Content-Type:application/json" -d'
{
  "query": {
    "match_all": {}
  }
}'
```