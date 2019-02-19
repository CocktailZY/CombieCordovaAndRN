var refreshDetail1, refreshDetail2, refreshDetail3,
	uuid,
	detailId, type = Util.queryString('listType'),
	workitemid = Util.queryString('workitemid'),
	filetypeid = Util.queryString('filetypeid'),
	fhtp = Util.queryString('fhtp'),
	detailType = 'toDetail',
	scroll, scroll1,
	qid;

refreshDetailInit();

function backToList() {
	showConsole("返回列表页：" + fhtp);
	window.location.href = 'alreadyDoList.html?type=' + type + '&fhtp=' + fhtp;
}

function refreshDetailInit() {
	$('#toDetail').on('refreshInit', function () {
		refreshDetail1 = A.Refresh(this);
		refreshDetail1.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refreshDetail1.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				initDetail(detailId, type);
				refreshDetail1.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);

		});
	})
	$('#showAdvice').on('refreshInit', function () {
		refreshDetail2 = A.Refresh(this);
		refreshDetail2.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refreshDetail2.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				initDetail(detailId, type);
				refreshDetail2.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);

		});
	})
	$('#liucheng').on('refreshInit', function () {
		refreshDetail3 = A.Refresh(this);
		refreshDetail3.setConfig({
			pullDownOpts: {
				normalLabel: '下拉刷新',
				releaseLabel: '释放刷新',
				refreshLabel: '加载中...'
			}
		});
		//监听下拉刷新事件，可以做一些逻辑操作，当data-scroll="pullup"时无效
		refreshDetail3.on('pulldown', function () {
			//setTimeout是模拟异步效果，实际场景请勿使用
			setTimeout(function () {
				initDetail(detailId, type);
				refreshDetail3.refresh();//当scroll区域有dom结构变化需刷新
			}, showloadingTimer);
		});
	})
}

function initDetailRefreshConfig() {
	refreshDetail1.setConfig({
		pullDownOpts: {
			normalLabel: '下拉刷新',
			releaseLabel: '释放刷新',
			refreshLabel: '加载中...'
		}
	});
	refreshDetail2.setConfig({
		pullDownOpts: {
			normalLabel: '下拉刷新',
			releaseLabel: '释放刷新',
			refreshLabel: '加载中...'
		}
	});
	refreshDetail3.setConfig({
		pullDownOpts: {
			normalLabel: '下拉刷新',
			releaseLabel: '释放刷新',
			refreshLabel: '加载中...'
		}
	});
}

