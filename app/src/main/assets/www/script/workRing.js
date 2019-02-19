var scroll;
//     addScroll = A.Scroll('#addScroller');
var keyboardHeight, refresh, $popup;
 var conLen = '';
var minlength = 10;
var did;//动态ID
var dtype, commentusername, commentuserId;
var userid = Util.getItem('userid');
var pageSize = 10, totalPage, pageNum = 1;
var uploads = [];
var tempImgs = [];
var isrefresh = false;
var reallyImgs = [];
var sltImgs = [];
var urls = [];
var uuid;
//键盘监听
window.addEventListener('native.keyboardshow', function (e) {
    showConsole('Keyboard height is: ' + e.keyboardHeight);
    keyboardHeight = e.keyboardHeight;
    $('.richedit').css('bottom', keyboardHeight);
    // $('#work-article:not(#inputBox,.comment-a)').on('tap',function(){
    //     $('#inputBox').blur();
    // })
});

window.addEventListener('native.keyboardhide', function (e) {
    // window.removeEventListener('touchend');
    showConsole('hide');
    $('.richedit').css('bottom', 0);
    $('.richedit').hide();
    $('#inputBox').val('');
});
/*$(window).resize(function(){
    window.previewImage = new _previewImage();
})*/
//上传图片监听
// $(document).on("change","#file",function(){
//     var formData = new FormData();
//     formData.append('file', $('#file')[0].files[0]);
//     showConsole($('#file')[0].files[0]);
//     var url = fileUpload + '?userId='+userid;
//     cordova.file.files
//     // getDataByAjax({url:url,processData: false,contentType: false,data:formData},function (data) {
//     //     showConsole(data);
//     //     A.showToast('上传成功',1000);
//     // },{isShow:true});
// })
//图片放大监听
$(document).on('tap', '.noborder img', function () {//agilelite.options.clickEvent
    initBackKeyDown(5);
    var xid = $(this).attr("id").split("_")[1];
    var nowid = parseInt($(this).attr("id").split("_")[2]) + 1;
    showConsole(tempImgs);
    for (var k = 0; k < tempImgs.length; k++) {
        if (tempImgs[k].xid == xid) {
            var tempobj = {
                imgURL: tempImgs[k].path,
                content: tempImgs[k].con,
            }
            reallyImgs.push(tempobj);
            var tempobj1 = {
                imgURL: tempImgs[k].slt,
                content: tempImgs[k].con,
            }
            sltImgs.push(tempobj1);
            urls.push(tempobj.imgURL);
        }
    }
    // showConsole(reallyImgs);
    // showConsole(sltImgs);
    showConsole(urls);
    if (urls.length > 0) {
        // A.Component.pictureShow({
        //     id : 'picture',
        //     index : nowid,//$(".noborder .publicImg").index($(".noborder .publicImg.active"))
        //     title : '',
        //     list : sltImgs,
        //     truelist: reallyImgs
        // });
        var obj = {
            urls: urls,
            current: urls[nowid - 1]
        };
        previewImage.start(obj);

    }
});

//当refresh初始化会进入此监听
$('#workScroller').on('refreshInit', function () {
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
        uploads = [];
        reallyImgs = [];
        sltImgs = [];
        urls = [];
        tempImgs = [];
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            getDynamicList(refreshList, false);
            refresh.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
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
                // getListByType(type,loadMoreData,{isShow:false});
                getDynamicList(loadMoreData, true);
            }
            refresh.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
});

$('#work-section').on('sectionshow', function () {
    Util.deviceReady(function () {
        // uuid = device.imei;
        uuid = device.uuid;
        showConsole(uuid);
        $('#noborder').val('');
        uploads = [];
        reallyImgs = [];
        sltImgs = [];
        urls = [];
        if (isrefresh) {
            pageNum = 1;
            getDynamicList(refreshList, true);
            isrefresh = false;
            // scrollToTop('#workScroller',scroll);
            scroll.scrollTo(0, 0, 0, 0);
        }
        initBackKeyDown(2);
    });
    //执行多次，每次加载页面都会执行
    if (conLen.length > 10) {
        showShortContent();
    }

})

