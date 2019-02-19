/**
 * Created by sky on 2017/7/4.
 */

//util 方法

var Util = {
	getTarget: function () {
		var evt = Util.getEvent();
		if (!evt) evt = window.event;
		var obj = evt.srcElement ? evt.srcElement : evt.target;
		return obj;
	},
	getEvent: function () {
		if (document.all) {
			return window.event;
		}
		func = Util.getEvent.caller;
		while (func != null) {
			var arg0 = func.arguments[0];
			if (arg0) {
				if (arg0.constructor == Event
					|| arg0.constructor == MouseEvent
					|| (typeof(arg0) == "object" && arg0.preventDefalut && arg0.stopPropagation)) {
					return arg0;
				}
			}
			func = func.caller;
		}
		return null;
	},
	queryString: function (val) {
		var uri = decodeURI(window.location.search, "UTF-8");
		var re = new RegExp("" + val + "=([^&?]*)", "ig");
		return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1))
			: null);
	},
	setItem: function (key, value) {
		localStorage.setItem(key, value)
	},
	getItem: function (key) {
		return localStorage.getItem(key);
	},
	removeItem: function (key) {
		localStorage.removeItem(key);
	},
	clearLocalStorage: function (key) {
		localStorage.clear();
	},
	redirectLogin: function (result) {
		if (result == undefined) return;
		var msg = "";
		if (result && result == '2') {
			// msg = "票据过期，请重新登录！";
			// Util.clearLocalStorage();
			// Util.showAlertMsg(msg, function () {
			Util.clearLocalStorage();
			window.location.href = 'login.html?type=loginout';
			// });
		} else if (result && result == '3') {
			msg = "暂未登录，请先登录！";
			Util.showAlertMsg(msg, function () {
				Util.clearLocalStorage();
				window.location.href = 'login.html?type=loginout';
			});
		} else if (result && (result == '7')) {
			msg = "该设备已被迫下线，请重新登录！";
			Util.showAlertMsg(msg, function () {
				Util.clearLocalStorage();
				window.location.href = 'login.html';
			});
		} else if (result && (result == '8')) {
			msg = "该设备已解绑，请重新登录！";
			Util.showAlertMsg(msg, function () {
				Util.clearLocalStorage();
				window.location.href = 'login.html?type=loginout';
			});
		} else if (result && result == '6') {
			msg = "该设备已下线，请重新登录！";
			Util.showAlertMsg(msg, function () {
				Util.clearLocalStorage();
				window.location.href = 'login.html?type=loginout';
			});
		}
		return;
	},
	quitToLoginPage: function (userid, ticket, uuid) {
		Util.showConfirmMsg('确定要注销当前用户吗？', function () {
			getDataByAjax({
				url: base + 'mobileEquipment/updateLoginStatus',
				// url:'http://192.168.81.36:8091/oa/mobileEquipment/updateLoginStatus',
				data: {
					userid: userid,
					ticket: ticket,
					uuid: uuid,
					loginStatus: '0'
				}
			}, function (data) {
				Util.redirectLogin(data.result);
				if (!data || data.status == 'error') {
					A.showToast('退出失败');
				} else if (data.status == 'success') {
					var path;
					if (device.platform.toLowerCase() == 'ios') {
						path = cordova.file.documentsDirectory + localFileName;
					} else {
						path = cordova.file.externalDataDirectory + localFileName;
					}
					checkFileExited(path, function (entry) {
						//读文件
						readFile(entry, function (userinfo) {
							if (userinfo.superUser == null || userinfo.superUser == '') {
								// window.plugins.jPushPlugin.deleteAlias({ 'sequence': userinfo.sequence }, function () {
								//     console.log('delete alias success');
								var passwordxx = Util.getItem('passwordxx');
								Util.clearLocalStorage();
								Util.setItem('passwordxx', passwordxx);
								window.location.href = 'login.html?type=loginout';
								// }, function () {
								//     console.log('delete alias failed');
								// });
							} else {
								Util.clearLocalStorage();
								window.location.href = 'login.html?type=loginout';
							}
						}, function () {
							alert('read fail');
						});
					}, function () {
						alert('check fail');
					});
				}
			}, {isShow: true, loadingMsg: '正在退出...'});
		});

	},
	getDetailsById: function (id, url, uuid, callback) {
		getDataByAjax({
			url: base + url,
			// url: 'http://192.168.81.32:8080/oa/' + url,
			data: {
				id: id,
				ticket: Util.getItem('ticket'),
				uuid: uuid,
				orgId: Util.getItem('orgid')
			}
		}, callback, {isShow: true});
	},
	showAlertMsg: function (msg, callback) {
		if (callback) {
			A.alert('提示', msg, callback);
		} else {
			A.alert('提示', msg);
		}

		return;
	},
	showConfirmMsg: function (msg, callback) {
		A.confirm('提示', msg,
			function () {
				if (callback) {
					callback();
				}
			},
			function () {
			});
	},
	deviceReady: function (callback) {//监听设备
		// location.reload();//重加载
			document.addEventListener('deviceready', callback, false);
	},
	doRetry: function () {
		console.log(navigator.connection.type != Connection.NONE);
		if (navigator.connection.type != Connection.NONE) {
			//重新连接网络后 强制刷新页面
			location.reload();
		}
	}
}


