/*
 * 话题详情
 * 页面元素 标题 发起人 点赞数 发表时间 点赞人员列表 讨论区
 *
 */
import React, {Component} from 'react';
import {
	StyleSheet, Text, View, Modal,
	Platform, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, TextInput,
	ActivityIndicator, ART, TouchableWithoutFeedback, Keyboard, DeviceEventEmitter, Alert, Linking
} from 'react-native';
import Header from '../../component/common/Header';
import DeviceInfo from 'react-native-device-info';
import FetchUtil from '../../util/FetchUtil';
import Path from "../../config/UrlConfig";
import ParamsDealUtil from '../../util/ParamsDealUtil';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FileTypeUtil from '../../util/FileType';
import fileTypeReturn from '../../util/FileType';
import RNFS from 'react-native-fs';
import ImageViewer from 'react-native-image-zoom-viewer';
import Toast, {DURATION} from 'react-native-easy-toast';
import OpenFile from 'react-native-doc-viewer';
import cookie from "../../util/cookie";
import HandlerOnceTap from '../../util/HandlerOnceTap';
import ToolUtil from '../../util/ToolUtil';

import Pdf from 'react-native-pdf';
import BottomMenu from "../../component/common/BottomMenu";
// const Pdf = Platform.select({
// 	ios: () => null,
// 	//android: () => require('react-native-pdf'),//android
// })();

const {height, width} = Dimensions.get('window');
const {Surface, Shape} = ART;
const path = ART.Path().moveTo(1, 1).lineTo(width - 20, 1);
const SCREEN = width < 600 ? 6 : 10;
const MARGIN = (SCREEN - 2) * 20;
const headSize = (width - MARGIN) / SCREEN;
let commentPage = 1;

class TopicDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uuid: props.navigation.state.params.uuid,
			basic: props.navigation.state.params.basic,
			ticket: props.navigation.state.params.ticket,
			topicId: props.navigation.state.params.topicId,
			topicInfo: {},
			isLike: false,//是否已点赞
			liskNum: 0,//点赞数
			commentList: [],//评论列表
			commentShowList: [],//评论展示列表
			commentShowFoot: 0,
			inviteContent: '',//评论全部内容
			placeholder:'',//占位文字
			commentPid: 0,
			invitePeople: [],//点赞人列表
			updateFiles: [],//附件列表
			isLZ: 0,//是否仅查看楼主，0查看所有，1仅楼主
			isModalVisible: false,
			animating: true,
			fileAnimating: false,//文件预览动画
			pdfModalVisible: false,//pdf预览Modal
			pdfInsideModalVisible: false,//pdf里面的Modal
			source: {uri: '', cache: true},//pdf
			lookImages: [],//图片附件
			chooseShowModalVisible: false,//文件预览Modal
			viewFile: {},//被预览文件对象
		}
	};

	componentDidMount() {
		this._getTopicDetails();
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', () => {
			this.setState({
				inviteContent: '',//评论内容清空
				commentPid: 0,
			}, () => {
				this.refs.commentInput.blur();
			})
		});
	};

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		commentPage = 1;
	}

	_getTopicDetails = () => {
		let params = {
			ticket: this.state.ticket,
			uuId: this.state.uuid,
			userId: this.state.basic.userId,
			jidNode: this.state.basic.jidNode,
			topicId: this.state.topicId,
			type: this.state.isLZ
		};
		FetchUtil.netUtil(Path.getTopicDetail + ParamsDealUtil.toGetParams(params), {}, 'GET', this.props.navigation, '', (data) => {
			console.log(data);
			if (data.code.toString() == '200') {
				this.setState({
					topicInfo: data.data.topicInfo,
					isLike: data.data.islike,
					liskNum: data.data.liskNum,
					invitePeople: data.data.likeList,
					updateFiles: data.data.topicAttachmentList,
					commentList: data.data.discussList
				}, () => {
					// this.forCommentList(data.data.discussList);
					this._commentListMap(this.state.commentList);
					this.forDiscussList(data.data.topicAttachmentList);
					// this.refs.topicHeader._changeHeaderTitle(this.state.topicInfo.title);
				});
			}
		});
	};
	//循环评论列表
	forCommentList = (str) => {
		console.log(str);
		let ARR = str, Arr = str, res = [];
		ARR.map((item) => {
			let replyArr = [];
			for (let i in Arr) {
				if (item.id == Arr[i].pid) {
					replyArr.push(Arr[i]);
				}
			}
			if (item.pid == '0') {
				item.replyArr = replyArr.reverse();
				res.push(item);
			}
		});
		this.setState({
			commentList: res
		}, () => {
			this._commentListMap(this.state.commentList)
		});
	};
	//处理评论静态分页
	_commentListMap = (res) => {
		console.log('评论静态分页');
		console.log(res);
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
		});
	};
	//滑动分页处理
	_scrollInviteDetails = (e) => {
		let offsetY = e.nativeEvent.contentOffset.y;
		let contentSizeHeight = e.nativeEvent.contentSize.height;
		let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height;
		if (Math.floor(offsetY + oriageScrollHeight) >= Math.floor(contentSizeHeight)) {
			console.log('滑动到底了');
			this.setState({commentShowFoot: 3});
			let box = this.state.commentList,
				arr = box.slice(0, commentPage * 10);
			if (box.length > commentPage * 10) {
				commentPage++;
			}
			let num = box.length > commentPage * 10 ? 2 : 1;
			this.setState({
				commentShowList: arr,
				commentShowFoot: num
			}, () => {
				console.log(this.state.commentShowList)
			});
		}
	};
	//上传附件遍历
	_updateFilesItem = ({item, index}) => {
		// console.log(item)
		let params = {
			uuId: this.state.uuid,
			ticket: this.state.ticket,
			userId: this.state.basic.userId,
			attId: item.id
		};
		return (<TouchableOpacity key={index} style={{
			flexDirection: 'row',
			backgroundColor: '#f6f5f5',
			// padding: 10,
			alignItems: 'center',
			justifyContent:'center'
		}} onPress={() => {
			HandlerOnceTap(
				() => {
					fileTypeReturn.fileTypeSelect(item.fileName) == 'img' ? this._LookingFile(item.id) : this.viewfile(item);
				}
			)
		}}>
			{FileTypeUtil.fileTypeSelect(item.fileName) == 'img' ? (<Image source={{
				// uri: Path.getDownLoadAttachList + ParamsDealUtil.toGetParams(params)
				uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + item.fileName + '&imageId=' + item.id + '&sourceType=attachmentImage&jidNode='
			}} style={styles.inviteFileIcon}/>) : (FileTypeUtil.fileTypeSelect(item.fileName))}
			<View style={styles.inviteFileInfor}>
				<Text style={{fontSize: 14, color: '#333', marginBottom: 3}}>{` ${item.fileName}`}</Text>
			</View>
		</TouchableOpacity>)
	};

	//文件预览
	viewfile = (file) => {
		cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
		// let type = file.fileName.substr(file.fileName.lastIndexOf('.') + 1, file.fileName.length);
		// let url = Path.getDownLoadAttachList + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&attId=' + file.id + '&suffix=' + type;
		// console.log(url);
		this.setState({
			viewFile: file
		}, () => {
			this.setState({fileAnimating: true}, () => {

                if (Platform.OS === 'ios') {
                    // this.refs.toast.show('正在加载，请稍等...', DURATION.LENGTH_SHORT);
                    this.refs.bottomMenu._changeMenuShow(true);
                    this.refs.bottomMenu._changeFirMenuShow(true);
                    this.refs.bottomMenu._changeSecMenuShow(false);
                } else {
                    //Android
                    let showFileType = fileTypeReturn.getOtherFileType(file.fileName);
                    if (showFileType == 'file') {
                        this.refs.bottomMenu._changeMenuShow(true);
                        this.refs.bottomMenu._changeFirMenuShow(true);
                        this.refs.bottomMenu._changeSecMenuShow(true);
                    }else{
                        //其他类型直接弹出第三方打开
                        // this._useOtherOpenFile(file);
                        this.refs.bottomMenu._changeMenuShow(true);
                        this.refs.bottomMenu._changeFirMenuShow(false);
                        this.refs.bottomMenu._changeSecMenuShow(true);
                    }
                }
                this.setState({fileAnimating: false});
            });
        });

	};

	_useLocalOpenFile = (file) => {
		if (Platform.OS === 'ios') {
			let type = file.fileName.substr(file.fileName.lastIndexOf('.') + 1, file.fileName.length);
			let url = Path.getDownLoadAttachList + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&attId=' + file.id + '&suffix=' + type;
			OpenFile.openDocBinaryinUrl([{
				url: url,
				fileName: file.fileName.substr(0, file.fileName.lastIndexOf('.')),
				fileType: type
			}], (error, url) => {
				if (error) {
					console.log(error);
				} else {
					console.log(url)

				}
			})
		} else {
			this.setState({
				pdfInsideModalVisible: true,
				source: {
					uri: Path.previewAttachment + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&attId=' + file.id + '&suffix=' + file.fileName,
					cache: true
				}//pdf
			}, () => {
				this.setState({
					pdfModalVisible: true,
					tempViewFileSize: file.filesize
				}, () => {
					this.refs.bottomMenu._changeMenuShow(false);
					this.refs.bottomMenu._changeFirMenuShow(false);
					this.refs.bottomMenu._changeSecMenuShow(false);
				})
			})
		}
	}
	//调起选择其他程序
	_useOtherOpenFile = (file) => {
		OpenFile.openDocBinaryinUrl([{
			url: Path.baseImageUrl + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&fileId=' + file.id + '&fileName=' + encodeURI(encodeURI(file.fileName)),
			fileName: file.fileName.substr(0, file.fileName.lastIndexOf('.')),
			fileType: file.fileName.substr(file.fileName.lastIndexOf('.') + 1, file.fileName.length),
			cache: true
		}], (error, url) => {
			if (error) {
				this.setState({animating: false}, () => {
					this.refs.bottomMenu._changeMenuShow(false);
					this.refs.bottomMenu._changeFirMenuShow(false);
					this.refs.bottomMenu._changeSecMenuShow(false);
				});
				console.error(error);
			} else {
				this.setState({animating: false}, () => {
					this.refs.bottomMenu._changeMenuShow(false);
					this.refs.bottomMenu._changeFirMenuShow(false);
					this.refs.bottomMenu._changeSecMenuShow(false);
				});
				console.log(url)
			}
		})
	}


	//附件图片
	forDiscussList = (str) => {
		//let arrey = this.state.lookImages;
		let tempArr = [];
		for (let i in str) {
			// console.log(str[i]);
			if (fileTypeReturn.fileTypeSelect(str[i].fileName) == 'img') {
				tempArr.push({url: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + str[i].fileName + '&imageId=' + str[i].id + '&sourceType=attachmentImage&jidNode='});
				this.setState({
					lookImages:tempArr
				})
				// this.state.lookImages.push({url: Path.getDownLoadAttachList + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&attId=' + str[i].id});
			}
		}
	}
	//点赞&取消赞
	zanTopic = () => {
		let params = {
			jidNode: this.state.basic.jidNode,
			topicId: this.state.topicId,
			type: this.state.isLike ? 1 : 0
		};
		FetchUtil.netUtil(Path.changeTopicZan, params, 'POST', this.props.navigation, {
			userId: this.state.basic.userId,
			uuId: this.state.uuid,
			ticket: this.state.ticket
		}, (res) => {
			console.log(res);
			if (res.code.toString() == '200') {
				DeviceEventEmitter.emit('topicAddPage');//刷新话题列表
				this._getTopicDetails();
			}
		})
	};
	//仅看楼主评论
	onlyShowLZ = () => {
		this.setState({
			isLZ: this.state.isLZ == 1 ? 0 : 1
		}, () => {
			this._getTopicDetails();
		})
	};

	_downloadFile = (file) => {
		DeviceEventEmitter.emit('changeLoading', 'true');
		let url = Path.baseImageUrl + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&attId=' + file.id + '&userId=' + this.state.basic.userId;
		let downloadDest = '';
		if (Platform.OS == 'android') {
			downloadDest = '/storage/emulated/0/Android/data/com.instantmessage/files/' + file.fileName;
		} else {
			downloadDest = '/storage/emulated/0/Android/data/com.egt_rn/files/' + file.name;
		}
		const options = {
			fromUrl: url,
			toFile: downloadDest,
			background: true,
		};
		try {
			const ret = RNFS.downloadFile(options);
			ret.promise.then(res => {
				if (res.statusCode == 200) {
					DeviceEventEmitter.emit('changeLoading', 'false');
					if (Platform.OS == 'android') {
						Alert.alert(
							'文件保存路径',
							downloadDest.substring(downloadDest.indexOf('0') + 1, downloadDest.length),
							[
								{
									text: '确定', onPress: () => {
										this.refs.bottomMenu._changeMenuShow(false);
										this.refs.bottomMenu._changeFirMenuShow(false);
										this.refs.bottomMenu._changeSecMenuShow(false);
									}
								}
							]
						)
					}
				}
			}).catch(err => {
				console.log('err', err);
			});
		}
		catch (e) {
			console.log(e);
		}
	}

	_LookingFile = (id) => {
		let body = this.state.lookImages,
			chooseId = null;
		for (let i in body) {
			if (body[i].url.indexOf(id) > -1) {
				chooseId = parseInt(i);
			}
		}
		this.setState({
			lookChooseId: chooseId,
			isModalVisible: true,
		}, () => {
			// console.log(body[this.state.lookChooseId])
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<Modal
					visible={this.state.pdfModalVisible}//
					//显示是的动画默认none
					//从下面向上滑动slide
					//慢慢显示fade
					animationType={'none'}
					//是否透明默认是不透明 false
					transparent={true}
					//关闭时调用
					onRequestClose={() => {
						this.setState({pdfModalVisible: false})
					}}
				>
					<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)'}}>
						<Pdf
							source={this.state.source}
							onLoadComplete={(numberOfPages, filePath) => {
								this.setState({
									pdfInsideModalVisible: false
								})
							}}
							onPageChanged={(page, numberOfPages) => {
								console.log(`current page: ${page}`);
							}}
							onError={(error) => {
								this.setState({pdfInsideModalVisible: false})
							}}
							enablePaging={false}
							onPageSingleTap={() => {
								this.setState({pdfModalVisible: false})
							}}
							activityIndicator={()=>{return null;}}
							style={{flex: 1}}/>
					</View>
				</Modal>
				<Modal
					visible={this.state.pdfInsideModalVisible}//
					//显示是的动画默认none
					//从下面向上滑动slide
					//慢慢显示fade
					animationType={'none'}
					//是否透明默认是不透明 false
					transparent={true}
					//关闭时调用
					onRequestClose={() => {
						// this.setState({pdfInsideModalVisible: false})
					}}
				>
					<View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
						<ActivityIndicator
							animating={this.state.animating}
							size="large"
							color='rgba(76,122,238,1)'
						/>
					</View>
				</Modal>
				<Header
					ref={'topicHeader'}
					headLeftFlag={true}
					onPressBackBtn={() => {
						this.props.navigation.goBack();
					}}
					backTitle={'返回'}
					title={'话题详情'}
				/>
				<BottomMenu
					ref={'bottomMenu'}
					isShow={this.state.chooseShowModalVisible}
					menuTitle={'请选择打开方式'}
					firstMenuFunc={() => {
						this._useLocalOpenFile(this.state.viewFile)
					}}
					firstTitle={'应用内部打开'}
					secondMenuFunc={() => {
						this._useOtherOpenFile(this.state.viewFile)
					}}
					secondTitle={'第三方应用打开'}
					downloadFunc={() => {
						this._downloadFile(this.state.viewFile)
					}}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					onScroll={this._scrollInviteDetails}
					keyboardDismissMode={'on-drag'}>
					<View style={styles.inviteInfor}>
						<Text style={styles.inforTitle}>{this.state.topicInfo.title}</Text>
						<Text style={styles.inforTitle}>{this.state.topicInfo.content}</Text>
						<View style={{flexDirection: 'row', marginTop: 10, marginBottom: 10}}>
							<View style={{flex: 1, alignItems: 'center', flexDirection: 'row'}}>
								<Image
									source={{
										uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + this.state.topicInfo.photoId + '&imageId=' + this.state.topicInfo.photoId + '&sourceType=singleImage&jidNode='
										// uri: Path.headImg + '?fileName=' + this.state.topicInfo.createUser + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId
									}}
									style={{width: 30, height: 30, marginRight: 5}}/>
								<Text style={{
									fontSize: 11,
									color: '#999'
								}}>{`${this.state.topicInfo.nickName}发表于 ${this.state.topicInfo.createTime}`}</Text>
							</View>
							<View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
								<TouchableWithoutFeedback
									onPress={this.zanTopic}>
									<View style={{flexDirection: 'row', alignItems: 'center'}}>
										{this.state.isLike ? (
											<FontAwesomeIcon size={18} name="heart" color="#F90000"/>
										) : (
											<FontAwesomeIcon size={18} name="heart-o" color="#F90000"/>
										)}
										<Text style={{color: '#4C7AEE'}}>{` 赞(${this.state.liskNum})`}</Text>
									</View>
								</TouchableWithoutFeedback>
							</View>
						</View>
					</View>
					<View style={styles.inviteBox}>
						<Text style={{marginBottom: 8}}>{'赞过的人:'}</Text>
						<FlatList
							keyExtractor={(item, index) => String(index)}
							numColumns={6}
							data={this.state.invitePeople}
							renderItem={this._inviteHeadItem}
							scrollEnabled={false}/>
						<View style={styles.separator}/>
						<Text style={{marginTop: 8, marginBottom: 8}}>{'附件:'}</Text>
						<FlatList
							keyExtractor={(item, index) => String(index)}
							data={this.state.updateFiles}
							renderItem={this._updateFilesItem}
							ItemSeparatorComponent={() => <View style={styles.separator}/>}
							ListEmptyComponent={() => <Text style={{textAlign: 'center', margin: 10}}>无上传附件</Text>}
							scrollEnabled={false}/>
					</View>
					<View style={[styles.inviteBox, {
						backgroundColor: '#f0f0f0',
						flexDirection: 'row',
						alignItems: 'center'
					}]}>
						<Text style={[styles.inviteTitle, {flex: 1}]}>用户讨论</Text>
						<TouchableOpacity onPress={this.onlyShowLZ}>
							<View style={{justifyContent: 'center'}}>
								<Text style={[styles.onlyTitle, {
									flex: 1,
									textAlign: 'right'
								}]}>{this.state.isLZ == 0 ? '只看楼主' : '查看全部'}</Text>
							</View>
						</TouchableOpacity>
					</View>
					<View style={[styles.inviteBox, {flex: 1}]}>
						{
							this.state.commentShowList.map((item, index) => {
								// console.log(item);
								return <View key={index}
								             style={[styles.inviteGroup, index == 0 ? {borderTopColor: 'transparent'} : null]}>
									<Image
										source={{
											uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + item.photoId + '&imageId=' + item.photoId + '&sourceType=singleImage&jidNode='
											// uri: Path.headImg + '?fileName=' + item.photoId + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId
										}}
										style={styles.inviteHeadImg}/>
									<View style={{flex: 1, marginLeft: 10}}>
										<View style={{flexDirection: 'row', paddingLeft: 6}}>
											<Text style={{
												fontSize: 15,
												color: '#333',
												flex: 1
											}}>{item.toUserName ? `${item.fromUserName} 评论 ${item.toUserName}` : `${item.fromUserName} 发表`}</Text>
										</View>
										<TouchableOpacity onPress={() => {
											HandlerOnceTap(
												() => {
													this.setState({
														commentPid: item.id,
														inviteContent: ''
													}, () => {
														this.refs.commentInput.focus();
													});
												}
											)
										}}>
											<Text style={{
												fontSize: 13,
												paddingLeft: 6
											}}>{item.content.replace(/<br\/>/g, '')}</Text>
											<View style={{flexDirection: 'row'}}>
												<Text
													style={styles.commitTime}>{item.createTime.substring(0, item.createTime.lastIndexOf(':'))}</Text>
												<Text style={styles.replyBtn}>回复</Text>
											</View>
										</TouchableOpacity>
									</View>
								</View>
							})
						}
						{this._commentFooter()}
					</View>
				</ScrollView>
				<View style={styles.inviteComment}>
					<TextInput
						ref={'commentInput'}
						style={styles.inviteCommentInput}
						multiline={true}
						value={this.state.inviteContent}
						onChangeText={(text) => this.setState({
							inviteContent: text,
						})}
						onBlur={()=>{
							this.setState({
								inviteContent: '',//评论内容清空
								commentPid: 0,
							})
						}}
						placeholder={'请输入评论内容'}
						underlineColorAndroid={'transparent'}/>
					<TouchableOpacity style={styles.btn} onPress={() => {
						HandlerOnceTap(this._inviteComment)
					}}>
						<Text style={{fontSize: 14, color: '#fff'}}>评论</Text>
					</TouchableOpacity>
				</View>
				<Modal
					visible={this.state.isModalVisible}
					animationType={'none'}
					transparent={true}
					onRequestClose={() => {
						this.setState({isModalVisible: false, animating: false})
					}}
				>
					<View style={{flex: 1}}>
						<ImageViewer
							style={{width: width, height: height}}
							imageUrls={this.state.lookImages}
							enableImageZoom={true}
							index={this.state.lookChooseId}
							flipThreshold={10}
							maxOverflow={0}
							onClick={() => { // 图片单击事件
								this.setState({isModalVisible: false, animating: false})
							}}
							backgroundColor={'#000'}
						/>
					</View>
				</Modal>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
			</View>
		)
	}

	//提交评论或回复
	_inviteComment = () => {//提交评论 有pid是回复
		let pid = this.state.commentPid;
		let content = this.state.inviteContent;
		let placeholder = this.state.placeholder;
		this.refs.commentInput.blur();
		let body = {
			jidNode: this.state.basic.jidNode,
			topicId: this.state.topicInfo.id,
			pid: pid,
			content: content
		};
		if (content == '' || content == placeholder) {
			this.refs.toast.show('评论内容不能为空', DURATION.LENGTH_SHORT);

		} else if (ToolUtil.isEmojiCharacterInString(content)) {
			this.refs.toast.show('评论内容不能包含非法字符', DURATION.LENGTH_SHORT);
		} else {
			console.log(body);
			FetchUtil.netUtil(Path.saveTopicDiscuss, body, 'POST', this.props.navigation, {
				ticket: this.state.ticket,
				userId: this.state.basic.userId,
				uuId: this.state.uuid
			}, (responseJson) => {
				console.log(responseJson);
				if (responseJson.code.toString() == '200') {
					this.setState({
						inviteContent: '',
						commentPid: 0,
					}, () => {
						DeviceEventEmitter.emit('topicAddPage');//刷新话题列表
						this._getTopicDetails();
					});
				}
			})
		}
	};
	//点赞人员遍历
	_inviteHeadItem = ({item, index}) => {
		// console.log(item);
		return (
			<TouchableOpacity
				key={index} style={[styles.inviteHeadImg, index % (SCREEN - 1) < (SCREEN - 2) ? {marginRight: 10} : null]}
				onPress={() => {
					HandlerOnceTap(
						() => {
							this.props.navigation.navigate('FriendDetail', {
								ticket: this.state.ticket,
								uuid: this.state.uuid,
								friendJidNode: item.createUser,
								tigRosterStatus: 'both',
								basic: this.state.basic
							});
						}
					)
				}}>
				<Image
					source={{
						uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + item.photo + '&imageId=' + item.photo + '&sourceType=singleImage&jidNode='
						// uri: Path.headImg + '?fileName=' + item.createUser + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId
					}}
					style={{width: headSize, height: headSize, borderRadius: 4}}/>
			</TouchableOpacity>
		)
	};

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
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		position: 'relative'
	},
	inviteBox: {
		flex: 1,
		padding: 10,
		paddingLeft: 15,
		paddingRight: 15
	},
	inviteInfor: {
		paddingTop: 10,
		paddingLeft: 15,
		paddingRight: 15,
		backgroundColor: '#FFFFFF',
	},
	inforTitle: {
		fontSize: 16,
		color: '#333',
		paddingBottom: 10,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
	},
	btn: {
		padding: 3,
		paddingLeft: 8,
		paddingRight: 8,
		backgroundColor: '#3498db',
		borderRadius: 4,
		marginLeft: 10,
	},
	separator: {
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
		marginTop: 5,
		marginBottom: 5
	},
	inviteHeadImg: {
		width: headSize,
		height: headSize,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
		borderRadius: 4
	},
	headMoreBtn: {
		width: headSize,
		height: headSize,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		left: 0,
		top: 0,
	},
	inviteTitle: {
		color: '#333',
		fontSize: 16,
		borderLeftColor: '#ff9226',
		borderLeftWidth: 5,
		paddingLeft: 8
	},
	onlyTitle: {
		color: '#333',
		fontSize: 12
	},
	inviteComment: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 5,
		paddingLeft: 15,
		paddingRight: 15,
		borderTopColor: '#d7d7d7',
		borderTopWidth: 1,
	},
	inviteCommentInput: {
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
	inviteGroup: {
		flexDirection: 'row',
		marginBottom: 10,
		borderTopWidth: 1,
		borderTopColor: '#ebebeb',
		paddingTop: 10,
	},
	inviteFileIcon: {
		width: 26,
		height: 26,
		marginRight: 5,
		marginLeft: 5
	},
	inviteFileInfor: {
		flex: 1,
		justifyContent: 'center',
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
	replyView: {
		flex: 1,
		paddingLeft: 6
	},
	commitTime: {flex: 1, marginRight: 10, textAlign: 'right', fontSize: 11, color: '#aaa'},
	replyBtn: {fontSize: 13, color: '#6173ff'},
});

export default TopicDetail;
