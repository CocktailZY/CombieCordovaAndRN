var refreshSjBox, refreshCgBox, refreshYfBox, refreshYsBox;
var scroll1, scroll2, scroll3, scroll4;
var pageSize = 10, pageNum = 1, totalPage;
var domain = "zzgov.cn";
var email_password;
// var startX = startY = endX = endY = 0;
// var postion = 0;
// var listCountMark;
//页面初始化
var uuid;
var email;
var phone;
//邮箱类型
var type = "inbox";
//收件箱的总数据,未读数
var inbox_totalpage, inbox_unreadmail;
//发件箱的总数据,未读数
var sentbox_totalpage, sentbox_unreadmail;
//草稿箱的总数据,未读数
var draftbox_totalpage, draftbox_unreadmail;
//垃圾箱的总数据,未读数
var trashbox_totalpage, trashbox_unreadmail;
var refresh1, refresh2, refresh3, refresh4, pageNum = 1, totalPage;
var clear_write_page = 1;
var isrefresh = false;
var isreply = false;
var mailuid, time;
var sj_email = "";
var send_type = 0;//0:是回复；1：是写邮件
var selPos;//记录光标位置
var exlistobj;//初始化右侧删除按钮组件
var timeOutEvent = 0;//记录按下时间
var choosedMailsId = '';
var draft_flag = false;//不是再次编辑的草稿
var getDetail_flag = true;//标记写信页面是否需要获取详情

Util.deviceReady(function () {
    uuid = device.uuid;
    $.event.special.swipe.horizontalDistanceThreshold = 10;
    // //获取用户信息
    // showUserInfo();
    // showConsole("查询用户信息：" + email);
    // //判断该用户是否存在
    // if (!checkMailUser(email)) {
    //     showConsole("查询用户不存在，在邮件系统");
    //     addMailUser();
    // }
    // $('#sendbtn').on(A.options.clickEvent, function () {
    //     // 销毁编辑器
    //     editor.destroy();
    //     return false;
    // });
    email = Util.getItem("email");
    phone = Util.getItem("phone");
    email_password = Util.getItem('password');
    //查询每个信箱的邮件总数
    // getInboxCount();
});


$('#backLetter_section').on('sectionshow', function () {
    listenBackreceivePeople1Div();
    $('#backcontent1').focus();
});

$('#btn_popover').off(A.options.clickEvent).on(A.options.clickEvent, function () {
    A.popover([{
        text: '写信',
        handler: function () {
            toWriteLetter();
        }
    }, {
        text: '编辑',
        handler: function () {
            exlistobj.showLeft();
            resetMenu();
        }
    }], this);
    return false;
});

$('.exlist_checkbox').off('tap').on('tap', function () {
    showConsole('enter tap');
})

$('#btn_chooseAll').off(A.options.clickEvent).on(A.options.clickEvent, function () {
    if ($('#btn_chooseAll i').hasClass('icon-cbo')) {
        $('#btn_chooseAll i').removeClass('icon-cbo').addClass('icon-cbook');
        var checkboxs = $('.exlist_checkbox');
        for (var i = 0; i < checkboxs.length; i++) {
            $(checkboxs[i]).prop('checked', true);
        }
    } else {
        $('#btn_chooseAll i').removeClass('icon-cbook').addClass('icon-cbo');
        var checkboxs = $('.exlist_checkbox');
        for (var i = 0; i < checkboxs.length; i++) {
            $(checkboxs[i]).prop('checked', false);
        }
    }

    return false;
});

$('#btn_delete').off(A.options.clickEvent).on(A.options.clickEvent, function () {
    var number = 0;
    $('.exlist_checkbox').each(function () {
        if ($(this)[0].checked) {
            var $li = $(this).parents('li');
            choosedMailsId += $li.attr('id') + ',';
            number++;
        }
    });
    showConsole(number);
    if (number == 0) {
        A.alert("请选择待删除的活动");
        return;
    }
    A.confirm('提示', '确定删除选中邮件吗?',
        function () {
            getDataByAjax({
                // url: base + 'Cmail/addBatchDelmail',
                url: base + 'javamail/delete',
                // url:'http://192.168.81.:8080/oa/Cmail/delmail',
                data: {
                    uid: Util.getItem('email'),
                    password: email_password,//Util.getItem('password'),
                    ids: choosedMailsId,
                    uuid: Util.getItem('uuid'),
                    ticket: Util.getItem('ticket'),
                    type:type
                }
            }, function (data) {
                Util.redirectLogin(data.result);
                if (data.status == 'success') {
                    var ids = choosedMailsId.split(',');
                    for (var i = 0; i < ids.length; i++) {
                        $('#' + ids[i]).remove();
                        $('#line_'+ ids[i]).remove();
                    }
                    A.showToast('删除成功');
                    choosedMailsId = '';
                    getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
                } else {
                    A.showToast('删除失败');
                }

            })
        },
        function () {
            choosedMailsId = '';
        });
    return false;
});

function cancelFun() {
    exlistobj.hideLeft();
    $('#btn_popover').show();
    $('#btn_delete').hide();
    $('#btn_chooseAll').hide();
    $('#btn_cancel').attr('onclick', 'toPublicMailbox()');
    $('#btn_cancel').empty().html('<i class="icon icon-arrowleft"></i>返回');
    $('btn_chooseAll i').removeClass('icon-cbook');
    $('btn_chooseAll i').addClass('icon-cbo');
}

function resetMenu() {
    $('#btn_popover').hide();
    $('#btn_delete').show();
    $('#btn_chooseAll').show();
    $('#btn_cancel').attr('onclick', 'cancelFun()');
    $('#btn_cancel').empty().html('<i class="icon icon-arrowleft"></i>取消');
}

// $("#inbox_article").on({
//     touchstart: function(e){
//         e.stopPropagation();
//         var index=$("#imgDiv").find(".image").index($(this));
//         timeOutEvent = setTimeout(function(){
//             exlistobj.showLeft();
//         }, 500);//这里设置长按响应时间
//     },
//     touchmove: function(){
//         clearTimeout(timeOutEvent);
//         timeOutEvent = 0;
//     },
//     touchend: function(){
//         e.stopPropagation();
//         clearTimeout(timeOutEvent);
//     }
// });

// $(document).on("input","#receivePeople",function(){
//     var tempSelPos = getCursorPosition($(this));
//     if(selPos < tempSelPos){
//         selPos = tempSelPos;
//     }else{
//         //触发了删除操作
//
//     }
// });
function onKeyPress(e)
{
    alert(e.which);

};
//监听删除按键
$(document).keydown(function (event) {
    //onKeyPress(event);
    //判断输入区域有没有文字
    if ($.trim($('#writePlace').text()) == '') {
        //判断有没有span;
        listenReceivePeopleDiv();
        var isFocus = $("#writePlace").is(":focus");
        if ((event.keyCode == 8||event.keyCode == 229) && isFocus) {
            var flag = true;
            $('#receivePeople span').each(function () {
                if ($(this).hasClass("chooseAddress")) {
                    flag = false;
                    return;
                }
            })
            if (!flag) {
                $('#receivePeople .chooseAddress').remove();
            } else {
                if ($('#receivePeople :last-child').hasClass("chooseError")) {
                    $('#receivePeople :last-child').addClass("chooseAddress");
                    $('#receivePeople :last-child').addClass("chooseErrorAndChooseAddress");
                } else {
                    $('#receivePeople :last-child').addClass("chooseAddress");
                }

            }
            listenReceivePeopleDiv();

        }
    }
});

//监听receivePeople所在div中有没有span
function listenReceivePeopleDiv() {
    var $result = $('#receivePeople span');
    if ($result.length == 0) {
        $('#receivePeople').removeClass("padding8");
    } else {
        $('#receivePeople').addClass("padding8");
    }
}

//点击高亮收件人
$(document).on(A.options.clickEvent, '#receivePeople span', function () {
    // $('#receivePeople .chooseAddress').removeClass('chooseAddress');
    // $(this).addClass('chooseAddress');
    //$('#writePlace').focus();
    if ($(this).hasClass("chooseAddress")) {
        if ($(this).hasClass("chooseErrorAndChooseAddress")) {
            $(this).addClass('chooseError');
            $(this).removeClass('chooseErrorAndChooseAddress');
        } else {
            $(this).removeClass('chooseAddress');
        }
    } else {

        if ($('#receivePeople .chooseAddress').hasClass("chooseErrorAndChooseAddress")) {
            $('#receivePeople .chooseAddress').removeClass('chooseErrorAndChooseAddress');
            $('#receivePeople .chooseAddress').addClass('chooseError');
            $('#receivePeople .chooseAddress').removeClass('chooseAddress');
        } else {
            $('#receivePeople .chooseAddress').removeClass('chooseAddress');
        }
        if ($(this).hasClass("chooseError")) {
            $(this).addClass('chooseErrorAndChooseAddress');
            $(this).addClass('chooseAddress');
            $(this).removeClass('chooseError');
        } else {
            $(this).addClass('chooseAddress');
        }
    }

})
//失焦监听
$('#writePlace').on('blur', function () {
    var tempStr =$.trim($(this).html());
    if (tempStr != "" && tempStr != null && tempStr != undefined) {
        var htmlStr = '<span class="addHighLight lrpadding8 margin8">' + tempStr + '</span>';
        //$(this).html($(this).html().replace(tempStr,htmlStr));
        $('#receivePeople').append(htmlStr);
        $('#receivePeople .chooseAddress').removeClass('chooseAddress');
        if ($('#receivePeople').children().length > 0) {

            //有span就添加padding8 class
            listenReceivePeopleDiv();
            checkEmail('#receivePeople');
        }
    }
    $(this).html('');
})
//聚焦监听
$('#writePlace').on('focus', function () {
    // var html=$('#receivePeople').html();
    if ($('#receivePeople').children().length > 0) {
        checkEmail('#receivePeople');
    }
})

//获取输入框的值
function getValue() {
    $('#writePlace').focus();
}

/**
 *
 * 回复页面的方法---开始
 */
