cordova.define("cordova-plugin-android-native-pdfviewer.AndroidNativePdfViewer", function(require, exports, module) {
var exec = require('cordova/exec');

exports.openPdfUrl = function(url, header,options,success, error) {
    exec(success, error, "AndroidNativePdfViewer", "openPdfUrl", [url,header,options]);
};

});