$('#workScroller').on('scrollInit', function () {
    // scroll = A.Scroll('#workScroller');
    scroll = A.Scroll(this);
    scroll.on('scrollEnd', function () {
        var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
        var distance = temp + 20;
        if(this.y < 0 && this.y < distance ){
            $('#agile-pullup').remove();
            $('#workScroller .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
            pageNum++;
            if (pageNum > totalPage) {
                $('#agile-pullup').text('没有更多了');
            } else {
                getDynamicList(loadMoreData, {isShow: false});
            }
        }
        // scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
    });

})

$('#work-article').on('articleload', function () {
    //数据注入,本方法仅执行一次
    initUser();//初始化用户
})

$('#add-section').on('sectionshow', function () {
    initBackKeyDown(1);
})
$('#add-section').on('sectionhide', function () {
    uploads = [];
    $('#add_img .noborder').remove();
})

$('#add-article').on('articleload', function () {
    showConsole('articleload-----');
})

function showFullContent(id) {
    var str = "allContent_" + id;
    var s = $('.' + str).html();
    var temphtml = "";
    temphtml += '<p class=\"shortContent font-space\"><pre>' + s + '</pre></p>';
    temphtml += '<p><a style="color: #576B95" onclick=\"showShortContent(\'' + id + '\')\">收起</a></p>';
    $('#workcontent_' + id).empty().append(temphtml);
}

function showShortContent(id) {
    var str = "shortContent_" + id;
    var s = $('.' + str).html();
    var conhtml = "";
    var tempCon = conLen.substr(0, minlength);
    conhtml += '<p class=\"shortContent font-space\"><pre>' + s + '</pre></p>'
    conhtml += '<p><a style="color: #576B95" onclick=\"showFullContent(\'' + id + '\')\">全文</a></p>';
    $('#workcontent_' + id).empty().append(conhtml);
}

// function comment(id, type, cid) {
//     showConsole('--点击评论');
//     // showConsole(cordova.plugins.Keyboard.isVisible);
//     // cordova.plugins.Keyboard.show();
//     // cordova.plugins.Keyboard.disableScroll(true);
//     var userId = "";
//     var name = "";
//     showConsole(type);
//     if (type == "replyDynamic") {
//         userId = 17950;
//         name = Util.getItem('userFullName');
//     } else {
//         userId = $("#span_" + cid).attr("value");
//         showConsole(userId);
//         name = $("#span_" + cid).text().replace('：', '');
//         showConsole(name);
//     }
//     did = id;
//     dtype = type;
//     commentusername = name;
//     commentuserId = userId;
//
//     showConsole('show');
//     $('.richedit').show();
//
//     // $('.comment-a').on('touchend', function () {
//     //     showConsole('touchend');
//     //     $('#inputBox').focus();
//     // });
//     setTimeout(function () {
//         $('#inputBox').focus();
//     }, 100);
// }

$(document).on('tap','.comment-a',function(){
    var id = $(this).attr('id');
    var type = $(this).attr('attrtype');
    var cid = $(this).attr('attrCid');

    var userId = "";
    var name = "";
    showConsole(type);
    if (type == "replyDynamic") {
        userId = $("#span_" + cid).val();
        name = Util.getItem('userFullName');
    } else {
        userId = $("#span_" + cid).attr("value");
        showConsole(userId);
        name = $("#span_" + cid).text().replace('：', '');
        showConsole(name);
    }
    did = id;
    dtype = type;
    commentusername = name;
    commentuserId = userId;

    showConsole('show');
    $('.richedit').show();
    setTimeout(function () {
        $('#inputBox').focus();
    }, 300);

})

//加载更多
function loadMoreData(data) {
    Util.redirectLogin(data.result);
    totalPage = data.total;
    var htmlStr = "";
    $('#agile-pullup').remove();
    var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
    if (data && "success" == data.status) {

        for (x in data.list) {
            htmlStr += "<li class=\"tbpadding14 li-border-color pl8\">" +
                "<div class=\"full-width clearfix\">" +
                "<div class=\"float-left text-center\" style=\"width: 11%\">";

            htmlStr += '<img id=\"img_' + data.list[x].id + '\" src=\"' + oaWorkRingHeadBase + data.list[x].basic.userHead.split('=')[1] + ticket_uuid + '\" width=\"40\" height=\"40\" >';//onload="loadImg(\''+oaWorkRingHeadBase + data.list[x].basic.userHead + ticket_uuid+'\',\'img_'+data.list[x].id+'\');"
            htmlStr += "</div>" +
                "<div class=\"float-left pl10\" style=\"width: 83%;\">" +
                "<div class=\"mb3 font-size14\" id='username_" + data.list[x].id + "' style=\"color: #576B95;\">" + data.list[x].basic.userName + "</div>" +
                "<div class=\"workcontent font-small font-space\" id='workcontent_" + data.list[x].id + "'>";
            if (data.list[x].basic.abstract[0].classify) {
                // htmlStr +="<p class=\"shortContent font-space\"><pre>"+data.list[x].basic.abstract+"</pre></p>";
            } else {
                htmlStr += "<p class=\"shortContent font-space\"><pre>" + data.list[x].basic.abstract + "</pre></p>";
            }

            if (data.list[x].content.text.length > data.list[x].basic.abstract.length) {
                htmlStr += "<p><a style=\"color: #576B95;\" onclick=\"showFullContent(\'" + data.list[x].id + "\')\">全文</a></p>";
            }
            htmlStr += "</div>" +
                "<p class=\"shortContent_" + data.list[x].id + "\" style='display: none;' >" + data.list[x].basic.abstract + "</p>" +
                "<p class=\"allContent_" + data.list[x].id + "\" style='display: none;'>" + data.list[x].content.text + "</p>" +
                "<ul data-col=\"3\" class=\"grid album\">";
            if (data.list[x].content.file) {
                for (var j = 0; j < data.list[x].content.file.length; j++) {
                    htmlStr += "<li class=\"noborder\" style=\"width: 29%;\"><img class='publicImg' id=\"img_" + data.list[x].id + "_" + j + "\" src=\"" + oaWorkRingImgBase + data.list[x].content.file[j].imageUrl + ticket_uuid + "\" width=\"80\" height=\"80\"></li>";
                    var tempobj = {
                        xid: data.list[x].id,
                        path: '',
                        con: '',
                        slt: ''
                    }
                    tempobj.path = oaWorkRingImgBase + data.list[x].content.file[j].url + ticket_uuid;
                    tempobj.slt = oaWorkRingImgBase + data.list[x].content.file[j].imageUrl + ticket_uuid;
                    tempImgs.push(tempobj);
                }
            }
            htmlStr += "</ul>";//+
            // "<div>" +
            //     "<p onclick=\"alert('id1')\">附件1</p>" +
            //     "<p onclick=\"alert('id2')\">附件2</p>" +
            // "</div>";
            var date = data.list[x].basic.publishTime
            if (date && date != "") {
                date = new Date(Date.parse(date.replace(/-/g, "/")));
                date = getDateDiff(date.getTime());
            }
            htmlStr += "<div class=\"full-width clearfix\">" +
                "<div class=\"float-left\" style=\"width: 50%\"><small class=\"font-xsmaller font-space05\">" + date + "</small></div>" +
                "<div class=\"float-right\" style=\"width: 50%;text-align: right;\">" +
                "<a class=\"comment-a\" id='"+data.list[x].id+"' attrtype=\"replyDynamic\"><i class=\"icon-chatdot-fill font-size14\"></i>评论</a>" +
                "</div>" +
                "</div>" +
                "<div class=\"full-width font-smaller mt6 fong-space05\" id='commentlist_" + data.list[x].id + "' style=\"background-color: #f8f8f8\">";
            for (y in data.list[x].content.commentList) {
                if (data.list[x].content.commentList[y].basic.type == "replyDynamic") {
                    htmlStr += "<div class=\"pl8 tbpadding4\">" +
                        "<a class=\"full-width comment-a\" id='" + data.list[x].id + "' attrtype='commentDynamic' attrcid='" + data.list[x].content.commentList[y].id + "'>" +
                        "<span id='span_" + data.list[x].content.commentList[y].id + "' value='" + data.list[x].content.commentList[y].basic.userId + "' style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.userName + "：</span>" +
                        "<span class=\"\" style=\"color:#000;\">" + data.list[x].content.commentList[y].content.text + "</span>" +
                        "</a>" +
                        "</div>";
                } else if (data.list[x].content.commentList[y].basic.type == "commentDynamic") {
                    htmlStr += "<div class=\"pl8 tbpadding4\">" +
                        "<a class=\"full-width comment-a\" id='" + data.list[x].id + "' attrtype='commentDynamic' attrcid='" + data.list[x].content.commentList[y].id + "'>" +
                        "<span id='span_" + data.list[x].content.commentList[y].id + "' value='" + data.list[x].content.commentList[y].basic.userId + "' style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.userName + "</span>" +
                        "<span style=\"color:#000;\">回复</span>" +
                        "<span style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.replyName + "：</span>" +
                        "<span class=\"\" style=\"color:#000;\">" + data.list[x].content.commentList[y].content.text + "</span>" +
                        "</a>" +
                        "</div>";
                }
            }
            htmlStr += "</div>" +
                "</div>" +
                "</div>" +
                "</li>"
                + "";
        }
        $('#workScroller #workScroller_ul_1').append(htmlStr);
        setTimeout(function () {
            scroll.refresh();
        }, 100);
    }
    showConsole("获取工作圈列表");
    showConsole(data);
    diskCacheSize(false);
}

//获取工作动态列表
function getDynamicList(callback, showFlag) {
    showConsole(userid);
    getDataByAjax({
        url: oaWorkRingBase + 'buildingRing/list',
        type: "get",
        data: {
            userId: userid,
            pageNo: pageNum,
            pageSize: pageSize,
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket')
        }
    }, callback, {isShow: showFlag});
}

//初始进入刷新列表
function refreshList(data) {
    Util.redirectLogin(data.result);
    var htmlStr = "";
    $('#agile-pullup').remove();
    var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + uuid;
    if (data && "success" == data.status) {
        if(data.list.length > 0){
            for (x in data.list) {
                htmlStr += "<li class=\"tbpadding14 li-border-color pl8\">" +
                    "<div class=\"full-width clearfix\">" +
                    "<div class=\"float-left text-center\" style=\"width: 11%\">";
                // cordova.plugins.AppCache.loadImage(oaWorkRingHeadBase + data.list[x].basic.userHead + ticket_uuid,function(data){
                //     //console.log(JSON.parse(data).data);
                //     htmlStr += '<img data-source=\"' + JSON.parse(data).data + '\" width=\"40\" height=\"40\">';
                // },function(data){
                //     console.log('调用失败！ '+data);
                // });
                htmlStr += '<img id=\"img_' + data.list[x].id + '\" src=\"' + oaWorkRingHeadBase + data.list[x].basic.userHead.split('=')[1] + ticket_uuid + '" width=\"40\" height=\"40\" >';//onload="loadImg(\''+oaWorkRingHeadBase + data.list[x].basic.userHead + ticket_uuid+'\',\'img_'+data.list[x].id+'\');"
                htmlStr += "</div>" +
                    '<div class=\"float-left pl10\" style=\"width: 83%;\">' +
                    '<div class=\"mb3 font-size14\" id=\"username_' + data.list[x].id + '\" style=\"color: #576B95;\">' + data.list[x].basic.userName + '</div>' +
                    '<div class=\"workcontent font-small font-space\" id=\"workcontent_' + data.list[x].id + '\">';
                if (data.list[x].basic.abstract[0].classify) {
                    // htmlStr +="<p class=\"shortContent font-space\"><pre>"+data.list[x].basic.abstract+"</pre></p>";
                } else {
                    htmlStr += "<p class=\"shortContent font-space\"><pre>" + data.list[x].basic.abstract + "</pre></p>";
                }
                if (data.list[x].content.text.length > data.list[x].basic.abstract.length) {
                    htmlStr += "<p><a style=\"color: #576B95;\" onclick=\"showFullContent(\'" + data.list[x].id + "\')\">全文</a></p>";
                }
                htmlStr += "</div>" +
                    "<p class=\"shortContent_" + data.list[x].id + "\" style='display: none;' >" + data.list[x].basic.abstract + "</p>" +
                    "<p class=\"allContent_" + data.list[x].id + "\" style='display: none;'>" + data.list[x].content.text + "</p>" +
                    "<ul data-col=\"3\" class=\"grid album\">";
                if (data.list[x].content.file) {
                    for (var j = 0; j < data.list[x].content.file.length; j++) {
                        var tempobj = {
                            xid: data.list[x].id,
                            path: '',
                            con: ''
                        }
                        htmlStr += "<li class=\"noborder\" style=\"width: 29%;\"><img class='publicImg' id=\"img_" + data.list[x].id + "_" + j + "\" src=\"" + oaWorkRingImgBase + data.list[x].content.file[j].imageUrl + ticket_uuid + "\" width=\"80\" height=\"80\"></li>";
                        tempobj.path = oaWorkRingImgBase + data.list[x].content.file[j].url + ticket_uuid;
                        tempobj.slt = oaWorkRingImgBase + data.list[x].content.file[j].imageUrl + ticket_uuid;
                        tempImgs.push(tempobj);
                    }
                }
                htmlStr += "</ul>";//+
                // "<div>" +
                //     "<p onclick=\"alert('id1')\">附件1</p>" +
                //     "<p onclick=\"alert('id2')\">附件2</p>" +
                // "</div>";
                var date = data.list[x].basic.publishTime;
                if (date && date != "") {
                    date = new Date(Date.parse(date.replace(/-/g, "/")));
                    date = getDateDiff(date.getTime());
                }
                htmlStr += "<div class=\"full-width clearfix\">" +
                    "<div class=\"float-left\" style=\"width: 50%\"><small class=\"font-xsmaller font-space05\">" + date + "</small></div>" +
                    "<div class=\"float-right\" style=\"width: 50%;text-align: right;\">" +
                    "<a class=\"comment-a\" id='"+data.list[x].id+"' attrtype=\"replyDynamic\"><i class=\"icon-chatdot-fill font-size14\"></i>评论</a>" +
                    "</div>" +
                    "</div>" +
                    "<div class=\"full-width font-smaller mt6 fong-space05\" id='commentlist_" + data.list[x].id + "' style=\"background-color: #f8f8f8\">";
                for (y in data.list[x].content.commentList) {
                    if (data.list[x].content.commentList[y].basic.type == "replyDynamic") {
                        htmlStr += "<div class=\"pl8 tbpadding4\">" +
                            "<a class=\"full-width comment-a\" id='"+data.list[x].id+"' attrtype=\"commentDynamic\" attrcid='"+data.list[x].content.commentList[y].id+"'>" +
                            "<span id='span_" + data.list[x].content.commentList[y].id + "' value='" + data.list[x].content.commentList[y].basic.userId + "' style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.userName + "：</span>" +
                            "<span class=\"\" style=\"color:#000;\">" + data.list[x].content.commentList[y].content.text + "</span>" +
                            "</a>" +
                            "</div>";
                    } else if (data.list[x].content.commentList[y].basic.type == "commentDynamic") {
                        htmlStr += "<div class=\"pl8 tbpadding4\">" +
                            "<a class=\"full-width comment-a\" id='"+data.list[x].id+"' attrtype=\"commentDynamic\" attrcid='"+data.list[x].content.commentList[y].id+"'>" +
                            "<span id='span_" + data.list[x].content.commentList[y].id + "' value='" + data.list[x].content.commentList[y].basic.userId + "' style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.userName + "</span>" +
                            "<span style=\"color:#000;\">回复</span>" +
                            "<span style=\"color: #576B95\">" + data.list[x].content.commentList[y].basic.replyName + "：</span>" +
                            "<span class=\"\" style=\"color:#000;\">" + data.list[x].content.commentList[y].content.text + "</span>" +
                            "</a>" +
                            "</div>";
                    }
                }
                htmlStr += "</div>" +
                    "</div>" +
                    "</d        iv>" +
                    "</li>"
                    + "";
            }
            $('#workScroller #workScroller_ul_1').empty().append(htmlStr);
        }else{
            $('#workScroller #workScroller_ul_1').load('nodata.html');
        }
        setTimeout(function () {
            refresh ? refresh.refresh() : '';
            scroll.scrollTo(0, 0, 0, 0);
        }, 100);
    }else if(data && data.status=='fail'){

    }
    showConsole("获取工作圈列表");
    showConsole(data);
    diskCacheSize(false);
}

//发布动态
function sendWorkRing() {
    var text = $('#noborder').val().trim();
    var img_length = $('#add_img li').length;
    if ((text == null || text == "") && img_length == 1) {
        A.showToast('内容不能为空！');
        return;
    }
    var parameter = {
        basic: {userId: userid, type: 'dynamic', isPrivate: false},
        content: {text: text, file: uploads}
    };
    parameter = {jsonParam: JSON.stringify(parameter), uuid: device.uuid, ticket: Util.getItem('ticket')},
        showConsole("发布动态parameter:" + parameter);
    getDataByAjax({
        // url:base +'MobileFlow/dblist',
        url: oaWorkRingBase + 'buildingRing/add',
        data: parameter
    }, function (data) {
        Util.redirectLogin(data.result);
        showConsole("获取工作圈列表");
        showConsole(data);
        if (data.status == "success") {
            isrefresh = true;
            A.Controller.section('#work-section');
            A.showToast(data.msg, 1000);
        } else {
            A.showToast(data.msg, 1000);
        }
        // A.Controller.section('#work-section');
        // A.Controller.back();
    }, {isShow: true});
}

//发送评论
function sent() {
    $('#sendBtn').removeAttr('href');
    var text = $('#inputBox').val().trim();
    if (text == null || text == "") {
        A.showToast('内容不能为空！');
        return;
    }
    var username = Util.getItem('userFullName');
    var parameter = {};
    // if(dtype=="replyDynamic"){
    //     showConsole("dtype1:"+dtype);
    //     parameter={
    //         basic:{userId:userId,type:dtype,originalId:did},
    //         content:{text:text,file:''}
    //     };
    // }else{
    showConsole("dtype2:" + dtype);
    showConsole("commentuserId:" + commentuserId);
    var parameter = {
        basic: {userId: userid, type: dtype, originalId: did, replyId: commentuserId + ''},
        content: {text: text, file: ''}
    };
    // }
    parameter = {jsonParam: JSON.stringify(parameter), uuid: device.uuid, ticket: Util.getItem('ticket')};
    showConsole("发送评论parameter:");
    showConsole(parameter);
    getDataByAjax({
        // url:base +'MobileFlow/dblist',
        //url:workRingBase+'resource/information/comment/commentApi',
        url: oaWorkRingBase + 'buildingRing/comment',
        data: parameter
    }, function (data) {
        Util.redirectLogin(data.result);
        showConsole("提交评论");
        showConsole(data);
        if (data.status == "success") {
            A.showToast(data.msg);
            var htmlStr = "";
            if (dtype == "replyDynamic") {
                htmlStr += "<div class=\"pl8 tbpadding4\">" +
                    "<a class=\"full-width comment-a\" id='"+did+"' attrtype=\"commentDynamic\" attrcid='"+data.comment.id+"'>" +
                    "<span id='span_" + data.comment.id + "' value='" + data.comment.basic.userId + "' style=\"color: #576B95\">" + username + "：</span>" +
                    "<span style=\"color:#000;\">" + data.comment.content.text + "</span>" +
                    "</a>" +
                    "</div>";
            } else if (dtype == "commentDynamic") {
                htmlStr += "<div class=\"pl8 tbpadding4\">" +
                    "<a class=\"full-width comment-a\" id='"+did+"' attrtype=\"commentDynamic\" attrcid='"+data.comment.id+"'>" +
                    "<span id='span_" + data.comment.id + "' value='" + data.comment.basic.userId + "' style=\"color: #576B95\">" + username + "</span>" +
                    "<span style=\"color:#000;\">回复</span>" +
                    "<span style=\"color: #576B95\">" + commentusername + "：</span>" +
                    "<span style=\"color:#000;\">" + data.comment.content.text + "</span>" +
                    "</a>" +
                    "</div>";
            }
            $('#commentlist_' + did).append(htmlStr);
            // A.Controller.section('#work-section');
        } else {
            A.showToast(data.msg);
        }
        // A.Controller.section('#work-section');
        // A.Controller.back();
        $('#sendBtn').attr('href','javascript:sent()');
    }, null);
}

function initUser() {
    getDataByAjax({
        // url:base +'MobileFlow/dblist',
        //url:workRingBase+'initIndex',
        url: oaWorkRingBase + 'buildingRing/initIndex',
        data: {
            userId: userid,
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket')
        }
    }, function (data) {
        showConsole("初始化用户");
        showConsole(data);
        Util.redirectLogin(data.result);
        if(data.status == 'success'){
            getDynamicList(refreshList, true);
        }else{
            A.showToast('该用户初始化失败!')
        }
    }, null);
}

//文件选择
function filePicker() {
    showConsole('选择文件');
    chooseImg();
    // //显示用户详细信息弹出框
    // $popup = A.popup({
    //     html: $('#chooseDialog').html(),
    //     css : {width:'auto',backgroundColor:'#fff'},
    //     pos : 'center'
    // });
}

function chooseImg() {
    var img_length = $('#add_img li').length;
    var options = {
        maximumImagesCount: 10 - img_length,
        width: 800,
        height: 800,
        quality: 100
    };
    var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + uuid;
    showConsole(options.maximumImagesCount);
    window.imagePicker.getPictures(function (data) {
        showConsole(data);
        if (data.length > 0) {
            A.showMask('上传中...');
            for (var i = 0; i < data.length; i++) {
                var imgType = data[i].substring(data[i].lastIndexOf('/') + 1).split('.')[1];
                showConsole(imgType);
                if (imgType.indexOf('.webp') < 0) {
                    var opt = new FileUploadOptions();
                    opt.fileKey = "file";
                    opt.fileName = data[i].substring(data[i].lastIndexOf('/') + 1);
                    opt.mimeType = "text/plain";
                    var url = oaFileUpload + '?userId=' + userid + ticket_uuid;
                    var fileTransfer = new FileTransfer();
                    fileTransfer.upload(data[i], encodeURI(url), function (data) {
                            Util.redirectLogin(JSON.parse(data.response).result);
                            var imgObj = JSON.parse(data.response);
                            imgObj["publishTime"] = new Date().getTime();
                            showConsole(imgObj);
                            if (imgObj.size <= 5242880) {
                                var slt = imgObj.imageUrl;
                                var fileId = imgObj.publishTime;
                                // $popup.close();
                                var html = "";
                                html += "<li class=\"noborder\" id=\"upImg_" + fileId + "\">";
                                html += "<div>";
                                html += "<div class=\"del-icon\" onclick=\"removeImg('" + fileId + "')\">";
                                html += "<i class=\"icon icon-clear-fill size20\"></i>";
                                html += "</div>";
                                html += "<div class=\"photo size60 radius4\" style=\"background-image:url(" + oaWorkRingImgBase + slt + ticket_uuid + ");background-repeat:no-repeat; background-size:100% 100%;\">";
                                html += "</div></div></li>";
                                $('#add_img').prepend(html);
                                uploads.push(imgObj);
                                var tempimg_length = $('#add_img li').length;
                                if (tempimg_length == 10) {
                                    $('#add_icon').hide();
                                }
                                A.hideMask();
                            } else {
                                A.showToast(imgObj.name + ' 图片大小超出范围');
                                A.hideMask();
                            }
                        }, function () {
                            A.hideMask();
                            A.showToast('上传失败');
                        }, opt
                    )
                } else {
                    A.hideMask();
                    A.showToast('不支持该类型图片上传');
                }
            }
        } else {
            A.hideMask();
            A.clearToast();
        }
    }, function () {
        A.hideMask();
        A.showToast('不支持该类型图片上传');
    }, options);
}

function removeImg(id) {
    A.clearToast();
    showConsole($("#upImg_" + id).attr("class"));
    $("#upImg_" + id).remove();

    var tempimg_length = $('#add_img li').length;
    if (tempimg_length < 10) {
        $('#add_icon').show();
    }

    for (var i = 0; i < uploads.length; i++) {
        var obj = uploads[i];
        if (obj.publishTime == id) {
            uploads.splice(i, 1);
        }
    }
    showConsole(uploads);
}

function chooseFile() {
    // window.resolveLocalFileSystemURL('cordova.file.dataDirectory', function (root) {
    //     showConsole(root);
    //     // root.getFile('demo.txt', {create: true}, function (fileEntry) {
    //     //     var dataObj = new Blob(['欢迎访问hangge.com'], {type: 'text/plain'});
    //     //     //写入文件
    //     //     writeFile(fileEntry, dataObj);
    //     // }, function (err) {
    //     //     showConsole('创建失败!');
    //     // });
    // }, function (err) {
    // });
}

function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", exitImg, false);//绑定首页
        document.addEventListener("backbutton", back, false);//绑定返回上页事件
    } else if (type == 5) {
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", back, false);//绑定返回上页事件
        document.addEventListener("backbutton", exitImg, false);//绑定返回上页事件
    } else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.removeEventListener("backbutton", exitImg, false);//绑定首页
        document.addEventListener("backbutton", cback, false);//绑定首页
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}

function exitImg() {
    previewImage.closePreview();
}

