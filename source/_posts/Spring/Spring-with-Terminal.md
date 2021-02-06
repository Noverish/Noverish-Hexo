---
layout: post
title: Terminal로 Spring Boot 다루기
date: 2020-12-16 20:21:00 +0900
cover: /covers/spring.png
disqusId: 8e41e4ca00274c9af1eaa32a4bea2c42327504c4
toc: true
category: Spring
tags:
- spring
- spring-boot
---

IntelliJ나 eclipse와 같은 IDE의 도움을 받지 않고 Spring을 빌드, 실행, 테스트 하는 방법을 알아보겠습니다.
Maven과 Gradle 모두 다루고 있습니다.

<!-- more -->

# 1. 프로젝트 생성하기

## 1.1. Spring Boot 프로젝트 템플릿 다운로드

먼저 [Spring Initializr](https://start.spring.io/)에 들어간 다음 원하는 옵션을 입력한 후, 하단의 GENERATE 버튼을 누르면 zip 파일로 프로젝트 템플릿을 다운로드 받을 수 있습니다. 본 문서는 Gradle과 Java 8을 기반으로 작성되어 있으므로 해당 옵션으로 변경합니다.

매번 사이트에 접속해서 다운로드 받는 것이 번거롭다면 아래와 같이 curl 명령어를 이용해 터미널로 바로 다운로드 받을 수 있습니다.

```shell
# default값과 다른 옵션만 명시
$ curl https://start.spring.io/starter.zip \
    -d 'type=gradle-project' \
    -d 'baseDir=demo' \
    -d 'javaVersion=1.8' \
    --output starter.zip

# 모든 옵션 명시
$ curl https://start.spring.io/starter.zip \
    -d 'type=gradle-project' \
    -d 'language=java' \
    -d 'bootVersion=2.4.0.RELEASE' \
    -d 'baseDir=demo' \
    -d 'groupId=com.example' \
    -d 'artifactId=demo' \
    -d 'name=demo' \
    -d 'packageName=com.example.demo' \
    -d 'packaging=jar' \
    -d 'javaVersion=1.8' \
    --output starter.zip
```

보다 자세한 정보는 [문서](https://docs.spring.io/initializr/docs/current/reference/html/)를 참고해 주시길 바랍니다.

## 1.2. Spring Boot 프로젝트 실행

아래 명령어를 통해 Spring Boot 프로젝트를 실행합니다.

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
```shell
$ ./gradlew bootRun
```
</div>

<div class="tab-content maven">
```shell
$ ./mvnw spring-boot:run
```
</div>

아래와 같은 출력이 나왔으면 성공입니다.

```text
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v2.4.0)

2020-12-03 01:34:07.779  INFO 2041 --- [           main] com.example.demo.DemoApplication         : Starting DemoApplication using Java 15.0.1 on Hyunsub-MacBookPro.local with PID 2041 (/Users/hyunsub/Documents/Spring/demo/build/classes/java/main started by hyunsub in /Users/hyunsub/Documents/Spring/demo)
2020-12-03 01:34:07.782  INFO 2041 --- [           main] com.example.demo.DemoApplication         : No active profile set, falling back to default profiles: default
2020-12-03 01:34:08.236  INFO 2041 --- [           main] com.example.demo.DemoApplication         : Started DemoApplication in 1.07 seconds (JVM running for 1.403)
```

# 2. 프로젝트 빌드하기

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

<code class="tab-content gradle">build.gradle</code>
<code class="tab-content maven">pom.xml</code>
에 변경된 부분이 있으면 반영하고 java파일을 class파일로 컴파일하는 작업입니다.

<div class="tab-content gradle">
```shell
$ ./gradlew build
```
</div>

<div class="tab-content maven">
```shell
$ ./mvnw compile
```
</div>

# 3. 프로젝트를 jar 파일로 빌드하기

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
```shell
$ ./gradlew bootJar
```
</div>

<div class="tab-content maven">
```shell
$ ./mvnw package
```
</div>

위 명령어를 실행하면
<code class="tab-content gradle">build/libs</code>
<code class="tab-content maven">target</code>
폴더에
`demo-0.0.1-SNAPSHOT.jar` 와 같은 이름으로 jar 파일이 생성됩니다. 이 파일은 아래의 명령어로 실행하면 됩니다.

```shell
$ java -jar demo-0.0.1-SNAPSHOT.jar
```

# 4. Spring Boot devtools

Spring Boot Devtools가 어떤 기능을 제공하는지에 대한 설명은 이 [외부 블로그 글](https://velog.io/@bread_dd/Spring-Boot-Devtools)을 읽어 주길 바랍니다. 우리는 Terminal에서 어떻게 사용해야 하는지 알아보겠습니다.

## 4.1. 설치 및 확인

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
build.gradle에 아래와 같이 Dependency를 추가합니다.

```gradle build.gradle
dependencies {
  developmentOnly 'org.springframework.boot:spring-boot-devtools'
}
```
</div>

<div class="tab-content maven">
pom.xml에 아래와 같이 Dependency를 추가합니다.

```xml pom.xml
<dependencies>
  ...
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
  </dependency>
  ...
</dependencies>
```
</div>

추가한 후 실행해서 나오는 출력에서 아래와 같이 main이 restartedMain으로 바뀌어서 나오면 성공입니다. 

```text
# devtools 추가 하기 전
2020-12-03 16:59:59.532  INFO 20300 --- [           main]

# devtools 추가 한 후
2020-12-03 16:59:59.532  INFO 20300 --- [  restartedMain]
```

## 4.2. Automatic Restart

devtools의 가장 큰 기능 중에 하나는 코드를 수정하면 자동으로 서버를 재시작 해주는 Automatic Restart 입니다. 하지만 **devtools는 src 폴더의 java 파일을 watch 하는 것이 아니라 `classpath` 경로의 class 파일을 watch 합니다.** 따라서 우리가 아무리 java 파일을 수정해봤자 devtools는 별다른 반응을 하지 않습니다. 이 때문에 우리는 아래와 같이 두 명령어를 동시에 실행시켜 놓아야 이 기능이 정상적으로 동작합니다.

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

두 터미널에 각각 다음과 같은 명령어를 입력합니다.

```shell
# Terminal 1
$ ./gradlew build -continuous

# Terminal 2
$ ./gradlew bootRun
```

</div>

<div class="tab-content maven">

Maven에는 Gradle과 달리 watch를 하면서 빌드를 하는 기능이 없습니다.
따라서 외부 플러그인을 사용해야 합니다.

다음의 소스를 `pom.xml`에 추가합니다.

```xml
<build>
    <plugins>
        ...
        <plugin>
            <groupId>com.fizzed</groupId>
            <artifactId>fizzed-watcher-maven-plugin</artifactId>
            <version>1.0.4</version>
            <configuration>
                <files>
                    <param>src/main/java</param>
                    <param>src/main/resources</param>
                </files>
                <goals>
                    <param>clean</param>
                    <param>compile</param>
                </goals>
                <profiles>
                    <param>optional-profile-to-activate-while-running-goals</param>
                </profiles>
            </configuration>
        </plugin>
        ...
    </plugins>
</build>
```

그 후 두 터미널에 각각 다음과 같은 명령어를 입력합니다.

```shell
# Terminal 1
$ ./mvnw fizzed-watcher:run

# Terminal 2
$ ./mvnw spring-boot:run
```

자세한 정보는 [여기](http://fizzed.com/blog/2015/02/watcher-plugin-for-maven-released)를 참고해주세요.
</div>

# 5. 테스트하기

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

아래의 명령어를 입력하면 `@Test` 어노테이션으로 등록된 테스트를 실행합니다.

<div class="tab-content gradle">
```shell
$ ./gradlew test
```

만약에 특정 클래스나 특정 메서드만 테스트하고 싶다면 아래와 같이 whildcard를 사용하면 됩니다.

```shell
# MyTest 클래스의 모든 메서드를 테스트
$ ./gradlew test --tests MyTest

# MyTest 클래스의 testFunc 메서드만 테스트
$ ./gradlew test --tests MyTest.testFunc

# 이름이 Test로 끝나는 클래스의 모든 메서드를 테스트
$ ./gradlew test --tests *Test

# 이름이 Test로 끝나는 클래스의 test로 시작하는 메서드를 테스트
$ ./gradlew test --tests *Test.test*

# 패키지가 kim.hyunsub.demo.service인 클래스의 모든 메서드를 테스트
$ ./gradlew test --tests kim.hyunsub.demo.service.*
```
</div>

<div class="tab-content maven">
```shell
$ ./mvnw test
```

만약에 특정 클래스나 특정 메서드만 테스트하고 싶다면 아래와 같이 whildcard를 사용하면 됩니다.

```shell
# MyTest 클래스의 모든 메서드를 테스트
$ ./mvnw -Dtest=MyTest test

# MyTest 클래스의 testFunc 메서드만 테스트
$ ./mvnw -Dtest=MyTest#testFunc test

# 이름이 Test로 끝나는 클래스의 모든 메서드를 테스트
$ ./mvnw -Dtest=*Test test

# 이름이 Test로 끝나는 클래스의 test로 시작하는 메서드를 테스트
$ ./mvnw -Dtest=*Test#test* test

# 패키지가 kim.hyunsub.demo.service인 클래스의 모든 메서드를 테스트
$ ./mvnw -Dtest=kim/hyunsub/demo/service/* test
```
</div>
