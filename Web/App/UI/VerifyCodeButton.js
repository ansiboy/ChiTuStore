define(["require", "exports", 'knockout', 'Services/Member', 'knockout.validation', 'Site'], function (require, exports, ko, member, ko_val, site) {
    var Model = (function () {
        function Model(args) {
            var _this = this;
            this.timeoutID = 0;
            this.leftSeconds = ko.observable(0);
            this.buttonText = ko.computed(function () {
                if (_this.leftSeconds() == 0) {
                    return '发送验证码';
                }
                return '发送验证码(' + _this.leftSeconds() + ')';
            });
            this.sendVerifyCode = function () {
                debugger;
                var obj = { mobile: _this.args.mobile };
                var val = ko_val.group(obj);
                if (!obj['isValid']()) {
                    val.showAllMessages();
                    return $.Deferred().reject();
                }
                var result = _this.args.checkMobile(_this.args.mobile()).pipe(function (mobileAllowed) {
                    if (!mobileAllowed)
                        return $.Deferred().reject();
                    return member.sendVerifyCode(_this.args.mobile(), _this.args.verifyType);
                }).done(function (data) {
                    _this.starButtonCounter();
                    _this.smsId(data);
                });
                return result;
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
            this.smsId = ko.pureComputed({
                write: function (value) {
                    site.cookies.set_value(_this.smsIdName, value);
                },
                read: function () {
                    return site.cookies.get_value(_this.smsIdName);
                }
            });
            var mobile_error = '该手机号码不允许使用';
            args.mobile.extend({ required: true, mobile: true });
            args.mobile.extend({
                validation: [{
                        async: true,
                        validator: function (value, params, callback) {
                            return args.checkMobile(value).done(function (chekcResult) {
                                if (typeof chekcResult == 'string') {
                                    mobile_error = chekcResult;
                                    return callback(false);
                                }
                                return callback(chekcResult);
                            });
                        },
                        message: function () {
                            return mobile_error;
                        }
                    }]
            });
            args.verifyCode.extend({
                required: true,
                validation: [{
                        async: true,
                        validator: function (value, params, callback) {
                            value = value || '';
                            var VERIFY_CODE_MIN_LENGTH = 4;
                            if (value.length < VERIFY_CODE_MIN_LENGTH) {
                                return callback(false);
                            }
                            if (!_this.smsId()) {
                                return callback(false);
                            }
                            return member.checkVerifyCode(_this.smsId(), args.verifyCode(), args.mobile()).done(function (checkResult) {
                                callback(checkResult);
                            });
                        },
                        message: '验证码不正确'
                    }]
            });
            this.args = args;
        }
        Object.defineProperty(Model.prototype, "smsIdName", {
            get: function () {
                return this.args.verifyType + '_' + 'SmsId';
            },
            enumerable: true,
            configurable: true
        });
        return Model;
    })();
    ko.components.register('verify-code-button', {
        viewModel: function (params) {
            if (params.checkMobile == null)
                params.checkMobile = function (mobile) { return $.Deferred().resolve(true); };
            var model = new Model(params);
            $.extend(this, model);
        },
        template: '<button data-bind="click:sendVerifyCode, disable:leftSeconds()>0, text:buttonText" \
             type="button" \
             class="btn btn-block btn-warning"> 发送验证码 </button>'
    });
});