//获取详情
function initDetail(detailId, type, detailType) {

	var url = "MobileFlow/consultView";
	if (type == 'dodoc' || type == 'doreport') {
		url = "MobileFlow/archRepoView";
	}
	if (type == 'docManage') {
		url = "MobileFlow/docManageView";
	}
	switch (detailType) {
		case "toDetail":
			Util.getDetailsById(detailId, url, Util.getItem('uuid'), function (data) {
				Util.redirectLogin(data.result);
				Util.removeItem('historyUuid');
				if(data.historyUuid){
					Util.setItem('historyUuid', data.historyUuid);
				}
				//办文办报类型 和报告请示详情显示的字段不一样
				$('.details form[data-id*="' + type + '"]').find('[name]').each(function (i, item) {
					var name = $(item).attr('name');
					if (name == 'readingMark') {
						if (data[name] == '01') {
							$(item).text('办件');
						} else if (data[name] == '02') {
							$(item).text('阅件');
						}
						return true;
					}
					if (name == 'returnType') {
						if (data[name] == '01') {
							$(item).text('待清退');
						} else if (data[name] == '02') {
							$(item).text('不清退');
						}
						return true;
					}
					$(item).text(data[name]);

				})

				//类型为办文 则没有通知类型字段
				if (data.archiveReportType == 'dodoc') {
					$('#notificationType').remove();
				}

				$('.details form[data-id*="' + type + '"]').show();
				$('.det').addClass('active');
				$('.sa').removeClass('active');
				$('.lc').removeClass('active');
			});
			// getDataByAjax({
			//     url:base+'MobileFlow/getFlowData',//获取提交按钮
			//     data:{
			//         workitemid:workitemid,
			//         ticket:Util.getItem('ticket'),
			//         uuid: uuid
			//     }
			// },function(data){
			//     if(data.buttons.indexOf("23")>=0){
			//         $('#opiniona').hide();
			//         $('#opiniona2').show();
			//         $('#opiniona3').hide();
			//     }else if(data.buttons.indexOf("60")>=0){
			//         $('#opiniona').hide();
			//         $('#opiniona2').hide();
			//         $('#opiniona3').show();
			//     }else{
			//         $('#opiniona').show();
			//         $('#opiniona2').hide();
			//         $('#opiniona3').hide();
			//     }
			// },null);
			break;
		case "showAdvice":
			$('#showAdvice ul').empty();
			var tempData = {historyUuid: Util.getItem('historyUuid')};
			if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
				tempData.historyUuid = null;
			}
			var trueData = {
				filetypeid: filetypeid,
				pkValue: qid,
				ticket: Util.getItem('ticket'),
				uuid: Util.getItem('uuid')
			}
			var dataObj;
			if (tempData.historyUuid) {
				dataObj = $.extend(trueData, tempData);
			} else {
				dataObj = trueData;
			}
			getDataByAjax({
				url: base + 'MobileFlow/getformalidea',//获取意见
				// url:'http://192.168.81.17:8080/oa/MobileFlow/getformalidea',
				data: dataObj
			}, function (data) {
				Util.redirectLogin(data.result);
				if (data.result == undefined) {
					if (data == null || data.length == 0) {
						// A.showToast("暂无数据！");
						$('#' + detailType + ' ul').load('nodata.html');
					}
					if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
						var htmlStr = "";
						var num = 0;
						for (x in data) {
							if (data[x].ideaList.length > 0) {
								for (y in data[x].ideaList) {
									num++;
									htmlStr += "<li class=\"tbmargin8\">"
										+ "<div class=\"full-width\">"
										+ "<p class=\"tbborderh sug-lpadding45 sug-p\">" + data[x].note + "</p>"
										+ "<div class=\"sug-lrpaddging30 clearfix\">"
										+ "<div class=\"float-left width30 colorBlue text-center\">"
										+ "<img src=\"images/head.png\" width=\"50\" height=\"50\" />"
										+ "<div class=\"sug-top-div\">" + data[x].ideaList[y].username + "</div>"
										+ "</div>"
										+ "<div class=\"float-left width70 pl8\">"
										+ "<div class=\"colorAaa tbpadding4 clearfix\">"
										+ "<span class=\"float-left width35\">填写时间:</span>"
										+ "<span class=\"span-right float-left width60\" style=\"line-height: 25px;\">" + data[x].ideaList[y].ideatime + "</span>"
										+ "</div>"
										+ "<div class=\"colorAaa tbpadding4 clearfix\">"
										+ "<div class=\"float-left width35\">部&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;门:</div>"
										+ "<div class=\"float-left width60\">" + data[x].ideaList[y].deptname + "</div>"
										+ "</div>"
										+ "<div class=\"color555 tbpadding4 clearfix\">"
										+ "<div class=\"float-left width35\">意&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;见:</div>"
										+ "<div class=\"float-left width60 my-break-word\">" + changeWord(data[x].ideaList[y].idea) + "</div>"
										+ "</div>"
										+ "</div>"
										+ "</div>"
										+ "</div>"
										+ "</li>";
								}
							}
						}
						if (num == 0) {
							//A.showToast("暂无数据！");
							$('#' + detailType + ' ul').load('nodata.html');
						}
						$('#showAdvice ul').empty().append(htmlStr);
					} else {
						var htmlStr = "";
						var num = 0;
						for (x in data) {
							num++;
							htmlStr += "<li class=\"tbmargin8\">"
								+ "<div class=\"full-width\">"
								+ "<p class=\"tbborderh sug-lpadding45 sug-p\">" + data[x].note + "</p>"
								+ "<div class=\"sug-lrpaddging30 clearfix\">"
								+ "<div class=\"float-left width30 colorBlue text-center\">"
								+ "<img src=\"images/head.png\" width=\"50\" height=\"50\" />"
								+ "<div class=\"sug-top-div\">" + data[x].userName + "</div>"
								+ "</div>"
								+ "<div class=\"float-left width70 pl8\">"
								+ "<div class=\"colorAaa tbpadding4 clearfix\">"
								+ "<span class=\"float-left width35\">填写时间:</span>"
								+ "<span class=\"span-right float-left width60\" style=\"line-height: 25px;\">" + data[x].ideaTime + "</span>"
								+ "</div>"
								+ "<div class=\"colorAaa tbpadding4 clearfix\">"
								+ "<div class=\"float-left width35\">部&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;门:</div>"
								+ "<div class=\"float-left width60\">" + data[x].deptName + "</div>"
								+ "</div>"
								+ "<div class=\"color555 tbpadding4 clearfix\">"
								+ "<div class=\"float-left width35\">意&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;见:</div>"
								+ "<div class=\"float-left width60 my-break-word\">" + changeWord(data[x].idea) + "</div>"
								+ "</div>"
								+ "</div>"
								+ "</div>"
								+ "</div>"
								+ "</li>";
						}
						if (num == 0) {
							//A.showToast("暂无数据！");
							$('#' + detailType + ' ul').load('nodata.html');
						}
						$('#showAdvice ul').empty().append(htmlStr);
					}

					$('.det').removeClass('active');
					$('.sa').addClass('active');
					$('.lc').removeClass('active');
				}
			}, null);
			break;
		case "liucheng":
			$('#liucheng ul').empty();
			var tempData = {historyUuid: Util.getItem('historyUuid')};
			if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
				tempData.historyUuid = null;
			}
			var trueData = {
				fileTypeId: filetypeid,
				recordId: detailId,
				ticket: Util.getItem('ticket'),
				uuid: Util.getItem('uuid'),
			}
			var dataObj;
			console.log(tempData);
			if (tempData.historyUuid) {
				dataObj = $.extend(trueData, tempData);
			} else {
				dataObj = trueData;
			}
			getDataByAjax({
				url: base + '/MobileFlow/getflowcourse',//获取流程
				// url: 'http://192.168.81.17:8080/oa/MobileFlow/getflowcourse',
				data: dataObj
			}, function (data) {
				if (data == null || data.length == 0) {
					//A.showToast("暂无数据！");
					$('#' + detailType + ' ul').load('nodata.html');
				}
				var htmlStr = "";
				for (x in data) {
					if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
						var date = data[x].sendtime
						if (date && date != "") {
							date = new Date(Date.parse(date.replace(/-/g, "/")));
							date = getDateDiff(date.getTime());
						}

						htmlStr += "<li>"
							+ "<div class=\"box box-center bg-transparent\">"
							+ "<div class=\"radius20 bg-white margin4 lrpadding4 font12\" style=\"border:1px solid #d9d9d9;\">" + date + "</div>"
							+ "</div>"
							+ "<div class=\"lc-lrmargin16 bg-white\">"
							+ "<div class=\"margin8\" style=\"padding-left:8px;padding-top:8px;\">"
							+ "<p class=\"sug-p tpadding\" style=\"display: inherit;\">"
							+ "<span class=\"lc-display\">" + data[x].receivewfname + "</span>"
							+ "</p>"
							+ "</div>"
							+ "<div class=\"lrpadding8 font14\">"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">发送时间:</div>"
							+ "<div class=\"float-left width75\" style=\"color: #E74C3C\">" + data[x].sendtime + "</div>"
							+ "</div>"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">发&nbsp;&nbsp;送&nbsp;&nbsp;人:</div>"
							+ "<div class=\"float-left width75\">" + data[x].sendname + "</div>"
							+ "</div>"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">接&nbsp;&nbsp;收&nbsp;&nbsp;人:</div>"
							+ "<div class=\"float-left width75\">" + data[x].receivename + "</div>"
							+ "</div>";
						if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
							htmlStr += "<div class=\"padding8 clearfix\">" +
								"<div class=\"float-left width25\">停留时间:</div>" +
								"<div class=\"float-left width75\">" + data[x].staytime + "</div>" +
								"</div>"
						}
						if (data[x].receivewfname != "") {
							htmlStr += "<div class=\"padding8 clearfix\">"
								+ "<div class=\"float-left width25\">节点操作:</div>"
								+ "<div class=\"float-left width75 clearfix\">"
								+ "<div class=\"container\">"
								+ "<ul class=\"nav nav-pills nav-justified step step-square\" data-step=\"2\">" +
								"<li class=\"active\">" +
								"<a class=\"font12\">" + data[x].wflevename + "</a>" +
								"</li>"

							htmlStr += "<li class=\"active\">"
								+ "<a class=\"font12\">" + data[x].receivewfname + "</a>"
								+ "</li>"
								+ "</ul>" +
								"</div>" +
								"</div>";
						} else {
							htmlStr += "<div class=\"padding8 clearfix\">"
								+ "<div class=\"float-left width25\">节点操作:</div>"
								+ "<div class=\"float-left width30 clearfix\">"
								+ "<div class=\"container\">"
								+ "<ul class=\"nav nav-pills nav-justified step step-square\" data-step=\"1\">" +
								"<li class=\"active\">" +
								"<a class=\"font12\">" + data[x].wflevename + "</a>" +
								"</li>"

							htmlStr += "</ul>" +
								"</div>" +
								"</div>";
						}
						htmlStr += "</div>"
							+ "</div>"
							+ "</div>"
							+ "</li>";
					} else {
						var date = data[x].sendTime
						if (date && date != "") {
							date = new Date(Date.parse(date.replace(/-/g, "/")));
							date = getDateDiff(date.getTime());
						}

						htmlStr += "<li>"
							+ "<div class=\"box box-center bg-transparent\">"
							+ "<div class=\"radius20 bg-white margin4 lrpadding4 font12\" style=\"border:1px solid #d9d9d9;\">" + date + "</div>"
							+ "</div>"
							+ "<div class=\"lc-lrmargin16 bg-white\">"
							+ "<div class=\"margin8\" style=\"padding-left:8px;padding-top:8px;\">"
							+ "<p class=\"sug-p tpadding\" style=\"display: inherit;\">"
							+ "<span class=\"lc-display\">" + data[x].receivewfName + "</span>"
							+ "</p>"
							+ "</div>"
							+ "<div class=\"lrpadding8 font14\">"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">发送时间:</div>"
							+ "<div class=\"float-left width75\" style=\"color: #E74C3C\">" + data[x].sendTime + "</div>"
							+ "</div>"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">发&nbsp;&nbsp;送&nbsp;&nbsp;人:</div>"
							+ "<div class=\"float-left width75\">" + data[x].sendName + "</div>"
							+ "</div>"
							+ "<div class=\"padding8 clearfix\">"
							+ "<div class=\"float-left width25\">接&nbsp;&nbsp;收&nbsp;&nbsp;人:</div>"
							+ "<div class=\"float-left width75\">" + data[x].receiveName + "</div>"
							+ "</div>";
						if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '' || !Util.getItem('historyUuid')) {
							htmlStr += "<div class=\"padding8 clearfix\">" +
								"<div class=\"float-left width25\">停留时间:</div>" +
								"<div class=\"float-left width75\">" + data[x].stayTime + "</div>" +
								"</div>"
						}
						if (data[x].receivewfName != "") {
							htmlStr += "<div class=\"padding8 clearfix\">"
								+ "<div class=\"float-left width25\">节点操作:</div>"
								+ "<div class=\"float-left width75 clearfix\">"
								+ "<div class=\"container\">"
								+ "<ul class=\"nav nav-pills nav-justified step step-square\" data-step=\"2\">" +
								"<li class=\"active\">" +
								"<a class=\"font12\">" + data[x].wfleveName + "</a>" +
								"</li>"

							htmlStr += "<li class=\"active\">"
								+ "<a class=\"font12\">" + data[x].receivewfName + "</a>"
								+ "</li>"
								+ "</ul>" +
								"</div>" +
								"</div>";
						} else {
							htmlStr += "<div class=\"padding8 clearfix\">"
								+ "<div class=\"float-left width25\">节点操作:</div>"
								+ "<div class=\"float-left width30 clearfix\">"
								+ "<div class=\"container\">"
								+ "<ul class=\"nav nav-pills nav-justified step step-square\" data-step=\"1\">" +
								"<li class=\"active\">" +
								"<a class=\"font12\">" + data[x].wfleveName + "</a>" +
								"</li>"

							htmlStr += "</ul>" +
								"</div>" +
								"</div>";
						}
						htmlStr += "</div>"
							+ "</div>"
							+ "</div>"
							+ "</li>";
					}
				}
				$('#liucheng ul').empty().append(htmlStr);
				$('.det').removeClass('active');
				$('.sa').removeClass('active');
				$('.lc').addClass('active');

			}, null);
			break;
		default:
			break;
	}
	scroll.refresh();
	scroll1.refresh();
}

