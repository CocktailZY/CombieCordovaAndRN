var refreshDetail1, refreshDetail2, refreshDetail3,
    uuid,
    detailId, type = Util.queryString('listType'),
    workitemid = Util.queryString('workitemid'),
    filetypeid = Util.queryString('filetypeid'),
    fhtp = Util.queryString('fhtp'),
    detailType = 'toDetail',
    scroll, scroll1,
    qid, formType = 'mcdb'
var temp = 'opiniona_form';

var _staticFlowObj = {};
var _saveFlowObj = {};
var _saveFlowDeptObj = {};
var _tree = {};
var _hjmcId;
var _isRemind = "0";
var _markPer;
var _lcType;

refreshDetailInit();

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

//获得选中元素
function getSelected() {
    // console.log("你所选择的树节点Id为：");
    // console.log(_tree.selectedNodes);

    var _chooseDeptObj = [];
    delete _saveFlowObj.node[0]["nodes"];
    //console.log(_saveFlowObj);
    for (var dept = 0; dept < _staticFlowObj.node[0].nodes.length; dept++) {
        var tempDept = _staticFlowObj.node[0].nodes[dept];
        var tempDept1 = {};
       var _choosePerObj = [];
        $.extend(true, tempDept1, tempDept);
        delete tempDept1["nodes"];
        for (var per = 0; per < tempDept.nodes.length; per++) {
            var tempPer = tempDept.nodes[per];
            for (var ids = 0; ids < _tree.selectedNodes.length; ids++) {
                var tempid = _tree.selectedNodes[ids];
                if (tempid.id == tempPer.id) {
                    _choosePerObj.push(tempPer);
                    //tempDept1["nodes"] = _choosePerObj;
                    // _chooseDeptObj.push()
                }
            }

        }
        if(_choosePerObj.length > 0){

            tempDept1["nodes"] = _choosePerObj;
            _chooseDeptObj.push(tempDept1);
        }
    }
    //console.log(_chooseDeptObj);
    _saveFlowObj.node[0]["nodes"] = _chooseDeptObj;
    //console.log('1111111111');
    //console.log(_choosePerObj);
    //console.log(_saveFlowObj);
    for (var i = 0; i < _tree.selectedNodes.length; i++) {
        var item = _tree.selectedNodes[i];
        $('#yxry').append("<span id='yxry_" + item.id + "' value='ryfw_" + item.id + "' class=\"mark-info mt8 mr8\">" + item.name + "</span>");
    }
    $('#yxry').show();
    A.Controller.section('#choose-section');
}

