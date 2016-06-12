var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'knockout.validation', 'Services/Member'], function (require, exports, ko_val, member) {
    "use strict";
    var Model = (function () {
        function Model() {
            var _this = this;
            this.mobile = ko.observable();
            this.verifyCode = ko.observable();
            this.password = ko.observable();
            this.confirmPassword = ko.observable();
            this.leftSeconds = ko.observable(0);
            this.smsId = ko.observable();
            this.sendVerifyCode = function () {
                var obj = { mobile: _this.mobile };
                var mobile_val = ko_val.group(obj);
                debugger;
                if (!obj['isValid']()) {
                    mobile_val.showAllMessages();
                    return $.Deferred().resolve();
                }
                return member.isMobileExists(_this.mobile()).pipe(function (value) {
                    if (value == false) {
                        return $.Deferred().reject();
                    }
                    _this.starButtonCounter();
                    member.sendResetPasswordVerifyCode(_this.mobile()).done(function (data) {
                        _this.smsId(data);
                    });
                });
            };
            this.submit = function () {
                if (!_this.isValid()) {
                    _this.validation.showAllMessages();
                    return;
                }
                return member.resetPassword(_this.smsId(), _this.verifyCode(), _this.mobile(), _this.password());
            };
            this.starButtonCounter = function () {
                _this.leftSeconds(60);
                _this.timeoutID = window.setInterval(function () {
                    var value = _this.leftSeconds() - 1;
                    _this.leftSeconds(value);
                    if (value == 0) {
                        window.clearInterval(_this.timeoutID);
                    }
                }, 1000);
            };
            this.mobile.extend({
                validation: [{
                        async: true,
                        validator: function (value, params, callback) {
                            if (!value)
                                return;
                            return member.isMobileExists(value).done(callback);
                        },
                        message: '该手机号码不存在'
                    }]
            });
            this.confirmPassword.extend({
                equal: {
                    onlyIf: function () {
                        return _this.password() != null;
                    },
                    params: this.password,
                    message: '两次输入的密码不同'
                }
            });
            this.password.extend({ required: true });
            this.mobile.extend({ required: true, mobile: true });
            this.verifyCode.extend({ required: true });
            this.validation = ko_val.group(this);
        }
        return Model;
    }());
    var AccountSecurityResetPasswordPage = (function (_super) {
        __extends(AccountSecurityResetPasswordPage, _super);
        function AccountSecurityResetPasswordPage(html) {
            _super.call(this, html);
            ko.applyBindings(new Model(), this.element);
        }
        return AccountSecurityResetPasswordPage;
    }(chitu.Page));
    exports.AccountSecurityResetPasswordPage = AccountSecurityResetPasswordPage;
});
