/**
 * Created by sky on 2017/7/3.
 */
$(function () {
    $('.tabbar-footer .tab').click(function (e) {
        $('.tabbar-footer .tab').each(function (i, item) {
            $(item).removeClass('active');
        });
        $(this).addClass('active');
    });
})


/*返回*/
function back() {
    A.Controller.back();
}

document.addEventListener("deviceready", onDeviceReady, false);
//应用锁
if (APP_LOCK_STATUS) {
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);
}

//切换到后台时
function onPause() {
    Util.setItem('offTime', new Date().getTime());
    // A.alert(window.location);
    var currentLocation = window.location.href;
    var stepLocation = '';
    var index = currentLocation.lastIndexOf("/");
    var end = currentLocation.indexOf("#");
    var and = currentLocation.indexOf("&type");
    var other = currentLocation.indexOf("?type");
    if(and != -1){
        stepLocation = currentLocation.substring(index + 1, and);
    }else{
        stepLocation = currentLocation.substring(index + 1, end);
    }
    if(other != -1){
        stepLocation = currentLocation.substring(index + 1, other);
    }
    if(Util.getItem('stepLocation')){
        if(stepLocation.indexOf('finger.html') < 0 && stepLocation.indexOf('confirmPwd.html') < 0 && stepLocation.indexOf('appLock') < 0){
            if(stepLocation.indexOf('toDoList.html') != -1 ||
                stepLocation.indexOf('toSignList.html') != -1 ||
                stepLocation.indexOf('express.html') != -1 ||
                stepLocation.indexOf('alreadyDoList.html') != -1 ||
                stepLocation.indexOf('alreadySignList.html') != -1 ||
                stepLocation.indexOf('alreadyExpress.html') != -1 ||
                stepLocation.indexOf('infopublish.html') != -1 ||
                stepLocation.indexOf('Read') != -1
            ){
                if(stepLocation.indexOf('?') != -1){
                    stepLocation = stepLocation + '&type=' + Util.getItem('pageType');
                }else{
                    stepLocation = stepLocation + '?type=' + Util.getItem('pageType');
                }
            }
            if(stepLocation.indexOf('detail') != -1 || stepLocation.indexOf('Detail') != -1){
                if(stepLocation.indexOf('?') != -1){
                    stepLocation = stepLocation + '&listType=' + Util.getItem('pageType');
                }else{
                    stepLocation = stepLocation + '?listType=' + Util.getItem('pageType');
                }
            }
            Util.setItem('stepLocation', stepLocation);
        }
    }else{
        Util.setItem('stepLocation', 'index.html');
    }
}
//后台唤起
function onResume() {
   var stepLocation = Util.getItem('stepLocation');
    //Util.setItem('stepLocation', stepLocation);

    var aline = new Date().getTime() - Util.getItem('offTime');
    if (aline / 1000 > 15
    ) {
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
            var isLock = data.isOpenLock;
            var appLockPwd = data.applicationLock;
            var fingerLock = data.isOpenFingerprintLock;

            if (appLockPwd && isLock == '1') {
                Util.setItem('handspwd', appLockPwd);
                if(stepLocation.indexOf('Read') != -1 || stepLocation.indexOf('detail') != -1){

                }else{
                    window.open('appLock.html?stepType=no');
                }
                // window.location.href = 'appLock.html?stepType=no';
            } else if (fingerLock == '1') {
                // window.location.href = 'finger.html';
                if(stepLocation.indexOf('Read') != -1 ||
                    stepLocation.indexOf('detail') != -1 ||
                    stepLocation.indexOf('Sign') != -1 ||
                    stepLocation.indexOf('Detail') != -1 ||
                    stepLocation.indexOf('sign') != -1
                ){

                }else{
                    window.open('finger.html');
                }
            }
        }, {isShow: false})
    }

}

function onDeviceReady() {
    //navigator.splashscreen.hide();
    document.addEventListener("backbutton", onBackKeyDown, false);
    //alert( device.model +"----"+device.cordova +"------"+ device.uuid +"-----"+device.version);
}

function onBackKeyDown() {
    //清空toast框
    A.clearToast();
    var currentLocationHref = window.location.href;//192.168.0.119:8081/oa/oa/html/readPdf/viewer.html;
    // console.log(currentLocationHref);
    A.showToast('再点击一次退出', 1000);
    document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
    document.addEventListener("backbutton", exitApp, false);//绑定退出事件
    // 3秒后重新注册
    var intervalID = window.setInterval(function () {
        window.clearInterval(intervalID);
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.addEventListener("backbutton", onBackKeyDown, false); // 返回键
    }, 3000);
}

function exitApp(type,target) {
    if(type == 'update'){
        cordova.plugins.fileOpener2.open(
            target,
            'application/vnd.android.package-archive'
        );
    }
    navigator.app.exitApp();
}

//加密成功
function encryptSuccessCallback(result) {
    //console.log("successCallback(): " + JSON.stringify(result));
    if (result.withFingerprint) {
        // console.log("验证成功!");
        // console.log("Encrypted credentials: " + result.token);
        var locate = Util.getItem('stepLocation');
        if(locate.indexOf('calendar') != -1 || locate.indexOf('deptList') != -1){
            A.Controller.back();
        }else{
            window.location.href = locate;
        }
    } else if (result.withBackup) {
        console.log("Authenticated with backup password");
    }
}

//加密失败
function encryptErrorCallback(error) {
    if (error === FingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
        console.log("FingerprintAuth Dialog Cancelled!");
    } else {
        console.log("FingerprintAuth Error: " + error);
    }
}
