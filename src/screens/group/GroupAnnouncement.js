import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Platform,
	TouchableOpacity,
	NativeModules,
	TextInput,
	DeviceEventEmitter, ScrollView
} from 'react-native';
import Header from '../../component/common/Header';
import Path from '../../config/UrlConfig';
import UUIDUtil from '../../util/UUIDUtil';
import FormatDate from '../../util/FormatDate';
import FetchUtil from '../../util/FetchUtil';
import XmlUtil from '../../util/XmlUtil';
import ToolUtil from '../../util/ToolUtil';
import DeviceInfo from 'react-native-device-info';
import Toast, {DURATION} from 'react-native-easy-toast';
import Sqlite from "../../util/Sqlite";
import HandlerOnceTap from '../../util/HandlerOnceTap';
import RedisUtil from '../../util/RedisUtil';

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();

let onceSubmit;
export default class GroupAnnouncement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			room: props.navigation.state.params.room,
			basic: props.navigation.state.params.basic,
			affiliation: props.navigation.state.params.affiliation,//false为普通成员，true为群主或管理员
			messageBody: {
				"id": UUIDUtil.getUUID(),
				"messageType": 'announcement',
				"basic": {
					"userId": props.navigation.state.params.basic.jidNode,
					"userName": props.navigation.state.params.basic.trueName,
					"head": props.navigation.state.params.room.head,
					"sendTime": new Date().getTime(),
					"groupId": props.navigation.state.params.room.roomJid,
					"groupName": props.navigation.state.params.room.roomName,
					"type": 'announcement'
				},
				"content": {
					"text": '',
					"interceptText": '',
					"file": [],
					"title": ''
				},
				"atMembers": [],
				"occupant": {
					"state": '',
					"effect": '',
					"active": ''
				}
			},
			AnnouncementTitle: '',//公告标题
			AnnouncementContent: '',//公告内容
		}
	};

	componentDidMount() {
		onceSubmit = this.state.basic.userId + new Date().getTime();

		RedisUtil.onceSubmit(onceSubmit, this.props.navigation,
			{
				ticket: this.state.ticket,
				uuId: this.state.uuid,
				userId: this.state.basic.userId
			});

	}

	_sendAnnouncement() {
		DeviceEventEmitter.emit('changeLoading', 'true');
		this.refs.textArea.blur();
		this.refs.textTitle.blur();
		//实时调取接口查询是否为群主或管理员
		FetchUtil.netUtil(Path.isRoomAdmin + '?ticket=' + this.state.ticket + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&roomJid=' + this.state.room.roomJid + '&jidNode=' + this.state.basic.jidNode, {}, 'GET', this.props.navigation, '', (responseJson) => {
			if (responseJson.code.toString() == '200') {
				if (responseJson.data) {
					//是管理员或群主
					let newMsgId = UUIDUtil.getUUID().replace(/\-/g, '') + 'GroupMsg';
					if (this.state.AnnouncementTitle == '') {
						this.refs.toast.show('标题不得为空', DURATION.LENGTH_SHORT);
						DeviceEventEmitter.emit('changeLoading', 'false');
					} else if (this.state.AnnouncementTitle.length > 32) {
						this.refs.toast.show('标题长度不得超过32位', DURATION.LENGTH_SHORT);
						DeviceEventEmitter.emit('changeLoading', 'false');
					} else if (ToolUtil.isEmojiCharacterInString(this.state.AnnouncementTitle)) {
						this.refs.toast.show('标题含有非法字符', DURATION.LENGTH_SHORT);
						DeviceEventEmitter.emit('changeLoading', 'false');
					} else if (ToolUtil.isEmojiCharacterInString(this.state.AnnouncementContent)) {
						this.refs.toast.show('内容含有非法字符', DURATION.LENGTH_SHORT);
						DeviceEventEmitter.emit('changeLoading', 'false');
					} else if (this.state.AnnouncementContent == '') {
						this.refs.toast.show('内容不得为空', DURATION.LENGTH_SHORT);
						DeviceEventEmitter.emit('changeLoading', 'false');
					} else {
						let body = {
							'bodyId': newMsgId,
							'&roomJid': this.state.room.roomJid,
							'&title': this.state.AnnouncementTitle,
							'&content': this.state.AnnouncementContent,
							'&createJid': this.state.basic.jidNode,
							'&uuId': this.state.uuid,
							'&ticket': this.state.ticket,
							'&userId': this.state.basic.userId,
							'key': onceSubmit
						};
						FetchUtil.netUtil(Path.saveGroupNotice, body, 'POST', this.props.navigation, {
							uuId: this.state.uuid,
							ticket: this.state.ticket,
							userId: this.state.basic.userId
						}, (data) => {
							console.log(data);
							if (data.code.toString() == '200') {
								this.state.messageBody.content.title = this.state.AnnouncementTitle;
								this.state.messageBody.id = newMsgId;
								if (Platform.OS === 'ios') {
									XMPP.XMPPSendGroupMessage({
											'message': this.state.messageBody,
											'jid': this.state.room.roomJid,
											'uuid': newMsgId
										},
										(error, event) => {
											if (error) {
												this.refs.toast.show(error, DURATION.LENGTH_SHORT);

											} else {
												DeviceEventEmitter.emit('noticeAddPage');
												DeviceEventEmitter.emit('changeLoading', 'false');
												// DeviceEventEmitter.emit('noticeChatPage', {body: this.state.messageBody, type: 'announcement'});
											}
										})

								} else {
									let sendGroupAnn = XmlUtil.sendGroup('groupchat', this.state.room.roomJid + Path.xmppGroupDomain, JSON.stringify(this.state.messageBody), newMsgId);
									console.log('发送公告message报文：' + sendGroupAnn);
									XMPP.sendStanza(sendGroupAnn);
									DeviceEventEmitter.emit('noticeAddPage');
									DeviceEventEmitter.emit('changeLoading', 'false');
									// DeviceEventEmitter.emit('noticeChatPage', {body: this.state.messageBody, type: 'announcement'});
								}
								this.props.navigation.goBack();
							} else if (data.code.toString() == '-33') {
								this.refs.toast.show('请求已提交，请勿重复操作', DURATION.LENGTH_SHORT);
								DeviceEventEmitter.emit('changeLoading', 'false');
							}
						});
					}
				} else {
					this.refs.toast.show('您没有权限发布公告', DURATION.LENGTH_SHORT);
					DeviceEventEmitter.emit('changeLoading', 'false');
				}
			} else {
				DeviceEventEmitter.emit('changeLoading', 'false');
			}
		});

	}

	render() {
		return (
			<View style={styles.container}>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'取消'}
					title={'公告发布'}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					style={{flex: 1}}>
					<View style={styles.announcementContent}>
						<Text style={styles.announcementTitle}>公告标题</Text>
						<View style={styles.announcementText}>
							<TextInput
								ref={'textTitle'}
								style={styles.announcementInput}
								placeholder='请输入公告标题'
								underlineColorAndroid={'transparent'}
								maxLength={32}
								value={this.state.AnnouncementTitle}
								onChangeText={(text) => {
									this.setState({
										AnnouncementTitle: text
									})
								}}/>
						</View>
						<Text style={styles.announcementTitle}>公告内容</Text>
						<View style={[styles.announcementText, {flex: 1}]}
									onStartShouldSetResponder={() => this.refs.textArea.focus()}>
							<TextInput
								ref='textArea'
								style={[styles.announcementInput, {textAlignVertical: 'top', minHeight: 300}]}
								placeholder='请填写具体内容'
								underlineColorAndroid={'transparent'}
								multiline={true}
								maxLength={300}
								value={this.state.AnnouncementContent}
								onChangeText={(text) => {
									this.setState({
										AnnouncementContent: text
									})
								}}/>
						</View>
						<TouchableOpacity style={styles.btn} onPress={() => {
							HandlerOnceTap(() => this._sendAnnouncement())
						}}>
							<Text style={{fontSize: 15, color: '#fff'}}>发表</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	announcementContent: {
		flex: 1,
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 20,
		paddingBottom: 20,
	},
	btn: {
		height: 43,
		borderRadius: 4,
		backgroundColor: '#4e71ff',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 14,
		marginTop: 10,
	},
	announcementTitle: {
		marginBottom: 10,
	},
	announcementText: {
		borderColor: '#d7d7d7',
		borderWidth: 1,
		marginBottom: 15,
		backgroundColor: '#fff'
	},
	announcementInput: {
		margin: 0,
		padding: 3,
		paddingLeft: 8,
		paddingRight: 8,
	}
});