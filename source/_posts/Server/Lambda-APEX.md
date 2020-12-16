---
layout: post
title: APEX로 AWS Lambda 개발하기
date: 2018-02-27 16:10:24 +0900
cover: /covers/apex.jpg
disqusId: 37c8ec179a4a039572a4db325a215e369ef11e21
toc: true
category: Server
tags:
- aws
- lambda
- apex
---

APEX라는 프로그램을 사용하여 AWS Lambda를 개발해 서버리스 백엔드를 구현해 보자.

<!-- more -->

# 1. APEX 설치하기

```shell
$ curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sudo sh
```

macOS, Linux, or OpenBSD에서 위의 명령어를 실행시키면 자동으로 설치가 됩니다.

---

# 2. APEX에 AWS 권한 부여하기

APEX가 Lambda 함수들을 만들고/지우고/수정하고/실행할 수 있도록 권한을 줘야 합니다.

먼저 APEX가 필요로 하는 권한을 묶은 커스텀 정책을 만듭시다.

![image001](001.jpg)
[AWS IAM](https://console.aws.amazon.com/iam/home#/policies)로 들어가서 `정책 생성`을 누릅니다.

---

![image002](002.jpg)
json편집기에 들어가서 밑의 json을 그대로 입력해 줍시다.
그리고 `Review Policy`를 누릅니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:CreateRole",
        "iam:CreatePolicy",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:InvokeFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:CreateAlias",
        "lambda:UpdateAlias",
        "lambda:GetAlias",
        "lambda:ListAliases",
        "lambda:ListVersionsByFunction",
        "logs:FilterLogEvents",
        "cloudwatch:GetMetricStatistics"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

---

![image003](003.jpg)
정책의 이름을 `APEX-Policy`로 짓고 정책을 생성합니다.

---

![image004](004.jpg)
그리고 사용자에 이 정책을 추가합니다.
기존 사용자에 정책을 추가하셔도 되고, 새로운 사용자를 만드셔도 됩니다.
사용자를 만들거나 정책을 추가하는 방법은 설명하지 않도록 하겠습니다.

---

아까 정책을 추가한 사용자의 정보들을 아래의 위치한 파일에 추가합니다.
`access_key_id`와 `secret_access_key`는 따로 설명하지 않도록 하겠습니다.

~/.aws/credentials

```
[example]
aws_access_key_id = xxxxxxxx
aws_secret_access_key = xxxxxxxxxxxxxxxxxxxxxxxx
```

~/.aws/config
```
[profile example]
output = json
region = ap-northeast-2
```

---

아래의 명령어를 실행합니다.
위에서 입력한 프로필 이름에 따라 아래의 `example`을 바꿔주시기 바랍니다.
이렇게 하면 APEX가 `AWS_PROFILE` 환경변수에 접근해서 AWS 기능들을 사용할 수 있게 됩니다.

```shell
$ export AWS_PROFILE=example
```

---

# 3. 프로젝트 만들기

프로젝트 폴더를 생성하고 `apex init`를 입력하고 프로젝트의 이름과 설명을 입력하면 프로젝트가 생성됩니다.

```shell
$ mkdir APEX-Test && cd APEX-Test
$ apex init
```

<img src="005.jpg" width="500">

프로젝트의 이름은 `APEX-Test`    
프로젝트의 설명은 그냥 `.`으로 했습니다.

![image006](006.jpg)
이제 프로젝트 폴더를 보면 json파일과 hello라는 함수가 만들어져 있습니다.

---

# 4. 프로젝트 구조 살펴보기

## project.json

먼저 `project.json` 파일을 살펴보겠습니다.

![image008](008.jpg)

`role`은 배포할 함수의 role을 지정해 줍니다. 이 role은 APEX가 자동으로 생성한 것입니다.    
`memory`는 배포할 함수의 메모리 제한(MB)를 나타냅니다.    
`timeout`은 배포할 함수의 시간 제한(s)을 나타냅니다.    
`environment`는 배포할 함수에서 사용할 환경 변수를 나타냅니다.    
위의 값들을 자유롭게 본인의 프로젝트에 맞게 변경하시면 됩니다.    
이 밖에도 다양한 field들이 있습니다.

APEX에서는

1. `project.dev.json`, `project.prod.json`과 같이 다중 환경에서 개발 할 수 있는 기능
1. 각각의 함수 폴더 안에 `function.json`을 넣어서 함수 마다 다른 환경을 만들어 줄 수 있는 기능

등 을 제공하고 있습니다.

자세한 정보는 [프로젝트 구조 (영문)](http://apex.run/#structuring-projects)를 참고해 주세요

---

## 폴더 구조

![image006](006.jpg)

모든 함수는 `functions` 폴더안에 존재해야합니다.    
`functions` 폴더 밖에 만들어 둔 파일이나 폴더들은 APEX 에서는 무시합니다.

`functions` 폴더의 바로 sub폴더들의 이름이 람다 함수의 이름이 됩니다.    
특별한 설정을 하지 않는 이상 sub 폴더 안의 `index.js`가 람다 함수의 실행 파일이 됩니다.     
각각의 sub 폴더 안에서는 밖에 있는 파일에 접근 할 수 없습니다.      
함수를 배포 할 때에는 sub 폴더 안의 파일들만을 묶어서 배포하기 때문입니다.    

```
project.json

package.json
node_modules
└── ...

fun0
└── index.js

functions
├── global.js
├── fun1
│    ├── index.js
│    ├── package.json
│    └── node_modules
│         └── ...
└── fun2
     ├── asdf.js
     └── index.js
```
위의 프로젝트 구조를 예시로 들어보겠습니다.    
1. 프로젝트에는 2개의 함수가 존재합니다. (`fun1`, `fun2`)
1. APEX에서 함수를 배포할 때에는 `fun0`은 무시합니다.
1. `fun1`, `fun2` 함수를 실행 시키면 각각의 `index.js`가 실행됩니다.
1. `fun1/index.js` 에서는 `fun1/node_modules`에 접근할 수 있습니다.
1. `fun2/index.js` 에서는 `fun2/asdf.js`에 접근할 수 있습니다.
1. `fun2` 에서는 `global.js`에 접근할 수 없습니다.
1. `fun2` 에서는 모든 `node_mudules`에 접근할 수 없습니다.

만약에 모든 함수에 공통적으로 사용하고 싶은 npm module이 있어도
모든 함수 각각의 폴더 안에 `node_mudules`를 넣어야 합니다!

이를 해결 하기 위한 방법중에 하나는 `WebPack`을 사용하는 것인데 다음 시간에 알려드리도록 하겠습니다.

---

# 5. 함수 생성하기

그냥 단순하게 functions에 폴더 하나 만들어 주고 그 안에 index.js 파일을 만들어 주시면 됩니다.

![image009](009.jpg)

예시로 `test` 폴더를 만들고 그 안에 `index.js` 파일을 만들어서 test라는 함수를 만들었습니다.
`index.js`에는 아래의 코드를 넣었습니다.

```javascript
console.log('test1234')
exports.handle = function(e, ctx, cb) {
  cb(null, { test: 'test' })
}
```

기본적인 람다 코드 작성법이나 설명은 하지 않도록 하겠습니다.

---

# 6. 함수 배포하고 실행하기

`apex deploy`는 functions 폴더에 있는 함수들을 모두 배포하는 작업을 합니다.    
`apex deploy {name}`처럼 특정 한 함수만 배포 할 수도 있고,      
`apex deploy prefix*`, `apex deploy *suffix`처럼 `*`을 사용하여 특정 접두어나 접미어를 가진 함수들만 배포 할 수도 있습니다.    

`apex invoke {name}`은 {name}이란 이름을 가진 함수를 실행하는 작업을 합니다.    

![image010](010.jpg)
아까 만들었던 test 함수를 배포하고 실행한 결과입니다.    
[AWS Lambda Console](https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions)
에 들어가보시면 `APEX-Test_test`라는 함수가 만들어 진 것을 볼 수 있습니다.

---

![image011](011.jpg)
`apex logs {name}`를 통해 함수의 로그를 확인 할 수 있습니다.    
우리가 만들었던 `test`함수에서 콘솔에 출력했던 `test1234`를 확인 할 수 있습니다.    
이 명령어를 통해서 `apex invoke`를 통해 실행된 것의 로그만 확인 할 수 있는 것이 아니라
모든 로그를 확인할 수 있습니다.

log 명령어는 최근 5분 안에 발생했던 로그만 보여줍니다.
더 오래된 명령어를 보고 싶거나 다른 기능의 설명은
[여기](http://apex.run/#viewing-log-output)에 있습니다.
