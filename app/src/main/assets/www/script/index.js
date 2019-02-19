var scroll, gongs = [];//gongs：需要展示的公告数组
var i = 0;
var isUpdate;
var gwTotal = 0, kdTotal = 0, dyTotal = 0, meetTotal = 0;
var uuid;

//计算首页图片比例
var width = $(window).width();
var height = width * ((416 / 720).toFixed(2));
$('#sySlider').css('height', height);

function checkMail() {
	if (!Util.getItem('email')) {
		A.popup({
			html: $('#checkMailDialog').html(),
			css: {width: 'auto', height: '160px'},
			pos: 'center',
			isBlock: true
		});
	} else {
		window.location.href = 'publicMailbox.html';
	}
}

$('#sy-section').on('sectionshow', function () {
	Util.deviceReady(function () {
		if (FINGER_LOCK_STATUS) {
			$('#fingerLockLi').show();
		}
		if (MAIL_STATUS) {
			$('#mail_li').show();
		}
		if (WORKRING_STATUS) {
			$('#workring_li').show();
		}
		//test-----------------------
		// uuid = device.imei;
		uuid = device.uuid;

		var path;
		if (device.platform.toLowerCase() == 'ios') {
			path = cordova.file.documentsDirectory + localFileName;
		} else {
			path = cordova.file.externalDataDirectory + localFileName;
		}
		checkFileExited(path, function (entry) {
			showConsole('local has \'local.txt\'')
		}, function () {
			//设置推送别名
			var params = {'sequence': Util.getItem('sequence'), 'alias': Util.getItem('userid')};
			// window.plugins.jPushPlugin.setAlias(
			//     params,
			//     function () {
			//         showConsole('success');
			//     },
			//     function (data) {
			//         showConsole(data);
			//     }
			// );
			//写文件存用户名密码
			var tempUserinfo = {
				uname: Util.getItem('username'),
				pwd: Util.getItem('password'),
				sequence: Util.getItem('sequence'),
				superUser: Util.getItem('superUser')
			};
			createLocalFile(localFileName, JSON.stringify(tempUserinfo), device.platform);
		});

		// getDataByAjax({
		//     // url: 'http://192.168.81.36:8091/oa/mobileEquipment/alias',
		//     url: base + 'mobileEquipment/deleteAlias',
		//     data:{
		//         userid:Util.getItem('userid'),
		//         ticket:Util.getItem('ticket'),
		//         uuid:Util.getItem('uuid')
		//     }
		// },function(data){
		//     if(data && data.length > 0){
		//         for(var i = 0 ; i < data.length ; i++){
		//             window.plugins.jPushPlugin.deleteAlias({ 'sequence': data[i].alias }, function () {
		//                 showConsole('delete alias success');
		//             }, function () {
		//                 showConsole('delete alias failed');
		//             });
		//         }
		//     }
		// },{isShow:false})


		isUpdate = JSON.parse(Util.getItem('isUpdate'));

		var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
		//版本更新检测
		versionUpdate(isUpdate, ticket_uuid);

		//默认进入页面初始化公告列表
		getDataByAjax({
			url: base + 'MobileFlow/webContentList',
			data: {
				pageNum: 1,
				showCount: showCount,
				title: '',
				subflag: "1",
				modelId: "1",
				ticket: Util.getItem('ticket'),
				sysid: Util.getItem('sysid'),
				orgid: Util.getItem('orgid'),
				uuid: Util.getItem('uuid'),
				deptid: Util.getItem('deptid')
			}
		}, getGongGao, {isShow: false});
		//公告滚动效果
		setInterval(function () {
			if (i < gongs.length) {
				var thtml = '<a style=\"text-overflow: ellipsis;width: 100%;overflow: hidden;white-space: nowrap;color: #000000;\" href="noticeList.html?id=' + gongs[i].id + '">' + gongs[i].content + '</a>';
				$('#gonggao').empty().html(thtml);
				i++;
			} else {
				i = 0;
			}
		}, 3000);
		//获取公文待办条数
		getgwCount();
		//获取省府快递代办条数
		getkdCount();
		//获取会议通知未读条数
		getMeetCount();
	});
	A.Scroll('#outScroller').refresh();
	// diskCacheSize();
})
$('#sy-article').on('articleload', function () {
	A.Slider('#sySlider', {
		dots: 'center',
		auto: 3000,
		loop: true,
	});
})

