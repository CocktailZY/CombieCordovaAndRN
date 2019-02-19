import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	Platform,
	ScrollView,
	Modal,
	Dimensions,
	DeviceEventEmitter,
	NativeModules
} from 'react-native';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import UUIDUtil from '../../util/UUIDUtil'
import XmlUtil from "../../util/XmlUtil";
import FormatDate from "../../util/FormatDate";
import ParamsDealUtil from '../../util/ParamsDealUtil';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import PCNoticeUtil from "../../util/PCNoticeUtil";
import Toast, {DURATION} from 'react-native-easy-toast';

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();
const WIDTH = Dimensions.get('window').width;

let noticeBody = {};
export default class GroupJurisdiction extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			room: props.navigation.state.params.room,
			memberList: props.navigation.state.params.basicMemberList,
			nowAffiliation: props.navigation.state.params.nowAffiliation,
			groupOwner: props.navigation.state.params.groupOwner,//群主jidNode
			dataMemberList: [],
			modalVisible: false,
			muteJidNode: '',//禁言对象jidNode
			modeType: '',//创建节点三步骤，发布消息的mode类型
			muteName: '',
			adminJidNode: '',//管理员对象jidNode
			adminName: '',
			isSetAdmin: false,
			messageBody: {
				"id": UUIDUtil.getUUID().replace(/\-/g, ''),
				"type": 0,
				"messageType": 'text',
				"basic": {
					"userId": props.navigation.state.params.basic.jidNode,
					"userName": props.navigation.state.params.basic.trueName,
					"head": props.navigation.state.params.room.head,
					"sendTime": new Date().getTime(),
					"groupId": props.navigation.state.params.room.roomJid,
					"type": "groupChat",
					'groupName': props.navigation.state.params.room.roomName,
				},
				"content": {
					"text": '',
					"interceptText": '',
					"file": []
				},
				"atMembers": [],
				"occupant": {
					"state": '',
					"effect": '',
					"active": props.navigation.state.params.basic.trueName
				}
			}
		};
		this.dealJidNode = '';
	}


	componentDidMount() {
		if (Platform.OS == 'android') {

			this.groupIq = XMPP.on('iq', (iq) => this._XMPPdidReceiveIQ(iq));
		}
		this.getMemberList();
	};

	componentWillUnmount() {
		if (Platform.OS == 'android') {
			this.groupIq.remove();
		}

	}

	_XMPPdidReceiveIQ = (iq) => {

		if (iq.type == 'result' && this.metuNodeStatue) {
			//发送订阅
			let tempJinNode = this.state.isSetAdmin ? this.state.adminJidNode : this.state.muteJidNode;
			let sendMetuReadIqToGroup = XmlUtil.subscriptionToGroup(tempJinNode + '@' + Path.xmppDomain, this.join);
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.metuNodeStatue = false;
			this.metuReadStatue = true;
		}

		if (iq.type == 'result' && this.metuReadStatue && iq.pubsub && iq.pubsub.subscription) {
			//发布消息
			let tempJinNode = this.state.isSetAdmin ? this.state.adminJidNode : this.state.muteJidNode;
			let sendMetuReadIqToGroup = XmlUtil.sendMessageGroup(this.state.room.roomJid, tempJinNode, this.state.basic.jidNode, this.join, this.state.modeType);
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.metuReadStatue = false;
			this.metuPublishMessageStatue = true;
		}

		if (iq.type == 'result' && this.metuPublishMessageStatue && iq.pubsub && iq.pubsub.publish) {

			PCNoticeUtil.pushPCNotification(noticeBody.roomJid,
				noticeBody.occupantJid,
				noticeBody.node,
				noticeBody.effect,
				noticeBody.active,
				noticeBody.message,
				{
					uuId: this.state.uuid, ticket: this.state.ticket, userId: this.state.basic.userId
				}, this.props.navigation, () => {
					if (this.state.isSetAdmin) {
						let setAdmin = XmlUtil.setAdmin(this.state.room.roomJid + Path.xmppGroupDomain, this.state.basic.jidNode,'admin','管理员');
						XMPP.sendStanza(setAdmin);
					}

					//发消息
					let sendMsgToGroup = XmlUtil.sendGroup('groupchat', this.state.room.roomJid + Path.xmppGroupDomain, JSON.stringify(this.mes), this.mes.id);
					XMPP.sendStanza(sendMsgToGroup);
					this.metuPublishMessageStatue = false;
					// this.props.navigation.goBack();
				});
		}


	};

	getMemberList = () => {
		let list = this.state.memberList,
			arrey = [];
		for (let i in list) {
			if (this.state.nowAffiliation == "owner") {
				if (list[i].affiliation != "owner") {
					arrey.push(list[i]);
				}
			} else {
				if (list[i].affiliation == "member") {
					arrey.push(list[i]);
				}
			}
		}
		this.setState({dataMemberList: arrey});
	}

	render() {
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'返回'}
					title={'修改权限'}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					style={{flex: 1, paddingLeft: 8, paddingRight: 8}}>
					{
						this.state.dataMemberList.map((item, index) => {
							console.log('群权限列表');
							console.log(item);
							let affiliationName = item.affiliation == 'member' ? "admin" : "member";
							let showName = item.trueName ? item.trueName : item.occupantTrueName;
							if (this.state.basic.jidNode != item.occupantJid) {
								return (
									<View
										style={[styles.itemContent, {borderTopColor: index == 0 ? 'transparent' : '#d7d7d7'}]}
										key={index}>
										<Image
											source={{uri:
                                            	Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + (item.photoId ? item.photoId : item.occupantPhotoId) + '&imageId=' + (item.photoId ? item.photoId : item.occupantPhotoId) + '&sourceType=singleImage&jidNode=' + "" + '&platform=' + Platform.OS
												// Path.headImg + '?uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&ticket=' + this.state.ticket + '&fileName=' + (item.photoId ? item.photoId : item.occupantPhotoId)
											}}
											style={styles.itemImage}/>
										<Text
											style={{flex: 1}}>{showName}</Text>
										{
											this.state.nowAffiliation == "owner" ? (
												<TouchableOpacity
													style={[styles.itemBtn, {backgroundColor: item.affiliation == 'member' ? '#549dff' : '#c1c1c1'}]}
													onPress={() => {
														HandlerOnceTap(
															() => {
																this.setState({
																	isSetAdmin: true
																})
																this.getGroupAffiliation(item.occupantJid, affiliationName, showName);

															}
														)
													}}>
													<Text
														style={styles.itemBtnText}>{item.affiliation == 'member' ? '设为管理员' : '取消管理员'}</Text>
												</TouchableOpacity>
											) : null
										}
										{
											this.state.nowAffiliation == "owner" ? (
												<TouchableOpacity
													style={[styles.itemBtn, {backgroundColor: item.mute == 0 ? '#ff5728' : '#c1c1c1'}]}
													onPress={() => {
														HandlerOnceTap(
															() => {
																this.dealJidNode = item.trueName;
																if (item.mute == 0) {
																	this.setState({
																		modalVisible: true,
																		muteJidNode: item.occupantJid,
																		muteName: showName,
																		modeType: 'SETMUTE'
																	});
																} else {
																	this.setState({
																		muteJidNode: item.occupantJid,
																		muteName: showName,
																		modeType: 'SETUNMUTE'
																	}, () => {
																		this.getGroupMute('unmute');
																	});
																}
															}
														)
													}}>
													<Text style={styles.itemBtnText}>{item.mute == 0 ? '     禁言     ' : ' 取消禁言 '}</Text>
												</TouchableOpacity>
											) : (
												item.affiliation == 'member' ? (
													<TouchableOpacity
														style={[styles.itemBtn, {backgroundColor: item.mute == 0 ? 'red' : '#ccc'}]}
														onPress={() => {
															HandlerOnceTap(
																() => {
																	this.dealJidNode = item.trueName;
																	if (item.mute == 0) {
																		this.setState({
																			modalVisible: true,
																			muteJidNode: item.occupantJid,
																			muteName: showName,
																			modeType: 'SETMUTE'
																		});
																	} else {
																		this.setState({
																			muteJidNode: item.occupantJid,
																			muteName: showName,
																			modeType: 'SETUNMUTE'
																		}, () => {
																			this.getGroupMute('unmute');
																		});
																	}
																}
															)
														}}>
														<Text style={styles.itemBtnText}>{item.mute == 0 ? '     禁言     ' : ' 取消禁言 '}</Text>
													</TouchableOpacity>
												) : null
											)
										}
									</View>
								)
							}
						})
					}
				</ScrollView>
				<Modal//modal弹出禁言天数选择
					visible={this.state.modalVisible}
					animationType={"slide"}
					transparent={false}
					onRequestClose={() => this.setState({modalVisible: false})}>
					<View style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0,0,0,0.2)'
					}}>
						<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
						<View style={{
							width: WIDTH * 0.7,
							height: 260,
							backgroundColor: 'white',
							justifyContent: 'center',
							alignItems: 'center',
							position: 'relative',
						}}>
							<TouchableOpacity style={styles.modalBtn} onPress={() => {
								HandlerOnceTap(
									() => {
										this.getGroupMute('mute', 3);
									}
								)
							}}>
								<Text>3天</Text>
							</TouchableOpacity>
							<View style={{backgroundColor: '#dadada', height: 1, width: WIDTH * 0.5, margin: 5}}/>
							<TouchableOpacity style={styles.modalBtn} onPress={() => {
								HandlerOnceTap(
									() => {
										this.getGroupMute('mute', 7);
									}
								)
							}}>
								<Text>7天</Text>
							</TouchableOpacity>
							<View style={{backgroundColor: '#dadada', height: 1, width: WIDTH * 0.5, margin: 5}}/>
							<TouchableOpacity style={styles.modalBtn} onPress={() => {
								HandlerOnceTap(
									() => {
										this.getGroupMute('mute', 365);
									}
								)
							}}>
								<Text>永久</Text>
							</TouchableOpacity>
							<View style={{backgroundColor: '#b2b2b2', height: 1, width: WIDTH * 0.5, margin: 20}}/>
							<TouchableOpacity style={styles.modalBtn} onPress={() => {
								HandlerOnceTap(
									() => {
										this.setState({modalVisible: false, muteJidNode: ''});
									}
								)
							}}>
								<Text>取消</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		)
	}

	getGroupAffiliation = (id, type, name) => {
		console.log('设置管理员----');
		//实时调取接口查询是否为群主或管理员
		FetchUtil.netUtil(Path.isRoomAdmin + '?ticket=' + this.state.ticket + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&roomJid=' + this.state.room.roomJid + '&jidNode=' + this.state.basic.jidNode, {}, 'GET', this.props.navigation, '', (responseJson) => {
			if (responseJson.code.toString() == '200') {
				if (responseJson.data) {
					FetchUtil.netUtil(Path.isRoomAdmin + '?ticket=' + this.state.ticket + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&roomJid=' + this.state.room.roomJid + '&jidNode=' + id, {}, 'GET', this.props.navigation, '', (res) => {
						if (!res.data || this.state.groupOwner == this.state.basic.jidNode) {
							console.log('我有权限且对方不是管理员');
							this.join = UUIDUtil.getUUID().replace(/\-/g, '');
							let params = {
								ticket: this.state.ticket,
								uuId: this.state.uuid,
								userId: this.state.basic.userId,
								roomJid: this.state.room.roomJid,
								occupantJid: id,
								affiliation: type
							};

							noticeBody = {
								roomJid: this.state.room.roomJid,
								occupantJid: id,
								node: this.join,
								effect: id,
								active: this.state.basic.jidNode,
								message: type == 'admin' ? 'SETADMIN' : 'SETMEMBER',
							};


							let mesText = type == "admin" ? ' 被设为管理员' : ' 被取消管理员';
							this.mes = JSON.parse(JSON.stringify(this.state.messageBody));
							this.mes.content.text = name + mesText;
							this.mes.content.interceptText = name + mesText;
							this.mes.id = UUIDUtil.getUUID().replace(/\-/g, '');
							this.mes.occupant.state = type == 'admin' ? 'SETADMIN' : 'SETMEMBER';

							FetchUtil.netUtil(Path.inviteFriends + ParamsDealUtil.toGetParams(params), {}, 'GET', this.props.navigation, {
								uuId: this.state.uuid,
								ticket: this.state.ticket,
								userId: this.state.basic.userId
							}, (data) => {

								if (data.code == '200') {
									let body = this.state.dataMemberList;
									for (let i in body) {
										if (body[i].occupantJid == id) {
											body[i].affiliation = type;
										}
									}
									this.setState({
										dataMemberList: body,
										messageBody: this.mes,
										adminJidNode: id,
										adminName: name,
										modeType: type == 'admin' ? 'SETADMIN' : 'SETMEMBER'
									}, () => {
										if (Platform.OS == 'ios') {

											if (type == 'admin') {
												XMPP.XMPPSetAdmin({'adminJid': id, 'roomJid': this.state.room.roomJid, 'model':'设为管理员'});
											} else {
												XMPP.XMPPSetMember({'memberJid': id, 'roomJid': this.state.room.roomJid});
											}

											XMPP.XMPPCreateNode({
													'uuid': this.join,
													'userJid': this.state.basic.jidNode,
													'nodeUserJid': id,
													'roomJid': this.state.room.roomJid,
													'type': type == 'admin' ? 'SETADMIN' : 'SETMEMBER',
												  'userId': this.state.basic.userId
												},
												(error, event) => {
													if (error) {
														this.refs.toast.show(error, DURATION.LENGTH_SHORT);

													} else if (event) {

														PCNoticeUtil.pushPCNotification(noticeBody.roomJid,
															id,
															noticeBody.node,
															id,
															noticeBody.active,
															noticeBody.message,
															{
																uuId: this.state.uuid, ticket: this.state.ticket, userId: this.state.basic.userId
															}, this.props.navigation, () => {
																XMPP.XMPPSendGroupMessage({
																		'message': this.mes,
																		'jid': this.state.room.roomJid,
																		'uuid': this.mes.id
																	},
																	(error, event) => {
																		if (error) {
																			this.refs.toast.show(error, DURATION.LENGTH_SHORT);

																		} else {
																			// DeviceEventEmitter.emit('noticeChatPage', {
																			// 	body: this.state.messageBody,
																			// 	type: 'text'
																			// });
																			DeviceEventEmitter.emit('refreshGroupDetail');
																			//this.props.navigation.goBack();
																		}
																	})
															});
													}
												})

										} else {
											this.metuNodeStatue = true;

											let sendMetuIqToGroup = XmlUtil.createGroupNode(this.state.basic.jidNode, this.join);
											XMPP.sendStanza(sendMetuIqToGroup);

											// DeviceEventEmitter.emit('noticeChatPage', {body: this.state.messageBody, type: 'text'});
											DeviceEventEmitter.emit('refreshGroupDetail');//修改禁言状态广播详情

										}

									});
								}
							});
						} else {
							this.refs.toast.show('对方已被设为管理员，您没有权限进行该操作', DURATION.LENGTH_SHORT);
						}
					})
				} else {
					this.refs.toast.show('您已被取消管理员，没有权限进行该操作', DURATION.LENGTH_SHORT);
				}
			}
		})
	}

	getGroupMute = (type, num) => {
		//实时调取接口查询是否为群主或管理员
		FetchUtil.netUtil(Path.isRoomAdmin + '?ticket=' + this.state.ticket + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&roomJid=' + this.state.room.roomJid + '&jidNode=' + this.state.basic.jidNode, {}, 'GET', this.props.navigation, '', (responseJson) => {
			if (responseJson.code.toString() == '200') {
				if (responseJson.data) {
					FetchUtil.netUtil(Path.isRoomAdmin + '?ticket=' + this.state.ticket + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&roomJid=' + this.state.room.roomJid + '&jidNode=' + this.state.muteJidNode, {}, 'GET', this.props.navigation, '', (res) => {
						console.log(res.data);
						if (!res.data || this.state.groupOwner == this.state.basic.jidNode) {
							this.join = UUIDUtil.getUUID().replace(/\-/g, '');
							let body = {
								roomJid: this.state.room.roomJid,
								occupantJid: this.state.muteJidNode,
								mutenumber: num,
								type: type
							};

							noticeBody = {
								roomJid: this.state.room.roomJid,
								occupantJid: this.state.muteJidNode,
								node: this.join,
								effect: this.state.muteJidNode,
								active: this.state.basic.jidNode,
								message: this.state.modeType
							};

							this.mes = JSON.parse(JSON.stringify(this.state.messageBody));
							let mesText = !num ? ' 已解除禁言' : ' 被禁言' + (num >= 365 ? '永久' : num + '天');
							this.mes.content.interceptText = this.state.muteName + mesText;
							this.mes.content.text = this.state.muteName + mesText;
							this.mes.id = UUIDUtil.getUUID().replace(/\-/g, '');
							this.mes.occupant.state = this.state.modeType;
							this.mes.occupant.effect = this.dealJidNode;//被禁言人名称
							FetchUtil.netUtil(Path.groupMute, body, 'POST', this.props.navigation, {
								ticket: this.state.ticket,
								uuId: this.state.uuid,
								userId: this.state.basic.userId
							}, (data) => {

								if (data.code == '200') {
									let body = this.state.dataMemberList;
									for (let i in body) {
										if (body[i].occupantJid == this.state.muteJidNode) {
											body[i].mute = type == "mute" ? 1 : 0;
											body[i].mutenumber = type == "mute" ? num : 0;
										}
									}
									this.setState({
										modalVisible: false,
										dataMemberList: body,

									}, () => {
										if (Platform.OS == 'ios') {

											XMPP.XMPPCreateNode({
													'uuid': this.join,
													'userJid': this.state.basic.jidNode,
													'nodeUserJid': this.state.muteJidNode,
													'roomJid': this.state.room.roomJid,
													'type': this.state.modeType,
												  'userId': this.state.basic.userId
												},
												(error, event) => {
													if (error) {
														this.refs.toast.show(error, DURATION.LENGTH_SHORT);

													} else if (event) {

														PCNoticeUtil.pushPCNotification(noticeBody.roomJid,
															noticeBody.occupantJid,
															noticeBody.node,
															noticeBody.effect,
															noticeBody.active,
															noticeBody.message,
															{
																uuId: this.state.uuid, ticket: this.state.ticket, userId: this.state.basic.userId
															}, this.props.navigation, () => {
																XMPP.XMPPSendGroupMessage({
																		'message': this.mes,
																		'jid': this.state.room.roomJid,
																		'uuid': this.mes.id
																	},
																	(error, event) => {
																		if (error) {
																			this.refs.toast.show(error, DURATION.LENGTH_SHORT);

																		} else {
																			// DeviceEventEmitter.emit('noticeChatPage', {
																			// 	body: this.mes,
																			// 	type: 'text'
																			// });
																			DeviceEventEmitter.emit('refreshGroupDetail');
																			//this.props.navigation.goBack();
																		}
																	})
															});

													}
												})

										} else {

											this.metuNodeStatue = true;

											let sendMetuIqToGroup = XmlUtil.createGroupNode(this.state.basic.jidNode, this.join);
											XMPP.sendStanza(sendMetuIqToGroup);
											// DeviceEventEmitter.emit('noticeChatPage', {body: this.mes, type: 'text'});
											DeviceEventEmitter.emit('refreshGroupDetail');//修改禁言状态广播详情
										}

									});
								}
							});
						} else {
							this.refs.toast.show('对方已被设为管理员，您没有权限进行该操作', DURATION.LENGTH_SHORT);
						}
					})
				} else {
					this.refs.toast.show('您已被取消管理员，没有权限进行该操作', DURATION.LENGTH_SHORT);
				}
			}
		})
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	itemContent: {
		flexDirection: 'row',
		height: 48,
		alignItems: 'center',
		borderTopWidth: 1,
	},
	itemImage: {
		width: 36,
		height: 36,
		marginRight: 8,
	},
	itemBtn: {
		paddingRight: 5,
		paddingLeft: 5,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 6
	},
	itemBtnText: {
		fontSize: 12,
		color: 'white'
	},
	modalBtn: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		width: WIDTH * 0.5,
	},
});