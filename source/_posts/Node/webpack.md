---
layout: post
title: 바닥부터 시작하는 Webpack
date: 2021-01-08 18:34:00 +0900
cover: /covers/webpack.png
disqusId: 229869eb3b21988010e09bcc54a4be838ac3fe16
toc: true
category: Node
tags:
- node
- javascript
- webpack
- typescript
- babels
---

Webpack과 Babel을 하나도 몰라도 Typescript, React, CSS까지 번들링 하는 법을 알아보겠습니다.

<!-- more -->

Webpack이 뭔지 Babel이 뭔지는 다른 블로그가 설명이 더 잘 되어있으니 여기서는 실습에 집중하겠습니다.

# 1. 일단 webpack 써보기

```shell
$ mkdir webpack-test
$ cd webpack-test
$ npm init -y
$ npm i -D webpack webpack-cli
```

위 명령어를 통해 NPM 프로젝트를 만들어 준 후 `webpack`과 `webpack-cli`를 설치합니다.

```javascript src/index.js
console.log("hello, world!");
```

`src/index.js`에 위의 코드를 적습니다.

```shelll
$ npx webpack --mode none --entry ./src/index.js -o dist
```

콘솔창에 위와 같은 명령어를 입력하면 아래와 같은 내용이 적혀있는 파일이 `dist/main.js`에 생성됩니다.

```javascript dist/main.js
/******/ (() => { // webpackBootstrap
console.log("hello, world");
/******/ })()
;
```

<article class="message message-immersive is-warning">
  <div class="message-body">
    <i class="fas fa-exclamation-triangle mr-2"></i>
    entry 옵션을 줄 때 <code>src/index.js</code>와 같이 경로를 적으면 파일을 찾지 못합니다. <code>./src/index.js</code>와 같이 앞에 <code>./</code>을 붙여야합니다.
  </div>
</article>

### 옵션을 파일로 주기 (webpack.config.js)

그런데 이렇게 일일히 옵션 입력하면 귀찮으니까 보통은 아래와 같이 `webpack.config.js`를 만들어 줍니다.
위 파일을 생성한 다음에 `npx webpack` 명령어를 입력하면 위와 같은 동작을 하는 것을 알 수 있습니다.

```javascript webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, '.'),
  },
}
```

<article class="message message-immersive is-warning">
  <div class="message-body">
    <i class="fas fa-exclamation-triangle mr-2"></i>
    여기서 output path에는 절대경로만 들어가야합니다.
  </div>
</article>

# 2. 여러 파일을 하나로 묶기

`src/math.js`파일을 생성하여 아래와 같이 적습니다.

```javascript src/math.js
module.exports.add = (a, b) => a + b;
```

```javascript src/index.js
const math = require('./math');

console.log(math.add(1, 2));
```

그러면 webpack이 알아서 dependency를 추적해서 관련된 모든 파일을 한 파일로 묶어줍니다.

```shell
$ npx webpack
$ node dist/main.js
3
```

### ES6 모듈 시스템

node는 CommonJS 모듈 시스템을 쓰고 있습니다.
따라서 ES6 모듈 시스템을 사용할 수 없었는데
webpack을 사용하면 ES6 모듈 시스템을 쓸 수 있습니다.

```javascript math.js
export const add = (a, b) => a + b;
```

```javascript index.js
import * as math from './math';

console.log(math.add(1, 2));
```

```shell
$ node src/index.js # 에러
$ npx webpack
$ node dist/main.js # 정상동작
3
```

# 3. webpack dev server

## 3.1. webpack watch

```shell
$ npx webpack --watch
```

위의 명령어를 사용하면 webpack 데몬이 돌아가면서 파일이 변경될 때마다 자동으로 빌드해줍니다.

## 3.2. webpack dev server

```shell
$ npm i -D webpack-dev-server
```

webpack-dev-server는 웹 브라우저에서 자동으로 live reload를 하게 해줌으로써 생산성을 높일 수 있습니다.

