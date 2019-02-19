import React, {Component} from 'react';
import {
	DeviceEventEmitter,
	Platform,
	StyleSheet,
	TextInput,
	NativeModules,
	View,BackHandler,
	Alert
} from 'react-native';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import Sqlite from "../../util/Sqlite";
import Toast, {DURATION} from 'react-native-easy-toast';
import UUIDUtil from '../../util/UUIDUtil';
import XmlUtil from '../../util/XmlUtil';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import cookie from '../../util/cookie';

let lastPresTime = 1;
export default class CheckPassword extends Component {
	constructor(props) {
		super(props);
		this.state = {
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			ticket: props.navigation.state.params.ticket,
			lockInfor: props.navigation.state.params.lockInfor,
			setting: props.navigation.state.params.setting,
			text: '',
			type: props.navigation.state.params.type
		}
	};

	//组件渲染完毕时调用此方法
	componentDidMount() {
		this._handLockWin = DeviceEventEmitter.addListener('handLockWin', (params) => {
			this.props.navigation.goBack();
		});
        this.footBackKey = BackHandler.addEventListener("back", () => {
            let curTime = new Date().getTime();
            if (curTime - lastPresTime > 500) {
                lastPresTime = curTime;
                return false;
            }
            return true;
        });
	};
	componentWillUnmount() {
		this._handLockWin.remove();
        this.footBackKey.remove();
	}

	submitPassword = () => {

		this.refs.Password.blur();
		FetchUtil.netUtil(Path.checkPassword, this.body, 'POST', this.props.navigation, {
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId
		}, (responseJson) => {

			if (responseJson.data.toString() == 'true' && responseJson.status.toString() == 'true') {
				if (this.state.type == 'open') {
					this.props.navigation.navigate('HandLock', {
						uuid: this.state.uuid,
						ticket: this.state.ticket,
						basic: this.state.basic,
						lockInfor: this.state.lockInfor,
						setting: this.state.setting
					});
				} else if (this.state.type == 'close') {
					this._closeDeviceLock();
				}
			} else {
				this.refs.toast.show('密码错误，请重试', DURATION.LENGTH_SHORT);
				//
			}

		});

	}

	_closeDeviceLock = () => {
		Alert.alert(
			'提示',
			'是否确定关闭设备锁？',
			[{
				text: '取消'
			},{
				text: '确定', onPress: () => {
					FetchUtil.netUtil(Path.postLockUpdate, {
						isStart: 0,
            picturePassword: '',
						erroCode: 0
					}, 'POST', this.props.navigation, {
						userId: this.state.basic.userId,
						uuId: this.state.uuid,
						ticket: this.state.ticket
					}, (data) => {
						console.log(data)
						if (data.code.toString() == '200') {
							DeviceEventEmitter.emit('handLockWin');
							cookie.delete('modelInfor');
							this.props.navigation.goBack();
						}
					})
				}
			}]
		);
	}


	checkPassword = (text) => {

		this.body = {
			userName: this.state.basic.userName,
			passWord: text
		}

		this.setState({
			text: text
		})
	}

	render() {
		//判断数据是否渲染完成
		return (
			<View style={styles.container}>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'返回'}
					headRightFlag={true}
					isText={true}
					rightText={'完成'}
					rightTextStyle={{
						fontWeight: '500',
					}}
					onPressRightBtn={()=> {
                        HandlerOnceTap(()=>{
                            this.submitPassword();
						},'lockCheckPassword')
                    }}
					title={'验证密码'}
				/>
				<View style={styles.textInput}>
					<TextInput
						ref="Password"
						style={{flex: 1, color: 'black', padding: 0, marginLeft: 12}}
						placeholder={'请输入登录密码'}
						placeholderTextColor={'#ccc'}
						underlineColorAndroid="transparent"
						onChangeText={(text) => this.checkPassword(text)}
						value={this.state.text}
					/>
				</View>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(240,240,240,1)'
	},
	textInput: {
		backgroundColor: 'white',
		height: 40,
		marginTop: 20
	}
});