var refresh1, refresh2, refresh3, refresh4, refresh5, refresh6, type = 'reportManage';
var scroll1, scroll2, scroll3, scroll4, scroll5, scroll6;
var pageNum = 1;
var totalPage;
// var listCountMark;
var fhtp = Util.queryString('fhtp');
var uuid;
var pullDown = true;
refreshInit();
Util.deviceReady(function () {
	initBackKeyDown();
	// uuid = device.imei;
	uuid = device.uuid;
	if (WORKRING_STATUS) {
		$('#workring_li').show();
	}
	showConsole(uuid);
	getNewCount();
	//默认进入页面初始化报告待办列表
	getListByType(type, refreshList, {isShow: false});
});
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
			getNewCount();
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

	A.Controller.page('#' + type);

});
$('#refresh_article').on('articleload', function () {
	showConsole('-----------------------1111');
	//轮播图滑动设置
	/*A.Slider('#slide', {
	 dots : 'right'
	 });*/
});

$('#reportManage').on('scrollInit', function () {
	scroll1 = A.Scroll('#reportManage')//已经初始化后不会重新初始化，但是可以得到滚动对象
	scroll1.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
});

$('#consultManage').on('scrollInit', function () {
	scroll2 = A.Scroll('#consultManage');
	scroll2.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
});

$('#dodoc').on('scrollInit', function () {
	scroll3 = A.Scroll('#dodoc');
	scroll3.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
});

