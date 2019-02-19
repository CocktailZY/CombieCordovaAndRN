var refresh1, refresh2, refresh3, refresh4, pageNum = 1, totalPage, type = 'telegraph';
var scroll1, scroll2, scroll3;
var fhtp = Util.queryString('fhtp');
var uuid;
var isPullDown = false;
// var listCountMark;
refreshInit();
$('#slider_section').on('sectionshow', function () {
	Util.setItem('pageType', type);
	// A.Component.tab('#dodoc');
	//初始化控件 设置控件可滚动
	//A.Component.scroll('#tabbarOuter');
	//整个滑动页面轮播设置
	A.Slider('#sliderPage').destroy();
	A.Slider('#sliderPage', {
		dots: 'hide',
		change: function (index) {
			showConsole('最外层---');
			showConsole(index);
			pageNum = 1;
			type = $('#sliderPage [data-role="page"]').eq(index).attr('id');//取出标签的id属性
			Util.setItem('pageType', type);
			initRefreshConfig();
			// getNewCount();
			getListByType(type, refreshList, {isShow: false});
		}
	});
	// refreshInit();
	var tempType = Util.queryString('type');
	if (tempType && tempType != '') {
		type = tempType;
	}

	$('#doul li').removeClass("active");
	$('[data-type="' + type + '"]').addClass("active");
	Util.deviceReady(function () {
		initBackKeyDown();
		// uuid = device.imei;
		uuid = device.uuid;
		showConsole(uuid);

		var tempcss = $('.tab.active i').attr('class');
		var newcss = tempcss + '-fill';
		$('.tab.active i').removeClass().addClass(newcss);
		//计算new样式
		// getNewCount();
		//默认进入页面初始化报告待办列表
		getListByType(type, refreshList, {isShow: false});
	});
	A.Controller.page('#' + type);
});
$('#refresh_article').on('articleload', function () {
	showConsole('-----------------------1111');
	//轮播图滑动设置
	/*A.Slider('#slide', {
	 dots : 'right'
	 });*/
});

