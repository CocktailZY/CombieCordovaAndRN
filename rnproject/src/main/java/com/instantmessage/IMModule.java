package com.instantmessage;

import android.app.Activity;
import android.database.sqlite.SQLiteDatabase;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.instantmessage.model.KeyValue;
import com.instantmessage.model.User;
import com.instantmessage.service.KeyValueService;
import com.instantmessage.service.UserService;
import com.instantmessage.util.EquipmentInfoUtil;
import com.instantmessage.util.HttpUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * IMModule
 * @author haoxl
 * @date 2018/5/30
 */

public class IMModule extends ReactContextBaseJavaModule {
    static final String TAG = IMModule.class.getName() + " pid::" + android.os.Process.myPid();
    //sk卡路径
    public static String sd_path = null;
    //数据库文件路径
    public static File dbfile=null;
    //数据库名
    public static String dbname = null;
    //请求域名
    public static final String dominName = "http://192.168.81.12:8091";
    //人员列表请求地址
    public static final String userListUrl = dominName+"/mobile-im/userAndDept/queryDeptWithUsers";
    //第三级人员列表请求地址
    public static final String userLastListUrl = dominName+"/mobile-im/userAndDept/queryAllSubDeptsAndUsers";
    //好友列表请求地址
    public static final String friendListUrl = dominName+"/mobile-im/singleChat/queryUserByGroupId";
    //好友详情请求地址
    public static final String userDetailUrl = dominName+"";
    //头像路径
    private static  String photo_path = "";
    //请求票据
    private static String ticket = null;
    //设备uuid
    private static String uuid = null;
    //版本号
    private static String version = null;
    //部门id
    private static String departId = null;
    //用户XMPP的jid
    private static String jidNode = null;
    private static String userId = null;
    ReactApplicationContext context;
    public static Activity activity = null;
    Handler mHandler;
    //数据库对象
    private SQLiteDatabase db;
    private static Boolean isGetFriends = false;
    public static IMModule instance;
    public IMModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;

    }
    public void init(){
        if(activity==null){
            activity = context.getCurrentActivity();
        }
        if(sd_path==null){
            sd_path = EquipmentInfoUtil.getPrimaryStoragePath(activity);
            Log.e(TAG,"sd_path："+sd_path);
        }
        if(dbname==null&&userId!=null){
            dbname = "/im/"+userId+"/sqlite/im_"+userId+".db";
            Log.e(TAG,"dbname："+dbname);
        }
        if(dbfile==null){
            dbfile = new File(sd_path+dbname);//数据库文件
            Log.e(TAG,"dbfile："+dbfile);
        }
        if(photo_path==null&&userId!=null){
            photo_path = "/im/"+userId+"/photo";
            Log.e(TAG,"photo_path："+photo_path);
        }
    }
    @Override
    public String getName() {
        return "IMModule";
    }
    //注意：记住getName方法中的命名名称，JS中调用需要

    /**
     * 创建文件夹：createFolder
     * @param folderPath 文件夹路径
     */
    @ReactMethod
    public void createFolder(String folderPath){
        init();
        File file=new File(EquipmentInfoUtil.getPrimaryStoragePath(activity)+folderPath);
        if(!file.exists()){
            Log.e(TAG,"数据库文件夹："+file+"不存在，开始创建文件夹");
            file.mkdirs();
        }else{
            Log.e(TAG,"数据库文件夹："+file+"已存在");
        }
    }
    @ReactMethod
    public void openOrCreateDatabase(String userId){
        dbname = "/im/"+userId+"/sqlite/im_"+userId+".db";

    }
    /**
     * 暴露给RN调用的接口request
     * @param requestName  请求名称
     *                     "userList":获取服务器通讯录列表，并保存数据
     *                     "friendList":获取服务器好友列表，并保存数据
     *                     "userDetail":获取服务器人员详情，并保存数据
     * @param ticket       票据
     * @param uuid         设备uuid
     * @param jidNode          jidNode
     * @param userId       用户userID
     */
    @ReactMethod
    public void request(String requestName,String ticket,String uuid,String jidNode,String userId,String departId,String version){
        Log.e("---------------:","进入线程请求");
        this.ticket = ticket;
        this.uuid = uuid;
        this.jidNode = jidNode;
        this.userId = userId;
        this.departId = departId;
        this.version = version;
        Log.e(TAG,"ticket:"+ticket);
        Log.e(TAG,"uuid:"+uuid);
        Log.e(TAG,"jidNode:"+jidNode);
        Log.e(TAG,"userId:"+userId);
        Log.e(TAG,"departId:"+departId);
        Log.e(TAG,"version:"+version);
        mHandler = new Handler();
        if("userList".equals(requestName)){
            new Thread(){
                public void run(){
                    Looper.prepare();
                    mHandler.post(runnableUserlist);
                    Looper.loop();
                }
            }.start();
        }else if("userLastList".equals(requestName)){
            new Thread(){
                public void run(){
                    Looper.prepare();
                    mHandler.post(runnableUserLastList);
                    Looper.loop();
                }
            }.start();
        }else if("userDetail".equals(requestName)){
            new Thread(){
                public void run(){
                    Looper.prepare();
//                    mHandler.post(runnableUserDetail);
                    Looper.loop();
                }
            }.start();
        }
    }

    /**
     * 获取前两层通讯录列表线程
     */
    Runnable  runnableUserlist=new  Runnable(){
         @Override
         public void run() {
             String str= userListUrl+"?ticket="+ticket+"&uuid="+uuid+"&version="+version+"&userId="+userId+"&deptId="+departId+"&realId="+jidNode;
             Log.e(TAG,"--------1-------str:"+str);
             Map<String,String> map = new HashMap<String,String>();
             map.put("ticket",ticket);
             map.put("uuid",uuid);
             map.put("version",version);
             map.put("userId",userId);
             map.put("deptId",departId);
             map.put("realId",jidNode);
             String result = HttpUtil.SendPostRequest(userListUrl,map);
             Log.e(TAG,"--------1-------result:"+result);
             try {
                 JSONObject resObj = new JSONObject(result);
                 //请求结果标记（200：成功）
                 String code = resObj.getString("code");
                 if("200".equals(code)) {
                     //获取部门对象("data");
                     JSONObject dataObj = new JSONObject(resObj.getString("data"));
                     Log.e(TAG,"--------1-------变化状态："+dataObj.getBoolean("change"));
                     if(dataObj.getBoolean("change")){
                         Log.e(TAG,"--------1-------需要更新数据");
                         context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                 .emit("userListListener",resObj.getString("data"));
                     }
                     //获取部门对象
                     /*JSONObject deptObj = dataObj.getJSONObject("dept");
                     //获取部门结果标记
                     String deptCode = deptObj.getString("code");
                     //获取部门数据类型 0-变化的数据 1-原始数据
                     String deptOriginal = deptObj.getString("original");
                     if("200".equals(deptCode)&&"0".equals(deptOriginal)){
                         //变化的数据
                         String addstr = deptObj.getString("add");
                         if(addstr!=null&&!"".equals(addstr)){
                             //新增数据

                         }
                         String updatestr = deptObj.getString("update");
                         if(updatestr!=null&&!"".equals(updatestr)){
                             //更新数据

                         }
                         String deletestr = deptObj.getString("delete");
                         if(deletestr!=null&&!"".equals(deletestr)){
                             //删除数据

                         }

                     }else if("200".equals(deptCode)&&"1".equals(deptOriginal)){
                         //原始数据
                         Log.e("--------1-------","收到部门原始数据");

//                         String vs = deptObj.getString("version");
//                         String treestr = deptObj.getString("tree");
                         context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                 .emit("userListListener",dataObj);
                     }
                     //获取人员对象
                     JSONObject userObj = (JSONObject)dataObj.get("user");
                     //人员结果数据标记 200-成功
                     String userCode = userObj.getString("code");
                     //人员结果数据类型 0-变化的数据 1-原始数据
                     String userOriginal = userObj.getString("original");
                     if("200".equals(userCode)&&"0".equals(userOriginal)){
                         //变化的数据
                         String addstr = userObj.getString("add");
                         if(addstr!=null&&!"".equals(addstr)){
                             //新增数据

                         }
                         String updatestr = userObj.getString("update");
                         if(updatestr!=null&&!"".equals(updatestr)){
                             //更新数据

                         }
                         String deletestr = userObj.getString("delete");
                         if(deletestr!=null&&!"".equals(deletestr)){
                             //删除数据

                         }

                     }else if("200".equals(userCode)&&"1".equals(userOriginal)){
                         //原始数据
                         Log.e("--------1-------","收到人员原始数据");

//                         String vs = userObj.getString("version");
//                         String treestr = userObj.getString("tree");
                         context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                 .emit("userListListener",dataObj);
                     }*/
                 }

             } catch (JSONException e) {
                 e.printStackTrace();
             }

         }
    };
    /**
     * 获取第三层通讯录列表线程
     */
    Runnable  runnableUserLastList=new  Runnable(){
        @Override
        public void run() {
            Map<String,String> map = new HashMap<String,String>();
            map.put("ticket",ticket);
            map.put("uuid",uuid);
            map.put("version",version);
            map.put("userId",userId);
            map.put("deptId",departId);
            map.put("realId",jidNode);
            String result = HttpUtil.SendPostRequest(userLastListUrl,map);
            Log.e(TAG,"--------2-------result:"+result);
            try {
                JSONObject resObj = new JSONObject(result);
                //请求结果标记（200：成功）
                String code = resObj.getString("code");
                if("200".equals(code)) {
                    //获取部门对象("data");
                    JSONObject dataObj = new JSONObject(resObj.getString("data"));
                    if (dataObj.getBoolean("change")) {
                        Log.e(TAG, "--------2-------需要更新数据");
                        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("userLastListListener", resObj.getString("data"));
                    }
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    };
    /**
     * 获取好友列表线程
     */
    Runnable  runnableFriendList=new  Runnable(){
        @Override
        public void run() {
            KeyValueService keyValueService = new KeyValueService();
            String friendListVersion = keyValueService.getValueByKey("friendListVersion");
            Log.e(TAG,"--------1-------friendListVersion:"+friendListVersion);
            Map<String,String> params = new HashMap<String,String>();
            params.put("ticket",ticket);
            params.put("uuid",uuid);
            params.put("version",friendListVersion);
            params.put("userId",userId);
            params.put("currentUid",jidNode);
//            String str= friendListUrl+"?ticket="+ticket+"&uuid="+uuid+"&version="+friendListVersion+"&userId="+userId+"&currentUid=ff8080816209941e016209954193054f";
//            Log.e("--------1-------str:",str);
            String result = HttpUtil.SendPostRequest(friendListUrl,params);
            Log.e("--------1-------result:",result);
            try {
                JSONObject resObj = new JSONObject(result);
                String code = resObj.getString("code");
                if("200".equals(code)){
                    String original = resObj.getString("original");
                    if("200".equals(code)&&"0".equals(original)){//非原始数据

                        String addstr = resObj.getString("add");
                        if(addstr!=null&&!"".equals(addstr)){

                        }
                        String updatestr = resObj.getString("update");
                        if(updatestr!=null&&!"".equals(updatestr)){

                        }
                        String deletestr = resObj.getString("delete");
                        if(deletestr!=null&&!"".equals(deletestr)){

                        }


                    }else if("200".equals(code)&&"1".equals(original)){//原始数据
                        Log.e("--------1-------","收到好友原始数据");
                        UserService.initDB();
                        String version = resObj.getString("version");
                        String treestr = resObj.getString("tree");
                        Log.e("-------1------version:",String.valueOf(version));
                        Log.e("-------1------treestr:",String.valueOf(treestr));
                        KeyValue keyValue = new KeyValue();
                        keyValue.setKey("friendTree");
                        keyValue.setValue(treestr);
                        keyValueService.saveDate(keyValue);
                        keyValue.setKey("friendListVersion");
                        keyValue.setValue(version);
                        keyValueService.saveDate(keyValue);
                        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("friendListListener",treestr);
                        JSONArray originalUserInfo = resObj.getJSONArray("originalUserInfo");
                        Log.e("-------1------length:",String.valueOf(originalUserInfo.length()));
                        for (int i = 0; i < originalUserInfo.length(); i++) {
                            JSONObject jsonObject = originalUserInfo.getJSONObject(i);
                            String jidNode = jsonObject.getString("jidNode");//jid
                            Log.e("-------1------jidNode:",jidNode);
                            String trueName = jsonObject.getString("trueName");//真实姓名
                            Log.e("-------1------trueName:",trueName);
                            String trueNamePinyin = jsonObject.getString("trueNamePinyin");//真实姓名拼音
                            String deptName = jsonObject.getString("deptName");//部门名称
                            String userName = jsonObject.getString("userName");//登录名
                            String cell = jsonObject.getString("cell");//电话
                            String email = jsonObject.getString("email");//邮箱
                            String userId = jsonObject.getString("userId");//用户id
                            String photoId = jsonObject.getString("photoId");//头像id
                            String photoMiniId = jsonObject.getString("photoMiniId");//缩略图id
                            User user = new User();
                            user.setJid_node(jidNode);
                            user.setUser_id(userId);
                            user.setName(trueName);
                            user.setNotes(trueName);
                            user.setIs_friend(1);
                            user.setAccount_no(userName);
                            user.setPhone(cell);
                            user.setEmail(email);
                            user.setSex(1);
                            user.setPicture_name(photoId);
                            user.setPicture_path("");
                            String notes_initial = trueNamePinyin.substring(0,1);
                            user.setNotes_initial(notes_initial);
                            user.setIs_details(0);
                            UserService userService = new UserService();
                            userService.insertDataNoDB(user);
                        }
                        UserService.db.close();
                    }
                }

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
    };
}