var refresh1, refresh2, refresh3, refresh4, pageNum = 1, totalPage, type = 'zcfg';
var scroll1, scroll2, scroll3, scroll4;
var scroll, scrollDetail, uuid, isRefresh = true,dqid,nowid;
var isPullDown = false;
var isLoading = true;
var detail_id;

// var listCountMark;
refreshInit();//初始化下拉组件
Util.deviceReady(function () {
    // uuid = device.imei;
    uuid = device.uuid;
    showConsole(uuid);
    // var tempRef = A.Refresh('#'+type);
    // tempRef.destroy();
    //默认进入页面初始化列表
    getListByType(2, refreshList,{isShow:false});

});

$('#zcfg').on('scrollInit', function(){
    scroll1 = A.Scroll(this)//已经初始化后不会重新初始化，但是可以得到滚动对象
    scroll1.on('scrollEnd',function(){
        // if(listCountMark >= showCount){
        if ($('#'+type+' ul').find('.nodataHtml').length != 1 && $('#'+type + ' ul').find('.loadingdata').length != 1){
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if(this.y < 0 && this.y < distance ){
                $('#agile-pullup').remove();
                $('#'+type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
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

$('#xwdt').on('scrollInit', function(){
    scroll2 = A.Scroll(this);
    scroll2.on('scrollEnd',function(){
        // if(listCountMark >= showCount){
        if ($('#'+type+' ul').find('.nodataHtml').length != 1 && $('#'+type + ' ul').find('.loadingdata').length != 1){
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if(this.y < 0 && this.y < distance ){
                $('#agile-pullup').remove();
                $('#'+type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
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

$('#xxjb').on('scrollInit', function(){
    scroll3 = A.Scroll(this);
    scroll3.on('scrollEnd',function(){
        // if(listCountMark >= showCount){
        if ($('#'+type+' ul').find('.nodataHtml').length != 1 && $('#'+type + ' ul').find('.loadingdata').length != 1){
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if(this.y < 0 && this.y < distance ){
                $('#agile-pullup').remove();
                $('#'+type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
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

$('#dsj').on('scrollInit', function(){
    scroll4 = A.Scroll(this);
    scroll4.on('scrollEnd',function(){
        // if(listCountMark >= showCount){
        if ($('#'+type+' ul').find('.nodataHtml').length != 1 && $('#'+type + ' ul').find('.loadingdata').length != 1){
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if(this.y < 0 && this.y < distance ){
                $('#agile-pullup').remove();
                $('#'+type + ' .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
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

//默认加载第一页和刷新方法
function refreshList(data) {
    Util.redirectLogin(data.result);//检查是否登录过期
    isLoading = true;
    totalPage = data.totalPage;
    showConsole("查询回来的数据数量" + data.recordList.length);
    if (data.recordList != null && data.recordList.length > 0) {
        var htmlStr = "";
        $('#agile-pullup').remove();
        showConsole("查询回来的数据数量" + data.recordList.length);
        for (var i = 0; i < data.recordList.length; i++) {
            var item = data.recordList[i];
            htmlStr += '<li><a class="justify-content" href="noticeDetail-section.html?id=' + item.infoId + '" data-toggle="section">'
                + '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</span></p>'
                + '<p class="list-font ml16">'
                + '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
                + item['creUserName']
                + '<small class="right font12">' + item['promulgatorTime'] + '</small>'
                + '</span>'
                + '</p>'
                + '</a>'
                + '</li>';
        }
        if (type == 'zcfg') {
            $('#content2').empty().append(htmlStr);
        }
        if (type == 'xwdt') {
            $('#content3').empty().append(htmlStr);
        }
        if (type == 'xxjb') {
            $('#content4').empty().append(htmlStr);
        }
        if (type == 'dsj') {
            $('#content5').empty().append(htmlStr);
        }
        // refreshInit();
        setTimeout(function () {
            refresh1 ? refresh1.refresh() : '';
            refresh2 ? refresh2.refresh() : '';
            refresh3 ? refresh3.refresh() : '';
            refresh4 ? refresh4.refresh() : '';
            scroll1.scrollTo(0,0,0,0);
            scroll2.scrollTo(0,0,0,0);
            scroll3.scrollTo(0,0,0,0);
            scroll4.scrollTo(0,0,0,0);
        }, 100);
    } else if(data.recordList != null && data.recordList.length == 0){
        //A.showToast('暂无数据~');
        $('#'+type+' ul').load('nodata.html');
    }
}

//上拉加载更多数据
function loadMoreData(data) {
    Util.redirectLogin(data.result);
    if(data.result == undefined){
        isLoading = true;
        var htmlStr = "";
        $('#agile-pullup').remove();
        totalPage = data.totalPage;
        if (data.recordList != null && data.recordList.length > 0) {
            for (var i = 0; i < data.recordList.length; i++) {
                var item = data.recordList[i];
                htmlStr += '<li><a class="justify-content" href="noticeDetail-section.html?id=' + item.infoId + '" data-toggle="section">'
                    + '<p><i class="bg-warn radiusround size8"></i><span class="lrmargin8 text-ellipsis-black full-width">' + item['title'] + '</span></p>'
                    + '<p class="list-font ml16">'
                    + '<span class="text-ellipsis-black" style="width: 70%;color: #aaaaaa;">'
                    // +item['wfleveName']
                    + '<small class="right font12">' + item['promulgatorTime'] + '</small>'
                    + '</span>'
                    + '</p>'
                    + '</a>'
                    + '</li>';
            }
            if (type == 'zcfg') {
                $('#content2').append(htmlStr);
            }
            if (type == 'xwdt') {
                $('#content3').append(htmlStr);
            }
            if (type == 'xxjb') {
                $('#content4').append(htmlStr);
            }
            if (type == 'dsj') {
                $('#content5').append(htmlStr);
            }
            // refreshInit();
            setTimeout(function () {
                scroll1.refresh();
                scroll2.refresh();
                scroll3.refresh();
                scroll4.refresh();
            }, 100);
        }
    }
}

//初始化下拉组件
function refreshInit() {
    //当refresh初始化会进入此监听
    $('#zcfg').on('refreshInit', function () {
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
            isPullDown = true;
            setTimeout(function () {
                pageNum = 1;
                getListByType(2, refreshList, {isShow: false});
                // refresh1.refresh();//当scroll区域有dom结构变化需刷新
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
                    getListByType(2, loadMoreData, {isShow: false});
                }
                refresh1.refresh();//当scroll区域有dom结构变化需刷新
            }, showloadingTimer)
        });
    });
    $('#xwdt').on('refreshInit', function () {
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
                getListByType(3, refreshList, {isShow: false});
                refresh2.refresh();//当scroll区域有dom结构变化需刷新
            }, showloadingTimer)
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
                    getListByType(3, loadMoreData, {isShow: false});
                }
                refresh2.refresh();//当scroll区域有dom结构变化需刷新
            }, showloadingTimer);
        });
    });
    $('#xxjb').on('refreshInit', function () {
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
                getListByType(4, refreshList, {isShow: false});
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
                    getListByType(4, loadMoreData, {isShow: false});
                }
                refresh3.refresh();//当scroll区域有dom结构变化需刷新
            }, showloadingTimer);
        });
    });
    $('#dsj').on('refreshInit', function () {
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
            isPullDown = true;
            setTimeout(function () {
                pageNum = 1;
                getListByType(5, refreshList, {isShow: false});
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
                    getListByType(5, loadMoreData, {isShow: false});
                }
                refresh4.refresh();//当scroll区域有dom结构变化需刷新
            }, showloadingTimer);
        });
    });

}

//设置下拉组件的默认值
function initRefreshConfig() {
    refresh1 = A.Refresh('#zcfg');
    refresh2 = A.Refresh('#xwdt');
    refresh3 = A.Refresh('#xxjb');
    refresh4 = A.Refresh('#dsj');
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
}

function backToInfo() {
    A.Controller.section('#infoList_section');
}

//列表请求
function getListByType(modelId, callback, loadingObj) {
    showConsole("卡片modelId：" + modelId);

    if(isPullDown === false){
        $('#'+type+' ul').load('loading.html');
    }
    if(isLoading){
        isLoading = false;
        getDataByAjax({
            url: base + 'MobileFlow/webContentList',
            //url:'http://192.168.81.17:8080/oa/MobileFlow/webContentList',
            data: {
                pageNum: pageNum,
                showCount: showCount,
                title: '',
                subflag: "1",
                modelId: modelId,
                ticket: Util.getItem('ticket'),
                sysid: Util.getItem('sysid'),
                orgid: Util.getItem('orgid'),
                uuid: uuid,
                deptid:Util.getItem('deptid')
            }
        }, callback, loadingObj);
    }

    isPullDown = true;
}

// $('#refresh_article').on('scrollInit', function () {
//     scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
//     // scrollDetail = A.Scroll('#noticeDetail-article');
// });

// $('#infoList_section').on('articleload', function () {
//     A.Slider('#sliderPage', {
//         dots: 'hide',
//         change: function (index) {
//             showConsole('---------------qie');
//             if (isRefresh) {
//                 pageNum = 1;
//                 type = $('#sliderPage [data-role="page"]').eq(index).attr('id');//取出标签的id属性
//                 if (type == 'zcfg') {
//                     getListByType(2, refreshList, {isShow: true});
//                 }
//                 if (type == 'xwdt') {
//                     getListByType(3, refreshList, {isShow: true});
//                 }
//                 if (type == 'xxjb') {
//                     getListByType(4, refreshList, {isShow: true});
//                 }
//                 if (type == 'dsj') {
//                     getListByType(5, refreshList, {isShow: true});
//                 }
//                 initRefreshConfig();
//             }
//         }
//     });
// })

$('#infoList_section').on('sectionshow', function () {
    Util.setItem('pageType',type);
    initBackKeyDown(2);
    $('#doul li').removeClass("active");
    $('[data-type="' + type + '"]').addClass("active");
    isRefresh = true;
    var masktime = 1500;
    //A.showMask();
    A.Slider('#sliderPage').destroy();
    A.Slider('#sliderPage', {
        dots: 'hide',
        change: function (index) {
            showConsole('---------------qie');
            isLoading = true;
            if (isRefresh) {
                pageNum = 1;
                type = $('#sliderPage [data-role="page"]').eq(index).attr('id');//取出标签的id属性
                Util.setItem('pageType',type);
                if (type == 'zcfg') {
                    getListByType(2, refreshList, {isShow: false});
                }
                if (type == 'xwdt') {
                    getListByType(3, refreshList, {isShow: false});
                }
                if (type == 'xxjb') {
                    getListByType(4, refreshList, {isShow: false});
                }
                if (type == 'dsj') {
                    getListByType(5, refreshList, {isShow: false});
                }
                initRefreshConfig();
            }
        }
    });
    var tempType = Util.queryString('type');
    if (tempType && tempType != '') {
        type = tempType;
    }
    A.Controller.page('#' + type);
    // if (type == 'zcfg') {
    //     masktime = 0;
    // }
    // setTimeout(function(){
    //     A.hideMask();
    // },masktime)
})

//公告详情处理js
$('#noticeDetail-section').on('sectionshow', function () {
    isRefresh = false;
    showConsole('----section');
    initBackKeyDown(1);
    var params = A.Component.params(this); //获取所有参数，此处为{'id':'1', 'title':'Agile框架实战'}
    detail_id = params.id;
    nowid = detail_id;
    Util.deviceReady(function(){
        Util.getDetailsById(detail_id, 'MobileFlow/webContentView',Util.getItem('uuid'), function (data) {
            Util.redirectLogin(data.result);
            var contentModel = data.model;
            var files = data.att;
            $('#title').text(contentModel.title);//标题
            $('#fuTitle').html('<span>发布人:</span><span style="margin-left:8px;">' + contentModel.promulgatorName + '</span>'
                + '<span style="margin-left:15px;">发布时间:</span><span style="margin-left:8px;">' + contentModel.promulgatorTime + '</span>');
            $('#noticeContent').html(contentModel.content.replace(/text-indent/g,''));
            if(dqid != undefined && nowid!=dqid){
                scrollToTop('#noticeDetail-article',scrollDetail);
            }
            dqid = nowid;
            var attaches = "",addClass = " ";
            for (var i = 0; i < files.length; i++) {
                if(i!=0){//不是第一个附件的话 附件label隐藏
                    addClass = "hidden";
                }
                attaches += ' <div class="row border-none">'
                    + '<i class="icon icon-attach-fill'+addClass+'" style="color: #000000;"></i>'
                    + '<label class="row-left'+addClass+'" style="color: #000000;">附件:</label>'
                    + '<div class="row-right clearfix"><div class="float-left" style="word-wrap: break-word;color: #4587f7" onclick="readPdf(\''+files[i].attachId+'\')">'+files[i].attachName+'</div><div class="float-right"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ files[i].attachId  +'\',\''+files[i].attachName+'\');"></div></div>'
                    +'</div>';
            }
            $('[name="attachment"]').html(attaches);
            // scrollDetail.refresh();
        });
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
                $popup.close();
                A.alert('文件已保存至：'+target.substring(target.indexOf('Android'),target.length));
            }, function (error) {
                A.showToast('获取文件失败');
            });
            $popup.close();
            A.clearToast();
        }else if(data.status == 0){
            //文件不存在
            A.alert('文件不存在!');
        }
    });
}

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
$('#noticeDetail-article').on('scrollInit', function () {
    showConsole('----article');
    // scroll = A.Scroll(this);
    scrollDetail = A.Scroll(this);
})

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
function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", back, false);//绑定首页
        document.removeEventListener("backbutton", backToNoticeDetail, false);
        document.addEventListener("backbutton", backToInfo, false);//绑定返回上页事件
    } else if(type == 3){
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", backToInfo, false);//绑定首页
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.addEventListener("backbutton", backToNoticeDetail, false);
    }else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", backToInfo, false);//绑定首页
        document.removeEventListener("backbutton", backToNoticeDetail, false);
        document.addEventListener("backbutton", cback, false);//绑定首页
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}