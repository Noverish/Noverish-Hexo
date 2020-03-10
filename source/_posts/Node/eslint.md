---
layout: post
title: ESLint + Typescript
date: 2020-03-10 18:33:00 +0900
description: Template description
thumbnail: /thumbnails/eslint.png
category: 'node'
tags: 
- node
- npm
- eslint
- typescript
twitter_text: template twitter_text
---

Typescript 프로젝트에서 eslint를 적용해 보자!

<!-- more -->

## 목차
[1\. ESLint 설치](#1-ESLint-설치)    
[2\. Typescript absolute imports](#2-Typescript-absolute-imports)    
[3\. Type import](#3-Type-import)

---

# 1. ESLint 설치

`npm i -D eslint` 명령어로 간단히 eslint를 설치할 수 있습니다.

`npx eslint --init` 명령어로 eslintrc.json 을 생성할 수 있습니다.
제가 선택한 옵션은 다음과 같습니다.

```
$ npx eslint --init

? How would you like to use ESLint? To check syntax, find problems, and enforce code style
? What type of modules does your project use? None of these
? Which framework does your project use? None of these
? Does your project use TypeScript? Yes
? Where does your code run? Node
? How would you like to define a style for your project? Use a popular style guide
? Which style guide do you want to follow? Airbnb: https://github.com/airbnb/javascript
? What format do you want your config file to be in? JSON
```

그러면 아래와 같은 eslintrc.json 파일이 생성됩니다.

```json
{
  "env": {
    "es6": true,
    "node": true
  },
  "extends": [
    "airbnb-base"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
  }
}
```

다음과 같은 명령어로 eslint를 실행할 수 있습니다.

```shell
$ npx eslint 'src/**/*.ts'        # 단순히 문법 검사만 함
$ npx eslint 'src/**/*.ts' --fix  # 고칠수 있는 부분은 고치고 고칠 수 없는 부분은 출력함
```

# 2. Typescript absolute imports

일반적으로 Typescript 프로젝트에서는 `import * as ssl from '../../../services/ssl'` 과 같은 import 경로를 피하기 위해 절대 경로 import를 많이 사용합니다.

아래와 같이 tsconfig.json 을 수정하면 `import * as ssl from '@src/services/ssl'` 처럼 절대 경로로 import 할 수 있습니다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {"@src/*" : ["./src/*"]}
  }
}
```

하지만 eslint 에서는 이 경로를 인식하지 못해서 아래와 같은 에러가 발생합니다.

```
4:33  error    Unable to resolve path to module '@src/services/ssl'       import/no-unresolved
```

이러한 문제를 해결 하기 위해서는 아래와 같이 해주시면 됩니다.

### eslint-import-resolver-typescript 다운로드

```shell
$ npm i -D eslint-import-resolver-typescript
```

### eslint.json에 아래 내용 추가

```json
{
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

# 3. Type import

typescript에서 type을 import 하는 경우가 많은데 eslint는 이 또한 인식하지 못합니다.

```typescript
import { Request, Response, NextFunction } from 'express';
```

위와 같은 부분에서는 아래와 같은 에러를 출력합니다.

```
4:33  error  'Request' is defined but never used        no-unused-vars
```

이러한 문제를 해결 하기 위해서는 eslint.json에 아래 내용 추가하시면 됩니다.

```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/no-unused-vars": [2, { "args": "none" }]
      }
    }
  ]
}
```