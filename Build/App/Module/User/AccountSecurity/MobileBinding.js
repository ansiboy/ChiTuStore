define(["require", "exports", 'Services/Member', 'knockout.validation', 'Application'], function (require, exports, member, ko_val, app) {
    requirejs(['css!content/User/AccountSecurity/MobileBinding']);
    var Model = (function () {
        function Model(data) {
            var _this = this;
            this.status = ko.observable('start');
            this.errorMessage = ko.observable();
            this.leftSeconds = ko.observable(0);
            this.verifyCode = ko.observable();
            this.mobile = ko.observable().extend({ required: true });
            this.smsId = ko.observable();
            this.sendVerifyCode = function () {
                if (!_this['isValid']()) {
                    _this._val.showAllMessages();
                    return;
                }
                return member.mobileCanRegister(_this.mobile())
                    .pipe(function (data) {
                    if (data == false) {
                        _this.errorMessage('该手机号码已被绑定');
                        return $.Deferred().reject();
                    }
                    return member.sendBindingVerifyCode(_this.mobile());
                })
                    .done(function (data) {
                    _this.starButtonCounter();
                    _this.smsId(data);
                });
            };
            this.enableBind = ko.computed(function () {
                return _this.errorMessage() == null;
            });
            this.bind = function () {
                return member.rebindMobile(_this.data.mobile, _this.data.smsId, _this.data.verifyCode, _this.mobile(), _this.smsId(), _this.verifyCode())
                    .done(function () { return _this.status('done'); });
            };
            this.back = function () {
                app.back();
            };
            this.data = data;
            this._val = ko_val.group(this);
            this.verifyCode.subscribe(function (value) {
                var VERIFY_CODE_MIN_LENGTH = 4;
                value = (value || '').trim();
                if (value.length >= VERIFY_CODE_MIN_LENGTH && _this.smsId() != null) {
                    member.checkVerifyCode(_this.smsId(), _this.verifyCode(), _this.mobile()).done(function (data) {
                        if (data === true)
                            _this.errorMessage(null);
                        else
                            _this.errorMessage('验证码不正确');
                    });
                }
            });
        }
        Model.prototype.starButtonCounter = function () {
            var _this = this;
            this.leftSeconds(60);
            this.timeoutID = window.setInterval(function () {
                var value = _this.leftSeconds() - 1;
                _this.leftSeconds(value);
                if (value == 0) {
                    window.clearInterval(_this.timeoutID);
                }
            }, 1000);
        };
        return Model;
    })();
    var MobileBinding = (function () {
        function MobileBinding() {
            var _this = this;
            this.loadHtmlDeferred = $.Deferred();
            requirejs(['text!Module/User/AccountSecurity/MobileBinding.html'], function (html) {
                _this.html = html;
                _this.loadHtmlDeferred.resolve(html);
            });
        }
        MobileBinding.prototype.loadHtml = function () {
            if (this.html)
                return $.Deferred().resolve(this.html);
            return this.loadHtmlDeferred;
        };
        MobileBinding.prototype.execute = function (element, data) {
            this.loadHtml().done(function (html) {
                element.innerHTML = html;
                var model = new Model(data);
                ko.applyBindings(model, element);
            });
        };
        return MobileBinding;
    })();
    return new MobileBinding();
});