//获取详情
function initDetail(detailId, type, detailType) {

    showConsole('detail-init');
    showConsole(type);
    var url = "MobileFlow/consultView";
    if (type == 'provincialReceipt' || type == 'receiptManage') {
        formType = 'other';
        url = "MobileFlow/consultView";
    }
    switch (detailType) {
        case "toDetail":
            Util.getDetailsById(detailId, url, Util.getItem('uuid'), function (data) {
                Util.redirectLogin(data.result);
                Util.removeItem('historyUuid');
                Util.setItem('historyUuid', data.historyUuid);
                //办文办报类型 和报告请示详情显示的字段不一样
                $('.details form[data-id*="' + type + '"]').find('[name]').each(function (i, item) {
                    var name = $(item).attr('name');
                    // if(data[name] || data[name] == ''){
                    //
                    // }
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

                $('.details form[data-id*="' + type + '"]').show();
                $('.det').addClass('active');
                $('.sa').removeClass('active');
                $('.lc').removeClass('active');
            });
            getDataByAjax({
                url: base + 'MobileFlow/getFlowData',//获取提交按钮
                data: {
                    workitemid: workitemid,
                    ticket: Util.getItem('ticket'),
                    uuid: Util.getItem('uuid')
                }
            }, function (data) {
                if (formType == 'mcdb') {
                    temp = 'opiniona';
                }
                if (data.buttons.indexOf("60") >= 0) {
                    $('#' + temp).hide();
                    // $('#' + temp + '2').show();
                    $('#' + temp + '3').show();
                } else if (data.buttons.indexOf("23") >= 0) {
                    $('#' + temp).show();
                    // $('#' + temp + '2').hide();
                    $('#' + temp + '3').show();
                } else {
                    $('#' + temp).show();
                    // $('#' + temp + '2').hide();
                    $('#' + temp + '3').hide();
                }
            }, null);
            break;
        case "showAdvice":
            $('#showAdvice ul').empty();
            var tempData = {historyUuid: Util.getItem('historyUuid')};
            if(Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == ''){
                tempData.historyUuid = null;
            }
            var trueData = {
                filetypeid: filetypeid,
                pkValue: qid,
                ticket: Util.getItem('ticket'),
                uuid: uuid
            }
            var dataObj;
            if (tempData.historyUuid) {
                dataObj = $.extend(trueData, tempData);
            } else {
                dataObj = trueData;
            }
            getDataByAjax({
                url: base + 'MobileFlow/getformalidea',//获取意见
                // url: 'http://192.168.81.17:8080/oa/MobileFlow/getformalidea',
                data: dataObj
            }, function (data) {
                Util.redirectLogin(data.result);
                if (data.result == undefined) {
                    if (data == null || data.length == 0) {
                        // A.showToast("暂无数据！");
                        $('#' + detailType + ' ul').load('nodata.html');
                    }
                    if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '') {
                        var htmlStr = "";
                        var num = 0;
                        if (data == null || data.length == 0) {
                            // A.showToast("暂无数据！");
                            $('#' + detailType + ' ul').load('nodata.html');
                        }
                        for (x in data) {
                            if( data[x].ideaList.length > 0) {
                                for (y in data[x].ideaList) {
                                    num++;
                                    htmlStr += "<li class=\"tbmargin8\">"
                                        + "<div class=\"full-width\">"
                                        + "<p class=\"tbborderh sug-lpadding45 sug-p\">" + data[x].note + "</p>"
                                        + "<div class=\"sug-lrpaddging30 clearfix\">"
                                        + "<div class=\"float-left colorBlue text-center\">"
                                        + "<img src=\"images/head.png\" width=\"50\" height=\"50\" />"
                                        + "<div class=\"sug-top-div\">" + data[x].ideaList[y].username + "</div>"
                                        + "</div>"
                                        + "<div class=\"float-left width70 pl8\">"
                                        + "<div class=\"colorAaa tbpadding4 clearfix\">"
                                        + "<span class=\"float-left width35\">填写时间:</span>"
                                        + "<span class=\"span-right float-left width60\">" + data[x].ideaList[y].ideatime + "</span>"
                                        + "</div>"
                                        + "<div class=\"colorAaa  tbpadding4 clearfix\">"
                                        + "<div class=\"float-left width35\">部&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;门:</div>"
                                        + "<div class=\"float-left width60\">" + data[x].ideaList[y].deptname + "</div>"
                                        + "</div>"
                                        + "<div class=\"color555  tbpadding4 clearfix\">"
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
            if(Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == ''){
                tempData.historyUuid = null;
            }
            var trueData = {
                fileTypeId: filetypeid,
                recordId: detailId,
                ticket: Util.getItem('ticket'),
                uuid: uuid,
            }
            var dataObj;
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
                        if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '') {
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
                            if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '') {
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
                        }else{
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
                            if (Util.getItem('historyUuid') == 'null' || Util.getItem('historyUuid') == '') {
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
                        $('#liucheng ul').empty().append(htmlStr);
                        $('.det').removeClass('active');
                        $('.sa').removeClass('active');
                        $('.lc').addClass('active');
                    }
                }
                ,
                null
            );
            break;
        default:
            break;
    }
    scroll.refresh();
    scroll1.refresh();
}

$('#choose-article').on('articleload', function () {
    var f = new Form("#formlr");
});

//读取pdf
function readPdf(attachId, attachName) {
    if (isIamge(attachId, Util.getItem('ticket'), Util.getItem('uuid'))) {
        A.Controller.section('reader-section.html?attid=' + attachId);
    } else {
        toPdfViewer(base + "wordtopdf/streamwordtopdf?attid=" + attachId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid'));
    }
}

//返回列表页
function backToList() {
    showConsole("返回列表页：" + fhtp);
    window.location.href = 'express.html?type=' + type + '&fhtp=' + fhtp;
}

//返回详情页
function backToDetail() {
    A.Controller.section('#expressDetail-section');
}

$('#expressDetail-article').on('articleload', function () {
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
$('#expressDetail-section').on('sectionhide', function () {
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
    Util.deviceReady(function(){
        initBackKeyDown(2);
        var src = base + "/wordtopdf/image?attid=" + params.attid + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
        // JSOn.parse
        $("#container").css('display', 'block');
        $("#myPDF").css('display', 'none');
        $("#image").attr("src", src);
    });
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
$('#expressDetail-article').on('scrollInit', function () {
    scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
    scroll1 = A.Scroll('#toDetail');
});
$('#expressDetail-section').on('sectionshow', function () {
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
        showConsole('--------------------');
        showConsole(type);
        showConsole('--------------------');
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
            showConsole(data);
            Util.redirectLogin(data.result);
            if ((data.conAtt != null && data.conAtt.length > 0) || (data.att != null && data.att.length > 0)) {
                var attaches = ""
                for (var i = 0; i < data.conAtt.length; i++) {
                    if(i == 0){
                        attaches += '<div class="clearfix">' +
                            '<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.conAtt[i].attachId + '\')">' + data.conAtt[i].attachName + '</div>' +
                            '<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ data.conAtt[i].attachId +'\',\''+data.conAtt[i].attachName+'\');"></div>'+
                            '</div>';
                    }else{
                        attaches += '<div class="clearfix mt8">' +
                            '<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.conAtt[i].attachId + '\')">' + data.conAtt[i].attachName + '</div>' +
                            '<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ data.conAtt[i].attachId  +'\',\''+data.conAtt[i].attachName+'\');"></div>'+
                            '</div>';
                    }
                }
                //办文办报类型 和报告请示详情显示的字段不一样
                $('form[data-id*="' + type + '"] [name="attachment"]').html(attaches);

                //附件
                var attachments = "";
                for (var i = 0; i < data.att.length; i++) {
                    if(i == 0){
                        attachments += '<div class="clearfix">' +
                            '<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.att[i].attachId + '\')">' + data.att[i].attachName + '</div>' +
                            '<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ data.att[i].attachId +'\',\''+data.att[i].attachName+'\');"></div>'+
                            '</div>';
                    }else{
                        attachments += '<div class="clearfix mt8">' +
                            '<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + data.att[i].attachId + '\')">' + data.att[i].attachName + '</div>' +
                            '<div class="float-left" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ data.att[i].attachId  +'\',\''+data.att[i].attachName+'\');"></div>'+
                            '</div>';
                    }
                }
                $('form[data-id*="' + type + '"] [name="attachment-att"]').html(attachments);
            }else{
                $('#attachment').empty();
                $('#attachment-att').empty();
            }
        })

        initDetail(id, type, detailType);

    });
});
/* 新增 */
/* 正文附件下载方法 */
function downloadFile(attid,attachName){
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
            var source = base + 'download/attachment?attId='+attid+'&uuId='+Util.getItem('uuid')+'&ticket='+Util.getItem('ticket');
            var target = cordova.file.externalDataDirectory+attachName;//文件名
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
                    var num = Math.floor(e.loaded / e.total *100);
                    $('#progress_num').attr('style', 'width:' + num + '%');
                    $('#percent_num').text(num + '%');
                }
                if(num == 100){
                    $popup.close();
                }
            }
            fileTransfer.download(encodeURI(source), target, function (data) {
                setTimeout(function(){
                    A.confirm('提示', '文件已保存至：'+'<font style="word-wrap:break-word;word-break:break-all;">'+target.substring(target.indexOf('Android'),target.length)+'</font>',
                        function () {
                            $popup.close();
                        },
                        function () {
                            $popup.close();
                        });
                },0)
            }, function (error) {
                A.showToast('获取文件失败');
            });
        }else if(data.status == 0){
            //文件不存在
            A.alert('文件不存在!');
        }
        A.hideMask();
    });
}
$('#page_treeSelected').on('sectionshow', function () {
    var params = A.Component.params(this);
    if (_markPer) {
        if (_markPer != params.oid) {//如果和上次的树结构数据不一样
            updatary(params.oid,_lcType);//重新加载树
            _markPer = params.oid;
        }
    } else {//第一次加载树，给变量赋值
        updatary(params.oid,_lcType);
        _markPer = params.oid;
    }
});
$('#page_treeSelected_article').on('articleload', function () {
    //树结构
    _tree = new Tree("#tree", {
        "selectedContainer": "#selected-box",
        "onTap": function (s) {
            // console.log("您点击了：");
            // console.log(s.target);
            // console.log("当前节点的li为：");
            // console.log(s.elLI);
        },
        "onTapLastChild": function (s) {//没有子节点
            //noChildToast.show();
            if (s.elIcon) $(s.elIcon).remove();
        }
    }, false);
})

function choosePeopleBack() {
    $.extend(true, _saveFlowObj, _staticFlowObj);
    A.Controller.section('#choose-section');
}

$('#choose-section').on('sectionshow', function () {
    initBackKeyDown(2);
});

$('#to_choose_person').on(A.options.clickEvent, function () {
    _hjmcId = $('#hjmc').val();
    $('#yxry').empty().hide();
    A.Controller.section('page_treeSelected.html?oid=' + _hjmcId);
});

//待选人员数组
var opthtml = [];
var flag = "";
var sysid = "";
var title = "";
var idea = "";
var ooid = "";
//点击提交意见
$('#opiniona').on('click', tjyj);
$('#opiniona_form').on('click', tjyj);
//办结并提交
// $('#opiniona2').on('click', bjbtj);
// $('#opiniona_form2').on('click', bjbtj);
//办结
$('#opiniona3').on('click', bj);
$('#opiniona_form3').on('click', bj);

//提交意见function
function tjyj() {
    // $('#'+temp).attr('disabled','disabled');//禁用按钮
    opthtml = [];
    $('#yxry').empty();
    $('#dxry').empty();
    if (formType == 'mcdb') {
        idea = $('#description').val();
    } else {
        idea = $('#description_form').val();
    }
    sysid = Util.getItem('sysid');

    // if (formType == 'mcdb') {
    //     sysid = $('#sysid').text();
    // } else {
    //     sysid = $('#sysid_form').text();
    // }

    title = $('[name="title"]').text();
    //console.log('idea--------------------------');
    //console.log(idea);
    getDataByAjax({
        url: base + 'MobileFlow/toFlow',//获取路由
        data: {
            attr: '7',
            attr1: type,
            filetypeid: filetypeid,
            oper: 'EDIT',
            pkValue: qid,
            sysid: sysid,
            title: title,
            idea: idea,
            workflowid: filetypeid,
            workitemid: workitemid,
            ticket: Util.getItem('ticket'),
            uuid: uuid
        }
    }, function (data) {
        flag = data.flag;
        if (formType == 'mcdb') {
            $('#sysid').text(sysid);
        } else {
            $('#sysid_form').text(sysid);
        }
        $('[name="title"]').html(title);
        $('#ryfw').empty();
        $('#dxry').empty();
        $('#yxry').empty();
        if (data.flag == "selectdept") {//多个路由
            _lcType = 'complex';
            var zbdwhtml = "";//主办单位
            for (var i = 0; i < data.size; i++) {
                zbdwhtml += "<option value='" + data.node[i].id + "'>" + data.node[i].name + "</option>";
            }
            $('#hjmc').html(zbdwhtml);
            updatary(data.node[0].id,_lcType);
					A.Controller.section('choose-section.html');
        } else if (data.flag == "flowinstance") {//1个路由
            _lcType = 'single';
            if (data.node.length > 0) {
                $.extend(true, _saveFlowObj, data);
                $.extend(true, _staticFlowObj, data);
                $('#hjmc').html("<option value='" + data.node[0].id + "'>" + data.node[0].name + "</option>");
                /*处理办理类型*/
                var tempHtml = '';
                for (var z = 0; z < data.node[0].examinetag.length; z++) {
                    var tempItem = data.node[0].examinetag[z];
                    if (tempItem.selected == 'true') {
                        tempHtml += "<option value='" + tempItem.type + "' selected>" + tempItem.name + "</option>"
                    } else {
                        tempHtml += "<option value='" + tempItem.type + "'>" + tempItem.name + "</option>"
                    }
                }
                $('#bllx').empty().html(tempHtml);
                /*处理办理类型 end*/
                for (var j = 0; j < data.node[0].nodes.length; j++) {
                    var ryfwid = data.node[0].nodes[j].id.replace("dept_", "");
                    $('#ryfw').append("<option value='" + ryfwid + "'>" + data.node[0].nodes[j].name + "</option>");
                    for (var z = 0; z < data.node[0].nodes[j].nodes.length; z++) {
                        if (j == 0) {
                            // $('#dxry').append("<option value='"+data.node[0].nodes[j].nodes[z].id+"' class='opt opt_"+ryfwid+"'>"+data.node[0].nodes[j].nodes[z].name+"</option>");
                            $('#dxry').append("<p class='padding6 opt opt_" + ryfwid + "'><label><input type=\"checkbox\" value='" + data.node[0].nodes[j].nodes[z].id + "' class='choosery' ><span>" + data.node[0].nodes[j].nodes[z].name + "</span></label></p>");
                        } else {
                            $('#dxry').append("<p class='padding6 opt opt_" + ryfwid + "' style='display: none'><label><input type=\"checkbox\" value='" + data.node[0].nodes[j].nodes[z].id + "' class='choosery' ><span>" + data.node[0].nodes[j].nodes[z].name + "</span></label></p>");
                            // $('#dxry').append("<option value='"+data.node[0].nodes[j].nodes[z].id+"' class='opt opt_"+ryfwid+"' style='display: none'>"+data.node[0].nodes[j].nodes[z].name+"</option>");
                        }
                        opthtml.unshift("<p class='padding6 opt opt_" + ryfwid + "'><label><input type=\"checkbox\" value='" + data.node[0].nodes[j].nodes[z].id + "' class='choosery' ><span>" + data.node[0].nodes[j].nodes[z].name + "</span></label></p>");
                    }
                }
            }
					A.Controller.section('choose-section.html');
        } else if (data.flag == "1") {

					var opName = data.node[0].opName;
					var receiveName = data.node[0].receiveName;
					//window.location.href = 'alreadyDetail.html?id=' + data.recordid + '&filetypeid=' + data.filetypeid + '&workitemid=' + data.workitemid + '&listType=' + type + '&fhtp=' + fhtp;
					if (receiveName == "") {
						if(opName == "" ){
							A.showToast("发送成功");
							$("#sugBox").attr("style","display: none");
							$("#sugTextBox").attr("style","display:none");
							$("#btnsBox").attr("style","display:none");
						}else{
							A.showToast("结束本岗工作");
							$("#sugBox").attr("style","display: none");
							$("#sugTextBox").attr("style","display:none");
							$("#btnsBox").attr("style","display:none");
						}
					} else {
						if(receiveName != ""){
							$("#sendbody").text(opName);
							$("#nextbody").text(receiveName);
							A.alert(opName,receiveName,function(){
								$("#sugBox").attr("style","display: none");
								$("#sugTextBox").attr("style","display:none");
								$("#btnsBox").attr("style","display:none");
							});
						}
						else{
							A.showToast("发送成功");
							$("#sugBox").attr("style","display: none");
							$("#sugTextBox").attr("style","display:none");
							$("#btnsBox").attr("style","display:none");
						}
					}
				}else if(data){
					//flag = selectopreate ； flag = 1
					A.showToast("发送失败！");
				}
        // $(this).attr('disable',false);//启用按钮
    }, null);
}

//办结并提交function
// function bjbtj() {
//     if (formType == 'mcdb') {
//         idea = $('#description').val();
//     } else {
//         idea = $('#description_form').val();
//     }
//     getDataByAjax({
//         url: base + 'MobileFlow/endflow',
//         data: {
//             recordid: detailId,
//             type: type,
//             idea: idea,
//             workitemid: workitemid,
//             ticket: Util.getItem('ticket'),
//             uuid: uuid
//         }
//     }, function (data) {
//         if (data.res == "ok") {
//             A.showToast("办结并提交成功！");
//             // A.Controller.section('#slider_section');
//             window.location.href = 'expressList.html?type=' + type;
//         } else {
//             A.showToast("操作失败！");
//         }
//     }, null);
// }

//办结funciton
function bj() {
    if (formType == 'mcdb') {
        idea = $('#description').val();
    } else {
        idea = $('#description_form').val();
    }
    getDataByAjax({
        url: base + 'MobileFlow/endflow',
        data: {
            recordid: detailId,
            type: type,
            idea: idea,
            workitemid: workitemid,
            ticket: Util.getItem('ticket'),
            uuid: uuid
        }
    }, function (data) {
        if (data.res == "ok") {
            A.showToast("办结成功！");
            // A.Controller.section('#slider_section');
            window.location.href = 'express.html?type=' + type;
        } else {
            A.showToast("操作失败！");
        }
    }, null);
}


//选择路由
$(document).on('change', '#hjmc', function (e) {
    _hjmcId = $(this).val();
    $('#yxry').empty().html('<span>请选择人员!</span>');
    _tree.selectedNodes = [];
    $('#selected-box').empty();
});
$(document).on('change', '#bllx', function (e) {
    _saveFlowObj.node[0].examinetag = $(this).val();
});
//选择人员范围
$(document).on('change', '#ryfw', function (e) {
    $('#dxry').empty();
    var oid = $(this).val();
    for (var i = 0; i < opthtml.length; i++) {
        if (opthtml[i].indexOf("opt_" + oid) >= 0) {
            $('#dxry').append(opthtml[i]);
        }
    }
});

//选择路由，加载人员信息
function updatary(oid,luType) {
    // $('#dxry').empty();
    opthtml = [];
    if(luType != 'single'){
        ooid = oid;
        getDataByAjax({
            url: base + 'MobileFlow/toFlow',//获取路由
            data: {
                attr: '7',
                attr1: type,
                filetypeid: filetypeid,
                oper: 'EDIT',
                pkValue: qid,
                sysid: sysid,
                title: title,
                flag: flag,
                idea: idea,
                wfoperateid: oid,
                workflowid: filetypeid,
                workitemid: workitemid,
                ticket: Util.getItem('ticket'),
                uuid: uuid
            }
        }, function (data) {
            $('#ryfw').empty();
            $('#dxry').empty();
            $('#yxry').empty();
            $('#tree').empty();
            //拷贝toflow对象
            $.extend(true, _saveFlowObj, data);
            $.extend(true, _staticFlowObj, data);
            if ($('#bllx').find('option').length <= 1) {
                /*处理办理类型*/
                var tempHtml = '';
                for (var z = 0; z < data.node[0].examinetag.length; z++) {
                    var tempItem = data.node[0].examinetag[z];
                    if (tempItem.selected == 'true') {
                        tempHtml += "<option value='" + tempItem.type + "' selected>" + tempItem.name + "</option>"
                    } else {
                        tempHtml += "<option value='" + tempItem.type + "'>" + tempItem.name + "</option>"
                    }
                }
                $('#bllx').empty().html(tempHtml);
            }
            /*处理办理类型 end*/

            //部门
            if (data.node[0].nodes && data.node[0].nodes.length > 0) {
                var bmObj = data.node[0].nodes;
                var tempHtml = '';
                $.extend(true, _saveFlowDeptObj, bmObj[0]);
                for (var a = 0; a < bmObj.length; a++) {
                    var bmItem = bmObj[a];
                    //组装页面数据
                    tempHtml += '<li id="' + bmItem.id + '" data-name="' + bmItem.deptName + '">';
                    tempHtml += '<div class="treetitle">';
                    tempHtml += '<i class="treeicon icon-arrowright"></i>';
                    tempHtml += '<span class="icon icon-persons radiusround events-none"></span>';
                    tempHtml += '<a class="icontitle events-none">' + bmItem.deptName + '</a>';
                    tempHtml += '</div>';

                    if (bmItem.nodes && bmItem.nodes.length > 0) {
                        //说明该部门可以展开
                        //组装页面数据
                        tempHtml += '<ul>';
                        var ryObj = bmItem.nodes;
                        for (var b = 0; b < ryObj.length; b++) {
                            //只可能有人员的情况
                            var ryItem = ryObj[b];
                            tempHtml += '<li id="' + ryItem.id + '" data-name="' + ryItem.name + '">';
                            tempHtml += '<div class="treetitle">';
                            // tempHtml += '<i class="treeicon icon-arrowright"></i>';
                            tempHtml += '<span class="radiusround" style="background-color: ' + ryItem.name.toPinyin().substr(0, 1).toColor() + ';">' + ryItem.name.substr(0, 1) + '</span>';
                            tempHtml += '<a class="icontitle events-none">' + ryItem.name + '</a>';
                            tempHtml += '<a class="icon icon-rdoadd right middle"></a>';
                            tempHtml += '</div>';
                            tempHtml += '</li>';
                        }
                        tempHtml += '</ul>';
                    }
                }
                $('#tree').empty().append(tempHtml);
            }
            // opthtml = [];
            // for (var i = 0; i < data.node[0].nodes.length; i++) {
            //     var ryfwid = data.node[0].nodes[i].id.replace("dept_", "");
            //     $('#ryfw').append("<option value='" + ryfwid + "'>" + data.node[0].nodes[i].name + "</option>");
            //     for (var j = 0; j < data.node[0].nodes[i].nodes.length; j++) {
            //         opthtml.unshift("<p class='padding6 opt opt_" + ryfwid + "'><label><input type=\"checkbox\" value='" + data.node[0].nodes[i].nodes[j].id + "' class='choosery'><span>" + data.node[0].nodes[i].nodes[j].name + "</span></label></p>");
            //     }
            // }
            // for (var i = 0; i < opthtml.length; i++) {
            //     if (opthtml[i].indexOf("opt_" + ryfwid) >= 0) {
            //         $('#dxry').append(opthtml[i]);
            //     }
            // }

        }, null);
    }else{
        //部门
        if (_saveFlowObj.node[0].nodes && _saveFlowObj.node[0].nodes.length > 0) {
            var bmObj = _saveFlowObj.node[0].nodes;
            var tempHtml = '';
            $.extend(true, _saveFlowDeptObj, bmObj[0]);
            for (var a = 0; a < bmObj.length; a++) {
                var bmItem = bmObj[a];
                //组装页面数据
                tempHtml += '<li id="' + bmItem.id + '" data-name="' + bmItem.deptName + '">';
                tempHtml += '<div class="treetitle">';
                tempHtml += '<i class="treeicon icon-arrowright"></i>';
                tempHtml += '<span class="icon icon-persons radiusround events-none"></span>';
                tempHtml += '<a class="icontitle events-none">' + bmItem.deptName + '</a>';
                tempHtml += '</div>';

                if (bmItem.nodes && bmItem.nodes.length > 0) {
                    //说明该部门可以展开
                    //组装页面数据
                    tempHtml += '<ul>';
                    var ryObj = bmItem.nodes;
                    for (var b = 0; b < ryObj.length; b++) {
                        //只可能有人员的情况
                        var ryItem = ryObj[b];
                        tempHtml += '<li id="' + ryItem.id + '" data-name="' + ryItem.name + '">';
                        tempHtml += '<div class="treetitle">';
                        // tempHtml += '<i class="treeicon icon-arrowright"></i>';
                        tempHtml += '<span class="radiusround" style="background-color: ' + ryItem.name.toPinyin().substr(0, 1).toColor() + ';">' + ryItem.name.substr(0, 1) + '</span>';
                        tempHtml += '<a class="icontitle events-none">' + ryItem.name + '</a>';
                        tempHtml += '<a class="icon icon-rdoadd right middle"></a>';
                        tempHtml += '</div>';
                        tempHtml += '</li>';
                    }
                    tempHtml += '</ul>';
                }
            }
            $('#tree').empty().append(tempHtml);
        }
    }
}

$(document).on('tap', '.deptName', function () {
    $('.deptName').each(function (i, item) {
        $(item).find('i').removeAttr('class').attr('class', 'icon icon-rdo');
    });
    $(this).find('i').removeAttr('class').attr('class', 'icon icon-rdohook');
    $('#chooseDeptId').attr('attrId', $(this).attr('id'));
})

//提交流程
$(document).on('tap', '#subbtn', function (e) {
    var deptList = JSON.parse(Util.getItem('deptList'));
    if (deptList.length > 1) {
        var html = '<table align="center" class="noborder">';
        for (var i = 0; i < deptList.length; i++) {
            html += '<tr><td class="noborder" style="width: 30%;text-align: right;">';
            html += '<a class="deptName" id="' + deptList[i].deptid + '"><i class="icon icon-rdo"></i></a>';
            html += '</td>';
            html += '<td class="noborder">';
            html += deptList[i].name;
            html += '</td></tr>';
        }
        html += '</table>';
        A.confirm('请选择部门', html, function () {
            var choose_deptid = $('#chooseDeptId').attr('attrId');
            // submitExpress_lc(choose_deptid);
            newSubmit(_saveFlowObj, choose_deptid);
        });
    } else {
        // submitExpress_lc(Util.getItem('deptid'));
        newSubmit(_saveFlowObj, Util.getItem('deptid'));
    }
});

function submitExpress_lc(deptid) {
    var sn = "";
    if ($("[name='switch2']")) {
        sn = $("[name='switch2']").val();
    }
    $('#subbtn').attr('disabled', 'disabled');//禁用按钮
    var zbdwid = $('#hjmc').val().replace("op_", "");
    var ryfwid = $('#ryfw').val();
    var span = $('#yxry span');
    if (span.length == 0) {
        A.showToast("请选择人员！");
        $("#subbtn").removeAttr("disabled");
        return;
    }
    var id = "";
    var val = "";
    var str = "";
    var ids = "";
    $('#yxry span').each(function () {
        id = $(this).attr("id").replace("yxry_", "");
        val = $(this).attr("value").replace("ryfw_", "");
        str += val + "*" + id + "|$|";
        ids += id + ",";
    });
    // var str = zbdwid+"=|$|"+ryfwid+"*"+yxryid+"|$|#0#wd*undefined|d*undefined|h*undefined#6";
    var str = zbdwid + "=|$|" + str + "#0#wd*undefined|d*undefined|h*undefined#6";
    getDataByAjax({
        url: base + 'MobileFlow/toFlow',//获取路由
        data: {
            attr: '7',
            attr1: type,
            filetypeid: filetypeid,
            pkValue: qid,
            sysid: sysid,
            title: title,
            idea: idea,
            remindtype: sn,
            wfoperateid: ooid,
            flag: "flowinstance",
            selectuserlist: str,
            workflowid: filetypeid,
            workitemid: workitemid,
            ticket: Util.getItem('ticket'),
            uuid: uuid,
            deptid: deptid
        }
    }, function (data) {
        if (data.flag == "1") {
            A.showToast("发送成功！");
            // $('#doul li').removeClass("active");
            // $('[data-type="'+type+'"]').addClass("active");
            $('#' + type).addClass("active");
            // A.Controller.section('#slider_section');
            window.location.href = 'express.html?type=' + type + '&fhtp=' + fhtp;
            //testJPush(ids);
        } else {
            A.showToast("发送失败！");
        }
        $("#subbtn").removeAttr("disabled");//启用按钮
    }, null);
}

function newSubmit(data, deptid) {
    var sn = "";
    var tempRemind = [];
    if ($("input[name='switch2']").val()) {
        sn = $("input[name='switch2']").val();
        if(sn == "1"){
            tempRemind.push('2');
        }
    }
    _isRemind = sn;
    var tempObj = {
        ticket: Util.getItem('ticket'),
        uuid: uuid,
        deptid: deptid
    };
    data.node[0].limit = {};
    /*设置短信*/
    data.node[0].remind = {
        content: data.title,
        remindType: tempRemind,
        isRemind: _isRemind
    }

    data.node[0].examinetag = $('#bllx').val();

    var trueData = $.extend(data, tempObj);//合并对象
    //console.log(trueData);
    if ($('#yxry').find('span').length > 0) {
        getDataByAjax({
            url: base + 'MobileFlow/toFlow',//获取路由
            data: {
                jsonPar: JSON.stringify(trueData),
                ticket: Util.getItem('ticket'),
                uuid: Util.getItem('uuid'),
            }
        }, function (data) {
            Util.redirectLogin(data.result);
            if (data.flag == "1") {
                A.showToast("发送成功！");
                // $('#doul li').removeClass("active");
                // $('[data-type="'+type+'"]').addClass("active");
                $('#' + type).addClass("active");
                // A.Controller.section('#slider_section');
                window.location.href = 'express.html?type=' + type + '&fhtp=' + fhtp;
                //testJPush(ids);
            } else {
                A.showToast("发送失败！");
            }
            $("#subbtn").removeAttr("disabled");//启用按钮
        }, null);
    } else {
        A.showToast('请选择人员!');
    }
}

function testJPush(ids) {
    // getDataByAjax({
    //     // url:'http://192.168.81.36:8091/messagepush/JDpush/Android',
    //     url: pushPath,
    //     data: {
    //         title: Base64.encode(Base64.encode(pushTitle)),
    //         content: Base64.encode(Base64.encode(pushDbContent)),
    //         alias: ids,
    //         uuid: Util.getItem("uuid"),
    //         ticket: Util.getItem("ticket"),
    //         userid: Util.getItem("userid"),
    //         // key:'ZaA8haoVObu3seIEz7'
    //     }
    // }, function (data) {
    //     // Util.redirectLogin(data.result);
    //     if (data.status == '-1') {
    //         //没权限 key
    //         showConsole('参数错误');
    //     } else if (data.status == '0') {
    //         showConsole('推送失败');
    //     } else if (data.status == '1') {
    //         showConsole('推送成功');
    //     }
    // }, null)
}

//选择人员
$(document).on('click', '.choosery', function (e) {
    var id = $(this).val();
    var ryfwid = $('#ryfw').val();
    if ($(this).is(":checked")) {
        $(this).prop("checked", true);
        var str = $(this).parent().find("span").html();
        $('#yxry').append("<span id='yxry_" + id + "' value='ryfw_" + ryfwid + "' class=\"mark-info mt8 mr8\">" + str + "</span>");
    } else {
        $(this).prop("checked", false);
        $("#yxry").find("[id='yxry_" + id + "']").remove();
    }
});

function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", backToDetail, false); // 注销返回键
        document.addEventListener("backbutton", backToList, false);//绑定首页
    } else {
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", backToList, false); // 注销返回键
        document.addEventListener("backbutton", backToDetail, false);//绑定首页
    }

}