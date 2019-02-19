import React, {Component} from "react";
import {
	Platform,
	StyleSheet,
	View,
	Image,
	Dimensions,
	NativeModules,
	DeviceEventEmitter,
	NetInfo,
	BackHandler
} from "react-native";
import FetchUtil from "./util/FetchUtil";
import Path from "./config/UrlConfig";
import DeviceInfo from "react-native-device-info";
import FileSystem from "react-native-filesystem";
import RNFS from "react-native-fs";
import XmlUtil from "./util/XmlUtil";
import RedisUtil from "./util/RedisUtil";
import cookie from "./util/cookie";
import XGPush from "react-native-xinge-push";
import Sqlite from "./util/Sqlite";
import {DURATION} from "react-native-easy-toast";
import Toast from "react-native-easy-toast";
import UUIDUtil from "./util/UUIDUtil";
import ListenerUtil from './util/ListenerUtil';

import Global from "./util/Global";
import ToolUtil from "./util/ToolUtil";
const StatusBarAndroid = Platform.select({
	ios: () => null,
	android: () => require("react-native-android-statusbar")
})();

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require("react-native-xmpp")
})();

const uuid = DeviceInfo.getUniqueID().replace(/\-/g, "");
const {height, width} = Dimensions.get("window");
// StatusBarAndroid.hideStatusBar();

let token = XGPush.getToken();
export default class Welcome extends Component {
	constructor(props) {
		super(props);
		this.state = {
			autoLogin: false,
			userInfo: {},
			nowPage: 'Welcome',
			groupList: [],
			offlineNum: 0,//离线监听数量
		}
	}

	componentDidMount() {
        Global.headPhotoNum = new Date().getTime();//头像刷新值
		if (this.changeRoute) {
			this.changeRoute.remove()
		}
		this.changeRoute = DeviceEventEmitter.addListener('changeRoute', (nowRoute) => {
			this.setState({
				nowPage: nowRoute.routeName
			})
		});
		NetInfo.isConnected.fetch().done((isConnected) => {
			if (isConnected) {
				this._initXGPush();
				this._readLocalFile();
				let isUpdate = false;
				if (ListenerUtil['Welcome_NetInfoListener']) {
					ListenerUtil['Welcome_NetInfoListener'].remove();
				}
				ListenerUtil['Welcome_NetInfoListener'] = NetInfo.isConnected.addEventListener(
					'connectionChange',
					(data) => {
						if (isUpdate) {
							NetInfo.isConnected.fetch().done((connected) => {
								if (connected) {
									this._initXGPush();
									this._readLocalFile();
								} else {
									this.refs.toast.show('请检查当前网络状态!', DURATION.LENGTH_SHORT);
								}
							})
						}
						isUpdate = true;
					});
			} else {
				if(Platform.OS == "android"){
                    this.refs.toast.show('请检查当前网络状态!', DURATION.LENGTH_SHORT);
                }
				if (ListenerUtil['Welcome_NetInfoListener']) {
					ListenerUtil['Welcome_NetInfoListener'].remove();
				}
				ListenerUtil['Welcome_NetInfoListener'] = NetInfo.isConnected.addEventListener(
					'connectionChange',
					(data) => {
						NetInfo.isConnected.fetch().done((connected) => {
							if (connected) {
                                this._initXGPush();
								this._readLocalFile();
							} else {
								this.refs.toast.show('请检查当前网络状态!', DURATION.LENGTH_SHORT);
							}
						})
					});
			}
		});
		//物理返回键监听
        ListenerUtil['welcome_BackKey'] = BackHandler.addEventListener("back", () => {
			console.log('W禁用back页面');
			return true;
		});
	}

	componentWillUnmount() {
		this.changeRoute.remove();
	}

