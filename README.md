# jquery-file-upload
 基于JQuery的文件上传插件

> 依赖：jquery（必须）、font-awesome（可通过配置移除）

> 默认图标为font-awesome，若想使用其他图标库，可通过本插件提供的配置参数修改图标内容。详见状态图标、控制器图标

### 用法
$(elem).fileUpload(option);

### 参数

参数名 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
multiple	| 是否允许多文件上传	| boolean	| true/false	| false
limit	| 文件上传数量限制，小于等于0时不限制	| number	| —	| 1
maxSize	| 文件大小限制，单位B	| number	| —	| 1024000
accept	| 文件类型。正则表达式	| string	| —	| image/*
acceptMime	| 文件选择框筛选出的文件类型。用逗号隔开的 MIME 类型列表	| string	| —	| image/*
exts	| 允许上传的文件后缀。正则表达式	| string	| —	| jpg|png|gif|bmp|jpeg
auto	| 选择文件后是否自动上传	| boolean	| true/false	| true
url	| 服务端上传接口	| string	| —	| —
headers	| 上传接口请求头	| object	| —	| —
param	| 上传接口的额外参数	| object	| —	| —
download	| 文件名称（a标签）是否配置download属性	| boolean	| true/false	| false
bindElem	| 数据绑定Jquery对象。插件会在数据变更时通过$(bindElem).val()方法更新数据。等价于手动调用$(bindElem).val($elem.fileUpload('toJsonString'));	| object	| —	| —
data	| 已上传的文件列表。元素支持string（url）或object（含url属性、name属性）	| array	| —	| —
list-type	| 文件列表样式	| string	| text（文件列表）、picture（图片列表）、picture-card（图片卡片列表）、picture-placeholder（图片卡片占位）	| text
subscribeMessage	| 订阅消息。用竖线隔开的消息类型列表	| string	| log（普通）、info（信息）、warn（警告）、error（错误）	| info|warn|error
msg	消息模板。详细参数见消息模板参数	| object	| —	| —
controls	| 控制器。详细参数见控制器参数	| object	| —	| —
icon	| 图标。详细参数见图标参数	| object	| —	| —
before-choose	| 选择文件前的钩子。return false可拒绝选择文件 <br/>fileList：文件列表	| function(fileList)	| —	| —
on-choose	| 选择文件的钩子。return false可拒绝选择文件 <br/>elem：input节点 <br/>file：当前选中文件 <br/>fileList：文件列表	| function(elem, file, fileList)	| —	| —
on-upload	| 上传前的钩子。可自定义上传实现。return false可拒绝默认上传动作 <br/>file：当前文件 <br/>fileList：文件列表	| function(file, fileList)	| —	| —
on-done	| 上传完毕后的钩子 <br/>status：服务器响应状态码 <br/>res：服务端响应信息 <br/>file：当前文件 <br/>fileList：文件列表	| function(status, res, file, fileList)	| —	| —
on-success	| 上传成功后的钩子。return false可拒绝默认更新文件属性动作 <br/>res：服务端响应信息 <br/>file：当前文件 <br/>fileList：文件列表	| function(res, file, fileList)	| —	| —
on-error	| 上传失败后的钩子。return false可拒绝默认更新文件属性动作 <br/>status：服务器响应状态码 <br/>res：服务端响应信息 <br/>file：当前文件 <br/>fileList：文件列表	| function(status, res, file, fileList)	| —	| —
on-remove	| 删除前的钩子。return false可拒绝删除动作 <br/>file：当前文件 <br/>fileList：文件列表	| function(file, fileList)	| —	| —
on-clear	| 清空前的钩子。return false可拒绝删除动作 <br/>fileList：文件列表	| function(fileList)	| —	| —
on-change	| 数据变更的钩子。当有文件状态标识出现转移时触发。详见文件状态标识 <br/>fileList：文件列表	| function(fileList)	| —	| —
on-msg	| 提示消息的钩子。<br/>event：事件。详见事件定义 <br/>level：消息级别。详见消息定义 <br/>msg：信息内容 <br/>fileList：文件列表	| function(event, level, msg, fileList)	| —	| —

### — 更多参数请见 index.html

> index.html 包含插件说明文档和多种调用示例