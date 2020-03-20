---
layout: post
title: Github Actions 사용해보기
date: 2020-03-20 20:09:00 +0900
description: Template description
thumbnail: /thumbnails/github-actions.jpg
category: 'etc'
tags:
- github
- CI/CD
twitter_text: template twitter_text
---

Github Actions를 이용하여 개발 PC에서 배포 서버까지 빌드, 테스트, 배포를 자동화 해보자!

<!-- more -->

## 목차
[1\. 첫 Workflow 생성하기](#1-첫-Workflow-생성하기)    
[2\. 다양한 Action들](#2-다양한-Actions)    

---

일반적으로 개발을 할 때 개발 PC가 있고 배포 타겟이 있습니다.
- Android, iOS는 Play Store, App Store에 배포합니다.
- Web Frontend, Backend는 Heroku, AWS, 또는 본인 소유의 서버에 배포합니다.
- Docker 이미지는 Docker hub, NPM Package는 NPM Repository에 배포합니다.

우리는 배포를 할 때 테스트 하고 빌드 하고 패키징 해서 배포 타겟에 넣어줍니다.
그런데 이 것도 하루 이틀이지 업데이트 할 때 마다 하면 매우 귀찮은 작업입니다.

그래서 Github Actions를 통해 이를 자동화 할 수 있는 법을 알아보겠습니다.

# 1. 첫 Workflow 생성하기

Workflow는 프로젝트를 빌드, 테스트, 패키징, 릴리즈, 배포 등을 할 수 있게 자동화된 프로세스 입니다.

단순히 Github Repository에서 `.github/workflows/main.yml` 파일을 생성해서 아래의 내용을 넣어주시면 됩니다.

```yml
name: Main

on:
  push:
    branches:
    - master

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
    - run: echo "hello, world!"
```

위의 내용을 잠깐 설명해 보겠습니다.

- 1번째 줄: Workflow의 이름입니다. 이 부분이 생략되면 파일 이름을 Workflow 이름으로 사용합니다.
- 3번째 줄: master 브랜치에 푸시가 들어왔을 때 이 Workflow를 실행시키겠다는 의미입니다.
- 9번째 줄: hello라는 job을 명시 합니다.
- 10번째 줄: 이 job은 최신 ubuntu 머신에서 실행된다는 것을 나타냅니다.
- 12번째 줄: 머신에서 실행할 명령어를 명시합니다.

---

![001.png](./001.png)

위의 내용을 입력한 뒤 master 브랜치에 푸시 하신 후 위와 같이 Actions 탭에 들어갑니다.

---

![002.png](./002.png)

그러면 위와 같이 방금 실행된 Workflow가 있을 텐데 클릭해서 들어갑니다.

---

![003.png](./003.png)

위와 같이 `hello, world`를 띄운 것을 확인 할 수 있습니다!

# 2. 다양한 Action들

빌드, 테스트, 배포를 자동화 하기 위해서는
코드도 다운로드 받아야 하고 환경도 세팅해줘야 하고 배포 대상에 로그인 해서 파일을 푸쉬까지 해야 하는데
run에서 명령어를 명시 하는 것 만으로는 많이 부족하고 너무 복잡해 집니다.

따라서 action이라는 것을 사용할 수 있는데 이는 다른 사람들이 만들어 놓은 명령어들의 모음입니다.

아래의 workflow 파일은 제가 사용하고 있는 workflow 입니다.

```yml
name: Main

on:
  push:
    branches:
    - master

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-node@v1
    - uses: actions/cache@v1
      with:
        path: node_modules
        key: ${{ runner.OS }}-node-${{ hashFiles('**/package-lock.json') }}
    - run: npm install
    - run: npm run eslint
    - run: docker build -t hyunflix/frontend .
    - run: docker save -o hyunflix-frontend.tar hyunflix/frontend
    - uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        port: ${{ secrets.PORT }}
        source: "hyunflix-frontend.tar"
        target: "/home/hyunsub/environment/hyunflix"
    - uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        port: ${{ secrets.PORT }}
        script: cd ~/environment/hyunflix; docker load -i hyunflix-frontend.tar; docker-compose up -d --force-recreate frontend; rm hyunflix-frontend.tar
```

- 13번째 줄: 이 Workflow가 있는 Repository를 Runner에 다운로드 합니다.
- 14번째 줄: 현재 Runner에 node 환경을 세팅합니다.
- 15번째 줄: node_modules를 캐싱해서 다음에 이 Workflow가 실행될 때 node_modules 폴더를 캐시에서 다운로드 받아 `npm install` 명령어가 더 빨리 실행될 수 있게 합니다.
- 16번째 줄: 캐싱의 키는 runner의 OS와 package-lock.json 파일의 해시 값입니다. 이 두 값이 같다면 node_modules 폴더의 내용도 같다고 보는 것입니다.
- 23번째 줄: source의 파일을 target에 scp로 보내는 action 입니다. 보안이 필요한 값들은 Repository 설정에서 Secret에 저장해 두었습니다.
- 31번째 줄: 원격 서버에 ssh로 접속해서 script의 내용을 실행하는 action입니다.