//监听删除按键
$(document).keydown(function (event) {
    listenBackreceivePeople1Div();
    var isFocus = $("#writePlace1").is(":focus");
    if ((event.keyCode == 8 ||event.keyCode == 229)&& isFocus) {
        var flag = true;
        $('#backreceivePeople1 span').each(function () {
            if ($(this).hasClass("chooseAddress")) {
                flag = false;
                return;
            }
        })
        if (!flag) {
            $('#backreceivePeople1 .chooseAddress').remove();
        } else {
            if ($('#backreceivePeople1 :last-child').hasClass("chooseError")) {
                $('#backreceivePeople1 :last-child').addClass("chooseAddress");
                $('#backreceivePeople1 :last-child').addClass("chooseErrorAndChooseAddress");
            } else {
                $('#backreceivePeople1 :last-child').addClass("chooseAddress");
            }
        }

    }
    listenBackreceivePeople1Div();
});
//点击高亮收件人
$(document).on(A.options.clickEvent, '#backreceivePeople1 span', function () {
    if ($(this).hasClass("chooseAddress")) {
        if ($(this).hasClass("chooseErrorAndChooseAddress")) {
            $(this).removeClass('chooseErrorAndChooseAddress');
            $(this).addClass('chooseError');
        } else {
            $(this).removeClass('chooseAddress');
        }
    } else {
        //$('#backreceivePeople1 .chooseAddress').removeClass('chooseAddress');
        if ($('#backreceivePeople1 .chooseAddress').hasClass("chooseErrorAndChooseAddress")) {
            $('#backreceivePeople1 .chooseAddress').removeClass('chooseErrorAndChooseAddress');
            $('#backreceivePeople1 .chooseAddress').addClass('chooseError');
            $('#backreceivePeople1 .chooseAddress').removeClass('chooseAddress');
        } else {
            $('#backreceivePeople1 .chooseAddress').removeClass('chooseAddress');
        }
        if ($(this).hasClass("chooseError")) {
            $(this).addClass('chooseErrorAndChooseAddress');
            $(this).addClass('chooseAddress');
            $(this).removeClass('chooseError');
        } else {
            $(this).addClass('chooseAddress');
        }
    }


    //$('#writePlace').focus();
})
//失焦监听
$('#writePlace1').on('blur', function () {
    //var tempStr = $(this).html().substring($(this).html().lastIndexOf('>')+1,$(this).html().length).replace(/\s/g, '');
    //showConsole(tempStr);
    var tempStr = $.trim($(this).html());
    if (tempStr != "" && tempStr != null && tempStr != undefined) {
        var htmlStr = '<span class="addHighLight lrpadding8 margin8">' + tempStr + '</span>';
        //$(this).html($(this).html().replace(tempStr,htmlStr));
        $('#backreceivePeople1').append(htmlStr);
        $('#backreceivePeople1 .chooseAddress').removeClass('chooseAddress');
        if ($('#backreceivePeople1').children().length > 0) {
            listenBackreceivePeople1Div();
            checkEmail('#backreceivePeople1');
        }
    }
    $(this).html('');
})
//聚焦监听
$('#writePlace1').on('focus', function () {
    // var html=$('#receivePeople').html();
    if ($('#backreceivePeople1').children().length > 0) {
        checkEmail('#backreceivePeople1');
    }
})

//获取输入框的值
function getBackValue() {
    $('#writePlace1').focus();
}

//监听receivePeople所在div中有没有span
function listenBackreceivePeople1Div() {
    var $result = $('#backreceivePeople1 span');
    if ($result.length == 0) {
        $('#backreceivePeople1').removeClass("padding8");
    } else {
        $('#backreceivePeople1').addClass("padding8");
    }
}

/**
 *
 * 回复页面 ------结束
 */
//检查邮箱格式是否正确
function checkEmail(obj) {
    $(obj).find("span").each(function () {
        var reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        var value = $(this).text();
        //value=value.substring(value.indexOf("<")+1,value.indexOf(">"));
        showConsole("邮箱值：" + value);
        var result = reg.test(value);
        showConsole("比较结果：" + result);
        if (result) {
            $(this).removeClass("chooseError");
        } else {
            $(this).addClass("chooseError");

        }
    });
}


//添加用户到邮件系统中
function addMailUser() {
    getDataByAjax({
        url: base + 'mailuser/add',
        // url:'http://192.168.81.36:8086/oa/mailuser/add',
        data: {
            // id:Util.getItem('userid'),
            ticket: Util.getItem('ticket'),
            uuid: uuid,
            uid: email,
            password: email_password,
            realname: Util.getItem('userFullName'),
            telephone: phone,
            organize: "",
            mailboxsize: 1000
        },
        async: true
    }, function (data) {
        Util.redirectLogin(data.result);
        if ($.trim(data.status) == "Success") {
            showConsole("添加用户成功");
        } else {
            showConsole("添加用户失败原因:" + data.description);
            A.showToast('添加用户失败，请联系管理员');
            return;
        }

    });
}

//判断用户是否已经在邮箱系统中
function checkMailUser(email) {
    var flag = false;
    getDataByAjax({
        url: base + 'mailuser/check',
        //url:'http://192.168.81.36:8086/oa/mailuser/check',
        data: {
            // id:userid,
            ticket: Util.getItem('ticket'),
            uuid: uuid,
            uid: email
        },
        async: true
    }, function (data) {
        Util.redirectLogin(data.result);
        if ($.trim(data.status) == "Success") {
            flag = true;
        }

    });

    return flag;
}

//获取用户信息
function showUserInfo() {
    getDataByAjax({
        url: base + 'MobileFlow/getUserInfo',
        //url:'http://192.168.81.36:8086/oa/MobileFlow/getUserInfo',
        data: {
            id: Util.getItem('userid'),
            ticket: Util.getItem('ticket'),
            uuid: uuid
        },
        async: true
    }, function (data) {
        Util.redirectLogin(data.result);
        var userInfo = data.userInfo.userInfo[0];
        email = userInfo.email;
        phone = userInfo.phone;
        showConsole("查询用户信息：" + email);

    });
}

var titlearry = [];

//统计邮件收件人名的个数
function initemailTitl(title) {
    var flag = true;
    for (var i = 0; i < titlearry.length; i++) {
        if (titlearry[i] == title) {
            flag = false;
            break;
        }
    }
    if (flag) {
        titlearry.push(title);
    }
}

//默认加载第一页和刷新方法
function refreshList(data) {
    Util.redirectLogin(data.result);
    if (data != null && data != '') {
        if (type == 'inbox') {
            inbox_totalpage = data.totalPage;
        }
        if (type == 'draft') {
            draftbox_totalpage = data.totalPage;
        }
        if (type == 'sent') {
            sentbox_totalpage = data.totalPage;
        }
        if (type == 'trash') {
            trashbox_totalpage = data.totalPage;
        }
        var htmlStr = "";
        $('#agile-pullup').remove();
        if (data.recordList && data.recordList.length > 0) {
            //返回多条数据，由于接口返回1条数据时候类型为实体类对象，多条数据为list
            for (var i = 0; i < data.recordList.length; i++) {
                var item = data.recordList[i];
                // var mailfrom = item.mailfrom.trim();
                htmlStr = phtml(htmlStr, item);
            }
        } else {
            //暂无数据
            if (type == "inbox") {
                $('#sj_outBox .scroller ul').load('nodata.html');
            } else if (type == "trash") {
                $('#lj_outBox .scroller ul').load('nodata.html');
            } else if (type == "draft") {
                $('#cg_outBox .scroller ul').load('nodata.html');
            } else if (type == "sent") {
                $('#fs_outBox .scroller ul').load('nodata.html');
            }
            //返回1条数据
            // var item = data.maillist.mailid;
            // htmlStr = phtml(htmlStr, item);
        }
        loadHTML(htmlStr);
    } else {
        A.showToast('暂无数据~');
    }

}

//页面拼接
function phtml(htmlStr, item, index) {
    // var mailfrom = item.mailfrom.trim();
    var replace_flag = true;
    if(item.mailfroms.indexOf('@30.41.59') != -1){
        replace_flag = false;
    }
    var mailfrom = showTitleByType(item);
    var szf = "";
    var name = mailfrom;
    szf = mailfrom.substring(0, 1);
    // if (type == 'inbox') {
    //     // var mailfroms = mailfrom.split("|");
    //     //
    //     // if (mailfroms[0] != null && mailfroms[0] != undefined && mailfroms[0].length > 0) {
    //     //     szf = mailfroms[0].substring(0, 1);
    //     //     if (mailfroms[0].indexOf("@") != -1) {
    //     //         name = mailfroms[0].substring(0, mailfroms[0].indexOf("@"));
    //     //     } else {
    //     //         name = mailfroms[0];
    //     //     }
    //     // } else {
    //     //     if (mailfrom.indexOf(",") != -1) {
    //     //         var mailfroms = mailfrom.split(",");
    //     //         name = mailfroms[1].substring(0, mailfroms[1].indexOf("@"));
    //     //         szf = name.substring(0, 1);
    //     //     } else {
    //     //         // name = mailfrom.substring(0, mailfroms[1].indexOf("@"));
    //     //         szf = mailfrom.substring(0, 1);
    //     //     }
    //     //
    //     //
    //     // }
    // } else {
    //     name = mailfrom;//.substring(0, mailfrom.indexOf(","));
    //     szf = name.substring(0, 1);
    //
    // }

    initemailTitl(mailfrom);//统计所有的名字
    // var mailto = JSON.parse(item.mailto);
    // for (var i = 0; i < mailto.to.length; i++) {
    //     var temp = mailto.to[i];
    //     sj_email += temp + ",";
    // }
    // if (sj_email != '' && sj_email.indexOf(',') != -1) {
    //     sj_email = sj_email.substring(0, sj_email.lastIndexOf(','));
    // }
    // if(sj_email != '' && sj_email.indexOf(' &lt;') != -1){
    //     sj_email = sj_email.substring(0,sj_email.indexOf(' &lt;'));
    // }
    var new_time = dealTime(item);
    // $.trim(item.to.replace(/\|/g, "").replace(/quot;/g, ''));
    htmlStr += '<li class="wrap_li nopadding" id="' + $.trim(item.mailuid) + '">';
    // htmlStr += '<div class="full-width outdiv" style="position: relative;">';
    htmlStr += '<div class="justify">';// float-left
    for (var j = 0; j < titlearry.length; j++) {
        if (titlearry[j] == mailfrom) {
            var l = j + 1;
            if (l > 10) {
                var str = l + '';
                var temp = str.charAt(str.length - 1);
                htmlStr += '<div class="dept-photo bg-' + temp + '">';
            } else {
                htmlStr += '<div class="dept-photo bg-' + l + '">';
            }
            break;
        }

    }
    htmlStr += szf;
    htmlStr += '</div>';
    htmlStr += '</div>';
    htmlStr += '<div class="justify-content noborder dept-parent-left bg-white" style="z-index: 1" onclick="showMailDetil(\'' + $.trim(item.mailuid) + '\',\'' + $.trim(new_time) + '\', \''+encodeURI(item.mailto)+'\' ,this,'+replace_flag+');">';
    htmlStr += '<p class="text-ellipsis-black" style="width: 60%;">';
    if (item.readStatus == "2" && type == "inbox") {
        htmlStr += '<img src="images/point.png" width="10" height="10" style="margin-right: 5px;">';
    }
    // htmlStr += '<img src="images/point.png" width="10" height="10">';
    htmlStr += name;
    /*判断附件样式*/
    // if ($.trim(item.attach) == "yes") {
    //     htmlStr += '<i class="icon icon-attach"></i>';
    //
    // }
    //htmlStr += '<i class="icon icon-attach"></i>';
    htmlStr += '</p>';
    var new_date = new_time;

    htmlStr += '<small class="top right">' + new_date + '</small>';
    htmlStr += '<small class="nowrap">' + $.trim(item.mailsubject) + '</small>';
    htmlStr += '</div>';
    // htmlStr += '<div class="justify dept-parent-line dept-parent-right" style="color: #8f8f8f;">';
    // htmlStr += '<i class="icon icon-arrowright"></i>';
    // htmlStr += '</div>';
    // htmlStr += '</div>';
    // htmlStr += '<button class="cancel outbtn" style="width: 80px;height:69px;">删除</button>';
    // htmlStr += '<div style="position: absolute;right: 0;">' +
    //     '<a class="button cancel noradius" style="' +
    //     '    width: 80px;' +
    //     '    height: 68px;' +
    //     '    line-height: 68px;' +
    //     '" onclick="delMail(' + item.mailuid.trim() + ');">' +
    //     '删除' +
    //     '</a>' +
    //     '</div>';
    htmlStr += '</li>';
    htmlStr += '<div class="dept-parent-line" id="line_' + $.trim(item.mailuid) + '" style="margin-left: 50px;"></div>';
    return htmlStr;
}

