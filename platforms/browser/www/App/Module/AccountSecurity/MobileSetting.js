var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Auth', 'Services/Member', 'knockout.validation'], function (require, exports, auth, member, ko_val) {
    "use strict";
    var PageModel = (function () {
        function PageModel() {
            this.mobile = ko.observable();
            this.verifyCode = ko.observable();
            this.smsId = ko.observable();
        }
        PageModel.prototype.submit = function (model) {
            var val = ko_val.group(model);
            if (!model['isValid']()) {
                val.showAllMessages();
                return;
            }
            var deferred = member.bindMobile(model.mobile(), this.smsId(), model.verifyCode());
            deferred.done(function () {
                auth.currentMember.mobile(model.mobile());
            });
            return deferred;
        };
        PageModel.prototype.checkMobile = function (mobile) {
            var result = $.Deferred();
            member.mobileCanRegister(mobile).done(function (value) {
                if (value == false)
                    result.resolve('该手机号码已被注册');
                result.resolve(value);
            });
            return result;
        };
        return PageModel;
    }());
    return (function (_super) {
        __extends(AccountSecurityMobileSettingPage, _super);
        function AccountSecurityMobileSettingPage(html) {
            var _this = this;
            _super.call(this, html);
            this.model = new PageModel();
            requirejs(['UI/VerifyCodeButton'], function () {
                ko.applyBindings(_this.model, _this.element);
            });
        }
        return AccountSecurityMobileSettingPage;
    }(chitu.Page));
});
