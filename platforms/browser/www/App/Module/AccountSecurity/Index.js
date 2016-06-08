var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
                    return '#AccountSecurity_MobileSetting';
                }
                return '#AccountSecurity_Setting_MobileBinding';
            });
        }
        return Model;
    })();
    return (function (_super) {
        __extends(AccountSecurityIndexPage, _super);
        function AccountSecurityIndexPage(html) {
            _super.call(this, html);
            this.model = new Model();
            ko.applyBindings(this.model, this.element);
        }
        return AccountSecurityIndexPage;
    })(chitu.Page);
});