//封装ajax请求方法
/*
 configObj ajax请求需要配置的参数
 data  ajax请求需要传递的参数
 callback ajax请求成功后执行的回调函数
 */
function getDataByAjax(configObj, callback, loadingObj) {
	//判断是否有网络 没有网络则跳转到无网络页面
	if (networkInfo()) {
		return;
	}
	if (loadingObj && loadingObj.isShow && loadingObj.loadingMsg) {//显示自定义提示信息加载框
		// $('article.active').load('loading.html');
		A.showMask(loadingObj.loadingMsg, function () {
			//A.showToast('您已关闭请求');
		});
	} else if (loadingObj == undefined) {//显示默认提示信息加载框
		// $('article.active').load('loading.html');
		A.showMask(function () {
		});
	} else {
		// $('article.active').load('loading.html');
		//不显示加载框
	}


	//默认参数
	var options = {
		async: true,
		cache: false,
		type: "post",
		url: '',
		data: {},
		dataType: 'json',
	};

	//自定义参数后合并对象
	jQuery.extend(options, configObj);

	var returnVal = {};
	$.when(
		$.ajax(options)
	).then(function (data) {
		if (data == null) {
			console.log('data位null');
		}
		returnVal = data;
		if (callback) {
			callback(data);
			A.hideMask();
		}
	}, function (data) {
		returnVal = data;
		A.hideMask();
	});

	setTimeout(function () {
		A.hideMask();
		//A.showToast('请求未响应,请稍后再试');
	}, hideMaskTimer);//若是请求没有响应 则关闭加载框

	if (!options.async) {
		return returnVal;
	}

}

//封装ajax请求方法
/*`
 configObj ajax请求需要配置的参数
 data  ajax请求需要传递的参数
 callback ajax请求成功后执行的回调函数
 */
function loginByAjax(configObj, callback, loadingObj) {
	if (networkInfo(true)) {
		return;
	}
	if (loadingObj && loadingObj.isShow && loadingObj.loadingMsg) {//显示自定义提示信息加载框
		A.showMask(loadingObj.loadingMsg, function () {
			//A.showToast('您已关闭请求');
		});
	} else if (loadingObj == undefined) {//显示默认提示信息加载框
		A.showMask(function () {
		});
	} else {
		//不显示加载框
	}


	//默认参数
	var options = {
		async: true,
		cache: false,
		type: "post",
		url: '',
		data: {},
		dataType: 'json'
	};

	//自定义参数后合并对象
	jQuery.extend(options, configObj);

	var returnVal = {};
	$.when(
		$.ajax(options)
	).then(function (data) {
		returnVal = data;
		if (callback) {
			callback(data);
			A.hideMask();
		}
	}, function (data) {
		returnVal = data;
		A.hideMask();
	});

	setTimeout(function () {
		A.hideMask();
		A.showToast('请求未响应,请稍后再试');
	}, hideMaskTimer);//若是请求没有响应 则关闭加载框

	if (!options.async) {
		return returnVal;
	}

}

