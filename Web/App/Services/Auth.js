define(["require", "exports", 'Site', 'Services/Service', 'md5', 'knockout'], function (require, exports, site, services, CryptoJS, ko) {
    var AuthService = (function () {
        function AuthService() {
            var _this = this;
            this.currentMember = {
                mobile: ko.observable(),
                passwordSetted: ko.observable(),
                paymentPasswordSetted: ko.observable(),
            };
            this.logouted = $.Callbacks();
            this.logined = $.Callbacks();
            this.whenLogin(function (data) {
                _this.getMember().done(function (data) {
                    _this.currentMember.mobile(data.Mobile);
                    _this.currentMember.passwordSetted(data.PasswordSetted);
                    _this.currentMember.paymentPasswordSetted(data.PaymentPasswordSetted);
                });
            });
        }
        AuthService.prototype.whenLogin = function (callback) {
            var _this = this;
            this.isLogined().done(function (value) {
                if (value) {
                    callback();
                }
                _this.logined.add(callback);
            });
        };
        AuthService.prototype.login = function (username, password) {
            password = CryptoJS.MD5(password).toString();
            var result = services.callMethod(services.config.memberServiceUrl, 'Member/Login', { username: username, password: password });
            var member = this;
            result.then(function (data) {
                site.storage.token = data.UserToken;
                return data;
            }).done($.proxy(function (data) {
                $.extend(data, { UserName: this._username, Password: this._password });
                member.logined.fire(data);
            }, { _username: username, _password: password }));
            return result;
        };
        AuthService.prototype.isLogined = function () {
            var result = $.Deferred();
            var value = site.storage.token != null && site.storage.token != '';
            result.resolve(value);
            return result;
        };
        AuthService.prototype.getMember = function () {
            return services.callMethod(services.config.memberServiceUrl, 'Member/GetMember');
        };
        return AuthService;
    })();
    window['services']['auth'] = window['services']['auth'] || new AuthService();
    return (window['services']['auth']);
});
