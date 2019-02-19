var route = ['所有部门;-1'];
var uuid, mark = false;
var chooseDeptId;
var deptId = "441";

Util.deviceReady(function () {
    // uuid = device.imei;
    uuid = device.uuid;
    // var tempcss = $('.tab.active i').attr('class');
    // var newcss = tempcss + '-fill';
    // $('.tab.active i').removeClass().addClass(newcss);
    //显示登录用户名
    $('#userFullNameText').text(Util.getItem('userFullName'));
    chooseDeptId = Util.getItem('deptid');
    //初始化路径
    initRoute();
    //初始化一级部门
    initDataDept(chooseDeptId);
    initBackKeyDown();
});
$(document).on('click', '#tree .treetitle', function (e) {
    // var $nextUl = $(this).next('ul');
    // //如果$nextUl存在 表名已经加载过数据
    // if($nextUl && $nextUl.length > 0){
    //   //则点击值控制显示和隐藏
    //   $nextUl.slideToggle('mormal');
    //   $(this).children('i.icon-arrowright').toggleClass('showdowm');
    // }else{
    //   $(this).children('i.icon-arrowright').addClass('showdowm');
    //   initZiDeptHtml($(this));
    // }
    // 在每个部门绑定点击事件
    getDeptsAndUsers($(this));

});
$('#chooseDeptList').on('change', function(){
    chooseDeptId = $(this).val();
    initRoute();
    initDataDept(chooseDeptId);
});


function initDataDept(deptid){
    var deptList = JSON.parse(Util.getItem('deptList'));
    if (deptList.length > 1) {
        //页面显示部门选择样式

        var html = '';
        for (var i = 0; i < deptList.length; i++) {
            if(deptList[i].deptid == deptid){
                html += '<option value="'+deptList[i].deptid+'" selected>'+deptList[i].name+'</option>';
            }else{
                html += '<option value="'+deptList[i].deptid+'">'+deptList[i].name+'</option>';
            }
        }
        $('#chooseDeptList').empty().html(html);
        $('#chooseDiv').show();

    }else{
        $('#chooseDiv').hide();
    }
    getDataByAjax({
        url: base + 'MobileFlow/selectFlowDept',
        // url:'http://192.168.81.17:8080/oa/MobileFlow/selectFlowDept',
        data: {
            type: '2',
            ticket: Util.getItem('ticket'),
            sysId: Util.getItem('sysid'),
            orgId: Util.getItem('orgid'),
            uuid: uuid,
            userdeptid: deptid
        }
    }, initDeptHtml, {isShow: false});
}
//跟据部ID查询子部门和部门人员列表
var deptName = "";

function getDeptsAndUsers($elem) {
    //获取页面的部门参数
    var dn = "";
    deptId = $elem.find("div[name='deptment']").attr("data-id");
    deptName = $elem.find("div[name='deptment']").html();
    var mark = true;
    for(var i = 0 ; i < route.length ; i++){
        var did = route[i].split(';');
        if(did[1] == deptId){
            mark = false;
        }
    }
    if(mark){
        dn += deptName;
        dn += ";";
        dn += deptId;
        //加载部门列表
        initZiDeptHtml(deptId);
        //加载人员列表
        getListByType(refreshList);
        //跟新路径 //添加到路径中的数组中
        route.push(dn);
        initRoute();
    }
}

//初始化路径
function initRoute() {
    var routeHtml = '';
    var n;
    if (route.length == 1) {
        var deptni = route[0] + "";
        var nid = deptni.split(";");
        routeHtml += '<a href ="#" class=\"color333\" onclick=\"initRouteWay(\'' + nid[1] + '\',\'' + deptni + '\')\">' + nid[0] + '</a>';
    } else {
        n = 2;
        for (var i = 0; i < route.length; i++) {
            // if(i == 0){
            var deptni = route[i] + "";
            var nid = deptni.split(";");
            if (i == 0) {
                routeHtml += '<a id="route_' + n + '" href ="#" onclick=\"initRouteWay(\'' + nid[1] + '\',\'' + deptni + '\')\">' + nid[0] + '<span class=\"lrpadding4\">/</span></a>';
                n++;
            } else if (i == (route.length - 1)) {
                routeHtml += '<a class=\"color333\" id="route_' + n + '" href="#" onclick=\"initRouteWay(\'' + nid[1] + '\',\'' + deptni + '\')\" >' + nid[0] + '</a>';
            } else {
                routeHtml += '<a id="route_' + n + '" href="#" onclick=\"initRouteWay(\'' + nid[1] + '\',\'' + deptni + '\')\">' + nid[0] + '<span class=\"lrpadding4\">/</span></a>';
                n++;
            }

        }


    }

    $('#routeWay').html(routeHtml);
    initBackKeyDown();
}

