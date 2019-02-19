import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Platform,
	TouchableOpacity,
	Dimensions,
	Image,
	ScrollView,
	FlatList,
	TextInput,
	ActivityIndicator,
	DeviceEventEmitter, ART,
	Keyboard
} from 'react-native';
import Header from '../../component/common/Header';
import DeviceInfo from 'react-native-device-info';
import Icons from 'react-native-vector-icons/Ionicons';
import MyWebView from 'react-native-webview-autoheight';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import Toast, {DURATION} from 'react-native-easy-toast';
import HandlerOnceTap from '../../util/HandlerOnceTap';
import ToolUtil from '../../util/ToolUtil';

const {height, width} = Dimensions.get('window');
const numColumns = 6;
const HEADWIDTH = (width - 20 - (numColumns - 1) * 10) / numColumns;
let commentPage = 1;
const {Surface, Shape} = ART;
const path = ART.Path().moveTo(1, 1).lineTo(width - 20, 1);

export default class ActivityDetails extends Component {
	static navigationOptions = {
		header: null
	};

	constructor(props) {
		super(props);
		this.state = {
			activityId: props.navigation.state.params.activityId,
			room: props.navigation.state.params.room,
			ticket: props.navigation.state.params.ticket,
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			activityInfor: {},
			headList: [],//活动总报名列表
			headShowList: [],//活动详情显示报名列表
			commentList: [],//活动总评论列表
			commentShowList: [],//活动详情显示评论列表
			commentContent: '',//评论内容
			replyContent: '',//回复内容
			commentShowFoot: 0,//评论底部显示
			commentPid: null,
			replyCommentType: false,
			placeholder: '请输入回复内容'
		}
	};