	//读取本地文件
	_readLocalFile = () => {
		FileSystem.fileExists(
			"my-directory/my-file.txt",
			FileSystem.storage.important
		).then(res => {
			if (res) {
				if (Platform.OS == "android") {
					RNFS.readFile(
						"/data/data/com.instantmessage/files/RNFS-Important/my-directory/my-file.txt",
						"utf8"
					)
						.then(result => {
							let temp_userInfo = JSON.parse(result);
							temp_userInfo.tigUser["groupId"] = temp_userInfo.groupId;
							temp_userInfo.tigUser["demoAccount"] = temp_userInfo.demoAccount;
                            Global.basicParam.ticket = temp_userInfo.ticket;
                            Global.basicParam.uuId = uuid;
                            Global.basicParam.userId = temp_userInfo.tigUser.userId;
							this.setState(
								{
									autoLogin: true,
									userInfo: temp_userInfo
								},
								() => {
									FetchUtil.netUtil(
										Path.autoLogin +
										"?userId=" +
										this.state.userInfo.tigUser.userId +
										"&uuId=" +
										uuid +
										"&ticket=" +
										this.state.userInfo.ticket,
										{},
										"GET",
										this.props.navigation,
										"welcome",
										responseJson => {
											if (responseJson == "tip") {
												this.refs.toast.show(
													"网络异常",
													DURATION.LENGTH_SHORT
												);
											} else if (responseJson.code.toString() == "200") {
												Sqlite.init(this.state.userInfo.tigUser.userId);
												if (ListenerUtil['Welcome_OfflineMessageListener']) {
													ListenerUtil['Welcome_OfflineMessageListener'].remove();
												}
												ListenerUtil['Welcome_OfflineMessageListener'] = XMPP.on("offlineMessage", message => {
														if (message.body) {
															this.setState({
																offlineNum: this.state.offlineNum + 1
															},()=>{
																let body = typeof message.body == "string" ? JSON.parse(message.body) : message.body;
																Sqlite.selectTalkers(
																	this.state.userInfo.tigUser.userId,
																	body.basic.fromId,
																	data => {
																		let messageType = "";
																		if (
																			body.type + "" &&
																			body.type + "" == "0"
																		) {
																			messageType = "text";
																		} else if (body.type && body.type == "2") {
																			if (
																				body.content.file[0].listFileInfo[0]
																					.showPic == "img"
																			) {
																				messageType = "image";
																			} else if (
																				body.content.file[0].listFileInfo[0]
																					.showPic == "audio"
																			) {
																				messageType = "voice";
																			} else {
																				messageType = "file";
																			}
																		}
																		let tempType = messageType;
																		if (data.length > 0) {
																			Sqlite.saveMessage(
																				this.state.userInfo.tigUser.userId,
																				body.basic.fromId,
																				tempType,
																				HtmlUtil.htmlDecodeByRegExp(body.content.interceptText),
																				"",
																				body.id,ToolUtil.strToStemp(body.content.sendTime),
																				data => {
																					Sqlite.updateTalker(
																						this.state.userInfo.tigUser.userId,
																						body.basic.fromId,
																						this.state.offlineNum,
																						false,
																						null,
																						false,
																						() => {
																							// DeviceEventEmitter.emit('refreshPage', 'refresh');
																						}
																					);
																				}
																			);
																		} else {
																			let tempType =
																				body.type == 0 ||
																				body.content.type == "0" ||
																				body.content.type == "text"
																					? "text"
																					: body.messageType;
																			Sqlite.saveTalker(
																				//userId,type,jid,jid_nade,trueName,imageName,callback
																				this.state.userInfo.tigUser.userId,
																				1,
																				body.basic.fromId +
																				"@" +
																				Path.xmppDomain,
																				body.basic.fromId,
																				body.basic.userName,
																				body.basic.photoId,
																				false,
																				false,
																				false,
																				() => {
																					Sqlite.saveMessage(
																						this.state.userInfo.tigUser.userId,
																						body.basic.fromId,
																						tempType,
																						HtmlUtil.htmlDecodeByRegExp(body.content.interceptText),
																						"",
																						body.id,ToolUtil.strToStemp(body.content.sendTime),
																						data => {
																							Sqlite.updateTalker(
																								this.state.userInfo.tigUser
																									.userId,
																								body.basic.fromId,
																								this.state.offlineNum,
																								false,
																								null,
																								false,
																								() => {
																									// DeviceEventEmitter.emit('refreshPage', 'refresh');
																								}
																							);
																							// }
																						}
																					);
																				}
																			);
																		}
																	}
																);
															});
														}
													}
												);
												if (ListenerUtil['Welcome_loginErrorListener']) {
													ListenerUtil['Welcome_loginErrorListener'].remove();
												}
												ListenerUtil['Welcome_loginErrorListener'] = XMPP.on("loginError", message =>
													console.log("login-LOGIN ERROR:" + message)
												);
												if (ListenerUtil['Welcome_loginSuccessListener']) {
													ListenerUtil['Welcome_loginSuccessListener'].remove();
												}
												ListenerUtil['Welcome_loginSuccessListener'] = XMPP.on("login", message => {
													this.XGRegister();
													// Sqlite.init(this.state.userInfo.tigUser.userId);
													XMPP.sendStanza(XmlUtil.loginStatus());
													//this._getAuditCheck();
													let tempIq =
														'<iq xmlns="jabber:client" from="' +
														this.state.userInfo.tigUser.jidNode +
														"@" +
														Path.xmppDomain +
														"/" +
														this.state.userInfo.tigUser.jidNode +
														'" id="' +
														UUIDUtil.getUUID() +
														'" type="set"><enable xmlns="urn:xmpp:carbons:2"/></iq>';
													XMPP.sendStanza(tempIq);
                                                    let roomJids = "";
                                                    this.state.groupList.map(item => {
                                                        Global.groupMute[item.roomJid] = item.mute;
                                                        if(roomJids != ""){roomJids += ",";}
                                                        roomJids += item.roomJid + Path.xmppGroupDomain;
                                                    });
                                                    XMPP.joinRoomNewThread(roomJids, this.state.userInfo.tigUser.jidNode);
													let obj = {
														ticket: this.state.userInfo.ticket,
														userId: this.state.userInfo.tigUser.userId,
														uuId: uuid
													};
													RedisUtil.update(uuid, this.props.navigation, obj, "redis", "front", () => {
															RedisUtil.update(uuid, this.props.navigation, obj, "lineStatus", "front", () => {
																	ListenerUtil.remove(['Welcome_OfflineMessageListener']);
																	DeviceEventEmitter.emit('changeRoute', [{routeName: 'Message'}]);
                                                                	this.props.navigation.navigate('Index', {
																		token: token,
																		ticket: this.state.userInfo.ticket,
																		basic: this.state.userInfo.tigUser,
																		uuid: uuid,
																		loginType: 'auto'//这里是为了不执行手势锁
																	});
																	this._getModelInfor();
																}
															);
														}
													);
												}); //登录成功回调
												this._getAllGroups();
												// this._checkType();
											}
										}
									);
								}
							);
						})
						.catch(err => {
							console.log(err);
						});
				} else {
					FileSystem.readFile(
						"my-directory/my-file.txt",
						FileSystem.storage.important
					).then(response => {
						let temp_userInfo = JSON.parse(response);
						temp_userInfo.tigUser["groupId"] = temp_userInfo.groupId;
						temp_userInfo.tigUser["demoAccount"] = temp_userInfo.demoAccount;
						this.setState(
							{
								autoLogin: true,
								userInfo: temp_userInfo
							},
							() => {
								FetchUtil.netUtil(
									Path.autoLogin +
									"?userId=" +
									this.state.userInfo.tigUser.userId +
									"&uuId=" +
									uuid +
									"&ticket=" +
									this.state.userInfo.ticket,
									{},
									"GET",
									this.props.navigation,
									"welcome",
									responseJson => {

										if (responseJson == "tip") {
											this.refs.toast.show(
												"网络异常",
												DURATION.LENGTH_SHORT
											);
										} else if (responseJson.code.toString() == "200") {
											this._getAllGroups();
										}
									}
								);
							}
						);
					});
				}
			} else {
				this.setState(
					{
						autoLogin: false
					},
					() => {
						ListenerUtil.remove();
						this.props.navigation.navigate("Login", {
							autoLogin: this.state.autoLogin
						});
					}
				);
			}
		});
	};

