define(["require", "exports", 'Site', 'Services/Service', 'knockout', 'md5', 'Services/Auth', 'knockout.mapping'], function (require, exports, site, service, ko, CryptoJS, auth, mapping) {
    function call(method, data) {
        /// <returns type="jQuery.Deferred"/>
        if (data === void 0) { data = undefined; }
        return service.callMethod(site.config.memberServiceUrl, method, data);
    }
    ;
    var token_name = 'token';
    var user_name = 'username';
    var MemberService = (function () {
        function MemberService() {
            //var site_ready = $.Deferred();
            //site.ready(() => {
            //    site_ready.resolve();
            //})
            var _this = this;
            this._userInfo = {};
            this.currentUserInfo = {
                NickName: ko.observable(),
                Country: ko.observable(),
                Province: ko.observable(),
                City: ko.observable(),
                HeadImageUrl: ko.observable(),
                Gender: ko.observable(),
            };
            auth.whenLogin(function () {
                _this.getUserInfo().done(function (userInfo) {
                    mapping.fromJS(userInfo, {}, _this.currentUserInfo);
                });
            });
        }
        MemberService.prototype.sendRegisterVerifyCode = function (mobile) {
            return call('Member/SendVerifyCode', { mobile: mobile, type: 'Register' }).then(function (data) {
                return data.SmsId;
            });
        };
        MemberService.prototype.sendBindingVerifyCode = function (mobile) {
            return call('Member/SendVerifyCode', { mobile: mobile, type: 'Binding' }).then(function (data) {
                return data.SmsId;
            });
        };
        MemberService.prototype.sendResetPasswordVerifyCode = function (mobile) {
            return call('Member/SendVerifyCode', { mobile: mobile, type: 'ResetPassword' }).then(function (data) {
                return data.SmsId;
            });
        };
        MemberService.prototype.sendVerifyCode = function (mobile, type) {
            return call('Member/SendVerifyCode', { mobile: mobile, type: type }).then(function (data) {
                return data.SmsId;
            });
        };
        MemberService.prototype.rebindMobile = function (oldMobile, oldSmsId, oldCode, mobile, smsId, code) {
            var data = { oldMobile: oldMobile, oldSmsId: oldSmsId, oldCode: oldCode, mobile: mobile, smsId: smsId, code: code };
            return call('Member/RebindMobile', data).done(function () {
                auth.currentMember.mobile(mobile);
            });
        };
        MemberService.prototype.bindMobile = function (mobile, smsId, code) {
            var data = { mobile: mobile, smsId: smsId, code: code };
            return call('Member/BindMobile', data);
        };
        MemberService.prototype.register = function (user, verifyCode, smsId) {
            /// <param name="user" type="models.user"/>
            /// <returns type="jQuery.Deferred"/>
            if (user == null)
                throw new Error('The argument of "user" cannt be null.');
            var data = user;
            data.verifyCode = verifyCode;
            data.smsId = smsId;
            return call('Member/Register', data);
        };
        MemberService.prototype.getUserInfo = function () {
            return call('UserInfo/Get').then(function (data) {
                data = data || {};
                data.HeadImageUrl = data.HeadImageUrl || 'Content/images/nophoto.png';
                data.Region = ko.computed(function () {
                    return data.Province + ' ' + data.City;
                });
                return data;
            });
        };
        MemberService.prototype.setUserInfo = function (userInfo) {
            if (!userInfo.Gender)
                userInfo.Gender = 'None';
            return call('UserInfo/Set', userInfo);
        };
        MemberService.prototype.changePassword = function (password) {
            var p = CryptoJS.MD5(password).toString();
            return call('Member/ChangePassword', { password: p }).done(function () { return auth.currentMember.passwordSetted(true); });
        };
        MemberService.prototype.changePaymentPassword = function (password) {
            var p = CryptoJS.MD5(password).toString();
            return call('Member/ChangePaymentPassword', { password: p }).done(function () { return auth.currentMember.paymentPasswordSetted(true); });
        };
        MemberService.prototype.mobileCanRegister = function (mobile) {
            return call('Member/IsMobileExists', { mobile: mobile }).then(function (value) {
                return !value;
            });
        };
        MemberService.prototype.isMobileExists = function (mobile) {
            return call('Member/IsMobileExists', { mobile: mobile });
        };
        MemberService.prototype.registerVerifyCodeSmsId = function (data) {
            return call('Member/CheckVerifyCode', data);
        };
        MemberService.prototype.checkVerifyCode = function (smsId, verifyCode, mobile) {
            return call('Member/CheckVerifyCode', { smsId: smsId, verifyCode: verifyCode, mobile: mobile });
        };
        MemberService.prototype.logout = function () {
            site.cookies.token('');
        };
        MemberService.prototype.resetPassword = function (smsId, verifyCode, mobile, password) {
            password = CryptoJS.MD5(password).toString();
            var data = { smsId: smsId, verifyCode: verifyCode, mobile: mobile, password: password };
            return call('Member/ResetPassword', data);
        };
        return MemberService;
    })();
    window['services']['member'] = window['services']['member'] || new MemberService();
    return window['services']['member'];
});
