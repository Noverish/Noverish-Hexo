---
layout: post
title: Spring Boot - JWT
date: 2021-01-24 16:53:00 +0900
cover: /covers/spring.png
disqusId: d02111ed1d577f87eb18555fa9ffa3f5c01a245b
toc: true
category: Spring
tags:
- spring
- spring-boot
- jwt
---

Spring에서 JWT를 다루는 법을 알아보겠습니다

<!-- more -->

# 1. 준비

```gradle build.gradle
dependencies {
    implementation 'io.jsonwebtoken:jjwt-api:0.11.2'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.11.2'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.2'
}
```

```java MyPayload.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyPayload {
    private Integer id;
    private String name;
    private boolean isMale;
}
```

# 2. 키 생성

```java
// 새로운 키 생성
SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
String secret = Encoders.BASE64.encode(key.getEncoded());

// 이미 있는 키 사용
String secret = "verylonglonglonglonglonglonglonglonglonglongsecretkey";
SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
```

# 3. 토큰 생성

```java
String subject = "Foo";
MyPayload payload = new MyPayload(1, "Bar", true);
Date expireDate = new Date(System.currentTimeMillis() + SESSION_TIME * 1000);

String token = Jwts.builder()
        .setSubject(subject)
        .setExpiration(expireDate)
        .claim("payload", payload)
        .signWith(key)
        .compact();
```

`io.jsonwebtoken:jjwt-jackson`를 설치하면 JJWT가 자동으로 Jackson 라이브러리를 가져다쓰기 때문에 따로 JSON 매핑을 위한 작업을 하지 않아도 됩니다.

### 3.1. 커스텀 ObjectMapper 추가

만약에 일반적인 JSON 매핑작업이 아니라 커스텀으로 만들어 놓은 `ObjectMapper`를 사용하고 싶다면 아래와 같이 `serializeToJsonWith`를 추가하면 됩니다.

```diff
String token = Jwts.builder()
        .setSubject(subject)
        .setExpiration(expireDate)
+       .serializeToJsonWith(new JacksonSerializer<>(objectMapper))
        .claim("payload", payload)
        .signWith(key)
        .compact();
```

# 4. 토큰 검증

```java
Claims claims = Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();

String subject = claims.getSubject();
Date expireDate = claims.getExpiration();
MyPayload payload = new ObjectMapper().convertValue(claims.get("payload"), MyPayload.class);
```

토큰이 만료된 경우 `parseClaimsJws` 메서드에서 `io.jsonwebtoken.ExpiredJwtException`이 발생합니다.

# 5. 조건을 추가한 토큰 검증

```diff
Claims claims = Jwts.parserBuilder()
        .setSigningKey(key)
+       .requireSubject("Foo") // 이렇게 조건을 추가할 수 있다.
        .build()
        .parseClaimsJws(token)
        .getBody();
```

위와 같이 토큰을 검증할 때 조건을 추가할 수 있습니다.
다음과 같이 거의 모든 Claim에 조건을 추가할 수 있습니다.
이러한 기능은 Authorization에 유용합니다.

만약 해당 Claim이 없는 경우 `io.jsonwebtoken.MissingClaimException`이,
해당 Claim이 다른 경우 `io.jsonwebtoken.IncorrectClaimException`이 발생합니다.

## 5.1. 사용가능한 토큰 검증 조건 목록

```java
requireId(String id);
requireSubject(String subject);
requireAudience(String audience);
requireIssuer(String issuer);
requireIssuedAt(Date issuedAt);
requireExpiration(Date expiration);
requireNotBefore(Date notBefore);
require(String claimName, Object value);
```