    //信鸽初始化
    _initXGPush = () => {
        if (Platform.OS === "android") {
            XGPush.init(Path.androidAccessId, Path.androidAccessKey);
        } else {
            XGPush.init(Path.iosAccessId, Path.iosAccessKey);
        }
        XGPush.setHuaweiDebug(true);
        // 小米
        XGPush.initXiaomi("2882303761517867697", "5371786731697");
        // 魅族
        XGPush.initMeizu("115815", "b9d2df23298c41cf8ba126a5ed475ab7");
        XGPush.enableOtherPush(true);
        //注册监听
        XGPush.addEventListener("register", (deviceToken) =>{
            this._updateDeviceToken(deviceToken);
        });
        //穿透消息监听
        XGPush.addEventListener('message', (message)=>{
            console.log('收到透传消息: ' + message.content);
        });
        //通知时间监听（到达、点击、消失）
        XGPush.addEventListener('notification', (notification)=>{
            console.log('app收到通知' + JSON.stringify(notification));
            console.log('是否被点击：' + notification.clicked);
        });
    };

    //信鸽注册
    XGRegister() {
        // 注册
        XGPush.register(this.state.userInfo.userId)
            .then(result => {

            })
            .catch(err => {
                console.log(err);
            });
    }

	//更新服务器信鸽token值
	_updateDeviceToken = (deviceToken) => {
		if (deviceToken) {
			FetchUtil.netUtil(
				Path.updateToken,
				{
					token: deviceToken ? deviceToken : "-1"
				},
				"POST",
				this.props.navigation,
				{
					ticket: Global.basicParam.ticket,
					userId: Global.basicParam.userId,
					uuId: Global.basicParam.uuId
				},
				data => {
					if (data.code.toString() == "200") {
						console.log('更新token成功:'+deviceToken);
					}
				},
				true
			);
		}
	};

