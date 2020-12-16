---
layout: post
title: Server-Sent Event
date: 2019-11-11 18:31:02 +0900
cover: /covers/nodejs.png
disqusId: 22dd95045dfbdf620db6d4403e96481571020b44
toc: true
category: Node
tags:
- node
- sse
---

Nodejs에서 Sever-Sent Event를 사용하는 법을 알아보겠습니다.
또한 Nginx를 통해 통신할 경우 추가로 해주어야 하는 설정을 알아보겠습니다.

<!-- more -->

# 1. 시작

## 1.1. ssestream 설치

```shell
$ npm install ssestream
```

## 1.2. Server-Side

서버에 아래의 코드를 작성합니다.

```javascript
import * as express from 'express';
import SSEStream from 'ssestream';

const app = express();

app.get('/sse', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const stream = new SSEStream(req);
  stream.pipe(res);

  setInterval(() => {
    stream.write({
      data: Date.now().toString(),
    });
  }, 100);
});

app.listen(8080);
```

여기서 10번째 줄에 data에는 string을 넣어도 되고 object를 넣어도 됩니다.
ssestream 내부에서 object를 JSON.stringify 함수를 통해 string으로 바꿔줍니다.

## 1.3. Client-Side

```javascript
const es = new EventSource('http://localhost:8080/sse');
es.onmessage = (event) => {
  console.log(event);
}
```

# 2. Cookie 전송

1. [Client-Side] EventSource 생성할 때 옵션으로 `{ withCredentials: true }`를 넣어줍니다.
2. [Server-Side] Access-Control-Allow-Origin 헤더를 `*`이 아닌 특정 도메인으로 설정합니다.
3. [Server-Side] Access-Control-Allow-Credentials 헤더의 값을 `true`로 해줍니다.

# 3. 각 이벤트마다 ID 부여

서버에서 SSEStream에 write할 때 id를 넣어주면 됩니다.

```javascript
stream.write({
  id: Date.now().toString(),
  data: 'Hello, World!',
});
```

클라이언트에서는 event.lastEventId를 통해 접근합니다.

```javascript
es.onmessage = (event) => {
  console.log(event.lastEventId, event.data);
}
```

# 4. 각 이벤트마다 타입 부여

서버에서 SSEStream에 write할 때 event를 넣어주면 됩니다.

```javascript
stream.write({
  id: Date.now().toString(),
  data: 'Hello, World!',
  event: (Math.random() > 0.5) ? 'event1' : 'event2',
});
```

클라이언트에서는 onmessage가 아닌 addEventListener를 통해 이벤트를 받습니다.

```javascript
es.addEventListener('event1', (event) => {
  console.log('event1', event.lastEventId, event.data);
});
es.addEventListener('event2', (event) => {
  console.log('event2', event.lastEventId, event.data);
});
```

# 5. Client에서 연결 종료

```javascript
es.close();
```

서버에서 Client가 연결을 종료한 것을 알아내려면 아래와 같이 하면 됩니다.

```javascript
req.socket.on('close', () => {
  // 연결 종료
});
```

Server에서도 연결을 종료할 시 위의 콜백함수가 호출되는 한계가 있습니다.

# 6. Server에서 연결 종료

```javascript
req.socket.end();
// 또는
res.socket.end();
```

Client에서 서버가 연결을 종료한 것을 알아내려면 아래와 같이 하면 됩니다.

```javascript
es.onerror = (event) => {
  if (event.eventPhase === es.CLOSED) {
    es.close();
    // 연결 종료
  }
}
```

여기서 `es.close()`를 하지 않으면 Client에서 무한정으로 Server에 접속 시도를 하게 됩니다.

# 7. Nginx를 통해 통신 (proxy_pass를 사용하는 경우)

```
proxy_buffering off;
```
를 location block에 추가해주면 됩니다.

또는

```
X-Accel-Buffering: no
```
를 Server에서 보내는 Response에 헤더로 추가하면 됩니다.
