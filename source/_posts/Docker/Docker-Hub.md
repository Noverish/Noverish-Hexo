---
layout: post
title: Docker Hub에 도커 이미지 배포해보기
date: 2020-03-28 18:32:00 +0900
description: Template description
thumbnail: /thumbnails/docker.png
category: 'docker'
tags:
- docker
twitter_text: template twitter_text
---

Github Repository와 연동하여 나만의 Docker Image를 Docker Hub에 배포하는 법을 알아보도록 하겠습니다.

<!-- more -->

## 목차
[1. Repository 생성](#1-Repository-생성)    
[2. Docker Hub와 Gitub 연동](#2-Docker-Hub와-Gitub-연동)    
[3. 실행해보기](#3-실행해보기)    
[4. Docker Hub Readme](#4-Docker-Hub-Readme)    

---

# 1. Repository 생성

## 1.1. Docker Hub Repository 생성

[Docker Hub](https://hub.docker.com/)에 접속하여 회원가입을 합니다.

회원 가입 후 상단의 `Repositories` 탭에 들어간 후 `Create Repository` 버튼을 클릭합니다.

![001.png](001.png)

Repository 이름은 `docker-hub-test`로 하고 Visibility는 `Public`, Build Settings는 건들지 않고 `Create` 버튼을 클릭합니다.

## 1.2. Github Repository 생성

Github에 `docker-hub-test`라는 이름의 레파지토리를 하나 생성한 후 아래의 Dockerfile과 README.md 파일을 넣습니다.

Dockerfile
```Dockerfile
FROM alpine
ENTRYPOINT echo "hello, world!"
```

README.md
```
README!!!
```

# 2. Docker Hub와 Gitub 연동

![002.png](002.png)

레파지토리에서 `Builds` 탭에 들어가서 `Link to GitHub` 버튼을 누릅니다.

![003.png](003.png)

Github 탭의 `Connect` 버튼을 누릅니다.
버튼을 누르면 Github에 로그인 하라는 화면이 뜰텐데 로그인 한 후 `Authorize Docker Hub Builder` 페이지가 나오면 `Authorize` 버튼을 눌러 권한을 승인해 줍니다.

이런 과정을 통해 Docker Hub가 내 Github Repository에 접근하여 Push가 발생할 때마다 Docker Image를 빌드하여 Docker Hub에 푸시할 수 있습니다.

![005.png](005.png)

다시 레파지토리에서 `Builds` 탭에 들어가면 위와 같이 `Connected` 라고 뜰텐데 이 버튼을 클릭합니다.

![006.png](006.png)

Source Repository는 우리가 방금 만들었던 Github Repository를 선택합니다.

Autotest는 Docker Hub가 Github Repository에 Pull Request가 들어왔을 경우 설정한 Shell Script를 실행해 테스트를 할 수 있게 해주는 것입니다.
일단 Off로 설정해둡니다.
자세한 정보는 [문서](https://docs.docker.com/docker-hub/builds/automated-testing/)를 참고해주세요.

Repository Link는 Dockerfile의 FROM에 적혀있는 베이스 이미지가 __공식 이미지가 아닐 경우__ 이 이미지가 업데이트 되면 다시 빌드하게 해주는 것입니다.
일단 Off로 설정해둡니다.

![007.png](007.png)

이 단계에서 가장 중요한 Build Rule을 설정해야 합니다.
이 설정을 통해 __언제 어떻게 이미지 태그를 붙일것인지__ 설정할 수 있습니다.
위의 시나리오를 참고하여 설정해 주길 바랍니다.

밑의 Build Environment Variable을 설정하여 빌드할 때 환경 변수를 설정할 수 있습니다.

설정이 다 끝난 후 `Save and Build` 버튼을 눌러서 이미지를 빌드하도록 하겠습니다.

![008.png](008.png)

이미지 빌드가 끝난 후 위의 화면에서 SUCCESS 라고 뜨면 우리의 첫 도커 이미지가 세상에 나온 것입니다!

# 3. 실행해보기

이제 Docker가 설치된 아무 컴퓨터에서 아래의 명령어를 입력하여 우리의 도커 이미지가 잘 실행되는지 알아봅시다.

```shell
$ docker run [username]/docker-hub-test
Unable to find image '[username]/docker-hub-test:latest' locally
latest: Pulling from [username]/docker-hub-test
aad63a933944: Already exists
Digest: sha256:3522bf472b4bc691a7b967ea5d32a94fdb8797202b126bffd494fe8c93b3e6aa
Status: Downloaded newer image for [username]/docker-hub-test:latest
hello, world!
```

위와 같이 도커 이미지를 다운로드 받은 후 hello, world!가 뜨면 성공입니다.

# 4. Docker Hub Readme

위와 같이 Github 레파지토리와 연동하여 이미지를 푸쉬할 경우
Docker Hub는 자동적으로 __Dockerfile이 있는 폴더__ 에서
README.md 파일을 가져와 Docker Hub 레파지토리의 Readme에 덮어씌웁니다.

![009.png](009.png)

Docker Hub의 레파지토리에 가시면 우리가 Github에 올려뒀던 README.md 파일의 내용이 뜨는 것을 볼 수 있습니다.
