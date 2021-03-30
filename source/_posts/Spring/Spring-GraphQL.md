---
layout: post
title: Spring Boot - GraphQL
date: 2021-03-27 16:54:00 +0900
cover: /covers/spring.png
disqusId: d2aad2991a36e8751256b5b4ab7359e5cad0f00c
toc: true
category: Spring
tags:
- spring
- spring-boot
- graphql
---

GraphQL이 무엇인지, 문법은 어떻게 되는지는 다루지 않고 Spring Boot에서 어떻게 GraphQL을 사용하는지에 대한 것만 알아보겠습니다. 

<!-- more -->

# 1. 준비

## 1.1. 디펜던시 추가

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
  implementation 'com.graphql-java:graphql-spring-boot-starter:5.0.2'
  implementation 'com.graphql-java:graphql-java-tools:5.2.4'
}
```
</div>

<div class="tab-content maven">
```xml pom.xml
<dependencies>
    <dependency>
        <groupId>com.graphql-java</groupId>
        <artifactId>graphql-spring-boot-starter</artifactId>
        <version>5.0.2</version>
    </dependency>
    <dependency>
        <groupId>com.graphql-java</groupId>
        <artifactId>graphql-java-tools</artifactId>
        <version>5.2.4</version>
    </dependency>
</dependencies>
```
</div>

## 1.2. 모델 추가

앞으로 쓰일 User 모델입니다.

```java User.java
@Data
public class User {
    private long id;
    private String name;
    private int age;
}
```

## 1.3. Repostory 추가

실습을 위해 만든 데이터를 저장하는 클래스입니다. 나중에 실제 데이터베이스를 사용할 때는 그에 맞는 클래스를 생성해서 쓰면 됩니다.

```java UserRepository
@Repository
public class UserRepository {
    public ArrayList<User> users = new ArrayList<>(Arrays.asList(
        new User(1, "John", 20),
        new User(2, "James", 22)
    ));
}
```

# 2. schema 파일 생성

`resources` 폴더에 아래의 파일을 추가합니다. 파일명을 어느 이름으로 해도 상관없습니다.

```graphql index.graphqls
type User {
    id: ID!
    name: String!
    age: Int!
}

input UserInput {
    id: ID!
    name: String!
    age: Int!
}

type Query {
    getUsers: [User]!
    getUser(id: ID!): User
}

type Mutation {
    addUser(input: UserInput!): User!
}
```

# 3. GraphQLQueryResolver

다음과 같이 GraphQLQueryResolver를 상속한 클래스를 하나 만들어 우리가 위에서 정의한 Query를 처리합니다.
여기서 각 메서드의 이름은 스키마에서 정의한 이름과 정확히 일치해야합니다.

```java
import com.coxautodev.graphql.tools.GraphQLQueryResolver;

@Component
public class UserQueryResolver implements GraphQLQueryResolver {
    @Autowired
    private UserRepository repository;

    public List<User> getUsers() {
        return repository.users;
    }

    public Optional<User> getUser(long id) {
        return repository.users.stream()
            .filter(v -> v.getId() == id)
            .findAny();
    }
}
```

curl 명령어를 통해 아래와 같은 결괏값을 받을 수 있습니다.

```bash
# getUsers
$ curl -XPOST localhost:8080/graphql \
  -d '{"query": "query { getUsers { id, name, age } }"}'

{"data":{"getUsers":[{"id":"1","name":"John","age":20},{"id":"2","name":"James","age":22}]}}

# getUser
$ curl -XPOST localhost:8080/graphql \
  -d '{
    "query": "query($id: ID!) { getUser(id: $id) { id, name, age } }",
    "variables": { "id": 2 }
  }'

{"data":{"getUser":{"id":"2","name":"James","age":22}}}

# getUser (없는 데이터를 요청한 경우)
$ curl -XPOST localhost:8080/graphql \
  -d '{
    "query": "query($id: ID!) { getUser(id: $id) { id, name, age } }",
    "variables": { "id": 100 }
  }'

{"data":{"getUser":null}}
```

# 4. GraphQLMutationResolver

`UserInput` 클래스를 만듭니다. Mutation의 input으로 쓰이는 클래스는 파라미터가 없는 생성자가 있어야합니다.

```java
@Getter
@NoArgsConstructor
public class UserInput {
    private long id;
    private String name;
    private int age;
}
```

다음과 같이 GraphQLMutationResolver를 상속한 클래스를 하나 만들어 우리가 위에서 정의한 Mutation를 처리합니다.
여기서 각 메서드의 이름은 스키마에서 정의한 이름과 정확히 일치해야합니다.

```java
import com.coxautodev.graphql.tools.GraphQLMutationResolver;