	componentDidMount() {
		this._getActivityDetails();
		this.activityHeadNot = DeviceEventEmitter.addListener('activityHeadNot', (params) => {
			this._getActivityDetails();
		});
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
			this.setState({
				commentPid: null,
				commentContent: '',
				placeholder: '请输入回复内容'
			}, () => {
				if(this.refs.commentInput){
					this.refs.commentInput.blur();
				}
			});
		});
	};

	componentWillUnmount() {
		this.activityHeadNot.remove();
		this.keyboardDidHideListener.remove();
		commentPage = 1;
	}

	_getActivityDetails = () => {
		let url = Path.getActivityDetails + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId + '&activeId=' + this.state.activityId;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
			console.log(responseJson);
			if (responseJson.code.toString() === '200') {
				console.log(responseJson.data);
				this.setState({
					activityInfor: responseJson.data.activityInfo,
					headList: responseJson.data.activityActivistList,
					commentList: responseJson.data.discussList
				}, () => {
					this._headListMap(this.state.headList);
					this._commentListMap(this.state.commentList);
					if(this.state.basic.jidNode == this.state.activityInfor.createUser && this.state.activityInfor.status == '0' && ToolUtil.strToStemp(this.state.activityInfor.endTime) > new Date().getTime()){
						this.refs.activityDetailHeader._changeHeadRightFlag(true);
					}else{
						this.refs.activityDetailHeader._changeHeadRightFlag(false);
					}
					// let tempDisArr  = JSON.parse(JSON.stringify(responseJson.data.discussList));
					// this._commentListFor(responseJson.data.discussList);
				});

			}
		})
	}

	_headListMap = (str) => {
		let arr = new Array();
		let num = numColumns - 1;
		for (let i in str) {
			if (str[i].status == 0) {
				arr.push(str[i]);
			}
		}
		let headArr = [];
		if (arr.length > 0) {
			if (arr.length > num) {
				headArr = arr.slice(0, num).concat({onHeadMore: 'more'});
			} else {
				headArr = arr.concat({onHeadMore: 'more'});
			}
		} else {
			headArr = [];
		}
		this.setState({
			headShowList: headArr
		}, () => {
			console.log('活动详情要显示的报名人列表')
			console.log(this.state.headShowList)
		});
	}

	_headRenderItem = ({item, index}) => {
		let _headStr;
		if (item.onHeadMore === 'more') {
			_headStr = <TouchableOpacity onPress={() => {
				HandlerOnceTap(
					() => {
						this.props.navigation.navigate('ActivityHeadList', {
							activityId: this.state.activityId,
							ticket: this.state.ticket,
							uuid: this.state.uuid,
							room: this.state.room,
							basic: this.state.basic,
							headList: this.state.headList,
							activityInfor: this.state.activityInfor
						});
					}
				)
			}} style={[styles.actHeadList, {
				justifyContent: 'center',
				alignItems: 'center',
				borderWidth: 1,
				borderColor: '#ccc',
				marginLeft: 10,
			}]}>
				<Icons name={'ios-more'} size={30} color={'#CCCCCC'}/>
			</TouchableOpacity>
		} else {
			_headStr = <TouchableOpacity onPress={() => {
				HandlerOnceTap(
					() => {
						this.props.navigation.navigate('FriendDetail', {
							ticket: this.state.ticket,
							uuid: this.state.uuid,
							friendJidNode: item.activistUser,
							tigRosterStatus: 'both',
							basic: this.state.basic
						});
					}
				)
			}} style={{position: 'relative', marginLeft: index === 0 ? 0 : 10,}}>
				<Image
					source={{
						uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + item.photo + '&imageId=' + item.photo + '&sourceType=singleImage&jidNode=' + this.state.basic.jidNode
						// uri: Path.headImg + '?fileName=' + item.photo + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + item.id
					}}
					style={styles.actHeadList}/>
				{
					item.isPay == 1 ? <View style={styles.headListIcon}>
						<Text style={{color: 'white', fontSize: 12}}>已付</Text>
					</View> : null
				}
			</TouchableOpacity>
		}
		return _headStr
	}

	_commentListFor = (str) => {
		let arr1 = str,
			arr2 = str,
			box = [];
		arr1.map((item) => {
			let replyArr = [];
			for (let i in arr2) {
				if (item.id == arr2[i].pid) {
					replyArr.push(arr2[i]);
				}
			}
			if (item.pid == '0') {
				item.replyArr = replyArr;
				box.push(item)
			}
		});
		this.setState({
			commentList: box
		}, () => {
			this._commentListMap(this.state.commentList)
		});
	}

	_commentListMap = (res) => {
		let commentNum = 0,
			commentArr = [];
		if (res.length > 0) {
			commentArr = res.slice(0, 5);
			if (res.length > 5) {
				commentNum = 2;
			} else {
				commentNum = 1;
			}
		} else {
			commentNum = 0;
		}
		this.setState({
			commentShowList: commentArr,
			commentShowFoot: commentNum
		}, () => {
			console.log(this.state.commentShowFoot)
		});
	}

	_activityComment = () => {
		this.refs.commentInput.blur();
		let pid = this.state.commentPid;
		let content = this.state.commentContent;
		let placeholder = this.state.placeholder;
		if (content == '' || placeholder == content) {
			this.refs.toast.show('评论内容不能为空', DURATION.LENGTH_SHORT);
		} else if (ToolUtil.isEmojiCharacterInString(content)) {
			this.refs.toast.show('评论内容不能包含非法字符', DURATION.LENGTH_SHORT);
		} else {
			let url = Path.getActivityComment + '?ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&activeId=' + this.state.activityId + '&pid=' + pid + '&content=' + content + '&userId=' + this.state.basic.userId + '&uuId=' + this.state.uuid;
			console.log(url)
			FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
				console.log(responseJson)
				if (responseJson.code.toString() == '200') {
					this.setState({
						commentContent: '',
						replyContent: '',
						commentPid: null,
						replyCommentType: false,
					});
					this._getActivityDetails();
				}
			})
		}
	};

	_activityApply = () => {
		let url = Path.getActivityAttend + '?ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&activeId=' + this.state.activityId + '&userId=' + this.state.basic.userId + '&uuId=' + this.state.uuid;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
			console.log(responseJson)
			if (responseJson.code.toString() == '200') {
				DeviceEventEmitter.emit('activityAddPage');
				this._getActivityDetails();
			}
		})
	};

	_scrollActivity = (e) => {
		let offsetY = e.nativeEvent.contentOffset.y;
		let contentSizeHeight = e.nativeEvent.contentSize.height;
		let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height;
		if (Math.floor(offsetY + oriageScrollHeight) >= Math.floor(contentSizeHeight)) {
			console.log('滑动到底了')
			this.setState({commentShowFoot: 3});
			let box = this.state.commentList,
				arr = box.slice(0, commentPage * 10);
			if (box.length > commentPage * 10) {
				commentPage++;
			}
			// console.log(arr)
			let num = box.length > commentPage * 10 ? 2 : 1;
			this.setState({
				commentShowList: arr,
				commentShowFoot: num
			}, () => {
				console.log(this.state.commentShowList)
			});
		}
	};
	_exitActivity = () => {
		let url = Path.exitActivity + '?ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&activeId=' + this.state.activityId + '&userId=' + this.state.basic.userId + '&uuId=' + this.state.uuid;
		FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
			console.log(responseJson)
			if (responseJson.code.toString() == '200') {
				DeviceEventEmitter.emit('activityAddPage');
				this._getActivityDetails();
			}
		})
	};

	/** 修改活动详情*/
	alterActive = () => {

		console.log(this.state.activityInfor);
		this.props.navigation.navigate('ActivityPublish', {
			ticket: this.state.ticket,
			uuid: this.state.uuid,
			room: this.state.room,
			basic: this.state.basic,
			type: 'alter',
			activityBody: {//活动信息提交对象
				id: this.state.activityInfor.id,
				mid: this.state.room.roomJid,
				title: this.state.activityInfor.title,//活动主题
				poster: this.state.activityInfor.poster,//活动海报
				startTime: this.state.activityInfor.createTime,//活动开始时间
				endTime: this.state.activityInfor.endTime,//活动结束时间
				address: this.state.activityInfor.address,//活动地点
				isPublic: this.state.activityInfor.isPublic,//是否开放
				cost: this.state.activityInfor.cost,//活动费用
				memberNum: this.state.activityInfor.memberNum,//活动人数
				phone: this.state.activityInfor.phone,//发布人电话
				content: this.state.activityInfor.content,//详情
				createUser: this.state.basic.jidNode,
				nickName: this.state.basic.trueName,
				belongId: this.state.room.roomJid,
			},
		});
	}

	render() {

    //
		// let isJoin = false;
		// for (let index in this.state.headList) {
		// 	if (this.state.headList[index].activistUser == this.state.basic.jidNode) {
		// 		isJoin = true;
		// 		break;
		// 	}
		// }

		let start = this.state.activityInfor.startTime;// ? this.state.activityInfor.startTime.substring(0, this.state.activityInfor.startTime.lastIndexOf(':')) : '';
		let end = this.state.activityInfor.endTime;// ? this.state.activityInfor.endTime.substring(0, this.state.activityInfor.endTime.lastIndexOf(':')) : '';
		return (

			<View style={styles.container}>
				<Header
					ref={'activityDetailHeader'}
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					headRightFlag={this.state.basic.jidNode == this.state.activityInfor.createUser && this.state.activityInfor.status == '0' && ToolUtil.strToStemp(this.state.activityInfor.endTime) > new Date().getTime() ? true : false}
					backTitle={'返回'}
					rightText={'编辑'}
					isText={true}
					onPressRightBtn={() => {
						this.alterActive();
					}}
					title={'活动详情'}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					keyboardDismissMode={'on-drag'}
					onScroll={this._scrollActivity}>
					<View style={styles.actTop}>
						<Image
							source={this.state.activityInfor.poster != '' ? {uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + this.state.activityInfor.poster + '&imageId=' + this.state.activityInfor.poster + '&sourceType=activityImage'} : require('../../images/default_poster.png')}
							style={styles.actTopHead} resizeMode={'cover'}/>
						<Text numberOfLines={1} style={styles.actTopText}>{this.state.activityInfor.title}</Text>
					</View>
					<View style={styles.actPadLR}>
						<View style={styles.actInforTop}>
							<View style={styles.actInforText}>
								<Image source={require('../../images/activity/icon_time.png')} style={styles.actIcon}/>
								<Text
									style={styles.actTxt}>{` ${start} 至 ${end}`}</Text>
								<Text style={styles.actCost}>{'￥'}<Text
									style={{fontSize: 18}}>{this.state.activityInfor.cost}</Text></Text>
							</View>
							<View style={styles.actInforText}>
								<Image source={require('../../images/activity/icon_address.png')}
											 style={styles.actIcon}/>
								<Text style={styles.actTxt}>{` ${this.state.activityInfor.address}`}</Text>
							</View>
							<View style={styles.actInforText}>
								<Image source={require('../../images/activity/icon_single.png')}
											 style={styles.actIcon}/>
								<Text style={styles.actTxt}>{` 由 ${this.state.activityInfor.nickName} 发起`}</Text>
							</View>
							<View style={styles.actInforText}>
								<Image source={require('../../images/activity/icon_people.png')}
											 style={styles.actIcon}/>
								<Text style={styles.actTxt}>{` 已有`}<Text
									style={{
										fontSize: 16,
										color: '#ffda33'
									}}>{this.state.headList.length}</Text>人报名（限{this.state.activityInfor.memberNum}人报名）</Text>
							</View>
							<View style={styles.actInforText}>
								<Image source={require('../../images/activity/icon_tel.png')} style={styles.actIcon}/>
								<Text style={styles.actTxt}>{` ${this.state.activityInfor.phone}`}</Text>
							</View>
							{this.state.activityInfor.status == '0' && ToolUtil.strToStemp(this.state.activityInfor.endTime) > new Date().getTime() ? (

								(this.state.activityInfor.isActive.toString() == '1' ? (
										<TouchableOpacity style={styles.actRegBtn} onPress={() => {
											HandlerOnceTap(
												() => {
													if (this.state.activityInfor.isActive == '0') {
														this._activityApply();
													} else if (this.state.activityInfor.isActive == '1') {
														this._exitActivity();
													}
												}
											)
										}}>
											<Text
												style={styles.actRegBtnText}>{'退出活动'}</Text>
										</TouchableOpacity>) : (

										(this.state.activityInfor.isActive == '0' && this.state.headList.length < this.state.activityInfor.memberNum) ? (
											<TouchableOpacity style={styles.actRegBtn} onPress={() => {
												HandlerOnceTap(
													() => {
														if (this.state.activityInfor.isActive == '0') {
															this._activityApply();
														} else if (this.state.activityInfor.isActive == '1') {
															this._exitActivity();
														}
													}
												)
											}}>
												<Text
													style={styles.actRegBtnText}>{'我要报名'}</Text>
											</TouchableOpacity>) : (
											this.state.activityInfor.isActive == '-1' && this.state.headList.length < this.state.activityInfor.memberNum ? (
												<View style={styles.actLabel}>
													<Text
														style={styles.actRegBtnText}>{'被拒绝'}</Text></View>) : (<View style={styles.actLabel}>
												<Text
													style={styles.actRegBtnText}>{'人数已达上限'}</Text></View>)))

								)


							) : (
								<View style={styles.actRegCloseBtn}>
									<Text style={styles.actRegCloseBtnText}>{'已结束'}</Text>
								</View>
							)}

						</View>
						<View style={styles.actInforBottom}>
							{
								this.state.headList.length <= 0 ? <Text style={{
									fontSize: 15,
									color: '#999',
									textAlign: 'center',
								}}>还未有人报名参与活动</Text> : <FlatList
									keyExtractor={(item, index) => String(index)}
									horizontal={true}
									data={this.state.headShowList}
									renderItem={this._headRenderItem}
									scrollEnabled={false}/>
							}
						</View>
					</View>
					<View style={[styles.actPadLR, {backgroundColor: '#f0f0f0'}]}>
						<Text style={styles.actTitle}>{` 活动详情`}</Text>
					</View>
					{
						this.state.activityInfor.content && this.state.activityInfor.content.indexOf('<') > -1 && this.state.activityInfor.content.indexOf('>') > -1 ?
							<MyWebView
								style={{width: width - 20, margin: 10,}}
								startInLoadingState={true}
								source={{html: this.getStaticHtml(this.state.activityInfor.content), baseUrl: ''}}/>
							: <Text style={{margin: 10, fontSize: 14, color: '#333'}}>{this.state.activityInfor.content}</Text>
					}
					<View style={[styles.actPadLR, {backgroundColor: '#f0f0f0'}]}>
						<Text style={styles.actTitle}>{` 用户讨论`}</Text>
					</View>
					<View style={styles.actPadLR}>
						<View style={{flex: 1}}>
							{
								this.state.commentShowList.map((item, index) => {
									console.log(item);
									return <View key={index} style={styles.commentListGroup}>
										<Image
											source={{
												uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + item.photoId + '&imageId=' + item.photoId + '&sourceType=singleImage&jidNode='
												// uri: Path.headImg + '?fileName=' + item.fromUser + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId
											}}
											style={styles.actHeadList}/>
										<View style={{flex: 1}}>
											<View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
												<Text style={{
													fontSize: 15,
													color: '#333',
													flex: 1
												}}>{item.toUserName ? `${item.fromUserName} 评论 ${item.toUserName}` : `${item.fromUserName} 发表于`}</Text>
												<Text style={{fontSize: 12, color: '#aaaaaa'}}>{item.createTime}</Text>
											</View>
											<Text style={{fontSize: 13, color: '#999'}}>{item.content}</Text>
											{this.state.activityInfor.isActive == 1 ? (
												<TouchableOpacity onPress={() => {
													HandlerOnceTap(
														() => {
															this.setState({
																commentPid: item.id,
																commentContent: '',
																placeholder: '回复' + item.fromUserName + '：'
															}, () => {
																this.refs.commentInput.focus();
															});
														}
													)
												}}>
													<Text style={{
														fontSize: 13,
														color: '#6173ff',
														textAlign: 'right'
													}}>回复</Text>
												</TouchableOpacity>
											) : null}
										</View>
									</View>
								})
							}
						</View>
						{this._commentFooter()}
					</View>
				</ScrollView>
				{this.state.activityInfor.isActive == 1 ? (
					<View style={styles.commentBox}>
						<TextInput
							ref={'commentInput'}
							style={styles.commentInput}
							multiline={true}
							value={this.state.commentContent}
							onChangeText={(text) => this.setState({
								commentContent: text
							})}
							onBlur={()=>{
								this.setState({
									commentPid: null,
									commentContent: '',
									placeholder: '请输入回复内容'
								})
							}}
							placeholder={this.state.placeholder}
							underlineColorAndroid={'transparent'}/>
						<TouchableOpacity style={styles.commentReplyBtn} onPress={() => {
							HandlerOnceTap(this._activityComment)
						}}>
							<Text style={{fontSize: 14, color: '#fff'}}>评论</Text>
						</TouchableOpacity>
					</View>
				) : null}
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
			</View>
		)
	}

	_commentFooter() {
		let foot;
		if (this.state.commentShowFoot == 0) {
			foot = <TouchableOpacity style={styles.footer} onPress={() => {
			}}>
				<Text style={styles.footerText}>还没有评论</Text>
			</TouchableOpacity>
		} else if (this.state.commentShowFoot == 1) {
			foot = <View style={styles.footer}>
				<Text style={styles.footerText}>没有更多评论了</Text>
			</View>
		} else if (this.state.commentShowFoot == 2) {
			foot = <View style={styles.footer}>
				<Text style={styles.footerText}>上拉加载更多</Text>
			</View>
		} else if (this.state.commentShowFoot == 3) {
			foot = <View style={styles.footer}>
				<ActivityIndicator/>
				<Text style={styles.footerText}>正在加载更多...</Text>
			</View>
		}
		return foot;
	}

	getStaticHtml = (content) => {
		console.log(content);
		var html = '<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html;">';
		html += '<meta name="viewport" content="user-scalable=no"><style>*{margin: 0;padding: 0;}p{line-height: 20px;}</style></head>';
		html += '<body style="font-size: 14px;color: #333;">' + content + '</body></html>';
		return html;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		position: 'relative'
	},
	actTop: {
		position: 'relative',
	},
	actTopHead: {
		width: width,
		height: width / 2,
	},
	actTopText: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		right: 0,
		padding: 5,
		paddingLeft: 15,
		backgroundColor: 'rgba(0,0,0,0.6)',
		color: '#fff',
		fontSize: 15,
	},
	actPadLR: {
		paddingLeft: 10,
		paddingRight: 10,
	},
	actInforTop: {
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		position: 'relative',
		paddingTop: 10,
	},
	actInforText: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	actIcon: {
		width: 20,
		height: 20,
	},
	actTxt: {
		flex: 1,
		fontSize: 12,
		color: '#959595',
	},
	actCost: {
		fontSize: 13,
		color: '#ff9226'
	},
	actRegBtn: {
		position: 'absolute',
		right: 0,
		bottom: 10,
		borderWidth: 1,
		borderColor: '#6173ff',
		borderRadius: 4,
		paddingLeft: 5,
		paddingRight: 5,
	},

	actLabel: {
		position: 'absolute',
		right: 0,
		bottom: 10,
		paddingLeft: 5,
		paddingRight: 5,
	},

	actRegBtnText: {
		fontSize: 15,
		color: '#6173ff',
		margin: 3,
	},
	actRegCloseBtn: {
		position: 'absolute',
		right: 0,
		bottom: 10,
		borderWidth: 1,
		borderColor: '#ff9226',
		borderRadius: 4,
		paddingLeft: 5,
		paddingRight: 5,
	},
	actRegCloseBtnText: {
		fontSize: 15,
		color: '#ff9226',
		margin: 3,
	},
	actInforBottom: {
		paddingTop: 10,
		paddingBottom: 10,
	},
	actHeadList: {
		width: HEADWIDTH,
		height: HEADWIDTH,
		borderRadius: 4,
		marginRight: 10,
	},
	headListIcon: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.4)',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actTitle: {
		color: '#333',
		fontSize: 16,
		borderLeftColor: '#ff9226',
		borderLeftWidth: 5,
		paddingLeft: 6,
		marginTop: 8,
		marginBottom: 8,
	},
	commentStyle: {
		padding: 10,
		marginBottom: 5,
		fontSize: 14,
		color: '#999',
		textAlign: 'center',
	},
	footer: {
		flexDirection: 'row',
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	footerText: {
		fontSize: 14,
		color: '#999'
	},
	commentBox: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 5,
		paddingLeft: 15,
		paddingRight: 15,
		borderTopColor: '#d7d7d7',
		borderTopWidth: 1,
	},
	replyComment: {
		height: 50,
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingLeft: 10,
		paddingRight: 10,
		borderTopWidth: 1,
		borderTopColor: '#dedede',
		marginBottom: 0,
	},
	commentInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#e1e1e1',
		borderRadius: 4,
		backgroundColor: '#f0f0f0',
		padding: 2,
		paddingLeft: 8,
		paddingRight: 8,
		lineHeight: 24,
	},
	commentReplyBtn: {
		padding: 5,
		paddingLeft: 8,
		paddingRight: 8,
		backgroundColor: '#0100de',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 10,
	},
	commentListGroup: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		paddingTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc'
	},
})