//版本更新检测
function versionUpdate(isUpdate, ticket_uuid) {
	cordova.getAppVersion.getVersionNumber().then(function (version) {
		if (isUpdate) {
			getDataByAjax({
				// url:base +'MobileFlow/webContentList',
				url: chackUpdatePath + ticket_uuid,
				data: {}
			}, function (data) {
				if (data.status == '1') {
					if (parseFloat(data.promotion.version) > parseFloat(version)) {
						A.confirm('有更新版本 v' + parseFloat(data.promotion.version), '<font style="word-wrap:break-word;word-break:break-all;">' + data.promotion.description.replace(/\n/g, '<br>') + '</font>',
							function () {
								// A.showToast('你选择了“确定”');
								var source = downloadApkPath + parseFloat(data.promotion.version) + ticket_uuid;
								var target = cordova.file.externalDataDirectory + 'zzOaApp.apk';//zzOaApp.apk
								var fileTransfer = new FileTransfer();
								var $popup = A.popup({
									html: $('#progressDialog').html(),
									css: {width: 'auto'},
									pos: 'center',
									isBlock: true
								});
								fileTransfer.onprogress = function (e) {
									if (e.lengthComputable) {
										var temp_num = e.loaded / e.total;
										var num = Math.floor(e.loaded / e.total * 100);
										$('#progress_num').attr('style', 'width:' + num + '%');
										$('#percent_num').text(num + '%');
									}
								}
								fileTransfer.download(encodeURI(source), target, function (data) {
									$popup.close();
									A.showToast('下载完成');
									exitApp('update', target);
									setTimeout(function () {
										cordova.plugins.fileOpener2.open(
											target,
											'application/vnd.android.package-archive'
										);
									}, 1500);
								}, function (error) {
									A.showToast('获取文件失败');
								});
								$popup.close();
								A.clearToast();
							},
							function () {
								Util.setItem('isUpdate', false);
							}
						);
					}
				}

			}, {isShow: false});
		}

	});
}

//获取首页公告列表gongwenNum
function getGongGao(data) {
	Util.redirectLogin(data.result);
	var thtml = '';
	if (data.recordList.length > 0) {
		for (var i = 0; i < data.recordList.length; i++) {
			var item = data.recordList[i];
			var temp = {
				id: item.infoId,
				content: item.title
			}
			gongs.push(temp);//将公告数据存入数组用来做滚动展示
		}
		thtml = '<a style=\"text-overflow: ellipsis;width: 100%;overflow: hidden;white-space: nowrap;color: #000000;\" href="noticeList.html?id=' + gongs[0].id + '">' + gongs[0].content + '</a>';
	} else {
		thtml = '暂无公告';
	}
	$('#gonggao').html(thtml);
}

//获取公文各分类数据量
function getgwCount() {
	var dbNum = 0, dqNum = 0, dyNum = 0;
	getDataByAjax({
		url: base + 'MobileFlow/getDblist',
		// url:'http://192.168.81.17:8080/oa/MobileFlow/getDblist',
		data: {
			orgid: Util.getItem('orgid'),
			ticket: Util.getItem('ticket'),
			uuid: uuid
		}
	}, function (data) {
		if (data.reportManage > 0) {
			gwTotal += data.reportManage;
		}
		if (data.consultManage > 0) {
			gwTotal += data.consultManage;
		}
		if (data.dodoc > 0) {
			gwTotal += data.dodoc;
		}
		if (data.doreport > 0) {
			gwTotal += data.doreport;
		}
		if (data.docManage > 0) {
			gwTotal += data.docManage;
		}
		if (data.receiptManagement && data.receiptManagement > 0) {
			gwTotal += data.receiptManagement;
		}
		dbNum = data.reportManage + data.consultManage + data.dodoc + data.doreport + data.docManage;
		// if(dbNum > 0){
		//     $('#db_point').show();
		// }else{
		//     $('#db_point').hide();
		// }
		//请求待签数量
		getDataByAjax({
			url: base + 'MobileFlow/getWaitSignCount',
			// url: 'http://192.168.81.17:8080/oa/MobileFlow/getWaitSignCount',
			data: {
				orgid: Util.getItem('orgid'),
				ticket: Util.getItem('ticket'),
				uuid: uuid
			}
		}, function (data) {
			if (data.dodocCount > 0) {
				gwTotal += data.dodocCount;
			}
			if (data.doreportCount > 0) {
				gwTotal += data.doreportCount;
			}
			dqNum = data.dodocCount + data.doreportCount;

			//待阅未读条数
			getDataByAjax({
				url: base + 'MobileFlow/waitReadCount',
//             url:'http://192.168.81.17:8080/oa/MobileFlow/getWaitSignCount',
				data: {
					typeStr: 'offlinedoc',
					ticket: Util.getItem('ticket'),
					uuid: uuid
				}
			}, function (data) {
				showConsole(data);
				if (data.consultManage) {
					gwTotal += data.consultManage;
				}
				if (data.reportManage) {
					gwTotal += data.reportManage;
				}
				if (data.receiptManagement) {
					gwTotal += data.receiptManagement;
				}
				if(data.docManage){
					gwTotal += data.docManage;
				}
				dyNum = data.consultManage + data.reportManage + data.receiptManagement + data.docManage;
				if (gwTotal > 0) {
					if (gwTotal > 99) {
						$('#gongwenNum').text('99');
					} else {
						$('#gongwenNum').text(gwTotal);
					}
					$('#gongwenNum').show();
				} else {
					$('#gongwenNum').hide();
				}
			}, {isShow: false});

		}, {isShow: false});
	}, {isShow: false});
}

