import React, {Component} from 'react';
import {
	View,
	Platform,
	ToastAndroid
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
// let ToastBox;
// class RenderToast extends Component{
// 	constructor(props) {
// 		super(props);
// 		ToastBox = Platform.select({
// 			ios: () => this.refs.toast,
// 			android: () => ToastAndroid,
// 		})();
// 	}
//
// 	render(){
// 		return(
// 			<Toast ref="toast"/>
// 		)
// 	}
// }
export default ToastBox = Platform.select({
	ios: () => <Toast ref="toast"/>,
	android: () => ToastAndroid,
})();