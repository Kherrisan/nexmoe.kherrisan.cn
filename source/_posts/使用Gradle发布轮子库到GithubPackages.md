---
title: 使用Gradle发布轮子库到GithubPackages
abbrlink: cc3ae9ba
date: 2020-12-28 12:47:17
tags:
---

以我用 Kotlin 写的几个轮子为例。

# Gradle 配置 Publishing

首先添加 maven-publish 插件。

```
plugins {
    id 'maven-publish'
}
```

并且补充 publish 的配置。publish 的配置有两部分：

1. artifact：包括 groupId、artifactId、version 等。
2. repository：包括仓库的 uri（这里使用 **github packages** 的上传地址），用于用户鉴权的信息。

```
publishing {
    publications {
        maven(MavenPublication) {
            groupId 'cn.kherrisan'
            artifactId 'kommons'
            version '1.0.0'

            from components.kotlin
        }
    }

    repositories {
        maven {
            name = "GitHubPackages"
            url = "https://maven.pkg.github.com/$USER_NAME/$GITHUB_REPOSITORY_NAME"
            credentials {
                username = $USER_NAME
                password = $USER_TOKEN
            }
        }
    }
}
```

1. url 的最后要写上要把包发布到的仓库位置，即哪个用户的代码仓库。 
2. USER_TOKEN 从 github/settings/personal tokens 中获得，需要有 write packages 的权限。

完成配置后执行``gradle publish``，发布到远程仓库中。

过一会儿就能在 github 的仓库页右侧看到 package 了。

![](https://oss.kherrisan.cn/githubpackages.png)

# Gradle 配置 dependency

若是需要引入这个包，则需要在引入的 Gradle 项目中配置 dependency。

```
repositories {
    maven {
        url "https://maven.pkg.github.com/$USER_NAME/$GITHUB_REPOSITORY_NAME"
        credentials {
            username = $USER_NAME
            password = $USER_TOKEN
        }
    }
}

dependencies {
    implementation "cn.kherrisan:kommons:1.0.0"
}
```

1. 虽说如果仓库是公开的话，任何人都应该能够取得这个 package，即不需要配置 credentials.但实际测试中发现必须要credentials 才能获得到 package。这里的 TOKEN 不必和 publishing 中的 TOKEN 是同一个，但必须要有 read package 的权限。
2. dependencies 中，**包的名字应该是之前在 publishing 中设置的 groupId:artifactId:version**，而不是 USER_NAME:REPOSITORY 或者其他无关的名字。