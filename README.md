AntiCoronavirus2
========

Online Demo
------

[Demo](https://hwei.github.io/AntiCoronavirus2/release/web/)


介绍
------

原本想要蹭热点做个抗击冠状病毒的H5 游戏。但看上去来不及了。

试用了[LayaAir2.0](http://layabox.com/) 游戏引擎。这东西几乎只有纯引擎功能，编辑器和逻辑框架都很欠缺。

于是自己写了一个ECS 型逻辑框架 [entities-ts](https://github.com/hwei/entities-ts)。

以后若是有机会再开发H5 游戏，那就继续ECS ……

Laya 引擎使用 NPM package
--------

这东西折腾了好久。npm, commonjs, es6, typescript, rollup 之类的概念，以前也没接触过，搞了好久才弄明白。Javascript 真是个折腾的语言。

总之，改了一下`.laya/compile.js` ，能支持NPM package 了。
