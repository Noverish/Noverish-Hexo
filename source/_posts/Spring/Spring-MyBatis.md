---
layout: post
title: Spring Boot - MyBatis (with MySQL)
date: 2021-03-19 14:35:00 +0900
cover: /covers/spring.png
disqusId: e9275accfe12dff428fa3576c9e4d4ccc22f165d
toc: true
category: Spring
tags:
- spring
- spring-boot
- mybatis
---

Spring Boot에서 MyBatis를 사용하여 MySQL을 다루는 법을 알아보겠습니다.

<!-- more -->

# 1. Dependency 추가

<div class="tabs is-boxed my-3">
  <ul class="mx-0 my-0">
    <li>
      <a href="#gradle">
        <span>Gradle</span>
      </a>
    </li>
    <li>
      <a href="#maven">
        <span>Maven</span>
      </a>
    </li>
  </ul>
</div>

<div class="tab-content gradle">
```gradle build.gradle
dependencies {
  implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.1.4'
  runtimeOnly 'mysql:mysql-connector-java'
}
```
</div>

<div class="tab-content maven">
```xml pom.xml
<dependencies>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.1.4</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```
</div>

# 2. 설정

```ini application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb?serverTimezone=Asia/Seoul
spring.datasource.username=username
spring.datasource.password=password

mybatis.mapper-locations=mapper/**/*.xml
```

# 3. model 선언

```java User.java
public class User {
    private long id;
    private String name;
    private int age;
    private OffsetDateTime date;
}
```

<article class="message message-immersive is-primary">
  <div class="message-body">
    <i class="fas fa-info-circle mr-2"></i>
    MyBatis에서 Mapper가 반환하는 클래스의 경우에는 위와 같이 Setter나 AllArgsConstructor가 없어도 가능합니다
  </div>
</article>

# 4. 파라미터가 없는 CRUD

```java UserMapper.java
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    List<User> getUserList();
    User getUser(); // Optional<User> getUser(); 도 가능합니다.
    int countUser();

    int insert(); // 추가된 row 수를 반환합니다.
    int update(); // 변경된 row 수를 반환합니다.
    int delete(); // 삭제된 row 수를 반환합니다.
    // 반환타입에 int 대신 void 또는 long을 사용해도 됩니다.
}
```

`resources` 폴더에 `mapper` 폴더를 생성하고 아래의 파일을 추가합니다.

```xml user-mapper.xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.UserMapper">
    <select id="getUserList" resultType="com.example.demo.User">
        SELECT * FROM user
    </select>
    <select id="getUser" resultType="com.example.demo.User">
        SELECT * FROM user LIMIT 1
    </select>
    <select id="countUser" resultType="int">
        SELECT COUNT(*) FROM user
    </select>

    <insert id="insert">
        INSERT INTO user (name, age, date) VALUES ('James', 22, NOW())
    </insert>
    <update id="update">
        UPDATE user SET age = 23
    </update>
    <delete id="delete">
        DELETE FROM user WHERE ![CDATA[ age > 20 ]]
    </delete>
</mapper>
```

SQL문 안에 `<` 나 `>`를 사용하고 싶은 경우 21번째 줄의 `![CDATA[ age > 20 ]]`와 같이 CDATA 섹션을 사용해야 합니다.

<article class="message message-immersive is-primary">
  <div class="message-body">
    <i class="fas fa-info-circle mr-2"></i>
    <code>mybatis.type-aliases-package=com.example.demo</code> 설정을 사용하면 4번째 줄의 <code>resultType</code>을 앞의 패키지 명을 생략하여 <code>User</code>처럼 쓸 수 있습니다.
  </div>
</article>

# 5. 파라미터가 있는 CRUD

### 1) 파라미터가 하나이고 자바 기본 데이터 타입인 경우 (String, Integer 등)

```java UserMapper.java
@Mapper
public interface UserMapper {
    User getUserByName(String name);
}
```

```xml user-mapper.xml
<select id="getUserByName" resultType="com.example.demo.User">
    SELECT * FROM user WHERE #{any_name}
</select>
```

mapper java 파일에서 선언되어 있는 파라미터의 이름과 관계없이 아무 이름을 mapper xml 파일에 적으면 됩니다.
어차피 파라미터가 하나 뿐이기 때문에 MyBatis가 이름과 관계없이 파라미터를 넣어줍니다.

### 2) 파라미터가 하나이고 커스텀으로 생성된 Object인 경우

```java Pagination.java
public class Pagination {
    private int limit;
    private int offset;
}
```

```java UserMapper.java
@Mapper
public interface UserMapper {
    List<User> getUserWithSearchQuery(Pagination pagination);
    int insertUser(User user);
}
```

```xml user-mapper.xml
<select id="getUserWithSearchQuery" resultType="com.example.demo.User">
    SELECT * FROM user LIMIT #{limit} OFFSET #{offset}
</select>
<insert id="insertUser" parameterType="com.example.demo.User">
    INSERT INTO user (name, age, date) VALUES (#{name}, #{age}, #{date})
</insert>
```

