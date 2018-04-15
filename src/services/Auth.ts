import site = require('Site');
import services = require('services/Service');
import CryptoJS = require('md5');
import ko = require('knockout');

class AuthService {
    constructor() {
        this.whenLogin((data) => {
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
        //password = CryptoJS.MD5(password).toString();
        let data = { username, password };
        //let url = `UserMember/User/Login`;
        var result = services.callMethod(services.config.memberServiceUrl, 'User/Login', data) //services.callMethod(services.config.memberServiceUrl, 'Member/Login', { username: username, password: password });

        var member = this;
        result.then((data) => {
            debugger;
            //site.cookies.token(data.UserToken);
            site.storage.token = data.token;
            return data;

        }).done($.proxy(function (data) {
            $.extend(data, { UserName: this._username, Password: this._password });
            member.logined.fire(data);

        }, { _username: username, _password: password }));

        return result;
    }
    isLogined(): JQueryPromise<boolean> {
        var result = $.Deferred<boolean>();
        var value = site.storage.token != null && site.storage.token != ''; //site.cookies.token() != null && site.cookies.token() != '';
        result.resolve(value);

        return result;
    }
    getMember(): JQueryPromise<any> {
        return services.get(services.config.memberServiceUrl, 'User/CurrentUserInfo');
    }

}

window['services']['auth'] = window['services']['auth'] || new AuthService();
export = <AuthService>(window['services']['auth']);

