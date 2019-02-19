var refresh, pageNum = 1, totalPage, type = '';
var scroll1;
var uuid;
var isPullDown = false;
var detail_id;
// var listCountMark;
$(function () {
    if (Util.queryString('id')) {
        $('#head_back').attr('href', 'index.html?checkType=no')
        A.Controller.section('noticeDetail-section.html?id=' + Util.queryString('id'));
    }
    document.addEventListener('deviceready', function () {
        var tempcss = $('.tab.active i').attr('class');
        var newcss = tempcss + '-fill';
        $('.tab.active i').removeClass().addClass(newcss);
        // uuid = device.imei;
        uuid = device.uuid;

        // if(Util.queryString('id')){
        //     $('#head_back').attr('href','index.html')
        //     A.Controller.section('noticeDetail-section.html?id='+Util.queryString('id'));
        // }else{
        //初始化报告待办列表
        getListByType(type, refreshList,{isShow: false});
        // }
        //initBackKeyDown(2);
    }, false);

    $('#userFullNameText').text(Util.getItem('userFullName'));
})

//默认加载第一页和刷新方法
function refreshList(data) {
    Util.redirectLogin(data.result);
    $('#content').empty();
    $('#agile-pullup').remove();
    totalPage = data.totalPage;
    if (data.recordList != null && data.recordList.length > 0) {
        var htmlStr = "";
        for (var i = 0; i < data.recordList.length; i++) {
            var item = data.recordList[i];
            htmlStr += '<li><a class="justify-content" href="noticeDetail-section.html?id=' + item.infoId + '" data-toggle="section">'
                + '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</p>'
                + '<p class="list-font ml16">'
                + '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
                + item['creUserName']
                + '<small class="right font12">' + item['promulgatorTime'] + '</small>'
                + '</span>'
                + '</p>'
                + '</a>'
                + '</li>';
        }
        $('#content').empty().append(htmlStr);
        scroll1.scrollTo(0, 0, 0, 0);
    } else if(data.recordList != null && data.recordList.length == 0){
        //A.showToast('暂无数据~');
        $('#refresh_article ul').load('nodata.html');
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
            htmlStr += '<li><a class="justify-content" href="noticeDetail-section.html?id=' + item.infoId + '" data-toggle="section">'
                + '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</p>'
                + '<p class="list-font ml16">'
                + '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
                + item['creUserName']
                + '<small class="right font12">' + item['promulgatorTime'] + '</small>'
                + '</span>'
                + '</p>'
                + '</a>'
                + '</li>';
        }
        $('#content').append(htmlStr);
        scroll1.refresh();
    }
}


//列表请求
function getListByType(type, callback, loadingObj) {
    if (isPullDown === false){
        $('#refresh_article ul').load('loading.html');
    }
    getDataByAjax({
        url: base + 'MobileFlow/webContentList',
        data: {
            pageNum: pageNum,
            showCount: showCount,
            title: '',
            subflag: "1",
            modelId: "1",
            ticket: Util.getItem('ticket'),
            sysid: Util.getItem('sysid'),
            orgid: Util.getItem('orgid'),
            uuid: uuid,
            deptid:Util.getItem('deptid')
        }
    }, callback, loadingObj);
    isPullDown = false;
}


