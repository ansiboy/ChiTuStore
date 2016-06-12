define(["require", "exports", 'knockout.validation', 'Services/Member'], function (require, exports, ko_val, member) {
    "use strict";
    var Model = (function () {
        function Model(data) {
            var _this = this;
            this.password = ko.observable();
            this.confirm_password = ko.observable();
            this.save = function () {
                if (_this._val == null)
                    return;
                if (!_this['isValid']()) {
                    _this._val.showAllMessages(true);
                    return;
                }
                return member.changePassword(_this.password());
            };
            this.password.extend({ required: true });
            this.confirm_password.extend({ required: true });
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
            window.setTimeout(function () { return _this._val = ko_val.group(_this); }, 100);
        }
        Object.defineProperty(Model.prototype, "val", {
            get: function () {
                return this._val;
            },
            enumerable: true,
            configurable: true
        });
        return Model;
    }());
    var LoginPassword = (function () {
        function LoginPassword() {
            var _this = this;
            this.loadHtmlDeferred = $.Deferred();
            requirejs(['text!Module/User/AccountSecurity/LoginPassword.html'], function (html) {
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
