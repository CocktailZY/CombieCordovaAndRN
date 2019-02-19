var refresh3, refresh4, refresh5, refresh6, pageNum = 1, totalPage, type = "reportManage";
var scroll3, scroll4, scroll5, scroll6;
var fhtp = Util.queryString('fhtp');
var uuid;
var isPullDown = false;
// var listCountMark;
refreshInit();
// $('#toSignList_section').on('sectionshow', function(){
//     showConsole("进入到代签页面***************************数据加载");
//   Util.deviceReady(function () {
//     uuid = device.imei;
//       showConsole("设备ID："+uuid);
//     //默认进入页面初始化报告待办列表
//     getListByType(type,refreshList);
//   });
// });

$('#refresh_article').on('articleload', function () {
	//轮播图滑动设置
	/*A.Slider('#slide', {
	 dots : 'right'
	 });*/
	//整个滑动页面轮播设置
});

$('#reportManage').on('scrollInit', function () {
	scroll3 = A.Scroll(this);
	scroll3.on('scrollEnd', function () {
		// if(listCountMark >= showCount){
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					isPullDown = true;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
		}

		// }
		// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
	});
});

$('#consultManage').on('scrollInit', function () {
	scroll4 = A.Scroll(this);
	scroll4.on('scrollEnd', function () {
		// if(listCountMark >= showCount){
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					isPullDown = true;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
		}

		// }
		// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
	});
});
$('#receiptManagement').on('scrollInit', function () {
	scroll5 = A.Scroll(this);
	scroll5.on('scrollEnd', function () {
		// if(listCountMark >= showCount){
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					isPullDown = true;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
		}

		// }
		// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
	});
});

$('#docManage').on('scrollInit', function () {
	scroll6 = A.Scroll(this)//已经初始化后不会重新初始化，但是可以得到滚动对象
	scroll6.on('scrollEnd', function () {
		// if(listCountMark >= showCount){
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					isPullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
		}

		// }
		// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
	});
});


