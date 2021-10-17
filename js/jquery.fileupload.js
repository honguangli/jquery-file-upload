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
  const EventChoose = 'choose';            // 选择文件事件
  const EventDisplayShow = 'display-show'; // 显示事件
  const EventDisplayHide = 'display-hide'; // 隐藏事件
  const EventUpload = 'upload';            // 上传事件
  const EventRemove = 'remove';            // 删除事件
  const EventClear = 'clear';              // 清空事件
  const EventPush = 'push';                // 添加事件
  const EventInsert = 'insert';            // 插入事件
  const EventUpdate = 'update';            // 更新事件
  
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
  const UploadDefault = 0;   // 未上传
  const Uploading = 1;       // 上传中
  const UploadFinish = 2;    // 已上传
  const UploadSuccess = 200; // 上传成功
  const UploadFailure = 500; // 上传失败
  
  // 默认配置
  const defaults = {
    'multiple': false,            // 是否允许多文件上传
    'limit': 1,                   // 文件上传数量限制，小于等于0时不限制
    'maxSize': 1024000,           // 文件大小限制，单位B
    
    'accept': 'image/*',            // 文件类型 images（图片）、file（所有文件）、video（视频）、audio（音频）
    'acceptMime': 'image/*',        // 文件选择框筛选出的文件类型
    'exts': 'jpg|png|gif|bmp|jpeg', // 允许上传的文件后缀
    
    'auto': true,  // 选择文件后是否自动上传
    'url': '',     // 服务端上传接口
    'headers': {}, // 上传接口请求头
    'param': {},   // 上传接口的额外参数
		
		'download': false, // 文件名称a标签是否添加download属性
    
    'bindElem': null, // 数据绑定Jquery对象
    'data': [],       // 预设文件列表，['http://a.com/a.jpg', 'http://b.cn/b.png']
    
    'list-type': 'text', // 文件列表样式 text（文件列表）、picture（图片列表）、picture-card（图片卡片列表）
    'preview': false,    // 是否启动图片预览
    
    'subscribeMessage': 'info|warn|error', // 订阅消息
    
    // 消息模板。内置变量：{limit}（文件数量限制）、{maxSize}（文件大小限制）
    'msg': {
      'limit': '最多可选择{limit}张图片', // 文件数量超出上限时的提示消息
      'maxSize': '文件大小超出',          // 文件大小超出上限时的提示消息
    },
    
    // 状态描述文本
    'status': {
			'default-icon': '<i class="fa fa-exclamation-circle fa-fw"></i>', // 未上传图标
			'uploading-icon': '<i class="fa fa-spinner fa-fw fa-pulse"></i>', // 上传中图标
			'finish-icon': '<i class="fa fa-check-circle-o fa-fw"></i>',      // 已上传图标
			'success-icon': '<i class="fa fa-check-circle-o fa-fw"></i>',     // 上传成功图标
			'failure-icon': '<i class="fa fa-exclamation-circle fa-fw"></i>', // 上传失败图标
    },
    
    // 控制器
    'controls': {                 
      'hide': false,                                                         // 是否隐藏全部控制器
      'choose': true,                                                        // 选择文件按钮
      'choose-style': 'btn-primary btn-mini',                                // 选择文件按钮样式
      'choose-content': '<i class="fa fa-cloud-upload fa-fw"></i> 选择文件',  // 选择文件按钮内容
      'display': false,                                                      // 显示隐藏按钮
      'display-style': 'btn-primary btn-mini',                               // 显示隐藏按钮样式
      'display-hide-content': '<i class="fa fa-eye-slash fa-fw"></i>',       // 隐藏按钮内容
      'display-show-content': '<i class="fa fa-eye fa-fw"></i>',             // 显示按钮内容
      'upload-multiple': false,                                              // 批量上传按钮
      'upload-multiple-style': 'btn-primary btn-mini',                       // 批量上传按钮样式
      'upload-multiple-content': '<i class="fa fa-cloud-upload fa-fw"></i>', // 批量上传按钮内容
      'clear': false ,                                                       // 清空按钮
      'clear-style': 'btn-danger btn-mini',                                  // 清空按钮样式
      'clear-content': '<i class="fa fa-trash fa-fw"></i>',                  // 清空按钮内容
      'upload': true,                                                        // 上传按钮
      'upload-style': '',                                                    // 上传按钮样式
      'upload-content': '<i class="fa fa-cloud-upload fa-fw"></i>',          // 上传按钮内容
      'remove': true,                                                        // 删除按钮
      'remove-style': '',                                                    // 删除按钮样式
      'remove-content': '<i class="fa fa-trash fa-fw"></i>',                 // 删除按钮内容
			'preview':true,                                                        // 预览按钮
			'preview-style': '',                                                   // 预览按钮样式
			'preview-content': '<i class="fa fa-search-plus fa-fw"></i>',          // 预览按钮内容
			'picture-choose': false,                                               // 图片选择卡片
			'picture-choose-style': '',                                            // 图片选择卡片样式
			'picture-choose-content': '<i class="fa fa-plus fa-fw"></i>',          // 图片选择卡片内容
    },
    
    // 钩子函数
    'before-choose': null, // 选择文件前的钩子 return false可中断默认行为
    'on-choose': null,     // 选择文件的钩子 return false可中断默认行为
    'on-upload': null,     // 上传前的钩子 return false可中断默认行为
    'on-done': null,       // 上传完毕后的钩子
    'on-success': null,    // 上传成功后的钩子
    'on-error': null,      // 上传失败后的钩子
    'on-remove': null,     // 删除前的钩子
    'on-clear': null,      // 清空前的钩子
    'on-change': null,     // 数据变更的钩子
    'on-msg': null,        // 提示消息的钩子
  };
	
	// 卡片图片默认配置
	const pictureCardOption = {
		'controls': {'choose': false, 'picture-choose': true}
	}

  /**
   * @param {object} element 加载节点
   * @param {object} option 参数
   * @description 文件上传插件
   */
  function FileUpload(element, option) {
    const self = this;
    self.element = element;
		const special = option['list-type'] === 'picture-card' ? pictureCardOption : {};
    self.options = $.extend(true, {}, defaults, special, option);
    if (!self.options['multiple']) {
      self.options['limit'] = 1
    }
    self.options['msg']['limit'] = self.options['msg']['limit'].replace(new RegExp('{limit}'), self.options['limit'])
    self.options['msg']['maxSize'] = self.options['msg']['maxSize'].replace(new RegExp('{maxSize}'), self.options['maxSize'])
    
    self.fileList = [];
    self.fileKey = 1;
    self.init();
  }

  FileUpload.prototype = {
    /**
     * @description 启动插件
     */
    init: function() {
      const self = this;
      const $elem = self.element;
      
      $elem.addClass('file-upload-wrap');
      
      // 控制器
			const controls = [];
      if (self.options.controls['hide'] === false) {
        // 选择文件按钮
        if (self.options.controls['choose'] === true) {
          controls.push('<button type="button" class="ctrl-choose btn ' + self.options.controls['choose-style'] + '">' + self.options.controls['choose-content'] + '</button>');
        }
        // 显示隐藏按钮
        if (self.options.controls['display'] === true) {
          controls.push('<button type="button" class="ctrl-display btn ' + self.options.controls['display-style'] + '" data-display="true">' + self.options.controls['display-hide-content'] + '</button>');
        }
        // 批量上传按钮
        if (self.options.controls['upload-multiple'] === true) {
          controls.push('<button type="button" class="ctrl-multiple-upload btn ' + self.options.controls['upload-multiple-style'] + '">' + self.options.controls['upload-multiple-content'] + '</button>');
        }
        // 清空按钮
        if (self.options.controls['clear'] === true) {
          controls.push('<button type="button" class="ctrl-clear btn ' + self.options.controls['clear-style'] + '">' + self.options.controls['clear-content'] + '</button>');
        }
      }
			
      const html = [];
      html.push('<input class="file-input" type="file" accept="' + self.options.acceptMime + '"/>')
			if (controls.length > 0) {
				html.push('<div class="controls">');
				html.push(controls.join('\n'));
				html.push('</div>');
			}
      html.push('<ul class="file-list ' + self.options['list-type'] + '"></ul>');
			
			if (self.options['list-type'] === 'picture-card' && self.options.controls['picture-choose'] === true) {
				html.push('<div class="picture-choose">');
				html.push('<span class="picture-choose-control ctrl-choose ' + self.options.controls['picture-choose-style'] + '">' + self.options.controls['picture-choose-content'] + '</span>');
				html.push('</div>');
			}
			
			// TODO 1 图片选择卡片显示时机
			// TODO 2 图片预览
			// TODO 3 拖拽上传
			// TODO 4 msg方法重新定义
			/*
			if (!self.canAppend(1)) {
				self.element.children('.picture-choose').addClass('hide');
			} else {
				self.element.children('.picture-choose').removeClass('hide');
			}
			*/
			
      $elem.append(html.join('\n'));
      
      // 注册事件监听
      self.when();
      
      // 添加已上传文件列表
      const preFileList = [];
      for (let i = 0; i < self.options.data.length; i++) {
				let file;
				switch (typeof self.options.data[i]) {
					case 'string': 
						file = self.createFileObj(self.options.data[i], UploadFinish);
						break;
					case 'object':
						file = self.createFileObj(self.options.data[i].url, UploadFinish, self.options.data[i].name)
						break;
					default:
						continue;
				}
        preFileList.push(file);
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
      }).on('change', '.file-input:input[type="file"]', function() {
        // 选择文件事件 on
        self._choose(this);
      }).on('click', '.ctrl-display', function() {
        // 显示隐藏文件列表事件
        self.display($(this).attr('data-display') === 'false');
      }).on('click', '.ctrl-multiple-upload', function() {
        // 批量上传事件
        self.uploadMultiple();
      }).on('click', '.ctrl-clear', function() {
        // 清空事件
        self.clear();
      }).on('click', '.ctrl-upload', function() {
        // 上传事件
        const $item = $(this).closest('.file-item');
        self.upload($item.attr('data-key'));
      }).on('click', '.ctrl-remove', function() {
        // 删除事件
        const $item = $(this).closest('.file-item');
        self.remove($item.attr('data-key'));
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
      
      self.element.children('.file-input:input[type="file"]').click();
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
            
      // 创建文件对象
      const file = self.createFileObj('', UploadDefault, fileName, originUrl, originFile);
			
			// 选择文件的钩子
			if (self.options['on-choose'] != null && $.isFunction(self.options['on-choose'])) {
			  // return false可中断默认行为
			  if (self.options['on-choose'](elem, file, self.fileList) === false) {
			    return false
			  }
			}
			
      self.pushFileElem(file);
      self.fileList.push(file);
            
      // 自动上传
      if (self.options['auto'] === true) {
        self._upload(file);
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
        $elem.find('.controls .ctrl-display').attr('data-display', 'false').html(self.options.controls["display-show-content"]);
        $elem.children('.file-list').addClass('hide');
      } else {
        $elem.find('.controls .ctrl-display').attr('data-display', 'true').html(self.options.controls["display-hide-content"]);
        $elem.children('.file-list').removeClass('hide');
      }
      return true
    },
    /**
     * @param {string（或number）} key 文件关键字（或文件索引）
     * @description 上传
     */
    upload: function(key) {
      const self = this;
			
			// 查找文件
			const file = self.findFile(key);
			if (!file) {
				self.msg(EventUpload, MsgError, '查找文件失败', key)
				return false
			}
      
      // 执行上传
      self._upload(file);
      return true
    },
    /**
     * @description 批量上传
     */
    uploadMultiple: function() {
      const self = this;
      const len = self.fileList.length;
      for (let i = 0; i < len; i++) {
        self._upload(self.fileList[i]);
      }
    },
    /**
     * @param {object} file 上传文件
     * @description 上传文件
     */
    _upload: function(file) {
      const self = this;
      
			// 校验状态
			if (![UploadDefault, UploadFailure].includes(file.status)) {
			  return false
			}
			
			// 上传文件前的钩子
			if (self.options['on-upload'] != null && $.isFunction(self.options['on-upload'])) {
			  // return false可中断默认行为
			  if (self.options['on-upload'](file, self.fileList) === false) {
			    return false
			  }
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
      formData.append('file', file.originData);
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
          self._update(file, {status: Uploading})
        },
        complete: function(xhr,status) {
          // 上传完毕后的钩子
          if (self.options['on-done'] != null && $.isFunction(self.options['on-done'])) {
            self.options['on-done'](xhr.status, xhr.responseJSON, file, self.fileList);
          }
        },
        success: function(res,status,xhr) {
          // 上传成功后的钩子
          if (self.options['on-success'] != null && $.isFunction(self.options['on-success'])) {
            // return false可中断默认行为
            if (self.options['on-success'](res, file, self.fileList) === false) {
              return false
            }
          }
          
          self._update(file, {status: UploadSuccess, url: res.url})
        },
        error: function(xhr,status,error) {
          // 上传失败后的钩子
          if (self.options['on-error'] != null && $.isFunction(self.options['on-error'])) {
            // return false可中断默认行为
            if (self.options['on-error'](xhr.status, xhr.responseJSON, file, self.fileList) === false) {
              return false
            }
          }
          
          self._update(file, {status: UploadFailure})
        }
      });
    },
    /**
     * @param {string（或number）} key 文件关键字（或文件索引）
     * @param {object} option 文件信息
     * @description 更新文件信息
     */
    update: function(key, option) {
      const self = this;
      const file = self.findFile(key);;
      if (!file) {
      	self.msg(EventUpdate, MsgError, '查找文件失败', key)
      	return false
      }
      self._update(file, option);
      return true
    },
		/**
		 * @param {object} file 文件
		 * @param {object} option 文件信息
		 * @description 更新文件信息
		 */
		_update: function(file, option) {
		  const self = this;
		  
		  // 文件状态转移
		  let transfer = false;
		  if (option.hasOwnProperty('status')) {
		    if (![UploadDefault, Uploading, UploadFinish, UploadSuccess, UploadFailure].includes(option.status)) {
					option.status = UploadDefault;
		    }
		    
		    // 文件状态转移
		    // 有效集：UploadFinish、UploadSuccess
		    // 无效集：UploadDefault、Uploading、UploadFailure
		    // 若文件状态在<有效集>和<无效集>之间转移，则触发数据变更
		    const validList = [UploadFinish, UploadSuccess];
		    const invalidList = [UploadDefault, Uploading, UploadFailure];
		    if ((validList.includes(file.status) && invalidList.includes(option.status)) ||
		        (invalidList.includes(file.status) && validList.includes(option.status))) {
		      transfer = true;
		    }
		    file.status = option.status;
		  }
		  if (option.hasOwnProperty('name')) {
		    file.name = option.name;
		  }
		  if (option.hasOwnProperty('url')) {
		    file.url = option.url;
		  }
		  if (option.hasOwnProperty('originUrl')) {
		    file.originUrl = option.originUrl;
		  }
		  if (option.hasOwnProperty('originData')) {
		    file.originData = option.originData;
		  }
		
		  self.refreshItemElem(file);
		  // 当文件状态转移才触发数据变更方法
		  if (transfer) {
		    self.change();
		  }
		  return true
		},
    /**
     * @param {array} fileList 文件列表
     * @param {number} index 插入索引位置
     * @description 在当前文件列表尾部追加文件
     */
    push: function(fileList, index) {
      const self = this;
      if (!self.canAppend(fileList.length)) {
        self.msg(EventPush, MsgInfo, self.options['msg']['limit']);
        return false
      }
			
			const len = fileList.length;
      for (let i = 0; i < len; i++) {
        const file = self.createFileObj(fileList[i].url, fileList[i].status, fileList[i].name, fileList[i].originUrl, fileList[i].originData)
        self.pushFileElem(file);
				self.fileList.push(file);
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
      if (typeof index != 'number' || index < 0 || index > self.fileList.length) {
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
     * @param {string（或number）} key 文件关键字（或文件索引）
     * @description 删除文件
     */
    remove: function(key) {
      const self = this;
			
			const file = self.findFile(key);;
			if (!file) {
				self.msg(EventRemove, MsgError, '查找文件失败', key)
				return false
			}
      
      // 删除前的钩子
      if (self.options['on-remove'] != null && $.isFunction(self.options['on-remove'])) {
        // return false可中断默认行为
        if (self.options['on-remove'](file, self.fileList) === false) {
          return false
        }
      }
      
			const $elem = self.findElem(file.key);
			if ($elem) {
				$elem.remove();
			}
      
			const len = self.fileList.length;
			for (let i = 0; i < len; i++) {
			  if (self.fileList[i].key === file.key) {
					self.fileList.splice(i, 1);
					self.change();
					break;
			  }
			}
      
      return true
    },
    /**
     * @description 清空文件
     */
    clear: function() {
      const self = this;
      const $elem = self.element;
      
      // 清空前的钩子
      if (self.options['on-clear'] != null && $.isFunction(self.options['on-clear'])) {
        // return false可中断默认行为
        if (self.options['on-clear'](self.fileList) === false) {
          return false
        }
      }
      
      // 清空文件
      self.fileList = [];
      $elem.children('.file-list').html('');
      
      self.change();
      return true
    },
    /**
     * @description 数据变更
     */
    change: function() {
      const self = this;
      // 数据绑定
      self.bind();
      // 数据变更的钩子
      if (self.options['on-change'] != null && $.isFunction(self.options['on-change'])) {
        self.options['on-change'](self.fileList);
      }
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
		 * @description 输出文件列表
		 */
		list: function() {
			const self = this;
			return self.fileList;
		},
    /**
     * @description 输出已上传成功的文件数据 若限制单文件时返回文件url，若多文件时返回一个文件url列表
     */
    val: function() {
      const self = this;
      
      if (self.options.limit === 1) {
				if (self.fileList.length > 0) {
					return self.fileList[0].url;
				}
        return '';
      }
      
      const l = [];
      for (let i = 0, len = self.fileList.length; i < len; i++) {
        if (self.fileList[i].status === UploadFinish ||
          self.fileList[i].status === UploadSuccess) {
          l.push(self.fileList[i].url);
        }
      }
      return l;
    },
    /**
     * @description 以JSON格式输出数据
     */
    toJsonString: function() {
      const self = this;
			if (self.options.limit === 1) {
				return self.val();
			}
      return JSON.stringify(self.val());
    },
    /**
     * @param {string} event 事件
     * @param {string} level 消息级别
     * @param {string} msg 消息内容
     * @param {number} key 文件关键字
     * @description 消息通知
     */
    msg: function(event, level, msg, key) {
      const self = this;
      
      // 提示消息的钩子
      if (self.options['on-msg'] != null && $.isFunction(self.options['on-msg']) && level.match(new RegExp(self.options['subscribeMessage']))) {
        self.options['on-msg'](event, level, msg, key, self.fileList);
      } else {
        switch(level) {
          case MsgLog:
            console.log('file-upload-msg', event, level, msg, key);
            break;
          case MsgInfo: 
            console.info('file-upload-msg', event, level, msg, key);
						alert(msg);
            break;
          case MsgWarn:
            console.warn('file-upload-msg', event, level, msg, key);
						alert(msg);
            break;
          case MsgError:
            console.error('file-upload-msg', event, level, msg, key);
						alert(msg);
            break;
          default:
            console.log('file-upload-msg', event, level, msg, key);
						alert(msg);
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
			
			if (!name) {
				name = url.substring(url.lastIndexOf('/') + 1) || url.substring(url.lastIndexOf('/') + 1) || '';
			}
			
			self.fileKey++;
			const file = {
				'key': self.fileKey + '',          // 文件关键字，唯一
				'name': name || '',                // 文件名称
				'status': status || UploadDefault, // 文件状态
				'url': url || '',                  // 文件地址
				'originUrl': originUrl || '',      // 预览地址
				'originData': originData || null,  // 预览数据
			}
			return file;
    },
    /**
     * @param {string（或number）} key 文件关键字（或文件索引）
     * @return {object} 文件
     * @description 查找文件。若查询成功，返回文件；否则返回undefined
     */
    findFile: function(key) {
      const self = this;
			
			let file = undefined;
			if (typeof key == 'string') {
				const len = self.fileList.length;
				for (let i = 0; i < len; i++) {
				  if (self.fileList[i].key === key) {
				    file = self.fileList[i]
						break
					}
				}
			} else if (typeof key == 'number') {
				if (key >= 0 && key < self.fileList.length) {
					file = self.fileList[key];
				}
			}
			
      return file;
    },
    /**
     * @param {string} key 文件关键字
		 * @return {object} 文件节点
     * @description 查找文件节点。若查询成功，返回节点；否则返回undefined
     */
    findElem: function(key) {
      const self = this;
      return $('.file-item[data-key=' + key + ']', self.element);
    },
    /**
     * @description 刷新文件列表
     */
    refresh: function() {
      const self = this;
      self.element.children('.file-list').html('');
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
      self.element.children('.file-list').append(tpl);
			return true
    },
    /**
     * @param {object} file 文件
     * @param {number} index 位置索引
     * @description 插入文件节点
     */
    insertFileElem: function(file, index) {
      const self = this;
			
			if (typeof index != 'number' || self.fileList.length == 0 || index < 0 || index >= self.fileList.length) {
				return self.pushFileElem(file)
			}
			
      const $elem = self.findElem(self.fileList[index].key);
			if (!$elem) {
				return self.pushFileElem(file);
			}
      const tpl = self.createFileElemTpl(file);
      $(tpl).insertBefore($elem);
			return true
    },
    /**
     * @param {object} file 文件
     * @return {string} 文件节点数据
     * @description 创建文件节点模板
     */
    createFileElemTpl: function(file) {
      const self = this;
      const html = [];
      html.push('<li class="file-item ' + self.getStatusClass(file.status) + '" data-key="' + file.key + '">');
      switch (self.options['list-type']) {
        case 'picture': // 图片列表
					html.push('<img class="upload-image" src="' + (file.originUrl || file.url) + '">');
          html.push('<a class="file-name" href="' + file.url + (self.options.download === true ? '" download="' + file.name : '') + '">' + file.name + '</a>');
					html.push('<span class="file-status-icon">')
          html.push(self.getStatusIcon(file.status));
					html.push('</span>');
          html.push('<span class="upload-file-control full">');
					html.push('<span class="file-preview-icon ctrl-preview ' + self.options.controls['preview-style'] + '">' + self.options.controls['preview-content'] + '</span>');
          html.push('<span class="file-upload-icon ctrl-upload ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</span>');
          html.push('<span class="file-remove-icon ctrl-remove ' + self.options.controls['remove-style'] + '">' + self.options.controls['remove-content'] + '</span>');
          html.push('</span>');
          break;
        case 'picture-card': // 图片卡片列表
					html.push('<img class="upload-image" src="' + (file.originUrl || file.url) + '">');
					html.push('<span class="file-status-icon">')
          html.push(self.getStatusIcon(file.status));
					html.push('</span>');
					html.push('<span class="upload-file-control full">');
					html.push('<span class="file-preview-icon ctrl-preview ' + self.options.controls['preview-style'] + '">' + self.options.controls['preview-content'] + '</span>');
          html.push('<span class="file-upload-icon ctrl-upload ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</span>');
          html.push('<span class="file-remove-icon ctrl-remove ' + self.options.controls['remove-style'] + '">' + self.options.controls['remove-content'] + '</span>');
					html.push('</span>');
          break;
        case 'text': // 文件列表
        default:
          html.push('<a class="file-name" href="' + file.url + (self.options.download === true ? '" download="' + file.name : '') + '"><i class="file-type-icon fa fa-file-text-o fa-fw"></i>' + file.name + '</a>');
					html.push('<span class="file-status-icon">')
          html.push(self.getStatusIcon(file.status));
					html.push('</span>');
					html.push('<span class="upload-file-control">');
					html.push('<span class="file-preview-icon ctrl-preview ' + self.options.controls['preview-style'] + '">' + self.options.controls['preview-content'] + '</span>');
          html.push('<span class="file-upload-icon ctrl-upload ' + self.options.controls['upload-style'] + '">' + self.options.controls['upload-content'] + '</span>');
          html.push('<span class="file-remove-icon ctrl-remove ' + self.options.controls['remove-style'] + '">' + self.options.controls['remove-content'] + '</span>');
          html.push('</span>');
      }
      
      html.push('</li>');
      return html.join('\n');
    },
    /**
     * @param {object} file 文件
     * @description 刷新文件节点
     */
    refreshItemElem: function(file) {
      const self = this;
      
			const $elem = self.findElem(file.key);
			if (!$elem) {
				return false
			}
      $elem.removeClass('is-default is-doing is-uploading is-finish is-success is-failure is-warning').addClass(self.getStatusClass(file.status));
			$elem.find('.file-name').attr('href', (file.url || file.originUrl));
			if (self.options.download === true) {
				$elem.attr('download', file.name || '');
			}
			//$elem.find('<img class="upload-image" src="' + (file.url || file.originUrl) + '">');
			$elem.find('.file-status-icon').html(self.getStatusIcon(file.status));
			return true
    },
		/**
		 * @param {number} status
		 * @return {string} 状态图标
		 */
		getStatusIcon: function(status) {
			const self = this;
			switch (status) {
			  case UploadDefault:
				  return self.options.status['default-icon'];
					break;
				case Uploading:
				  return self.options.status['uploading-icon'];
					break;
				case UploadFinish:
				  return self.options.status['finish-icon'];
					break;
				case UploadSuccess:
				  return self.options.status['success-icon'];
					break;
				case UploadFailure:
			    return self.options.status['failure-icon'];
					break;
			  default:
					return '';
			}
		},
    /**
     * @param {number} status 状态码
		 * @return {string} 状态样式
     * @description 获取状态样式
     */
    getStatusClass: function(status) {
      switch (status) {
        case UploadDefault:
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
		[].shift.apply(args);
		
		let value;
		const chain = this.each(function () {
		  const $this = $(this);
		  let data = $this.data('fileUpload');
		  
		  if (!data) {
				// 初始化
				$this.data('fileUpload', (data = new FileUpload($this, option)));
		  } else if (typeof option == 'object') {
		    // 更新参数
				for (let i in option) {
		      if (option.hasOwnProperty(i)) {
		        data.options[i] = option[i];
		      }
		    }
		  } else if (typeof option == 'string') {
		    // 调用方法/获取参数值
				if (data[option] instanceof Function) {
		      value = data[option].apply(data, args);
		    } else {
		      value = data.options[option];
		    }
		  }
		});
		
		if (typeof value !== 'undefined') {
		  // noinspection JSUnusedAssignment
		  return value;
		} else {
		  return chain;
		}
  };
})($);