function dealTime(item) {
    var new_date = '';
    if (type == 'inbox') {
        new_date = item.recTime;
    } else {
        new_date = item.sendTime;
    }
    return new_date;
}

//显示收件人的姓名
function showSJName(item) {
    // var sj_email = $.trim(item.to.replace(/\|/g, "").replace(/quot;/g, '').replace("lt;", ",&lt;").replace(/gt;/g, "&gt;|"));
    // var names = sj_email.split("|");
    var title = "";
    var mailto = JSON.parse(item.mailto);
    for (var i = 0; i < mailto.to.length; i++) {
        var names = mailto.to[i];
        title = names + ",";
    }
    if (title.indexOf(',') != -1) {
        title = title.substring(0, title.lastIndexOf(","));
    }
    return title;
}

//判断各个邮箱的显示数据
function showTitleByType(item) {
    var title = "";
    if (type == "inbox") {//收件箱显示发件人
        title = $.trim(item.mailfroms);
    } else if (type == "trash") {//垃圾显示收件人
        title = showSJName(item);
        //title=item.to.replace(/\|/g,"").replace(/quot;/g,'').replace("lt;",",").replace(/gt;/g,"").trim();
    } else if (type == "draft") {//草稿显示收件人
        title = showSJName(item);
        //title=item.to.replace(/\|/g,"").replace(/quot;/g,'').replace("lt;",",").replace(/gt;/g,"").trim();
    } else if (type == "sent") {//已发显示收件人
        title = showSJName(item);
        // title=item.to.replace(/\|/g,"").replace(/quot;/g,'').replace("lt;",",").replace(/gt;/g,"").trim();
    }
    return title;
}

//上拉加载更多数据
function loadMoreData(data) {
    Util.redirectLogin(data.result);
    var htmlStr = "";
    $('#agile-pullup').remove();
    if (data.recordList && data.recordList.length > 0) {
        for (var i = 0; i < data.recordList.length; i++) {
            var item = data.recordList[i];
            var replace_flag = true;
            if(item.mailfroms.indexOf('@30.41.59') != -1){
                replace_flag = false;
            }
            var mailfrom = showTitleByType(item);
            var szf = "";
            var name = mailfrom;
            szf = mailfrom.substring(0, 1);
            // if (type == 'inbox') {
            //     // var mailfroms = mailfrom.split("|");
            //     //
            //     // if (mailfroms[0] != null && mailfroms[0] != undefined && mailfroms[0].length > 0) {
            //     //     szf = mailfroms[0].substring(0, 1);
            //     //     if (mailfroms[0].indexOf("@") != -1) {
            //     //         name = mailfroms[0].substring(0, mailfroms[0].indexOf("@"));
            //     //     } else {
            //     //         name = mailfroms[0];
            //     //     }
            //     // } else {
            //     //     name = mailfroms[1].substring(0, mailfroms[1].indexOf("@"));
            //     //     szf = name.substring(0, 1);
            //     //
            //     // }
            // } else {
            //     name = mailfrom;//;
            //     szf = name.substring(0, 1);
            //
            // }
            initemailTitl(mailfrom)//统计所有的名字
            // var sj_email = "";
            // var mailto = JSON.parse(item.mailto);
            // for (var k = 0; k < mailto.to.length; k++) {
            //     var temp = mailto.to[k];
            //     sj_email += temp + ",";
            // }
            // if (sj_email != '' && sj_email.indexOf(',') != -1) {
            //     sj_email = sj_email.substring(0, sj_email.lastIndexOf(','));
            // }
            // if(sj_email != '' && sj_email.indexOf('<') != -1){
            //     sj_email = sj_email.substring(0,sj_email.indexOf('<'));
            // }
            var new_time = dealTime(item);
            // var sj_email = $.trim(item.to.replace(/\|/g, "").replace(/quot;/g, ''));
            htmlStr += '<li class="wrap_li nopadding" id="' + $.trim(item.mailuid) + '">';
            // htmlStr += '<div class="full-width outdiv" style="position: relative;">';
            htmlStr += '<div class="justify">';//swipe_option
            for (var j = 0; j < titlearry.length; j++) {
                if (titlearry[j] == name) {
                    var l = j + 1;
                    if (l > 10) {
                        var str = l + '';
                        var temp = str.charAt(str.length - 1);
                        htmlStr += '<div class="dept-photo bg-' + temp + '">';
                    } else {
                        htmlStr += '<div class="dept-photo bg-' + l + '">';
                    }
                    break;
                }

            }
            htmlStr += szf;
            htmlStr += '</div>';
            htmlStr += '</div>';
            htmlStr += '<div class="justify-content noborder dept-parent-left bg-white" style="z-index: 1" onclick="showMailDetil(\'' + $.trim(item.mailuid) + '\',\'' + $.trim(new_time) + '\',\'' + encodeURI(item.mailto) + '\',this,'+replace_flag+');">';
            htmlStr += '<p class="text-ellipsis-black" style="width: 60%;">';
            if (item.readStatus == "2" && type == "inbox") {
                htmlStr += '<img src="images/point.png" width="10" height="10" style="margin-right: 5px;">';
            }
            // htmlStr += '<img src="images/point.png" width="10" height="10">';
            htmlStr += name;
            if ($.trim(item.attach) == "yes") {
                htmlStr += '<i class="icon icon-attach"></i>';

            }
            //htmlStr += '<i class="icon icon-attach"></i>';
            htmlStr += '</p>';
            var new_date = new_time;
            htmlStr += '<small class="top right">' + new_date + '</small>';
            htmlStr += '<small class="nowrap">' + $.trim(item.mailsubject) + '</small>';
            htmlStr += '</div>';
            // htmlStr += '<div class="justify dept-parent-line dept-parent-right" style="color: #8f8f8f;">';
            // htmlStr += '<i class="icon icon-arrowright"></i>';
            // htmlStr += '</div>';
            // htmlStr += '</div>';
            // htmlStr += '<button class="cancel outbtn" style="width: 80px;height:69px;">删除</button>';
            // htmlStr += '<div style="position: absolute;right: 0;">' +
            //     '<a class="button cancel noradius" style="' +
            //     '    width: 80px;' +
            //     '    height: 68px;' +
            //     '    line-height: 68px;' +
            //     '" onclick="delMail(' + item.mailuid.trim() + ');">' +
            //     '删除' +
            //     '</a>' +
            //     '</div>';
            htmlStr += '</li>';
            htmlStr += '<div class="dept-parent-line" id="line_' + $.trim(item.mailuid) + '" style="margin-left: 50px;"></div>';
        }
        loadMoreHTML(htmlStr);
    }
}

//将拼接的数加载到数据库中
function loadHTML(htmlstr) {
    if (type == "inbox") {
        $("#sj_outBox .scroller ul").empty().html(htmlstr);
        A.Scroll("#sj_outBox").scrollTo(0, 0, 0, 0);
        cancelFun();
    } else if (type == "trash") {
        $("#lj_outBox .scroller ul").empty().html(htmlstr);
        A.Scroll("#lj_outBox").scrollTo(0, 0, 0, 0);
        cancelFun();
    } else if (type == "draft") {
        $("#cg_outBox .scroller ul").empty().html(htmlstr);
        A.Scroll("#cg_outBox").scrollTo(0, 0, 0, 0);
        cancelFun();
    } else if (type == "sent") {
        $("#fs_outBox .scroller ul").empty().html(htmlstr);
        A.Scroll("#fs_outBox").scrollTo(0, 0, 0, 0);
        cancelFun();
    }
    A.Scroll('#fs_outBox').refresh();
    A.Scroll('#lj_outBox').refresh();
    A.Scroll('#cg_outBox').refresh();
    A.Scroll('#sj_outBox').refresh();
    exlistobj.refresh();
}

//将拼接的数加载到数据库中
function loadMoreHTML(htmlstr) {
    if (type == "inbox") {
        $("#sj_outBox .scroller ul").append(htmlstr);
        scroll1.refresh();
        cancelFun();
    } else if (type == "trash") {
        $("#lj_outBox .scroller ul").append(htmlstr);
        scroll3.refresh();
        cancelFun();
    } else if (type == "draft") {
        $("#cg_outBox .scroller ul").append(htmlstr);
        scroll4.refresh();
        cancelFun();
    } else if (type == "sent") {
        $("#fs_outBox .scroller ul").append(htmlstr);
        scroll2.refresh();
        cancelFun();
    }
    A.Scroll('#fs_outBox').refresh();
    A.Scroll('#lj_outBox').refresh();
    A.Scroll('#cg_outBox').refresh();
    A.Scroll('#sj_outBox').refresh();
    exlistobj.refresh();
}