//初始化下拉组件
function refreshInit() {
	//当refresh初始化会进入此监听
	$('#reportManage').on('refreshInit', function () {
		refresh3 = A.Refresh(this);
		refresh3.setConfig({
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
		refresh3.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			isPullDown = true;
			setTimeout(function () {
				pageNum = 1;
				getListByType(type, refreshList, {isShow: false});
				refresh3.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh3.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh3.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
				refresh3.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});
	$('#consultManage').on('refreshInit', function () {
		refresh4 = A.Refresh(this);
		refresh4.setConfig({
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
		refresh4.on('pulldown', function () {
			showConsole('pull-down');
			//setTimeout是模拟异步效果，实际场景请勿使用
			isPullDown = true;
			setTimeout(function () {
				pageNum = 1;
				getListByType(type, refreshList, {isShow: false});
				refresh4.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh4.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用

			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh4.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
				refresh4.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});
	$('#receiptManagement').on('refreshInit', function () {
		refresh5 = A.Refresh(this);
		refresh5.setConfig({
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
		refresh5.on('pulldown', function () {
			showConsole('pull-down');
			//setTimeout是模拟异步效果，实际场景请勿使用
			isPullDown = true;
			setTimeout(function () {
				pageNum = 1;
				getListByType(type, refreshList, {isShow: false});
				refresh5.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh5.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用

			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh5.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
				refresh5.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});

	$('#docManage').on('refreshInit', function () {
		refresh6 = A.Refresh(this);
		refresh6.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '刷新中...'
			},
			pullUpOpts: {
				normalLabel: '上拉加载',
				releaseLabel: '释放加载',
				refreshLabel: '加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refresh6.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
				getListByType(type, refreshList, {isShow: false});
			}, showloadingTimer);

		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh6.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh6.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
					refresh6.refresh();
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
			}, showloadingTimer);
		});
	});
}

//设置下拉组件的默认值
function initRefreshConfig() {
	A.Refresh('#reportManage').setConfig({
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
	A.Refresh('#consultManage').setConfig({
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
	A.Refresh('#receiptManagement').setConfig({
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
}


//刷新待签列表
$('#toUnReadList_section').on('sectionshow', function () {
	if (WORKRING_STATUS) {
		$('#workring_li').show();
	}
	Util.setItem('pageType', type);
	Util.deviceReady(function () {
		initBackKeyDown();
		// uuid = device.imei;
		uuid = device.uuid;
		getNewCount();
		//初始化列表
		getListByType(type, refreshList, {isShow: false});
	});
	A.Slider('#sliderPage').destroy();
	A.Slider('#sliderPage', {
		dots: 'hide',
		change: function (index) {
			pageNum = 1;
			type = $('#sliderPage [data-role="page"]').eq(index).attr('id');
			Util.setItem('pageType', type);
			// initRefreshConfig();
			getListByType(type, refreshList, {isShow: false});
		}
	});
	var tempType = Util.queryString('type');
	if (tempType && tempType != '') {
		type = tempType;
	}

	$('#sliderTab li').removeClass("active");
	$('[data-type="' + type + '"]').addClass("active");

	A.Controller.page('#' + type);
});


//默认加载第一页和刷新方法
function refreshList(data) {
	A.clearToast();
	Util.redirectLogin(data.result);
	$('#content').empty();
	$('#agile-pullup').remove();
	totalPage = data.totalPage;
	if (data.recordList != null && data.recordList.length > 0) {
		var htmlStr = "";
		for (var i = 0; i < data.recordList.length; i++) {
			var item = data.recordList[i];
			/*htmlStr += '<li><a class="justify-content" onclick="showSignDialog(\''+item.recordid+'\',\''+item.id+'\')"  href="javascript:;">'
				+'<p>'+item['title']+'</p>'
				+'<p class="list-font text-right">'+item['sendStartTime']+'</p>'
				+' <i class="list-icon icon-arrowright list-icon"></i></a>'
				+'</li>';*/
			htmlStr += '<li class="signItem" id="' + item.sendId + '" attrRecordid="' + item.sendId + '" attrId="' + (type == 'docManage' ? item.recordid : item.id) + '" >';
			htmlStr += '<a class="justify-content ">';
			htmlStr += '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black" style="width: 85%;">' + item.title + '</span></p>';
			htmlStr += '<p class="list-font ml16">';
			htmlStr += ' <span class="text-ellipsis-black colorAaa" style="width: 70%;">';
			htmlStr += Util.getItem('userFullName');
			htmlStr += '<small class="right font12">' + (item.sendStartTime ? item.sendStartTime : item.registDate) + '</small>';
			htmlStr += '   </span>';
			htmlStr += '   </p>';
			htmlStr += '   </a>';
			htmlStr += '   </li>';

		}
		$('#sliderPage #' + type + ' ul').empty().append(htmlStr);
		refresh3 ? refresh3.refresh() : '';
		refresh4 ? refresh4.refresh() : '';
		refresh5 ? refresh5.refresh() : '';
		refresh6 ? refresh6.refresh() : '';
		scroll3.scrollTo(0, 0, 0, 0);
		scroll4.scrollTo(0, 0, 0, 0);
		scroll5.scrollTo(0, 0, 0, 0);
		scroll6.scrollTo(0, 0, 0, 0);
	} else if (data.recordList != null && data.recordList.length == 0) {
		//A.showToast('暂无数据~');
		$('#' + type + ' ul').load('nodata.html');
	}
}

//上拉加载更多数据
function loadMoreData(data) {
	Util.redirectLogin(data.result);
	var htmlStr = "";
	$('#agile-pullup').remove();
	totalPage = data.totalPage;
	if (data.recordList != null && data.recordList.length > 0) {

		for (var i = 0; i < data.recordList.length; i++) {
			var item = data.recordList[i];
			/* htmlStr += '<li><a class="justify-content" onclick="showSignDialog(\''+item.recordid+'\',\''+item.id+'\')"  href="javascript:;">'
				 +'<p>'+item['title']+'</p>'
				 +'<p class="list-font text-right">'+item['sendStartTime']+'</p>'
				 +' <i class="list-icon icon-arrowright list-icon"></i></a>'
				 +'</li>';*/
			htmlStr += '<li class="signItem" id="' + item.sendId + '" attrRecordid="' + item.sendId + '" attrId="' + (type == 'docManage' ? item.recordid : item.id) + '" >';
			htmlStr += '<a class="justify-content">';
			htmlStr += '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black" style="width: 85%;">' + item.title + '</span></p>';
			htmlStr += '<p class="list-font ml16">';
			htmlStr += ' <span class="text-ellipsis-black colorAaa" style="width: 70%;">';
			htmlStr += Util.getItem('userFullName');
			htmlStr += '<small class="right">' + (item.sendStartTime ? item.sendStartTime : item.registDate)
				+ '</small>';
			htmlStr += '   </span>';
			htmlStr += '   </p>';
			htmlStr += '   </a>';
			htmlStr += '   </li>';
		}
		$('#sliderPage #' + type + ' ul').append(htmlStr);
	}
	scroll3.refresh();
	scroll4.refresh();
	scroll5.refresh();
	scroll6.refresh();
}

//获取待办各分类数据量
function getNewCount() {
	showConsole("进入数量查询");
	getDataByAjax({
		url: base + 'MobileFlow/waitReadCount',
		// url:'http://192.168.81.15:8083/oa/MobileFlow/getProDblist',
		data: {
			typeStr: 'offlinedoc',
			ticket: Util.getItem('ticket'),
			uuid: uuid
		}
	}, function (data) {
		showConsole(data);
		if (data.reportManage > 0) {
			$('.reportManageNew').show();
		} else {
			$('.reportManageNew').hide();
		}
		if (data.consultManage > 0) {
			$('.consultManageNew').show();
		} else {
			$('.consultManageNew').hide();
		}
		if (data.receiptManagement > 0) {
			$('.receiptManagementNew').show();
		} else {
			$('.receiptManagementNew').hide();
		}
		if (data.docManage > 0) {
			$('.docManageNew').show();
		} else {
			$('.docManageNew').hide();
		}
	}, {isShow: false});
}

$(document).on(A.options.clickEvent, 'ul .signItem', function () {
	var recordId = $(this).attr('attrRecordid');
	var id = $(this).attr('attrId');
	//签收，不再显示签收意见的弹框
	A.confirm('提示', '确定签阅吗？', function (text) {
		getDataByAjax({
			url: base + 'MobileFlow/saveSendEnd',
			data: {
				sendId: recordId,
				notion: '已阅',
				ticket: Util.getItem('ticket'),
				uuid: Util.getItem('uuid')
			}
		}, function (data) {
			if (data.res == '1') {
				initBackKeyDown(1);
				A.Controller.section('toSignDetail-section.html?id=' + id);
			}
		});
	}, function () {
	});
});

//列表请求
function getListByType(type, callback, loadingObj) {
	showConsole("***************发送ajax请求");

	if (isPullDown === false) {
		$('#' + type + ' ul').load('loading.html');
	}
	var searchText = $("#searchText").val();
	getDataByAjax({
		url: base + 'MobileFlow/sendList',
		// url:'http://192.168.81.17:8080/oa/MobileFlow/documentPageList',
		data: {
			pageNum: pageNum,
			showCount: showCount,
			type: 0,
			title: searchText == '' ? '' : searchText,
			docType: type,
			ticket: Util.getItem('ticket'),
			uuid: Util.getItem('uuid'),
		}
	}, callback, loadingObj);
	isPullDown = false;
}

//搜索
function searchByGet() {
	getListByType(type, refreshList, {isShow: false});
}

//待签详情处理js
var scroll;
$('#toSignDetail-article').on('scrollInit', function () {
	scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
});
$('#toSignDetail-section').on('sectionshow', function () {
	var params = A.Component.params(this);
	var id = params.id;
	Util.getDetailsById(id, type == 'docManage' ? 'MobileFlow/docManageView' : 'MobileFlow/consultView', Util.getItem('uuid'), function (data) {
		Util.redirectLogin(data.result);
		if(type == 'docManage'){
			$('#formgroup_docManage').find('[name]').each(function (i, item) {
				var name = $(item).attr('name');
				$(item).text(data[name]);
			});
			$('#formgroup_docManage').show();
			$('#formgroup').hide();
		}else{
			$('#formgroup').find('[name]').each(function (i, item) {
				var name = $(item).attr('name');
				$(item).text(data[name]);
			});
			$('#formgroup_docManage').hide();
			$('#formgroup').show();
		}

		//类型为办文 则没有通知类型字段
		if (data.archiveReportType == 'reportManage') {
			$('#notificationType').remove();
		}
		scroll.scrollTo(0, 0, 0, 0);
	});
//获取正文
	getDataByAjax({
		url: base + 'MobileFlow/getByKeyValue',
		// url: 'http://192.168.81.32:8080/oa/MobileFlow/getByKeyValue',
		data: {
			id: id,
			ticket: Util.getItem('ticket'),
			uuid: Util.getItem('uuid')
		}
	}, function (data) {
		showConsole(data);
		Util.redirectLogin(data.result);
		if ((data.conAtt != null && data.conAtt.length > 0) || (data.att != null && data.att.length > 0)) {
			var attaches = ""
			for (var i = 0; i < data.conAtt.length; i++) {
				if (i == 0) {
					attaches += '<div class="clearfix">' +
						'<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.conAtt[i].attachId + '\')">' + data.conAtt[i].attachName + '</div>' +
						'<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\'' + data.conAtt[i].attachId + '\',\'' + data.conAtt[i].attachName + '\');"></div>' +
						'</div>';
				} else {
					attaches += '<div class="clearfix mt8">' +
						'<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.conAtt[i].attachId + '\')">' + data.conAtt[i].attachName + '</div>' +
						'<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\'' + data.conAtt[i].attachId + '\',\'' + data.conAtt[i].attachName + '\');"></div>' +
						'</div>';
				}
			}
			//办文办报类型 和报告请示详情显示的字段不一样
			$('#attachment').html(attaches);

			//附件
			var attachments = "";
			for (var i = 0; i < data.att.length; i++) {
				if (i == 0) {
					attachments += '<div class="clearfix">' +
						'<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.att[i].attachId + '\')">' + data.att[i].attachName + '</div>' +
						'<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\'' + data.att[i].attachId + '\',\'' + data.att[i].attachName + '\');"></div>' +
						'</div>';
				} else {
					attachments += '<div class="clearfix mt8">' +
						'<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.att[i].attachId + '\')">' + data.att[i].attachName + '</div>' +
						'<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\'' + data.att[i].attachId + '\',\'' + data.att[i].attachName + '\');"></div>' +
						'</div>';
				}
			}
			if(type == 'docManage'){
				$('#attachment-att1').html(attachments);
			}else{
				$('#attachment-att').html(attachments);
			}
		} else {
			$('#attachment').empty();
			$('#attachment-att').empty();
			$('#attachment-att1').empty();
		}
	})

});

/* 新增 */

/* 正文附件下载方法 */
function downloadFile(attid, attachName) {
	//console.log(attid+"--"+attachName);
	getDataByAjax({
		url: base + 'download/attachmentExist',
		data: {
			attId: attid,
			ticket: Util.getItem('ticket'),
			uuId: Util.getItem('uuid')
		}
	}, function (data) {
		//console.log(data);
		Util.redirectLogin(data.result);
		if (data.status == "1") {
			//下载
			var source = base + 'download/attachment?attId=' + attid + '&uuId=' + Util.getItem('uuid') + '&ticket=' + Util.getItem('ticket');
			var target = cordova.file.externalDataDirectory + attachName;//文件名
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
				if (num == 100) {
					$popup.close();
				}
			}
			fileTransfer.download(encodeURI(source), target, function (data) {
				setTimeout(function () {
					A.confirm('提示', '文件已保存至：' + '<font style="word-wrap:break-word;word-break:break-all;">' + target.substring(target.indexOf('Android'), target.length) + '</font>',
						function () {
							$popup.close();
						},
						function () {
							$popup.close();
						});
				}, 0)
			}, function (error) {
				A.showToast('获取文件失败');
			});
		} else if (data.status == 0) {
			//文件不存在
			A.alert('文件不存在!');
		}
		A.hideMask();
	});
}

$('#toSignDetail-section').on('sectionhide', function () {
	$('#attachment').empty();
	$('.details').find('[name]').each(function (i, item) {
		$(item).empty();
	})
});

$('#reader-section').on('sectionshow', function () {
	var params = A.Component.params(this);
	var src = base + "/wordtopdf/image?attid=" + params.attid + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
	// JSOn.parse
	$("#container").css('display', 'block');
	$("#myPDF").css('display', 'none');
	$("#image").attr("src", src);
});

//打开正文直接打开pdf
function innitpdf(attid, ticket, uuid) {
	$("#myPDF").css({width: $(window).width(), height: $(window).height()});
	if (isIamge(attid, ticket, uuid)) {
		var src = base + "/wordtopdf/image?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid;
		//JSOn.parse
		$("#container").css('display', 'block');
		$("#myPDF").css('display', 'none');
		$("#image").attr("src", src);
	} else {
		$("#container").css('display', 'none');
		$("#myPDF").css('display', 'block');
		showPdf(attid, ticket, uuid);
	}
}

//打开pdf
function showPdf(attid, ticket, uuid) {
	$("#myPDF").pdf({
		source: base + "wordtopdf/streamwordtopdf?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid,
		// source: "http://192.168.81.36:8091/oa/wordtopdf/streamwordtopdf?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid,

		// Title of the PDF to be displayed in the toolbar
		title: "",

		// Array of tabs to display on the side.
		tabs: [],

		// Default background color for all tabs.
		// Available colors are "green", "yellow", "orange", "brown",
		// "blue", "white", "black" and you can define your own colors with CSS.
		tabsColor: "beige",

		// Disable zooming of PDF document.
		//disable<a href="http://www.jqueryscript.net/zoom/">Zoom</a>: false,

		// Disable swipe to next/prev page of PDF document.
		disableSwipe: false,

		// Disable all internal and external links on PDF document
		disableLinks: false,

		// Disable the arrow keys for next/previous page and +/- for zooming
		disableKeys: false,

		// Force resize of PDF viewer on window resize
		redrawOnWindowResize: false,

		// Show a toolbar on top of the document with title,
		// page number and buttons for next/prev pages and zooming
		showToolbar: false,

		// A handler triggered when PDF document is loaded
		loaded: null,

		// A handler triggered each time a new page is displayed
		changed: null,

		// Text or HTML displayed on white page shown before document is loaded
		loadingHeight: $(window).height(),

		// Height in px of white page shown before document is loaded
		loadingWidth: $(window).width(),

		// Width in px of white page shown before document is loaded
		loadingHTML: "正在加载文件..."


	});

}

//判断文件是不是图片
function isIamge(attid, ticket, uuid) {
	var result;
	// $.ajax({
	//     type: "POST",
	//     url: base + "/wordtopdf/isImage",
	//     data:{
	//         "attid":attid,
	//         "ticket":ticket,
	//         "uuid":uuid
	//
	//     },
	//     async: true,
	//     error:function(e){
	//         showConsole("请求进入error,"+e);
	//         alert("网络异常");
	//     },
	//     success: function(data) {
	//         if(data.status=="0"){
	//             result=false;
	//         }else{
	//             result=true;
	//         }
	//
	//
	//     }
	// });
	// return result;

	getDataByAjax({
		url: base + "/wordtopdf/isImage",
		data: {
			"attid": attid,
			"ticket": Util.getItem('ticket'),
			"uuid": Util.getItem('uuid')

		},
		async: true
	}, function (data) {
		if (data.status == "0") {
			result = false;
		} else {
			result = true;
		}
	}, {isShow: false})
	return result;
}

$('#reader-section').on('sectionhide', function () {
	$("#reader-section article #myPDF").empty();
});

function readPdf(attachId, attachName) {
	if (isIamge(attachId, Util.getItem('ticket'), Util.getItem('uuid'))) {
		A.Controller.section('reader-section.html?attid=' + attachId);
	} else {
		toPdfViewer(base + "wordtopdf/streamwordtopdf?attid=" + attachId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid'));
	}
}

function backToSignList() {
	A.Controller.section('toUnReadList_section.html?fhtp=' + fhtp);
	A.Controller.page('#' + type);
}

function initBackKeyDown(mark) {
	showConsole("绑定返回上页事件:" + fhtp);
	if (mark == 1) {
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.removeEventListener("backbutton", exitApp, false); // 注销返回键
		document.removeEventListener("backbutton", back, false);//注销返回键
		document.removeEventListener("backbutton", dback, false);//注销返回键
		document.addEventListener("backbutton", backToSignList, false);//绑定返回上页事件
	} else {
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.removeEventListener("backbutton", exitApp, false); // 注销返回键
		document.removeEventListener("backbutton", back, false);//注销返回键
		document.addEventListener("backbutton", dback, false);//绑定返回上页事件
	}

}

function dback() {
	if (fhtp == "1") {
		window.location.href = 'gongwenManage.html';
	} else {
		window.location.href = 'index.html?checkType=no';
	}
}