/**
 *  群组移交单选人员页面
 */
import React, {Component} from 'react';
import {
	StyleSheet, Text, View, Image, TouchableWithoutFeedback,
	Platform, Dimensions, ToastAndroid, NativeModules,
	DeviceEventEmitter, Alert, BackHandler, TouchableOpacity,
	FlatList, ActivityIndicator
} from 'react-native';

import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import XmlUtil from "../../util/XmlUtil";
import HandlerOnceTap from '../../util/HandlerOnceTap';
import Global from "../../util/Global";
import Toast from "react-native-easy-toast";
import RedisUtil from "../../util/RedisUtil";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import UUIDUtil from "../../util/UUIDUtil";
import PCNoticeUtil from "../../util/PCNoticeUtil";

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();
const {height, width} = Dimensions.get('window');
export default class GroupChange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			roomJid: props.navigation.state.params.roomJid,//群Jid
			datas: [],//可移交成员列表
			chooseJidNode: '',//被选择人的jidNode
			chooseTrueName: '',//被选择人的trueName
			messageBody: {
				"id": UUIDUtil.getUUID().replace(/\-/g, ''),
				"type": 0,
				"messageType": 'text',
				"basic": {
					"userId": Global.loginUserInfo.jidNode,
					"userName": Global.loginUserInfo.trueName,
					"head": props.navigation.state.params.room.head,
					"sendTime": new Date().getTime(),
					"groupId": props.navigation.state.params.roomJid,
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
					"active": Global.loginUserInfo.trueName
				}
			}
		};
		this.changeNodeStatue = false;//移交监听入口标记
		this.changeReadStatue = false;
		this.changePublishMessageStatue = false;
	}

	componentDidMount() {
		this._fetchMemberData();

		if (Platform.OS == 'android') {
			this.groupChangeIq = XMPP.on('iq', (iq) => this._XMPPdidReceiveIQ(iq));
		}

	}

	componentWillUnmount() {
		if (Platform.OS == 'android') {
			this.groupChangeIq.remove();
		}

	}

	_XMPPdidReceiveIQ = (iq) => {
		if (iq.type == 'result' && this.changeNodeStatue) {
			//发送订阅
			let sendMetuReadIqToGroup = XmlUtil.subscriptionToGroup(this.state.chooseJidNode + '@' + Path.xmppDomain, this.ischange);
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.changeNodeStatue = false;
			this.changeReadStatue = true;
		}

		if (iq.type == 'result' && this.changeReadStatue && iq.pubsub && iq.pubsub.subscription) {
			//发布消息
			let sendMetuReadIqToGroup = XmlUtil.sendMessageGroup(this.state.roomJid, this.state.chooseJidNode, Global.loginUserInfo.jidNode, this.ischange, 'SETOWNER');
			XMPP.sendStanza(sendMetuReadIqToGroup);
			this.changeReadStatue = false;
			this.changePublishMessageStatue = true;
		}

		if (iq.type == 'result' && this.changePublishMessageStatue && iq.pubsub && iq.pubsub.publish) {
			XMPP.sendStanza(XmlUtil.delIqNode(this.ischange));//删除iq节点
			PCNoticeUtil.pushPCNotification(this.state.roomJid,
				this.state.chooseJidNode,
				this.ischange,
				this.state.chooseJidNode,
				Global.loginUserInfo.jidNode,
				'SETOWNER',
				Global.basicParam, this.props.navigation, () => {
					//发消息
					let mes = JSON.parse(JSON.stringify(this.state.messageBody));
					mes.content.text = this.state.chooseTrueName + ' 被设置为超级管理员';
					mes.content.interceptText = this.state.chooseTrueName + ' 被设置为超级管理员';
					mes.id = UUIDUtil.getUUID().replace(/\-/g, '');
					mes.occupant.state = 'SETOWNER';
					let sendMsgToGroup = XmlUtil.sendGroup('groupchat', this.state.roomJid + Path.xmppGroupDomain, JSON.stringify(mes), mes.id);
					XMPP.sendStanza(sendMsgToGroup);
					this.changePublishMessageStatue = false;
					this.props.navigation.goBack();//返回详情页面
				});
		}
	}

	_fetchMemberData = () => {
		let affiliations = ['admin', 'member'];
		let url = Path.getGroupMember + '?roomJid=' + this.state.roomJid + Global.parseBasicParam + '&affiliations=' + JSON.stringify(affiliations);
		console.log(url);
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (res) => {
			console.log(res);
			if (res.code.toString() == '200') {
				res.data.map((item, index) => {
					item['checked'] = false;
				});
				this.setState({
					datas: res.data
				})
			}
			//处理添加选中状态
		});
	};

	_confirmChange = () => {
		this.ischange = UUIDUtil.getUUID().replace(/\-/g, '');
		if (Platform.OS == 'android') {
			//1.将对方设置为超级管理员
			let setPeopleOwner = XmlUtil.setAdmin(this.state.roomJid + Path.xmppGroupDomain, this.state.chooseJidNode, 'owner', '超级管理员');
			XMPP.sendStanza(setPeopleOwner);
			//2.将自己设置为成员
			let setOwnMember = XmlUtil.setMember(this.state.roomJid + Path.xmppGroupDomain, Global.loginUserInfo.jidNode);
			XMPP.sendStanza(setOwnMember);
			//3.报文成功之后调用接口/groupmanage/changeower
			let body = {
				roomJid: this.state.roomJid,
				occupantJid: this.state.chooseJidNode,
			};
			FetchUtil.netUtil(Path.changeGroup, body, 'POST', this.props.navigation, Global.basicParam, (data) => {
				console.log(data);
				if (data.code == '200') {
					//4.向群发送message  SETOWNER  5.节点通知 --> 转监听处理
					this.changeNodeStatue = true;
					let sendChangeIqToGroup = XmlUtil.createGroupNode(Global.loginUserInfo.jidNode, this.ischange);
					XMPP.sendStanza(sendChangeIqToGroup);
					DeviceEventEmitter.emit('refreshGroupDetail');//修改禁言状态广播详情
				}
			});
		} else {
			//ios处理
			XMPP.XMPPSetAdmin({'adminJid': this.state.chooseJidNode, 'roomJid': this.state.roomJid, 'model': '设为管理员'});

			XMPP.XMPPSetMember({'memberJid': Global.loginUserInfo.jidNode, 'roomJid': this.state.roomJid});

			let body = {
				roomJid: this.state.roomJid,
				occupantJid: this.state.chooseJidNode,
			};
			FetchUtil.netUtil(Path.changeGroup, body, 'POST', this.props.navigation, Global.basicParam, (data) => {
				console.log(data);
				if (data.code == '200') {
					//4.向群发送message  SETOWNER  5.节点通知 --> 转监听处理
					XMPP.XMPPCreateNode({
							'uuid': this.ischange,
							'userJid': Global.loginUserInfo.jidNode,
							'nodeUserJid': this.state.chooseJidNode,
							'roomJid': this.state.roomJid,
							'type': "SETOWNER",
						  'userId': Global.basicParam.userId
						},
						(error, event) => {
							if (error) {
								this.refs.toast.show(error, DURATION.LENGTH_SHORT);

							} else if (event) {

								PCNoticeUtil.pushPCNotification(this.state.roomJid,
									this.state.chooseJidNode,
									this.ischange,
									this.state.chooseJidNode,
									Global.loginUserInfo.jidNode,
									'SETOWNER',
									Global.basicParam, this.props.navigation, () => {
										//发消息
										let mes = this.state.messageBody;
										mes.content.text = this.state.chooseTrueName + ' 被设置为超级管理员';
										mes.content.interceptText = this.state.chooseTrueName + ' 被设置为超级管理员';
										mes.id = UUIDUtil.getUUID().replace(/\-/g, '');
										mes.occupant.state = 'SETOWNER';

										XMPP.XMPPSendGroupMessage({
											'message': mes,
											'jid': this.state.roomJid,
											'uuid': this.ischange
										}, (error, event) => {
											if (error) {
												this.refs.toast.show(error, DURATION.LENGTH_SHORT);
											}

											XMPP.XMPPDeleteNode({'node': this.ischange, 'uuid': UUIDUtil.getUUID().replace(/\-/g, '')});

											this.changePublishMessageStatue = false;
											DeviceEventEmitter.emit('refreshGroupDetail');
											this.props.navigation.goBack();//返回详情页面
										})
									});
							}
						})
				}
			});

		}
	}

	_selectedAdd = (jid, name) => {
		let tempArr = JSON.parse(JSON.stringify(this.state.datas));
		tempArr.map((obj, index) => {
			obj.checked = false;
			if (obj.occupantJid == jid) {
				obj.checked = true;
			}
		});
		this.setState({
			datas: tempArr,
			chooseJidNode: jid,
			chooseTrueName: name
		})
	};

	_renderItemList = ({item, index}) => {
		return (
			<TouchableWithoutFeedback
				style={{borderTopColor: index == 0 ? 'transparent' : '#D7D7D7'}}
				onPress={() => {
					this._selectedAdd(item.occupantJid, item.occupantTrueName);
				}}>
				<View style={styles.touchRow}>
					{item.checked ? (
						<Icons name={'checkbox-marked-circle-outline'} size={20} color={'#278EEE'} style={{marginRight: 8}}/>
					) : (
						<Icons name={'checkbox-blank-circle-outline'} size={20} color={'#CCCCCC'} style={{marginRight: 8}}/>
					)}
					<Image
						source={{
							uri: Path.headImgNew + '?imageName=' + item.occupantPhotoId + '&imageId=' + item.occupantPhotoId + '&sourceType=singleImage&jidNode=' + "" + '&platform=' + Platform.OS + Global.parseBasicParam
						}}
						style={styles.itemImage}/>
					<Text style={{
						fontSize: 14,
						color: '#777',
						flex: 1
					}}>{item.occupantTrueName}</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	};

	render() {
		const {datas, chooseJidNode} = this.state;
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
					title={'选择移交人员'}
				/>
				<FlatList
					keyExtractor={(item, index) => String(index)}
					data={datas}
					renderItem={this._renderItemList}
					ItemSeparatorComponent={() => <View style={styles.separator}/>}
					ListEmptyComponent={() => (
						<View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
							{datas ? (
								<Text>{'无可移交人员'}</Text>
							) : (
								<ActivityIndicator size={'large'} color={'#278EEE'}/>
							)}
						</View>
					)}
					// onEndReachedThreshold={0.1}
					// onEndReached={this._onEndReached}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					// ListFooterComponent={this._renderFooter.bind(this)}
				/>
				{chooseJidNode == '' ? null : (
					<TouchableOpacity onPress={() => {
						Alert.alert(
							'提醒',
							'是否移交群主权限',
							[
								{text: '取消'},
								{
									text: '确定',
									onPress: () => {
										this._confirmChange();
									},
								}
							]
						)
					}}
														style={[styles.delBtn, {backgroundColor: '#278eee'}]}>
						<Text style={{
							fontSize: 15,
							color: '#fff'
						}}>{'确认移交'}</Text>
					</TouchableOpacity>
				)}
			</View>
		)
	}

}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	touchRow: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		padding: 8,
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
	separator: {
		borderBottomWidth: 1,
		borderBottomColor: '#ccc'
	},
	itemImage: {
		width: 36,
		height: 36,
		marginRight: 8,
		borderRadius: 4
	},
})