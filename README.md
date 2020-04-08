# yh-mini

影核小程序

从影核[gitlab小程序repo](http://10.31.4.229/Web-developer/Applet-factory-2.0.git)迁移过来，迁移时间点2020-04-06 19:00

## 1. 对应关系

分支采用Gitflow方式，和原repo的对应关系如下

| 原分支          | 新分支               | 备注                                        |
| --------------- | -------------------- | ------------------------------------------- |
| master          | master               |                                             |
| master-商品中心 | release-v2.1.6.2     | release分支，版本号不确定，暂时定为v2.1.6.2 |
| master-好友助力 | develop              | 开发分支                                    |
| third           | release-third        | release分支，第三方平台                     |
| third-肃宁模板  | release-third-suning | release分支，第三方平台肃宁模板             |
| 其他分支        | 删除                 | 删除临时分支                                |

注意：分支命名不要使用中文，避免ci等工具无法正常使用。

## 2. 版本标签

master加入了v2.1.5.3和v2.1.6.1 2个标签