//初始化路径显示
function initRouteWay(id, deptni) {
    //刷新数据
    if (id != deptId && id != "-1") {
        //初始化当前部门部门下的数据
        initZiDeptHtml(id);
        deptId = id;
        //加载人员列表
        getListByType(refreshList);
    } else if (id == "-1") {
        //初始化一级部门
        getDataByAjax({
            url: base + 'MobileFlow/selectFlowDept',
            // url:'http://192.168.81.17:8080/oa/MobileFlow/selectFlowDept',
            data: {
                type: '2',
                ticket: Util.getItem('ticket'),
                sysId: Util.getItem('sysid'),
                orgId: Util.getItem('orgid'),
                uuid: uuid,
                userdeptid: Util.getItem('deptid')
            }
        }, initDeptHtml, {isShow: false});
        route = ['所有部门;-1'];
    }
//刷新路劲
    var j = 0;
    for (var i = 0; i < route.length; i++) {
        if (route[i] == deptni) {
            j = i;
        }

    }
    route.splice(j + 1, route.length - j - 1);
    initRoute();
}


//获取父部门
function initDeptHtml(data) {
    Util.redirectLogin(data.result);
    // var initDeptsHtml = '<ul style="display: block;">';
    var initDeptsHtml = '';
    if (data != null && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var firstName = item.name.charAt(0);
            if (firstName == '(' || firstName == '(') {
                firstName = item.name.charAt(1);
            }
            /*initDeptsHtml += '<li><div class="treetitle" data-id="'+item.id+'"><i class="treeicon icon-arrowright"></i>'
              +'<a class="icontitle events-none">'+item.name+'</a>'
              +'<small class="right middle icon icon-persons radiusround"  href="userList-section.html?id='+item.id+'&deptname='+item.name+'"  data-toggle="section"></small>'
              +'</div></li>';*/
            initDeptsHtml += "";
            if(item.id != '102785'){
                if (i == (data.length - 1)) {
                    initDeptsHtml += '<li class="treetitle">';
                    initDeptsHtml += '<div class="justify">';
                    initDeptsHtml += '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + firstName + '</div>';
                    initDeptsHtml += '</div>';
                    initDeptsHtml += '<div class="justify-content dept-parent-left"  data-id="' + item.id + '" name="deptment">' + item.name + '</div>';
                    initDeptsHtml += '<div class="justify dept-parent-right">';
                    initDeptsHtml += '<i class="icon icon-arrowright" style="color: #e5e5e2;"></i>';
                    initDeptsHtml += '</div>';
                    initDeptsHtml += '</li>';
                } else {
                    initDeptsHtml += '<li class="treetitle">';
                    initDeptsHtml += '<div class="justify">';
                    initDeptsHtml += '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + firstName + '</div>';
                    initDeptsHtml += '</div>';
                    initDeptsHtml += '<div class="justify-content dept-parent-line dept-parent-left"  data-id="' + item.id + '" name="deptment">' + item.name + '</div>';
                    initDeptsHtml += '<div class="justify dept-parent-line dept-parent-right">';
                    initDeptsHtml += '<i class="icon icon-arrowright" style="color: #e5e5e2;"></i>';
                    initDeptsHtml += '</div>';
                    initDeptsHtml += '</li>';
                }
            }
        }
    }
    // initDeptsHtml = initDeptsHtml + '</ul>';
    $('#userlistid').empty();
    $('#tree').empty().html(initDeptsHtml);
}