function networkInfo(isLogin) {
	var networkState = navigator.connection.type;
	/*var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.CELL] = 'Cell generic connection';
	states[Connection.NONE] = '当前没有联网，请先检查设置！';
	if (networkState == Connection.NONE) {
	}*/

	if (isLogin && networkState == Connection.NONE) {
		A.showToast('网络未连接，请检查网络设置');
		return true;
	}

	if (!isLogin && networkState == Connection.NONE) {
		$('article.active').removeClass('bgImg').addClass('bg-white').load('offlineTip.html');
		return true;
	}
}

//显示登录用户名
$('[name="userFullNameText"]').text(Util.getItem('userFullName'));

function getDateDiff(dateTimeStamp) {
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if (diffValue < 0) {
		//若日期不符则弹出窗口告之
		//alert("结束日期不能小于开始日期！");
	}
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;
	if (monthC >= 1) {
		result = "" + parseInt(monthC) + "个月前";
	}
	else if (weekC >= 1) {
		result = "" + parseInt(weekC) + "周前";
	}
	else if (dayC >= 1) {
		result = "" + parseInt(dayC) + "天前";
	}
	else if (hourC >= 1) {
		result = "" + parseInt(hourC) + "个小时前";
	}
	else if (minC >= 1) {
		result = "" + parseInt(minC) + "分钟前";
	} else
		result = "刚刚";
	return result;
}

function scrollToTop(selector, scrollObj) {
	var pullUpOffset;
	var pullUpEl = document.querySelector(selector + ' #agile-pullup');
	if (pullUpEl) {
		pullUpOffset = pullUpEl.offsetHeight;
	} else {
		pullUpOffset = 0;
	}
	scrollObj.scrollTo(0, parseInt(pullUpOffset) * (-1), 200);
}

function initRefresh(selector, pulldownFunc, pullupFunc) {
	var refresh;
	selector.on('refreshInit', function () {
		refresh = A.Refresh(this);
		refresh.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '加载中...'
			},
			pullUpOpts: {
				normalLabel: '上拉加载',
				releaseLabel: '释放加载',
				refreshLabel: '加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refresh.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				if (pulldownFunc) {
					pulldownFunc;
				}
				refresh.refresh();
			}, showloadingTimer);

		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				if (pullupFunc) {
					pullupFunc;
				}
				refresh.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});
	return refresh;
}

function refreshFunc(reallyFunc) {
	pageNum = 1;
	reallyFunc;
}

function loadmoreFunc(reallyFunc) {
	pageNum++;
	if (pageNum > totalPage) {
		refresh.setConfig({
			pullUpOpts: {
				normalLabel: '没有更多数据了~',
				releaseLabel: '没有更多数据了~',
				refreshLabel: '没有更多数据了~'
			}
		});
	} else {
		reallyFunc;
	}
}

//获得角度
function getAngle(angx, angy) {
	return Math.atan2(angy, angx) * 180 / Math.PI;
};

//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
function getDirection(startx, starty, endx, endy) {
	var angx = endx - startx;
	var angy = endy - starty;
	var result = 0;

	//如果滑动距离太短
	if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
		return result;
	}

	var angle = getAngle(angx, angy);
	if (angle >= -135 && angle <= -45) {
		result = 1;
	} else if (angle > 45 && angle < 135) {
		result = 2;
	} else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
		result = 3;
	} else if (angle >= -45 && angle <= 45) {
		result = 4;
	}

	return result;
}

function getCursorPosition(selector) {
	var el = selector.get(0);
	var pos = 0;
	if ('selectionStart' in el) {
		pos = el.selectionStart;
	} else if ('selection' in document) {
		el.focus();
		var Sel = document.selection.createRange();
		var SelLength = document.selection.createRange().text.length;
		Sel.moveStart('character', -el.value.length);
		pos = Sel.text.length - SelLength;
	}
	return pos;
}

