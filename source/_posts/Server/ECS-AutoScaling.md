---
layout: post
title: EC2 Container Service(ECS) 사용하기 + AutoScaling
date: 2018-01-30 16:31:30 +0900
cover: /covers/aws-ecs.jpg
disqusId: 0a8e0249df03e6e3183d1f2bd396a7d3af78d703
toc: true
category: Server
tags:
- aws
- ecs
- docker
---

EC2 Container Service(ECS) 사용하기 + AutoScaling

<!-- more -->

## 기본적인 Docker 사용법은 안다고 가정하겠습니다. (설치, 명령어 등)

![image000](000.jpg)

현재 저는 접속하면 hello world를 띄워주는 서비스를 제공 하고 있습니다.
이 서비스는 AWS EC2와 nodejs를 사용하고 있습니다.
ECS라는 서비스를 사용 하려고 합니다.

# 1. 도커 이미지 만들기

### Dockerfile
```
FROM ubuntu:16.04
MAINTAINER Noverish Harold <embrapers263@gmail.com>

WORKDIR /root

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y git
RUN git clone https://github.com/Noverish/simple-nodejs

CMD cd /root/simple-nodejs; git pull origin master; nodejs index.js

EXPOSE 80
EXPOSE 443
```
위 처럼 자신이 만들고 싶은 도커 이미지의 Dockerfile을 만듭니다.
Dockerfile은 만들 줄 아신다고 생각하겠습니다.

```shell
$ docker build --tag main-image .
```
Dockerfile이 있는 위치에서 위의 명령어를 통해 이름이 `main-image`인 도커 이미지를 만들었습니다.

# 2. ECS 설정하기

