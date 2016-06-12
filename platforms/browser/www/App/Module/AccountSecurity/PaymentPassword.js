define(["require", "exports", 'knockout.validation', 'Services/Member', 'md5'], function (require, exports, ko_val, member, CryptoJS) {
    "use strict";
    var Model = (function () {
        function Model(data) {
            var _this = this;
            this.password = ko.observable().extend({ required: true });
            this.confirm_password = ko.observable().extend({ required: true });
            this.save = function () {
                if (!_this['isValid']()) {
                    _this._val.showAllMessages(true);
                    return;
                }
                return member.changePaymentPassword(CryptoJS.MD5(_this.password()).toString());
            };
            this.confirm_password.extend({
                equal: {
                    onlyIf: function () {
                        return _this.password() != null;
                    },
                    params: this.password,
                    message: '两次输入的密码不同'
                }
            });
            this.data = data;
            this._val = ko_val.group(this);
        }
        return Model;
    }());
    var LoginPassword = (function () {
        function LoginPassword() {
            var _this = this;
            this.loadHtmlDeferred = $.Deferred();
            requirejs(['text!Module/User/AccountSecurity/PaymentPassword.html'], function (html) {
                _this.html = html;
                _this.loadHtmlDeferred.resolve(html);
            });
        }
        LoginPassword.prototype.loadHtml = function () {
            if (this.html)
                return $.Deferred().resolve(this.html);
            return this.loadHtmlDeferred;
        };
        LoginPassword.prototype.execute = function (element, data) {
            this.loadHtml().done(function (html) {
                element.innerHTML = html;
                var model = new Model(data);
                ko.applyBindings(model, element);
            });
        };
        return LoginPassword;
    }());
    return new LoginPassword();
});
