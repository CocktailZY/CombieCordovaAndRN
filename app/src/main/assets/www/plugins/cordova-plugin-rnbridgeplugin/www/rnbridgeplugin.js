cordova.define("cordova-plugin-rnbridgeplugin.RnBridgePlugin", function(require, exports, module) {
	module.exports = {
		jumpToRnIndex: function(successCallback, errorCallback) {
			cordova.exec(successCallback, errorCallback, 'RnBridgePlugin', 'jumpToRNIndex', []);
		}
	};

});