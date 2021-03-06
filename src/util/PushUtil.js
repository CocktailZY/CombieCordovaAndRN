import FetchUtil from './FetchUtil';
import Path from "../config/UrlConfig";
import {
	Platform,
} from 'react-native';

export default PushUtil = {
	//增加标签
	pushNotificationRegister(roomJidNode, token, uuid, userId, ticket, basic, navigation) {
		let userInfo = basic;
		let operator_type = 1;

		FetchUtil.netUtil(Path.pushTagNotification, {
			operator_type: operator_type,
			tag_list: [roomJidNode],
			token_list: [token],
			platform: Platform.OS == 'ios' ? 'ios' : 'android'
		}, 'POST', navigation, {
			uuId: uuid,
			userId: userId,
			ticket: ticket
		}, (data) => {

			if (data.code.toString() == '200') {

			}
		})
	},

	//发群通知
	pushGroupNotification(basic, ticket, roomJidNode, uuId, content,title, navigation) {

		let body = {
			userId: '',
			type: 'group',
			roomJid: roomJidNode,
			jidNode: basic.jidNode,
			currentUid: basic.uid,
			content: content ? content : '您收到一条新消息',
			title: title
		};

		FetchUtil.netUtil(Path.pushNotification, body, 'POST', navigation, {
			uuId: uuId,
			userId: basic.userId,
			ticket: ticket
		}, (data) => {})
	},

	//发单聊通知
	pushSingleNotification(basic, ticket, friendJidNode, uuId, userId, content,title, navigation) {


		let body = {

			userId: userId != undefined ? userId : '',
			jidNode: friendJidNode != undefined ? friendJidNode : '',
			type: 'single',
			currentUid: basic.uid,
			content: content ? content : '您收到一条新消息',
			title: title
		}


		FetchUtil.netUtil(Path.pushNotification, body, 'POST', navigation, {
			uuId: uuId,
			userId: basic.userId,
			ticket: ticket
		}, (data) => {})
	}
}