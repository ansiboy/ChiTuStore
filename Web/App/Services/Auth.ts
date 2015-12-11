import site = require('Site');
import service = require('Services/Service');
import CryptoJS = require('md5');
import ko = require('knockout');

class AuthService {
    constructor() {
        this.whenLogin(() => {
            this.getMember().done((data) => {
                this.currentMember.mobile(data.Mobile)
                this.currentMember.passwordSetted(data.PasswordSetted)
                this.currentMember.paymentPasswordSetted(data.PaymentPasswordSetted)
            })
        })
    }

    currentMember = {
        mobile: ko.observable<string>(),
        passwordSetted: ko.observable<boolean>(),
        paymentPasswordSetted: ko.observable<boolean>(),
    }

    whenLogin(callback: Function) {
        this.isLogined().done((value) => {
            if (value) {
                callback();
            }

            this.logined.add(callback);
        })
    }

    logouted = $.Callbacks()
    logined = $.Callbacks()
    login(username: string, password: string): JQueryPromise<any> {
        password = CryptoJS.MD5(password).toString();
        var result = service.callMethod(site.config.memberServiceUrl, 'Member/Login', { username: username, password: password });

        var member = this;
        result.then(function (data) {
            site.cookies.token(data.UserToken);
            return data;

        }).done($.proxy(function (data) {
            $.extend(data, { UserName: this._username, Password: this._password });
            member.logined.fire();

        }, { _username: username, _password: password }));

        return result;
    }
    isLogined(): JQueryPromise<boolean> {
        /// <returns type="jQuery.Deferred"/>
        var result = $.Deferred();
        site.ready(() => {
            var value = site.cookies.token() != null && site.cookies.token() != '';
            result.resolve(value);
        })
        return result;
    }
    getMember(): JQueryPromise<any> {
        return service.callMethod(site.config.memberServiceUrl, 'Member/GetMember');
    }

}

window['services']['auth'] = window['services']['auth'] || new AuthService();
export = <AuthService>(window['services']['auth']);

