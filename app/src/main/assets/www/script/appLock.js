
$('#setlock_section').on('sectionshow', function(){
    var params = Util.queryString('stepType');
    if(params == 'no' || params == 'toIndex'){
        $('#setlock_section header').remove();
        $('#setlock_section').prepend('<div style="height:44px;font-size: 17px;padding-top: 15px;line-height: 44px;font-weight: bold;" class="full-width text-center bg-white">手势解锁</div>');
        $('#setlock_article').removeClass('det-backcolor').addClass('bg-white');
        $('#forgetDiv').removeClass('det-backcolor').addClass('bgTransparent');
        // $('#setlock_section').addClass('bgImgLock');
        $('#backbtn').css('visibility','hidden');
    }else{
        initBackKeyDown();
    }
    _H5lockObj = new H5lock({
        chooseType: 3,
        stepType:params
    }).init();
});

function forgetPwd(){
    getDataByAjax({
        // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
        url: base + 'applicationLock/update',
        data: {
            uuid: Util.getItem('uuid'),
            ticket: Util.getItem('ticket'),
            userId: Util.getItem('userid'),
            applicationLock: '',
            isOpenLock: '0',
            errorCount:'2'
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        if(data.status == '2'){
            window.location.href = 'login.html?type=loginout';
        }
    }, {isShow: false})

}

//返回
function initBackKeyDown() {
    document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
    document.removeEventListener("backbutton", exitApp, false); // 注销返回键
    document.removeEventListener("backbutton", back, false);//绑定首页
    document.addEventListener("backbutton", function(){window.location.href = 'appLockStatus.html'}, false);//绑定返回上页事件
}