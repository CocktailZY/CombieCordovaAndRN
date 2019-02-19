var signCache = Util.getItem('signCache');//是否提醒缓存清理
var sign = false;//缓存是否大于提醒值
var cacheSize = 1024*1024*50;
// $(function(){
//     //diskCacheSize(false);
// });
//获取缓存大小
function diskCacheSize(showCacheSize){
    signCache = Util.getItem('signCache');
    cordova.plugins.AppCache.diskCacheSize("",function(data){
        if(showCacheSize){
            $('#usedCache').text(getFlow($.parseJSON(data).data));
        }
        if($.parseJSON(data).data>cacheSize&&(signCache=="true")){
            A.confirm("提醒","缓存超过50K，建议立即清理",function(){
                clearDiskCache();
            },function(){
                signCache = "false";
                Util.setItem("signCache","false");
            });
        }
    },function(data){
        console.log(JSON.parse(data).data);
    });
}
//清理缓存
function clearDiskCache(){
    cordova.plugins.AppCache.clearDiskCache("",function(data){
        A.showToast("缓存已清理！");
    },function(data){
        A.showToast("缓存清理失败！");
    });
}
//加载图片
function loadImg(path,id){
    cordova.plugins.AppCache.loadImage(path,function(data){
        $('#'+id).attr('src',$.parseJSON(data).data).removeAttr('onload');
        console.log("loadImage1:"+new Date().getTime());
    }, function (data) {
        $('#'+id).attr('src',$.parseJSON(data).data).removeAttr('onload');
        console.log(data);
    });
}
//流量转换
function getFlow(flowVlueBytes){
    var flow = "";
    //如果赠送流量小于1MB.则显示为KB
    if(flowVlueBytes/1024 < 1024){
        flow = (Math.round(flowVlueBytes/1024) > 0 ? Math.round(flowVlueBytes/1024) : 0) + 'KB';
    }else if(flowVlueBytes/1024 >= 1024 && flowVlueBytes/1024/1024 < 1024){
        //如果赠送流量大于1MB且小于1    GB的则显示为MB
        flow = (Math.round(flowVlueBytes/1024/1024) > 0 ? Math.round(flowVlueBytes/1024/1024) : 0)+'MB';
    }else if(flowVlueBytes/1024/1024 >= 1024){
        //如果流量大于1Gb
        var gb_Flow = flowVlueBytes/1024/1024/1024;
        //toFixed(1);四舍五入保留一位小数
        flow = gb_Flow.toFixed(1)+'GB';
    }else{
        flow = "0KB";
    }
    return flow;
}