//列表请求
function getListByType(type, callback, loadingObj) {
    showConsole("查询邮箱的类别：" + type);
    getDataByAjax({
        // url: base + 'Cmail/getList',
        url: base + 'javamail/list',
        //url: 'http://192.168.81.36:8086/oa/Cmail/getList',
        data: {
            page: pageNum,
            pageSize: showCount,
            uid: email,
            password: email_password,
            type: type,
            ticket: Util.getItem('ticket'),
            sysid: Util.getItem('sysid'),
            orgid: Util.getItem('orgid'),
            uuid: Util.getItem('uuid')
        }
    }, callback, loadingObj);
}

//查询每个信箱箱的邮件数量和未读数据
function getInboxCount() {
    getDataByAjax({
        url: base + 'javamail/unread',
        //url: 'http://192.168.81.36:8086/oa/Cmail/mailboxlist',
        data: {
            uid: email,
            password: email_password,
            ticket: Util.getItem('ticket'),
            sysid: Util.getItem('sysid'),
            orgid: Util.getItem('orgid'),
            uuid: Util.getItem('uuid')
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data != null && data != '') {
            showConsole("成功查询数量");
            if (data.status == '1') {
                // inbox_totalpage = data.inbox_tote_count;
                inbox_unreadmail = data.inbox_unread_count;
                // sentbox_totalpage = data.sent_tote_count;
                sentbox_unreadmail = data.sent_unread_count;
                // trashbox_totalpage = data.draft_tote_count;
                trashbox_unreadmail = data.trash_unread_count;
                // draftbox_totalpage = data.trash_tote_count;
                draftbox_unreadmail = data.draft_unread_count;
            }
            if (inbox_unreadmail > 0) {
                $("#inboxcount").show();
                $("#inboxcount").addClass("tip");
                $("#inboxcount").html(inbox_unreadmail > 99 ? 99 : inbox_unreadmail);
            } else {
                $("#inboxcount").removeClass("tip");
                $("#inboxcount").empty();
            }
            // if (sentbox_unreadmail > 0) {
            //     $("#sentboxcount").show();
            //     $("#sentboxcount").addClass("tip");
            //     $("#sentboxcount").html(sentbox_unreadmail);
            // } else {
            //     $("#sentboxcount").removeClass("tip");
            //     $("#sentboxcount").empty();
            // }
            // if (trashbox_unreadmail > 0) {
            //     $("#trashboxcount").show();
            //     $("#trashboxcount").addClass("tip");
            //     $("#trashboxcount").html(trashbox_totalpage);
            // } else {
            //     $("#trashboxcount").removeClass("tip");
            //     $("#trashboxcount").empty();
            // }
            // if (draftbox_unreadmail > 0) {
            //     $("#draftboxcount").show();
            //     $("#draftboxcount").addClass("tip");
            //     $("#draftboxcount").html(draftbox_unreadmail);
            // } else {
            //     $("#draftboxcount").removeClass("tip");
            //     $("#draftboxcount").empty();
            // }
        }
    }, {isShow: true, loadingMsg:'请稍后...'});
}

//点击获取人员列表
function getListByDomain() {
    getDataByAjax({
        url: base + 'mailuser/mailusers',
        //url: 'http://192.168.81.36:8086/oa/mailuser/mailusers',
        data: {
            domain: domain,
            ticket: Util.getItem('ticket'),
            sysid: Util.getItem('sysid'),
            orgid: Util.getItem('orgid'),
            uuid: Util.getItem('uuid')
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data != null && $.trim(data.status) == "Success") {
            var htmlstr = "";
            for (var i = 0; i < data.user.length; i++) {
                var item = data.user[i];
                //@name=postmaxter@egt360.com;  status=启动
                htmlstr += '<tr>';
                htmlstr += '<td class="text-center"><input type="checkbox"></td>';
                /* htmlstr+='<td class="text-center" class="text-center">葛文</td>';
                 htmlstr+='<td class="text-center" class="text-center">女</td>';*/
                htmlstr += '<td class="text-center" class="text-center" name="emailname">' + $.trim(item['@name']) + '</td>';
                htmlstr += '</tr>';
            }

            $("tbody").empty().html(htmlstr);

        }

    }, {isShow: true, loadingMsg:'请稍后...'});
}

