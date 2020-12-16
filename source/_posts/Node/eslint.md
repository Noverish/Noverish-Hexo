---
layout: post
title: ESLint + Typescript
date: 2020-03-10 18:33:00 +0900
cover: /covers/eslint.jpg
disqusId: aa61df86aab781f889a4623b4ec92de37f7b5bba
toc: true
category: Node
tags: 
- node
- npm
- eslint
- typescript
---

Typescript 프로젝트에서 airbnb 스타일로 eslint를 적용해 보자!

<!-- more -->

# 1. ESLint 설치

`npm install -D eslint` 명령어로 간단히 eslint를 설치할 수 있습니다.

`npx eslint --init` 명령어로 .eslintrc.json 을 생성할 수 있습니다.
만약 React 프로젝트일 경우 그에 맞게 선택해 주시면 됩니다.
제가 선택한 옵션은 다음과 같습니다.

```shell
$ npx eslint --init

? How would you like to use ESLint? 
  To check syntax only 
  To check syntax and find problems 
❯ To check syntax, find problems, and enforce code style

? What type of modules does your project use? 
  JavaScript modules (import/export) 
  CommonJS (require/exports) 
❯ None of these

? Which framework does your project use? 
  React 
  Vue.js 
❯ None of these

? Does your project use TypeScript? (y/N) y

? Where does your code run? (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ Browser
 ◉ Node

? How would you like to define a style for your project? 
❯ Use a popular style guide 
  Answer questions about your style 
  Inspect your JavaScript file(s)

? Which style guide do you want to follow?
❯ Airbnb: https://github.com/airbnb/javascript 
  Standard: https://github.com/standard/standard 
  Google: https://github.com/google/eslint-config-google

? What format do you want your config file to be in? 
  JavaScript 
  YAML 
❯ JSON

@typescript-eslint/eslint-plugin@latest eslint-config-airbnb-base@latest eslint@^5.16.0 || ^6.8.0 eslint-plugin-import@^2.20.1 @typescript-eslint/parser@latest
? Would you like to install them now with npm? (Y/n) Y
```

그러면 아래와 같은 .eslintrc.json 파일이 생성됩니다.

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
  "rules": {}
}
```

다음과 같은 명령어로 eslint를 실행할 수 있습니다.

```shell
$ npx eslint 'src/**/*.ts'        # 단순히 문법 검사만 함
$ npx eslint 'src/**/*.{ts,tsx}'  # tsx 파일도 검사함
$ npx eslint 'src/**/*.ts' --fix  # 고칠수 있는 부분은 고치고 고칠 수 없는 부분은 출력함
```

# 2. Typescript용 airbnb 스타일 설치하기

실제로 eslint 명령어를 수행하면 Type을 import한 부분에 대해서는 사용하지 않았다는 아래와 같은 에러를 출력합니다.

```typescript
import { SomeType } from 'some-package';

const something: SomeType | null = null;
```

```
error  'SomeType' is defined but never used        no-unused-vars
```

이러한 에러가 발생하는 이유는 `.eslintrc.json`를 생성할 때 설치된 airbnb 스타일이 Typescript용이 아니기 때문입니다.
따라서 Typescript용 airbnb 스타일을 설치 해야 합니다.

## 2.1. React 프로젝트가 아닌 경우

```shell
$ npm install -D eslint-config-airbnb-typescript
```

위와 같이 설치 한 다음 .eslintrc.json을 다음과 같이 수정합니다.

```diff
  "extends": [
-   "airbnb-base"
+   "airbnb-typescript/base"
  ],
  "parserOptions": {
+   "project": "./tsconfig.json"
  },
```

## 2.2. React 프로젝트인 경우

```shell
$ npm install eslint-config-airbnb-typescript \
              eslint-plugin-jsx-a11y \
              eslint-plugin-react \
              eslint-plugin-react-hooks@^1.7.0 \
              --save-dev
```

위와 같이 설치 한 다음 .eslintrc.json을 다음과 같이 수정합니다.

```diff
  "extends": [
-   "airbnb-base"
+   "airbnb-typescript"
  ],
  "parserOptions": {
+   "project": "./tsconfig.json"
  },
```

---

이제 다시 eslint 명령어를 수행하면 아까와 같은 에러가 더이상 발생하지 않는 것을 알 수 있습니다.

# 3. Typescript 절대 경로 Import

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
error    Unable to resolve path to module '@src/services/ssl'       import/no-unresolved
```

이러한 문제를 해결 하기 위해서는 `eslint-import-resolver-typescript`라는 패키지를 설치해 주셔야 합니다.

```shell
$ npm i -D eslint-import-resolver-typescript
```

위와 같이 설치 한 다음 .eslintrc.json에 다음을 추가합니다.

```json
{
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

# 4. TL; DR

## 4.1. React 프로젝트가 아닌 경우

### Package 설치

```shell
$ npm install eslint \
              eslint-plugin-import \
              @typescript-eslint/eslint-plugin \
              @typescript-eslint/parser \
              eslint-config-airbnb-typescript \
              eslint-import-resolver-typescript \
              --save-dev
```

### Project Root에 .eslintrc.json 생성

```json
{
  "env": {
    "es6": true,
    "node": true
  },
  "extends": [
    "airbnb-typescript/base"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "radix": "off",
    "no-console": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }]
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

## 4.2. React 프로젝트인 경우

### Package 설치

```shell
$ npm install eslint \
              eslint-plugin-import \
              eslint-plugin-jsx-a11y \
              eslint-plugin-react \
              eslint-plugin-react-hooks@^1.7.0 \
              @typescript-eslint/eslint-plugin \
              @typescript-eslint/parser \
              eslint-config-airbnb-typescript \
              eslint-import-resolver-typescript \
              --save-dev
```

### Project Root에 .eslintrc.json 생성

```json
{
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "airbnb-typescript"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "rules": {
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```