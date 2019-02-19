$('#applock_section').on('sectionshow', function () {
    initBackKeyDown(2);
    //checkChooseStatus();
});
$('#confirmLoginPwd_section').on('sectionshow', function(){
    initBackKeyDown(1);
})
$('.backToSetting').on(A.options.clickEvent, function () {
    window.location.href = 'setting.html';
    return false;
});
$('.backAppLock').on(A.options.clickEvent, function () {
    A.Controller.section('#applock_section');
    return false;
});

/* 点击事件监听 start */
//点击关闭密码
$('#closeAppLock').on(A.options.clickEvent, function () {
    if ($('#closeAppLock .float-right').css('display') == 'block') {
        //do nothing
    } else {
        window.location.href = 'confirmPwd.html?type=close';
    }
    return false;
});
//点击指纹锁
$('#fingerPwd').on(A.options.clickEvent, function () {
    if ($('#fingerPwd .float-right').css('display') == 'block') {
        //do nothing
    } else {
        FingerprintAuth.isAvailable(isAvailableSuccess, isAvailableError);
    }
    return false;
})
//点击手势密码
$('#handsPwd').on(A.options.clickEvent, function () {
    if ($('#handsPwd .float-right').css('display') == 'block') {
        //do nothing
    } else {
        window.location.href = 'confirmPwd.html?type=create';
    }
    return false;
});
//点击修改手势密码
$('#updateAppLock').on(A.options.clickEvent, function () {
    window.location.href = 'appLock.html?stepType=update';
    return false;
});
//点击确认登录密码
// $('#submitLoginPwd').on(A.options.clickEvent, function () {
//     getDataByAjax({
//         // url: 'http://192.168.81.36:8091/oa/applicationLock/check',
//         url: base + 'applicationLock/check',
//         data: {
//             uuid: Util.getItem('uuid'),
//             ticket: Util.getItem('ticket'),
//             userId: Util.getItem('userid'),
//             userName: Util.getItem('username'),
//             passWord: hex_md5($('input[name="loginpassword"]').val())
//         },
//     }, function (data) {
//         Util.redirectLogin(data.result);
//         if (data.status == '1') {
//             if (type == 'close') {
//                 getDataByAjax({
//                     // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
//                     url: base + 'fingerprint/update',
//                     data: {
//                         uuid: Util.getItem('uuid'),
//                         ticket: Util.getItem('ticket'),
//                         userId: Util.getItem('userid'),
//                         isOpenFingerprintLock: '0'
//                     },
//                 }, function (data) {
//                     Util.redirectLogin(data.result);
//                     if (data.status == '2') {
//                         $('#updateAppLock').hide();
//                         $('#fingerPwd .float-right').hide();
//                         $('#handsPwd .float-right').hide();
//                         $('#closeAppLock .float-right').show();
//                         A.showToast('关闭成功');
//                         Util.setItem('isLock','0');
//                         Util.setItem('fingerLock','0');
//                         A.Controller.section('#applock_section');
//                     }
//                 }, {isShow: false})
//             } else if (type == 'create') {
//                 Util.removeItem('passwordxx');
//                 window.location.href = 'appLock.html?stepType=create';
//             } else if (type == 'finger') {
//                 getDataByAjax({
//                     // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
//                     url: base + 'fingerprint/update',
//                     data: {
//                         uuid: Util.getItem('uuid'),
//                         ticket: Util.getItem('ticket'),
//                         userId: Util.getItem('userid'),
//                         isOpenFingerprintLock: '1'
//                     },
//                 }, function (data) {
//                     Util.redirectLogin(data.result);
//                     if (data.status == '2') {
//                         $('#updateAppLock').hide();
//                         $('#fingerPwd .float-right').show();
//                         $('#handsPwd .float-right').hide();
//                         $('#closeAppLock .float-right').hide();
//                         A.showToast('开启指纹锁成功');
//                         Util.setItem('isLock','0');
//                         Util.setItem('fingerLock','1');
//                         A.Controller.section('#applock_section');
//                     }
//                 }, {isShow: false})
//             }
//         } else {
//             A.alert(data.msg);
//             $('input[name="loginpassword"]').val('');
//         }
//     })
//     return false;
// });
/* end */

/* 指纹锁判断回调 */
/**
 * @return {
 *      isAvailable:boolean,
 *      isHardwareDetected:boolean,
 *      hasEnrolledFingerprints:boolean
 *   }
 */
function isAvailableSuccess(result) {//设备支持指纹锁
    showConsole("FingerprintAuth available: " + JSON.stringify(result));
    if (result.isAvailable) {
        window.location.href = 'confirmPwd.html?type=finger';
    }else if(!result.hasEnrolledFingerprints){
        A.alert("您没有开启指纹功能，请到系统设置中设置!");
    }
}

function isAvailableError(message) {//设备不支持指纹锁
    console.log("isAvailableError(): " + message);
}

/* end */
/* 判断选中密码 */
function checkChooseStatus(){
    if (isLock == '0' && fingerLock == '0' && (!appLockPwd || appLockPwd == '')) {
        //未设置
        $('#updateAppLock').hide();
        $('#fingerPwd .float-right').hide();
        $('#handsPwd .float-right').hide();
        $('#closeAppLock .float-right').show();
        $('#closeAppLock').hide();
    }else if (isLock == '0' && fingerLock == '0' && appLockPwd && appLockPwd != '') {
        //未开启
        $('#updateAppLock').hide();
        $('#fingerPwd .float-right').hide();
        $('#handsPwd .float-right').hide();
        $('#closeAppLock .float-right').show();
        $('#closeAppLock').hide();
    }else if (isLock == '1' && fingerLock == '0') {
        //已开启手势密码
        $('#updateAppLock').show();
        $('#fingerPwd .float-right').hide();
        $('#handsPwd .float-right').show();
        $('#closeAppLock .float-right').hide();
        $('#closeAppLock').show();
    }else if(isLock == '0' && fingerLock == '1'){
        //已开启指纹锁
        $('#fingerPwd .float-right').show();
        $('#handsPwd .float-right').hide();
        $('#closeAppLock .float-right').hide();
        $('#closeAppLock').show();
    }
}
/* end */

//返回
function initBackKeyDown(type) {
    if (type == 1) {
        showConsole("绑定返回上页事件:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false);//绑定首页
        document.addEventListener("backbutton", backtoAppLock, false);//绑定返回上页事件
    } else {
        showConsole("绑定原始返回键:" + type);
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", backtoAppLock, false); // 注销返回上页事件
        document.removeEventListener("backbutton", back, false); // 注销返回键
        document.addEventListener("backbutton", cback, false);//返回设置页
    }
}

function backtoAppLock(){
    A.Controller.section('#applock_section');
}

function cback() {
    window.location.href = 'setting.html';
}