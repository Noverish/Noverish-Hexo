---
layout: post
title: Spring Boot - JDBC (with MySQL)
date: 2020-12-17 21:37:00 +0900
cover: /covers/spring.png
disqusId: 145d15df2008f77e4f8b78f01e7d2f39c1616fdc
toc: true
category: Spring
tags:
- spring
- spring-boot
---

Spring Boot에서 JDBC를 사용하여 MySQL을 다루는 법을 알아보겠습니다.

<!-- more -->

# 1. JDBC없이 MySQL 접속하기

이 부분은 그냥 흥미용으로 읽고 넘어가면 됩니다.

```gradle build.gradle
dependencies {
    runtimeOnly 'mysql:mysql-connector-java'
}
```

```java
try {
    String url = "jdbc:mysql://localhost:3306/mydb?serverTimezone=Asia/Seoul";
    String username = "username";
    String password = "password";
    Connection conn = DriverManager.getConnection(url, username, password);

    PreparedStatement pstmt = conn.prepareStatement("SELECT * from mytable");
    ResultSet res = pstmt.executeQuery();

    while(res.next()) {
        int id = res.getInt("id");
        String name = res.getString("name");
        System.out.println(id + " " + name);
    }

    res.close();
    pstmt.close();
    conn.close();
} catch (SQLException ex) {
    ex.printStackTrace();
}
```

# 2. Dependency 추가

```gradle build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-jdbc'
    runtimeOnly 'mysql:mysql-connector-java'
}
```

# 3. 설정

```text application.properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/mydb?serverTimezone=Asia/Seoul
spring.datasource.username=username
spring.datasource.password=password
```

만역에 본인 DB의 TimeZone이 Asia/Seoul이 아닐 경우 본인의 것에 맞게 수정하면 됩니다.

# 4. JdbcTemplate

```java
@Autowired
private JdbcTemplate jdbcTemplate;
```

특별한 설정 없이 바로 JdbcTemplate 빈을 불러오면 사용할 수 있습니다.

```java
// Select Many Rows
List<Map<String, Object>> results = jdbcTemplate.queryForList("SELECT * FROM table");

// Select One Row
Map<String, Object> result = jdbcTemplate.queryForMap("SELECT * FROM table");

// Select Scalar value
int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM table", Integer.class);

// Insert
int insertedRows = jdbcTemplate.update("INSERT INTO test (id, title) VALUES (1, 'title')");

// Update
int updatedRows = jdbcTemplate.update("UPDATE test SET title='title2' WHERE id=1");

// Delete
int deletedRows = jdbcTemplate.update("DELETE FROM test WHERE id=1");
```

# 5. 쿼리문에 변수 사용하기

```java
jdbcTemplate.queryForList("SELECT * FROM table WHERE id = ?", 1);
```

쿼리문에 ?로 PlaceHolder를 지정해놓고 바인딩될 변수를 위와 같은 방법으로 동적으로 넘겨줄 수 있습니다.
이러한 방법은 위에서 한 모든 CRUD에 적용할 수 있습니다.
자세한 사용 방법은
[문서](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html)
를 참고해주세요.

# 6. NamedParameterJdbcTemplate

```java
String sql = "SELECT * FROM table WHERE id = :id";

Map<String, Object> params = new HashMap<>();
params.put("id", 1);

namedParameterJdbcTemplate.queryForList(sql, params)
```

NamedParameterJdbcTemplate를 이용하면 `:변수명` 형태로 PlaceHolder를 지정할 수 있습니다. 변수를 순서가 아닌 이름으로 넘겨줄 수 있다는 큰 장점이 있습니다.
이러한 방법은 위에서 한 모든 CRUD에 적용할 수 있습니다.
자세한 사용 방법은
[문서](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/namedparam/NamedParameterJdbcTemplate.html)
를 참고해주세요.

# 7. 객체로 데이터 받아오기

SELECT 문으로 데이터를 받아올 때 매번 `Map<String, Object>` 형식으로 받아오면 일일히 변환해주는 것도 귀찮습니다.
이제부터 소개할 방법을 사용하면 객체로 데이터를 받아올 수 있게 됩니다.

```java
public class DemoData {
    private int id;
    private String name;
    
    public DemoData() {}
    
    public void setId(int id) {
        this.id = id;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}
```

앞으로 사용할 객체의 스키마는 위의 클래스를 사용하겠습니다.ㄴ

## 7.1. RowMapper

```java
public class DemoDataRowMapper implements RowMapper<DemoData> {
    @Override
    public DemoData mapRow(ResultSet rs, int rowNum) throws SQLException {
        DemoData d = new DemoData();
        d.setId(rs.getInt("id"));
        d.setName(rs.getString("name"));
        return d;
    }
}
```

```java
List<DemoData> results = jdbcTemplate.query("SELECT * FROM table", new DemoDataRowMapper());
```

RowMapper 인터페이스를 구현함으로써 query의 결과값을 객체로 받을 수 있습니다.

## 7.2. Java 8 Lambda

```java
List<DemoData> results = jdbcTemplate.query("SELECT * FROM table", (rs, rowNum) -> {
    DemoData d = new DemoData();
    d.setId(rs.getInt("id"));
    d.setName(rs.getString("name"));
    return d;
});
```

Java 8의 Lambda를 이용하여 RowMapper 인터페이스를 구현하지 않고 Mapping을 할 수 있습니다.

## 7.3. BeanPropertyRowMapper

```java
RowMapper<DemoData> rowMapper = new BeanPropertyRowMapper<>(DemoData.class);
List<DemoData> results = jdbcTemplate.query("SELECT * FROM table", rowMapper);
```

클래스의 멤버 변수 이름과 Table Column 이름이 동일하다면 따로 RowMapper를 구현하지 않고 BeanPropertyRowMapper를 사용하면 자동으로 매핑해줍니다.
단 여기는 다음과 같은 제약사항이 따릅니다.

- Table Column 이름은 snake_case로, 클래스의 멤버 변수의 이름은 camelCase로 되어있어야 합니다.
- 클래스에는 인수가 없는 생성자와 모든 Property에 대한 setter 메서드가 존재해야 합니다.
- String, int, double, java.util.Date 등 Java 기본 데이터 타입만 지원합니다.

## 7.4. ResultSetExtractor

RowMapper는 각각의 Row마다 매핑 메서드가 실행되는 반면
ResultSetExtractor는 직접 ResultSet을 순회하면서 List를 만든 후 반환합니다.
자세한 정보는 다른 곳을 찾아보세요.

## 7.5. RowCallbackHandler

RowMapper는 Object를, ResultSetExtractor는 List&lt;Object&gt;를 반환하는 반면
RowCallbackHandler는 메서드 내에서 ResultSet를 처리한 후 아무 것도 반환하지 않습니다.
자세한 정보는 다른 곳을 찾아보세요.

# 8. 기타

### JdbcTemplate.batchUpdate

batchUpdate 메서드를 사용하면 많은 양의 SQL 구문을 한 번에 처리할 수 있습니다.

### JdbcTemplate.execute

execute 메서드를 사용하면 DDL 구문을 처리할 수 있습니다.