@Component
public class UserMutationResolver implements GraphQLMutationResolver {
    @Autowired
    private UserRepository repository;

    public User addUser(UserInput input) {
        User newUser = new User(input.getId(), input.getName(), input.getAge());
        repository.users.add(newUser);
        return newUser;
    }
}
```

curl 명령어를 통해 아래와 같은 결과값을 받는 것 을 볼 수 있습니다. 

```bash
$ curl -XPOST localhost:8080/graphql \
  -d '{
    "query": "mutation($input: UserInput!) { addUser(input: $input) { id, name, age } }",
    "variables": { "input": { "id": 3, "name": "Tom", "age": 24 } }
  }'

{"data":{"addUser":{"id":"3","name":"Tom","age":24}}}
```

# 5. GraphiQL

![GraphiQL의 모습](./graphiql.jpg)

GraphiQL은 위와 같이 GraphQL을 테스트 할 수 있는 웹 페이지를 현재 프로젝트에 추가해 줍니다.
먼저 디펜던시를 추가한 후, `/graphiql` 경로로 들어가면 위와 같은 화면을 볼 수 있습니다.

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
  implementation 'com.graphql-java:graphiql-spring-boot-starter:5.0.2'
}
```
</div>

<div class="tab-content maven">
```xml pom.xml
<dependencies>
    <dependency>
        <groupId>com.graphql-java</groupId>
        <artifactId>graphiql-spring-boot-starter</artifactId>
        <version>5.0.2</version>
    </dependency>
</dependencies>
```
</div>

# 6. GraphQL SPQR

[GraphQL SPQR](https://github.com/leangen/graphql-spqr-spring-boot-starter)은
간단히 말해서 Annotation 만으로 GraphQL 스키마 파일(*.graphqls)을 자동으로 생성해주는 라이브러리입니다.

GraphQL을 이용하여 개발을 하다보면 수정이 일어날 때 마다 GraphQL 스키마 파일과 스프링 내부적으로 사용하는 클래스에 2번씩 수정해야 합니다.
이 라이브러리를 사용하면 이러한 수고를 덜 수 있습니다.

위에서 설치한 디펜던시를 전부 지우고 아래의 디펜던시를 추가합니다.
보시다시피 이 라이브러리의 버전은 아직 `0.0.6`으로 초기 단계입니다. 따라서 릴리즈하는 프로젝트에는 적합하지 않습니다.

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
  implementation 'io.leangen.graphql:graphql-spqr-spring-boot-starter:0.0.6'
  implementation 'org.springframework.boot:spring-boot-starter-web'
}
```
</div>

<div class="tab-content maven">
```xml pom.xml
<dependencies>
    <dependency>
        <groupId>io.leangen.graphql</groupId>
        <artifactId>graphql-spqr-spring-boot-starter</artifactId>
        <version>0.0.6</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```
</div>

다음과 같이 클래스에는 `@GraphQLApi` 어노테이션을, 각 메서드에는 `@GraphQLQuery`, `@GraphQLMutation`을 붙이면 끝입니다!

```java UserGraphQL.java
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;

@Component
@GraphQLApi
public class UserGraphQL {
    @Autowired
    private UserRepository repository;

    @GraphQLQuery
    public List<User> getUsers() {
        return repository.users;
    }

    @GraphQLQuery
    public Optional<User> getUser(long id) {
        return repository.users.stream()
            .filter(v -> v.getId() == id)
            .findAny();
    }

    @GraphQLMutation
    public User addUser(UserInput input) 
        User newUser = new User(input.getId(), input.getName(), input.getAge());
        repository.users.add(newUser);
        return newUser;
    }
}
```

그러면 다음과 같은 스키마가 자동으로 생성됩니다.

```graphql
type Mutation {
  addUser(input: UserInputInput): User
}

type Query {
  user(id: Long!): User
  users: [User]
}

type User {
  age: Int!
  id: Long!
  name: String
}

input UserInputInput {
  age: Int!
  id: Long!
  name: String
}
```

보면 함수들이 이름이 살짝씩 바뀌어 있고, input 타입도 이름이 바뀌어 있는 것을 볼 수 있습니다.
이제 다양한 어노테이션을 추가해가면서 스키마를 커스터마이징 할 수 있습니다.

## 6.1. IDE

```ini application.properties
graphql.spqr.gui.enabled=true
```

위의 설정을 한 후 `/ide` 경로로 접속하면 아래와 같이 GraphQL을 테스트 할 수 있는 웹 페이지를 볼 수 있습니다.

![GraphQL SPQR의 IDE의 모습](./ide.jpg)
