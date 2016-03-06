cordova.define("wang.imchao.plugin.alipay.alipay", function(require, exports, module) {
/*global cordova, module*/

module.exports = {
    pay: function (paymentInfo, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "AliPay", "pay", [paymentInfo]);
    }
};

});