![image001](001.jpg)
[AWS ECS](https://ap-northeast-2.console.aws.amazon.com/ecs)에 들어가서 `시작하기`를 누릅니다.

---

![image002](002.jpg)
우리는 둘 다 할 것이므로 둘다 체크하고 넘어갑니다.

---

![image003](003.jpg)
리포지토리 이름은 그냥 `test`라고 했습니다.

---

![image004](004.jpg)
위의 명령어를 통해 리포지토리에 로그인 하고 이미지를 푸쉬하라는데 밑에 자세히 설명하도록 하겠습니다.

---

일단 AWS CLI를 설치해야 합니다.

맥 기준으로
```shell
$ brew install awscli
```
명령어를 통해 AWS CLI를 설치합니다.
다른 OS는 알아서...

![image005](005.jpg)
그다음에 설정을 해줘야 하는데 `aws configure` 명령어를 통해
IAM User의 Access ID와 Secret Key를 위 처럼 입력해주시면 됩니다.

---

이제 AWS CLI 설정은 끝났습니다.
아까 페이지의 명령어를 차례대로 따라하시면 됩니다.

```shell
$ aws ecr get-login --no-include-email --region ap-northeast-2
```
이 명령어를 통해 로그인을 하면

![image006](006.jpg)
위와 같이 엄청 긴 명령어가 나옵니다.

![image007](007.jpg)
만약 위와 같이 에러 메세지가 나온다면 `aws configure`를 통해 설정 해준 유저에 권한이 없어서 생기는 문제입니다.

![image008](008.jpg)
AWS IAM에서 위의 권한을 유저에 할당하시면 됩니다.

![image009](009.jpg)
아까의 명령어에서 반환된 결과를 복붙해서 실행합니다.

```shell
$ docker tag main-image:latest 123456789123.dkr.ecr.ap-northeast-2.amazonaws.com/test:latest
$ docker push 123456789123.dkr.ecr.ap-northeast-2.amazonaws.com/test:latest
```
위의 명령어는 예시 입니다. 본인의 명령어는 `단계 2: Docker 이미지 빌드, 태그 지정 푸쉬` 페이지에서 확인하시기 바랍니다.
우리가 만들어 놓은 도커 이미지 이름은 `main-image`이고 리포지토리 이름은 `test`입니다.
이에 주의하면서 위의 명령어를 입력하면 아래와 같이 업로드가 진행됩니다.

![image010](010.jpg)
위의 명령어를 입력하면 위와 같이 우리가 만들어 놓은 이미지가 리포지토리에 푸쉬됩니다.
그 다음에 페이지의 다음 단계로 넘어갑니다.

---

![image011](011.jpg)
작업 정의 이름을 `test-task-definition`으로
컨테이너 이름을 `test-container`으로 해줬습니다.
여기서 주의 해야 할 점은 위와 같이 호스트 포트를 꼭 0으로 해주어야 합니다!
0으로 해주지 않으면 뒤에서 할 AutoScaling을 할 때
Load Balancer의 포트 번호가 이미 사용 중이라고 해서 에러가 납니다.
여기서 0의 의미는 자동으로 할당한다는 의미 입니다.

---

![image012](012.jpg)
![image013](013.jpg)
서비스 이름을 `test-service`라고 지었습니다.
우리가 아까 호스트 포트를 0으로 설정해 놔서
강제로 Load Balancer를 사용 하는 것으로 되어 있습니다.
그리고 넘어갑니다.

---

![image014](014.jpg)
자신이 원하는 설정 하시고 넘어갑니다.

---

![image015](015.jpg)
![image016](016.jpg)
`인스턴스 시작 및 서비스 실행`을 누릅니다

---

![image017](017.jpg)
그러면 ELB, VPC, EC2등 다양한 것들을 설정합니다.
이 작업은 몇 분 정도 걸립니다.
작업이 끝나면 서비스 보기를 누릅니다.

---

![image019](019.jpg)
위와 같이 나오면 성공입니다.

---

# 2. AutoScaling 설정하기

![image020](020.jpg)
`Auto Scaling`을 누릅니다.
아직 아무 것도 없다고 뜹니다.
업데이트를 누릅니다.

---

![image021](021.jpg)
그냥 넘어갑니다.

---

![image022](022.jpg)
여기도 그냥 넘어갑니다.

---

![image023](023.jpg)
저는 최소 작업 개수를 1개로 최대 작업 개수를 5개로 했습니다.
다르게 해도 상관 없습니다.
`조정 정책 추가`를 누릅니다.

---

![image024](024.jpg)
정책 이름을 `test-policy`로 했습니다.
`새 경보 생성`을 누릅니다.
알람 이름을 `test-alarm`으로 했습니다.
위와 같이 한 다음에 `저장`을 누릅니다.

위에서 설정한 값의 의미는
1개의 컨테이너가 1분 이상 평균 CPU 사용량이 1퍼센트가 넘으면 경보가 울린다는 의미입니다.

---

![image025](025.jpg)
조정 작업에서 1 추가로 합니다.    
이 의미는 경보가 울리면 작업을 1개 추가 한다는 의미 입니다.

---

![image026](026.jpg)
그리고 다음 단계로 넘어갑니다.

---

![image027](027.jpg)
![image028](028.jpg)
서비스 업데이트를 누릅니다.

---

![image029](029.jpg)
위와 같이 설정 작업이 끝날 때 까지 기다립니다.

---

![image030](030.jpg)
EC2 대쉬보드로 들어가서 로드밸런서의 DNS 주소를 찾습니다.

---

![image031](031.jpg)
정상적으로 페이지가 나오는 걸 확인 할 수 있습니다.

---

![image032](032.jpg)
[CloudWatch](https://ap-northeast-2.console.aws.amazon.com/cloudwatch)에 들어가면
위 사진과 같이 우리가 설정해 놓은 알림이 있는 것을 확인 할 수 있습니다.

이제 이 알림이 울리게 하기 위해 아까의 페이지에서 새로고침을 연타합니다!
CPU 사용률을 늘려서 AutoScaling이 되는 것을 확인하기 위해서 입니다.
(물론 설정해 놓은 사용률이 1%여서 굳이 안해도 경보가 울리긴 합니다.)

![image033](033.jpg)
그러면 이렇게 경보가 생기는 것을 알 수 있습니다.

---

![image034](034.jpg)
이제 ECS 대쉬보드로 넘어가면 AutoScaling이 된 것을 확인 할 수 있습니다.
