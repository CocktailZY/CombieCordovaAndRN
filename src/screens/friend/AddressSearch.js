import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	Platform,
	ScrollView, Dimensions,
	TextInput, ToastAndroid, NativeModules, DeviceEventEmitter,
	SectionList
} from 'react-native';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import Icons from 'react-native-vector-icons/Ionicons';
import Toast, {DURATION} from 'react-native-easy-toast';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import Global from "../../util/Global";

const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();
const {height, width} = Dimensions.get('window');
const ITEM_HEIGHT = 48; //item的高度
const HEADER_HEIGHT = 20;  //分组头部的高度
export default class AddressSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sections: [],
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			searchText: '',
		}
	}

	_setSearchText = (text) => {
		this.setState({
			searchText: text
		});
	};

	_searchUser = () => {
		if (this.state.searchText.replace(/(^\s*)|(\s*$)/g, "") == '') {
			this.refs.toast.show('搜索内容不能为空', DURATION.LENGTH_SHORT);
			return false;
		}
		this._searchInputBox.blur();
		FetchUtil.netUtil(Path.getUserList,{
			realId:this.state.basic.jidNode,
			uuId:this.state.uuid,
			ticket:this.state.ticket,
			userId:this.state.basic.userId,
			trueNameLike:this.state.searchText,
		},'POST',this.props.navigation,Global.basicParam,(data) => {
			console.log({
				realId:this.state.basic.jidNode,
				uuId:this.state.uuid,
				ticket:this.state.ticket,
				userId:this.state.basic.userId,
				trueNameLike:this.state.searchText,
			});
			console.log(data);
			if (data.code == '200') {
				if (data.data.user.length > 0) {
					this.setState({
						isOpen: true,
						sections: data.data.user,
						isSearch: this.state.searchText == '' ? false : true
					});
				} else {
					this.setState({
						isOpen: true,
						sections: [],
						isSearch: this.state.searchText == '' ? false : true
					},() => {
						this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
					});

				}
			}

		});
	};

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
					title={'搜索'}
				/>
				<View style={{backgroundColor: '#F5F5F5'}}>
					<View style={{
						flexDirection: 'row',
						margin: 8,
						backgroundColor: '#FFFFFF',
						borderWidth: 1,
						borderRadius: 6,
						borderColor: '#CCCCCC'
					}}>
						<View style={{flex: 1}}>
							<TextInput
								ref={(TextInput) => this._searchInputBox = TextInput}
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
								multiline={false}
								onChangeText={(text) => this._setSearchText(text)}
								autoFocus={true}
								returnKeyType={'search'}
								onSubmitEditing={this._searchUser}
								value={this.state.searchText}
							/>
						</View>
						<TouchableOpacity onPress={()=>{HandlerOnceTap(() => this._searchUser())}}>
							<View style={{width: 25, height: 30, justifyContent: 'center'}}>
								<Icons name={'ios-search-outline'} size={25} color={'#CCCCCC'}/>
							</View>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{flex: 1}}>
					{this.state.sections.length > 0 ? (
						<ScrollView
							ref={(scrollView) => {
								this._scrollView = scrollView;
							}}
							automaticallyAdjustContentInsets={true}
							// onScroll={() => { console.log('onScroll!'); }}
							scrollEventThrottle={200}
							onContentSizeChange={() => {
								// this._scrollView.scrollToEnd(true);
							}}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
							style={{paddingLeft: 8, paddingRight: 8}}
						>
							{this.state.sections.map((item, index) => {
								return (
									<TouchableOpacity key={index} onPress={()=>{HandlerOnceTap(
                                        () => {
                                        	console.log(item.jidNode);
                                            this.props.navigation.navigate('FriendDetail', {
                                                ticket: this.state.ticket,
                                                uuid: this.state.uuid,
                                                friendJidNode: item.jidNode,
                                                tigRosterStatus: 'both',
                                                basic: this.state.basic
                                            });
                                        },"FriendDetail"
									)}}>
										<View style={{
											height: 50,
											flexDirection: 'row',
											alignItems: 'center',
											borderBottomWidth: 1,
											borderBottomColor: '#c3c3c3'
										}}>
											<View style={{justifyContent: 'center', alignItems: 'center'}}>
												<Image
													source={{uri: Path.headImg + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&fileName=' + item.photoId + '&userId=' + this.state.basic.userId}}
													style={{width: 36, height: 36, borderRadius: 4}}/>
											</View>
											<View style={{marginLeft: 8}}><Text>{`${item.trueName}(${item.branchName})`}</Text></View>
										</View>
									</TouchableOpacity>
								)
							})}
						</ScrollView>
					) : (<View style={{flex: 1, alignItems: 'center', paddingTop: 20}}><Text
						style={{color: '#e2e2e2'}}>{this.state.isSearch ? '暂无相关数据' : '请搜索想要查找的人员'}</Text></View>)}
				</View>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	friendList: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 10,
		height: ITEM_HEIGHT,
	},
	headFriend: {
		width: 32,
		height: 32,
		//borderWidth: .5,
		borderRadius: 4,
		marginRight: 11,
	},
	textFriend: {
		flex: 1,
		height: 34,
		justifyContent: 'center',
		position: 'relative',
	}
});