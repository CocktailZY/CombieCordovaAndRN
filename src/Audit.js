import React, {Component} from 'react';
import {
	Platform, StyleSheet,
	Text, View, TouchableOpacity,
	Dimensions, NativeModules,
} from 'react-native';
import Header from './component/common/Header';
import Path from "./config/UrlConfig";
import FetchUtil from "./util/FetchUtil";
import RedisUtil from './util/RedisUtil';
import DeviceInfo from 'react-native-device-info';
import Sqlite from "./util/Sqlite";
import XmlUtil from "./util/XmlUtil";
import UUIDUtil from "./util/UUIDUtil";
import Toast, {DURATION} from 'react-native-easy-toast';
import XGPush from 'react-native-xinge-push';
import HandlerOnceTap from './util/HandlerOnceTap';
import ListenerUtil from './util/ListenerUtil';

/**
 * 基础样式组件
 */
import baseStyles from './commen/styles/baseStyles';

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();

const uuid = DeviceInfo.getUniqueID().replace(/\-/g, '');
const Height = Dimensions.get('window').height;
let token = '';
export default class Audit extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			uuId: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			ticket: props.navigation.state.params.ticket,
			msgTitleTop: '设备绑定申请已发出',//顶部提示语
			msgTitleBottom: '正等待审核...',//顶部提示语
			againSave: false,
			token: token,
			groupListData: []//群列表
		}
		// 注册
		XGPush.register(this.state.basic.userId)
			.then(result => {
				// do something
				console.log(result);
				token = result;
				console.log('-token-');
				// console.log(XGPush.getToken());
			})
			.catch(err => {
				console.log(err);
			});
	};

	componentDidMount() {

		this.timer = setInterval(this._getCheck, 3000);
		if (Platform.OS == 'android') {
            if(ListenerUtil['Audit_LoginErrorListener']){ListenerUtil['Audit_LoginErrorListener'].remove();}
            ListenerUtil['Audit_LoginErrorListener'] = XMPP.on('loginError', (message) => console.log('LOGIN ERROR:' + message));
            if(ListenerUtil['Audit_LoginSuccessListener']){ListenerUtil['Audit_LoginSuccessListener'].remove();}
            ListenerUtil['Audit_LoginSuccessListener'] = XMPP.on('login', (message) => {
				XMPP.sendStanza(XmlUtil.loginStatus());
				//this._getAuditCheck();
				RedisUtil.update(uuid, this.props.navigation, {
					ticket: this.state.ticket,
					userId: this.state.basic.userId,
					uuId: uuid
				},'redis','front', () => {
					RedisUtil.update(uuid, this.props.navigation, {
						ticket: this.state.ticket,
						userId: this.state.basic.userId,
						uuId: uuid
					},'lineStatus','front', () => {
						this._getModelInfor();
					})

				});
			});//登录成功回调
		}
	};


	_getModelInfor = () => {
		let url = Path.getLockInfo + '?userId=' + this.state.basic.userId + '&uuId=' + uuid + '&ticket=' + this.state.ticket;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (data) => {

			//android群出席
			if (Platform.OS == 'android') {
				this.state.groupListData.map((item) => {
					// let groupPerscence = XmlUtil.enterGroup(item.roomJid + Path.xmppGroupDomain + '/' + this.state.basic.jidNode);
					// XMPP.sendStanza(groupPerscence);
					XMPP.joinRoom(item.roomJid + Path.xmppGroupDomain, this.state.basic.jidNode);
				});
			}
			ListenerUtil.remove();
			this.props.navigation.navigate('Index', {
				token: this.state.token,
				ticket: this.state.ticket,
				basic: this.state.basic,
				uuid: this.state.uuId,
				loginType: 'unauto'
			});
		});
	}

	_getCheck = () => {
		console.log('get check');
		let text1 = '', text2 = '', show = false;
		let checkUrl = Path.getDeviceCheck + '?userId=' + this.state.basic.userId + '&uuId=' + uuid + '&ticket=' + this.state.ticket;
		FetchUtil.netUtil(checkUrl, {}, 'GET', this.props.navigation, '', (data) => {
			console.log(data);
			if (data.code.toString() == '200') {
				if (data.data.examineStatus == 0) {
					text1 = '设备绑定申请已发出，';
					text2 = '正等待审核...'
					show = false;
				} else if (data.data.examineStatus == 1) {
					clearInterval(this.timer);
					text1 = '设备绑定申请已发出，';
					text2 = '正等待审核...'
					show = false;
					let url = Path.getAllGroups + '?occupantJid=' + this.state.basic.jidNode + '&uuId=' + uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId;
					FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, {
							uuId: uuid,
							userId: this.state.basic.userId,
							ticket: this.state.ticket
						}, (responseJson) => {
							let groupList = responseJson.data;
							if (responseJson.code.toString() == '200') {


								if (Platform.OS == 'android') {
									this.setState({
										groupListData: groupList
									}, () => {
										// XMPP.trustHosts([Path.xmppDomain]);
										XMPP.disconnect();
										XMPP.connect(this.state.basic.jidNode + '@' + Path.xmppHost + '/' + this.state.basic.userId+new Date().getTime(), 'android#' + this.state.ticket);
									});
								} else {

									XMPP.XMPPLoginAccount(
										{
											'account': this.state.basic.jidNode,
											'password': 'android#' + this.state.ticket,
											'uuid': uuid,
											'username': this.state.basic.trueName,
											'userId': this.state.basic.userId + new Date().getTime()

										},
										(error, event) => {

											if (event == '登录成功') {
												this._getModelInfor();
												RedisUtil.update(uuid, this.props.navigation, {
													ticket: this.state.ticket,
													userId: this.state.basic.userId,
													uuId: uuid
												},'redis','front', () => {
													RedisUtil.update(uuid, this.props.navigation, obj,'lineStatus','front', () => {
														groupList.map((item) => {
															XMPP.XMPPMapgroupes(
																{
																	'roomJid': item.roomJid,
																	'account': this.state.basic.jidNode
																},
																(error, event) => {
																	if (error) {
																		this.refs.toast.show(error, DURATION.LENGTH_SHORT);

																	} else {
																		this.refs.toast.show(event, DURATION.LENGTH_SHORT);

																	}
																}
															)
														});
														XMPP.loginNext({
															'from': this.state.basic.jidNode + "@" + Path.xmppDomain + "/" + this.state.basic.jidNode,
															'id':  UUIDUtil.getUUID().replace(/\-/g, '')
														});
													})

												});

											} else {
												this.refs.toast.show(event, DURATION.LENGTH_SHORT);

												return;
											}

										}
									)

								}
							} else {
								alert('系统异常');
							}
							Sqlite.init(this.state.basic.userId);
							// this.props.navigation.navigate('Index',{ticket:ticket,basic:userInfo,uuid:uuid});
						}
					);
				} else if (data.data.examineStatus == 2) {
					show = true;
					text1 = '设备绑定申请未通过！';
					clearInterval(this.timer);
				}
				this.setState({
					msgTitleTop: text1,
					msgTitleBottom: text2,
					againSave: show
				})
			}
		})
	}

	_getUpdate = (type) => {
		let device = DeviceInfo.getModel();
		console.log('get save')
		FetchUtil.netUtil(Path.getDeviceUpdate, {
			model: device,
			userName: this.state.basic.trueName,
			examineStatus: 0,
			token: token,
			platform: Platform.OS === 'ios' ? 'ios' : 'android',
			type: type
		}, 'POST', this.props.navigation, {
			uuId: this.state.uuId,
			userId: this.state.basic.userId,
			ticket: this.state.ticket
		}, (str) => {
			console.log(str)
			if (str.code.toString() == '200') {
				this._getCheck();
				this.timer = setInterval(this._getCheck, 3000);
			}
		})
	}

	render() {
		//按钮样式
		const btnView = this.state.againSave ? (
			<TouchableOpacity
				style={[baseStyles.row_col_center,styles.btnView]}
				onPress={()=>{HandlerOnceTap(this._getUpdate.bind(this, 'mySelf'))}}>
				<Text style={[baseStyles.color_white,{fontSize: 16}]}>点击重新绑定</Text>
			</TouchableOpacity>
		) : null;
		//视图渲染
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
				<Header
					headLeftFlag={false}
					headRightFlag={true}
					titleStyle={[baseStyles.flex_one,baseStyles.text_center,baseStyles.color_white,styles.auditTitle]}
					title={'绑定提示'}
					isText={true}
					rightText={'重新登录'}
					rightTextStyle={styles.auditRightText}
					onPressRightBtn={() => {
						clearInterval(this.timer);
						this.props.navigation.navigate('Login')
					}}
				/>
				<View style={[baseStyles.flex_one,styles.contentFirst]}>
					<Text style={[styles.msgTitleTop,styles.msgTitleTopHeight]}>{this.state.msgTitleTop}</Text>
					<Text style={styles.msgTitleTop}>{this.state.msgTitleBottom}</Text>
					{btnView}
					<Text style={[styles.bottomText,{marginTop: 20}]}>{'您还可以联系管理员,'}</Text>
					<Text style={styles.bottomText}>{`您的设备编码是：${this.state.uuId}`}</Text>
				</View>
			</View>
		)
	}
}

//样式
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
})
