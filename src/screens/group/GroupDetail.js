import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity, Platform, Dimensions, ToastAndroid, NativeModules, DeviceEventEmitter,
	Switch,
	ScrollView, Alert, BackHandler
} from 'react-native';
import Header from '../../component/common/Header';
import Icons from 'react-native-vector-icons/Ionicons';
import CustomBtn from '../../component/common/CommitBtn';
import FetchUtil from '../../util/FetchUtil';
//import Grid from 'react-native-grid-component';
import GridView from 'react-native-super-grid';

import Path from "../../config/UrlConfig";
import UUIDUtil from "../../util/UUIDUtil";
import FormatDate from "../../util/FormatDate";
import XmlUtil from "../../util/XmlUtil";
import Sqlite from "../../util/Sqlite";
import ImagePickerManager from 'react-native-image-picker';
import cookie from '../../util/cookie';
import Toast, {DURATION} from 'react-native-easy-toast';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import PCNoticeUtil from "../../util/PCNoticeUtil";
import NetworkStateUtil from "../../util/NetworkStateUtil";
import RedisUtil from "../../util/RedisUtil";
import PermissionUtil from "../../util/PermissionUtil";
const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();
const {height, width} = Dimensions.get('window');
let adminNumber = 0;
let noticeBody = {};
let isExitGroup = false;
export default class GroupDetail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			memberData: [],//群成员
			basicMemberList: [],//群成员原始数据
			ownerName: '',//群主信息
			roomName: props.navigation.state.params.room.roomName,//群名称
			roomDesc: '',//群公告
			affiliationType: false,
			affiliation: '',//"member"普通成员false,"owner"群主true,"admin"管理员
			room: props.navigation.state.params.room,
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			messageBody: {
				"id": UUIDUtil.getUUID().replace(/\-/g, ''),
				"type": 0,
				"basic": {
					"userId": props.navigation.state.params.basic.jidNode,
					"userName": props.navigation.state.params.basic.trueName,
					"head": props.navigation.state.params.basic.photoId,
					"sendTime": new Date().getTime(),
					"groupId": props.navigation.state.params.room.roomJid,
					"type": 'groupChat'
				},
				"content": {
					"text": props.navigation.state.params.basic.trueName + '退出群组',
					"interceptText": '',
					"file": []
				},
				"atMembers": [],
				"occupant": {
					"state": 'OWNLEAVE',
					"effect": '',
					"active": ''
				}
			},
			groupOwner: '',
			isTop: false,//是否置顶
			isMember: props.navigation.state.params.isMember == undefined ? false : props.navigation.state.params.isMember,//是否是群成员
			isQRCode: props.navigation.state.params.isQRCode,//是否通过扫码展示详情页
			groupInfor: {},
			adminMember: [],
			isUseQR: false,
		}
		this.fetchGroupDetailType = false;
		this.openGroupId = '';
	};

	//组件渲染完毕时调用此方法
	componentDidMount() {
		if (Platform.OS == 'android') {
			this.groupIq = XMPP.on('iq', (message) => this._groupDetailXmpp(message));
		}

		this._fetchGroupDetail();

		this.refreshEvent = DeviceEventEmitter.addListener('refreshGroupDetail', (params) => {
			//console.log('进入groupDetail页刷新监听:' + params);
			this._fetchGroupDetail();
		});

		Sqlite.selectTalkers(this.state.basic.userId, this.state.room.roomJid, (userDetail) => {
			if (userDetail[0].promote_priority > 0) {
				this.setState({
					isTop: true
				})
			}
		});

	};

	componentWillUnmount() {
		this.refreshEvent.remove();
		if (Platform.OS == 'android') {
			this.groupIq.remove();
		}

	}

	//是否启用扫码进群
	isStartUsingQR = (value) => {

		FetchUtil.netUtil(Path.submitUpdateRedis, {
			roomJid: this.state.room.roomJid,
			invitation: value,
		}, 'POST', this.props.navigation, {
			ticket: this.state.ticket,
			uuId: this.state.uuid,
			userId: this.state.basic.userId
		}, (data) => {
			if (data.code.toString() == '200') {

				this.setState({
					isUseQR: value
				}, () => {
					//this._fetchGroupDetail();
					DeviceEventEmitter.emit('refreshQR', {isUseQR: value});
				});
			}
		})
	};


	_groupDetailXmpp = (message) => {

		if (message.type == 'result' && this.isInviteStatue) {
			if (this.state.room.publicRoom == '1') {
				//管理员订阅
				this.state.adminMember.map((item) => {
					let subscriptionToGroup = XmlUtil.subscriptionToGroup(item.occupantJid + '@' + Path.xmppDomain, this.joinId);
					XMPP.sendStanza(subscriptionToGroup);
				})
			} else {
				//被邀请人订阅
				let subscriptionToGroup = XmlUtil.subscriptionToGroup(this.state.basic.jidNode + '@' + Path.xmppDomain, this.joinId);
				XMPP.sendStanza(subscriptionToGroup);
			}

			this.isInviteStatue = false;
			this.joinGroupXmppType = true;
		}

		if (message.type == 'result' && this.joinGroupXmppType && message.pubsub && message.pubsub.subscription) {
			//给节点发布一条“申请入群”消息
			let sendMessageGroup = '';
			if (this.state.room.publicRoom == '1') {
				//审核群
				sendMessageGroup = XmlUtil.approvePublishSendMessageGroup(this.state.room.roomJid, this.state.basic.jidNode, 'join', this.state.basic.trueName, this.joinId, this.state.basic.jidNode);
			} else {
				//主动加入非审核群
				sendMessageGroup = XmlUtil.notApproveSendMessageGroup(this.state.room.roomJid, this.state.basic.jidNode, 'INVITEJOINROOM', this.joinId, this.state.basic.jid);
			}
			XMPP.sendStanza(sendMessageGroup);
			this.joinGroupXmppType = false;
		}

		//启用群发送订阅
		if (message.type == 'result' && this.openNodeStatue) {

			this.state.basicMemberList.map((item) => {
				if (item.occupantJid != this.state.basic.jidNode) {//不用给自己再次出席
					//发送订阅
					let sendMetuReadIqToGroup = XmlUtil.subscriptionToGroup(item.occupantJid + '@' + Path.xmppDomain, this.openGroupId);
					XMPP.sendStanza(sendMetuReadIqToGroup);
				}
			});

			this.openNodeStatue = false;
			this.openReadStatue = true;
		}
		//启用群发布消息
		if (message.type == 'result' && this.openReadStatue && message.pubsub && message.pubsub.subscription) {
			// this.state.basicMemberList.map((item) => {
			// 	if(item.occupantJid != this.state.basic.jidNode){//不用给自己再次出席
			// 		//发布消息
			let sendMetuReadIqToGroup = XmlUtil.sendMessageGroup(this.state.room.roomJid, '', this.state.basic.jidNode, this.openGroupId, 'OPENGROUP');
			XMPP.sendStanza(sendMetuReadIqToGroup);
			// 	}
			// });

			this.openReadStatue = false;
			this.openPublishMessageStatue = true;
		}
		//启用群普通消息
		if (message.type == 'result' && this.openPublishMessageStatue && message.pubsub && message.pubsub.publish) {
			let msgBody = {
				"id": UUIDUtil.getUUID().replace(/\-/g, '') + 'GroupMsg',
				"type": 0,
				"basic": {
					"userId": this.state.basic.jidNode,
					"userName": this.state.basic.trueName,
					"head": this.state.room.head,
					"sendTime": new Date().getTime(),
					"groupId": this.state.room.roomJid,
					"type": "groupChat",
				},
				"content": {
					"text": `${this.state.basic.trueName}取消了禁用`,
					"interceptText": `${this.state.basic.trueName}取消了禁用`,
					"file": []
				},
				"atMembers": [],
				"occupant": {
					"state": "OPENGROUP",
					"effect": this.state.basic.jidNode,
					"active": this.state.basic.trueName
				}
			}
			XMPP.sendRoomMessage(JSON.stringify(msgBody), this.state.room.roomJid + Path.xmppGroupDomain);
			this.groupIq.remove();
			this.props.navigation.goBack();
		}


	}

	_fetchGroupDetail = () => {
		let url = Path.getGroupDetail + '?roomJid=' + this.state.room.roomJid + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&currentJidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;
		// let url = Path.new_getGroupDetail+ '?roomJid=' + this.state.room.roomJid + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&currentJidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, {
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId
		}, (responseJson) => {
			if (responseJson.code.toString() == '200') {
				let tmp = JSON.parse(responseJson.data);
				let isType = false,
					usersArr = [];
				if (tmp.relation) {
					isType = tmp.relation.affiliation == "member" ? false : true;
					usersArr = isType ? tmp.users.slice(0, 8).concat([{occupantNickName: 'add'}, {occupantNickName: 'cut'}]) : tmp.users.slice(0, 9).concat([{occupantNickName: 'add'}]);
				} else {
					usersArr = tmp.users.slice(0, 10);
				}
				let adminMember = [];
				adminMember.concat(tmp.groupDetail.adminList);
				adminMember.push(tmp.groupDetail.ownerList[0]);

				this.setState({
					memberData: usersArr,
					basicMemberList: tmp.users,
					roomName: tmp.groupDetail.roomName,
					ownerName: tmp.groupDetail.userName,
					roomDesc: tmp.groupDetail.roomDesc,
					groupOwner: tmp.groupDetail.ownerList[0].occupantJid,
					affiliationType: tmp.relation ? (tmp.relation.affiliation == "member" ? false : true) : false,
					affiliation: tmp.relation ? tmp.relation.affiliation : '',
					room: tmp.groupDetail,
					isMember: tmp.relation ? true : false,
					groupInfor: {
						roomJid: tmp.groupDetail.roomJid,
						roomName: tmp.groupDetail.roomName,
						roomDesc: tmp.groupDetail.roomDesc,
						publicRoom: tmp.groupDetail.publicRoom,
						banRoom: tmp.groupDetail.banRoom,
						photoId: tmp.groupDetail.photoId
					},
					adminMember: adminMember,
					isUseQR: tmp.invitation && tmp.invitation == 'true' ? true : false
				}, () => {
					if (this.fetchGroupDetailType) {
						Sqlite.updateTalkerName(this.state.basic.userId, 2, this.state.room.roomJid + Path.xmppGroupDomain, this.state.room.roomJid, this.state.room.roomName, this.state.room.photoId, this.state.isTop, false, false, () => {
							DeviceEventEmitter.emit('refreshPage');
						});
					}
				});
			}
		});
	};

	//群置顶
	isToTop = (value) => {
		this.setState({
			isTop: value
		});
		Sqlite.updateTalkerPromote(this.state.basic.userId, 2, this.state.room.roomJid + Path.xmppGroupDomain, this.state.room.roomJid, this.state.room.roomName, this.state.room.head, value, false, false, () => {
			DeviceEventEmitter.emit('refreshFriendList');
			DeviceEventEmitter.emit('refreshPage');//刷新好友列表
		});
	}

	_renderItem = (data, i) => {
		var tempView = null;
		if (this.state.room.banRoom.toString() == '0' && data.occupantNickName == 'add') {
			tempView = (
				<View style={[{backgroundColor: '#FFFFFF'}, styles.item]} key={i}>
					<TouchableOpacity onPress={() => {
						HandlerOnceTap(
							() => {
								this.props.navigation.navigate('GroupCreate', {
									'ticket': this.state.ticket,
									'basic': this.state.basic,
									'room': this.state.room,
									'pageType': 'add',
									'uuid': this.state.uuid,
									'basicMemberList': this.state.basicMemberList,
									'nowAffiliation': this.state.affiliation,

								})
							}
						)
					}}>
						<View style={{alignItems: 'center', paddingTop: 5}}>
							<View style={styles.headList}>
								<Icons name={'ios-add-outline'} size={50} color={'#dbdbdb'}/>
							</View>
						</View>
					</TouchableOpacity>
					<View style={styles.nickNameText}>
						<Text style={{fontSize: 12, color: '#333'}}>{'邀请'}</Text>
					</View>
				</View>
			);
		} else if (this.state.room.banRoom.toString() == '0' && data.occupantNickName == 'cut') {
			tempView = (
				<View style={[{backgroundColor: '#FFFFFF'}, styles.item]} key={i}>
					<TouchableOpacity onPress={() => {
						HandlerOnceTap(
							() => {

								this.props.navigation.navigate('GroupCreate', {
									'ticket': this.state.ticket,
									'basic': this.state.basic,
									'room': this.state.room,
									'pageType': 'cut',
									'uuid': this.state.uuid,
									'nowAffiliation': this.state.affiliation
								})

							}
						)
					}}>
						<View style={{alignItems: 'center', paddingTop: 5}}>
							<View style={styles.headList}>
								<Icons name={'ios-remove-outline'} size={50} color={'#dbdbdb'}/>
							</View>
						</View>
					</TouchableOpacity>
					<View style={styles.nickNameText}>
						<Text style={{fontSize: 12, color: '#333'}}>{'移除'}</Text>
					</View>
				</View>
			)
		} else if(data.occupantTrueName){
			tempView = (
				<View style={[{backgroundColor: '#FFFFFF'}, styles.item]} key={i}>
					<TouchableOpacity onPress={() => {
						HandlerOnceTap(
							() => {
								if (this.state.basic.jidNode != data.occupantJid) {
									this.props.navigation.navigate('FriendDetail', {
										'ticket': this.state.ticket,
										'basic': this.state.basic,
										'uuid': this.state.uuid,
										'friendJidNode': data.occupantJid,
										'tigRosterStatus': 'both',
										// 'backPage': 'Group',
										// 'room': this.state.room
									})
								}
							}
						)
					}}>
						<View style={{justifyContent: 'center', alignItems: 'center', paddingTop: 5}}>
							<Image
								source={{
									// uri: Path.baseUrl + '/singleChat/queryPhotoAddress' + '?uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&ticket=' + this.state.ticket + '&fileName=' + data.occupantPhotoId
									uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + data.occupantPhotoId + '&imageId=' + data.occupantPhotoId+ '&sourceType=singleImage&jidNode=' + data.occupantJid
								}}
								style={styles.headList}/>
						</View>
					</TouchableOpacity>
					<View style={styles.nickNameText}>
						<Text numberOfLines={1} style={{fontSize: 12, color: '#333'}}>{data.occupantTrueName}</Text>
					</View>
				</View>
			)
		}
		return tempView;
	};

	_renderPlaceholder = i => <View style={styles.item} key={i}/>;

	_removeFromGroup = () => {
		this.join = UUIDUtil.getUUID().replace(/\-/g, '');

		this.exitSigleBody = {
			"id": UUIDUtil.getUUID().replace(/\-/g, '') + 'GroupMsg',
			"type": 0,
			"messageType": 'text',
			"basic": {
				"userId": this.state.basic.jidNode,
				"userName": this.state.basic.trueName,
				"head": this.state.room.head,
				"sendTime": new Date().getTime(),
				"groupId": this.state.room.roomJid,
				"type": "groupChat",
				"groupName": this.state.groupName
			},
			"content": {
				"text": `${this.state.basic.trueName}退出群组`,
				"interceptText": `${this.state.basic.trueName}退出群组`,
				"file": []
			},
			"atMembers": [],
			"occupant": {
				"state": "OWNLEAVE",
				"effect": this.state.basic.jidNode,
				"active": this.state.basic.trueName
			}
		}

		if (Platform.OS == 'ios') {
			let url = Path.leaveGroup + '?roomJid=' + this.state.room.roomJid + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&occupantJid=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;

			FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, {
				uuId: this.state.uuid,
				ticket: this.state.ticket,
				userId: this.state.basic.userId
			}, (responseJson) => {
				if (responseJson.code.toString() == '200') {

					XMPP.XMPPSendGroupMessage({
							'message': this.exitSigleBody,
							'jid': this.state.room.roomJid,
							'uuid': this.state.uuid
						},
						(error, event) => {
							if (error) {
								this.refs.toast.show(error, DURATION.LENGTH_SHORT);

							} else {

								XMPP.initiativeLeaveGroup(
									{
										'roomJid': this.state.room.roomJid,
										'peopleId': this.state.basic.jidNode,
										'id': UUIDUtil.getUUID().replace(/\-/g, '')

									},
									(error, event) => {
										if (error) {
											this.refs.toast.show(error, DURATION.LENGTH_SHORT);

										} else {
											this.state.adminMember.map((item) => {
												XMPP.XMPPCreateNode({
														'uuid': this.join,
														'userJid': this.state.basic.jidNode,
														'nodeUserJid': item.occupantJid,
														'roomJid': this.state.room.roomJid,
														'type': "OWNLEAVE",
													  'userId': this.state.basic.userId
													},
													(error, event) => {
														if (error) {
															this.refs.toast.show(error, DURATION.LENGTH_SHORT);
														} else if (event) {

															PCNoticeUtil.pushPCNotification(this.state.room.roomJid,
																item.occupantJid,
																this.join,
																item.occupantJid,
																this.state.basic.jidNode,
																"OWNLEAVE",
																{
																	uuId: this.state.uuid, ticket: this.state.ticket, userId: this.state.basic.userId
																}, this.props.navigation, () => {
																	// Sqlite.deleteTalker(this.state.basic.userId, this.state.room.roomJid, () => {
																	// 	this.props.navigation.navigate('Index', {
																	// 		token: this.state.basic.token,
																	// 		uuid: this.state.uuid,
																	// 		ticket: this.state.ticket,
																	// 		basic: this.state.basic,
																	// 		updateFlag: false,
																	// 		loginType: 'unauto'
																	// 	});
																	DeviceEventEmitter.emit('delGroup', this.state.room.roomJid);
																	DeviceEventEmitter.emit('changeRoute', [{routeName:'Message'}]);
																	this.props.navigation.navigate('Index', {
																		token: this.state.basic.token,
																		uuid: this.state.uuid,
																		ticket: this.state.ticket,
																		basic: this.state.basic,
																		updateFlag: false,
																		loginType: 'unauto'
																	});
																	DeviceEventEmitter.emit('refreshPage');
																	DeviceEventEmitter.emit('refreshGroupList');
																	DeviceEventEmitter.emit('changeFoot', 'groups');
																	//});
																});
														}
													});
											});
										}
									}
								)
							}
						})
				}
			});
		} else {
			let url = Path.leaveGroup + '?roomJid=' + this.state.room.roomJid + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&occupantJid=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;

			FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
				if (responseJson.code.toString() == '200') {

					// let removeFromGroup = XmlUtil.removeFromGroup(this.state.room.roomJid + Path.xmppGroupDomain, this.state.basic.jidNode);
					// console.log('移除报文:');
					// console.log(removeFromGroup);
					// XMPP.sendStanza(removeFromGroup);

					// this.leaveNodeStatue = true;
					// let sendMetuIqToGroup = XmlUtil.createGroupNode(this.state.basic.jidNode, this.join);
					// XMPP.sendStanza(sendMetuIqToGroup);

					Sqlite.deleteTalker(this.state.basic.userId, this.state.room.roomJid, () => {
						//发送退群普通消息
						var sendMsgToGroup = XmlUtil.sendGroup('groupchat', this.state.room.roomJid + Path.xmppGroupDomain, JSON.stringify(this.exitSigleBody), this.exitSigleBody.id);
						XMPP.sendStanza(sendMsgToGroup);

						//离开房间
						XMPP.leaveRoom(this.state.room.roomJid + Path.xmppGroupDomain);

						// Sqlite.deleteTalker(this.state.basic.userId, this.state.room.roomJid, () => {
						DeviceEventEmitter.emit('delGroup', this.state.room.roomJid);
						DeviceEventEmitter.emit('changeRoute', [{routeName:'Message'}]);
						this.props.navigation.navigate('Index', {
							token: this.state.basic.token,
							uuid: this.state.uuid,
							ticket: this.state.ticket,
							basic: this.state.basic,
							updateFlag: false,
							loginType: 'unauto'
						});
						DeviceEventEmitter.emit('refreshPage');
						DeviceEventEmitter.emit('refreshGroupList');
						DeviceEventEmitter.emit('changeFoot', 'groups');
						// });

					});

				}
			});
		}
	};

	//禁用群组
	_closeGroup = () => {

		let messageBody = {
			"type": 0,
			"basic": {
				"userId": this.state.basic.jidNode,
				"userName": this.state.basic.trueName,
				"head": this.state.room.head,
				"sendTime": new Date().getTime(),
				"groupId": this.state.room.roomJid,
				"type": "groupChat",
				"groupName": this.state.groupName
			},
			"content": {
				"text": `${this.state.basic.trueName} 禁用了群组 `,
				"interceptText": `${this.state.basic.trueName} 禁用了群组 `,
				"file": []
			},
			"atMembers": [],
			"occupant": {
				"state": "DISABLEGROUP",
				"effect": this.state.basic.trueName,
				"active": this.state.basic.jidNode + '@' + Path.xmppDomain
			}
		};
		let itemBody = JSON.parse(JSON.stringify(this.state.groupInfor));
		itemBody.banRoom = '1';
		if (Platform.OS == 'android'){
			//异步发送
			let sendMsgToGroup = XmlUtil.sendGroup('groupchat', this.state.room.roomJid + Path.xmppGroupDomain, JSON.stringify(messageBody), UUIDUtil.getUUID().replace(/\-/g, ''));
			XMPP.sendStanza(sendMsgToGroup);
		}

		FetchUtil.netUtil(Path.roomNameUpdate, itemBody, 'POST', this.props.navigation, {
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId
		}, (responseJson) => {
			//console.log(responseJson);
			if (responseJson.code.toString() == '200') {
				this.fetchGroupDetailType = false;//不做入库更新
				this._fetchGroupDetail();

				if (Platform.OS == 'ios') {

					XMPP.XMPPSendGroupMessage({
							'message': messageBody,
							'jid': this.state.room.roomJid,
							'uuid': UUIDUtil.getUUID().replace(/\-/g, '')
						},
						(error, event) => {
							if (error) {
								this.refs.toast.show(error, DURATION.LENGTH_SHORT);

							} else {
								DeviceEventEmitter.emit('refreshGroupList');
								DeviceEventEmitter.emit('refreshPage', 'refresh');
							}
						})


				} else {
					// //创建节点
					// this.openGroupId = UUIDUtil.getUUID().replace(/\-/g, '');
					// this.stopNodeStatue = true;
					// let creaetNode = XmlUtil.createGroupNode(this.state.basic.jidNode,this.openGroupId);
					// XMPP.sendStanza(creaetNode);
					// DeviceEventEmitter.emit('noticeChatPage', {body: messageBody, type: 'text'});
				}
				this.props.navigation.goBack();
			}
		});
	};

	/** 启用群组*/
	_openGroup = () => {

		let body = {
			roomJid: this.state.room.roomJid,
			roomName: this.state.room.roomName,
			roomDesc: this.state.room.roomDesc,
			publicRoom: this.state.room.publicRoom,
			banRoom: '0',
			photoId: this.state.room.photoId
		}

		FetchUtil.netUtil(Path.roomNameUpdate, body, 'POST', this.props.navigation, {
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId
		}, (responseJson) => {
			if (responseJson.code.toString() == '200') {

				if (Platform.OS == 'android') {
					//自己出席群
					XMPP.joinRoom(this.state.room.roomJid + Path.xmppGroupDomain, this.state.basic.jidNode);

					//创建节点
					this.openGroupId = UUIDUtil.getUUID().replace(/\-/g, '');
					this.openNodeStatue = true;
					let creaetNode = XmlUtil.createGroupNode(this.state.basic.jidNode, this.openGroupId);
					XMPP.sendStanza(creaetNode);
				} else {
					let groupMemberJids = [];
					this.join = UUIDUtil.getUUID().replace(/\-/g, '');
					this.state.basicMemberList.map((item) => {

						if (item.occupantJid != this.state.basic.jidNode) {
							groupMemberJids.push(item.occupantJid);
						}
					});

					XMPP.XMPPMapgroupes(
						{
							'roomJid': this.state.room.roomJid,
							'account': this.state.basic.jidNode
						},
						(error, event) => {
							if (error) {
								this.refs.toast.show(error, DURATION.LENGTH_SHORT);
							} else {

								XMPP.XMPPCreateNode({
										'uuid': this.join,
										'userJid': this.state.basic.jidNode,
										'nodeUserJids': groupMemberJids,
										'roomJid': this.state.room.roomJid,
										'type': 'OPENGROUP',
									  'userId': this.state.basic.userId
									},
									(error, event) => {
										if (error) {
											this.refs.toast.show(error, DURATION.LENGTH_SHORT);

										} else if (event) {

											let msgBody = {
												"id": UUIDUtil.getUUID().replace(/\-/g, '') + 'GroupMsg',
												"type": 0,
												"basic": {
													"userId": this.state.basic.jidNode,
													"userName": this.state.basic.trueName,
													"head": this.state.room.head,
													"sendTime": new Date().getTime(),
													"groupId": this.state.room.roomJid,
													"type": "groupChat",
												},
												"content": {
													"text": `${this.state.basic.trueName}取消了禁用`,
													"interceptText": `${this.state.basic.trueName}取消了禁用`,
													"file": []
												},
												"atMembers": [],
												"occupant": {
													"state": "OPENGROUP",
													"effect": this.state.basic.jidNode,
													"active": this.state.basic.trueName
												}
											};

											XMPP.XMPPSendGroupMessage({
													'message': msgBody,
													'jid': this.state.room.roomJid,
													'uuid': msgBody.id
												},
												(error, event) => {
													if (error) {
														this.refs.toast.show(error, DURATION.LENGTH_SHORT);

													} else {
														// DeviceEventEmitter.emit('noticeChatPage', {
														// 	body: msgBody,
														// 	type: 'text'
														// });
														DeviceEventEmitter.emit('refreshGroupDetail');
														this.refs.toast.show('启用群组成功', DURATION.LENGTH_SHORT);
														//this.props.navigation.goBack();
													}
												})
										}
									})
								//this.refs.toast.show(event, DURATION.LENGTH_SHORT);
							}
						})
				}
			}
		});
	};

	_moreMemberView = () => {
		let returnType = false;
		if (this.state.isMember) {
			if (this.state.groupOwner == this.state.basic.jidNode) {
				if (this.state.basicMemberList.length > 8) {
					returnType = true;
				} else {
					returnType = false;
				}
			} else {
				if (this.state.basicMemberList.length > 9) {
					returnType = true;
				} else {
					returnType = false;
				}
			}
		}
		return returnType ? <TouchableOpacity onPress={() => {
			HandlerOnceTap(
				() => {
					this.props.navigation.navigate('GroupMember', {
						ticket: this.state.ticket,
						uuid: this.state.uuid,
						roomJid: this.props.navigation.state.params.room.roomJid,
						room: this.state.room,
						groupOwner: this.state.adminMember,//管理员列表(包括群主)
						basic: this.state.basic,
					});
				}
			)
		}}>
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 8,
			}}>
				<Text style={{fontSize: 15, color: '#919191', marginRight: 5}}>{'查看更多群成员'}</Text>
				<Icons name={'ios-arrow-forward-outline'} size={18} color={'#919191'}/>
			</View>
		</TouchableOpacity> : null
	};
	_joinToGroup = () => {

		let authUrl = Path.isJoinGroup + '?occupantJid=' + this.state.basic.jidNode + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&roomJid=' + this.state.room.roomJid + '&userId=' + this.state.basic.userId;

		FetchUtil.netUtil(authUrl, {}, 'GET', this.props.navigation, '', (responseJsonData) => {
			/** 该群是否存在*/
			if (responseJsonData.isExist == 'true') {

				/** 是否已经加入*/
				if (responseJsonData.inOrOut == 'true') {
					this.refs.toast.show('您已经在群中，不允许重复加入', DURATION.LENGTH_SHORT);
				} else {
					//是否为审核群
					if (responseJsonData.publicRoom == '0') {
						//非审核群
						let url = Path.joinRoom + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&occupantJid=' + this.state.basic.jidNode + '&roomJid=' + this.state.room.roomJid + '&userId=' + this.state.basic.userId;

						FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {

							if (responseJson.code.toString() == '200') {
								let tempSigleBody = {
									"id": UUIDUtil.getUUID().replace(/\-/g, '') + 'GroupMsg',
									"type": 0,
									"messageType": 'text',
									"basic": {
										"userId": this.state.basic.jidNode,
										"userName": this.state.basic.trueName,
										"head": this.state.room.photoId,
										"sendTime": new Date().getTime(),
										"groupId": this.state.room.roomJid,
										"type": "groupChat",
										"groupName": this.state.groupName
									},
									"content": {
										"text": `${this.state.basic.trueName} 加入群组`,
										"interceptText": `${this.state.basic.trueName} 加入群组`,
										"file": []
									},
									"atMembers": [],
									"occupant": {
										"state": "INVITEJOINROOM",
										"effect": this.state.basic.trueName,
										"active": this.state.basic.trueName
									}
								};
								if (Platform.OS == 'ios') {
									this.join = UUIDUtil.getUUID().replace(/\-/g, '');
									XMPP.inviteToJoinTheGroupChatAction(
										{
											'roomJid': this.state.room.roomJid,
											'userJid': this.state.basic.jidNode,
											'roomName': this.state.groupName,
											'roomDesc': '',
											'members': this.state.checkedList,
											'uuid': this.state.uuid,
											'ticket': this.state.ticket,
											'isJoin': 'YES',
											'isPublicRoom': '0'
										},
										(error, event) => {
											if (error) {
												this.refs.toast.show(error, DURATION.LENGTH_SHORT);

											} else if (event) {

												XMPP.XMPPSendGroupMessage({
														'message': tempSigleBody,
														'jid': this.state.room.roomJid,
														'uuid': UUIDUtil.getUUID().replace(/\-/g, '')
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

											}
										});
								} else {
									// let joinGroup = XmlUtil.enterGroup(this.state.room.roomJid + Path.xmppGroupDomain + '/' + this.state.basic.jidNode);
									// console.log('添加群后，出席报文:');
									// console.log(joinGroup);
									// XMPP.sendStanza(joinGroup);
									XMPP.joinRoom(this.state.room.roomJid + Path.xmppGroupDomain, this.state.basic.jidNode);

									//发送普通消息
									//console.log('添加群后，非审核群普通消息');
									XMPP.sendRoomMessage(JSON.stringify(tempSigleBody), this.state.room.roomJid + Path.xmppGroupDomain);
									this.refs.toast.show('添加成功', DURATION.LENGTH_SHORT);

								}
								this._fetchGroupDetail();
								DeviceEventEmitter.emit('refreshGroupList');
							} else {
								this.refs.toast.show('加入失败', DURATION.LENGTH_SHORT);

							}
						})
					} else {
						//审核群
						this.joinId = UUIDUtil.getUUID().replace(/\-/g, '');
						noticeBody = {
							roomJid: this.state.room.roomJid,
							occupantJids: this.state.adminMember,
							node: this.joinId,
							effect: this.state.adminMember,
							active: this.state.basic.jidNode,
							message: 'join',
						};
						FetchUtil.netUtil(Path.auditFriends, {
								applicantJids: [this.state.basic.jidNode],
								inviterJid: '',
								roomJid: this.state.room.roomJid,
								node: 'join' + this.joinId
							}, 'POST', this.props.navigation, {
								uuId: this.state.uuid,
								ticket: this.state.ticket,
								userId: this.state.basic.userId
							}, (data) => {

								if (data.code == 200) {
									const res = data.data[0].data;
									if (res == '01') {
										this.refs.toast.show('你的申请已在审核列表中,请耐心等待管理员审核！', DURATION.LENGTH_SHORT);
									} else if (res == '02') {
										if (inviterJid) {
											this.refs.toast.show('被邀请人已经是该群的成员！', DURATION.LENGTH_SHORT);
										} else {
											this.refs.toast.show('你已经是该群的成员！', DURATION.LENGTH_SHORT);
										}
									} else {
										if (Platform.OS == 'android') {
											let createGroupNode = XmlUtil.createGroupNode(this.state.basic.jidNode, this.joinId);
											XMPP.sendStanza(createGroupNode);
											this.inviteGroupXmppType = true;
											this.isInviteStatue = true;
											this.refs.toast.show('申请成功，等待审核！', DURATION.LENGTH_SHORT);
										} else {

											XMPP.joinTheVerifyGroup({
													'roomJid': this.state.room.roomJid,
													'userJid': this.state.basic.jidNode,
													'userName': this.state.basic.trueName,
													'uuid': this.joinId,
													'admins': this.state.adminMember,
													'type': 'join',
													'userId': this.state.basic.userId,
												  'isJoin': 'true'
												},
												(error, event) => {
													if (error) {
														this.refs.toast.show(error, DURATION.LENGTH_SHORT);

													} else {
														this.refs.toast.show(event, DURATION.LENGTH_SHORT);

														this.state.adminMember.map((item) => {

															PCNoticeUtil.pushPCNotification(noticeBody.roomJid,
																item.occupantJid,
																noticeBody.node,
																item.occupantJid,
																noticeBody.active,
																noticeBody.message,
																{
																	uuId: this.state.uuid,
																	ticket: this.state.ticket,
																	userId: this.state.basic.userId
																}, this.props.navigation, () => {
																	//this.props.navigation.goBack();

																});
														});
														this.refs.toast.show('申请成功，等待审核！', DURATION.LENGTH_SHORT);
													}
												})
										}
									}
								}
							}
						);
					}
				}
			} else {
				this.refs.toast.show('该群不存在', DURATION.LENGTH_SHORT);

			}
		});
	};
    openImagePicker = () =>{
        let photoOptions = {
            //底部弹出框选项
            title: '请选择',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '打开相册',
            cameraType: 'back',
            quality: 1,
            allowsEditing: false,
            noData: false,
            storageOptions: {
                skipBackup: true,
                path: 'file'
            }
        };
        cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
        //打开图像库：
        ImagePickerManager.showImagePicker(photoOptions, (imageResponse) => {
            //console.log(imageResponse);
            if (imageResponse.didCancel) {
                //console.log('User cancelled file picker');
            } else if (imageResponse.error) {
                //console.log('FilePickerManager Error: ', imageResponse.error);
                this.refs.toast.show('请检查您的相册或相机权限是否开启', 3000);
            } else {

                let imageType;
                if (imageResponse.fileName) {
                    imageType = imageResponse.fileName.substr(imageResponse.fileName.lastIndexOf('.') + 1);
                } else {
                    imageType = imageResponse.uri.substr(imageResponse.uri.lastIndexOf('.') + 1);
                }
                const trueType = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];
                if (trueType.indexOf(imageType) > -1) {
                    //与上一节中的代码相同！
                    let formData = new FormData();
                    let file = {
                        uri: imageResponse.uri,
                        type: 'multipart/form-data',
                        name: imageResponse.fileName ? encodeURIComponent(imageResponse.fileName) : 'image.png'
                    };
                    formData.append("file", file);
                    let url = Path.uploadGroupImage + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId;
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formData,
                    }).then((response) => response.json()).then((responseData) => {
                        //console.log(responseData)
                        if (responseData.code.toString() == '200') {
                            let photoId = JSON.parse(responseData.data).photoId;
                            let itemBody = this.state.groupInfor;
                            itemBody.photoId = photoId;
                            FetchUtil.netUtil(Path.roomNameUpdate, itemBody, 'POST', this.props.navigation, {
                                uuId: this.state.uuid,
                                ticket: this.state.ticket,
                                userId: this.state.basic.userId
                            }, (responseJson) => {
                                //console.log(responseJson);
                                if (responseData.code.toString() == '200') {
                                    if (Platform.OS == 'android') {
                                        XMPP.sendRoomMessage('<changeinfo/>', this.state.room.roomJid + Path.xmppGroupDomain);
                                    } else {
                                        XMPP.XMPPUpdateGroupHeadImage({
                                            'jid': this.state.room.roomJid,
                                            'uuid': UUIDUtil.getUUID().replace(/\-/g, '')
                                        })
                                    }
                                    // XMPP.sendStanza(XmlUtil.changeGroupInfo());//发送修改群信息报文
                                    this.fetchGroupDetailType = true;
                                    this._fetchGroupDetail();
                                }
                            });
                        } else {
                            Alert.alert(
                                '提醒',
                                '系统异常,请退出重试',
                                [
                                    {
                                        text: '确定',
                                        onPress: () => {
                                            //更新redis
                                            RedisUtil.update(uuid, this.props.navigation, {
                                                ticket: this.state.ticket,
                                                userId: this.state.basic.userId,
                                                uuId: this.state.uuid
                                            }, 'lineStatus', 'back', () => {
                                                //设备当前为“后台”状态
                                                BackHandler.exitApp();
                                            });
                                        },
                                    }
                                ]
                            )
                        }
                    }, () => {
                        // alert('success')
                    }).catch((error) => {
                        console.error('error', error)
                    });
                } else {
                    this.refs.toast.show('无效图片格式，仅支持“gif,jpeg,jpg,png”', DURATION.LENGTH_SHORT * 10);

                }
            }
        });
    }
	//修改群头像
	resetGroupHead = () => {
        // cookie.save('isUpload', 1);//用于判断是否为选择图片后台状态
        if (Platform.OS == 'android') {
            // this._checkPermission(true);
            PermissionUtil.requestAndroidPermission(
                [PermissionsUtil.Permissions.read,PermissionsUtil.Permissions.write,PermissionsUtil.Permissions.camera], (value) => {
                    if (typeof value == "boolean" && value) {
                        this.openImagePicker();
                    } else if (typeof value == "boolean" && !value) {
                        Alert.alert(
                            '提醒',
                            '修改头像前，请先开启相机权限！',
                            [
                                {
                                    text: '确定',
                                }
                            ]
                        )
                    } else if (typeof value == "object") {
                        let status = true;
                        for (let key in value) {
                            if (!value[key]) {
                                status = false;
                            }
                        }
                        if(status){
                            this.openImagePicker();
                        }else{
                            Alert.alert(
                                '提醒',
                                '修改头像前，请先开启相机权限！',
                                [
                                    {
                                        text: '确定',
                                    }
                                ]
                            )
                        }
                    } else {
                        //console.log(value);
                    }
                }
            );
        }else{
            this.openImagePicker();
		}
	};

	render() {
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						HandlerOnceTap(
							() => {
								this.props.navigation.goBack();
							}
						)
					}}
					backTitle={'返回'}
					title={'群组信息'}
				/>
				{this.state.roomName ? (
					<ScrollView
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}>
						{this.state.isMember ? <View style={{
							backgroundColor: '#ffffff',
						}}>
							<GridView
								style={styles.item}
								itemDimension={(width - 64) / 5}
								items={this.state.memberData}
								renderItem={this._renderItem}
								spacing={5}
							/>
							{this._moreMemberView()}
						</View> : null}
						<View style={{backgroundColor: '#FFF', marginTop: 15, padding: 10}}>
							<View style={styles.menuList}>
								<TouchableOpacity disabled={!this.state.affiliationType} onPress={() => {
									HandlerOnceTap(this.resetGroupHead)
								}}>
									<Image
										source={{uri: Path.groupHeadImg + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&type=groupImage&userId=' + this.state.basic.userId + '&fileInfoId=' + this.state.groupInfor.photoId}}
										style={{width: 48, height: 48, marginRight: 10}}
									/>
								</TouchableOpacity>
								<TouchableOpacity disabled={!this.state.affiliationType} onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('GroupName', {
												ticket: this.state.ticket,
												uuid: this.state.uuid,
												room: this.state.room,
												basic: this.state.basic,
												isTop: this.state.isTop
											});
										}
									)
								}} style={[styles.menuListText, {height: 48}]}>
									<Text style={{flex: 1, lineHeight: 48}} numberOfLines={1}>{this.state.roomName}</Text>
								</TouchableOpacity>
							</View>
						</View>
						{!this.state.isMember ?
							<View
								style={{backgroundColor: '#FFF', marginBottom: 15, marginTop: 15, paddingLeft: 10, paddingRight: 10}}>
								<TouchableOpacity onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('FriendDetail', {
												'ticket': this.state.ticket,
												'basic': this.state.basic,
												'uuid': this.state.uuid,
												'friendJidNode': this.state.groupOwner,
												'tigRosterStatus': 'both',
												// 'backPage': 'Group',
												// 'room': this.state.room
											})
										}, "FriendDetail"
									)
								}} style={styles.menuList}>
									<Text style={{fontSize: 16, color: '#a2a2a2', marginRight: 10}}>群主</Text>
									<Text style={{flex: 1, lineHeight: 50}}>{this.state.ownerName}</Text>
								</TouchableOpacity>
								<View style={[styles.menuList, {borderTopColor: '#cecece', borderTopWidth: 1}]}>
									<Text style={{fontSize: 16, color: '#a2a2a2', marginRight: 10}}>人数</Text>
									<Text style={{flex: 1, lineHeight: 50}}>{this.state.basicMemberList.length}</Text>
								</View>
							</View> : null}
						{this.state.isMember ? <View style={{backgroundColor: '#FFF', marginBottom: 15, marginTop: 15}}>
							{
								this.state.affiliationType ? <TouchableOpacity onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('GroupJurisdiction', {
												basicMemberList: this.state.basicMemberList,
												ticket: this.state.ticket,
												uuid: this.state.uuid,
												room: this.state.room,
												basic: this.state.basic,
												nowAffiliation: this.state.affiliation,
												groupOwner: this.state.groupOwner//群主jidNode
											})
										}, "GroupJurisdiction"
									)
								}} style={styles.menuList}>
									<Image
										source={require('../../images/icon/icon_gl.png')}
										style={styles.icon}
									/>
									<View style={styles.menuListText}>
										<Text style={{flex: 1, lineHeight: 50}}>群权限</Text>
									</View>
								</TouchableOpacity> : null
							}
							{
								this.state.affiliationType ?
									<View style={styles.menuListTextBorder}/> : null//就是为了判断要不要显示一条线
							}

							{
								this.state.groupOwner == this.state.basic.jidNode ? <TouchableOpacity onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('GroupChange', {
												roomJid: this.state.room.roomJid,
												room: this.state.room
											})
										}, "GroupChange"
									)
								}} style={styles.menuList}>
									<Image
										source={require('../../images/change.png')}
										style={styles.icon}
									/>
									<View style={styles.menuListText}>
										<Text style={{flex: 1, lineHeight: 50}}>群组移交</Text>
									</View>
								</TouchableOpacity> : null
							}
							{
								this.state.groupOwner == this.state.basic.jidNode ?
									<View style={styles.menuListTextBorder}/> : null//就是为了判断要不要显示一条线
							}

							{
								this.state.affiliationType && this.state.room.publicRoom == 1 ? <TouchableOpacity onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('GroupAudit', {
												ticket: this.state.ticket,
												uuid: this.state.uuid,
												room: this.state.room,
												basic: this.state.basic,
											})
										}, "GroupAudit"
									)
								}} style={styles.menuList}>
									<Image
										source={require('../../images/audit.png')}
										style={styles.icon}
									/>
									<View style={styles.menuListText}>
										<Text style={{flex: 1, lineHeight: 50}}>待审核人员</Text>
									</View>
								</TouchableOpacity> : null//是管理员并且是一个审核群的时候显示此选项
							}
							{
								this.state.affiliationType && this.state.room.publicRoom == 1 ?
									<View style={styles.menuListTextBorder}/> : null//就是为了判断要不要显示一条线
							}
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('QRGenrator', {
											qrParams: this.state.room.roomJid + ',effect',
											groupName: this.state.roomName,
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											room: this.state.room,
											basic: this.state.basic,
											isUseQR: this.state.isUseQR
										})
									},
								)
							}} style={styles.menuList}>
								<Image
									source={require('../../images/icon/icon_qcode.png')}
									style={styles.icon}
								/>
								<View style={styles.menuListText}>
									<Text style={{flex: 1, lineHeight: 50}}>群二维码</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.menuListTextBorder}/>
							{/*{this.state.affiliationType && this.state.room.publicRoom == 1 ? (
								<View style={[styles.detailsBox, {borderTopColor: 'transparent'}]}>
									<Image
										source={require('../../images/in_confirm.png')}
										style={styles.icon}
									/>
									<View style={styles.detailsFunc}>
										<Text style={{flex: 1, lineHeight: 50}}>群聊邀请确认</Text>
										<Switch style={styles.detailsSwitch}
														onValueChange={(value) => {
															this.isStartUsingQR(value)
														}}
														value={this.state.isUseQR}/>
									</View>
								</View>) : null}*/}
							{/*{
								this.state.affiliationType && this.state.room.publicRoom == 1 ?
									<View style={styles.menuListTextBorder}/> : null//就是为了判断要不要显示一条线
							}*/}
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('GroupNotice', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											room: this.state.room,
											basic: this.state.basic,
											affiliation: this.state.affiliationType
										})
									}, "GroupNotice"
								)
							}} style={styles.menuList}>
								<Image
									source={require('../../images/icon/icon_qnotice.png')}
									style={styles.icon}
								/>
								<View style={styles.menuListText}>
									<Text style={{flex: 1, lineHeight: 50}}>公告</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.menuListTextBorder}/>
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('Activity', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											room: this.state.room,
											basic: this.state.basic,
											affiliation: this.state.affiliationType
										});
									},
									"Activity"
								)
							}} style={styles.menuList}>
								<Image
									source={require('../../images/icon/icon_activity.png')}
									style={styles.icon}
								/>
								<View style={styles.menuListText}>
									<Text style={{flex: 1, lineHeight: 50}}>活动报名</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.menuListTextBorder}/>
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('Vote', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											room: this.state.room,
											basic: this.state.basic,
											affiliation: this.state.affiliation
										});
									},
									"Vote"
								)
							}} style={styles.menuList}>
								<Image
									source={require('../../images/icon/icon_vote.png')}
									style={styles.icon}
								/>
								<View style={styles.menuListText}>
									<Text style={{flex: 1, lineHeight: 50}}>投票</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.menuListTextBorder}/>
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('Topic', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											room: this.state.room,
											basic: this.state.basic,
											affiliation: this.state.affiliationType
										});
									},
									"Topic"
								)
							}} style={styles.menuList}>
								<Image
									source={require('../../images/icon_talk.png')}
									style={styles.icon}
								/>
								<View style={styles.menuListText}>
									<Text style={{flex: 1, lineHeight: 50}}>话题讨论</Text>
								</View>
							</TouchableOpacity>
						</View> : null}
						{this.state.isMember ? <View style={styles.detailsView}>
							<View style={[styles.detailsBox, {borderTopColor: 'transparent'}]}>
								<View style={styles.detailsFunc}>
									<Text style={[styles.detailsFont, {flex: 1}]}>置顶聊天</Text>
									<Switch style={styles.detailsSwitch}
													onValueChange={(value) => {
														this.isToTop(value)
													}}
													value={this.state.isTop}/>
								</View>
							</View>
							{/*<View style={styles.detailsBox}>*/}
							{/*<View style={styles.detailsFunc}>*/}
							{/*<Text style={[styles.detailsFont, {flex: 1}]}>消息免打扰</Text>*/}
							{/*<Switch style={styles.detailsSwitch} onValueChange={(value) => {*/}
							{/*this.setState({*/}
							{/*disturbingType: value*/}
							{/*})*/}
							{/*}} value={this.state.disturbingType}/>*/}
							{/*</View>*/}
							{/*</View>*/}
						</View> : null}
						{this.state.isMember ? <View style={styles.detailsView}>
							<View style={[styles.detailsBox, {borderTopColor: 'transparent'}]}>
								<TouchableOpacity style={styles.detailsFunc} onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('History', {
												'ticket': this.state.ticket,
												'basic': this.state.basic,
												'room': this.state.room,
												'uuid': this.state.uuid
											})
										},
										"History"
									)
								}}>
									<Text style={[styles.detailsFont, {flex: 1}]}>聊天记录</Text>
									<View style={styles.detailsFunIcon}>
										<Icons name={'ios-arrow-forward'} size={25} color={'#CCCCCC'}/>
									</View>
								</TouchableOpacity>
							</View>
							{/*<View style={styles.detailsBox}>*/}
							{/*<TouchableOpacity style={styles.detailsFunc} onPress={() => alert('清空聊天记录')}>*/}
							{/*<Text style={[styles.detailsFont, {flex: 1}]}>清空聊天记录</Text>*/}
							{/*<View style={styles.detailsFunIcon}>*/}
							{/*<Icons name={'ios-arrow-forward'} size={25} color={'#CCCCCC'}/>*/}
							{/*</View>*/}
							{/*</TouchableOpacity>*/}
							{/*</View>*/}
						</View> : null}
						{!this.state.isMember ? (
							<TouchableOpacity onPress={() => {
								HandlerOnceTap(this._joinToGroup)
							}}
																style={[styles.addBtn, {backgroundColor: '#278eee'}]}>
								<Text style={{fontSize: 15, color: '#fff'}}>加入群组</Text>
							</TouchableOpacity>
						) : (
							this.state.groupOwner != this.state.basic.jidNode ? (
								<TouchableOpacity onPress={() => {
									HandlerOnceTap(this._removeFromGroup)
								}}
																	style={[styles.delBtn, {backgroundColor: '#f00',}]}>
									<Text style={{fontSize: 15, color: '#fff'}}>刪除并退出</Text>
								</TouchableOpacity>) : (
								<TouchableOpacity onPress={() => {

									if (this.state.room.banRoom.toString() == '1') {
										HandlerOnceTap(this._openGroup)
									} else {
										HandlerOnceTap(this._closeGroup)
									}

								}}
																	style={[styles.delBtn, this.state.room.banRoom.toString() == '1' ? {backgroundColor: '#278eee'} : {backgroundColor: '#f00'}]}>
									<Text style={{
										fontSize: 15,
										color: '#fff'
									}}>{this.state.room.banRoom.toString() == '1' ? '启用群组' : '禁用群组'}</Text>
								</TouchableOpacity>
							)
						)}
					</ScrollView>
				) : null}
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	item: {
		flex: 1,
	},
	headList: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#dbdbdb',
		width: 48,
		height: 48,
		borderRadius: Platform.OS == 'ios' ? 24 : 48
	},
	nickNameText: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 9,
	},
	delBtn: {
		height: 43,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 14,
		marginBottom: 14,
		marginLeft: 12,
		marginRight: 12
	},
	addBtn: {
		height: 43,
		borderRadius: 4,
		backgroundColor: '#278eee',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 14,
		marginBottom: 14,
		marginLeft: 12,
		marginRight: 12
	},
	menuList: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	icon: {
		width: 24,
		height: 24,
		marginLeft: 12,
		marginRight: 10,
	},
	menuListText: {
		flex: 1,
		height: 50,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	menuListTextBorder: {
		marginLeft: 46,
		borderTopWidth: 1,
		borderTopColor: '#cecece',
	},
	detailsView: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 15,
		paddingLeft: 12,
		backgroundColor: '#ffffff',
	},
	detailsPictrue: {
		borderRadius: 4,
		marginRight: 12,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	detailsImage: {
		width: 60,
		height: 60,
	},
	detailsBox: {
		flexDirection: 'row',
		paddingTop: 8,
		paddingBottom: 8,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
		height: 48,
		alignItems: 'center',
	},
	detailsTitle: {
		width: 90,
	},
	detailsText: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	detailsList: {
		alignItems: 'center',
		height: 20,
		flexDirection: 'row'
	},
	detailsFont: {
		color: '#333',
		fontSize: 15
	},
	detailsSmallFont: {
		color: '#666',
		fontSize: 12
	},
	sexIcon: {
		width: 15,
		height: 15,
		marginLeft: 5,
	},
	detailsFunc: {
		flex: 1,
		flexDirection: 'row',
		height: 48,
		alignItems: 'center',
	},
	detailsFunIcon: {
		width: 25,
		justifyContent: 'center',
	},
	detailsSwitch: {
		marginRight: 10
	}
});
