const { readFileSync, writeFileSync } = require('fs');

const crypto = require('crypto')

const files = [
  "Docker/Docker-Hub.md",
  "Docker/Mysql-Backup.md",
  "etc/Bash-Hack.md",
  "etc/Awesome-Github-Repository.md",
  "etc/Chrome-Custom-Search-Engine.md",
  "etc/Circle-CI.md",
  "etc/init.md",
  "etc/Github-Actions.md",
  "etc/Slack-Github-Integration.md",
  "Server/ECS-AutoScaling.md",
  "Server/ElasticSearch-Index.md",
  "Server/ELK-1.md",
  "Server/Cloud9.md",
  "Server/ELK-2.md",
  "Server/HTTPS.md",
  "Server/Lambda-APEX.md",
  "Server/EC2-Your-Own-VPN.md",
  "Server/Code-Server.md",
  "iOS/Facebook-Login.md",
  "iOS/Naver-Clova-Speech-Synthesis.md",
  "iOS/How-to-Create-Paging-Table-View.md",
  "iOS/Play-Audio-From-Web.md",
  "iOS/How-To-Create-Custom-View.md",
  "iOS/Auto-Layout.md",
  "iOS/Cocoa-Pod-Swift-Version.md",
  "Android/Firebase-Push-Notification-2.md",
  "Android/Naver-Map.md",
  "Android/Firebase-Push-Notification-1.md",
  "Node/Server-Sent-Event.md",
  "Node/logging.md",
  "Node/tsconfig.md",
  "Node/eslint.md",
]

function check (path) {
  const content = readFileSync("source/_posts/" + path).toString();
  const metas = content.split('---')[1].trim().split('\n');
  
  const layout = metas.splice(metas.findIndex(v => v.startsWith("layout")), 1);
  const title = metas.splice(metas.findIndex(v => v.startsWith("title")), 1);
  const date = metas.splice(metas.findIndex(v => v.startsWith("date")), 1);
  const cover = metas.splice(metas.findIndex(v => v.startsWith("cover")), 1);
  const category = metas.splice(metas.findIndex(v => v.startsWith("category")), 1);
  const toc = metas.splice(metas.findIndex(v => v.startsWith("toc")), 1);
  const tags = metas.splice(metas.findIndex(v => v.startsWith("tags")), 1);

  const tagValuse = metas.join("\n");

  // const tagValues = metas.splice(metas.findIndex(v => v.startsWith("-")), 1);

  const list = [
    layout,
    title,
    date,
    cover,
    `disqusId: ${crypto.createHash('sha1').update(path).digest('hex')}`,
    toc,
    category,
    tags,
    tagValuse
  ]

  console.log(list.join("\n"));
}

files.forEach(check);