위와 같이 Object의 프로퍼티 명을 그대로 적으면 됩니다.

<article class="message message-immersive is-primary">
  <div class="message-body">
    <i class="fas fa-info-circle mr-2"></i>
    MyBatis에서 Mapper가 파라미터로 사용하는 클래스의 경우에는 위와 같이 Getter가 없어도 가능합니다
  </div>
</article>

<article class="message message-immersive is-primary">
  <div class="message-body">
    <i class="fas fa-info-circle mr-2"></i>
    insert, update, delete 태그에서는 일반적으로 위와 같이 <code>parameterType</code>를 사용해주는데 이는 생략해도 됩니다.
  </div>
</article>

### 3) 파라미터가 여러 개인 경우

mapper java 파일에서 메서드의 파라미터 명은 컴파일 할 때 변경될 수 있기 때문에 MyBatis에서는 이를 사용하지 않습니다.
따라서 아래와 같이 `@Param` 어노테이션을 이용해 변수 명을 명시적으로 정의합니다.

또한 파라미터가 Object인 경우 `@Param으로 지정한 파라미터 명.프로퍼티 명`으로 값을 넣어줄 수 있습니다.

```java UserMapper.java
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    List<User> getUserByNameAndAge(
        @Param("name") String name,
        @Param("age") int age,
        @Param("pagination") Pagination pagination
    );
}
```

```xml user-mapper.xml
<select id="getUserByNameAndAge" resultType="com.example.demo.User">
    SELECT * FROM user WHERE name = #{name} AND age = #{age} LIMIT #{pagination.limit} OFFSET #{pagination.offset}
</select>
```

# 6. #{변수명}과 ${변수명}

우리는 지금까지 SQL에 값을 삽입할 때 `#{변수명}` 만 사용했습니다.
하지만 MyBatis에서는 `${변수명}`으로도 값을 삽입할 수 있습니다.
이 두 방식에 차이를 알아보겠습니다.

### 1) #{변수명}

```sql
SELECT * FROM user WHERE age = #{age} -- mapper xml에 작성한 sql
SELECT * FROM user WHERE age = ?      -- MyBatis에 의해 변환된 sql
```

mapper xml 파일에 적혀있는 `#{변수명}`은 MyBatis가 위와 같이 `java.sql.PreparedStatement`의 바인드 변수로 변환됩니다.
그런 다음 `PreparedStatement`의 API를 이용해 값을 집어 넣습니다.
보통 값을 넣을 때 사용합니다.

### 2) ${변수명}

```sql
SELECT * FROM user ORDER BY ${column} -- mapper xml에 작성한 sql
SELECT * FROM user ORDER BY age       -- MyBatis에 의해 변환된 sql
```

해당 변수를 그대로 문자열로 대체합니다. SQL Injection과 같은 공격에 노출될 수 있으므로 사용에 유의하셔야합니다. 
보통 테이블 명이나 컬럼 명을 넣을 때 사용합니다.

# 7. 결과값 매핑

데이터베이스의 컬럼명과 자바에서 사용하는 객체의 프로퍼티 명이 다른 경우가 종종 있습니다.
이럴 경우 다음과 같이 이 둘을 매핑시켜줄 수 있습니다.

## 1) snake_case, camelCase

일반적으로 데이터베이스에서는 snake_case를, 자바에서는 camelCase를 사용합니다.
다음과 같은 설정을 하면 MyBatis에서 자동으로 이 둘을 매핑시킵니다.

```ini application.properties
mybatis.configuration.map-underscore-to-camel-case=true
```

## 2) 그 외의 경우

```xml user-mapper.xml
<mapper namespace="com.example.demo.UserMapper">
  <resultMap id="userResultMap" type="com.example.demo.User">
    <id column="user_id" property="id" />
    <result column="username" property="name" />
    <result column="age" property="age" />
    <result column="reg_date" property="regDate" />
  </resultMap>

  <select id="getUser" resultMap="userResultMap">
    SELECT * FROM user
  </select>
</mapper>
```

- `resultMap` 태그에 `id`를 정의하고 이를 각 구문 태그의 `resultMap`에 사용함으로써 매핑을 시켜줍니다. (2, 9번째 줄)
- Primary Key에는 `id` 태그를, 그 외의 컬럼에는 `result` 태그를 사용합니다. (3 ~ 6번째 줄)
- `column`에는 데이터베이스 컬럼명을, `property`에는 자바 객체의 프로퍼티명을 적습니다. (3 ~ 6번째 줄)
- 데이터베이스 컬럼명과 자바 객체의 프로퍼티명이 같거나, 바로 위에서 설명한 `map-underscore-to-camel-case` 설정으로 자동으로 매핑이 가능할 경우 굳이 명시하지 않아도 됩니다. (5 ~ 6번째 줄은 생략가능)