$('#sj_outBox').on('scrollInit', function () {
    scroll1 = A.Scroll(this, {scrollbars: false, fadeScrollbars: true, click: false, tap: true})//已经初始化后不会重新初始化，但是可以得到滚动对象
    scroll1.on('scrollEnd', function () {
        // if(listCountMark >= showCount){
        if ($('#sj_outBox .scroller ul').find('.nodataHtml').length != 1 && $('#sj_outBox .scroller ul').find('.loadingdata').length != 1) {
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if (this.y < 0 && this.y < distance) {
                $('#agile-pullup').remove();
                $('#sj_outBox .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
                pageNum++;
                if (pageNum > inbox_totalpage) {
                    $('#agile-pullup').text('没有更多了');
                } else {
                    getListByType(type, loadMoreData, {isShow: false});
                }
            }
        }
        // }
        // scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
    });
});

$('#fs_outBox').on('scrollInit', function () {
    scroll2 = A.Scroll(this);
    scroll2.on('scrollEnd', function () {
        // if(listCountMark >= showCount){
        if ($('#fs_outBox .scroller ul').find('.nodataHtml').length != 1 && $('#fs_outBox .scroller ul').find('.loadingdata').length != 1) {
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if (this.y < 0 && this.y < distance) {
                $('#agile-pullup').remove();
                $('#fs_outBox .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
                pageNum++;
                if (pageNum > sentbox_totalpage) {
                    $('#agile-pullup').text('没有更多了');
                } else {
                    getListByType(type, loadMoreData, {isShow: false});
                }
            }
        }
        // scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
    });
});

$('#lj_outBox').on('scrollInit', function () {
    scroll3 = A.Scroll(this);
    scroll3.on('scrollEnd', function () {
        // if(listCountMark >= showCount){
        if ($('#lj_outBox .scroller ul').find('.nodataHtml').length != 1 && $('#lj_outBox .scroller ul').find('.loadingdata').length != 1) {
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if (this.y < 0 && this.y < distance) {
                $('#agile-pullup').remove();
                $('#lj_outBox .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
                pageNum++;
                if (pageNum > trashbox_totalpage) {
                    $('#agile-pullup').text('没有更多了');
                } else {
                    getListByType(type, loadMoreData, {isShow: false});
                }
            }
        }
        // }
        // scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
    });
});

$('#cg_outBox').on('scrollInit', function () {
    scroll4 = A.Scroll(this);
    scroll4.on('scrollEnd', function () {
        // if(listCountMark >= showCount){
        if ($('#cg_outBox .scroller ul').find('.nodataHtml').length != 1 && $('#cg_outBox .scroller ul').find('.loadingdata').length != 1) {
            var temp = this.wrapperHeight - this.scrollerHeight;//到达最底部时的滚动条位置
            var distance = temp + 20;
            if (this.y < 0 && this.y < distance) {
                $('#agile-pullup').remove();
                $('#cg_outBox .scroller').append('<div id="agile-pullup" class="full-width text-center" style="height: 20px;padding: 5px 0px !important;"><div>加载中...</div></div>');
                pageNum++;
                if (pageNum > draftbox_totalpage) {
                    $('#agile-pullup').text('没有更多了');
                } else {
                    getListByType(type, loadMoreData, {isShow: false});
                }
            }
        }
        // }
        // scroll1.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
    });
    getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
});

//收件箱
function initInbox(){
    showConsole('向上刷新收件箱列表refresh_article');
    refreshSjBox = A.Refresh('#sj_outBox');

    refreshSjBox.setConfig({
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
    refreshSjBox.on('pulldown', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            //----------------------------------------------页面初始化数据方法
            getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
            refreshSjBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
    //监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
    refreshSjBox.on('pullup', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum++;
            if (pageNum > inbox_totalpage) {
                refreshSjBox.setConfig({
                    pullUpOpts: {
                        normalLabel: '没有更多数据了~',
                        releaseLabel: '没有更多数据了~',
                        refreshLabel: '没有更多数据了~'
                    }
                });
            } else {
                //----------------------------------------分页方法
                getListByType(type, loadMoreData, {isShow: true, loadingMsg:'请稍后...'});
            }
            refreshSjBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
}
//草稿箱
function initDrafybox(){
    showConsole('refresh_article');
    refreshCgBox = A.Refresh('#cg_outBox');
    showConsole(refreshCgBox);
    refreshCgBox.setConfig({
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
    refreshCgBox.on('pulldown', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            //----------------------------------------------页面初始化数据方法
            getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
            refreshCgBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
    //监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
    refreshCgBox.on('pullup', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum++;
            if (pageNum > inbox_totalpage) {
                refreshCgBox.setConfig({
                    pullUpOpts: {
                        normalLabel: '没有更多数据了~',
                        releaseLabel: '没有更多数据了~',
                        refreshLabel: '没有更多数据了~'
                    }
                });
            } else {
                //----------------------------------------分页方法
                getListByType(type, loadMoreData, {isShow: true, loadingMsg:'请稍后...'});
            }
            refreshCgBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
}
//垃圾箱
function initTrashbox(){
    showConsole('refresh_article');
    refreshYsBox = A.Refresh('#lj_outBox');
    showConsole(refreshYsBox);
    refreshYsBox.setConfig({
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
    refreshYsBox.on('pulldown', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            //----------------------------------------------页面初始化数据方法
            getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
            refreshYsBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
    //监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
    refreshYsBox.on('pullup', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum++;
            if (pageNum > inbox_totalpage) {
                refreshYsBox.setConfig({
                    pullUpOpts: {
                        normalLabel: '没有更多数据了~',
                        releaseLabel: '没有更多数据了~',
                        refreshLabel: '没有更多数据了~'
                    }
                });
            } else {
                //----------------------------------------分页方法
                getListByType(type, loadMoreData, {isShow: true, loadingMsg:'请稍后...'});
            }
            refreshYsBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
}
//发件箱
function initSentbox(){
    showConsole('refresh_article');
    refreshYfBox = A.Refresh('#fs_outBox');
    showConsole(refreshYfBox);
    refreshYfBox.setConfig({
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
    refreshYfBox.on('pulldown', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            //----------------------------------------------页面初始化数据方法
            getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
            refreshYfBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
    //监听上拉加载事件，可以做一些逻辑操作，当data-scroll="pulldown"时无效
    refreshYfBox.on('pullup', function () {
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum++;
            if (pageNum > inbox_totalpage) {
                refreshYfBox.setConfig({
                    pullUpOpts: {
                        normalLabel: '没有更多数据了~',
                        releaseLabel: '没有更多数据了~',
                        refreshLabel: '没有更多数据了~'
                    }
                });
            } else {
                //----------------------------------------分页方法
                getListByType(type, loadMoreData, {isShow: true, loadingMsg:'请稍后...'});
            }
            refreshYfBox.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
}
//页面刷新方法
var send_person = "";

//点击进入详情页——
function showMailDetil(mailuid, time, sj_email, obj,flag) {
    showConsole("查看详情" + mailuid + "邮箱类型：" + type +"收件人："+sj_email);
    cancelFun();
    $("#read_subject").html("");
    $("#read_mailfrom").html("");
    $("#read_time").html("");
    //$("#read_to").html("");
    $("#read_content").html("");
    //如果是收件箱显示回复按钮
    if (type == "inbox" && flag) {
        showcallback();
    } else {
        hidecallback();
    }
    //如果是草稿箱，详情页进入到写信页面
    if(type == 'draft'){
        A.Controller.section('toWriteLetter_section.html?mailuid=' + mailuid + '&time=' + time + '&sj_email=' + sj_email + '&draft_flag=true');
    }else{
        A.Controller.section('mailDetail_section.html?mailuid=' + mailuid + '&time=' + time + '&sj_email=' + sj_email);
    }
    $(obj).find("p img").remove();

}

//加载详情
$('#mailDetail_section').on('sectionshow', function () {
    initBackKeyDown(1);
    var params = A.Component.params(this); //获取所有参数，此处为{'id':'1'}
    mailuid = params.mailuid;
    time = params.time;
    sj_email = params.sj_email;
    showConsole("邮件ID：" + mailuid);
    showConsole("邮箱类型：" + type);
    showConsole("收件箱：" + sj_email);
    getDataByAjax({
        url: base + 'Cmail/readmail',
        //url: 'http://192.168.81.36:8086/oa/Cmail/readmail',
        data: {
            uid: email,
            password: email_password,
            emailId: mailuid,
            ticket: Util.getItem('ticket'),
            sysid: Util.getItem('sysid'),
            orgid: Util.getItem('orgid'),
            uuid: Util.getItem('uuid'),
            checkmailbox: type
        },
        dataType: "json"
    }, function (data) {
        Util.redirectLogin(data.result);
        showConsole(data);
        //console.log(data);
        if (data.status == "Success") {
            var item = data.mailid;
            $("#read_subject").html($.trim(item.mailsubject));
            var mailfrom = item.mailfrom + "";
            mailfrom = mailfrom.replace(/\|/g, "");
            mailfrom = mailfrom.replace("lt;", "&lt;");
            mailfrom = mailfrom.replace(/gt;/g, "&gt;");
            showConsole("发件人：" + mailfrom);
            send_person = mailfrom;
            $("#read_mailfrom").html(mailfrom);
            $("#read_time").html(getWeekDate(time));
            var htmltemp = "";
            var tempStr;
            //sj_email = sj_email.substring(0,sj_email.lastIndexOf(','));
            // console.log('-------------');
            // console.log(sj_email);
            htmltemp = dealMailTo(sj_email);

            //附件
            if(item.attachlist.length > 0){
                var attchhtml = '';
                for(var at = 0 ; at < item.attachlist.length ;at++){
                    var tempItem = item.attachlist[at];
                    attchhtml += '<div class="clearfix">' +
                    '<div class="float-left" style=\"color: #278EEE;word-wrap:break-word;width:80%;\" onclick="readPdf(\'' + tempItem.attachdownurl + '\',\''+tempItem.attachtype+'\',\''+tempItem.attachfilename+'\')">' + tempItem.attachfilename + '</div>' +
                    '<div class="float-left" name="downloadDiv" style="width:20%;"><img src="images/download.png" style="margin-left: 12px;width: 20px;" onclick="downloadFile(\''+ tempItem.attachdownurl  +'\',\''+tempItem.attachfilename+'\');"></div>'+
                    '</div>';
                }
                $('#attch').empty().append(attchhtml);
            }

            $("#read_to").empty().append(htmltemp);//Util.getItem('userFullName') + "&lt;" + email + "&gt;"
            var text = item.mailbody;
            text = Base64.decode(text);
            text = text.replace(/href=\"http:\/\/172.16.16.68\"/g, "");
            text = text.replace(/contenteditable="true"/g,'contenteditable="false"');
            $("#read_content").html(text);
            //大图等比缩小
            $("#read_content").find("img").each(function (index, item) {
                if($(item).attr('src').indexOf('images/download.png') == -1){
                    if($(item).attr('src').indexOf('uuid') != -1){
                        $(item).attr('src',$(item).attr('src').substring(0,$(item).attr('src').indexOf('uuid')))
                        $(item).attr('src',$(item).attr('src')+'uuid='+Util.getItem('uuid')+'&ticket='+Util.getItem('ticket'));
                    }else{
                        $(item).attr('src',$(item).attr('src')+'&uuid='+Util.getItem('uuid')+'&ticket='+Util.getItem('ticket'));
                    }
                    var shrink = 2;
                    var maxWidth = $("#read_content").width() / shrink;
                    var maxHeigth = $("#read_content").height() / shrink;
                    $(item).css("max-width", maxWidth);
                    $(item).css("max-height", maxHeigth);
                    $(item).width("auto");
                    $(item).height("auto");
                }else{

                }
            });
        } else {
            A.showToast('暂无数据~');
        }
    }, {isShow: true, loadingMsg:'请稍后...'});
});

//读取pdf
function readPdf(attachUrl, attachType, fileName) {
    if(fileName.indexOf('jpg') != -1 || fileName.indexOf('jpeg') != -1|| fileName.indexOf('png') != -1 || fileName.indexOf('doc') != -1 || fileName.indexOf('xls') != -1 || fileName.indexOf('pdf') != -1){
        if (!fileName.indexOf('jpg') || !fileName.indexOf('jpeg') || !fileName.indexOf('png')) {
            A.Controller.section('mail-reader-section.html?attid=' + Base64.encode(attachUrl));
        } else {
            // var temp = {
            //     url:attachUrl,
            //     // ticket:Util.getItem('ticket'),
            //     uuid:Util.getItem('uuid'),
            //     filename:'file.'+fileName.split('.')[1]
            // }
            // console.log(base + "Cmail/previewAttachment?url=" + attachUrl + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid') + "&filename=file." + fileName.split('.')[1]);
            // toPdfViewer(base + "Cmail/previewAttachment?url=" + attachUrl + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid') + "&filename=file." + fileName.split('.')[1]);
					toPdfViewerMail(Base64.encode(attachUrl),attachUrl,fileName.split('.')[1]);
            // toPdfViewer(base + "Cmail/previewAttachment?data="+JSON.stringify(temp));
        }
    }else{
        A.alert('不支持该格式预览!');
    }
}
$('#mail-reader-section').on('sectionshow', function () {
    var params = {
        attid: A.Component.params(this).attid,
    };
    Util.deviceReady(function(){
        initBackKeyDown(2);
        var src = base + "/Cmail/readImage?url=" + Base64.encode(params.attid) + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
        // JSOn.parse
        $("#container").css('display', 'block');
        // $("#myPDF").css('display', 'none');
        $("#image").attr("src", src);
    });
});
function toPdfViewerMail(id,url,filename){
    getDataByAjax({
        // url: base + 'Cmail/getList',
        url: base + 'Cmail/getPDFInfo',
        //url: 'http://192.168.81.36:8086/oa/Cmail/getList',
        data: {
            ticket: Util.getItem('ticket'),
            uuid: Util.getItem('uuid'),
            filename:filename,
            url:url,
            id:id
        }
    }, function(data){
        var viewurl = base + 'Cmail/previewAttachment?pdfId=' + data.pdfId + "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
        window.AndroidNativePdfViewer.openPdfUrl(viewurl,'文件预览',{
            headerColor:'#278EEE',
            swipeHorizontal:false,
            showShareButton:false
        },function(){
            console.log('view pdf success');
        },function(){
            console.log('view pdf error');
        })
    }, {isShow:true,loadingMsg:'请稍后...'});
}
/* 正文附件下载方法 */
function downloadFile(url,attachName){
    //下载
    var source = base + 'Cmail/downloadAttachment?url='+url+'&uuid='+Util.getItem('uuid')+'&ticket='+Util.getItem('ticket')+'&filename='+Base64.encode(attachName);
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
    A.hideMask();
}
//附件end
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function getWeekDate(date) {
    var d = new Date(date);

    var t = d.getDay();
    showConsole("星期：" + t);
    var new_date = new Date(date).Format("yyyy-MM-dd");
    var context = new_date + " ";
    if (t == 0) {
        context += "周日";
    } else if (t == 1) {
        context += "周一";
    } else if (t == 2) {
        context += "周二";
    } else if (t == 3) {
        context += "周三";
    } else if (t == 4) {
        context += "周四";
    } else if (t == 5) {
        context += "周五";
    } else if (t == 6) {
        context += "周六";
    }
    showConsole(context);
    showConsole(context);
    return context;
}

//点击进入收件箱
function toInbox(type_box) {
    type = type_box;
    A.Controller.section('#inbox_section');
}

//加载收件箱
$('#inbox_section').on('sectionshow', function () {
    exlistobj = initRightBtn();
    initBackKeyDown(3);
    // var params = A.Component.params(this); //获取所有参数，此处为{'id':'1'}
    // type = params.type;
    showConsole("邮箱类型：" + type);
    //获取每个信箱邮件的个数
    //getInboxCount();
    if (isrefresh) {
        pageNum = 1;
        getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
        // scrollToTop('#sj_outBox',A.Scroll('#sj_outBox'))
    }

    // swipeleftDel();
    // exlistobj.refresh();

});
$('#inbox_article').on('articleload', function () {
    showConsole("inbox_article");
    initInbox();
});

//点击进入草稿箱
function toDraft(type_box) {
    type = type_box;
    A.Controller.section('#draftBox_section');
}

//草稿箱加载列表
$('#draftBox_section').on('sectionshow', function () {
    exlistobj = initRightBtn();
    initBackKeyDown(3);
    // var params = A.Component.params(this);
    // type = params.type;
    showConsole("邮箱类型：" + type);
    //获取每个信箱邮件的个数
    // getInboxCount();
    if (isrefresh) {
        pageNum = 1;
        getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
        // scrollToTop('#cg_outBox',A.Scroll('#cg_outBox'));
    }
});
$('#draftBox_section').on('articleload', function () {
    initDrafybox();
    //执行多次，每次加载页面都会执行
    // getListByType(type, refreshList, {isShow: true});
});

//点击进入垃圾箱
function toTrashBox(type_box) {
    type = type_box;
    A.Controller.section('#trashBox_section');
}

//垃圾箱加载列表
$('#trashBox_section').on('sectionshow', function () {
    exlistobj = initRightBtn();
    initBackKeyDown(3);
    // var params = A.Component.params(this);
    // type = params.type;
    showConsole("邮箱类型：" + type);
    //获取每个信箱邮件的个数
    // getInboxCount();
    if (isrefresh) {
        pageNum = 1;
        getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
        // scrollToTop('#lj_outBox',A.Scroll('#lj_outBox'));
    }
});
$('#trashBox_section').on('articleload', function () {
    initTrashbox();
    //执行多次，每次加载页面都会执行
    // getListByType(type, refreshList, {isShow: true});
});

//点击进入已发箱
function toSendBox(type_box) {
    type = type_box;
    A.Controller.section('#hasSend_section');
}

//已发箱加载列表
$('#hasSend_section').on('sectionshow', function () {
    exlistobj = initRightBtn();
    initBackKeyDown(3);
    // var params = A.Component.params(this);
    // type = params.type;
    showConsole("邮箱类型：" + type);
    //获取每个信箱邮件的个数
    // getInboxCount();
    if (isrefresh) {
        pageNum = 1;
        getListByType(type, refreshList, {isShow: true, loadingMsg:'请稍后...'});
        // scrollToTop('#fs_outBox',A.Scroll('#fs_outBox'));
    }
});
$('#hasSend_section').on('articleload', function () {
    initSentbox();
    //执行多次，每次加载页面都会执行
    // getListByType(type, refreshList, {isShow: true});
});

//跳邮件首页
function toPublicMailbox() {
    A.Controller.section("#toPublicMailbox_section");
}

//邮件首页加载
$('#toPublicMailbox_section').on('sectionshow', function () {

    isrefresh = true;
    initBackKeyDown(2);
    //获取每个信箱邮件的个数
    getInboxCount();
    type = '';
    //refreshInit();
});

//跳转写信页面
function toWriteLetter() {
    send_type = 1;
    clear_write_page = 1;
    A.Controller.section('#toWriteLetter_section');
}

//写信页加载
$('#toWriteLetter_section').on('sectionshow', function () {
    //判读接受人div有没有span
    listenReceivePeopleDiv();
    initBackKeyDown(1);
    send_type = 1 ;
    var params = A.Component.params(this); //获取所有参数，此处为{'id':'1'}
    if(params.mailuid && getDetail_flag){
        mailuid = params.mailuid;
        time = params.time;
        sj_email = params.sj_email;
        draft_flag = params.draft_flag;
        showConsole("邮件ID：" + mailuid);
        showConsole("邮箱类型：" + type);
        showConsole("收件箱：" + sj_email);
        getDataByAjax({
            url: base + 'Cmail/readmail',
            //url: 'http://192.168.81.36:8086/oa/Cmail/readmail',
            data: {
                uid: email,
                password: email_password,
                emailId: mailuid,
                ticket: Util.getItem('ticket'),
                sysid: Util.getItem('sysid'),
                orgid: Util.getItem('orgid'),
                uuid: Util.getItem('uuid'),
                checkmailbox: type
            },
            dataType: "json"
        }, function (data) {
            Util.redirectLogin(data.result);
            showConsole(data);
            //console.log(data);
            if (data.status == "Success") {
                var item = data.mailid;
                $("#subject").val($.trim(item.mailsubject));
                var mailfrom = item.mailfrom + "";
                mailfrom = mailfrom.replace(/\|/g, "");
                mailfrom = mailfrom.replace("lt;", "&lt;");
                mailfrom = mailfrom.replace(/gt;/g, "&gt;");
                showConsole("发件人：" + mailfrom);
                send_person = mailfrom;
                var htmltemp = "";
                var tempStr;
                htmltemp = dealMailTo(sj_email);
                $("#receivePeople").empty().append(htmltemp);//Util.getItem('userFullName') + "&lt;" + email + "&gt;"
                var text = item.mailbody;
                text = Base64.decode(text);
                text = text.replace(/href=\"http:\/\/172.16.16.68\"/g, "");
                text = text.replace(/<base  ><\/base>/g,'');
                text = text.replace(/<base  \/>/g,'');
                // text = text.replace(/contenteditable="true"/g,'contenteditable="false"');
                $("#content").html(text);
                //大图等比缩小
                $("#content").find("img").each(function (index, item) {
                    var shrink = 2;
                    var maxWidth = $("#read_content").width() / shrink;
                    var maxHeigth = $("#read_content").height() / shrink;
                    $(item).css("max-width", maxWidth);
                    $(item).css("max-height", maxHeigth);
                    $(item).width("auto");
                    $(item).height("auto");
                });
            }
        });
    }else{
        if (clear_write_page == 1) {
            var subject = $("#subject").val("");
            var content = $("#content").val("");
            var toEmail = $("#receivePeople").html("");
        }
        if (send_person != "" && isreply) {
            showConsole("收件人的邮箱是：" + send_person);
            $("#receivePeople").val(send_person);
            isreply = false;
        }
    }
    getDetail_flag = true;
    showConsole("发件人的邮箱是：" + email);
    $("#fromPeople").val(email);
});
//退出写信页
$('#toWriteLetter_section').on('sectionhide', function () {
    draft_flag = false;
});

//跳联系人
function toContactPersonBox() {
    A.Controller.section("#ContactPerson_section");
}

//加载选择人员
$('#ContactPerson_section').on('sectionshow', function () {
    initBackKeyDown(1);
    getListByDomain();
});

//搜索
function serachEmail(e) {
    var elmentId = $(e).parent().parent()[0].id;
    $("#" + elmentId).fadeOut(10)
    $("#" + elmentId).next().fadeIn(10);
}

//关闭搜索
function colseSearchEmail(e) {
    var colseId = $(e).parent().parent().parent()[0].id;
    $("#" + colseId).fadeOut(10);
    $("#" + colseId).prev().fadeIn(10);
}

function flage(e) {
    $(e).css("color", "red");
    $($(e).parent().prev().prev()[0].children[1]).css("color", "red");
    $(e).removeClass("icon-flag").addClass("icon-flag-fill");
}

//向写信页面添加选择的联系人
function addContactPerson() {
    showConsole("确定选中人");
    var checkedemail = "";
    $("#ContactPerson_table tbody tr").find("input").each(function () {
        var isChecked = $(this).prop('checked');
        if (isChecked) {
            var email = $(this).parent().parent().find("td[name='emailname']").html();
            email = '<span class="addHighLight lrpadding8 margin8">' + email + '</span>';
            if (send_type == 0) {//回复
                //判断选择的邮箱没有重复的
                var address1 = $("#backreceivePeople1").html();//$("#backreceivePeople1").val();
                if (address1.indexOf(email) != -1) {

                } else {
                    checkedemail += email;
                    // checkedemail += ',';
                }

            } else if (send_type == 1) {//写邮件
                //判断选择的邮箱没有重复的

                var address2 = $("#receivePeople").html();
                if (address2 != null && address2 != undefined && address2 != "") {
                    if (address2.indexOf(email) != -1) {

                    } else {
                        checkedemail += email;
                        // checkedemail += ',';
                    }
                } else {
                    checkedemail += email;
                    //checkedemail += ',';
                }

            }


        }

    });
    //判断选择联系人是来自回复还是写信
    if (send_type == 0) {//回复
        var address3 = $("#backreceivePeople1").val();

        checkedemail = checkedemail + address3;

        $("#backreceivePeople1").html(checkedemail);
        send_person = "";
    } else if (send_type == 1) {//写信
        var address4 = $("#receivePeople").html();
        checkedemail = checkedemail + address4;
        // if (address4 != null && address4 != undefined && address4 != "") {
        //     checkedemail = checkedemail + address4;
        // } else {
        //     checkedemail = checkedemail.substring(0, checkedemail.length - 1);
        // }

        $("#receivePeople").html(checkedemail);
    }
    showConsole("确定选中人:" + checkedemail);
    clear_write_page = 0;
    getDetail_flag = false;
    A.Controller.back();
}

function getToEmail(id) {
    var result = "";
    $("#" + id + " span").each(function () {
        var reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/g;
        showConsole("邮箱值：" + $(this).html());
        var temp = '';
        if($(this).html().indexOf('&lt;') != -1){
            temp = $(this).html().substring($(this).html().indexOf('&lt;')+4,$(this).html().indexOf('&gt;'));
        }
        var flag = reg.test($(this).html());
        showConsole("比较结果：" + flag);
        if(flag){
            result += $(this).html();
            result += ",";
        }else{
            result= "-1,";
            return false;
        }
    })
    if (result.length > 0) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}


function sendMail() {
    var subject = $("#subject").val();
    var content = $("#content").val();
    var toEmail = $("#receivePeople").html();
    if (toEmail == null || toEmail == undefined || toEmail == "") {
        A.showToast("收件人不能为空");
        return;
    }
    //判断有没有格式不正确的
    if ($("#receivePeople .chooseError").length > 0 || $("#receivePeople .chooseErrorAndChooseAddress").length > 0) {
        A.showToast("收件人邮箱格式不正确");
        return;
    }
    if (subject == null || subject == undefined || subject == "") {
        A.showToast("主题不能为空");
        return;
    }
    if (content == null || content == undefined) {
        content = "";
        return;
    }
    toEmail = getToEmail("receivePeople");
    // var otheremail = [];
    // //if(toEmail.indexOf(",")!=-1){
    // var checkedemails = toEmail.split(",");
    // for (var i in checkedemails) {
    //     var recei = {
    //         email: checkedemails[i],
    //         name: checkedemails[i].substring(0, checkedemails[i].indexOf("@"))
    //     };
    //     // recei.email = checkedemails[i];
    //     // recei.name = checkedemails[i];
    //     otheremail.push(recei);
    // }
    //}
    var json = {
        // receivers: JSON.stringify(otheremail),
        type: "sent",
        content: content,
        subject: subject,
        sendEmail: email,
        sendName: Util.getItem('userFullName'),
        sendPassword: email_password,
        ticket: Util.getItem('ticket'),
        sysid: Util.getItem('sysid'),
        orgid: Util.getItem('orgid'),
        uuid: Util.getItem('uuid'),
        toEmail: toEmail
    };
    if(draft_flag){
        getDataByAjax({
            //url: base + 'Cmail/delmail',
            url: base + 'javamail/delete',
            // url:'http://192.168.81.:8080/oa/Cmail/delmail',
            data: {
                uid: Util.getItem('email'),
                password: email_password,//Util.getItem('password'),
                ids: mailuid,
                uuid: Util.getItem('uuid'),
                ticket: Util.getItem('ticket'),
                type: 'draft'
            },
        }, function (data) {},{isShow:false})
    }
    getDataByAjax({
        url: base + 'Cmail/sendEmail',
        // url: base + 'Cmail/sendEmailMulti',//http://192.168.81.36:8086/oa/Cmail/sendEmailMulti
        data: json,
        // dataType: "json",
        // cache: false,
        // contentType: 'application/json;charset=utf-8', //设置请求头信息
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data != null && $.trim(data.status) == "Success") {
            isrefresh = true;
            A.Controller.back();
            A.showToast('发送成功');
        } else {
            showConsole("发送失败的原因：" + data.description);
            A.showToast('发送失败');
        }
    }, {isShow: false});
}

//发送邮件
// function sendMail() {
//     var subject = $("#subject").val();
//     var content = $("#content").val();
//     var toEmail = $("#receivePeople").html();
//     if (toEmail == null || toEmail == undefined || toEmail == "") {
//         A.showToast("收件人不能为空");
//         return;
//     }
//     //判断有没有格式不正确的
//     if ($("#receivePeople .chooseError").length > 0 || $("#receivePeople .chooseErrorAndChooseAddress").length > 0) {
//         A.showToast("收件人邮箱格式不正确");
//         return;
//     }
//     if (subject == null || subject == undefined || subject == "") {
//         A.showToast("主题不能为空");
//         return;
//     }
//     if (content == null || content == undefined) {
//         content = "";
//         return;
//     }
//     toEmail = getToEmail("receivePeople");
//     var otheremail = [];
//     //if(toEmail.indexOf(",")!=-1){
//     var checkedemails = toEmail.split(",");
//     for (var i in checkedemails) {
//         var recei = {
//             email: checkedemails[i],
//             name: checkedemails[i].substring(0, checkedemails[i].indexOf("@"))
//         };
//         // recei.email = checkedemails[i];
//         // recei.name = checkedemails[i];
//         otheremail.push(recei);
//     }
//     //}
//     var json = {
//         // receivers: JSON.stringify(otheremail),
//         type: "sent",
//         content: content,
//         subject: subject,
//         sendEmail: email,
//         sendName: Util.getItem('userFullName'),
//         sendPassword: email_password,
//         ticket: Util.getItem('ticket'),
//         sysid: Util.getItem('sysid'),
//         orgid: Util.getItem('orgid'),
//         uuid: uuid,
//         receiverInfo: JSON.stringify(otheremail)
//     };
//     getDataByAjax({
//         url: base + 'Cmail/sendEmailMulti',
//         // url: base + 'Cmail/sendEmailMulti',//http://192.168.81.36:8086/oa
//         data: json,
//         // dataType: "json",
//         // cache: false,
//         // contentType: 'application/json;charset=utf-8', //设置请求头信息
//     }, function (data) {
//         if (data != null && data.status.trim() == "Success") {
//             A.showToast('发送成功');
//             isrefresh = true;
//             A.Controller.back();
//         } else {
//             showConsole("发送失败的原因：" + data.description);
//             A.showToast('发送失败');
//         }
//     }, {isShow: true});
// }

function getback() {
    if (type == 'inbox') {
        isrefresh = false;
        toInbox(type);
    }else if (type == 'draft') {
        isrefresh = false;
        toDraft(type);
    }else if (type == 'sent') {
        isrefresh = false;
        toSendBox(type);
    }else if (type == 'trash') {
        isrefresh = false;
        toTrashBox(type);
    }else{
        toPublicMailbox();
    }

    $("#read_content").empty();
}
function backToDetail() {

}

function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.removeEventListener("backbutton", toPublicMailbox, false);//绑定返回公共页
        document.addEventListener("backbutton", hback, false);//绑定返回上页事件
    } else if (type == 3) {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", hback, false); // 注销返回上页事件
        document.removeEventListener("backbutton", cback, false); // 注销返回上页事件
        document.addEventListener("backbutton", toPublicMailbox, false);//绑定返回公共页
    } else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", hback, false); // 注销返回上页事件
        document.removeEventListener("backbutton", toPublicMailbox, false);//绑定返回公共页
        document.addEventListener("backbutton", cback, false);//绑定首页
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}

function hback() {
    back();
    $("#read_content").empty();
}

//收件箱详情回复
function callback(type) {
    //邮件头部
    send_type = 0;
    $("#backcontent1").html("");
    $("#backfromPeople1").val(email);
    $("#backreceivePeople1").html('<span class="addHighLight lrpadding8 margin8">' + send_person + '</span>');
    $("#backsubject1").val("回复：" + $("#read_subject").html());

    //邮件内容
    //$("#backread_subject").html($("#read_subject").html());
    $("#backread_mailfrom").html(send_person);
    $("#backread_time").html($("#read_time").html());
    $("#backread_to").html($("#read_to").html());
    $("#backattch").html($("#attch").html());
    $("#backread_content").html($("#read_content").html())
    $("#backread_subject").html($("#read_subject").html())

    A.Controller.section('#backLetter_section');
}

function backMail() {
    var subject = $("#backsubject1").val();
    var content = $("#backcontent1").parent().html();
    var toEmail = $("#backreceivePeople1").html();
    if (toEmail == null || toEmail == undefined || toEmail == "") {
        A.showToast("收件人不能为空");
        return;
    }
    //判断有没有格式不正确的
    if ($("#backreceivePeople1 .chooseError").length > 0 || $("#backreceivePeople1 .chooseErrorAndChooseAddress").length > 0) {
        A.showToast("收件人邮箱格式不正确");
        return;
    }
    if (subject == null || subject == undefined || subject == "") {
        A.showToast("主题不能为空");
        return;
    }
    if (content == null || content == undefined) {
        content = "";
        return;
    }
    toEmail = getToEmail("backreceivePeople1");
    // var otheremail = [];
    //if(toEmail.indexOf(",")!=-1){
    // var checkedemails = toEmail.split(",");
    // for (var i in checkedemails) {
    //     var recei = {
    //         email: checkedemails[i],
    //         name: checkedemails[i]
    //     };
    //     // recei.email = checkedemails[i];
    //     // recei.name = checkedemails[i];
    //     otheremail.push(recei);
    // }
    //}
    var json = {
        // receivers: JSON.stringify(otheremail),
        type: "sent",
        content: content,
        subject: subject,
        sendEmail: email,
        sendName: Util.getItem('userFullName'),
        sendPassword: email_password,
        ticket: Util.getItem('ticket'),
        sysid: Util.getItem('sysid'),
        orgid: Util.getItem('orgid'),
        uuid: Util.getItem('uuid'),
        toEmail: toEmail
    };
    getDataByAjax({
        url: base + 'Cmail/sendEmail',//http://192.168.81.36:8086/oa
        data: json,
        // dataType: "json",
        // cache: false,
        // contentType: 'application/json;charset=utf-8', //设置请求头信息
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data != null && $.trim(data.status) == "Success") {
            A.showToast('发送成功');
            isrefresh = true;
            backMailDetail();
        } else {
            showConsole("发送失败的原因：" + data.description);
            A.showToast('发送失败');
        }
    }, {isShow: true, loadingMsg:'请稍后...'});
}

//显示收件箱邮件的回复功能
function showcallback() {
    $("#callbackid").css('visibility', 'visible');
}

//隐藏收件箱邮件的回复功能
function hidecallback() {
    $("#callbackid").css('visibility', 'hidden');
}

function backMailDetail() {
    A.Controller.section('mailDetail_section.html?mailuid=' + mailuid + '&time=' + time + '&sj_email=' + sj_email );
}

$(document).on(A.options.clickEvent,'#writeToSave',function(){
    writeSaveDraft(draft_flag);
})


//写邮件保存到草稿箱
function writeSaveDraft(flag) {
    var subject = $("#subject").val();
    var content = $("#content").val();
    var toEmail = $("#receivePeople").html();
    toEmail = getToEmail("receivePeople");
    if(toEmail=="-1"){
        A.showToast("邮箱地址格式不正确");
        return ;
    }
    // var otheremail = [];
    // if (toEmail == null || toEmail == undefined || toEmail == "") {
    //     toEmail = "";
    //
    // } else {
    //     var checkedemails = toEmail.split(",");
    //     for (var i in checkedemails) {
    //         var recei = {
    //             email: checkedemails[i],
    //             name: checkedemails[i]
    //         };
    //         otheremail.push(recei);
    //     }
    // }
    if (subject == null || subject == undefined || subject == "") {
        subject = "";
    }
    if (content == null || content == undefined) {
        content = "";
    }
    if (toEmail == null || toEmail == undefined) {
        toEmail = "";
    }
    var json = {
        type: "draft",
        content: content,
        subject: subject,
        sendEmail: email,
        sendName: Util.getItem('userFullName'),
        sendPassword: email_password,
        ticket: Util.getItem('ticket'),
        sysid: Util.getItem('sysid'),
        orgid: Util.getItem('orgid'),
        uuid: uuid,
        toEmail: toEmail
    };
    if(flag){
        getDataByAjax({
            //url: base + 'Cmail/delmail',
            url: base + 'javamail/delete',
            // url:'http://192.168.81.:8080/oa/Cmail/delmail',
            data: {
                uid: Util.getItem('email'),
                password: email_password,//Util.getItem('password'),
                ids: mailuid,
                uuid: Util.getItem('uuid'),
                ticket: Util.getItem('ticket'),
                type: type
            },
            async:true
        }, function (data) {
            getDataByAjax({
                url: base + 'Cmail/sendEmail',//http://192.168.81.36:8086/oa
                //url: 'http://192.168.81.6:8080/oa/Cmail/sendEmailMulti',//
                data: json,
                // dataType: "json",
                // cache: false,
                // contentType: 'application/json;charset=utf-8', //设置请求头信息
                async:true
            }, function (data) {
                Util.redirectLogin(data.result);
                if (data != null && $.trim(data.status) == "Success") {
                    A.showToast('保存成功');
                    A.Controller.back();
                } else {
                    showConsole("保存失败的原因：" + data.description);
                    A.showToast('保存失败');
                }
            }, {isShow: true, loadingMsg:'请稍后...'});
        }, {isShow: false});
    }else{
        getDataByAjax({
            url: base + 'Cmail/sendEmail',//http://192.168.81.36:8086/oa
            //url: 'http://192.168.81.6:8080/oa/Cmail/sendEmailMulti',//
            data: json,
            // dataType: "json",
            // cache: false,
            // contentType: 'application/json;charset=utf-8', //设置请求头信息
            async:true,
        }, function (data) {
            Util.redirectLogin(data.result);
            if (data != null && $.trim(data.status) == "Success") {
                A.showToast('保存成功');
                A.Controller.back();
            } else {
                showConsole("保存失败的原因：" + data.description);
                A.showToast('保存失败');
            }
        }, {isShow: true, loadingMsg:'请稍后...'});
    }
}

//回复邮件保存到草稿箱
function backSaveDraft() {
    showConsole("保存到草稿箱");
    var subject = $("#backsubject1").val();//.replace("回复：","")
    var content = $("#backcontent1").parent().html();
    var toEmail = $("#backreceivePeople1").html();
    toEmail = getToEmail("backreceivePeople1");
    // var otheremail = [];
    // if (toEmail == null || toEmail == undefined || toEmail == "") {
    //     toEmail = "";
    // } else {
    //     var checkedemails = toEmail.split(",");
    //     for (var i in checkedemails) {
    //         var recei = {
    //             email: checkedemails[i],
    //             name: checkedemails[i]
    //         };
    //         otheremail.push(recei);
    //     }
    //
    // }

    if (subject == null || subject == undefined || subject == "") {
        subject = "";
    }
    if (content == null || content == undefined) {
        content = "";
    }
    if (toEmail == null || toEmail == undefined) {
        toEmail = "";
    }
    var json = {
        type: "draft",
        content: content,
        subject: subject,
        sendEmail: email,
        sendName: Util.getItem('userFullName'),
        sendPassword: email_password,
        ticket: Util.getItem('ticket'),
        sysid: Util.getItem('sysid'),
        orgid: Util.getItem('orgid'),
        uuid: uuid,
        toEmail: toEmail
    };
    getDataByAjax({
        url: base + 'Cmail/sendEmail',//http://192.168.81.36:8086/oa
        // url: 'http://192.168.81.6:8080/oa/Cmail/sendEmailMulti',//
        data: json,
        // dataType: "json",
        // cache: false,
        // contentType: 'application/json;charset=utf-8', //设置请求头信息
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data != null && $.trim(data.status) == "Success") {
            A.showToast('保存成功');
            A.Controller.back();
        } else {
            showConsole("保存失败的原因：" + data.description);
            A.showToast('保存失败');
        }
    }, {isShow: true, loadingMsg:'请稍后...'});
}


function swipeleftDel() {
    // 设定每一行的宽度=屏幕宽度+按钮宽度
    // $(".box_list").width($(".outdiv").width() + $(".outbtn").width());
    // 获取所有行，对每一行设置监听
    var lines = $(".box_list");
    var len = lines.length;
    var lastX, lastXForMobile;

    // 用于记录被按下的对象
    var pressedObj;  // 当前左滑的对象
    var lastLeftObj; // 上一个左滑的对象

    // 用于记录按下的点
    var start;

    // 网页在移动端运行时的监听
    for (var i = 0; i < len; ++i) {
        lines[i].addEventListener('touchstart', function (e) {
            showConsole('touchstart');
            lastXForMobile = e.changedTouches[0].pageX;
            pressedObj = this; // 记录被按下的对象

            // 记录开始按下时的点
            var touches = event.touches[0];
            start = {
                x: touches.pageX, // 横坐标
                y: touches.pageY  // 纵坐标
            };
        });

        lines[i].addEventListener('touchmove', function (e) {
            showConsole('touchmove');
            // 计算划动过程中x和y的变化量
            var touches = event.touches[0];
            delta = {
                x: touches.pageX - start.x,
                y: touches.pageY - start.y
            };

            // 横向位移大于纵向位移，阻止纵向滚动
            if (Math.abs(delta.x) > Math.abs(delta.y)) {
                event.preventDefault();
            }
        });

        lines[i].addEventListener('touchend', function (e) {
            showConsole('touchend');
            if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
                $(lastLeftObj).animate({marginLeft: "0"}, 500); // 右滑
                lastLeftObj = null; // 清空上一个左滑的对象
            }
            var diffX = e.changedTouches[0].pageX - lastXForMobile;
            if (diffX < -150) {
                $(pressedObj).animate({marginLeft: "-132px"}, 500); // 左滑
                lastLeftObj && lastLeftObj != pressedObj &&
                $(lastLeftObj).animate({marginLeft: "0"}, 500); // 已经左滑状态的按钮右滑
                lastLeftObj = pressedObj; // 记录上一个左滑的对象
            } else if (diffX > 150) {
                if (pressedObj == lastLeftObj) {
                    $(pressedObj).animate({marginLeft: "0"}, 500); // 右滑
                    lastLeftObj = null; // 清空上一个左滑的对象
                }
            }
        });
    }

    // 网页在PC浏览器中运行时的监听
    // for (var i = 0; i < len; ++i) {
    //     $(lines[i]).bind('mousedown', function(e){
    //         lastX = e.clientX;
    //         pressedObj = this; // 记录被按下的对象
    //     });
    //
    //     $(lines[i]).bind('mouseup', function(e){
    //         if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
    //             $(lastLeftObj).animate({marginLeft:"0"}, 500); // 右滑
    //             lastLeftObj = null; // 清空上一个左滑的对象
    //         }
    //         var diffX = e.clientX - lastX;
    //         if (diffX < -150) {
    //             $(pressedObj).animate({marginLeft:"-132px"}, 500); // 左滑
    //             lastLeftObj && lastLeftObj != pressedObj &&
    //             $(lastLeftObj).animate({marginLeft:"0"}, 500); // 已经左滑状态的按钮右滑
    //             lastLeftObj = pressedObj; // 记录上一个左滑的对象
    //         } else if (diffX > 150) {
    //             if (pressedObj == lastLeftObj) {
    //                 $(pressedObj).animate({marginLeft:"0"}, 500); // 右滑
    //                 lastLeftObj = null; // 清空上一个左滑的对象
    //             }
    //         }
    //     });
    // }
}

// swipeleftDel();
function delMail(mailId, _$this) {
    A.confirm('提示', '确定删除该邮件吗?',
        function () {
            getDataByAjax({
                //url: base + 'Cmail/delmail',
                url: base + 'javamail/delete',
                // url:'http://192.168.81.:8080/oa/Cmail/delmail',
                data: {
                    uid: Util.getItem('email'),
                    password: email_password,//Util.getItem('password'),
                    ids: mailId,
                    uuid: Util.getItem('uuid'),
                    ticket: Util.getItem('ticket'),
                    type: type
                }
            }, function (data) {
                Util.redirectLogin(data.result);
                if (data.status == 'success') {
                    _$this.remove();
                    $('#' + mailId).remove();
                    $('#line_'+mailId).remove();
                    A.showToast('删除成功');
                    if (type == "inbox") {
                        A.Refresh('#sj_outBox');
                        scroll1.refresh();
                    } else if (type == "trash") {
                        A.Refresh('#lj_outBox');
                        scroll3.refresh();
                    } else if (type == "draft") {
                        A.Refresh('#cg_outBox');
                        scroll4.refresh();
                    } else if (type == "sent") {
                        A.Refresh('#fs_outBox');
                        scroll2.refresh();
                    }

                } else {
                    A.showToast('删除失败');
                }

            })
        },
        function () {
        });
    return false;
}

// $(document).on('swipeleft','.outdiv',function(){
//     showConsole('左滑动');
//     $('.outdiv').css('left','0px');
//     $(this).on('touchstart', function(){
//         // event.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
//         var touch = event.targetTouches[0];
//         startX = touch.pageX;
//         startY = touch.pageY;
//         // $(this).css('left',postion +'px');
//     });
//     $(this).on('touchmove', function(){
//         var touch = event.targetTouches[0];
//         endX = touch.pageX;
//         endY = touch.pageY;
//         if(startX == 0){
//             postion = $(window).width() - endX;
//         }else{
//             postion = startX - endX;
//         }
//         showConsole(postion);
//
//         // showConsole(postion);
//         if(postion < 0){
//             $(this).css('left','0px');
//         }else{
//             $(this).css('left','-' + postion +'px');
//         }
//
//     });
//     $(this).on('touchend', function(event){
//         if(postion >= 80){
//             $(this).animate({left:'-' +80},100);
//         }else{
//             $(this).css('left','0px');
//         }
//     });
// })

//$('#element').getCurPos();

function initRightBtn() {
    var ulExList = A.ExList.liController('.wrap_li', {
        swipeOptionOnTap: function (liElement, targetElement) {
            var _$this = $(liElement);
            delMail(_$this.attr('id'), _$this);
            ;
        }
    });
    ulExList.hideLeft();
    return ulExList;
}

function clearBox(){
    getDataByAjax({
        //url: base + 'Cmail/delmail',
        url: base + 'javamail/deleteAll',
        // url:'http://192.168.81.:8080/oa/Cmail/delmail',
        data: {
            uid: Util.getItem('email'),
            password: email_password,//Util.getItem('password'),
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket'),
            type: "1",
            one:"1"
        }
    }, function (data) {
        showConsole('deleteAll mails');
    })
}

function dealMailTo(mailto){
    var obj = JSON.parse(decodeURI(mailto));// mailto;//JSON.parse(mailto);
    var htmltemp = "";
    if(obj.to.length > 0){
        for (var i = 0; i < obj.to.length; i++) {
            var temp = obj.to[i];
            // if(temp.indexOf(' &lt;') != -1){
            //     var tempMailTo = temp.substring(0,temp.indexOf(' &lt;'));
            // }else{
            //     var tempMailTo = temp.substring(0,temp.indexOf('&lt;'));
            // }
            htmltemp += '<span class=\"addHighLight lrpadding8\" style="margin: 0px 5px 5px 0px;">' + temp + '</span>';
        }
    }
    return htmltemp;
}
