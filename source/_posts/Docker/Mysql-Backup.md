---
layout: post
title: MySQL Backup Docker Image
date: 2020-03-21 09:18:00 +0900
description: Template description
thumbnail: /thumbnails/docker.png
category: 'docker'
tags:
- docker
twitter_text: template twitter_text
---

mysqldump, AWS CLI, crontab을 이용하여 주기적으로 MySQL을 백업하는 Docker Image를 만들어 보겠습니다.

<!-- more -->

### backup.sh

```bash
TODAY=$(date +"%Y-%m-%d")
mysqldump -h database -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > "$MYSQL_DATABASE-$TODAY.sql"
aws s3 cp "$MYSQL_DATABASE-$TODAY.sql" s3://my-s3-bucket-name
```

### Dockerfile

```Dockerfile
FROM python:3.7-alpine

WORKDIR /root

RUN apk update

# Timezone
RUN apk add --no-cache tzdata
ENV TZ='Asia/Seoul'

# aws cli
RUN pip3 install awscli --upgrade --user
RUN ln -s /root/.local/bin/aws /usr/bin/aws

# mysqldump
RUN apk add --no-cache mysql-client

# crontab
RUN echo "0 6 * * * /root/backup.sh" | crontab -

ADD backup.sh /root/backup.sh
RUN chmod +x /root/backup.sh

ENTRYPOINT crond -f -L /dev/stdout
```

### Docker Command

```shell
$ docker run -d \
    -e MYSQL_USER=[MySQL User] \
    -e MYSQL_PASSWORD=[MySQL Password] \
    -e MYSQL_DATABASE=[MySQL Database] \
    -e AWS_ACCESS_KEY_ID=[AWS Access Key ID] \
    -e AWS_SECRET_ACCESS_KEY=[AWS Secret Access Key] \
    -e AWS_DEFAULT_REGION=[AWS Default Region] \
    mysql-backup
```