```html dist/index.html
<html>
  <head>
    <title>webpack-test</title>
  </head>
  <body>
    <script src="./main.js"></script>
  </body>
</html>
```

```diff webpack.config.js
module.exports = {
+ devServer: {
+   contentBase: path.join(__dirname, 'dist'),
+   hot: true,
+ },
}
```

위와 같이 html파일을 만들고 webpack.config.js 파일을 수정한 후 아래의 명령어로 server를 실행시킬 수 있습니다.

```shell
$ npx webpack serve
```

`http://localhost:8080` 경로에 웹 브라우저로 접속한 후 개발자 도구로 console 창을 확인하면 3이 떠있는 것을 볼 수 있습니다.
여기서 src 폴더의 파일을 수정하면 웹 페이지가 자동으로 새로고짐 됩니다.

<article class="message message-immersive is-warning">
  <div class="message-body">
    <i class="fas fa-exclamation-triangle mr-2"></i>
    contentBase 경로가 프로젝트 루트 경로이면 hot reloading이 되지 않습니다.
  </div>
</article>

# 4. React

```shell
$ npm i -D react react-dom @types/react @types/react-dom babel-loader @babel/core @babel/preset-react
```

```javascript src/index.js
import React from 'react'
import ReactDOM from 'react-dom'
import * as math from './math';

const App = () => {
  return (
    <h1>{math.add(1, 2)}</h1>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
```

```html dist/index.html
<html>
  <head>
    <title>webpack-test</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./main.js"></script>
  </body>
</html>
```

```diff webpack.config.js
module.exports = {
+ module: {
+   rules: [
+     {
+       test: /\.(js|jsx)$/,
+       exclude: /node_module/,
+       use: {
+         loader: 'babel-loader',
+         options: {
+           presets: ['@babel/preset-react'],
+         },
+       }
+     }
+   ]
+ },
}
```

# 5. Typescript

```shell
$ npm i -D ts-loader typescript
$ npx tsc --init
```

```typescript src/index.ts
import * as math from './math.js';

console.log(math.add(1, 2));
```

```typescript src/math.ts
export const add = (a: number, b: number) => a + b;
```

```diff webpack.config.js
module.exports = {
  ...
- entry: './src/index.js',
+ entry: './src/index.ts',
  ...
+ resolve: {
+   extensions: ['.ts', '.js']
+ },
  module: {
    rules: [
+     {
+       test: /\.ts$/,
+       exclude: /node_module/,
+       use: ['ts-loader'],
+     },
    ]
  },
}
```

webpack은 ts 확장자 파일을 자동으로 인식하지 않기 때문에 위와같이 extension으로 추가해주어야합니다.

# 6. Typescript + React

```json tsconfig.json
{
  "compilerOptions": {
    "target": "es6",
    "module": "es6",
    "jsx": "react",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

```ts index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import * as math from './math';

const App = () => {
  return (
    <h1>{math.add(1, 2)}</h1>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
```

```diff webpack.config.js
module.exports = {
  ...
- entry: './src/index.ts',
+ entry: './src/index.tsx',
  ...
  resolve: {
-   extensions: ['.ts', '.js']
+   extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
-       test: /\.ts$/,
+       test: /\.(ts|tsx)$/,
        exclude: /node_module/,
        use: ['ts-loader'],
      },
    ]
  },
}
```

# 7. CSS

```shell
$ npm i -D style-loader css-loader
```

```diff webpack.config.js
module.exports = {
  module: {
    rules: [
+     {
+       test: /\.css$/,
+       exclude: /node_module/,
+       use: ['style-loader', 'css-loader'],
+     },
    ]
  }
}
```

`css-loader`는 css 파일을 읽는 역할을 하고 `style-loader`는 읽은 css 파일을 html 파일에 넣어주는 역할을 합니다.

`css-loader`말고 `less-loader`, `sass-loader`, `postcss-loader` 등 많은 loader를 사용할 수 있습니다.
