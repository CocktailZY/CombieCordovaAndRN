(function () {
    window.H5lock = function (obj) {
        this.height = obj.height;
        this.width = obj.width;
        this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
        this.stepType = obj.stepType;
    };


    H5lock.prototype.drawCle = function (x, y) { // 初始化解锁密码面板
        this.ctx.strokeStyle = '#dddddd';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    H5lock.prototype.drawPoint = function () { // 初始化圆心
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = '#278EEE';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 3, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    H5lock.prototype.drawStatusPoint = function (type) { // 初始化状态线条
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    H5lock.prototype.drawLine = function (po, lastPoint) {// 解锁轨迹
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#278EEE';
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        console.log(this.lastPoint.length);
        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    }
    H5lock.prototype.createCircle = function () {// 创建解锁点的坐标，根据canvas的大小来平均分配半径

        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r,
                    y: i * 4 * r + 3 * r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }
        //return arr;
    }
    H5lock.prototype.getPosition = function (e) {// 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
        return po;
    }
    H5lock.prototype.update = function (po) {// 核心变换方法在touchmove时候调用
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }
        this.drawStatusPoint('#278EEE');
        this.drawPoint(this.lastPoint);// 每帧花轨迹
        this.drawLine(po, this.lastPoint);// 每帧画圆心

        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    }
    H5lock.prototype.checkPass = function (psw1, psw2) {// 检测密码
        var p1 = '',
            p2 = '';
        for (var i = 0; i < psw1.length; i++) {
            p1 += psw1[i].index + psw1[i].index;
        }
        for (var i = 0; i < psw2.length; i++) {
            p2 += psw2[i].index + psw2[i].index;
        }
        return p1 === p2;
    }
    H5lock.prototype.checkSiglePass = function (psw1, psw2) {// 检测密码
        var p2 = '';
        for (var i = 0; i < psw2.length; i++) {
            p2 += psw2[i].index;
        }
        return psw1 === p2;
    }
    H5lock.prototype.storePass = function (psw) {// touchend结束之后对密码和状态的处理
        if (this.pswObj.step == 1) {
            if (this.checkSiglePass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                var tempChooseType = this.chooseType;
                $('#title').text('密码保存成功');
                this.drawStatusPoint('#2CFF26');
                var temp = '';
                for (var i = 0; i < psw.length; i++) {
                    temp += psw[i].index;
                }
                this.pswObj.spassword = temp;
                //发保存密码请求
                getDataByAjax({
                    // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
                    url: base + 'applicationLock/update',
                    data: {
                        uuid: Util.getItem('uuid'),
                        ticket: Util.getItem('ticket'),
                        userId: Util.getItem('userid'),
                        applicationLock: temp,
                        isOpenLock: '1',
                        errorCount:'2'
                    }
                }, function (data) {
                    Util.redirectLogin(data.result);
                    if(data.status == '2'){
                        Util.setItem('handspwd',temp);
                        //Util.setItem('passwordxx', JSON.stringify(psw));
                        Util.setItem('chooseType', tempChooseType);
                        $('#updateAppLock').show();
                        $('#fingerPwd .float-right').hide();
                        $('#handsPwd .float-right').show();
                        Util.setItem('isLock','1');
                        Util.setItem('fingerLock','0');
                        //window.location.href = 'appLockStatus.html';
                        window.open('appLockStatus.html');
                    }
                }, {isShow: false})
            } else {
                $('#title').text('两次不一致，重新输入');
                this.drawStatusPoint('red');
                delete this.pswObj.step;
            }
        } else if (this.pswObj.step == 2) {
            var flag = false;
            if(this.stepType == 'no'){
                flag = this.checkSiglePass(Util.getItem('handspwd'), psw)
            }else{
                flag = this.checkSiglePass(this.pswObj.spassword, psw)
            }
            if (flag) {
                //$('#title').text('解锁成功');
                // this.drawStatusPoint('#2CFF26');
                $('#forgetDiv').show();
                if (this.stepType == 'no') {
                    getDataByAjax({
                        // url: 'http://192.168.81.36:8091/oa/applicationLock/update',
                        url: base + 'applicationLock/update',
                        data: {
                            uuid: Util.getItem('uuid'),
                            ticket: Util.getItem('ticket'),
                            userId: Util.getItem('userid'),
                            applicationLock: temp,
                            isOpenLock: '1',
                            errorCount:'1'
                        }
                    }, function (data) {
                        var locate = Util.getItem('stepLocation');
                        if(locate.indexOf('calendar') != -1 || locate.indexOf('deptList') != -1){
                            A.Controller.back();
                        }else{
                            // window.location.href = locate;
                            window.open(locate);
                        }
                    }, {isShow: false})

                }else if(this.stepType == 'toIndex'){
                    getDataByAjax({
                        // url: 'http://192.168.81.36:8085/oa/applicationLock/update',
                        url: base + 'applicationLock/update',
                        data: {
                            uuid: Util.getItem('uuid'),
                            ticket: Util.getItem('ticket'),
                            userId: Util.getItem('userid'),
                            applicationLock: temp,
                            isOpenLock: '1',
                            errorCount:'1'
                        }
                    }, function (data) {
                        // window.location.href = 'index.html?checkType=no';
                        window.open('index.html?checkType=no');
                    }, {isShow: false})

                } else {
                    this.updatePassword();
                }
            } else {
                this.drawStatusPoint('red');
                if(this.stepType == 'no' || this.stepType == 'toIndex'){
                    getDataByAjax({
                        // url: 'http://192.168.81.36:8085/oa/applicationLock/update',
                        url: base + 'applicationLock/update',
                        data: {
                            uuid: Util.getItem('uuid'),
                            ticket: Util.getItem('ticket'),
                            userId: Util.getItem('userid'),
                            applicationLock: temp,
                            isOpenLock: '1',
                            errorCount:'0'
                        }
                    }, function (data) {
                        Util.redirectLogin(data.result);
                        if(data.status == '2'){
                            if(parseInt(data.errorCount) < 5){
                                var chance = 5 - parseInt(data.errorCount);
                                A.alert('解锁失败，您还有'+chance+'次机会');
                            }else{
                                // window.location.href = 'login.html?type=loginout';
                                window.open('login.html?type=loginout');
                            }
                        }
                    }, {isShow: false})
                }else{
                    $('#title').text('解锁失败,请重试');
                }
            }
        } else {
            this.pswObj.step = 1;
            if (psw.length >= 4) {
                var tpsw = '';
                for (var i = 0; i < psw.length; i++) {
                    tpsw += psw[i].index;
                    $('#hands'+psw[i].index).attr('src','./images/hands-click-color.png');
                }
                this.pswObj.fpassword = tpsw;
                $('#title').text('再次输入');

            } else {
                var tipTitle = '请至少连接4个点';
                this.updatePassword(tipTitle);
            }
        }

    }
    H5lock.prototype.makeState = function () {
        if (this.pswObj.step == 2) {
            // document.getElementById('updatePassword').style.display = 'block';
            $('#updatePassword').css('visibility', 'hidden');
            $('#forgetDiv').show();
            //document.getElementById('chooseType').style.display = 'none';
            $('#title').text('请解锁');
        } else if (this.pswObj.step == 1) {
            //document.getElementById('chooseType').style.display = 'none';
            // document.getElementById('updatePassword').style.visibility = 'hidden';
            $('#updatePassword').css('visibility', 'hidden');
        } else {
            // document.getElementById('updatePassword').style.visibility = '';
            //document.getElementById('chooseType').style.display = 'block';
            $('#updatePassword').css('visibility', 'hidden');
        }
    }
    H5lock.prototype.setChooseType = function (type) {
        chooseType = type;
        init();
    }
    H5lock.prototype.updatePassword = function (tipTitle) {
        Util.removeItem('handspwd');
        Util.removeItem('chooseType');
        this.pswObj = {};
        $('#forgetDiv').hide();
        if (tipTitle) {
            $('#title').text(tipTitle);
        } else {
            $('#title').text('绘制解锁图案');

        }
        this.reset();
    }
    H5lock.prototype.initDom = function () {
        var wrap = document.createElement('div');
        var str ='<div style="width: 60px; height: 60px; margin: auto;padding-left: 5px;">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-right: 5px;" id="hands1">'
            +'<img src="./images/hands-click.png" width=15 height=15 id="hands2">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-left: 5px;" id="hands3">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-right: 5px;" id="hands4">'
            +'<img src="./images/hands-click.png" width=15 height=15 id="hands5">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-left: 5px;" id="hands6">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-right: 5px;" id="hands7">'
            +'<img src="./images/hands-click.png" width=15 height=15 id="hands8">'
            +'<img src="./images/hands-click.png" width=15 height=15 style="margin-left: 5px;" id="hands9">'
            +'</div>'
            +'<h4 id="title" class="title text-center" style="padding-bottom: 0px;">绘制解锁图案</h4>' +
            //'<a id="updatePassword" style="position: absolute;right: 5px;top: 5px;color:#fff;font-size: 10px;display:none;">重置密码</a>'+
            '<div class="box box-center">' +
            '<canvas id="canvas" width="'+$(window).width()+'" height="'+$(window).width()+'" style="display: inline-block;"></canvas></div>';

        wrap.setAttribute('style', 'position: absolute;top:5%;left:0;right:0;bottom:0;');
        wrap.innerHTML = str;
        // document.body.appendChild(wrap);
        $('#setlock_article').empty().append(wrap);
    }
    H5lock.prototype.init = function () {
        this.initDom();
        this.pswObj = Util.getItem('handspwd') ? {
            step: 2,
            spassword: Util.getItem('handspwd')
        } : {};
        this.lastPoint = [];
        this.makeState();
        this.touchFlag = false;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.bindEvent();
    }
    H5lock.prototype.reset = function () {
        this.makeState();
        this.createCircle();
    }
    H5lock.prototype.bindEvent = function () {
        var self = this;
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
            var po = self.getPosition(e);
            console.log(po);
            for (var i = 0; i < self.arr.length; i++) {
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                    self.touchFlag = true;
                    self.drawPoint(self.arr[i].x, self.arr[i].y);
                    self.lastPoint.push(self.arr[i]);
                    self.restPoint.splice(i, 1);
                    break;
                }
            }
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            if (self.touchFlag) {
                self.touchFlag = false;
                if(self.stepType == 'no'){
                    self.pswObj.step = 2;
                }
                self.storePass(self.lastPoint);
                setTimeout(function () {
                    self.reset();
                }, 300);
            }


        }, false);
        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
        // document.getElementById('updatePassword').addEventListener('click', function () {
        //     self.updatePassword();
        // });
    }
})();