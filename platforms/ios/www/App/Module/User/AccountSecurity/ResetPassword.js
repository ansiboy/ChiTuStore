/// <reference path='../../../../Scripts/typings/jquery.d.ts' />
/// <reference path='../../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../../Scripts/typings/chitu.d.ts' />
define(["require", "exports", 'knockout.validation', 'Services/Member'], function (require, exports, ko_val, member) {
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
    })();
    return function (page) {
        page.load.add(function () { });
        var model = new Model();
        ko.applyBindings(model, page.element);
    };
});
