import site = require('Site');
import services = require('services/Service');
import ko = require('knockout');
import $ = require('jquery');
import CryptoJS = require('md5');
import auth = require('services/Auth');
import mapping = require('knockout.mapping');

function call(method, data = undefined) {
    /// <returns type="jQuery.Deferred"/>
    
    //data = data || {};
    //var url = site.config.memberServiceUrl + method
    //data.$appToken = site.cookies.appToken();
    //data.$token = site.cookies.token();
    //return $.ajax({
    //    url: url,
    //    data: data,
    //    method: 'get',
    //    dataType: 'json'
    //});

    return services.callMethod(services.config.memberServiceUrl, method, data);
};


var token_name = 'token';
var user_name = 'username';

interface UserInfo {
    NickName: string,
    Country: string,
    Province: string,
    City: string,
    HeadImageUrl: string,
    Gender: string,
}

class MemberService {
    private _userInfo: UserInfo = <UserInfo>{};

    constructor() {
        //var site_ready = $.Deferred();
        //site.ready(() => {
        //    site_ready.resolve();
        //})
        //debugger;
        //this.isLogined().done((login_result) => {
        //    if (login_result) {
        //        this.logined.fire();
        //    }
        //});


        //this.logined.add(() => {
        //    this.getMember().done((data) => {
        //        this.currentMember.mobile(data.Mobile)
        //    })
        //});

        auth.whenLogin(() => {
            this.getUserInfo().done((userInfo) => {
                mapping.fromJS(userInfo, {}, this.currentUserInfo);
            })
        });
    }

    currentUserInfo = {
        NickName: ko.observable<string>(),
        Country: ko.observable<string>(),
        Province: ko.observable<string>(),
        City: ko.observable<string>(),
        HeadImageUrl: ko.observable<string>(),
        Gender: ko.observable<string>(),
    }
    //currentMember: Member = {
    //    mobile: ko.observable<string>()
    //}
    //logouted = $.Callbacks()
    //logined = $.Callbacks()
    //login(username: string, password: string): JQueryPromise<any> {
    //    password = CryptoJS.MD5(password).toString();
    //    var result = call('Member/Login', { username: username, password: password });

    //    var member = this;
    //    result.then(function (data) {
    //        site.cookies.token(data.UserToken);
    //        return data;

    //    }).done($.proxy(function (data) {
    //        $.extend(data, { UserName: this._username, Password: this._password });
    //        member.logined.fire();

    //    }, { _username: username, _password: password }));

    //    return result;
    //}
    //isLogined() {
    //    /// <returns type="jQuery.Deferred"/>
    //    var value = site.cookies.token() != null && site.cookies.token() != '';

    //    return $.Deferred().resolve(value);
    //}
    sendRegisterVerifyCode(mobile) {
        return call('Member/SendVerifyCode', { mobile: mobile, type: 'Register' }).then(function (data) {
            return data.SmsId;
        });
    }
    sendBindingVerifyCode(mobile) {
        return call('Member/SendVerifyCode', { mobile: mobile, type: 'Binding' }).then(function (data) {
            return data.SmsId;
        });
    }
    sendResetPasswordVerifyCode(mobile: string) {
        return call('Member/SendVerifyCode', { mobile: mobile, type: 'ResetPassword' }).then(function (data) {
            return data.SmsId;
        });
    }
    sendVerifyCode(mobile: string, type: string) {
        return call('Member/SendVerifyCode', { mobile: mobile, type }).then(function (data) {
            return data.SmsId;
        });
    }
    rebindMobile(oldMobile: string, oldSmsId: string, oldCode: string, mobile: string, smsId: string, code: string) {
        var data = { oldMobile, oldSmsId, oldCode, mobile, smsId, code };
        return call('Member/RebindMobile', data).done(() => {
            auth.currentMember.mobile(mobile);
        });
    }
    bindMobile(mobile, smsId, code) {
        var data = { mobile, smsId, code };
        return call('Member/BindMobile', data);
    }
    register(user, verifyCode, smsId) {
        /// <param name="user" type="models.user"/>
        /// <returns type="jQuery.Deferred"/>

        if (user == null)
            throw new Error('The argument of "user" cannt be null.');

        var data = user; //ko.mapping.toJS(user);
        data.verifyCode = verifyCode;
        data.smsId = smsId;

        return call('Member/Register', data);
    }
    getUserInfo(): JQueryPromise<UserInfo> {
        /// <returns type="jQuery.Deferred"/>
        return call('UserInfo/Get').then(function (data) {
            data = data || {};
            data.HeadImageUrl = data.HeadImageUrl || 'Content//nophoto.png';
            data.Region = ko.computed(() => {
                return data.Province + ' ' + data.City;
            });
            return data;
        });
    }
    setUserInfo(userInfo: UserInfo) {
        if (!userInfo.Gender)
            userInfo.Gender = 'None';

        return call('UserInfo/Set', userInfo);
    }
    changePassword(password) {
        var p = CryptoJS.MD5(password).toString();
        return call('Member/ChangePassword', { password: p }).done(() => auth.currentMember.passwordSetted(true));
    }
    changePaymentPassword(password) {
        var p = CryptoJS.MD5(password).toString();
        return call('Member/ChangePaymentPassword', { password: p }).done(() => auth.currentMember.paymentPasswordSetted(true));
    }
    mobileCanRegister(mobile: string): JQueryPromise<boolean> {
        return call('Member/IsMobileExists', { mobile }).then((value: boolean) => {
            return !value
        });
    }
    isMobileExists(mobile: string): JQueryPromise<boolean> {
        return call('Member/IsMobileExists', { mobile });
    }
    registerVerifyCodeSmsId(data): JQueryPromise<any> {
        return call('Member/CheckVerifyCode', data);
    }
    checkVerifyCode(smsId, verifyCode, mobile): JQueryPromise<boolean> {
        return call('Member/CheckVerifyCode', { smsId, verifyCode, mobile });
    }
    logout() {
        //site.cookies.token('');
        site.storage.token = '';
    }
    resetPassword(smsId: string, verifyCode: string, mobile: string, password: string) {
        password = CryptoJS.MD5(password).toString();
        var data = { smsId, verifyCode, mobile, password };
        return call('Member/ResetPassword', data);
    }
}


window['services']['member'] = window['services']['member'] || new MemberService();
export =<MemberService>window['services']['member'];