//读取pdf
function readPdf(attachId, attachName) {
	if (isIamge(attachId, Util.getItem('ticket'), Util.getItem('uuid'))) {
		A.Controller.section('reader-section.html?attid=' + attachId);
	} else {
		toPdfViewer(base + "wordtopdf/streamwordtopdf?attid=" + attachId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid'));
	}
}

$('#toDoDetail-article').on('articleload', function () {
	//轮播图滑动设置
	/*A.Slider('#slide', {
	 dots : 'right'
	 });*/
	//整个滑动页面轮播设置
	A.Slider('#sliderPageSec', {
		dots: 'hide',
		change: function (index) {
			detailType = $('#sliderPageSec [data-role="page"]').eq(index).attr('id');//取出标签的id属性
			initDetailRefreshConfig();
			initDetail(id, type, detailType);
		}
	});

});
$('#toDoDetail-section').on('sectionhide', function () {
	$('.details form').hide();
	$('.details').find('[name]').each(function (i, item) {
		$(item).empty();
	});
});

$('#reader-section').on('sectionshow', function () {
	var params = {
		id: Util.queryString('id'),
		attid: A.Component.params(this).attid,
	};
	Util.deviceReady(function () {
		initBackKeyDown(2);
		var src = base + "/wordtopdf/image?attid=" + params.attid + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
		// JSOn.parse
		$("#container").css('display', 'block');
		$("#myPDF").css('display', 'none');
		$("#image").attr("src", src);
	})
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
//待办详情页面处理js
$('#toDoDetail-article').on('scrollInit', function () {
	scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
	scroll1 = A.Scroll('#toDetail');
});
$('#toDoDetail-section').on('sectionshow', function () {
	Util.setItem('pageType', type);
	Util.deviceReady(function () {
		// uuid = device.imei;
		uuid = device.uuid;
		showConsole(uuid);
		//默认进入页面初始化报告待办列表
		// initDetail(id,type,detailType);

		// A.Controller.page('#'+detailType);
		initBackKeyDown(1);
		// var params = A.Component.params(this); //获取所有参数，此处为{'id':'1', 'title':'Agile框架实战'}
		var id = Util.queryString('id');
		detailId = id;

		A.Slider('#sliderPageSec').destroy();
		A.Slider('#sliderPageSec', {
			dots: 'hide',
			change: function (index) {
				detailType = $('#sliderPageSec [data-role="page"]').eq(index).attr('id');//取出标签的id属性
				Util.setItem('pageType', type);
				initDetailRefreshConfig();
				initDetail(id, type, detailType);
			}
		});


		qid = detailId;

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
				$('form[data-id*="' + type + '"] [name="attachment"]').html(attaches);

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
				$('form[data-id*="' + type + '"] [name="attachment-att"]').html(attachments);
			} else {
				$('form[data-id*="' + type + '"] [name="attachment"]').empty();
				$('form[data-id*="' + type + '"] [name="attachment-att"]').empty();
			}
		})

		initDetail(id, type, detailType);

	});

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

$('#choose-section').on('sectionshow', function () {
	initBackKeyDown(2);
});

function initBackKeyDown(type) {
	if (type == 1) {
		showConsole("绑定返回上页事件:" + type);
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.removeEventListener("backbutton", exitApp, false); // 注销返回键
		// document.removeEventListener("backbutton", backToDetail, false); // 注销返回键
		document.addEventListener("backbutton", backToList, false);//绑定首页
	} else {
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.removeEventListener("backbutton", exitApp, false); // 注销返回键
		document.removeEventListener("backbutton", backToList, false); // 注销返回键
		document.addEventListener("backbutton", backToDetail, false);//绑定首页
	}

}

function backToDetail() {
	A.Controller.section('#toDoDetail-section');
}