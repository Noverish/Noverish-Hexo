---
layout: post
title: Nodejs Logging (Morgan, Winston)
date: 2020-03-16 19:40:00 +0900
description: Template description
thumbnail: /thumbnails/nodejs.png
category: 'node'
tags: 
- node
- npm
- morgan
- winston
twitter_text: template twitter_text
---

Nodejs에서 자주 사용하는 로깅 라이브러리인 Morgan과 Winston을 알아보겠습니다.

<!-- more -->

## 목차
[1\. Morgan](#1-Morgan)    
[2\. Winston](#2-Winston)

---

# 1. Morgan

```typescript
const rfs = require('rotating-file-stream');

function fileName(time: Date | null, index: number): string {
  if (time) {
    return `${dateToString(time).split(' ')[0]}.log`;
  }

  return `${dateToString(new Date()).split(' ')[0]}.log`;
}

const consoleFormat = '[:date] <:remote-addr> (:user-id) :method :status :response-time ms ":url"';
export const consoleLogger = morgan(consoleFormat);

const accessLogStream = rfs(fileName, {
  interval: '1h',
  path: logDirectory,
  immutable: true,
});

const fileFormat = '[:date] <:remote-addr> (:user-id) :method :status :response-time ms ":url" ":user-agent"';
export const fileLogger = morgan(fileFormat, {
  stream: accessLogStream,
  skip (req, res) {
    if (req.user_id) {
      return req.user_id === 1 || req.user_id === 4;
    }
    return false;
  },
});
```

# 2. Winston

```typescript
import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';

const consoleFormat = format.printf((info: TransformableInfo) => {
  return `[${info.timestamp}] [${info.level}] ${info.message}`;
});

const fileFormat = format.printf((info: TransformableInfo) => {
  const payload = info.payload;
  return `[${info.timestamp}] [${info.level}] ${info.message} ${payload ? JSON.stringify(payload) : ''}`;
});

const consoleTransport = new transports.Console({
  level: 'info',
  format: format.combine(
    format.colorize(),
    consoleFormat,
  ),
})

const dailyRotateFileTransport = new transports.DailyRotateFile({
  level: 'debug',
  dirname: './log',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
})

export const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: () => moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
    }),
    fileFormat,
    transports: [consoleTransport, dailyRotateFileTransport],
  )
})

export function logRequest(req: IncommingMessage, res: ServerResponse) {
  let ip = req.connection.remoteAddress;
  const method = req.method;
  const url = req.url;
  req['_startAt'] = process.hrtime();

  res.on('finish', () => {
    const [sec, ns] = process.hrtime(req['_startAt']);
    const responseTime = Math.floor(sec * 1e3 + ns * 1e-6);
    const status = res.statusCode;
  })
}
```