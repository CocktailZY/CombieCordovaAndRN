'use strict';

import React, {Component} from 'react';

import {
	StyleSheet,
	Text,
	View,
	Linking,
	BackHandler,
	Platform,
	DeviceEventEmitter,
	TouchableOpacity, Alert,NativeModules
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from '../../config/UrlConfig';
import {DURATION} from "react-native-easy-toast";
import Toast from "react-native-easy-toast";
import PermissionUtil from "../../util/PermissionUtil";
let lastPresTime = 1;

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();

class ScanScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			room: {},
		}
	}
    componentDidMount(){
        this.footBackKey = BackHandler.addEventListener("back", ()=>{
            let curTime = new Date().getTime();
            if (curTime - lastPresTime > 500) {
                lastPresTime = curTime;
                return false;
            }
            return true;
        });
        //需要获取相机权限
	    if (Platform.OS == 'android') {
		    // this._checkPermission(true);
		    PermissionUtil.requestAndroidPermission(
			    [PermissionsUtil.Permissions.read,PermissionsUtil.Permissions.write,PermissionsUtil.Permissions.camera], (value) => {
				    if (typeof value == "boolean" && value) {
					    // this.openImagePicker();
				    } else if (typeof value == "boolean" && !value) {
					    Alert.alert(
						    '提醒',
						    '扫描前，请先开启相机权限！',
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
						    // this.openImagePicker();
					    }else{
						    Alert.alert(
							    '提醒',
							    '扫描前，请先开启相机权限！',
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
	    	//ios权限处理
				XMPP.getIOSPermission({'permissionType' : 'camera'},
					(error,event) => {
						if (event == 'true'){
							// this.openImagePicker();
						}});
	    }

    }
    componentWillUnmount(){
        this.footBackKey.remove();
    }
	onSuccess(code) {
		//console.log(code);
		if(code.data.indexOf(',') == -1){
			//不包含“,”
			this.refs.toast.show('无法识别', DURATION.LENGTH_SHORT);
		}else{
			let effectCode = code.data.split(',')[0];
			let flagCode = code.data.split(',')[1];
			if (code.data.indexOf('http') == -1 && flagCode == 'effect') {
				//console.log(effectCode);
				//获取群详情
				let urlDetail = Path.getGroupDetail + '?roomJid=' + effectCode + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&currentJidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;
				FetchUtil.netUtil(urlDetail, {}, 'GET', this.props.navigation, '', (responseJson) => {
					if (responseJson.code.toString() == '200') {
						let tmp = JSON.parse(responseJson.data);
						this.setState({
							room: tmp.groupDetail
						},()=>{
							//是否为群成员
							let url = Path.judgeMember
								+ '?uuId=' + this.state.uuid
								+ '&ticket=' + this.state.ticket
								+ '&userId=' + this.state.basic.userId
								+ '&occupantJid=' + this.state.basic.jidNode
								+ '&roomJid=' + this.state.room.roomJid;
							FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (res) => {
								//console.log(res);
								this.props.navigation.navigate('GroupDetail', {
									'ticket': this.state.ticket,
									'uuid': this.state.uuid,
									'room': this.state.room,
									'basic': this.state.basic,
									'isQRCode': true,
									'isMember': res.dataNotNull
								});
							})
						})
					}
				});
			} else {
				this.refs.toast.show('无法识别', DURATION.LENGTH_SHORT);
				// Linking
				// 	.openURL(code.data)
				// 	.catch(err => console.error('An error occured', err));
			}
		}
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitleStyle={{
						width: 50,
						color: '#FFF',
						fontSize: 16,
						fontWeight: '200',
						marginTop: Platform.OS == 'ios' ? 15 : 0
					}}
					backTitle={'返回'}
					titleStyle={{
						flex: 1,
						color: '#FFF',
						fontSize: 18,
						fontWeight: '500',
						marginHorizontal: Platform.OS == 'ios' ? 0 : 16,
						textAlign: 'center',
						marginTop: Platform.OS == 'ios' ? 15 : 0
					}}
					title={'二维码/条码'}
				/>
				<QRCodeScanner
					ref={'qrscanner'}
					onRead={this.onSuccess.bind(this)}
					topContent={
						<Text style={styles.centerText}>
							{this.state.room.roomName}
						</Text>
					}
					bottomContent={
						<TouchableOpacity style={styles.buttonTouchable} onPress={()=>{
							this.refs.qrscanner.reactivate();
							let roomTemp = this.state.room;
                            roomTemp.roomName = "";
                            this.setState({
                                room: roomTemp
                            })
						}}>
							<Text style={styles.buttonText}>重新扫码</Text>
						</TouchableOpacity>
					}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	centerText: {
		flex: 1,
		fontSize: 18,
		padding: 32,
		color: '#777',
	},
	textBold: {
		fontWeight: '500',
		color: '#000',
	},
	buttonText: {
		fontSize: 21,
		color: '#FFF',
	},
	buttonTouchable: {
		padding: 8,
		backgroundColor:'#278EEE',
		borderRadius: 4,
	},
});
export default ScanScreen;