//检查本地是否存在文件
function checkFileExited(path, successCallBack, errorCallBack) {
	console.log('enter check');
	window.resolveLocalFileSystemURL(path, successCallBack, errorCallBack);
}

//读取文件内容
function readFile(fileEntry, successCallBack, errorCallBack) {
	var userinfo = {};
	fileEntry.file(function (file) {
		var reader = new FileReader();
		reader.onloadend = function () {
			console.log('读取文件成功：' + reader.result);
			//显示文件
			console.log(fileEntry.fullPath);
			userinfo = JSON.parse(this.result);
			successCallBack(userinfo);
		}
		reader.readAsText(file);
	}, function (err) {
		console.log('读取文件失败');
		console.info('读取文件失败');
		errorCallBack;
	});
}

//创建local.txt文件
function createLocalFile(fileName, user, platform) {
	if (platform.toLowerCase() == 'android') {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 5 * 1024 * 1024, function (fs) {
			fs.root.getDirectory('Android', {create: false}, function (androidEntry) {
				androidEntry.getDirectory('data', {create: false}, function (dirEntry) {
					dirEntry.getDirectory('com.zz.oa', {create: false}, function (dirEntry) {
						dirEntry.getDirectory('files', {create: false, exclusive: false}, function (subDirEntry) {
							subDirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntity) {
								console.info(fileEntity);
								console.log('文件地址：' + fileEntity.toURL()); //file:///data/data/io.cordova.myapp84ea27/files/files/test1.txt
								writeFile(fileEntity, user);
							}, function () {
								console.log('createfile_error');
							});
						}, console.log('files_error'));
					}, console.log('com.zz.oa_error'));
				}, console.log('data_error'));
			}, function () {
				console.log('Android_error')
			});
		});
	} else {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 5 * 1024 * 1024, function (fs) {
			fs.root.getFile(fileName, {create: true, exclusive: false}, function (fileEntity) {
				console.info(fileEntity);
				console.log('文件地址：' + fileEntity.toURL()); //file:///data/data/io.cordova.myapp84ea27/files/files/test1.txt
				writeFile(fileEntity, user);
			}, function () {
				console.log('createfile_error')
			});
		}, function () {
			console.log('Android_error')
		});
	}
}

//将内容数据写入到文件中
function writeFile(fileEntry, dataObj) {
	//创建一个写入对象
	fileEntry.createWriter(function (fileWriter) {
		//文件写入成功
		fileWriter.onwriteend = function () {
			console.log("Successful file read...");
		};

		fileWriter.onwrite = function () {
			console.log("Successful file write...");
		};

		//文件写入失败
		fileWriter.onerror = function (e) {
			console.log("Failed file read: " + e.toString());
		};
		//写入文件
		fileWriter.write(dataObj);
	});
}

//移除文件
function removeLocalFile(path) {
	window.resolveLocalFileSystemURL(path, function (fileEntry) {
		fileEntry.remove(function () {
			console.log('delete success');
		}, function (err) {
			console.error(err);
		}, function () {
			console.log('file not exist');
		});
	})
}

/**
 * [isMobile 判断平台]
 * @param test: 0:iPhone    1:Android
 */
function ismobile(test) {
	var u = navigator.userAgent, app = navigator.appVersion;
	if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
		if (window.location.href.indexOf("?mobile") < 0) {
			try {
				if (/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)) {
					return '0';
				} else {
					return '1';
				}
			} catch (e) {
			}
		}
	} else if (u.indexOf('iPad') > -1) {
		return '0';
	} else {
		return '1';
	}
};

//console
function showConsole(content) {
	// console.log(content);
}
//处理标签转义字符
function changeWord(word) {
	var suggest = word.replace(/</g, '&lt;');
	suggest = suggest.replace(/>/g, '&gt;');
	return suggest;
}

function toPdfViewer(url) {
	window.AndroidNativePdfViewer.openPdfUrl(url, '文件预览', {
		headerColor: '#278EEE',
		swipeHorizontal: false,
		showShareButton: false
	}, function () {
		console.log('view pdf success');
	}, function () {
		console.log('view pdf error');
	})
}