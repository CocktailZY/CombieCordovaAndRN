var type;
$('#confirmLoginPwd_section').on('sectionshow', function () {
    initBackKeyDown();
    $('input[name="loginpassword"]').val('');
    var params = Util.queryString('type');
    type = params;
});

//点击确认登录密码
$('#submitLoginPwd').on(A.options.clickEvent, function () {
    getDataByAjax({
        // url: 'http://192.168.81.36:8091/oa/applicationLock/check',
        url: base + 'applicationLock/check',
        data: {
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket'),
            userId: Util.getItem('userid'),
            userName: Util.getItem('username'),
            passWord: hex_md5($('input[name="loginpassword"]').val())
        },
    }, function (data) {
        Util.redirectLogin(data.result);
        if (data.status == '1') {
            if (type == 'close') {
                getDataByAjax({
                    // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
                    url: base + 'fingerprint/update',
                    data: {
                        uuid: Util.getItem('uuid'),
                        ticket: Util.getItem('ticket'),
                        userId: Util.getItem('userid'),
                        isOpenFingerprintLock: '0'
                    },
                }, function (data) {
                    Util.redirectLogin(data.result);
                    if (data.status == '2') {
                        A.showToast('关闭成功');
                        Util.setItem('isLock','0');
                        Util.setItem('fingerLock','0');
                        Util.removeItem('handspwd');
                        window.location.href = 'appLockStatus.html';
                    }
                }, {isShow: false})
            } else if (type == 'create') {
                Util.removeItem('passwordxx');
                window.location.href = 'appLock.html?stepType=create';
            } else if (type == 'finger') {
                getDataByAjax({
                    // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
                    url: base + 'fingerprint/update',
                    data: {
                        uuid: Util.getItem('uuid'),
                        ticket: Util.getItem('ticket'),
                        userId: Util.getItem('userid'),
                        isOpenFingerprintLock: '1'
                    },
                }, function (data) {
                    Util.redirectLogin(data.result);
                    if (data.status == '2') {
                        $('#updateAppLock').hide();
                        $('#fingerPwd .float-right').show();
                        $('#handsPwd .float-right').hide();
                        $('#closeAppLock .float-right').hide();
                        A.showToast('开启指纹锁成功');
                        Util.setItem('isLock','0');
                        Util.setItem('fingerLock','1');
                        window.location.href='appLockStatus.html';
                    }
                }, {isShow: false})
            }else if(type == 'other'){
                var locate = Util.getItem('stepLocation');
                if(locate.indexOf('calendar') != -1 || locate.indexOf('deptList') != -1){
                    A.Controller.back();
                }else{
                    window.location.href = locate;
                }
            }
        } else {
            A.alert(data.msg);
            $('input[name="loginpassword"]').val('');
        }
    })
    return false;
});


//返回
function initBackKeyDown() {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.addEventListener("backbutton", back, false);//绑定首页
}