//获取省府快递各分类数据量
function getkdCount() {
	getDataByAjax({
		url: base + 'MobileFlow/getProDblist',
		// url:'http://192.168.81.15:8083/oa/MobileFlow/getProDblist',
		data: {
			orgid: Util.getItem('orgid'),
			ticket: Util.getItem('ticket'),
			uuid: uuid
		}
	}, function (data) {
		if (data.telegraph > 0) {
			kdTotal += data.telegraph;
		}
		if (data.provincialReceipt > 0) {
			kdTotal += data.provincialReceipt;
		}
		if (data.receiptManage > 0) {
			kdTotal += data.receiptManage;
		}

		//待阅条数
		getDataByAjax({
			url: base + 'MobileFlow/waitReadCount',
//             url:'http://192.168.81.17:8080/oa/MobileFlow/getWaitSignCount',
			data: {
				typeStr: 'proExpress',
				ticket: Util.getItem('ticket'),
				uuid: uuid
			}
		}, function (data) {
			showConsole(data);
			kdTotal += data.waitReadCount;
			if (kdTotal > 0) {
				if (kdTotal > 99) {
					$('#expressNum').text('99');
				} else {
					$('#expressNum').text(kdTotal);
				}
				$('#expressNum').show();
			} else {
				$('#expressNum').hide();
			}
		}, {isShow: false});

	}, {isShow: false});
}

function getMeetCount() {
//会议待阅条数
	getDataByAjax({
		url: base + 'MobileFlow/mobileGetNum',
//             url:'http://192.168.81.17:8080/oa/MobileFlow/getWaitSignCount',
		data: {
			ticket: Util.getItem('ticket'),
			uuid: Util.getItem('uuid')
		}
	}, function (data) {
		showConsole(data);
		meetTotal = data.count;
		if (meetTotal > 0) {
			if (meetTotal > 99) {
				$('#meetNum').text('99');
			} else {
				$('#meetNum').text(meetTotal);
			}
			$('#meetNum').show();
		} else {
			$('#meetNum').hide();
		}
	}, {isShow: false});
}

// function testJPush(){
//     getDataByAjax({
//         // url:'http://192.168.81.36:8091/oa/mobileEquipment/push',
//         url: pushPath,
//         data: {
//             title: base64.encode(pushTitle),
//             content: base64.encode(pushDbContent),
//             alias: '97333,11111',
//             uuid:Util.getItem("uuid"),
//             ticket:Util.getItem("ticket"),
//             userid:Util.getItem("userid"),
//         }
//     }, function (data) {
//         // Util.redirectLogin(data.result);
//         if(data.status == '-1'){
//             //没权限 key
//             showConsole('参数错误');
//         }else if(data.status == '0'){
//             showConsole('推送失败');
//         }else if(data.status == '1'){
//             showConsole('推送成功');
//         }
//     }, null)
// }

function testFingerLock() {
	FingerprintAuth.isAvailable(isAvailableSuccess, isAvailableError);
}

/**
 * @return {
 *      isAvailable:boolean,
 *      isHardwareDetected:boolean,
 *      hasEnrolledFingerprints:boolean
 *   }
 */
function isAvailableSuccess(result) {
	console.log("FingerprintAuth available: " + JSON.stringify(result));
	if (result.isAvailable) {
		var encryptConfig = {}; // See config object for required parameters
		FingerprintAuth.encrypt(encryptConfig, encryptSuccessCallback, encryptErrorCallback);
	}
}

function isAvailableError(message) {
	console.log("isAvailableError(): " + message);
}

function testToRN(){
	cordova.plugins.rnbridgeplugin.jumpToRnIndex(function(){console.log('success jump')},function(error){console.log(error)})
}

