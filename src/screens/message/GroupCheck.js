import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	FlatList,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
	NativeModules,
	DeviceEventEmitter
} from 'react-native';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import Toast, {DURATION} from 'react-native-easy-toast';
import UUIDUtil from "../../util/UUIDUtil";
import Global from "../../util/Global";
import XmlUtil from "../../util/XmlUtil";
import HandlerOnceTap from '../../util/HandlerOnceTap';
import PCNoticeUtil from "../../util/PCNoticeUtil";
import Sqlite from "../../util/Sqlite";

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();

let noticeBody = {};
export default class GroupCheck extends Component {
	constructor(props) {
		super(props);
		this.state = {
			room: {},//点击某一项再进行赋值roomJid,head
			ticket: Global.basicParam.ticket,
			uuid: Global.basicParam.uuId,
			auditMember: [],
			showFoot: 0,
			applicat: {},
			modeType: '',
			pageNum: 1,
			totalPage: 0,
			footLoading: false,//是否可刷新
		};
		this.touchLock = true;
		this.createNodeStatue = false;
		this.createReadStatue = false;
		this.createPublishMessageStatue = false;
	}

	componentDidMount() {
		//update消息页面未读条数
		Sqlite.updateTalker(Global.loginUserInfo.userId, Global.loginUserInfo.jidNode, 0, true, false, false, () => {
			DeviceEventEmitter.emit('refreshPage', 'refresh');
			DeviceEventEmitter.emit('resetTabNum');
		});
		this.getAuditMember(1);

		if (Platform.OS == 'android') {

			this.groupIq = XMPP.on('iq', (iq) => this._XMPPdidReceiveIQ(iq));
		}

	};

	componentWillUnmount() {
		noticeBody = {};
		if (Platform.OS == 'android') {

			this.groupIq.remove();
		}
	}

	_XMPPdidReceiveIQ = (iq) => {

		if (iq.type == 'result' && this.createNodeStatue) {
			//发送订阅
			let sendMetuReadIqToGroup = XmlUtil.subscriptionToGroup(this.state.applicat.applicantJid+ '@'+Path.xmppDomain, this.join);
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.createNodeStatue = false;
			this.createReadStatue = true;
		}

		if (iq.type == 'result' && this.createReadStatue && iq.pubsub && iq.pubsub.subscription) {
			//发布消息
			let sendMetuReadIqToGroup = XmlUtil.sendMessageGroup(this.state.room.roomJid, this.state.applicat.applicantJid, Global.loginUserInfo.jidNode, this.join, this.state.modeType);
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.createReadStatue = false;
			this.createPublishMessageStatue = true;
		}

		if (iq.type == 'result' && this.createPublishMessageStatue && iq.pubsub && iq.pubsub.publish) {

			if(this.isPassStatus){
				//邀请入群
				let inviteToGroup = XmlUtil.inviteToGroup(this.state.applicat.applicantJid+'@'+Path.xmppDomain, this.state.room.roomJid + Path.xmppGroupDomain, Global.loginUserInfo.jid);
				XMPP.sendStanza(inviteToGroup);
				//设置角色
				let setRoleMsg = XmlUtil.setMember(this.state.room.roomJid+Path.xmppGroupDomain,this.state.applicat.applicantJid)
				XMPP.sendStanza(setRoleMsg);
			}

			PCNoticeUtil.pushPCNotification(this.state.room.roomJid,
				this.state.applicat.applicantJid,
				this.join,
				this.state.applicat.applicantJid,
				Global.loginUserInfo.jidNode,
				this.isPassStatus ? "JOINPASS" : "JOINNOTPASS" ,
				{uuId:this.state.uuid,ticket:this.state.ticket,userId:Global.loginUserInfo.userId
				}, this.props.navigation, () => {
					// let setMember = XmlUtil.setMember(this.state.room.roomJid + Path.xmppGroupDomain, noticeBody.occupantJid);
					// XMPP.sendStanza(setMember);
					let sendMessageToGroup = XmlUtil.sendGroup('groupchat', this.state.room.roomJid + Path.xmppGroupDomain, JSON.stringify(this.tempSigleBody), this.tempSigleBody.id);
					XMPP.sendStanza(sendMessageToGroup);

					// DeviceEventEmitter.emit('noticeChatPage', {body: this.tempSigleBody, type: 'text'});
					DeviceEventEmitter.emit('refreshGroupDetail');

					this.createPublishMessageStatue = false;
				})

		}


	};