$('#telegraph').on('scrollInit', function () {
	scroll1 = A.Scroll(this)//已经初始化后不会重新初始化，但是可以得到滚动对象
	scroll1.on('scrollEnd', function () {
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

$('#provincialReceipt').on('scrollInit', function () {
	scroll2 = A.Scroll(this);
	scroll2.on('scrollEnd', function () {
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

$('#receiptManage').on('scrollInit', function () {
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

//初始化下拉组件
function refreshInit() {
	//当refresh初始化会进入此监听
	$('#telegraph').on('refreshInit', function () {
		refresh1 = A.Refresh(this);
		refresh1.setConfig({
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
		refresh1.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			isPullDown = true;
			setTimeout(function () {
				pageNum = 1;
				getListByType(type, refreshList, {isShow: false});
				refresh1.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);

		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh1.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh1.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
				refresh1.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});
	$('#provincialReceipt').on('refreshInit', function () {
		refresh2 = A.Refresh(this);
		refresh2.setConfig({
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
		refresh2.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			isPullDown = true;
			setTimeout(function () {
				pageNum = 1;
				getListByType(type, refreshList, {isShow: false});
				refresh2.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
		//监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
		refresh2.on('pullup', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum++;
				if (pageNum > totalPage) {
					refresh2.setConfig({
						pullUpOpts: {
							normalLabel: '没有更多数据了~',
							releaseLabel: '没有更多数据了~',
							refreshLabel: '没有更多数据了~'
						}
					});
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
				refresh2.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	});
	$('#receiptManage').on('refreshInit', function () {
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

}


//设置下拉组件的默认值
function initRefreshConfig() {
	refresh1 = A.Refresh('#telegraph');
	refresh2 = A.Refresh('#provincialReceipt');
	refresh3 = A.Refresh('#receiptManage');
	refresh1.setConfig({
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
	refresh2.setConfig({
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
}

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
			var tempTitle;
			if (item.title.indexOf('<') > -1) {
				tempTitle = item.title.substring(0, item.title.indexOf('<'));
			} else {
				tempTitle = item.title;
			}
			htmlStr += '<li><a class="justify-content" href="alreadyExpressDetail.html?id=' + item.recordid + '&filetypeid=' + item.fileTypeId + '&workitemid=' + item.workitemid + '&listType=' + type + '&fhtp=' + fhtp + '">'//'&attr1='+item.attr1+
				+ '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black" style="width: 85%;">' + tempTitle + '</span></p>'
				+ '<p class="list-font ml16">'
				+ '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
				+ '<small class="right font12">' + item['readTime'] + '</small>'
				+ '</span>'
				+ '</p>'
				+ ' </a>'
				+ '</li>';
			//<i class="list-icon icon-arrowright list-icon"></i>
		}
		$('#sliderPage #' + type + ' ul').empty().append(htmlStr);
		refresh1 ? refresh1.refresh() : '';
		refresh2 ? refresh2.refresh() : '';
		refresh3 ? refresh3.refresh() : '';
		scroll1.scrollTo(0, 0, 0, 0);
		scroll2.scrollTo(0, 0, 0, 0);
		scroll3.scrollTo(0, 0, 0, 0);
	} else {
		//A.showToast('暂无数据~');
		$('#' + type + ' ul').load('nodata.html');
	}
}

//上拉加载更多数据
function loadMoreData(data) {
	var htmlStr = "";
	$('#agile-pullup').remove();
	totalPage = data.totalPage;
	if (data.recordList != null && data.recordList.length > 0) {
		for (var i = 0; i < data.recordList.length; i++) {
			var item = data.recordList[i];
			var tempTitle;
			if (item.title.indexOf('<') > -1) {
				tempTitle = item.title.substring(0, item.title.indexOf('<'));
			} else {
				tempTitle = item.title;
			}
			htmlStr += '<li><a class="justify-content" href="alreadyExpressDetail.html?id=' + item.recordid + '&filetypeid=' + item.fileTypeId + '&workitemid=' + item.workitemid + '&listType=' + type + '&fhtp=' + fhtp + '">'
				+ '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black" style="width: 85%;">' + tempTitle + '</span></p>'
				+ '<p class="list-font ml16">'
				+ '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
				+ '<small class="right font12">' + item['readTime'] + '</small>'
				+ '</span>'
				+ '</p>'
				+ '</a>'
				+ '</li>';
		}
		$('#sliderPage #' + type + ' ul').append(htmlStr);
		scroll1.refresh();
		scroll2.refresh();
		scroll3.refresh();
	}
}


//列表请求
function getListByType(type, callback, loadingObj) {

	if (isPullDown === false) {
		$('#' + type + ' ul').load('loading.html');
	}
	var searchText = $("#searchText").val();
	getDataByAjax({
		url: base + 'MobileFlow/yblist',
		// url:'http://192.168.81.17:8080/oa/MobileFlow/yblist',
		data: {
			pageNum: pageNum,
			showCount: showCount,
			title: searchText == '' ? '' : searchText,
			startTime: '',
			endTime: '',
			attr: 7,
			attr1: type,
			type: 0,
			ticket: Util.getItem('ticket'),
			sysid: Util.getItem('sysid'),
			orgid: Util.getItem('orgid'),
			uuid: Util.getItem('uuid')
		}
	}, callback, loadingObj);
	isPullDown = false;
}

//搜索
function searchByGet() {
	getListByType(type, refreshList, {isShow: false});
}

//获取待办各分类数据量
function getNewCount() {
	showConsole("进入数量查询");
	getDataByAjax({
		url: base + 'MobileFlow/getDblist',
		// url:'http://192.168.81.17:8080/oa/MobileFlow/getDblist',
		data: {
			orgid: Util.getItem('orgid'),
			ticket: Util.getItem('ticket'),
			uuid: Util.getItem('uuid')
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
		if (data.dodoc > 0) {
			$('.dodocNew').show();
		} else {
			$('.dodocNew').hide();
		}
		if (data.doreport > 0) {
			$('.doreportNew').show();
		} else {
			$('.doreportNew').hide();
		}
	}, {isShow: false});
}

function initBackKeyDown() {
	showConsole("绑定返回上页事件:" + fhtp);
	document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
	document.removeEventListener("backbutton", exitApp, false); // 注销返回键
	document.removeEventListener("backbutton", back, false);//注销返回键
	document.addEventListener("backbutton", dback, false);//绑定返回上页事件
}

function dback() {
	window.location.href = 'expressManage.html';
}