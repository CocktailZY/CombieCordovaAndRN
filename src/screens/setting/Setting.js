import React, {Component} from 'react';
import {
	Platform, StyleSheet,
	Text, View, Image, TouchableOpacity, Alert,
	Dimensions, NativeModules, ToastAndroid, PermissionsAndroid, DeviceEventEmitter, NetInfo,
	ScrollView, Linking
} from 'react-native';
import {StackActions, NavigationActions} from 'react-navigation';
import Header from '../../component/common/Header';
import Icons from 'react-native-vector-icons/Ionicons';
import Path from "../../config/UrlConfig";
import FetchUtil from "../../util/FetchUtil";
import FileSystem from "react-native-filesystem";
import Sqlite from "../../util/Sqlite";
import RedisUtil from '../../util/RedisUtil';
import ImagePickerManager from "react-native-image-picker";
import cookie from "../../util/cookie";
import Toast, {DURATION} from 'react-native-easy-toast';
import XmlUtil from "../../util/XmlUtil";
import UUIDUtil from "../../util/UUIDUtil";
import HandlerOnceTap from '../../util/HandlerOnceTap';
import deviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import PermissionUtil from "../../util/PermissionUtil";
import ListenerUtil from '../../util/ListenerUtil';
import Global from '../../util/Global';

const {width} = Dimensions.get('window');
const XMPP = Platform.select({
	ios: () => NativeModules.JCNativeRNBride,
	android: () => require('react-native-xmpp'),
})();