function initZiDeptHtml(deptId) {
    // var deptsHtml = '<ul style="display: block;">';
    getDataByAjax({
        url: base + 'MobileFlow/selectFlowDept',
        // url:'http://192.168.81.17:8080/oa/MobileFlow/selectFlowDept',
        data: {
            type: '2',
            id: deptId,
            // id:'',
            ticket: Util.getItem('ticket'),
            sysId: Util.getItem('sysid'),
            orgId: Util.getItem('orgid'),
            uuid: uuid,
            userdeptid: Util.getItem('deptid')
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        // $('#tree').empty();
        var deptsHtml = "";
        if (data != null && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var firstName = item.name.charAt(0);
                if (firstName == '(' || firstName == '(') {
                    firstName = item.name.charAt(1);
                }
                /*deptsHtml += '<li><div class="treetitle" data-id="'+item.id+'"><i class="treeicon icon-arrowright"></i>'
                  +'<a class="icontitle events-none">'+item.name+'</a>'
                  +'<small class="right middle icon icon-persons radiusround"  /!*onclick="toUserListPage(\''+item.id+'\',\''+item.name+'\')"*!/ href="userList-section.html?id='+item.id+'&deptname='+item.name+'" data-toggle="section"></small>'
                  +'</div></li>';*/
                if(item.id != '102785'){
                    if (i == (data.length - 1)) {
                        deptsHtml += '<li class="treetitle">';
                        deptsHtml += '<div class="justify">' +
                            '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + firstName + '</div>' +
                            '</div>';
                        deptsHtml += '<div class="justify-content dept-parent-left"  data-id="' + item.id + '" name="deptment">' + item.name + '</div>';
                        deptsHtml += '<div class="justify dept-parent-right">';
                        deptsHtml += '<i class="icon icon-arrowright" style="color: #e5e5e2;"></i>'
                        deptsHtml += '</div>';
                        deptsHtml += '</li>';
                    } else {
                        deptsHtml += '<li class="treetitle">';
                        deptsHtml += '<div class="justify">' +
                            '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + firstName + '</div>' +
                            '</div>';
                        deptsHtml += '<div class="justify-content dept-parent-line dept-parent-left"  data-id="' + item.id + '" name="deptment">' + item.name + '</div>';
                        deptsHtml += '<div class="justify dept-parent-line dept-parent-right">';
                        deptsHtml += '<i class="icon icon-arrowright" style="color: #e5e5e2;"></i>';
                        deptsHtml += '</div>';
                        deptsHtml += '</li>';
                    }
                }
            }
        }
        // $elem.after(deptsHtml+'') ;
        $('#tree').empty().html(deptsHtml);
    }, {isShow: true});

}


//部门下用户列表 section 处理js
var refresh, pageNum = 1, totalPage;//var refresh,pageNum = 1,totalPage,deptName,id;
// $('#userList-section').on('sectionshow', function(){
//   var params = A.Component.params(this);
//   id= params.id;
//   deptName = params.deptname;
//   $('#headerTile').text(deptName);
//   getListByType(refreshList);
// });


// $('#userList-section').on('sectionhide', function(){
//   $('#content').empty();
// });


//默认加载第一页和刷新方法
function refreshList(data) {
    if (mark) {
        Util.redirectLogin(data.result);
        mark = false;
    }
    $('#userlistid').empty();
    searchname = "";
    data = data.page;
    totalPage = data.totalPage;
    if (data.recordList != null && data.recordList.length > 0) {
        var htmlStr = "";
        var mark = false;
        for (var i = 0; i < data.recordList.length; i++) {
            var item = data.recordList[i];
            var lastName = item.user_name.charAt(item.user_name.length - 1);
            if (lastName == '）' || lastName == ')') {
                lastName = item.user_name.charAt(item.user_name.length - 2);
            }
            /*htmlStr += '<li>'
              +'<div class="treetitle" onclick="showUserInfo(\''+item.userid+'\')">'
              +'<i class="treeicon radiusround">'+lastName+'</i>'
              +'<a class="icontitle events-none">'+item.user_name+'</a>'
              +'</div>'
              +'</li>';*/
            if(item.deptid != '102785'){
                mark = false;
                htmlStr += '<li class="bg-white mb8" onclick="showUserInfo(\'' + item.userid + '\')">';
                htmlStr += '<div class="justify">';
                htmlStr += '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + lastName + '</div>';
                htmlStr += '</div>';
                htmlStr += '<div class="justify-content nowrap box box box-middle noborder">';
                htmlStr += item.user_name;
                htmlStr += '</div>';
                htmlStr += '</li>';
            }else{
                mark = true;
            }
        }
        if(mark){
            A.showToast('暂无人员数据~');
        }else{
            $('#userlistid').empty().html(htmlStr);
        }
    } else if (data.recordList != null && data.recordList.length == 0) {
        A.showToast('暂无人员数据~');
    }
}

//上拉加载更多数据
function loadMoreData(data) {
    var htmlStr = "";
    totalPage = data.totalPage;
    if (data.recordList != null && data.recordList.length > 0) {
        var mark = false;
        for (var i = 0; i < data.recordList.length; i++) {
            var item = data.recordList[i];
            var lastName = item.user_name.charAt(item.user_name.length - 1);
            /* htmlStr += '<li>'
               +'<div class="treetitle" onclick="showUserInfo(\''+item.userid+'\')">'
               +'<i class="treeicon radiusround">'+lastName+'</i>'
               +'<a class="icontitle events-none">'+item.user_name+'</a>'
               +'</div>'
               +'</li>';*/
            if(item.deptid != '102785'){
                mark = false;
                htmlStr += '<li class="bg-white mb8" onclick="showUserInfo(\'' + item.userid + '\')">';
                htmlStr += '<div class="justify">';
                htmlStr += '<div class="dept-photo bg-' + Math.floor(Math.random() * 10 + 1) + '">' + lastName + '</div>';
                htmlStr += '</div>';
                htmlStr += '<div class="justify-content nowrap box box box-middle noborder">';
                htmlStr += item.user_name;
                htmlStr += '</div>';
                htmlStr += '</li>';
            }else{
                mark = true;
            }
        }
        if(mark){
            A.showToast('暂无人员数据~');
        }else{
            $('#userlistid').empty().html(htmlStr);
        }
    }

}


