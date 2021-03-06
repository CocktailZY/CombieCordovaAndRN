/**
 * 底部导航器
 * 导入原生组件
 */
import React, {Component} from 'react';
import {
	Platform,
	View,
	ToastAndroid, StyleSheet,
	ScrollView, TouchableWithoutFeedback,
	TextInput,
	TouchableOpacity,
	Text,
	NativeModules, DeviceEventEmitter,
	Image
} from 'react-native';
import TreeView from '../../component/common/TreeView'
import Path from "../../config/UrlConfig";
import FetchUtil from "../../util/FetchUtil";
import Icons from 'react-native-vector-icons/Ionicons';
import Header from '../../component/common/Header';
import Sqlite from "../../util/Sqlite";
import Toast, {DURATION} from 'react-native-easy-toast';
import HandlerOnceTap from '../../util/HandlerOnceTap';

export default class Address extends Component {
	constructor(props) {
		super(props);
		this.state = {
			treeData: [],
			isOpen: true,
			searchText: '',
			isSearch: false,
			selectedKeys: [],
			expandedKeys: [],
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			jidNode: props.navigation.state.params.jidNode,
			basic: props.navigation.state.params.basic,
			parentDeptId: props.navigation.state.params.parentDeptId
		}
	}

	componentDidMount() {
		this._fetchAddress();
		this.updateAddressListener = DeviceEventEmitter.addListener('updateAddressThird', (params) => {
			// console.log(params);
			//请求本地数据库
			Sqlite.selectValueByKey(this.state.basic.userId, 'tree_' + this.state.parentDeptId, (res) => {
                if(res){
                    let tdata = JSON.parse(res.value).tree;
                    if(tdata.length > 0){
                        this.setState({
                            treeData: tdata
                        });
                    }else{
                        this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
                    }
                }else{
                    this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
                }
			});
		});
	};

	componentWillUnmount() {
		this.updateAddressListener.remove();
	}

	_setSearchText = (text) => {
		this.setState({
			searchText: text,
		});
	};
	_searchAddress = () => {
		this.props.navigation.navigate('AddressSearch', {
			ticket: this.state.ticket,
			uuid: this.state.uuid,
			basic: this.state.basic
		});
		/*this._onBlurText();
		let url = Path.getAddress + '?trueNameLike=' + this.state.searchText + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&realId=' + this.state.jidNode+'&userId='+this.state.basic.userId;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (data) => {
				if (data.code == '200') {
						if (data.data) {
								this.setState({
										isOpen: true,
										treeData: data.data,
										isSearch: this.state.searchText == '' ? false : true
								});
						} else {
								this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
						}
				}
		});*/
	};
	componentDidUpdate() {
		DeviceEventEmitter.emit('changeLoading','false');
	}

	_fetchAddress = () => {
		DeviceEventEmitter.emit('changeLoading', 'true');
		Sqlite.selectValueByKey(this.state.basic.userId, 'userList_' + this.state.parentDeptId, (version) => {
			console.log(version);

			let params = {};
			params.uuid = this.state.uuid;
			params.ticket = this.state.ticket;
			params.version = version ? version.value : '';
			params.userId = this.state.basic.userId;
			params.realId = this.state.jidNode;
			params.deptId = this.state.parentDeptId;


			DeviceEventEmitter.emit('userLastListListener', params);
			// DeviceEventEmitter.emit('changeLoading','false');
			//NativeModules.IMModule.request("userLastList",this.state.ticket,this.state.uuid,this.state.jidNode,this.state.basic.userId,this.state.parentDeptId.toString(),version ? version.value : '');
		});
		Sqlite.selectValueByKey(this.state.basic.userId, 'tree_' + this.state.parentDeptId, (res) => {
			// console.log(res);
			if(res){
				let tdata = JSON.parse(res.value).tree;
				if(tdata.length > 0){
					this.setState({
						treeData: tdata
					});
				}else{
					DeviceEventEmitter.emit('changeLoading','false');
					// this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
				}
			}else{
				DeviceEventEmitter.emit('changeLoading','false');
				// this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
			}
		});
		// let url = Path.getAddress + '?uuId=' + this.state.uuid
		//     + '&ticket=' + this.state.ticket
		//     + '&realId=' + this.state.jidNode;
		// FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (data) => {
		//     if (data.code == '200') {
		//         if (data.data) {
		//             this.setState({
		//                 isOpen: true,
		//                 treeData: this.state.treeData.concat(data.data),
		//                 isSearch: false
		//             });
		//         } else {
		//             this.refs.toast.show('没有联系人', DURATION.LENGTH_SHORT);
		//         }
		//     }
		//
		// });
	};

