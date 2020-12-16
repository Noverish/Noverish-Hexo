---
layout: post
title: tsconfig.json 파헤치기
date: 2019-09-08 18:17:00 +0900
cover: /covers/typescript.png
disqusId: 756521d76a4ebf227f4c110a47266ac8fa299218
toc: true
category: Node
tags:
- node
- typescript
---

tsconfig.json 파일에는 정말 많은 옵션들이 있습니다. 그 중에 제가 자주 사용하는 옵션들을 설명해 보겠습니다.

<!-- more -->

## esModuleInterop

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

ES6 문법에서는 * 형태로 import 한 것을 함수로 사용할 수 없습니다.
예를 들어서 다음과 같은 코드는 정상적으로 Javascript로 Transpile 되지만 ES6 문법에 맞지 않는 것이죠.

```typescript
// before transpile
import * as moment from 'moment';
moment(); // ES6 문법에 맞지 않음!

// after transpile
const moment = require('moment');
moment();
```

Javascript와의 호환성을 위해 * 형태로 import 해야하는 module들을 default 형태로 import 할 수 있게 해주는 옵션이 esModuleInterop 입니다.
아래와 같은 방식으로 동작한다고 생각하시면 됩니다.

```typescript
// before transpile
import moment from 'moment';
moment(); // ES6 문법에 맞는다!

// after transpile
const moment = __importDefault(require('moment'));
moment.default();
```

위에서 __importDefault 함수가 default가 있는 module은 그대로 두고 없는 module은 default로 바꾸어주는 역할을 합니다.