	getAuditMember = (pageNum) => {
		let params = {
			occupantJid:Global.loginUserInfo.jidNode,
			pageNum: pageNum,
			pageSize: Path.pageSize
		};
		FetchUtil.netUtil(Path.auditMembersList, params, 'POST', this.props.navigation, Global.basicParam, (data) => {
			console.log(data);
			if (data.code == 200) {
				this.touchLock = true;
				this.setState({
					auditMember: pageNum == 1 ? data.data.recordList : this.state.auditMember.concat(data.data.recordList),
					pageNum: data.data.currentPage,
					totalPage: data.data.totalPage,
					footLoading: false
				});
			}
		});
	}

	_renderMemberItem = ({item, index}) => {
		let inviteText = !item.inviterName ? item.applicantName + '申请' : item.inviterName + '邀请' + item.applicantName;
		return (
			<View key={index} style={styles.auditBox}>
				<Image
					// source={{uri: Path.headImg + '?uuId=' + this.state.uuid + '&userId=' + Global.loginUserInfo.userId + '&ticket=' + this.state.ticket + '&fileName=' + item.photoId}}
					source={{uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + Global.loginUserInfo.userId + '&imageName=' + item.photoId + '&imageId=' + item.photoId + '&sourceType=singleImage&jidNode=' + '' + '&platform=' + Platform.OS}}
					style={styles.auditImg}
				/>
				<View style={{flex: 1, justifyContent: 'center'}}>
					<Text numberOfLines={1} style={{fontSize: 16, color: '#333'}}>{item.applicantName}</Text>
					<Text numberOfLines={1}
					      style={{fontSize: 12, color: '#777'}}>{inviteText + `加入${item.roomName}`}</Text>
				</View>
				<TouchableOpacity style={[styles.auditBtn, {backgroundColor: '#549dff'}]}
				                  onPress={()=>{HandlerOnceTap(() => this.auditOKOrNot(item, true))}}>
					<Text style={styles.auditBtnText}>同意</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.auditBtn, {backgroundColor: '#c1c1c1', marginLeft: 10}]}
				                  onPress={()=>{HandlerOnceTap(() => this.auditOKOrNot(item, false))}}>
					<Text style={styles.auditBtnText}>拒绝</Text>
				</TouchableOpacity>
			</View>
		)
	}

	auditOKOrNot = (item, type) => {
		if (!this.touchLock) {
			return false;
		}
		this.setState({
			room:{
				roomJid: item.roomJid,
				roomName: item.roomName
			}
		},()=>{
			this.touchLock = false;
			FetchUtil.netUtil(Path.auditFriendsUpdata, {
				roomJid: item.roomJid,
				applicantJid: item.applicantJid,
				approverJid: item.approverJid,
				timestamp: item.timestamp,
				status: type ? '02' : '03'
			}, 'POST', this.props.navigation, Global.basicParam, (data) => {
				if (data.code == '200') {
					if (data.data == 'done') {
						this.refs.toast.show('该成员已被其他管理员操作', DURATION.LENGTH_SHORT);
					} else {
						this.callbackAuditOKOrNot(item, type);
					}
				}
			});
		})
	}

	callbackAuditOKOrNot(item, state) {
		this.join = UUIDUtil.getUUID().replace(/\-/g, '');
		this.tempSigleBody = {
			"id": this.join + 'GroupMsg',
			"type": 0,
			"messageType": 'text',
			"basic": {
				"userId": Global.loginUserInfo.jidNode,
				"userName": Global.loginUserInfo.trueName,
				"head": '',//接口无返回
				"sendTime": new Date().getTime(),
				"groupId": item.roomJid,
				"type": "groupChat",
				"groupName": item.roomName
			},
			"content": {
				"text": `${Global.loginUserInfo.trueName} ${state ? '同意' : '拒绝'} ${item.applicantName} 加入群组`,
				"interceptText": `${Global.loginUserInfo.trueName} ${state ? '同意' : '拒绝'} ${item.applicantName} 加入群组`,
				"file": []
			},
			"atMembers": [],
			"occupant": {
				"state": state ? "JOINPASS" : "JOINNOTPASS",
				"effect": item.applicantName,
				"active": Global.loginUserInfo.trueName
			}
		};


		if (state){
			let tempBody = 'uuId=' + this.state.uuid
				+ '&ticket=' + this.state.ticket
				+ '&roomJid=' + item.roomJid
				+ '&occupantJid=' + item.applicantJid + '&userId=' + Global.loginUserInfo.userId;
			FetchUtil.sendPost(Path.inviteFriends, tempBody, this.props.navigation, (memberData) => {
				noticeBody = {
					roomJid : item.roomJid,
					occupantJid : item.applicantJid,
					node : this.join,
					effect : item.applicantJid,
					active : Global.loginUserInfo.jidNode,
					message : "JOINPASS"
				};

				if (memberData.code + '' == '200') {
					if (Platform.OS == 'ios') {

						XMPP.agreeJoinTheGroup({
								'roomJid': item.roomJid,
								'userJid': Global.loginUserInfo.jidNode,
								'userName': Global.loginUserInfo.trueName,
								'uuid': this.join,
								'ticket': this.state.ticket,
								'userId': Global.loginUserInfo.userId,
								'friendJid': item.applicantJid
							},
							(error, event) => {
								if (error) {
									this.refs.toast.show(error, DURATION.LENGTH_SHORT);
								} else {

									XMPP.XMPPCreateNode({
											'uuid': this.join,
											'userJid': Global.loginUserInfo.jidNode,
											'nodeUserJid': item.applicantJid,
											'roomJid': item.roomJid,
											'type': "JOINPASS",
										  'userId' : this.state.basic.userId
										},
										(error, event) => {
											if (error) {
												this.refs.toast.show(error, DURATION.LENGTH_SHORT);
											} else if (event) {

												PCNoticeUtil.pushPCNotification(item.roomJid,
													item.applicantJid,
													this.join,
													item.applicantJid,
													Global.loginUserInfo.jidNode,
													"JOINPASS",
													{uuId:this.state.uuid,ticket:this.state.ticket,userId:Global.loginUserInfo.userId
													}, this.props.navigation, () => {
														XMPP.XMPPSetMember({'memberJid': item.applicantJid, 'roomJid': item.roomJid});
														XMPP.XMPPSendGroupMessage({
																'message': this.tempSigleBody,
																'jid': item.roomJid,
																'uuid': this.join
															},
															(error, event) => {
																if (error) {
																	this.refs.toast.show(error, DURATION.LENGTH_SHORT);
																} else {

																	// DeviceEventEmitter.emit('noticeChatPage', {body: this.tempSigleBody, type: 'text'});
																	DeviceEventEmitter.emit('refreshGroupDetail');
																	this.state.auditMember = [];
																	this.getAuditMember(1);
																}
															})
													});

											}
										})
								}
							});


					} else {
						this.setState({
							applicat: item,
							modeType: "JOINPASS"
						})
						this.createNodeStatue = true;
						this.isPassStatus = true;
						let sendMetuIqToGroup = XmlUtil.createGroupNode(Global.loginUserInfo.jidNode, this.join);
						XMPP.sendStanza(sendMetuIqToGroup);

						// DeviceEventEmitter.emit('noticeChatPage', {body: this.tempSigleBody, type: 'text'});
						// DeviceEventEmitter.emit('refreshGroupDetail');
						this.state.auditMember = [];
						this.getAuditMember(1);
					}
				}
			});
		}else {
			if (Platform.OS == 'ios'){
				XMPP.XMPPCreateNode({
						'uuid': this.join,
						'userJid': Global.loginUserInfo.jidNode,
						'nodeUserJid': item.applicantJid,
						'roomJid': item.roomJid,
						'type': "JOINNOTPASS",
					  'userId': Global.basicParam.userId
					},
					(error, event) => {
						if (error) {
							this.refs.toast.show(error, DURATION.LENGTH_SHORT);
						} else if (event) {

							PCNoticeUtil.pushPCNotification(item.roomJid,
								item.applicantJid,
								this.join,
								item.applicantJid,
								Global.loginUserInfo.jidNode,
								"JOINNOTPASS",
								{uuId:this.state.uuid,ticket:this.state.ticket,userId:Global.loginUserInfo.userId
								}, this.props.navigation, () => {
									XMPP.XMPPSetMember({'memberJid': item.applicantJid, 'roomJid': item.roomJid});
									XMPP.XMPPSendGroupMessage({
											'message': this.tempSigleBody,
											'jid': item.roomJid,
											'uuid': this.join
										},
										(error, event) => {
											if (error) {
												this.refs.toast.show(error, DURATION.LENGTH_SHORT);
											} else {

												// DeviceEventEmitter.emit('noticeChatPage', {body: this.tempSigleBody, type: 'text'});
												DeviceEventEmitter.emit('refreshGroupDetail');
												this.state.auditMember = [];
												this.getAuditMember(1);
											}
										})
								});

						}
					})
			}else {
				this.setState({
					applicat: item,
					modeType: "JOINNOTPASS"
				})
				this.createNodeStatue = true;
				this.isPassStatus = false;
				let sendMetuIqToGroup = XmlUtil.createGroupNode(Global.loginUserInfo.jidNode, this.join);
				XMPP.sendStanza(sendMetuIqToGroup);

				// DeviceEventEmitter.emit('noticeChatPage', {body: this.tempSigleBody, type: 'text'});
				// DeviceEventEmitter.emit('refreshGroupDetail');
				this.state.auditMember = [];
				this.getAuditMember(1);

			}
		}


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
					title={'待审核人员'}
				/>
				<FlatList
					data={this.state.auditMember}
					renderItem={this._renderMemberItem}
					keyExtractor={(item, index) => String(index)}
					ItemSeparatorComponent={() => <View style={styles.separator}></View>}
					ListEmptyComponent={() => <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
						<Text style={{fontSize: 16, color: '#999'}}>暂无待审核人员</Text>
					</View>}
					// onEndReachedThreshold={0.1}
					// onEndReached={this._onEndReached}
					refreshing={false}
					onRefresh={() => {
						this.getAuditMember(1)
					}}
					ListFooterComponent={this._renderFooter.bind(this)}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}/>
			</View>
		)
	}

	_renderFooter() {
		let footView = null;
		if (this.state.pageNum < this.state.totalPage) {
			if (this.state.footLoading) {
				footView = (
					<View style={styles.footer}>
						<ActivityIndicator/>
						<Text style={styles.footerText}>正在加载更多数据...</Text>
					</View>
				)
			} else {
				footView = (
					<TouchableOpacity
						style={styles.footer}
						onPress={() => {
							let tempNowPage = this.state.pageNum + 1;
							this.setState({footLoading: true}, () => {
								//获取数据
								this.getAuditMember(tempNowPage);
							});
						}}
					>
						<Text>{'点击加载更多数据'}</Text>
					</TouchableOpacity>
				)
			}
		} else {
			if(this.state.auditMember.length > 0){
				footView = (
					<View style={styles.footer}>
						<Text>{'没有更多数据了'}</Text>
					</View>
				)
			}
		}
		return footView;
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	auditBox: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 8,
		paddingTop: 3,
		paddingBottom: 3,
	},
	auditImg: {
		width: 48,
		height: 48,
		marginRight: 10
	},
	auditBtn: {
		width: 50,
		height: 26,
		justifyContent: 'center',
		alignItems: 'center'
	},
	auditBtnText: {
		fontSize: 12,
		color: 'white'
	},
	separator: {
		borderTopColor: '#ccc',
		borderTopWidth: 1
	},
	footer: {
		flexDirection: 'row',
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	footerText: {
		fontSize: 14,
		color: '#999'
	}
});
