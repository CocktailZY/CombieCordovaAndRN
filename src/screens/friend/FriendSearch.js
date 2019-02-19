import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	Platform,
	ScrollView, Dimensions,BackHandler,
	TextInput, ToastAndroid, NativeModules, DeviceEventEmitter,
	SectionList
} from 'react-native';
import Header from '../../component/common/Header';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import Icons from 'react-native-vector-icons/Ionicons';
import XmlUtil from "../../util/XmlUtil";
import Toast, {DURATION} from 'react-native-easy-toast';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import Global from "../../util/Global";
let lastPresTime = 1;
const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();
const {height, width} = Dimensions.get('window');
const ITEM_HEIGHT = 48; //item的高度
const HEADER_HEIGHT = 20;  //分组头部的高度
export default class FriendSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sections: [],
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			searchText: '',
			isSearch:false,
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
    }
    componentWillUnmount(){
        this.footBackKey.remove();
    }
	_setSearchText = (text) => {
		this.setState({
			searchText: text
		});
	};

	_searchFriend = () => {
		if (this.state.searchText.replace(/(^\s*)|(\s*$)/g, "") == '') {
			this.refs.toast.show('搜索内容不能为空', DURATION.LENGTH_SHORT);
			return false;
		}
		this._searchInputBox.blur();
		// let url = Path.getContacts + '?uid=' + this.state.basic.uid + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&groupType=1&trueNameLike=' + this.state.searchText;
		FetchUtil.netUtil(Path.getContacts,{
			uid:this.state.basic.uid,
			uuId:this.state.uuid,
			ticket:this.state.ticket,
			userId:this.state.basic.userId,
			groupType:'1',
			trueNameLike:this.state.searchText,
			groupId:''
		},'POST',this.props.navigation,Global.basicParam,(data) => {
			console.log(data);
			if (data.code == '200') {
				if (data.data.length > 0) {
					// tempObj.data = data.list;
					this.setState((preState) => {
						let tempThis = preState;
						tempThis.sections = data.data;
						return tempThis;
					});
				} else {
					this.setState({
						sections:[],
						isSearch:true
					},() => {
						this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
					})
				}
			}

		});
		// FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (data) => {
		// 	console.log(data);
		// 	if (data.code == '200') {
		// 		if (data.data.length > 0) {
		// 			// tempObj.data = data.list;
		// 			this.setState((preState) => {
		// 				let tempThis = preState;
		// 				tempThis.sections = data.data;
		// 				return tempThis;
		// 			});
		// 		} else {
		// 			this.setState({
		// 				sections:[],
		// 				isSearch:true
		// 			},() => {
		// 				this.refs.toast.show('抱歉,没有查到相关数据！', DURATION.LENGTH_SHORT);
		// 			})
		// 		}
		// 	}
		//
		// });
	};
	_sectionComp = (info) => {
		// console.log(info);
		let txt = info.section.key;
		return (<Text style={{
			height: HEADER_HEIGHT,
			paddingLeft: 8,
			backgroundColor: '#f0f0f0',
			color: '#999',
			textAlignVertical: 'center',
			fontSize: 12,
		}}>{txt}</Text>)
	};
	_renderItem = (info) => {

		let txt = info.item.title;
		return (
			<TouchableOpacity onPress={()=>{HandlerOnceTap(
                () => {
                    this.props.navigation.navigate('FriendDetail', {
                        ticket: this.state.ticket,
                        uuid: this.state.uuid,
                        friendJidNode: info.item.jidNode,
                        tigRosterStatus: 'both',
                        basic: this.state.basic
                    });
                },"FriendDetail"
			)}} style={[styles.friendList, {
				borderTopWidth: 1,
			}, info.index === 0 ? {borderTopColor: 'transparent'} : {borderTopColor: '#d0d0d0'}]}>
				<Image
					source={{uri: Path.headImg + '?fileName=' + info.item.photoId + '&uuId=' + this.state.uuid + '&userId=' + this.state.basic.userId + '&ticket=' + this.state.ticket}}
					style={styles.headFriend}/>
				<View style={styles.textFriend}>
					<Text style={{color: '#333', fontSize: 15, textAlignVertical: 'center',}}>{`${txt}(${info.item.deptName})`}</Text>
				</View>
			</TouchableOpacity>
		)//5C5C5C
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
					<View style={styles.searchBox}>
						<View style={{flex: 1}}>
							<TextInput ref={(TextInput) => this._searchInputBox = TextInput}
												 style={styles.searchInputBox}
												 placeholderTextColor={'#CCCCCC'}
												 placeholder={'搜索...'}
												 underlineColorAndroid={'transparent'}
												 multiline={false}
												 onChangeText={(text) => this._setSearchText(text)}
												 autoFocus={true}
												 returnKeyType={'search'}
												 onSubmitEditing={this._searchFriend}
												 value={this.state.searchText}
							/>
						</View>
						<TouchableOpacity onPress={()=>{HandlerOnceTap(() => this._searchFriend())}}>
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
						>
							<SectionList
								ref='list'
								keyExtractor={(item, index) => String(index)}
								renderSectionHeader={this._sectionComp}
								renderItem={this._renderItem}
								sections={this.state.sections}
							/>
						</ScrollView>
					) : (<View style={{flex: 1, alignItems: 'center', paddingTop: 20}}><Text
						style={{color: '#e2e2e2'}}>{this.state.isSearch ? '暂无符合数据' : '请搜索想要查找的联系人'}</Text></View>)}
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
	},
	searchInputBox: {
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
	},
	searchBox: {
		flexDirection: 'row',
		margin: 8,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderRadius: 6,
		borderColor: '#CCCCCC'
	}
});