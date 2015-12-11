define(["require", "exports", 'Services/Auth', 'knockout', 'Services/Service'], function (require, exports, auth, ko, services) {
    requirejs(['css!content/User/AccountSecurity/Index']);
    var Model = (function () {
        function Model() {
            var _this = this;
            this.mobile = auth.currentMember.mobile;
            this.passwordSetted = auth.currentMember.passwordSetted;
            this.paymentPasswordSetted = auth.currentMember.paymentPasswordSetted;
            this.isWeiXin = ko.computed(function () {
                return services['weixin'] != null;
            });
            this.mobileBindingUrl = ko.computed(function () {
                if (!_this.mobile()) {
                    return '#User_AccountSecurity_MobileSetting';
                }
                return '#User_AccountSecurity_Setting_MobileBinding';
            });
        }
        return Model;
    })();
    return function (page) {
        var model = new Model();
        ko.applyBindings(model, page.nodes().content);
    };
});