	//获取所有群组
	_getAllGroups = () => {
		let url = Path.getAllGroups +
			"?occupantJid=" +
			this.state.userInfo.tigUser.jidNode +
			"&uuId=" +
			uuid +
			"&ticket=" +
			this.state.userInfo.ticket +
			"&userId=" +
			this.state.userInfo.tigUser.userId;
		FetchUtil.netUtil(
			url,
			{},
			"GET",
			this.props.navigation,
			{
				uuId: uuid,
				userId: this.state.userInfo.tigUser.userId,
				ticket: this.state.userInfo.ticket
			},
			responseJson => {
				let groupList = responseJson.data;
				if (responseJson.code.toString() == "200") {
					if (Platform.OS == "android") {
						this.setState({
							groupList: groupList
						});
						XMPP.disconnect();
						XMPP.connect(
							this.state.userInfo.tigUser.jidNode +
							"@" +
							Path.xmppHost +
							"/" +
							this.state.userInfo.tigUser.userId +
							new Date().getTime(),
							"android#" + this.state.userInfo.ticket
						);
					} else {
						//ios
						XMPP.XMPPDisConnect();
						XMPP.XMPPLoginAccount(
							{
								account: this.state.userInfo.tigUser.jidNode,
								password: "android#" + this.state.userInfo.ticket,
								uuid: uuid,
								username: this.state.userInfo.tigUser.trueName,
								userId: this.state.userInfo.tigUser.userId + new Date().getTime()
							},
							(error, event) => {
								if (event == "登录成功") {
									this.XGRegister();
									//this._getModelInfor();
									groupList.map(item => {
										Global.groupMute[item.roomJid] = item.mute;
										XMPP.XMPPMapgroupes(
											{
												roomJid: item.roomJid,
												account: this.state.userInfo.tigUser.jidNode
											},
											(error, event) => {
												if (error) {
													// this.refs.toast.show(error,DURATION.LENGTH_SHORT);
												}
											}
										);
									});
									//离线报文
									XMPP.loginNext({
										'from': this.state.userInfo.tigUser.jidNode + "@" + Path.xmppDomain + "/" + this.state.userInfo.tigUser.jidNode,
										'id': UUIDUtil.getUUID().replace(/\-/g, '')
									});
									RedisUtil.update(
										uuid,
										this.props.navigation,
										{
											ticket: this.state.userInfo.ticket,
											userId: this.state.userInfo.tigUser.userId,
											uuId: uuid
										},
										"redis",
										"front",
										() => {
											if (this.state.nowPage.indexOf('Welcome') != -1) {
												DeviceEventEmitter.emit('changeRoute', [{routeName: 'Message'}]);
												this.props.navigation.navigate('Index', {
													token: token,
													ticket: this.state.userInfo.ticket,
													basic: this.state.userInfo.tigUser,
													uuid: uuid,
													loginType: 'auto'//这里是为了不执行手势锁
												});
											}
										}
									);
								}else {
									this.props.navigation.navigate("Login", {
										autoLogin: this.state.autoLogin
									});
								}
							}
						);
					}
				}
			});
	}

