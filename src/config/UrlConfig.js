const changeBtn = false;

// const baseUrl = 'http://219.232.203.15:8081/mobile-im';
// const baseUrl = 'http://weixin.sxzkzy.com:8888/mobile-im';//222测试服务路径
// const baseUrl = 'http://121.30.232.162:8888/mobile-im';//222测试服务路径
const baseUrl = 'http://121.30.232.162:8889/mobile-im';//118测试服务路径
// const baseUrl = 'https://web.sxzkzy.com/mobile-im';//182开发服务外网https
// const baseUrl = 'http://web.sxzkzy.com:8082/mobile-im';//182开发服务外网http
// const baseUrl = 'http://192.168.80.182:8082/mobile-im';//182开发服务内网
// const baseUrl = 'http://192.168.81.1:8091/mobile-im';
// const baseUrl = 'http://219.232.203.16:8081/mobile-im';

const Path = {
	baseUrl: baseUrl,
	xmppHost: changeBtn ? '219.232.203.16' : 'sns.sxzkzy.com',//192.168.80.101  121.30.232.162  192.168.81.8  192.168.80.124 192.168.199.53 sns.sxzkzy.com 219.232.203.16
	xmppDomain: changeBtn ? 'gkzq.com.cn' : 'imserver',//'gkzq.com.cn'imserve,
	xmppGroupDomain: changeBtn ? '@muc.gkzq.com.cn' : '@muc.imserver',//'@muc.gkzq.com.cn',
	pageSize: 15,//分页查询条数
	pageSizeNew: 10,//分页查询条数
	handLockErrorNum : 3,
	// myFriendGourpId:'ff8080816264eb4b01626503768d0015',
	systemId: 'mms',//系统Id
	hideMaskToast: 1500,
	downloadUrl:changeBtn ? '' : 'https://web.sxzkzy.com/im140/im140.html',//app下载路径
	viewFile: baseUrl + '/file/filePreview',//文件预览接口
	previewAttachment: baseUrl + '/file/previewAttachment',//附件预览接口
	network_ip:"121.30.232.162",//检测网络时ping的ip地址
	//-------------------------信鸽推送配置-------------------------
	androidAccessId: '2100307775',
	androidAccessKey: 'A2ZUYJJ9613F',
	iosAccessId: '2200308438',
	iosAccessKey: 'I2B2IYV7U88Q',
	//-------------------------------------------------------------

	AppStateSeconds: 1,//设备锁唤起时间间隔

	deviceLock: false,//设备锁开关
	touchId: false,//指纹锁开关
	handLock: false,//手势锁开关
	netDisk: false,//网盘开关
	elecTable: false,//电子表格开关

	getSysVersion: baseUrl + '/installation/getMaxVersion',//获取系统版本号
	downloadApk: baseUrl + '/installation/download',//apk更新下载
	headImg: baseUrl + '/singleChat/queryPhotoAddress',//获取联系人头像接口/file/previewImage
	headImgNew: baseUrl + '/file/previewImage',//获取联系人头像接口/file/previewImage
	groupHeadImg: baseUrl + '/file/readThumbnailImage',//获取群头像接口
	baseImageUrl: baseUrl + '/file/download',//原图接口file/previewImage
	resetHeadImage: baseUrl + '/file/uploadPhoto',//上传头像
	getHeadImageStatus:baseUrl + '/image/isExsit',//上传头像

	login: baseUrl + '/login/handLogin',//登录
	autoLogin: baseUrl + '/login/autoLogin',//自动登录
	loginOut: baseUrl + '/login/loginOut',//退出登录

	setting: baseUrl + '/singleChat/queryUniqUser',//我的页面
    receivedJobs: baseUrl + '/offlineMessage/receivedJobs',//工作邀请和群通知提醒
	refuseSingleMsg: baseUrl + '/singleChat/withdrawById',//消息撤回
	refuseMucMsg: baseUrl + '/history/withdrawById',//群消息撤回
	redirectMsg: baseUrl + '/file/repeatFile',//消息转发(文件)

	getContacts: baseUrl + '/userGroup/queryUserByGroupId',//获取常用联系人
	setContacts: baseUrl + '/userGroup/addUserToGroup',//设为常用联系人
	removeContacts: baseUrl + '/userGroup/deleteCommon',//移出常用联系人
	getFriends: baseUrl + '/singleChat/queryUserByGroupId',//获取全部好友
	addFriend: baseUrl + '/singleChat/add',//添加好友
	removeFriend: baseUrl + '/singleChat/remove',//删除好友
	creatRoomGetFriends: baseUrl + '/userGroup/queryUserByGroupIdForm',//旧接口'/singleChat/queryUserByGroupIdOne',//获取好友或群成员
	getFriendDetail: baseUrl + '/singleChat/queryUniqUser',//好友详情
	isJoinGroup: baseUrl + '/groupChat/authGroup',//判断是否可以加入该群聊
	getAddress: baseUrl + '/userAndDept/queryAll',//通讯录
	getRecords: baseUrl + '/notice/pagedQueryNotice',//获取审核列表
	agreeAddFriend: baseUrl + '/singleChat/agreeAddToDefaultGroup',//同意添加好友
	refuseAddFriend: baseUrl + '/singleChat/refuseAdd',//拒绝添加好友
	updateHeadImage: baseUrl + '/image/update',//生成头像缓存

	removeFriends: baseUrl + '/groupChat/revoke',//移除群成员
	roomNameUpdate: baseUrl + '/groupChat/roomUpdate',//修改群名称
    roomNameUpdateAndUserList: baseUrl + '/groupChat/roomUpdate1',//修改群名称
	uploadGroupImage: baseUrl + '/file/uploadGroupImage',//上传群头像
	inviteFriends: baseUrl + '/groupChat/saveOrUpdate',//邀请群成员
	joinRoom: baseUrl + '/groupChat/join',//主动加入群聊
	leaveGroup: baseUrl + '/groupChat/quit',//主动退出群
	getGroupMember: baseUrl + '/groupChat/queryOccupant',//获取群成员
	createGroup: baseUrl + '/groupChat/roomAdd',//创建群
	getGroups: baseUrl + '/groupChat/queryAllRooms',//所有群列表
	getMemberNumber: baseUrl + '/groupChat/getMemberNumber',//获取群成员个数
	getGroupDetail: baseUrl + '/groupChat/groupDetail1',//群详情
	getGroupDetailNew: baseUrl + '/groupChat/queryRoomsByRoomJid',//群详情新
	getGroupHistory: baseUrl + '/history/query2Page',//获取群记录
	getAllGroups: baseUrl + '/groupChat/queryRoomsByOccupantJid',//获取自己的群列表
	getAllGroupsPage: baseUrl + '/groupChat/queryRoomsByOccupantJidPage',//获取自己的群列表
	uploadImage: baseUrl + '/file/uploadfile',//上传图片
	judgeMember: baseUrl + '/groupChat/queryRoomByOccupantJidAndRoomId',//判断当前登录人是否为群成员
	groupMute: baseUrl + '/groupChat/updateMute',//禁言
	auditFriends: baseUrl + '/groupChat/approveSave',//审核群成员邀请成员
	auditFriendsList: baseUrl + '/groupChat/queryList',//获取审核列表
	auditMembersList: baseUrl + '/groupChat/queryListByJid',//获取Messasge审核列表
	auditFriendsUpdata: baseUrl + '/groupChat/approveUpdate',//拒绝加入群组
	changeGroup: baseUrl + '/groupChat/changeower',//群组移交

	isRoomAdmin: baseUrl + '/groupChat/isRoomAdmin',//查询是否为群管理员

	postGroupNotice: baseUrl + '/announcement/queryList',//获取群公告
	saveGroupNotice: baseUrl + "/announcement/save",//保存群公告

	atSave: baseUrl + '/at/save',//@全部成员调用

	address: baseUrl + '/userAndDept/queryDeptWithUsers',//1.2级获取通讯录接口
	thrAddress: baseUrl + '/userAndDept/queryAllSubDeptsAndUsers',//3级获取通讯录接口

	getCount: baseUrl + '/formJSON/getCount',//获取聊天记录条数
	getDetail: baseUrl + '/formJSON/getHistoryChats',//获取聊天记录详情

	getGroupHistoryImage: baseUrl + '/file/pagedQueryChatFile',//获取群聊天记录图片
	getGroupHistoryDate: baseUrl + '/history/chatHasHistory',//获取有记录日期
	postGroupHistoryDate: baseUrl + '/history/queryRecord',//获取选择日期下聊天记录

	getSelfHistoryDate: baseUrl + '/history/haseSingleChatHistory',//获取单聊记录日期
	postSelfHistoryDate: baseUrl + '/history/pagedQuerySingleChatHistory',//获取单聊选择日期下聊天记录

	/*活动*/
	getActivity: baseUrl + '/activity/list',//获取活动列表
	getActivityPublish: baseUrl + '/activity/create',//获取发布请求
	getActivityDetails: baseUrl + '/activity/search',//获取活动详情
	getActivityAttend: baseUrl + '/activity/attend',//活动报名
	getActivityComment: baseUrl + '/activity/addDiscuss',//活动评论
	getActivityRefuse: baseUrl + '/activity/refuse',//拒绝参与活动
	getReloadPoster: baseUrl + '/activity/loadPoster',//加载海报
	exitActivity: baseUrl + '/activity/exit',//退出活动

	/*投票*/
	getVoteList: baseUrl + '/vote/list',//获取投票列表
	getVoteDetail: baseUrl + '/vote/getInfo',//获取投票详情
	saveVoteOptions: baseUrl + '/vote/addBallot',//提交投票
	getVotePublish: baseUrl + '/vote/create',//发布投票
	getVoteStop: baseUrl + '/vote/stopVoteInfo',//停止投票
	delVote: baseUrl + '/vote/delVoteInfo',//删除投票

	/*话题*/
	getTopicList: baseUrl + '/topic/list',//获取话题列表
	getTopicDetail: baseUrl + '/topic/search',//话题详情
	saveTopicDiscuss: baseUrl + '/topic/createDiscuss',//提交评论
	changeTopicZan: baseUrl + '/topic/changeLike',//更改点赞状态
	getTopicPublish: baseUrl + '/topic/create',//话题发布
	topicTop: baseUrl + '/topic/top',//话题置顶
	topicDelete: baseUrl + '/topic/delete',//话题删除

	/*验证*/
	getDeviceCheck: baseUrl + '/device/check',//设备验证
	getDeviceSave: baseUrl + '/device/save',//设备注册
	getDeviceUpdate: baseUrl + '/device/update',//设备绑定

	getLockInfo: baseUrl + '/aplicationLock/getModel',//设备锁信息
	postLockUpdate: baseUrl + '/aplicationLock/update',//修改手势锁信息
	postUpdateRedis: baseUrl + '/login/updateRedis',//设置Redis
	checkPassword: baseUrl + '/login/checkUserName',//验证密码

	//防止重复提交redis
	submitUpdateRedis: baseUrl + '/redis/update',

	/*工作台*/
	getInvite: baseUrl + '/jobInvitation/list',//工作邀请列表
	getInviteDetails: baseUrl + '/jobInvitation/search',//工作邀请详情
	postInviteAddParticipants: baseUrl + '/jobInvitation/addjobParticipants',//添加工作邀请参与人员
	getInviteComment: baseUrl + '/jobInvitation/addDiscuss',//工作邀请评论
	getInvitePublish: baseUrl + '/jobInvitation/create',//工作邀请发布queryRecord
	getInviteFile: baseUrl + '/file/uploadAttachment',//上传附件
	getDiscussAttachList: baseUrl + '/jobInvitation/discussAttachList',//查询工作邀请附件
	getDownLoadAttachList: baseUrl + '/file/downloadAttachment',//下载附件
	completeJob: baseUrl + '/jobInvitation/complete',//工作邀请完成
	judgeJob: baseUrl + '/jobInvitation/acceptOrReject',//工作邀请同意或拒绝
	restartJob: baseUrl + '/jobInvitation/restart',//重启工作邀请

	getUserList: baseUrl + '/userAndDept/queryAllUsers',//查询联系人列表
	getParticipantsList: baseUrl + '/userAndDept/queryDeptsAndUsersByDeptId',//查询参与人通讯录列表

	PCNotice: baseUrl + '/notice/save',//PC端通知

	/* 信鸽推送*/
	pushNotification: baseUrl + '/push/xgSend',//发送通知
	pushTagNotification: baseUrl + '/push/xgTag',//操作标签
	updateToken: baseUrl + '/device/upateToken',//更新token

	//验证四中消息类型
	checkingTopic: baseUrl + '/topic/isExist',//验证话题是否存在
	checkingVote: baseUrl + '/vote/isExist',//验证投票是否存在
	checkingActivity: baseUrl + '/activity/isExist',//验证活动是否存在
	checkingAnnounce: baseUrl + '/announcement/queryByBodyId',//验证公告是否存在

	/* 离线消息 */
	getOfflineMsg: baseUrl + '/offlineMessage/batchUpdateAndQuery',//获取离线消息和更新时间
	updatePCOfflineTime: baseUrl + '/offlineMessage/batchUpdate',//更新PC离线消息时间

	/** 删除公告*/
	deleteAnnouncement: baseUrl + '/announcement/delete',//删除公告
	/** 停止活动*/
	stopActive: baseUrl + '/activity/close',
	/** 修改活动*/
	alterActive: baseUrl + '/activity/update',

};
export default Path;
