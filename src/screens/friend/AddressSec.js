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
			treeData: [],//部门数据
			userData: [],//人员数据
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
		this.updateAddressListener = DeviceEventEmitter.addListener('updateAddressSec', (params) => {
			// //console.log(params);
			//请求本地数据库
			Sqlite.selectDepartment(this.state.basic.userId, this.state.parentDeptId, (res) => {
				//console.log(res);
				Sqlite.selectUsers(this.state.basic.userId, this.state.parentDeptId, (data) => {
					//console.log(data);
					this.setState({
						treeData: res,
						userData: data
					});
				});
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
		//console.log(typeof this.state.parentDeptId);
		Sqlite.selectValueByKey(this.state.basic.userId, 'userList_' + this.state.parentDeptId, (version) => {
			//console.log(version);

			let params = {};
			params.uuid = this.state.uuid;
			params.ticket = this.state.ticket;
			params.version = version ? version.value : '';
			params.userId = this.state.basic.userId;
			params.realId = this.state.jidNode;
			params.deptId = this.state.parentDeptId;

			// DeviceEventEmitter.emit('changeLoading','false');
			DeviceEventEmitter.emit('userListListener', params);

			//NativeModules.IMModule.request("userList",this.state.ticket,this.state.uuid,this.state.jidNode,this.state.basic.userId,this.state.parentDeptId.toString(),version ? version.value : '');
		});
		Sqlite.selectDepartment(this.state.basic.userId, this.state.parentDeptId, (res) => {
			//console.log(res);
			Sqlite.selectUsers(this.state.basic.userId, this.state.parentDeptId, (data) => {
				//console.log(data);
				this.setState({
					treeData: res,
					userData: data
				});
			});
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
					}} onPress={() => {
						HandlerOnceTap(() => this._searchAddress())
					}}>

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
					}} onPress={() => {
						HandlerOnceTap(() => this._searchAddress())
					}}>
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
						////console.log('onScroll!');
					}}
					scrollEventThrottle={200}
					onContentSizeChange={() => {
						// this._scrollView.scrollToEnd(true);
					}}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					style={{paddingLeft: 8, paddingRight: 8}}
				>
					{this.state.treeData.map((item, index) => {
						return (
							<TouchableOpacity key={index} onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('AddressLast', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											jidNode: this.state.basic.jidNode,
											basic: this.state.basic,
											parentDeptName: item.department_name,
											parentDeptId: item.department_id
										});
									}, "address_3"
								)
							}}>
								<View style={{
									height: 50,
									flexDirection: 'row',
									alignItems: 'center',
									borderBottomWidth: 1,
									borderBottomColor: '#c3c3c3'
								}}>
									<View style={{
										width: 36,
										height: 36,
										borderRadius: 4,
										backgroundColor: '#278eee',
										justifyContent: 'center',
										alignItems: 'center'
									}}>
										<Image source={require('../../images/department.png')} style={{width: 24, height: 24}}/>
									</View>
									<View style={{marginLeft: 8}}><Text>{item.department_name}</Text></View>
								</View>
							</TouchableOpacity>
						)
					})}
					{this.state.userData.map((item, index) => {
						return (
							<TouchableOpacity key={index} onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('FriendDetail', {
											ticket: this.state.ticket,
											uuid: this.state.uuid,
											friendJidNode: item.jid_node,
											tigRosterStatus: 'both',
											basic: this.state.basic
										});
									}
								)
							}}>
								<View style={{
									height: 50,
									flexDirection: 'row',
									alignItems: 'center',
									borderBottomWidth: 1,
									borderBottomColor: '#c3c3c3'
								}}>
									<View style={{justifyContent: 'center', alignItems: 'center'}}>
										<Image
											// source={{uri: Path.headImg + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&fileName=' + item.head_photo_name + '&userId=' + this.state.basic.userId}}
											// uri: Path.headImg + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + this.state.photoId+ '&imageId=' + this.state.photoId+ '&sourceType=singleImage&jidNode=' + this.state.basic.jidNode
											source={{uri: Path.headImg + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&imageName=' + item.head_photo_name + '&userId=' + this.state.basic.userId+'&imageId=' + item.head_photo_name+ '&sourceType=singleImage&jidNode='+item.jid_node}}
											style={{width: 36, height: 36, borderRadius: 4}}/>
									</View>
									<View style={{marginLeft: 8}}><Text>{item.true_name}</Text></View>
								</View>
							</TouchableOpacity>
						)
					})}
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