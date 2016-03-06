/*global cordova, module*/

module.exports = {
    pay: function (paymentInfo, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "AliPay", "pay", [paymentInfo]);
    }
};