$('#refresh_article').on('scrollInit', function () {
    scroll1 = A.Scroll(this);
    scroll1.on('scrollEnd', function () {
        // if(listCountMark >= showCount){
        if ($('#refresh_article ul').find('.nodataHtml').length != 1 && $('#refresh_article ul').find('.loadingdata').length != 1){
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if(this.y < 0 && this.y < distance ){
                $('#agile-pullup').remove();
                $('#refresh_article .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
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

//当refresh初始化会进入此监听
$('#refresh_article').on('refreshInit', function () {
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
        isPullDown = true;
        setTimeout(function () {
            pageNum = 1;
            getListByType(type, refreshList, {isShow: false});
            refresh.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer)
    });
    //监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
    refresh.on('pullup', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
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
                getListByType(type, loadMoreData, {isShow: false});
            }
            refresh.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer)
    });
});


//公告详情处理js
var scroll;
$('#noticeDetail-article').on('scrollInit', function () {
    scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
});
$('#noticeList_section').on('sectionshow', function () {
    initBackKeyDown(2);
});
$('#noticeDetail-section').on('sectionshow', function () {
    var params = A.Component.params(this); //获取所有参数，此处为{'id':'1', 'title':'Agile框架实战'}
    detail_id = params.id;
    Util.deviceReady(function(){
        Util.getDetailsById(detail_id, 'MobileFlow/webContentView', Util.getItem('uuid'), function (data) {
            showConsole(data);
            Util.redirectLogin(data.result);
            var contentModel = data.model;
            var files = data.att;
            $('#title').text(contentModel.title);//标题
            $('#fuTitle').html('<span>发布人:</span><span style="margin-left:8px;">' + contentModel.promulgatorName + '</span>'
                + '<span style="margin-left:15px;">发布时间:</span><span style="margin-left:8px;">' + contentModel.promulgatorTime + '</span>');
            $('#noticeContent').html(contentModel.content);
            var attaches = "",addClass = " ";
            for (var i = 0; i < files.length; i++) {
                if(i!=0){//不是第一个附件的话 附件label隐藏
                    addClass = "hidden";
                }
                attaches += ' <div class="row border-none">'
                    + '<i class="icon icon-attach-fill'+addClass+'" style="color: #000000;"></i>'
                    + '<label class="row-left'+addClass+'" style="color: #000000;">附件:</label>'
                    + '<div class="row-right clearfix"><div class="float-left" style="word-wrap: break-word;color: #4587f7;width: 80%;" onclick="readPdf(\''+files[i].attachId+'\')">'+files[i].attachName+'</div><div class="float-right"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ files[i].attachId  +'\',\''+files[i].attachName+'\');"></div></div>'
                    +'</div>';
            }
            $('[name="attachment"]').html(attaches);

            scroll.refresh();
        });
        if (!Util.queryString('id')) {
            initBackKeyDown(4);
        }
    })
});
/* 新增 */
/* 正文附件下载方法 */
function downloadFile(attid,attachName){
    showConsole('download:'+attid+"--"+attachName);
    getDataByAjax({
        url: base + 'download/attachmentExist',
        data: {
            attId: attid,
            ticket: Util.getItem('ticket'),
            uuId: Util.getItem('uuid')
        }
    }, function (data) {
        showConsole(data);
        Util.redirectLogin(data.result);
        if (data.status == 1) {
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
            }
            fileTransfer.download(encodeURI(source), target, function (data) {
                A.confirm('提示', '文件已保存至：'+'<font style="word-wrap:break-word;word-break:break-all;">'+target.substring(target.indexOf('Android'),target.length)+'</font>',
                    function () {
                        $popup.close();
                    },
                    function () {
                        $popup.close();
                    });
            }, function (error) {
                A.showToast('获取文件失败');
            });
            $popup.close();
            A.clearToast();
        }else if(data.status == 0){
            //文件不存在
            A.alert('文件不存在!');
        }
        $popup.close();
        A.clearToast();
    });
}

//读取pdf
function readPdf(attachId, attachName) {
    if (isIamge(attachId, Util.getItem('ticket'), Util.getItem('uuid'))) {
        A.Controller.section('notice-reader-section.html?attid=' + attachId);
    } else {
        toPdfViewer(base + "wordtopdf/streamwordtopdf?attid=" + attachId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid'),attachName);
    }
}
//打开pdf
function showPdf(attid, ticket, uuid) {
    _touchPDF = $("#myPDF").pdf({
        source: base + "/wordtopdf/streamwordtopdf?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid,
        // source: 'http://192.168.80.142:8089/mobile-oa/1.pdf',
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
        disableZoom: false,

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
        loaded: function(){
            //var $targetObj = $('canvas');
            //$('.pdf-canvas').css('position','absolute');
            //初始化设置
            //cat.touchjs.init($targetObj, function (left, top, scale, rotate) {
            // alert(2)
            //});
            //初始化拖动手势（不需要就注释掉）
            // cat.touchjs.drag($('.pdf-canvas'), function (left, top) {
            //     //alert(3)
            // });
            //初始化缩放手势（不需要就注释掉）
            //cat.touchjs.scale($targetObj, function (scale) {
            //alert(4)
            //});
            //初始化旋转手势（不需要就注释掉）
            //    cat.touchjs.rotate($targetObj, function (rotate) {
            //       // alert(5)
            //    });
        },

        // A handler triggered each time a new page is displayed
        changed: function(){
            // $('.pdf-canvas').css('position','inherit');
            // $('.pdf-canvas').css('left','0');
            // $('.pdf-canvas').css('top','0');
        },

        // Text or HTML displayed on white page shown before document is loaded
        loadingHeight: $(window).height(),

        // Height in px of white page shown before document is loaded
        loadingWidth: $(window).width(),

        // Width in px of white page shown before document is loaded
        loadingHTML: "正在加载文件..."


    });

    // console.info(_touchPDF);

}
function innitpdf(attid, ticket, uuid) {
    //console.log(attid);
    $("#myPDF").css({width: $(window).width(), height: $(window).height()});
    if (isIamge(attid, ticket, uuid)) {
        var src = base + "/wordtopdf/image?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid;
        // JSOn.parse
        $("#container").css('display', 'block');
        $("#myPDF").css('display', 'none');
        $("#image").attr("src", src);
    } else {
        $("#container").css('display', 'none');
        $("#myPDF").css('display', 'block');
        showPdf(attid, ticket, uuid);
    }
}
//判断文件是不是图片
function isIamge(attid, ticket, uuid) {
    var result;
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
// //附件转pdf
//   getDataByAjax({
//     url: base + 'MobileFlow/getByKeyValue',
//     data: {
//       id: id,
//       type : '1',
//       ticket: Util.getItem('ticket'),
//       uuid: uuid
//     }
//   }, function (data) {
//     if (data != null && data.length > 0) {
//       var attaches = "",addClass = " ";
//       for (var i = 0; i < data.length; i++) {
//         if(i!=0){//不是第一个附件的话 附件label隐藏
//           addClass = "hidden";
//         }
//         attaches += ' <div class="row border-none" onclick="readPdf(\'' + data[i].attachId + '\')">'
//           + '<i class="icon icon-attach-fill'+addClass+'"></i>'
//           + '<label class="row-left'+addClass+'">附件:</label>'
//           + '<div class="row-right">'+data[i].attachName+'</div>'
//           +'</div>';
//       }
//       $('[name="attachment"]').html(attaches);
//     }
//   })
$('#notice-reader-section').on('sectionshow', function () {
    var params = {
        id: Util.queryString('id'),
        attid: A.Component.params(this).attid,
    };
    Util.deviceReady(function(){
        initBackKeyDown(3);
        var src = base + "/wordtopdf/image?attid=" + params.attid + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
        // JSOn.parse
        $("#container").css('display', 'block');
        $("#myPDF").css('display', 'none');
        $("#image").attr("src", src);
    });
});
$('#notice-reader-section').on('sectionhide', function () {
    //$("#reader-section article #myPDF").pdf("destroy")
    $("#notice-reader-section article #myPDF").empty();
});
//打开正文直接打开pdf
function innitpdf(attid, ticket, uuid) {
    console.log(attid);
    $("#myPDF").css({width: $(window).width(), height: $(window).height()});
    if (isIamge(attid, ticket, uuid)) {
        var src = base + "/wordtopdf/image?attid=" + attid + "&ticket=" + ticket + "&uuid=" + uuid;
        // JSOn.parse
        $("#container").css('display', 'block');
        $("#myPDF").css('display', 'none');
        $("#image").attr("src", src);
    } else {
        $("#container").css('display', 'none');
        $("#myPDF").css('display', 'block');
        showPdf(attid, ticket, uuid);
    }
}
$('#noticeDetail-section').on('sectionhide', function () {
    $('#title').empty();//标题
    $('#fuTitle').empty();
    $('#noticeContent').empty();
    $('[name="attachment"]').empty();
});

function backToNoticeDetail(){
    showConsole('enter back()');
    showConsole(detail_id);
    A.Controller.section('noticeDetail-section.html?id=' + detail_id);
}

function backToNoticeList(){
    A.Controller.section('#noticeList_section');
}

function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", backToNoticeDetail, false);//绑定首页
        document.addEventListener("backbutton", back, false);//绑定返回上页事件
    } else if(type == 3){
        showConsole("绑定返回详情页键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", backToNoticeList, false);//绑定公告列表页
        document.addEventListener("backbutton", backToNoticeDetail, false);//pdf预览界面返回详情页
    }else if(type == 4) {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", backToNoticeDetail, false);//绑定返回详情页
        document.removeEventListener("backbutton", cback, false);//绑定返回详情页
        document.addEventListener("backbutton", backToNoticeList, false);//绑定公告列表页
    }else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", backToNoticeDetail, false);//绑定返回详情页
        document.removeEventListener("backbutton", backToNoticeList, false);//绑定公告列表页
        document.addEventListener("backbutton", cback, false);//绑定首页
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}