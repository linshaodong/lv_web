本项目为《通用管理后台》服务端api，需要配合前端vue（https://github.com/linshaodong/lv_web），才能使用整套功能。

本项目已实现功能：
1. 服务端api
    - 用户登录
    - 系统管理
        - 角色管理
        - 权限管理
        - 用户管理
        - 操作日志
    - 个人信息修改
    - 上传
    - swoole 即时聊天
    - 验证码

2. 前端
    vue2.x + element_ui

后台权限控制：
	通过代码的注释反射实现权限控制功能
	
	服务端
	1. config/admin.php：添加一级控制器目录配置
	2. 后台添加控制器类和控制器方法，并添加相应的注释
		- @name 日志列表：入库权限别名
		- @Get("/lv/logs”)：权限 - 请求方法和路由
		- @Version("v1”)：版本控制默认填v1
		- @PermissionWhiteList：选填：权限白名单，就是公开的权限
	3. 点击刷新权限：位置：登录后台系统 -> 系统管理 -> 权限列表 -> 刷新权限
	
	客户端
	1. src/router/index.js
		- 在路由配置里添加配置 => key: '@Get:lv_logs',
	

功能开发

	- 服务端 ：按照laravel5.8官方文档教程
	- 客户端 ：按照vue2.0官方文档教程