export default class Setting extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// dataSource: [],
			// animating: true,
			userName: '',
			nickName: '',
			email: '',
			cell: '',
			class: '',
			sex: null,
			photoId: props.navigation.state.params.basic.photoId,
			uuid: props.navigation.state.params.uuid,
			ticket: props.navigation.state.params.ticket,
			basic: props.navigation.state.params.basic,
			showNewVersion:false,//是否有新版本的红点样式
		}
	};

	//组件渲染完毕时调用此方法
	componentDidMount() {
		/*if (Platform.OS == 'android') {
			this._checkPermission(false);
		}*/
		this.fetchData();
		this._getVersion();
	};

	fetchData = () => {

		NetInfo.isConnected.fetch().done((isConnected) => {
			if (isConnected) {
				this.refs.settingHeader._changeHeaderTitle('我的');
				let url = Path.setting + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&currentUid=' + this.state.basic.uid + '&friendUserId=' + this.state.basic.userId;
				FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {

					let branchName;
					responseJson.data.positionDeptVos.map((item) => {
						if (item.empType == '0') {
							branchName = item.branchName;
						}
					});

					this.setState({
						userName: responseJson.data.userName,
						nickName: responseJson.data.nickName,
						email: responseJson.data.email,
						cell: responseJson.data.cell,
						photoId: responseJson.data.photoId,
						sex: responseJson.data.sex,
						class: branchName
					});
				})
			} else {
				this.refs.settingHeader._changeHeaderTitle('我的(无连接)');
				this.refs.toast.show('请检查当前网络状态', DURATION.LENGTH_SHORT);
			}
		});


	};

	_logout = () => {
		if (Platform.OS == 'ios') {
			//console.log(event)
			let url = Path.loginOut + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId;

			FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
				if (responseJson.code.toString() == '200') {

					RedisUtil.update(-1, this.props.navigation, {
						uuId: this.state.uuid,
						ticket: this.state.ticket,
						userId: this.state.basic.userId
					}, 'redis', 'front', () => {

						XMPP.XMPPDisConnect();
						FileSystem.fileExists('my-directory/my-file.txt', FileSystem.storage.important).then((res) => {
							if (res) {
								this.deleteFile();
							}
						})
						Global.updateFlag = null;
						Sqlite.close();
						this.timer = setTimeout(
							() => {
								this.props.navigation.dispatch(StackActions.reset({
									index: 0,
									actions: [
										NavigationActions.navigate({routeName: 'Login'}),
									]
								}))
							}, 300);

					});
					//this.props.navigation.pop()//跳转登录页
				} else {
					// alert('退出登录失败')
					this.refs.toast.show('退出登录失败', DURATION.LENGTH_SHORT);
				}
			})


		} else {
			XMPP.sendStanza('<presence xmlns=\'jabber:client\' from=\'' + this.state.basic.jid + '/' + this.state.basic.userId + '\' type=\'unavailable\'><status>在线</status></presence>');
			// XMPP.sendStanza('<close xmlns=\'urn:ietf:params:xml:ns:xmpp-framing\'/>');
			XMPP.removeListeners();
			XMPP.disconnect();
            ListenerUtil.remove();
            let url = Path.loginOut + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId;
			FetchUtil.netUtil(url, {}, 'GET', this.props.navigation, '', (responseJson) => {
				if (responseJson.code.toString() == '200') {
					FileSystem.fileExists('my-directory/my-file.txt', FileSystem.storage.important).then((res) => {
						if (res) {
							this.deleteFile();
						}
					});
					Global.updateFlag = null;
					Sqlite.close();
					RedisUtil.update(-1, this.props.navigation, {
						uuId: this.state.uuid,
						ticket: this.state.ticket,
						userId: this.state.basic.userId
					}, 'redis', 'front', () => {
					});
					this.props.navigation.dispatch(StackActions.reset({
						index: 0,
						actions: [
							NavigationActions.navigate({routeName: 'Login'}),
						]
					}))//跳转登录页
				} else {
					this.refs.toast.show('退出登录失败', DURATION.LENGTH_SHORT);
				}
			})
		}
	};

	async deleteFile() {
		await FileSystem.delete('my-directory/my-file.txt', FileSystem.storage.important);
		//console.log('file is deleted');
	};

	//设置头像
	resetHeadImage = () => {
		cookie.save('isUpload', 1);//用于判断是否为选择图片后台状态
		if (Platform.OS == 'android') {
			// this._checkPermission(true);
            PermissionUtil.requestAndroidPermission(
				[PermissionsUtil.Permissions.read,PermissionsUtil.Permissions.write,PermissionsUtil.Permissions.camera], (value) => {
                    if (typeof value == "boolean" && value) {
                        this.openImagePicker();
                    } else if (typeof value == "boolean" && !value) {
                        Alert.alert(
                            '提醒',
                            '修改头像前，请先开启相机权限！',
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
                        console.log("=================");
                        console.log(status);
                        if(status){
                            this.openImagePicker();
						}else{
                            Alert.alert(
                                '提醒',
                                '修改头像前，请先开启相机权限！',
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
		} else {

			let photoOptions = {
				//底部弹出框选项
				title: '请选择',
				cancelButtonTitle: '取消',
				takePhotoButtonTitle: '拍照',
				chooseFromLibraryButtonTitle: '打开相册',
				cameraType: 'back',
				quality: 1,
				// maxWidth: 36,
				// maxHeight: 36,
				allowsEditing: false,
				noData: false,
				storageOptions: {
					skipBackup: true,
					path: 'file'
				}
			};

			//打开图像库：
			ImagePickerManager.showImagePicker(photoOptions, (response) => {
				cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
				console.log(response);
				if (response.didCancel) {
					//选择了取消
				} else {

					if (response.error) {
						this.refs.toast.show('请检查您的相册权限是否开启', 3000);
						return;
					}

					let imageType;
					if (response.fileName) {
						imageType = response.fileName.substr(response.fileName.lastIndexOf('.') + 1);
					} else {
						imageType = response.uri.substr(response.uri.lastIndexOf('.') + 1);
					}
					const trueType = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];
					if (trueType.indexOf(imageType) > -1) {
						//与上一节中的代码相同！
						let formData = new FormData();
						let file = {
							uri: response.uri,
							type: 'multipart/form-data',
							name: response.fileName ? response.fileName : 'image.png'
						};
						formData.append("file", file);
						let url = Path.resetHeadImage + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;

						fetch(url, {
							method: 'POST',
							headers: {
								'Content-Type': 'multipart/form-data',
							},
							body: formData,
						}).then((response) => response.json()).then((responseData) => {
							let photo = JSON.parse(responseData.data).photoId;
							let basic = this.state.basic;
							basic.photoId = photo;
							console.log(photo);
							cookie.save('selfPhotoId', photo);
							this.setState({
								photoId: photo,
								basic: basic
							});
							this.refs.toast.show('设置成功', DURATION.LENGTH_SHORT);

							//设置头像发送报文------------------------
							if (Platform.OS == 'android') {
								let param = {
									isChange: true,
									userId: this.state.basic.jidNode,
									newPhotoId: photo
								};
								let changeHeadXml = XmlUtil.modifyHead(param);
								XMPP.sendStanza(changeHeadXml);
							} else {
								XMPP.XMPPUpdateHeadImage({
									'isChange': 'true',
									'id': UUIDUtil.getUUID().replace(/\-/g, ''),
									'newphotoid': photo,
									'userId': this.state.basic.jidNode
								})

							}
							//end-----------------------------------

							this.fetchData();
						}, () => {
							// alert('success')
						}).catch((error) => {
							console.error('error', error)
						});
					} else {
						this.refs.toast.show('无效图片格式，仅支持“gif,jpeg,jpg,png”', DURATION.LENGTH_SHORT * 10);
					}
				}
			});
		}
	}

	openImagePicker = () =>{
        let photoOptions = {
            //底部弹出框选项
            title: '请选择',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '打开相册',
            cameraType: 'back',
            quality: 1,
            // maxWidth: 36,
            // maxHeight: 36,
            allowsEditing: false,
            noData: false,
            storageOptions: {
                skipBackup: true,
                path: 'file'
            }
        };

        //打开图像库：
        ImagePickerManager.showImagePicker(photoOptions, (response) => {
            cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
            // console.log(response);
            if (response.didCancel) {
                //选择了取消
            } else {

                if (response.error) {
                    console.log('FilePickerManager Error: ', response.error);
                    this.refs.toast.show('您选择的图片异常，请更换有效图片再试！', 3000);
                    return;
                }

                let imageType;
                if (response.fileName) {
                    imageType = response.fileName.substr(response.fileName.lastIndexOf('.') + 1);
                } else {
                    imageType = response.uri.substr(response.uri.lastIndexOf('.') + 1);
                }
                const trueType = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];
                // console.log(response)
                if (trueType.indexOf(imageType) > -1) {
                    //与上一节中的代码相同！
                    // DeviceEventEmitter.emit('changeLoading', 'true');
                    let formData = new FormData();
                    let file = {
                        uri: response.uri,
                        type: 'multipart/form-data',
                        name: response.fileName ? response.fileName : 'image.png'
                    };
                    formData.append("file", file);
                    this.refs.toast.show('头像更新中，请稍候...', 3000);
                    let url = Path.resetHeadImage + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId;
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formData,
                    }).then((response) => response.json()).then((responseData) => {
                    	// console.log(responseData);

                    	if(responseData.code == "200"){
                            let photo = JSON.parse(responseData.data).photoId;
                            let basic = this.state.basic;
                            basic.photoId = photo;
                            // console.log(photo);
                            cookie.save('selfPhotoId', photo);
                            this.sendPhotoMsg(photo,basic);
						}
                    }, () => {
                        // alert('success')
                    }).catch((error) => {
                        console.error('error', error)
                    });
                } else {
                    this.refs.toast.show('无效图片格式，仅支持“gif,jpeg,jpg,png”', DURATION.LENGTH_SHORT * 10);
                }
            }
        });
	}

	sendPhotoMsg = (photo,basic) =>{
        this.setState({
            photoId: photo,
            basic: basic
        }, () => {
            DeviceEventEmitter.emit('changeLoading', 'false');
            this.refs.toast.show('设置成功！', 3000);
            let params = {
                imageName: photo,
                jidNode: basic.jidNode,
                sourceType: "singleImage",
                imageId: photo,
                platform: "android"
            };

            //设置头像发送报文------------------------
            if (Platform.OS == 'android') {
                let param = {
                    isChange: true,
                    userId: this.state.basic.jidNode,
                    newPhotoId: photo
                };
                let changeHeadXml = XmlUtil.modifyHead(param);
                XMPP.sendStanza(changeHeadXml);
            } else {
                XMPP.XMPPUpdateHeadImage({
                    'isChange': 'true',
                    'id': UUIDUtil.getUUID().replace(/\-/g, ''),
                    'newphotoid': photo,
                    'userId': this.state.basic.jidNode
                })

            }
            //end-----------------------------------
            //修改本地文件头像------------------------
            if (Platform.OS == 'android') {
                RNFS.readFile('/data/data/com.instantmessage/files/RNFS-Important/my-directory/my-file.txt', 'utf8').then((result) => {
                    // console.log(result);
                    let fileContent = result;
                    let temp_userInfo = JSON.parse(fileContent);
                    // console.log(temp_userInfo);
                    temp_userInfo.tigUser['photoId'] = photo;
                    //重新写入文件
                    this.deleteFile();
                    FileSystem.writeToFile('my-directory/my-file.txt', JSON.stringify(temp_userInfo), FileSystem.storage.important).then((res) => {
                        // console.log(res);
                    });
                }).catch((err) => {
                    console.log(err);
                })
            } else {
                FileSystem.readFile('my-directory/my-file.txt', FileSystem.storage.important).then((response) => {
                    let temp_userInfo = JSON.parse(response);
                    temp_userInfo.tigUser['photoId'] = photo;
                    //重新写入文件
                    this.deleteFile();
                    FileSystem.writeToFile('my-directory/my-file.txt', JSON.stringify(temp_userInfo), FileSystem.storage.important).then((res) => {
                        console.log(res);
                    });
                });

            }

            //end-----------------------------------
            // this.fetchData();
        });
	}

	//更新
    _getVersion = () => {
        let url = Path.getSysVersion + '?systemId=' + Path.systemId + '&uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId;
        FetchUtil.netUtil(Platform.OS == 'ios' ? url + '&platformType=ios' : url + '&platformType=android', {}, 'GET', this.props.navigation, '', (data) => {
            console.log("获取版本信息：" + JSON.parse(data.data).version);
            let version = JSON.parse(data.data).version;
            if (data.code.toString() == '200') {
							if (parseFloat(version) > parseFloat(deviceInfo.getVersion())) {
								this.setState({
									showNewVersion: true
								})
							}else {
								this.setState({
									showNewVersion: false
								})
							}
            }
        });
    };
	//检查动态权限
	_checkPermission = async (mark) => {
		let resultCamera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
		let resultRead = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
		let resultWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
		if (resultCamera && resultRead && resultWrite) {
			if (mark) {
				let photoOptions = {
					//底部弹出框选项
					title: '请选择',
					cancelButtonTitle: '取消',
					takePhotoButtonTitle: '拍照',
					chooseFromLibraryButtonTitle: '打开相册',
					cameraType: 'back',
					quality: 1,
					// maxWidth: 36,
					// maxHeight: 36,
					allowsEditing: false,
					noData: false,
					storageOptions: {
						skipBackup: true,
						path: 'file'
					}
				};

				//打开图像库：
				ImagePickerManager.showImagePicker(photoOptions, (response) => {
					cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
					// console.log(response);
					if (response.didCancel) {
						//选择了取消
					} else {

						if (response.error) {
							console.log('FilePickerManager Error: ', response.error);
							this.refs.toast.show('请检查您的相册权限是否开启', 3000);
							return;
						}

						let imageType;
						if (response.fileName) {
							imageType = response.fileName.substr(response.fileName.lastIndexOf('.') + 1);
						} else {
							imageType = response.uri.substr(response.uri.lastIndexOf('.') + 1);
						}
						const trueType = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];
						if (trueType.indexOf(imageType) > -1) {
							//与上一节中的代码相同！
							let formData = new FormData();
							let file = {
								uri: response.uri,
								type: 'multipart/form-data',
								name: response.fileName ? response.fileName : 'image.png'
							};
							formData.append("file", file);
							let url = Path.resetHeadImage + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId +"&platform="+Platform.OS;

							fetch(url, {
								method: 'POST',
								headers: {
									'Content-Type': 'multipart/form-data',
								},
								body: formData,
							}).then((response) => response.json()).then((responseData) => {
								let photo = JSON.parse(responseData.data).photoId;
								let basic = this.state.basic;
								basic.photoId = photo;
								console.log(photo);
								cookie.save('selfPhotoId', photo);
								this.setState({
									photoId: photo,
									basic: basic
								}, () => {
									this.refs.toast.show('设置成功', DURATION.LENGTH_SHORT);

									let params = {
										imageName: photo,
										jidNode: basic.jidNode,
										sourceType: "singleImage",
										imageId: photo,
										platform: "android"
									};
									// FetchUtil.netUtil(Path.updateHeadImage, params, 'POST', this.props.navigation, {
									// 	uuId: this.state.uuid,
									// 	ticket: this.state.ticket,
									// 	userId: this.state.basic.userId
									// }, (responseJson) => {
									// 	if (responseJson.code.toString() == '200') {
									// 		setTimeout(()=>{
												//设置头像发送报文------------------------
												if (Platform.OS == 'android') {
													let param = {
														isChange: true,
														userId: this.state.basic.jidNode,
														newPhotoId: photo
													};
													let changeHeadXml = XmlUtil.modifyHead(param);
													XMPP.sendStanza(changeHeadXml);
												} else {
													XMPP.XMPPUpdateHeadImage({
														'isChange': 'true',
														'id': UUIDUtil.getUUID().replace(/\-/g, ''),
														'newphotoid': photo,
														'userId': this.state.basic.jidNode
													})

												}
												//end-----------------------------------
												//修改本地文件头像------------------------
												if (Platform.OS == 'android') {
													RNFS.readFile('/data/data/com.instantmessage/files/RNFS-Important/my-directory/my-file.txt', 'utf8').then((result) => {
														console.log(result);
														let fileContent = result;
														let temp_userInfo = JSON.parse(fileContent);
														console.log(temp_userInfo);
														temp_userInfo.tigUser['photoId'] = photo;
														//重新写入文件
														this.deleteFile();
														FileSystem.writeToFile('my-directory/my-file.txt', JSON.stringify(temp_userInfo), FileSystem.storage.important).then((res) => {
															console.log(res);
														});
													}).catch((err) => {
														console.log(err);
													})
												} else {
													FileSystem.readFile('my-directory/my-file.txt', FileSystem.storage.important).then((response) => {
														let temp_userInfo = JSON.parse(response);
														temp_userInfo.tigUser['photoId'] = photo;
														//重新写入文件
														this.deleteFile();
														FileSystem.writeToFile('my-directory/my-file.txt', JSON.stringify(temp_userInfo), FileSystem.storage.important).then((res) => {
															console.log(res);
														});
													});

												}

												//end-----------------------------------
												this.fetchData();
									// 		},2000)
									// 	}
									// })
								});
							}, () => {
								// alert('success')
							}).catch((error) => {
								console.error('error', error)
							});
						} else {
							this.refs.toast.show('无效图片格式，仅支持“gif,jpeg,jpg,png”', DURATION.LENGTH_SHORT * 10);
						}
					}
				});
			}
		} else {
			this.requestReadExternalStoragePermission(mark);
		}
	}

	//动态获取存储权限
	async requestReadExternalStoragePermission(mark) {
		try {
			const granted = await PermissionsAndroid.requestMultiple(
				[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.CAMERA]
			)
			if (granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
				granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
				granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED
			) {
				console.log("You can read external storage");
				if (mark) {
					let photoOptions = {
						//底部弹出框选项
						title: '请选择',
						cancelButtonTitle: '取消',
						takePhotoButtonTitle: '拍照',
						chooseFromLibraryButtonTitle: '打开相册',
						cameraType: 'back',
						quality: 1,
						// maxWidth: 36,
						// maxHeight: 36,
						allowsEditing: false,
						noData: false,
						storageOptions: {
							skipBackup: true,
							path: 'file'
						}
					};

					//打开图像库：
					ImagePickerManager.showImagePicker(photoOptions, (response) => {
						cookie.save('isUpload', 1);//用于判断是否为选择文件后台状态
						console.log(response);
						if (response.didCancel) {
							//选择了取消
						} else {

							if (response.error) {
								console.log('FilePickerManager Error: ', response.error);
								this.refs.toast.show('请检查您的相册权限是否开启', 3000);
								return;
							}

							let imageType;
							if (response.fileName) {
								imageType = response.fileName.substr(response.fileName.lastIndexOf('.') + 1);
							} else {
								imageType = response.uri.substr(response.uri.lastIndexOf('.') + 1);
							}
							const trueType = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];
							if (trueType.indexOf(imageType) > -1) {
								//与上一节中的代码相同！
								let formData = new FormData();
								let file = {
									uri: response.uri,
									type: 'multipart/form-data',
									name: response.fileName ? response.fileName : 'image.png'
								};
								formData.append("file", file);
								let url = Path.resetHeadImage + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&jidNode=' + this.state.basic.jidNode + '&userId=' + this.state.basic.userId +"&platform="+Platform.OS;

								fetch(url, {
									method: 'POST',
									headers: {
										'Content-Type': 'multipart/form-data',
									},
									body: formData,
								}).then((response) => response.json()).then((responseData) => {
									let photo = JSON.parse(responseData.data).photoId;
									let basic = this.state.basic;
									basic.photoId = photo;
									console.log(photo);
									cookie.save('selfPhotoId', photo);
									this.setState({
										photoId: photo,
										basic: basic
									});
									this.refs.toast.show('设置成功', DURATION.LENGTH_SHORT);

									//设置头像发送报文------------------------
									if (Platform.OS == 'android') {
										let param = {
											isChange: true,
											userId: this.state.basic.jidNode,
											newPhotoId: photo
										};
										let changeHeadXml = XmlUtil.modifyHead(param);
										XMPP.sendStanza(changeHeadXml);
									} else {
										XMPP.XMPPUpdateHeadImage({
											'isChange': 'true',
											'id': UUIDUtil.getUUID().replace(/\-/g, ''),
											'newphotoid': photo,
											'userId': this.state.basic.jidNode
										})

									}
									//end-----------------------------------

									this.fetchData();
								}, () => {
									// alert('success')
								}).catch((error) => {
									console.error('error', error)
								});
							} else {
								this.refs.toast.show('无效图片格式，仅支持“gif,jpeg,jpg,png”', DURATION.LENGTH_SHORT * 10);
							}
						}
					});
				}
			} else {
				this.setState({
					canChangePhoto: false
				});
				console.log("You can not read external storage")
			}
		} catch (err) {
			console.warn(err)
		}
	}

	_checkCallPermission = () => {
		PermissionUtil.requestAndroidPermission(
			PermissionsUtil.Permissions.phone, (value) => {
				if (typeof value == "boolean" && value) {
					Linking.openURL(`tel:${this.state.basic.cell}`)
				} else if (typeof value == "boolean" && !value) {
					Alert.alert(
						'提醒',
						'使用拨号功能前，请先开启电话权限！',
						[
							{
								text: '确定',
							}
						]
					)
				}
			}
		);
		// let resultPhone = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
		// if (resultPhone && mark) {
		// 	Linking.openURL(`tel:${this.state.friendDetail.cell}`)
		// } else {
		// 	this.requestCallPhonePermission(mark);
		// }
	}

	render() {
		// console.log(Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + this.state.photoId + '&imageId=' + this.state.photoId + '&sourceType=singleImage&jidNode=' + this.state.basic.jidNode + '&platform=' + Platform.OS)
		return (
			<View style={styles.container}>
				<Toast ref="toast" opacity={0.6} fadeOutDuration={1500}/>
				<Header
					ref={'settingHeader'}
					title={'我的'}
				/>
				<View style={{
					// flex: 1,
					position: 'relative',
					alignItems: 'center',
				}}>
					<Image
						source={require('../../images/my_head_bg.png')}
						style={{
							width: width,
							height: width * 233 / 720,
						}}
					/>
					<View style={{
						position: 'absolute',
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						flexDirection: 'row',
						alignItems: 'center',
						paddingLeft: 15,
						paddingRight: 15,
					}}>
						<TouchableOpacity onPress={() => {
							HandlerOnceTap(this.resetHeadImage, "resetHeadImage")
						}} style={{
							borderRadius: Platform.OS == 'ios' ? 30 : 50,
							backgroundColor: '#fff'
						}}>
							<Image
								source={{
									uri: Path.headImgNew + '?uuId=' + this.state.uuid + '&ticket=' + this.state.ticket + '&userId=' + this.state.basic.userId + '&imageName=' + this.state.photoId + '&imageId=' + this.state.photoId + '&sourceType=singleImage&jidNode=' + this.state.basic.jidNode
								}}
								style={{
									width: 60,
									height: 60,
									borderWidth: 1,
									borderRadius: Platform.OS == 'ios' ? 30 : 50,
									borderColor: '#fff'
								}}/>
						</TouchableOpacity>
						<View style={{marginLeft: 15}}>
							<Text style={{color: '#FFFFFF', marginBottom: 5}}>{this.state.nickName}</Text>
							<Text style={{color: '#FFFFFF'}}>{this.state.basic.email}</Text>
						</View>
					</View>
				</View>
				<ScrollView>
					<View style={{backgroundColor: '#fff',paddingLeft: 8}}>
						<View style={styles.menuList}>
							<View style={styles.icons}>
								<Icons name={'ios-person'} size={22} color={'#8d8d8d'}/>
							</View>
							<View style={[styles.menuListText, {borderTopColor: 'transparent'}]}>
								<Text style={styles.settingText}>{this.state.basic.userName}</Text>
							</View>
						</View>
						{
							this.state.basic.cell ?
								<TouchableOpacity style={styles.menuList} onPress={() => {

										HandlerOnceTap(
											() => {

												if (Platform.OS == 'android') {
													Alert.alert(
														'提醒',
														'确认拨打该号码',
														[
															{
																text: '取消',
															},
															{
																text: '呼叫',
																onPress: () => {
																	this._checkCallPermission();
																}
															}
														]
													)
												} else {
													Linking.openURL(`tel:${this.state.basic.cell}`)
												}
											}
										)
								}}>
									<View style={styles.icons}>
										<Icons name={'ios-phone-portrait'} size={22} color={'#2ed573'}/>
									</View>
									<View style={[styles.menuListText]}>
										<Text style={styles.settingText}>{this.state.basic.cell}</Text>
									</View>
								</TouchableOpacity> : null
						}
						<View style={styles.menuList}>
							<View style={styles.icons}>
								{
									this.state.sex == 0 ?
										<Icons name={'md-male'} size={20} color={'#4bcffa'}/>
										: <Icons name={'md-female'} size={22} color={'#f8a5c2'}/>
								}
							</View>
							<View style={[styles.menuListText]}>
								<Text style={styles.settingText}>{this.state.sex == 0 ? '男' : '女'}</Text>
							</View>
						</View>
						<View style={styles.menuList}>
							<View style={styles.icons}>
								<Icons name={'ios-git-network'} size={22} color={'#eccc68'}/>
							</View>
							<View style={[styles.menuListText]}>
								<Text style={styles.settingText}>{this.state.class}</Text>
							</View>
						</View>
					</View>
					{
						Path.deviceLock && !this.state.basic.demoAccount ? <View style={{backgroundColor: '#fff', marginTop: 10}}>
							<TouchableOpacity
								style={[styles.menuList, styles.menuTouch, {borderTopColor: 'transparent'}]}
								onPress={() => {
									HandlerOnceTap(
										() => {
											this.props.navigation.navigate('DeviceLock', {
												uuid: this.state.uuid,
												ticket: this.state.ticket,
												basic: this.state.basic,
											});
										}, "DeviceLock"
									)
								}}>
								<Text style={[styles.settingText, {flex: 1}]}>设备锁</Text>
								<Icons name={'ios-arrow-forward'} size={25} color={'#CCCCCC'}/>
							</TouchableOpacity>
						</View> : null
					}
					<View style={{backgroundColor: '#fff', marginTop: 10}}>
						<TouchableOpacity
							style={[styles.menuList, styles.menuTouch, {borderTopColor: 'transparent'}]}
							onPress={() => {
								HandlerOnceTap(
									() => {
										this.props.navigation.navigate('AboutOurs', {
											uuid: this.state.uuid,
											ticket: this.state.ticket,
											basic: this.state.basic,
										});
									}, "DeviceLock"
								)
							}}>
							<Text style={[styles.settingText, {flex: 1}]}>关于系统</Text>
							<View style={{flex: 1, flexDirection: 'row',alignItems:'center', justifyContent: 'flex-end'}}>
							{this.state.showNewVersion ? (
								<Text style={{
									backgroundColor:'tomato',
									paddingLeft:3,
									paddingRight:3,
									marginRight: 8,
									borderRadius:8,
									fontSize:10,
									color:'#FFFFFF'
								}}>{'NEW'}</Text>
							) : (
								<Text style={{
									lineHeight: 48,
									color: '#CCCCCC',
									fontSize: 14,
									paddingRight: 5
								}}>{'版本V' + deviceInfo.getVersion()}</Text>
							)}
								<Icons name={'ios-arrow-forward'} size={25} color={'#CCCCCC'}/>
							</View>
						</TouchableOpacity>
					</View>
					<View style={{backgroundColor: '#fff', marginTop: 10, height: 48, marginBottom: 10}}>
						<TouchableOpacity
							style={[styles.menuList, styles.menuTouch, {borderTopColor: 'transparent'}]}
							onPress={() => {
								HandlerOnceTap(this._logout, "logout")
							}}>
							<Text style={[styles.settingText, {flex: 1, textAlign: 'center'}]}>退出登录</Text>

						</TouchableOpacity>
					</View>
					{/*<TouchableOpacity onPress={()=>{HandlerOnceTap(this._logout,"logout")}}
				                  style={[styles.btn, {marginTop: 16}]}>
					<Text style={{fontSize: 15, color: '#fff'}}>退出登录</Text>
				</TouchableOpacity>*/}
				</ScrollView>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
		// paddingBottom: 20
	},
	menuList: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		height: 48,
	},
	icons: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		// backgroundColor:'tomato'
		// marginLeft: 12,
		// marginRight: 10,
	},
	menuListText: {
		flex: 1,
		height: 48,
		justifyContent: 'center',
		borderTopWidth: 1,
		borderTopColor: '#cecece',
	},
	iconRight: {
		width: 10,
		textAlign: 'right',
		marginRight: 12,
	},
	btn: {
		height: 43,
		borderRadius: 4,
		backgroundColor: '#f00',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 14,
		marginLeft: 12,
		marginRight: 12
	},
	settingText: {
		lineHeight: 48,
		color: '#333',
		fontSize: 14,
	},
	menuTouch: {
		paddingLeft: 15,
		paddingRight: 15,
		borderTopColor: '#cecece',
		borderTopWidth: 1,
	},
});
