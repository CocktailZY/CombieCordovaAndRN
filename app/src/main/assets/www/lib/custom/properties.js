//var base = "http://192.168.81.24:8080/oa/";//卢跃文ip
// var base = "http://222.143.52.59:8088/mobile-oa/";
//var base = "http://192.168.81.6:8083/oa/";
// var base = "http://192.168.81.15:8083/oa/";
// var base = "http://192.168.80.142:8088/mobile-oa/";
// var base = "http://web.sxzkzy.com:18888/mobile-oa/";
// var base = "http://192.168.81.12:8080/oa/";
var base = "http://192.168.80.142:8089/mobile-oa/";
// var base = "http://192.168.81.17:8080/oa/";
// var base = "http://192.168.81.36:8091/mobile-oa/";
// var base = "http://192.168.81.17:8080/oa/";
/*var readPdfBase = ""*/
// var uuid = 'e39f959369a70011';//测试手机的uuid
var showCount = 10;
var hideMaskTimer = 5000;
var showloadingTimer = 1000;
// var email_password='123abc';
var APP_LOCK_STATUS = true;//是否开启应用锁
var CHANGE_DEPT_STATUS = false;//是否开启切换部门
var FINGER_LOCK_STATUS = false;//是否开启指纹锁测试
var MAIL_STATUS = true;//是否开启邮件
var WORKRING_STATUS = true;//是否开启工作圈
var localFileName = 'local.txt';
var pushTitle = '全流程政务协同平台';
var pushDbContent = '您有一条新的待办';
var pushDsContent = '您有一条新的待签';

//var workRingBase = "http://web.sxzkzy.com:18081/";
//var workRingImgBase = "http://web.sxzkzy.com:18081";

//var fileUpload = workRingImgBase + '/resource/information/dynamic/uploadFileApi';

//var readHeadImg ="http://172.30.41.41:8082/ucenter/download/readImage?filename=";
var updatePwdPath = base + "/MobileFlow/updateUserpwd";

var oaWorkRingBase = base;//"http://192.168.81.6:8080/oa/";var base = "http://192.168.81.36:8091/oa/";
var oaFileUpload = oaWorkRingBase+ 'buildingRing/uploadFile';
var oaWorkRingImgBase =oaWorkRingBase+"download/readURLImage?readUrl="+"http://172.30.41.44:8080";//http://web.sxzkzy.com:18081
var oaWorkRingHeadBase = oaWorkRingBase+"download/readURLImage?readUrl=http://172.30.41.41:8082/ucenter/download/readImage?filename=";
var settingHeadBase = oaWorkRingHeadBase;
// var settingHeadBase = oaWorkRingHeadBase + "http://192.168.80.142:8080/ucenter/download/readImage?filename=";


var chackUpdatePath = base + "promotion/newest?systemid=oa";
var downloadApkPath = base + "promotion/download?systemid=oa&version=";

//推送接口
var pushPath = base+'mobileEquipment/push';