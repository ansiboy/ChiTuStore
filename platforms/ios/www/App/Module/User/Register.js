var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'Services/Auth', 'Services/Member', 'Services/Service', 'knockout.validation', 'knockout.mapping', 'knockout'], function (require, exports, app, auth, member, services, ko_val, mapping, ko) {
    "use strict";
    var PageModel = (function () {
        function PageModel() {
            var _this = this;
            this.user = {
                mobile: ko.observable().extend({
                    required: true,
                    validation: [{
                            validator: function (value, params) {
                                value = value || '';
                                return value.length == 11 && /^1[34578]\d{9}$/.test(value);
                            },
                            message: '请输入正确的手机号码'
                        }]
                }),
                openid: ko.observable(),
                verifyCode: ko.observable().extend({ required: true }),
                password: ko.observable().extend({ required: true }),
                confirmPassword: ko.observable().extend({ required: true })
            };
            this.leftSeconds = ko.observable(0);
            this.user.confirmPassword.extend({ equal: this.user.password });
            this.user.mobile.extend({
                validation: [{
                        async: true,
                        validator: function (value, params, callback) {
                            return member.mobileCanRegister(value).done(callback);
                        },
                        message: '该手机号码已被注册'
                    }]
            });
            this.user.verifyCode.extend({
                validation: [{
                        async: true,
                        validator: function (value, params, callback) {
                            return member.checkVerifyCode($.cookie('RegisterVerifyCodeSmsId'), value, _this.user.mobile()).done(function () { return callback; });
                        },
                        message: '验证码不正确或已失效'
                    }]
            });
            this.validation = ko_val.group(this.user);
        }
        PageModel.prototype.register = function (model) {
            if (!model.user['isValid']()) {
                model.validation.showAllMessages();
                return $.Deferred().resolve();
            }
            if (services['weixin']) {
                var openid = services['weixin'].openid();
                model.user.openid(openid);
            }
            var verifyCode = model.user.verifyCode();
            return member
                .register(mapping.toJS(model.user), verifyCode, $.cookie('RegisterVerifyCodeSmsId'))
                .pipe(function () {
                return auth.login(model.user.mobile(), model.user.password());
            })
                .done(function () {
                location.href = "#User_Index";
            });
        };
        PageModel.prototype.back = function () {
            app.back().fail(function () {
                app.redirect('#Home_Index');
            });
        };
        PageModel.prototype.sendVerifyCode = function (model) {
            var obj = { mobile: model.user.mobile };
            var mobile_val = ko_val.group(obj);
            if (!obj['isValid']()) {
                mobile_val.showAllMessages();
                return $.Deferred().resolve();
            }
            model.starButtonCounter(model);
            return member.sendRegisterVerifyCode(model.user.mobile()).done(function (data) {
                $.cookie('RegisterVerifyCodeSmsId', data);
            });
        };
        PageModel.prototype.starButtonCounter = function (model) {
            model.leftSeconds(60);
            model.timeoutID = window.setInterval(function () {
                var value = model.leftSeconds() - 1;
                model.leftSeconds(value);
                if (value == 0) {
                    window.clearInterval(model.timeoutID);
                }
            }, 1000);
        };
        return PageModel;
    }());
    var RegisterPage = (function (_super) {
        __extends(RegisterPage, _super);
        function RegisterPage(html) {
            _super.call(this, html);
            this.model = new PageModel();
            this.load.add(function (sender, args) {
                ko.applyBindings(sender.model, sender.element);
            });
        }
        return RegisterPage;
    }(chitu.Page));
    return RegisterPage;
});
