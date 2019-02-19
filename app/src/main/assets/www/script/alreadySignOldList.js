var refresh3, refresh4, pageNum = 1, totalPage, type = 'dodoc';
var scroll3, scroll4;
var fhtp = Util.queryString('fhtp');
var isPullDown = true;
var uuid;
var isRefresh = true;
refreshInit();
// var listCountMark;
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
	// refreshInit();
	//轮播图滑动设置
	/*A.Slider('#slide', {
	 dots : 'right'
	 });*/
	//整个滑动页面轮播设置
	// A.Slider('#sliderPage', {
	//     dots : 'hide',
	//     change : function(index){
	//         pageNum = 1;
	//         type = $('#sliderPage [data-role="page"]').eq(index).attr('id');
	//         initRefreshConfig();
	//         getListByType(type,refreshList);
	//     }
	// });
});

$('#dodoc').on('scrollInit', function () {
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
					isPullDown = false;
					getListByType(type, loadMoreData, {isShow: false});
				}
			}
		}

		// }
		// scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
	});
});

$('#doreport').on('scrollInit', function () {
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
	$('#dodoc').on('refreshInit', function () {
		refresh3 = A.Refresh('#dodoc');
		refresh3.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '刷新中...'
			},
			pullUpOpts: {
				normalLabel: '上拉加载',
				releaseLabel: '释放加载',
				refreshLabel: '刷新中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refresh3.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				isPullDown = false;
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
		refresh4 = A.Refresh('#doreport');
		refresh4.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '加载中...'
			},
			pullUpOpts: {
				normalLabel: '上拉加载',
				releaseLabel: '释放加载',
				refreshLabel: '加载中加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refresh4.on('pulldown', function () {
			showConsole('pull-down');
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				pageNum = 1;
				isPullDown = false;
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
}

//设置下拉组件的默认值
function initRefreshConfig() {
	refresh3 = A.Refresh('#dodoc');
	refresh4 = A.Refresh('#doreport');
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
}


//刷新待签列表
$('#toSignList_section').on('sectionshow', function () {
	Util.setItem('pageType', type);
	Util.deviceReady(function () {
		initBackKeyDown();
		// uuid = device.imei;
		uuid = device.uuid;
		//初始化列表
		if (isRefresh) {
			pageNum = 1;
			getListByType(type, refreshList, {isShow: false});
		} else {
			isRefresh = true;
		}
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
			htmlStr += '<li>';
			htmlStr += '<a class="justify-content" onclick="showSignDialog(\'' + item.id + '\')" href="javascript:;">';
			htmlStr += '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black" style="width: 85%;">' + item.title + '</span></p>';
			htmlStr += '<p class="list-font ml16">';
			htmlStr += ' <span class="text-ellipsis-black colorAaa" style="width: 70%;">';
			htmlStr += Util.getItem('userFullName');
			htmlStr += '<small class="right font12">' + item.registDate + '</small>';
			htmlStr += '   </span>';
			htmlStr += '   </p>';
			htmlStr += '   </a>';
			htmlStr += '   </li>';

		}
		$('#sliderPage #' + type + ' ul').empty().append(htmlStr);
		refresh3 ? refresh3.refresh() : '';
		refresh4 ? refresh4.refresh() : '';
		A.Scroll('#dodoc').scrollTo(0, 0, 0, 0);
		A.Scroll('#doreport').scrollTo(0, 0, 0, 0);
	} else {
		//A.showToast('暂无数据~');
		$('#' + type + ' ul').load('nodata.html');
	}
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
				/* htmlStr += '<li><a class="justify-content" onclick="showSignDialog(\''+item.recordid+'\',\''+item.id+'\')"  href="javascript:;">'
					 +'<p>'+item['title']+'</p>'
					 +'<p class="list-font text-right">'+item['sendStartTime']+'</p>'
					 +' <i class="list-icon icon-arrowright list-icon"></i></a>'
					 +'</li>';*/
				htmlStr += '<li>';
				htmlStr += '<a class="justify-content" onclick="showSignDialog(\'' + item.recordid + '\',\'' + item.id + '\')" href="javascript:;">';
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
			$('#sliderPage #' + type + ' ul').append(htmlStr);
		}
		scroll3.refresh();
		scroll4.refresh();
	}
}

function showSignDialog(recordId, id) {
	fhtp = "2";
	A.Controller.section('toAlreadySignOldDetail-section.html?id=' + recordId);
	// getDataByAjax({
	//     url:base +'MobileFlow/getSignStatus',
	//     data : {
	//         id:id,
	//         ticket:Util.getItem('ticket'),
	//         uuid : uuid
	//     }
	// },function (data) {
	//     if(data.flag == '0') {
	//         //签收，不再显示签收意见的弹框
	//         var text = "已签收";
	//         A.confirm('提示','确定签收吗？', function(text){
	//             getDataByAjax({
	//                 url:base +'MobileFlow/updateIdea',
	//                 data : {
	//                     id:id,
	//                     idea:text,
	//                     ticket:Util.getItem('ticket'),
	//                     uuid : uuid
	//                 }
	//             },function (data) {
	//                 if(data.flag == '1'){
	//                     A.Controller.section('toSignDetail-section?id='+recordId);
	//                 }
	//             });
	//         });
	//         //显示待签窗口  填写完意见后跳转到详情
	//         // var $popup = A.popup({
	//         //   html: $('#signDialog').html(),
	//         //   css : {width:'auto'},
	//         //   pos : 'center'
	//         // });
	//         // $popup.popup.find('button').on(A.options.clickEvent, function(){
	//         //   var text = $popup.popup.find('textarea').val();
	//         //   if(!text){
	//         //     Util.showAlertMsg('签批意见不能为空！');
	//         //     return;
	//         //   }
	//         //   A.confirm('提示','确定提交吗？', function(text){
	//         //     $popup.close();
	//         //     getDataByAjax({
	//         //       url:base +'MobileFlow/updateIdea',
	//         //       data : {
	//         //         id:id,
	//         //         idea:text,
	//         //         ticket:Util.getItem('ticket'),
	//         //         uuid : uuid
	//         //       }
	//         //     },function (data) {
	//         //       if(data.flag == '1'){
	//         //         A.Controller.section('toSignDetail-section?id='+recordId);
	//         //       }
	//         //     });
	//         //   });
	//         // });
	//     }
	//     return false;
	// });
}

//列表请求
function getListByType(type, callback, loadingObj) {
	showConsole("***************发送ajax请求");

	if (isPullDown) {
		$('#' + type + ' ul').load('loading.html');
	}
	var searchText = $("#searchText").val();
	setTimeout(function () {
		getDataByAjax({
			url: base + 'MobileFlow/documentPageList',
			// url:'http://192.168.81.12:8080/oa/MobileFlow/documentPageList',
			data: {
				pageNum: pageNum,
				showCount: showCount,
				sendUserId: '',
				title: searchText == '' ? '' : searchText,
				sendDeptId: Util.getItem('deptid'),
				type: 1,
				sendType: type,
				ticket: Util.getItem('ticket'),
				sysId: Util.getItem('sysid'),
				orgId: Util.getItem('orgid'),
				uuid: Util.getItem('uuid'),
				oldFlag: 'old'
			}
		}, callback, loadingObj);
	}, 1000);
}

//搜索
function searchByGet() {
	getListByType(type, refreshList, {isShow: false});
}

//待签详情处理js
var scroll;
$('#toAlreadySignOldDetail-article').on('scrollInit', function () {
	scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
});
$('#toAlreadySignOldDetail-section').on('sectionshow', function () {
	var params = A.Component.params(this);
	var id = params.id;
	Util.getDetailsById(id, 'MobileFlow/archRepoView', Util.getItem('uuid'), function (data) {
		Util.redirectLogin(data.result);
		$('.details').find('[name]').each(function (i, item) {
			var name = $(item).attr('name');
			$(item).text(data[name]);
		})

		//类型为办文 则没有通知类型字段
		if (data.archiveReportType == 'dodoc') {
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
			$('#attachment-att').html(attachments);
		} else {
			$('#attachment').empty();
			$('#attachment-att').empty();
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

$('#toAlreadySignOldDetail-section').on('sectionhide', function () {
	$('#attachment').empty();
	$('.details').find('[name]').each(function (i, item) {
		$(item).empty();
	})
});

$('#reader-section').on('sectionshow', function () {
	var params = A.Component.params(this);
	innitpdf(params.attid, Util.getItem('ticket'), uuid);
	// var url =  base+"attcahment/readPdf?attid="+params.attid+'&ticket='+Util.getItem('ticket')+'&uuid='+uuid;
	// var src = base+'oa/html/pdf/test_stream.html?attid='+params.attid+'&ticket='+Util.getItem('ticket')+'&uuid='+uuid;
	// var html ='<iframe frameborder="0" src="'+src+'" style="width: 100%;height:100%"></iframe>';
	// $("#reader-section article").html(html);
});

//打开正文直接打开pdf
function innitpdf(attid, ticket, uuid) {
	$("#myPDF").css({width: $(window).width(), height: $(window).height()});
	if (isIamge(attid, ticket, uuid)) {
		var src = base + "/wordtopdf/image?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid;
		// JSON.parse
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
		source: base + "/wordtopdf/streamwordtopdf?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid,
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
			"ticket": ticket,
			"uuid": uuid

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
	fhtp = "3";
	if (isIamge(attachId, Util.getItem('ticket'), Util.getItem('uuid'))) {
		A.Controller.section('reader-section.html?attid=' + attachId);
	} else {
		toPdfViewer(base + "wordtopdf/streamwordtopdf?attid=" + attachId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid'));
	}
}

function backToSignList() {
	isRefresh = false;
	A.Controller.section('toSignList_section.html?fhtp=' + fhtp);
	// A.Controller.page('#'+type);
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
	} else if (fhtp == "2") {
		fhtp = "1";
		backToSignList();
	} else {
		fhtp = "2";
		back();
	}
}