//列表请求
function getListByType(callback, loadingObj) {
    getDataByAjax({
        url: base + 'MobileFlow/selctUserByDept',
        // url:'http://192.168.81.17:8080/oa/MobileFlow/selctUserByDept',
        data: {
            pageNum: pageNum,
            showCount: "10000",
            deptId: deptId,
            name: searchname,
            email: "",
            phone: "",
            ticket: Util.getItem('ticket'),
            uuid: uuid
        }
    }, callback, loadingObj);
}


function showUserInfo(id) {
    getDataByAjax({
        url: base + 'MobileFlow/getUserInfo',
        // url:'http://192.168.81.17:8080/oa/MobileFlow/getUserInfo',
        data: {
            id: id,
            ticket: Util.getItem('ticket'),
            uuid: uuid
        }
    }, function (data) {
        Util.redirectLogin(data.result);
        var userInfo = data.userInfo.userInfo[0];
        //显示用户详细信息弹出框
        var $popup = A.popup({
            html: $('#userInfoDialog').html(),
            css: {width: 'auto', backgroundColor: '#fff'},
            pos: 'center'
        });
        $popup.popup.find('[name]').each(function (i, item) {
            var $name = $(item);
            var nameVal = $name.attr('name');
            if (nameVal == 'userGender') {
                $name.text(userInfo.userGender == '0' ? '男' : '女');
            } else if (nameVal == "deptname") {
                $name.text(deptName);
            } else if (nameVal == "email") {
                $name.text(userInfo.email);
            } else if (nameVal == "phone") {
                var phone = userInfo.phone.split(' '),
                    str = '';
                for (var i = 0; i < phone.length; i++) {
                    str += '<div onclick="callUser(this)">' + phone[i] + '</div>';
                }
                $name.html(str);
            } else {
                var lastName = userInfo.userFullName.charAt(userInfo.userFullName.length - 1);
                if (lastName == '）' || lastName == ')') {
                    lastName = userInfo.userFullName.charAt(userInfo.userFullName.length - 2);
                }
                $('#lastnameid').addClass('bg-'+Math.floor(Math.random() * 10 + 1));
                $("#lastnameid").text(lastName);
                $name.text(userInfo.userFullName);
            }
        });
    });
}

//搜索功能
var searchname = "";

function search() {
    mark = true;
    searchname = $(".search").val();
    pageNum = 1;
    if(route.length == 1){
        getDataByAjax({
            url: base + 'MobileFlow/selctUserByDept',
            // url:'http://192.168.81.17:8080/oa/MobileFlow/selctUserByDept',
            data: {
                pageNum: pageNum,
                showCount: "10000",
                deptId: '441',
                name: searchname,
                email: "",
                phone: "",
                ticket: Util.getItem('ticket'),
                uuid: uuid
            }
        }, refreshList, {isShow: false});
    }else{
        //加载人员列表
        getListByType(refreshList);
    }
}

function callUser(elem) {
    var phone = $(elem).text();
    window.location.href = 'tel:' + phone;

}

//当refresh初始化会进入此监听
$('#refresh_article').on('refreshInit', function () {
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
        //setTimeout是模拟异步效果，实际场景请勿使用
        setTimeout(function () {
            pageNum = 1;
            getListByType(refreshList, {isShow: false});
            //加载当前部门下的子部门
            initZiDeptHtml(deptId);
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
                //加载更多人员列表
                getListByType(loadMoreData, {isShow: true});
                //加载当前部门下的子部门
                initZiDeptHtml(deptId);
            }
            refresh.refresh();//当scroll区域有dom结构变化需刷新
        }, showloadingTimer);
    });
});

function initBackKeyDown() {
    if (route.length > 1) {
        document.removeEventListener("backbutton", cback, false); // 注销返回键
        document.addEventListener("backbutton", back, false);//绑定退出事件
    } else {
        document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
        document.removeEventListener("backbutton", exitApp, false); // 注销返回键
        document.removeEventListener("backbutton", back, false); // 注销返回键
        document.removeEventListener("backbutton", cback, false); // 注销返回键
    }
}

function back() {
    if (route.length > 1) {
        $('#route_' + route.length).click();
    }
}

function cback() {
    window.location.href = 'index.html?checkType=no';
}