	_onBlurText = () => {
		this._searchInputBox.blur()
	};

	_onFocusText = () => {
		this._searchInputBox.focus();
	};

	render() {
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1000}/>
				<Header
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'返回'}
					title={this.props.navigation.state.params.parentDeptName}
				/>
				<View style={{
					backgroundColor: '#f0f0f0',
					height: 48,
				}}>
					{Platform.OS == 'ios' ? (<TouchableOpacity style={{
						flex: 1,
						flexDirection: 'row',
						margin: 8,
						backgroundColor: '#FFFFFF',
						borderWidth: 1,
						borderRadius: 6,
						borderColor: '#CCCCCC'
					}} onPress={()=>{HandlerOnceTap(() => this._searchAddress())}}>

						<View style={{
							flex: 1,
							height: 30,
							flexDirection: 'row',
							backgroundColor: '#FFFFFF',
							borderColor: 'transparent',
							borderWidth: 1,
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 6,
							paddingTop: 0,
							paddingBottom: 0,

						}}>
							<Text style={{color: '#CCCCCC', fontSize: 15, lineHeight: 30, paddingRight: 10}}>{'搜索'}</Text>
							<Icons name={'ios-search-outline'} size={25} color={'#CCCCCC'}/>
						</View>
					</TouchableOpacity>) : (<TouchableOpacity style={{
						flex: 1,
						flexDirection: 'row',
						margin: 8,
						backgroundColor: '#FFFFFF',
						borderWidth: 1,
						borderRadius: 6,
						borderColor: '#CCCCCC'
					}} onPress={()=>{HandlerOnceTap(() => this._searchAddress())}}>
						<TextInput
							style={{
								flex: 1,
								height: 30,
								backgroundColor: '#FFFFFF',
								borderColor: 'transparent',
								borderWidth: 1,
								borderRadius: 6,
								paddingTop: 0,
								paddingBottom: 0,
								paddingLeft: 8,
								paddingRight: 8
							}}
							placeholderTextColor={'#CCCCCC'}
							placeholder={'搜索...'}
							underlineColorAndroid={'transparent'}
							editable={false}
						/>
						<View style={{width: 25, height: 30, justifyContent: 'center'}}>
							<Icons name={'ios-search-outline'} size={25} color={'#CCCCCC'}/>
						</View>
					</TouchableOpacity>)}
				</View>
				<ScrollView
					ref={(scrollView) => {
						this._scrollView = scrollView;
					}}
					automaticallyAdjustContentInsets={true}
					onScroll={() => {
						//console.log('onScroll!');
					}}
					scrollEventThrottle={200}
					onContentSizeChange={() => {
						// this._scrollView.scrollToEnd(true);
					}}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					style={{paddingLeft: 8, paddingRight: 8}}
				>
					<TreeView data={this.state.treeData} isSearch={this.state.isSearch} ticket={this.state.ticket}
										uuid={this.state.uuid} mynavigate={this.props.navigation} basic={this.state.basic}/>
				</ScrollView>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		// justifyContent: 'center',
		// alignItems: 'center',
		backgroundColor: '#FFFFFF',
	},
});