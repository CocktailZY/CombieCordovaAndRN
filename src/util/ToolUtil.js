/**
 * 表单提交正则校验
 * 只能是数字，字母，中文的组合
 */
export default (ToolUtil = {
  isCorrectName(name) {
    console.log("待校验---");
    console.log(name);
    let result = false;
    if (name) {
      name = name + "";
      if (name.match(/^[\u4E00-\u9FA5a-zA-Z0-9]+$/)) {
        result = true;
      }
    }
    return result;
  },
  //判断字符串是否包含emoji表情
  isEmojiCharacterInString(substring) {
    /*for (let i = 0; i < substring.length; i++) {
      let hs = substring.charCodeAt(i);
        console.log("-------------------------------");
      console.log(0xd800);
      console.log(hs);
      console.log(0xdbff);
      if (0xd800 <= hs && hs <= 0xdbff) {
        if (substring.length > 1) {
          let ls = substring.charCodeAt(i + 1);
          console.log(ls);
          let uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
          console.log(uc);
            console.log("=====");
            console.log(0x1d000);
            console.log(0x1f77f);
          if (0x1d000 <= uc && uc <= 0x1f77f) {
            return true;
          }
        }
      } else if (substring.length > 1) {
        let ls = substring.charCodeAt(i + 1);
        if (ls == 0x20e3) {
          return true;
        }
      } else {
        if (0x2100 <= hs && hs <= 0x27ff) {
          return true;
        } else if (0x2b05 <= hs && hs <= 0x2b07) {
          return true;
        } else if (0x2934 <= hs && hs <= 0x2935) {
          return true;
        } else if (0x3297 <= hs && hs <= 0x3299) {
          return true;
        } else if (
          hs == 0xa9 ||
          hs == 0xae ||
          hs == 0x303d ||
          hs == 0x3030 ||
          hs == 0x2b55 ||
          hs == 0x2b1c ||
          hs == 0x2b1b ||
          hs == 0x2b50
        ) {
          return true;
        }
      }
    }*/
      let emojiReg = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      return emojiReg.test(substring);
  },
  moneyLimit(obj, intMax) {
    if(obj && obj.value){        
      obj.value = obj.value.replace(/[^\d.]/g,"");  
      obj.value = obj.value.replace(/\.{2,}/g,"."); 
      obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");  
      obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
      if(obj.value !=""){   
          if(obj.value == "."){
              obj.value= "0.1";  
          }else if(obj.value.indexOf(".") == 0){
              obj.value= "0"+obj.value;  
          }
          if(intMax){
              obj.value = maxIntPart(obj.value,intMax,true);
          }
      }
    }
    return obj.value;
  },
  //比较时间戳
  calculateDiffTime(start_time, end_time) {
    var startTime = 0,
      endTime = 0;
    if (start_time < end_time) {
      startTime = start_time;
      endTime = end_time;
    } else {
      startTime = end_time;
      endTime = start_time;
    }

    // //计算天数
    // var timeDiff = endTime - startTime
    // var year = Math.floor(timeDiff / 86400 / 365);
    // timeDiff = timeDiff % (86400 * 365);
    // var month = Math.floor(timeDiff / 86400 / 30);
    // timeDiff = timeDiff % (86400 * 30);
    // var day = Math.floor(timeDiff / 86400);
    // timeDiff = timeDiff % 86400;
    // var hour = Math.floor(timeDiff / 3600);
    // timeDiff = timeDiff % 3600;
    // var minute = Math.floor(timeDiff / 60);
    // timeDiff = timeDiff % 60;
    // var second = timeDiff;
    // return [year, month, day, hour, minute, second]

    var timeDiff = endTime - startTime;
    var hour = Math.floor(timeDiff / 3600);
		var minute = Math.floor(timeDiff / 60);
    timeDiff = timeDiff % 3600;
    //var minute = Math.floor(timeDiff / 60);
    timeDiff = timeDiff % 60;
    var second = timeDiff;

    return minute;//[hour, minute, second];
  },
  //文件大小显示处理
  getFileSize(toFileSize) {
    let filesize;
    if(parseFloat(toFileSize) < 1024*1024){
      filesize = (parseFloat(toFileSize)/1024).toFixed(2) + 'K';
    }else if(parseFloat(toFileSize) < 1024*1024*1024){
      filesize = (parseFloat(toFileSize)/1024/1024).toFixed(2) + 'M';
    }else{
      filesize = (parseFloat(toFileSize)/1024/1024/1024).toFixed(2) + 'G';
    }
    return filesize;
  },
  /**
   *时间字符串时间戳字符串
   */
  strToStemp(time){
      time = time.replace(/-/g,':').replace(' ',':');
      time = time.split(':');
      return new Date(time[0],(time[1]-1),time[2],time[3],time[4],time[5]?time[5]:"00").getTime();
  }
});

    maxIntPart = (value, max, pointLast) => {
      var result = "";
        if(value){
            var point = value.indexOf(".");
            var intPart = "",decimal = "",hasPoint=true;
            if(point>0){
                intPart = value.substring(0,point);
                decimal = value.substring(point+1,value.length);
            }else if(point==0){
                //.开头
                intPart = "0";
                decimal = value.substring(1,value.length);
            }else{
                //没有.
                hasPoint=false;
                intPart = value;
            }
            result = intPart.substring(0,max);
            if(pointLast){
                if(hasPoint){
                    result += "."+decimal;
                }else{
                    if(decimal != ''){
                        result += "."+decimal;
                    }
                }
            }else{
                if(decimal != ''){
                    result += "."+decimal;
                }
            }
        }else{
            result = "0";
        }
        return result;

    };
