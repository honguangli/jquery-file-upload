/*!
 * jquery-file-upload v1.0 (https://github.com/honguangli/jquery-file-upload)
 * Copyright honguangli
 * Licensed under the MIT license
 */
(function($) {
  "use strict";
  
  /**
   * @description 事件类型
   */
  const EventChoose = 'choose';   // 选择文件事件
  const EventDisplayShow = 'display-show'; // 显示事件
  const EventDisplayHide = 'display-hide'; // 隐藏事件
  const EventUpload = 'upload';   // 上传事件
  const EventRemove = 'remove';   // 删除事件
  const EventClear = 'clear';     // 清空事件
  const EventPush = 'push';       // 添加事件
  const EventInsert = 'insert';   // 插入事件
  const EventUpdate = 'update';   // 更新事件
  
  /**
   * @description 消息类型
   */
  const MsgLog = 'log';        // 普通级别
  const MsgInfo = 'info';      // 信息级别
  const MsgWarn = 'warn';      // 警告级别
  const MsgError = 'error';    // 错误级别
  
  /**
   * @description 上传状态
   */
  const UploadWait = 0; // 未上传
  const Uploading = 1; // 上传中
  const UploadFinish = 2; // 已上传
  const UploadSuccess = 200; // 上传成功
  const UploadFailure = 500; // 上传失败
  
  // 默认配置
  const defaults = {
    'multiple': false,            // 是否允许多文件上传
    'limit': 1,                   // 文件上传数量限制，小于等于0时不限制
    'maxSize': 1024000,           // 文件大小限制，单位B
    
    'accept': 'image/*',             // 文件类型 images（图片）、file（所有文件）、video（视频）、audio（音频）
    'acceptMime': 'image/*',        // 文件选择框筛选出的文件类型
    'exts': 'jpg|png|gif|bmp|jpeg', // 允许上传的文件后缀
    
    'auto': true,                 // 选择文件后是否自动上传
    'url': '',                    // 服务端上传接口
    'headers': {},                // 上传接口请求头
    'param': {},                  // 上传接口的额外参数
    
    'bindElem': null,             // 数据绑定Jquery对象
    'data': [],                   // 预设文件列表，['http://a.com/a.jpg', 'http://b.cn/b.png']
    
    'list-type': 'text',       // 文件列表样式 text（文件列表）、picture（图片列表）、picture-card（图片卡片列表）
    
    // TODO 未实现预览功能
    'preview': false,             // 是否启动图片预览插件
    
    'subscribeMessage': 'info|warn|error', // 订阅消息
    
    // 消息模板。内置变量：{limit}（文件数量限制）、{maxSize}（文件大小限制）
    'msg': {
      'limit': '最多可选择{limit}张图片', // 文件数量超出上限时的提示消息
      'maxSize': '文件大小超出',          // 文件大小超出上限时的提示消息
    },
    
    // 状态描述文本
    'status': {
      0: '未上传',                // 未上传
      1: '上传中',                // 上传中
      2: '已上传',                // 已上传
      200: '上传成功',            // 上传成功
      500: '上传失败',            // 上传失败
    },
    
    // 控制器
    'controls': {                 
      'hide': false,              // 是否隐藏全部控制器
      'style': '',                // 通用按钮样式
      'choose': true,             // 选择文件按钮
      'choose-style': '',         // 选择文件按钮样式
      'choose-content': '',       // 选择文件按钮内容
      'display': false,           // 显示隐藏按钮
      'display-style': '',        // 显示隐藏按钮样式
      'display-hide-content': '', // 隐藏按钮内容
      'display-show-content': '', // 显示按钮内容
      'upload-multiple': false,      // 批量上传按钮
      'upload-multiple-style': '',   // 批量上传按钮样式
      'upload-multiple-content': '', // 批量上传按钮内容
      'clear': false ,            // 清空按钮
      'clear-style': '',          // 清空按钮样式
      'clear-content': '',        // 清空按钮内容
      'upload': true,             // 上传按钮
      'upload-style': '',         // 上传按钮样式
      'upload-content': '',       // 上传按钮内容
      'delete': true,             // 删除按钮
      'delete-style': '',         // 删除按钮样式
      'delete-content': '',       // 删除按钮内容
    },
    
    // 钩子函数
    'before-choose': null,          // 选择文件前的钩子 return false可中断默认行为
    'on-choose': null,              // 选择文件的钩子 return false可中断默认行为
    'on-upload': null,              // 上传前的钩子 return false可中断默认行为
    'on-done': null,                // 上传完毕后的钩子
    'on-success': null,             // 上传成功后的钩子
    'on-error': null,               // 上传失败后的钩子
    'before-remove': null,          // 删除前的钩子
    'on-remove': null,              // 删除后的钩子
    'before-clear': null,           // 清空前的钩子
    'on-clear': null,               // 清空后的钩子
    'on-change': null,              // 数据变更的钩子
    'on-msg': null,                 // 提示消息的钩子
  };

  /**
   * @param {object} element 加载节点
   * @param {object} option 参数
   * @description 文件上传插件
   */
  function FileUpload(element, option) {
    const self = this;
    self.element = element;
    self.options = $.extend(true, {}, defaults, option);
    if (!self.options['multiple']) {
      self.options['limit'] = 1
    }
    self.options['msg']['limit'] = self.options['msg']['limit'].replace(new RegExp('{limit}'), self.options['limit'])
    self.options['msg']['maxSize'] = self.options['msg']['maxSize'].replace(new RegExp('{maxSize}'), self.options['maxSize'])
    
    self.fileList = [];
    self.fileKey = 0;
    self.start();
    console.log(self)
  }

  FileUpload.prototype = {
    /**
     * @description 启动插件
     */
    start: function() {
      const self = this;
      const $elem = self.element;
      
      $elem.addClass('upload-files-box');
      
      const html = [];
      html.push('<div class="upload-control">');
      // 控制器
      if (self.options.controls['hide'] === false) {
        // 选择文件按钮
        if (self.options.controls['choose'] === true) {
          self.options.controls['choose-style'] = self.options.controls['choose-style'] || self.options.controls.style || 'btn-primary btn-mini';
          self.options.controls['choose-content'] = self.options.controls['choose-content'] || '选择文件';
          html.push('<input class="input-upload-file" type="file" accept="' + self.options.acceptMime + '"/>')
          html.push('<button type="button" class="ctrl-choose btn ' + self.options.controls['choose-style'] + '">' + self.options.controls['choose-content'] + '</button>');
        }
        // 显示隐藏按钮
        if (self.options.controls['display'] === true) {
          self.options.controls['display-style'] = self.options.controls['display-style'] || self.options.controls.style || 'btn-primary btn-mini';
          self.options.controls['display-show-content'] = self.options.controls['display-show-content'] || '显示';
          self.options.controls['display-hide-content'] = self.options.controls['display-hide-content'] || '隐藏';
          html.push('<button type="button" class="ctrl-display btn ' + self.options.controls['display-style'] + '" data-display="true">' + self.options.controls['display-show-content'] + '</button>');
        }
        // 批量上传按钮
        if (self.options.controls['upload-multiple'] === true) {
          self.options.controls['upload-multiple-style'] = self.options.controls['upload-multiple-style'] || self.options.controls.style || 'btn-primary btn-mini';
          self.options.controls['upload-multiple-content'] = self.options.controls['upload-multiple-content'] || '批量上传';
          html.push('<button type="button" class="ctrl-multiple-upload btn ' + self.options.controls['upload-multiple-style'] + '">' + self.options.controls['upload-multiple-content'] + '</button>');
        }
        // 清空按钮
        if (self.options.controls['clear'] === true) {
          self.options.controls['clear-style'] = self.options.controls['clear-style'] || self.options.controls.style || 'btn-danger btn-mini';
          self.options.controls['clear-content'] = self.options.controls['clear-content'] || '清空';
          html.push('<button type="button" class="ctrl-clear btn ' + self.options.controls['clear-style'] + '">' + self.options.controls['clear-content'] + '</button>');
        }
        // 上传按钮
        if (self.options.controls['upload'] === true) {
          self.options.controls['upload-style'] = self.options.controls['upload-style'] || self.options.controls.style || 'btn-primary btn-super-mini';
          self.options.controls['upload-content'] = self.options.controls['upload-content'] || '上传';
        }
        // 删除按钮
        if (self.options.controls['delete'] === true) {
          self.options.controls['delete-style'] = self.options.controls['delete-style'] || self.options.controls.style || 'btn-danger btn-super-mini';
          self.options.controls['delete-content'] = self.options.controls['delete-content'] || '删除';
        }
      }
      html.push('</div>');
      html.push('<ul class="upload-file-list ' + self.options['list-type'] + '"></ul>');
      $elem.append(html.join(''));
      
      // 注册事件监听
      self.when();
      
      // 添加预置文件列表
      const preFileList = [];
      for (let i = 0; i < self.options.data.length; i++) {
        preFileList.push({
          'url': self.options.data[i].url || '',
          'status': self.options.data[i].status || UploadFinish,
          'name': self.options.data[i].name || '',
          'originUrl': self.options.data[i].originUrl || '',
          'originData': self.options.data[i].originData || null,
          });
      }
      if (preFileList.length > 0) {
        self.push(preFileList);
        self.bind();
      }
    },
    /**
     * @description 注册事件
     */
    when: function() {
      const self = this;
      const $elem = self.element;
      // 事件监听
      $elem.on('click', '.ctrl-choose', function() {
        // 选择文件事件 before
        self.choose();
      }).on('change', '.input-upload-file:input[type="file"]', function() {
        // 选择文件事件 on
        self._choose(this);
      }).on('click', '.ctrl-display', function() {
        // 显示隐藏文件列表事件
        self.display($(this).attr('data-display') === 'false');
      }).on('click', '.ctrl-multi-upload', function() {
        // 批量上传事件
        self.uploadMultiple();
      }).on('click', '.ctrl-clear', function() {
        // 清空事件
        self.clear();
      }).on('click', '.ctrl-upload', function() {
        // 上传事件
        const item = $(this).closest('.upload-file-item');
        const index = self.findFile($(item).attr('data-key'));
        self.upload(index);
      }).on('click', '.ctrl-remove', function() {
        // 删除事件
        const item = $(this).closest('.upload-file-item');
        const index = self.findFile($(item).attr('data-key'));
        self.remove(index);
      });
    },
    /**
     * @description 选择文件前
     */
    choose: function() {
      const self = this;
      if (!self.canAppend(1)) {
        self.msg(EventChoose, MsgInfo, self.options['msg']['limit']);
        return false
      }
      
      // 选择文件前的钩子
      if (self.options['before-choose'] != null && $.isFunction(self.options['before-choose'])) {
        // return false可中断默认行为
        if (self.options['before-choose'](self.fileList) === false) {
          return false
        }
      }
      
      const $elem = self.element;
      $elem.find('.upload-control .input-upload-file').click();
      return true
    },
    /**
     * @param {object} elem input节点
     * @description 选择文件后
     */
    _choose: function(elem) {
      const self = this;
      if (!self.canAppend(1)) {
        self.msg(EventChoose, MsgInfo, self.options['msg']['limit']);
        $(elem).val('');
        return false
      }
      
      const originFile = elem.files[0];
      $(elem).val('');
      
      const fileName = originFile.name;
      const fileFormat = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      const originUrl = window.URL.createObjectURL(originFile); //转成可以在本地预览的格式
      if (!originFile.type.match(new RegExp(self.options['accept']))) {
        self.msg(EventChoose, MsgInfo, '不支持的文件类型');
        return false
      }
      
      if (!fileFormat.match(new RegExp(self.options['exts']))) {
        self.msg(EventChoose, MsgInfo, '不支持的文件类型');
        return false
      }
      
      if (originFile.size > self.options.maxSize) {
        self.msg(EventChoose, MsgInfo, '文件大小超出')
        return false
      }
      
      // 选择文件的钩子
      if (self.options['on-choose'] != null && $.isFunction(self.options['on-choose'])) {
        // return false可中断默认行为
        if (self.options['on-choose'](elem, originFile, self.fileList) === false) {
          return false
        }
      }
            
      // 创建文件对象
      const file = self.createFileObj('', UploadWait, fileName, originUrl, originFile)
      self.pushFileElem(file);
      self.fileList.push(file);
            
      // 自动上传
      if (self.options['auto']) {
        self.upload(self.fileList.length - 1);
      }
      return true
    },
    /**
     * @param {boolean} _display 
     * @description 控制显示/隐藏。true（显示）、false（隐藏）
     */
    display: function(_display) {
      const self = this;
      
      const $elem = self.element;
      if (!_display) {
        $elem.find('.upload-control .ctrl-display').attr('data-display', 'false').html(self.options.controls["display-hide-content"]);
        $elem.children('.upload-file-list').addClass('hide');
      } else {
        $elem.find('.upload-control .ctrl-display').attr('data-display', 'true').html(self.options.controls["display-show-content"]);
        $elem.children('.upload-file-list').removeClass('hide');
      }
      return true
    },
    /**
     * @param {number} index 文件索引
     * @description 上传
     */
    upload: function(index) {
      const self = this;
      // 校验索引
      if (index < 0 || index >= self.fileList.length) {
        self.msg(EventUpload, MsgError, '索引越界', index)
        return false
      }
      // 校验状态
      if (![UploadWait, UploadFailure].includes(self.fileList[index].status)) {
        return false
      }
      
      // 上传文件前的钩子
      if (self.options['on-upload'] != null && $.isFunction(self.options['on-upload'])) {
        // return false可中断默认行为
        if (self.options['on-upload'](index, self.fileList) === false) {
          return false
        }
      }
      
      // 执行上传
      self._upload(index);
      return true
    },
    /**
     * @description 批量上传
     */
    uploadMultiple: function() {
      const self = this;
      const len = self.fileList.length;
      for (let i = 0; i < len; i++) {
        // 调用单文件上传
        self.upload(i);
      }
    },
    /**
     * @param {number} index 文件索引
     * @description 上传文件
     */
    _upload: function(index) {
      const self = this;
      
      // 校验索引
      if (index < 0 || index >= self.fileList.length) {
        self.msg(EventUpload, MsgError, '索引越界', index)
        return false
      }
      
      // 校验服务端上传接口配置
      if (!self.options.url) {
        self.msg(EventUpload, MsgError, '服务端上传接口未配置');
        return false
      }
      
      const formData = new FormData();
      for (let [key, value] of Object.entries(self.options.param)) {
        formData.append(key, value);
      }
      formData.append('file', self.fileList[index].originData);
      $.ajax({
        url: self.options.url,
        type: 'post',
        cache: false, 
        data: formData,
        processData: false, 
        contentType: false, 
        dataType: 'json',
        headers: self.options['headers'] || {},
        beforeSend: function(xhr) {
          self.update(index, {status: Uploading})
        },
        complete: function(xhr,status) {
          // 上传完毕后的钩子
          if (self.options['on-done'] != null && $.isFunction(self.options['on-done'])) {
            self.options['on-done'](xhr.status, xhr.responseJSON, index, self.fileList);
          }
        },
        success: function(res,status,xhr) {
          // 上传成功后的钩子
          if (self.options['on-success'] != null && $.isFunction(self.options['on-success'])) {
            // return false可中断默认行为
            if (self.options['on-success'](res, index, self.fileList) === false) {
              return false
            }
          }
          
          self.update(index, {status: UploadSuccess, url: res.url})
        },
        error: function(xhr,status,error) {
          // 上传失败后的钩子
          if (self.options['on-error'] != null && $.isFunction(self.options['on-error'])) {
            // return false可中断默认行为
            if (self.options['on-error'](xhr.status, xhr.responseJSON, index, self.fileList) === false) {
              return false
            }
          }
          
          self.update(index, {status: UploadFailure})
        }
      });
    },
    /**
     * @param {number} index 文件索引
     * @param {object} option 文件信息
     * @description 更新文件信息
     */
    update: function(index, option) {
      const self = this;
      
      if (index < 0 || index >= self.fileList.length) {
        self.msg(EventUpdate, MsgError, '索引越界', index)
        return false
      }
      
      // 文件状态转移
      let transfer = false;
      if (option.hasOwnProperty('status')) {
        if (![UploadWait, Uploading, UploadFinish, UploadSuccess, UploadFailure].includes(option.status)) {
          self.msg(EventUpdate, MsgError, '无效状态码', index);
          return false
        }
        
        // 文件状态转移
        // 有效集：UploadFinish、UploadSuccess
        // 无效集：UploadWait、Uploading、UploadFailure
        // 若文件状态在<有效集>和<无效集>之间转移，则触发数据变更
        const validList = [UploadFinish, UploadSuccess];
        const invalidList = [UploadWait, Uploading, UploadFailure];
        if ((validList.includes(self.fileList[index].status) && invalidList.includes(option.status)) ||
            (invalidList.includes(self.fileList[index].status) && validList.includes(option.status))) {
          transfer = true;
        }
        self.fileList[index].status = option.status;
      }
      if (option.hasOwnProperty('name')) {
        self.fileList[index].name = option.name;
      }
      if (option.hasOwnProperty('url')) {
        self.fileList[index].url = option.url;
      }
      if (option.hasOwnProperty('originUrl')) {
        self.fileList[index].originUrl = option.originUrl;
      }
      if (option.hasOwnProperty('originData')) {
        self.fileList[index].originData = option.originData;
      }
    
      self.refreshItemElem(index);
      // 当文件状态转移才触发数据变更方法
      if (transfer) {
        self.change();
      }
      return true
    },
    /**
     * @param {array} fileList 文件列表
     * @description 在当前文件列表尾部追加文件
     */
    push: function(fileList) {
      const self = this;
      if (!self.canAppend(fileList.length)) {
        self.msg(EventPush, MsgInfo, self.options['msg']['limit']);
        return false
      }
      for (let i = 0, len = fileList.length; i < len; i++) {
        const file = self.createFileObj(fileList[i].url, fileList[i].status, fileList[i].name, fileList[i].originUrl, fileList[i].originData)
        self.fileList.push(file);
        self.pushFileElem(file);
      }
      
      self.change();
      return true
    },
    /**
     * @param {number} index 插入索引位置
     * @param {array} fileList 文件列表
     * @description 在指定索引位置插入文件。若index越界，则在文件列表尾部追加文件，效果同push
     */
    insert: function(index, fileList) {
      const self = this;
      if (index < 0) {
        self.msg(EventInsert, MsgError, '索引越界', index)
        return false
      }
      if (index > self.fileList.length) {
        index = self.fileList.length;
      }
      if (!self.canAppend(fileList.length)) {
        self.msg(EventInsert, MsgInfo, self.options['msg']['limit']);
        return false
      }
      for (let i = 0, len = fileList.length; i < len; i++) {
        const file = self.createFileObj(fileList[i].url, fileList[i].status, fileList[i].name, fileList[i].originUrl, fileList[i].originData)
        self.insertFileElem(file, index+i);
        self.fileList.splice(index+i, 0, file);
      }
      
      self.change();
      return true
    },
    /**
     * @param {number} index 文件索引
     * @description 删除文件
     */
    remove: function(index) {
      const self = this;
      
      // 校验索引
      if (index < 0 || index >= self.fileList.length) {
        self.msg(EventRemove, MsgError, '索引越界', index)
        return false
      }
      
      // 删除前的钩子
      if (self.options['before-remove'] != null && $.isFunction(self.options['before-remove'])) {
        // return false可中断默认行为
        if (self.options['before-remove'](index, self.fileList) === false) {
          return false
        }
      }
      
      const $fileElem = $('.upload-file-item[data-key=' + self.fileList[index].key + ']', self.element);
      $fileElem.remove();
      self.fileList.splice(index, 1);
      
      // 删除后的钩子
      if (self.options['on-remove'] != null && $.isFunction(self.options['on-remove'])) {
        self.options['on-remove'](index, self.fileList)
      }
      
      self.change();
      return true
    },
    /**
     * @description 清空文件
     */
    clear: function() {
      const self = this;
      const $elem = self.element;
      
      // 清空前的钩子
      if (self.options['before-clear'] != null && $.isFunction(self.options['before-clear'])) {
        // return false可中断默认行为
        if (self.options['before-clear'](self.fileList) === false) {
          return false
        }
      }
      
      // 清空文件
      self.fileList = [];
      $elem.children('.upload-file-list').html('');
      
      // 清空后的钩子
      if (self.options['on-clear'] != null && $.isFunction(self.options['on-clear'])) {
        self.options['on-clear']();
      }
      
      self.change();
      return true
    },
    /**
     * @description 数据变更
     */
    change: function() {
      const self = this;
      // 数据变更的钩子
      if (self.options['on-change'] != null && $.isFunction(self.options['on-change'])) {
        self.options['on-change'](self.fileList);
      }
      // 数据绑定
      self.bind();
    },
    /**
     * @description 数据绑定
     */
    bind: function() {
      const self = this;
      if (!self.options.bindElem) {
        return true
      }
      const $bindElem = $(self.options.bindElem);
      if ($bindElem && $bindElem.jquery) {
        $bindElem.val(self.toJsonString());
      }
      return true
    },
    /**
     * @description 输出已上传成功的文件数据 若限制单文件时返回一个文件对象，若多文件时返回一个文件列表。
     */
    val: function() {
      const self = this;
      
      if (self.options['limit'] === 1) {
        return self.fileList[0] || {};
      }
      
      const l = [];
      for (let i = 0, len = self.fileList.length; i < len; i++) {
        if (self.fileList[i].status === UploadFinish ||
          self.fileList[i].status === UploadSuccess) {
          l.push({
            'url': self.fileList[i].url,
            'name': self.fileList[i].name
          });
        }
      }
      return l;
    },
    /**
     * @description 以JSON格式输出数据
     */
    toJsonString: function() {
      const self = this;
      return JSON.stringify(self.val());
    },
    /**
     * @param {string} event 事件
     * @param {string} level 消息级别
     * @param {string} msg 消息内容
     * @param {number} index 文件索引
     * @description 消息通知
     */
    msg: function(event, level, msg, index) {
      const self = this;
      
      // 提示消息的钩子
      if (self.options['on-msg'] != null && $.isFunction(self.options['on-msg']) && level.match(new RegExp(self.options['subscribeMessage']))) {
        self.options['on-msg'](event, level, msg, index, self.fileList);
      } else {
        switch(level) {
          case MsgLog:
            console.log('file-upload-msg', event, level, msg, index);
            break;
          case MsgInfo: 
            console.info('file-upload-msg', event, level, msg, index);
            break;
          case MsgWarn:
            console.warn('file-upload-msg', event, level, msg, index);
            break;
          case MsgError:
            console.error('file-upload-msg', event, level, msg, index);
            break;
          default:
            console.log('file-upload-msg', level, msg, index);
        }
      }
      return true
    },
    /**
     * @param {number} number 期望追加上传文件数量
     * @return {boolean} true（允许上传）、false（拒绝）
     * @description 校验是否可以继续上传文件
     */
    canAppend: function (number) {
      const self = this;
      if (!self.options['multiple'] && self.fileList.length + number > 1) {
        return false
      }
      if (self.options['multiple'] && self.options['limit'] > 0 && self.options['limit'] < self.fileList.length + number) {
        return false
      }
      return true
    },
    /**
     * @param {string} url 文件地址
     * @param {number} status 状态码
     * @param {string} name 文件名称
     * @param {string} originUrl 预览地址
     * @param {object} originData File对象
     * @description 创建文件对象
     */
    createFileObj: function(url, status, name, originUrl, originData) {
      const self = this;
      return {
        'key': (++self.fileKey) + '',     // 文件关键字，唯一
        'name': name || '',               // 文件名称
        'status': status || UploadWait,   // 文件状态
        'url': url || '',                 // 文件地址
        'originUrl': originUrl || '',     // 预览地址
        'originData': originData || null, // 预览数据
      }
    },
    /**
     * @param {string} key 文件关键字
     * @return {number} 文件索引
     * @description 查找文件。若查询成功，返回文件索引；否则返回-1
     */
    findFile: function(key) {
      const self = this;
      const len = self.fileList.length;
      for (let i = 0; i < len; i++) {
        if (self.fileList[i].key === key) {
          return i
        }
      }
      return -1;
    },
    /**
     * @param {number} index 文件索引
     * @description 查找文件节点。若查询成功，返回节点；否则返回undefined
     */
    findElem: function(index) {
      const self = this;
      // 校验索引
      if (index < 0 || index >= self.fileList.length) {
        return undefined
      }
      return $('.upload-file-item[data-key=' + self.fileList[index].key + ']', self.element);
    },
    /**
     * @description 刷新文件列表
     */
    refresh: function() {
      const self = this;
      self.element.children('.upload-file-list').html('');
      for (let i = 0; i < self.fileList.length; i++) {
        self.pushFileElem(self.fileList[i]);
      }
      return true
    },
    /**
     * @param {object} file 文件
     * @description 追加文件节点
     */
    pushFileElem: function(file) {
      const self = this;
      const tpl = self.createFileElemTpl(file);
      self.element.children('.upload-file-list').append(tpl);
    },
    /**
     * @param {object} file 文件
     * @param {number} index 文件索引
     * @description 插入文件节点
     */
    insertFileElem: function(file, index) {
      const self = this;
      const $elem = self.findElem(index);
      const tpl = self.createFileElemTpl(file);
      $(tpl).insertBefore($elem);
    },
    /**
     * @param {object} file 文件
     * @return {string} 文件节点数据
     * @description 创建文件节点模板
     */
    createFileElemTpl: function(file) {
      const self = this;
      const html = [];
      html.push('<li class="upload-file-item ' + self.getStatusClass(file.status) + '" data-key="' + file.key + '">');
      switch (self.options['list-type']) {
        case 'picture': // 图片列表
          
          break;
        case 'picture-card': // 图片卡片列表
          html.push('<img class="upload-image" src="' + (file.originUrl || file.url) + '">');
          html.push('<div class="upload-file-indicator">');
          html.push('<p>' + self.getStatusText(file.status) + '</p>');
          html.push('</div>');
          html.push('<div class="upload-file-control">');
          switch (file.status) {
            case UploadWait:
            case UploadFailure:
              html.push('<button type="button" class="ctrl-upload btn ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</button>');
            default:
          }
          html.push('<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
          html.push('</div>');
          break;
        case 'text': // 文件列表
        default:
          /* html.push('<div class="upload-file-indicator">');
          html.push('<p>' + self.getStatusText(file.status) + '</p>');
          html.push('</div>');
          html.push('<div class="upload-file-control">');
          switch (file.status) {
            case UploadWait:
            case UploadFailure:
              html.push('<button type="button" class="ctrl-upload btn ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</button>');
            default:
          }
          html.push('<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
          html.push('</div>'); */
          
          //html.push('<i class="file-type-icon fa fa-file-o"></i>');
          html.push('<a class="file-name" href="' + file.url + '"><i class="file-type-icon fa fa-file-text-o"></i>' + file.name + '</a>');
          html.push('<i class="file-status-icon fa fa-check-circle-o"></i>');
          html.push('<i class="file-remove-icon fa fa-remove ctrl-remove"></i>');
      }
      
      html.push('</li>');
      return html.join('\n');
    },
    /**
     * @param {number} index 文件索引
     * @description 刷新文件节点
     */
    refreshItemElem: function(index) {
      const self = this;
      
      // 校验索引
      if (index < 0 || index >= self.fileList.length) {
        self.msg(EventUpdate, MsgError, '索引越界', index)
        return false
      }
      
      const file = self.fileList[index];
      const $elem = self.element;
      const $item = $('.upload-file-item[data-key=' + file.key + ']', $elem);
      if ($item.length === 0) {
        return
      }
      $item.removeClass('is-default is-uploading is-finish is-success is-failure is-warning').addClass(self.getStatusClass(file.status));
      $item.find('.upload-file-indicator').html('<p>' + self.getStatusText(file.status) + '</p>');
      switch (file.status) {
        case UploadWait:
          $item.children('.upload-file-control').html(
            '<button type="button" class="ctrl-upload btn ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</button>' +
            '<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
          break;
        case Uploading:
          break;
        case UploadFinish:
          break;
        case UploadSuccess:
          $item.children('.upload-image').attr('src', file.url);
          $item.children('.upload-file-control').html(
            '<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
          break;
        case UploadFailure:
          $item.children('.upload-file-control').html(
            '<button type="button" class="ctrl-upload btn ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</button>' +
            '<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
          break;
        default:
          $item.children('.upload-file-control').html(
            '<button type="button" class="ctrl-remove btn ' + self.options.controls['delete-style'] + '">' + self.options.controls['delete-content'] + '</button>');
      }
    },
    /**
     * @param {number} status 状态码
     * @description 获取状态描述内容
     */
    getStatusText: function(status) {
      const self = this;
      
      switch (status) {
        case UploadWait:
          return self.options.status[UploadWait] || '未上传';
        case Uploading:
          return self.options.status[Uploading] || '上传中';
        case UploadFinish:
          return self.options.status[UploadFinish] || '已上传';
        case UploadFailure:
          return self.options.status[UploadFailure] || '上传失败';
        case UploadSuccess:
          return self.options.status[UploadSuccess] || '上传成功';
        default:
          return '状态异常';
      }
    },
    /**
     * @param {number} status 状态码
     * @description 获取状态样式
     */
    getStatusClass: function(status) {
      switch (status) {
        case UploadWait:
          return 'is-default';
        case Uploading:
          return 'is-doing';
        case UploadFinish:
          return 'is-finish';
        case UploadFailure:
          return 'is-failure';
        case UploadSuccess:
          return 'is-success';
        default:
          return 'is-warning';
      }
    }
  };

  $.fn.fileUpload = function(option) {
    const args = arguments;
    return this.each(function() {
      const self = $(this);
      let data = self.data('fileUpload');
      if (!data) {
        data = new FileUpload(self, option);
        self.data('fileUpload', data)
      }
      if (typeof option === 'string') {
        data[option].apply(data, Array.prototype.slice.call(args, 1));
      }
    })
  };
})($);
