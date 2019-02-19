export default Global = {
	basicParam: {
		ticket: '',
		uuId: '',
		userId: ''
	},//基础参数
	parseBasicParam:'',//拼接后的基础参数
	loginUserInfo:{},//登录人信息
	personnel_photoId: {},
	chat_detail: {},
	netWorkStatus_old: false,//历史网络状态
	netWorkStatus_new: false,//当前网络状态
	updateFlag: null,//更新单聊未读条数标记
	headPhotoNum:null,
	groupMute:{}//群组是否禁言列表
}