$('#doreport').on('scrollInit', function () {
	scroll4 = A.Scroll('#doreport');
	scroll4.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
});
$('#receiptManagement').on('scrollInit', function () {
	scroll5 = A.Scroll('#receiptManagement');
	scroll5.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
	//默认进入页面初始化报告待办列表
	// getListByType(type, refreshList);
});
$('#docManage').on('scrollInit', function () {
	scroll6 = A.Scroll('#docManage')//已经初始化后不会重新初始化，但是可以得到滚动对象
	scroll6.on('scrollEnd', function () {
		if ($('#' + type + ' ul').find('.nodataHtml').length != 1 && $('#' + type + ' ul').find('.loadingdata').length != 1) {
			// if(listCountMark >= showCount){
			var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
			var distance = temp + 20;
			if (this.y < 0 && this.y < distance) {
				$('#agile-pullup').remove();
				$('#' + type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
				pageNum++;
				if (pageNum > totalPage) {
					$('#agile-pullup').text('没有更多了');
				} else {
					pullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
			// }
			// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
		}
	});
});
// function touchFunc(){
//     var startX = startY = endX = endY = 0;
//     var postion = 0;
//     $('#'+type).on('touchstart', function(){
//         var touch = event.targetTouches[0];
//         startX = touch.pageX;
//         startY = touch.pageY;
//         // $('#pullDownLable').remove();
//         // $('#'+refreshObj).append('<div id="pullDownLable" class="label">下拉刷新</div>');
//         // $(this).css('top', '-48px');
//     });
//     $('#'+type).on('touchmove', function(){
//         var touch = event.targetTouches[0];
//         endX = touch.pageX;
//         endY = touch.pageY;
//         var direction = getDirection(startX, startY, endX, endY);
//         postion = endY - startY;
//         if(direction == 2){
//             // if(postion >= 48){
//             //     $('#pullDownLable').empty().text('松开刷新');
//             // }else{
//             //     $('#pullDownLable').empty().text('下拉刷新');
//             // }
//             $(this).css('top', postion-30 + 'px');
//             radialObj.value(postion-30);
//         }else if(direction == 1){
//             // $(this).css('top', postion-30 + 'px');
//             $(this).css('top', '-30px');
//         }
//     });
//     $('#'+type).on('touchend', function(){
//         // var touch = event.targetTouches[0];
//         // startX = touch.pageX;
//         // startY = touch.pageY;
//         if(radialObj.value() == 48){
//             $(this).animate({'top':'0px'},500);
//             radialObj.value(24);
//             $('#'+refreshObj).addClass('icon-refresh');
//             // $('#pullDownLable').empty().text('加载中...');
//             setTimeout(function(){
//                 getListByType(type, refreshList, {isShow: false});
//             },3000);
//         }else{
//             // $('#pullDownLable').remove();
//             $(this).animate({'top':'-30px'},500);
//             radialObj.value(0);
//         }
//     });
// }


//初始化下拉组件
function refreshInit() {
	//当refresh初始化会进入此监听
	$('#reportManage').on('refreshInit', function () {
		refresh1 = A.Refresh(this);
		refresh1.setConfig({
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
		refresh1.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
				getListByType(type, refreshList, {isShow: false});
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
					refresh1.refresh();
				} else {
					getListByType(type, loadMoreData, {isShow: false});
				}
			}, showloadingTimer);
		});
	});
	$('#consultManage').on('refreshInit', function () {
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
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
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
	$('#dodoc').on('refreshInit', function () {
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
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
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
	$('#doreport').on('refreshInit', function () {
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
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
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
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				pullDown = false;
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
	refresh1 = A.Refresh('#reportManage');
	refresh2 = A.Refresh('#consultManage');
	refresh3 = A.Refresh('#dodoc');
	refresh4 = A.Refresh('#doreport');
	refresh5 = A.Refresh('#receiptManagement');
	refresh6 = A.Refresh('#docManage');
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
	refresh6.setConfig({
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
		// listCountMark = data.recordList.length;
		var htmlStr = "";
		for (var i = 0; i < data.recordList.length; i++) {
			var item = data.recordList[i];
			htmlStr += '<li><a class="justify-content" href="detail.html?id=' + item.recordid + '&filetypeid=' + item.fileTypeId + '&workitemid=' + item.workitemid + '&listType=' + type + '&fhtp=' + fhtp + '">'//'&attr1='+item.attr1+
				+ '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</span></p>'
				+ '<p class="list-font ml16">'
				+ '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
				+ item['wfleveName']
				+ '<small class="right font12">' + item['receiveTime'] + '</small>'
				+ '</span>'
				+ '</p>'
				+ ' </a>'
				+ '</li>';
			//<i class="list-icon icon-arrowright list-icon"></i>
		}
		// htmlStr += '<div id="agile-pullup" class="full-width text-center" style="height: 20px"><div class="agile-pullup-icon"></div><div class="agile-pullup-label">加载中...</div></div>';
		$('#sliderPage #' + type + ' ul').empty().append(htmlStr);
		refresh1 ? refresh1.refresh() : '';
		refresh2 ? refresh2.refresh() : '';
		refresh3 ? refresh3.refresh() : '';
		refresh4 ? refresh4.refresh() : '';
		refresh5 ? refresh5.refresh() : '';
		refresh6 ? refresh6.refresh() : '';
		scroll1.scrollTo(0, 0, 0, 0);
		scroll2.scrollTo(0, 0, 0, 0);
		scroll3.scrollTo(0, 0, 0, 0);
		scroll4.scrollTo(0, 0, 0, 0);
		scroll5.scrollTo(0, 0, 0, 0);
		scroll6.scrollTo(0, 0, 0, 0);
	} else if (data.recordList != null && data.recordList.length == 0) {
		// A.showToast('暂无数据~');
		$('#' + type + ' ul').load('nodata.html');
	}
	// else {
	//     A.showToast('暂无数据~');
	// }
}

//上拉加载更多数据
function loadMoreData(data) {
	Util.redirectLogin(data.result);
	if (data.result == undefined) {
		var htmlStr = "";
		$('#agile-pullup').remove();
		totalPage = data.totalPage;
		if (data.recordList != null && data.recordList.length > 0) {
			for (var i = 0; i < data.recordList.length; i++) {
				var item = data.recordList[i];
				htmlStr += '<li><a class="justify-content" href="detail.html?id=' + item.recordid + '&filetypeid=' + item.fileTypeId + '&workitemid=' + item.workitemid + '&listType=' + type + '&fhtp=' + fhtp + '">'
					+ '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</span></p>'
					+ '<p class="list-font ml16">'
					+ '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
					+ item['wfleveName']
					+ '<small class="right font12">' + item['receiveTime'] + '</small>'
					+ '</span>'
					+ '</p>'
					+ '</a>'
					+ '</li>';
			}
			// htmlStr += '<div id="agile-pullup" class="full-width text-center" style="height: 20px"><div class="agile-pullup-icon"></div><div class="agile-pullup-label">加载中...</div></div>';
			$('#sliderPage #' + type + ' ul').append(htmlStr);
			$('#agile-pullup').remove();
			refresh1 ? refresh1.refresh() : '';
			refresh2 ? refresh2.refresh() : '';
			refresh3 ? refresh3.refresh() : '';
			refresh4 ? refresh4.refresh() : '';
			refresh5 ? refresh5.refresh() : '';
			refresh6 ? refresh6.refresh() : '';
			scroll1.refresh();
			scroll2.refresh();
			scroll3.refresh();
			scroll4.refresh();
			scroll5.refresh();
			scroll6.refresh();
		}
	}
}


//列表请求
function getListByType(type, callback, loadingObj) {
	if (pullDown) {
		$('#' + type + ' ul').load('loading.html');
	}
	var searchText = $("#searchText").val();
	getDataByAjax({
		url: base + 'MobileFlow/dblist',
		// url:'http://192.168.81.17:8080/oa/MobileFlow/dblist',
		data: {
			pageNum: pageNum,
			showCount: showCount,
			title: searchText == '' ? '' : searchText,
			startTime: '',
			endTime: '',
			attr: 5,
			attr1: type,
			type: 1,
			ticket: Util.getItem('ticket'),
			sysid: Util.getItem('sysid'),
			orgid: Util.getItem('orgid'),
			uuid: Util.getItem('uuid')
		}
	}, callback, loadingObj);
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
		// Util.redirectLogin(data.result);
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

function initBackKeyDown() {
	showConsole("绑定返回上页事件:" + fhtp);
	document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
	document.removeEventListener("backbutton", exitApp, false); // 注销返回键
	document.removeEventListener("backbutton", back, false);//注销返回键
	document.addEventListener("backbutton", dback, false);//绑定返回上页事件
}

function dback() {
	if (fhtp == "1") {
		window.location.href = 'gongwenManage.html';
	} else {
		window.location.href = 'index.html?checkType=no';
	}
}