var isClearText = false;//密码是否不加密 默认需要加密
var isLock = false;//是否开启应用锁 默认不开启
var appLockPwd = '';//应用锁密码
var fingerLock = false;//是否开启
var _H5lockObj;
var type;//标识关闭还是创建
$(document).on("focus", "[name='reconfirm']", function () {
    $('#changePwd_article').removeClass("has-header");
    $('#changePwd_article').css('top', '20px !important');
});
$(document).on("blur", "[name='reconfirm']", function () {
    $('#changePwd_article').addClass("has-header");
});
//监听新密码强度
$(document).on("input", "#newpwd", function () {
    var password = $("[name='password']").val();
    var regExp1 = /^(?:\d+|[a-zA-Z]+|[_]+)$/;//弱：纯数字，纯字母，纯特殊字符!@#$%^&?*
    var regExp2 = /(?:\d.*_)|(?:_.*\d)|(?:[A-Za-z].*_)|(?:_.*[A-Za-z])|(?:[A-Za-z].*\d)|(?:\d.*[A-Za-z])/;//中：字母+数字，字母+特殊字符，数字+特殊字符
    var regExp3 = /[a-zA-z]+[0-9]+_|[0-9]+[a-zA-z]+_|_+[0-9]+[a-zA-z]/;//强：字母+数字+特殊字符
    var regExp4 = /((?=[\x21-\x7e]+)[^A-Za-z0-9_])/;

    if(password.length > 0){
        $('#level_1').removeClass("mt7");
        $('#level_2').removeClass("mt7");
        $('#level_3').removeClass("mt7");
        $('#level_1').removeClass("mt6");
        $('#level_2').removeClass("mt6");
        $('#level_3').removeClass("mt6");
        $('#level_1').css("background-color", "#fff");
        $('#level_2').css("background-color", "#fff");
        $('#level_3').css("background-color", "#fff");
        $('#level_lable').empty().css('font-size','15px');
        if(password.length >= 6){
            if (regExp1.test(password) && !regExp4.test(password)) {
                $('#level_1').removeClass("mt7");
                $('#level_2').removeClass("mt7");
                $('#level_3').removeClass("mt7");
                $('#level_1').removeClass("mt6");
                $('#level_2').removeClass("mt6");
                $('#level_3').removeClass("mt6");
                $('#level_1').addClass("mt7");
                $('#level_2').addClass("mt7");
                $('#level_3').addClass("mt7");
                $('#level_1').css("background-color", "#08cc3a");
                $('#level_2').css("background-color", "#fff");
                $('#level_3').css("background-color", "#fff");
                $('#level_lable').empty().html("低").css('font-size','15px');
            }
            if (regExp2.test(password) && !regExp4.test(password)) {
                $('#level_1').removeClass("mt7");
                $('#level_2').removeClass("mt7");
                $('#level_3').removeClass("mt7");
                $('#level_1').removeClass("mt6");
                $('#level_2').removeClass("mt6");
                $('#level_3').removeClass("mt6");
                $('#level_1').addClass("mt7");
                $('#level_2').addClass("mt7");
                $('#level_3').addClass("mt7");
                $('#level_1').css("background-color", "#08cc3a");
                $('#level_2').css("background-color", "#ff6f36");
                $('#level_3').css("background-color", "#fff");
                $('#level_lable').empty().html("中").css('font-size','15px');
            }
            if (regExp3.test(password) && !regExp4.test(password)) {
                $('#level_1').removeClass("mt7");
                $('#level_2').removeClass("mt7");
                $('#level_3').removeClass("mt7");
                $('#level_1').removeClass("mt6");
                $('#level_2').removeClass("mt6");
                $('#level_3').removeClass("mt6");
                $('#level_1').addClass("mt7");
                $('#level_2').addClass("mt7");
                $('#level_3').addClass("mt7");
                $('#level_1').css("background-color", "#08cc3a");
                $('#level_2').css("background-color", "#ff6f36");
                $('#level_3').css("background-color", "#ff3317");
                $('#level_lable').empty().html("强").css('font-size','15px');
            }
            if((!regExp1.test(password) && !regExp2.test(password) && !regExp3.test(password)) || regExp4.test(password)){
                $('#level_1').removeClass("mt7");
                $('#level_2').removeClass("mt7");
                $('#level_3').removeClass("mt7");
                $('#level_1').removeClass("mt6");
                $('#level_2').removeClass("mt6");
                $('#level_3').removeClass("mt6");
                $('#level_1').addClass("mt6");
                $('#level_2').addClass("mt6");
                $('#level_3').addClass("mt6");
                $('#level_lable').empty().html("密码格式不符").css('font-size','12px');
            }
            $('#level_lable').show();
        }else{
            $('#level_1').removeClass("mt7");
            $('#level_2').removeClass("mt7");
            $('#level_3').removeClass("mt7");
            $('#level_1').removeClass("mt6");
            $('#level_2').removeClass("mt6");
            $('#level_3').removeClass("mt6");
            $('#level_1').addClass("mt6");
            $('#level_2').addClass("mt6");
            $('#level_3').addClass("mt6");
            $('#level_lable').empty().html("密码至少6位").css('font-size','12px');
            $('#level_lable').show();
        }
    }else{
        $('#level_1').removeClass("mt7");
        $('#level_2').removeClass("mt7");
        $('#level_3').removeClass("mt7");
        $('#level_1').removeClass("mt6");
        $('#level_2').removeClass("mt6");
        $('#level_3').removeClass("mt6");
        $('#level_1').css("background-color", "#fff");
        $('#level_2').css("background-color", "#fff");
        $('#level_3').css("background-color", "#fff");
        $('#level_lable').empty().css('font-size','15px');
        $('#level_lable').hide();
    }

});
/* 框架监听方法 start */
$('#setting_section').on('sectionshow', function () {
    initBackKeyDown(2);
    if(WORKRING_STATUS){
        $('#workring_li1').show();
    }
    // var tabType = Util.queryString('type');
    // A.Controller.section('#' + tabType);
    isLock = Util.getItem('isLock');
    appLockPwd = Util.getItem('appLockPwd');
    fingerLock = Util.getItem('fingerLock');
    //获取应用锁状态
    getDataByAjax({
        // url: 'http://192.168.81.36:8091/oa/applicationLock/getModel',
        url: base + 'applicationLock/getModel',
        data: {
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket'),
            userId: Util.getItem('userid')
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        isLock = data.isOpenLock;
        appLockPwd = data.applicationLock;
        fingerLock = data.isOpenFingerprintLock;

        Util.setItem('isLock',isLock);
        Util.setItem('appLockPwd',appLockPwd);
        Util.setItem('fingerLock',fingerLock);

        if (isLock == '0' && fingerLock == '0' && (!appLockPwd || appLockPwd == '')) {
            //未设置
            $('#lockStatus').text('未设置');
        }else if (isLock == '0' && fingerLock == '0' && appLockPwd && appLockPwd != '') {
            //未开启
            $('#lockStatus').text('未开启');
        }else if (isLock == '1' || fingerLock == '1') {
            //已开启
            $('#lockStatus').text('已开启');
        }
    }, {isShow: true});
    // var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
    //$('#headimg').empty().html('<img id="headImg" src="./images/head.png" onload="loadImg(\''+settingHeadBase + Util.getItem("headImg") + ticket_uuid+'\',\'headImg\');" width=\"50\" height=\"50\">');

    // diskCacheSize(true);
});
//组装静态页面
$('#setting_article').on('articleload', function () {
    var ticket_uuid = "&ticket=" + Util.getItem('ticket') + "&uuid=" + Util.getItem('uuid');
    $('#headimg').empty().html('<img data-source=\"' + settingHeadBase + Util.getItem("headImg") + ticket_uuid + '\" width=\"50\" height=\"50\">');
    $('#set_username').empty().html(Util.getItem("userFullName"));
    $('#set_zhanghao').empty().html(Util.getItem("username"));
    var deptList = JSON.parse(Util.getItem('deptList'));
    var html = '';
    for (var i = 0; i < deptList.length; i++) {
        var item = deptList[i];
        if (i == deptList.length - 1) {
            html += '<div class="justify-content clearfix" id="' + item.deptid + '" onclick="changeDept(\'' + item.deptid + '\')">';
            html += '<div class="float-left">' + item.name + '</div>';
            if (item.deptid == Util.getItem('deptid')) {
                html += '<div class="float-right"><i class="icon-hook-fill size16 rightIcon"></i></div>'
            }
            html += '</div>';
        } else {
            html += '<div class="justify-content clearfix underLine" id="' + item.deptid + '" onclick="changeDept(\'' + item.deptid + '\')">';
            html += '<div class="float-left">' + item.name + '</div>';
            if (item.deptid == Util.getItem('deptid')) {
                html += '<div class="float-right"><i class="icon-hook-fill size16 rightIcon"></i></div>'
            }
            html += '</div>';
        }
    }
    $('#toDept').append(html);

});

$('#changePwd_section').on('sectionshow', function () {
    initBackKeyDown(1);
    if(WORKRING_STATUS){
        $('#workring_li2').show();
    }
    $('#yusername').val(Util.getItem("username"));
});

/* end */
/* 页面跳转 start */
$('#appLock').on(A.options.clickEvent, function () {
    window.location.href = 'appLockStatus.html';
    return false;
});

$('#appCache').on(A.options.clickEvent, function(){
    A.actionsheet([{
        text : '确定',
        handler : function(){
            clearDiskCache();
        }
    }]);
    return false;
});
/* end */
/* 内部方法 start */
//修改密码校验并提交
function checkForm() {
    var username = $("[name='username']").val();
    var oldpwd = $("[name='oldpassword']").val();
    var password = $("[name='password']").val();
    var reconfirm = $("[name='reconfirm']").val();

    var regExp = /(?:\d.*_)|(?:_.*\d)|(?:[A-Za-z].*_)|(?:_.*[A-Za-z])|(?:[A-Za-z].*\d)|(?:\d.*[A-Za-z])/;//其中两种

    if (username && oldpwd) {

        if (regExp.test(password)) {

            if (password.length >= 6) {

                if (password == reconfirm) {
                    password = isClearText ? password : hex_md5(password);
                    getDataByAjax({
                        url: updatePwdPath,
                        data: {
                            ticket: Util.getItem("ticket"),
                            uuid: Util.getItem('uuid'),
                            oldpwd: hex_md5(oldpwd),
                            password: password
                        }
                    }, function (data) {
                        Util.redirectLogin(data.result);
                        if (data == -1) {
                            A.showToast('旧密码不正确');
                        }
                        if (data == 0) {
                            A.showToast('该用户不存在');
                        }
                        if (data == 1) {
                            A.showToast('修改成功');
                            window.location.href = 'login.html?type=loginout';
                        }
                    }, {isShow: true})

                } else {
                    A.showToast('两次密码不一致');
                }
            } else {
                A.showToast('密码至少6位');
            }
        } else {
            A.showToast('新密码至少包含字母、数字、下划线中的两种');
        }
    } else {
        A.showToast('帐号或密码不可为空');
    }

}

//变更部门
function changeDept(id) {
    $('#toDept .float-right').remove();
    $('#' + id).append('<div class="float-right"><i class="icon-hook-fill size16 rightIcon"></i></div>');
    Util.setItem('deptid', id);

}

//返回
function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.addEventListener("backbutton", back, false);//绑定返回上页事件
    } else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回上页事件
        document.addEventListener("backbutton", cback, false);//绑定首页
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}



/* end */