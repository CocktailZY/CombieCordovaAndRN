import FileSystem from "react-native-filesystem";
import {
    NativeModules
} from 'react-native';

var userid = "";
var photo_path = "";//头像路径
var image_path = "";//图片路径
var file_path = "";//文件路径
export default FileUtil = {
    async writeToFile(contents) {
        await FileSystem.writeToFile('my-directory/my-file.txt', contents,FileSystem.storage.important);
        //console.log('file is written');
        return true;
    },

    async readFile() {
        var response_temp;
        await FileSystem.readFile('my-directory/my-file.txt',FileSystem.storage.important).then((response) => {
            return response;
        }).then((responseText) => {
            //  callback(JSON.parse(responseText));
            response_temp = responseText;
        }).done();
        return response_temp;
    },

    async deleteFile() {
        await FileSystem.delete('my-directory/my-file.txt',FileSystem.storage.important);
        // console.log('file is deleted');
        return true;
    },

    async checkIfFileExists() {
        const fileExists = await FileSystem.fileExists('my-directory/my-file.txt',FileSystem.storage.important);
        const directoryExists = await FileSystem.directoryExists('my-directory/my-file.txt',FileSystem.storage.important);
        return fileExists;
        // console.log(`directory exists: ${directoryExists}`);
    },
    initConstant(userId){
        //console.log("初始化环境...");
        userid = userId;
        photo_path = "/im/"+userid+"/photo";//头像路径
        image_path = "/im/"+userid+"/images";//图片路径
        file_path = "/im/"+userid+"/file";//文件路径
    },
    initFolder(userId){
        this.initConstant(userId);
        //console.log("头像路径："+photo_path);
        NativeModules.IMModule.createFolder(photo_path);
        NativeModules.IMModule.createFolder(image_path);
        NativeModules.IMModule.createFolder(file_path);
    }
}