	// 获取设备信息
	_getModelInfor = () => {
		// console.log('获取设备 func');
		let url =
			Path.getLockInfo +
			"?userId=" +
			this.state.userInfo.tigUser.userId +
			"&uuId=" +
			uuid +
			"&ticket=" +
			this.state.userInfo.ticket;
		FetchUtil.netUtil(url, {}, "GET", this.props.navigation, "", data => {
			if (data.code.toString() == "200") {
				if (Platform.OS == "android") {
					let urlGroupList =
						Path.getAllGroups +
						"?occupantJid=" +
						this.state.userInfo.tigUser.jidNode +
						"&uuId=" +
						uuid +
						"&ticket=" +
						this.state.userInfo.ticket +
						"&userId=" +
						this.state.userInfo.tigUser.userId;
					FetchUtil.netUtil(
						urlGroupList,
						{},
						"GET",
						this.props.navigation,
						{
							uuId: uuid,
							userId: this.state.userInfo.tigUser.userId,
							ticket: this.state.userInfo.ticket
						},
						responseJson => {
							let groupList = responseJson.data;
							groupList.map(item => {
								// let groupPerscence = XmlUtil.enterGroup(item.roomJid + Path.xmppGroupDomain + '/' + this.state.userInfo.tigUser.jidNode);
								// XMPP.sendStanza(groupPerscence);
								XMPP.joinRoom(
									item.roomJid + Path.xmppGroupDomain,
									this.state.userInfo.tigUser.jidNode
								);
							});
						}
					); //群出席
				}
				let resetBody = JSON.parse(JSON.stringify(data.data));
				resetBody.errorCount = 0;
				FetchUtil.netUtil(
					Path.postLockUpdate,
					resetBody,
					"POST",
					this.props.navigation,
					{
						userId: this.state.userInfo.tigUser.userId,
						uuId: uuid,
						ticket: this.state.userInfo.ticket
					},
					data => {
						// console.log(data);
						if (data.code.toString() == "200") {
							cookie.save("modelInfor", resetBody);
						}
					}
				);

				if (Platform.OS == 'android') {
					ListenerUtil.remove(['Welcome_OfflineMessageListener']);
					DeviceEventEmitter.emit('changeRoute', [{routeName: 'Message'}]);
					this.props.navigation.navigate('Index', {
						token: token,
						ticket: this.state.userInfo.ticket,
						basic: this.state.userInfo.tigUser,
						uuid: uuid,
						loginType: 'auto'//这里是为了不执行手势锁
					});
				}
			}
		});
	};

	render() {
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={3000}/>
				{/*<Image source={require('./images/')}/>*/}
				<View
					style={{flex: 1, justifyContent: "center", alignItems: "center"}}
				>
					<Image
						source={require("./images/beginPage.jpg")}
						style={{width: width, height: height}}
					/>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#e2e2e2"
	}
});
