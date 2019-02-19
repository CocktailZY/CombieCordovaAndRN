import React, {Component} from 'react';
import {
	StyleSheet, View, Platform, Alert, DeviceEventEmitter
} from 'react-native';
import Header from '../../component/common/Header';

import {Calendar, LocaleConfig} from 'react-native-calendars';
import DeviceInfo from 'react-native-device-info';
import FetchUtil from "../../util/FetchUtil";
import Path from "../../config/UrlConfig";
import ParamsDealUtil from '../../util/ParamsDealUtil';
import {DURATION} from "react-native-easy-toast";
import Toast from "react-native-easy-toast";

LocaleConfig.locales['fr'] = {
	monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	monthNamesShort: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	dayNames: ['日', '一', '二', '三', '四', '五', '六'],
	dayNamesShort: ['日', '一', '二', '三', '四', '五', '六']
};
LocaleConfig.defaultLocale = 'fr';

export default class HistoryDate extends Component {

	constructor(props) {
		super(props);
		this.state = {
			room: !props.navigation.state.params.room ? null : props.navigation.state.params.room,
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			friendJidNode: !props.navigation.state.params.friendJidNode ? null : props.navigation.state.params.friendJidNode,//true是单聊
			dateMarked: {},
			nowYear: new Date().getFullYear(),
			nowMonth: new Date().getMonth() + 1,
		}
		// this.month={
		// 	`${new Date().getFullYear()} - ${new Date().getMonth() + 1 < 10 ? '0' + new Date().getMonth() + 1 : new Date().getMonth() + 1} - ${}`
		// }
	};

	componentDidMount() {
		let Y = this.state.nowYear,
			M = this.state.nowMonth,
			D = new Date().getDate(),
			startTime = Y + '-' + (M < 10 ? '0' + M : M) + '-01',
			endTime = Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D);
		this._getHistoryDate(startTime,endTime,Y+'-'+(M < 10 ? '0' + M : M));
	};

	_selectDay(day) {
		// console.log(day);
		if(this.state.dateMarked[day.dateString]){
			this.props.navigation.navigate('HistoryDateAll', {
				ticket: this.state.ticket,
				uuid: this.state.uuid,
				room: this.state.room,
				basic: this.state.basic,
				friendJidNode: this.state.friendJidNode,
				day: day.dateString,
			});
		}else{
			this.refs.toast.show('该日期下没有记录', DURATION.LENGTH_SHORT);
		}
	}

	_changeMouth(month) {
		console.log(month);
		this.setState({
			nowYear: month.year,
			nowMonth: month.month,
		},()=>{
			this._getHistoryDate(0,0,month.year+'-'+(month.month < 10 ? '0' + month.month : month.month));
		})
	}

	_changeGetMouth(goMonth, type) {
		let Max = new Date().getMonth() + 1,
			Y = this.state.nowYear,
			M = this.state.nowMonth + type,
			getY = M == 0 ? Y - 1 : M > 12 ? Y + 1 : Y,
			getM = M == 0 ? 12 : M > 12 ? 1 : M,
			getD = new Date(getY, getM, 0).getDate(),
			startTime = getY + '-' + (getM < 10 ? '0' + getM : getM) + '-01',
			endTime = getY + '-' + (getM < 10 ? '0' + getM : getM) + '-' + (getD < 10 ? '0' + getD : getD),
			jsM = getY < new Date().getFullYear()  ? Max + 12 : Max;
		if ((jsM - getM) > 3) {
			Alert.alert(
				'提示',
				'仅能查询前三个月的记录!'
			)
		} else if ((jsM - getM) < 0) {
			Alert.alert(
				'提示',
				'只能查询今天以前的记录!'
			)
		} else {
			this._getHistoryDate(startTime,endTime,getY + '-' + (getM < 10 ? '0' + getM : getM));
			goMonth();
		}
	}

	_getHistoryDate = (a,b,year_month) => {
		DeviceEventEmitter.emit('changeLoading', 'true');
		// let params = {
		// 	ticket: this.state.ticket,
		// 	uuId: this.state.uuid,
		// 	userId: this.state.basic.userId,
		// 	startTime: a,
		// 	endTime: b
		// };
		let url = '';
		let params = {};
		if (!this.state.friendJidNode) {
			params['month'] = year_month;
			params['roomJid'] = this.state.room.roomJid;
			// params.startRecently = false;
			url = Path.baseUrl +'/history/queryStatisticsOfDays';
		} else {
			params['month'] = year_month;
			params['jidNode'] = this.state.basic.jidNode+'@'+Path.xmppDomain;
			params['buddyJidNode'] = this.state.friendJidNode+'@'+Path.xmppDomain;
			url = Path.baseUrl +'/history/querySingleStatisticsOfDays';
		}

		FetchUtil.netUtil(url,params,'POST',this.props.navigation,{
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId
		},(res)=>{
			console.log(res);
			if (res.code.toString() == '200') {
				let obj = {};
				res.data.forEach(item => {
					obj[item.days] = {marked: true};
				});
				this.setState({
					dateMarked: obj
				},()=>{
					DeviceEventEmitter.emit('changeLoading', 'false');
				});
			}else{
				DeviceEventEmitter.emit('changeLoading', 'false');
			}
		})
		// FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, {
		// 	uuId: this.state.uuid,
		// 	ticket: this.state.ticket,
		// 	userId: this.state.basic.userId,
		//
		// }, (responseData) => {
		// 	console.log(responseData);
		// 	if (responseData.code.toString() == '200') {
		// 		let obj = {};
		// 		responseData.data.forEach(item => {
		// 			for (let i in item) {
		// 				obj[i] = item[i];
		// 			}
		// 		});
		// 		this.setState({
		// 			dateMarked: obj
		// 		},()=>{DeviceEventEmitter.emit('changeLoading', 'false');});
		// 	}else{
		// 		DeviceEventEmitter.emit('changeLoading', 'false');
		// 	}
		// });
	}

	render() {
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={800}/>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'返回'}
					title={'日期'}
				/>
				<View style={{flex: 1}}>
					<Calendar
						onDayPress={(day) => this._selectDay(day)}
						onPressArrowLeft={(substractMonth) => this._changeGetMouth(substractMonth, -1)}
						onPressArrowRight={(addMonth) => this._changeGetMouth(addMonth, 1)}
						onMonthChange={(month) => this._changeMouth(month)}
						maxDate={new Date()}
						monthFormat={'yyyy年MM月'}
						markedDates={this.state.dateMarked}
						theme={{
							dayTextColor: '#333',
							textDayFontSize: 14,
							textDayHeaderFontSize: 16,
							textDisabledColor: '#999',
							monthTextColor: '#4b76f2',
							'stylesheet.day.basic': {
								today: {
									backgroundColor: '#dadada',
									borderRadius: 16
								}
							}
						}}
					/>

				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
});