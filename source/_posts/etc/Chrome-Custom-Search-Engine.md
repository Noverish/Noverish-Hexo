---
layout: post
title: 크롬에서 나만의 검색 엔진 사용하기
date: 2018-04-13 20:48:00 +0900
description: Template description
thumbnail: /thumbnails/chrome.jpg
category: 'etc'
tags:
- chrome
- tip
twitter_text: template twitter_text
---

크롬에서 나만의 검색 엔진 사용하기

<!-- more -->

개발자 여러분들은 구글링음 엄청 하고 계시리라 믿어 의심치 않습니다.    
저도 그렇거든요 ㅎㅎ

많은 사람들이 구글 홈페이지에 들어가서 검색 하는 것이 아니라
바로 크롬 주소창에 키워드를 입력해서 검색하시는데요

우리는 요걸 이용해서 더 편한 검색 라이프를 즐겨보도록 하겠습니다.
여기서는 예시를 유튜브로 하도록 하겠습니다.

---

![image000](000.jpg)
크롬 설정에 들어갑니다.

---

![image001](001.jpg)
기타 검색엔진에서 `추가`를 누릅니다.

---

![image002](002.jpg)
위와 같이 입력하고 `URL`에 아래와 같이 입력합니다    
`https://www.youtube.com/results?search_query=%s`    

`키워드`는 우리가 이 엔진을 쓴다고 크롬에게 알리는 문구 입니다.     
자세한건 밑의 gif 영상을 봐주세요    

`URL`에서 `%s`는 우리가 검색할 키워드가 들어가는 부분입니다.    

위의 두 옵션을 이용해서 다양한 검색엔진을 만드시면 됩니다.

---

![gif003](003.gif)

검색창에 `유튜브`를 입력하고 `탭`을 누르면 유튜브 검색 모드로 넘어갑니다.

저는 이 기능을 이용하여 Github, 영어사전, 나무위키 등에 사용하고 있습니다.
