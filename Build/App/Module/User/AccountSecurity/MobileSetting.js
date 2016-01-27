/// <reference path='../../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'Services/Auth', 'Services/Member', 'knockout.validation'], function (require, exports, auth, member, ko_val) {
    return function (page) {
        var _this = this;
        var model = {
            mobile: ko.observable(),
            verifyCode: ko.observable(),
            submit: function () {
                var val = ko_val.group(model);
                if (!model['isValid']()) {
                    val.showAllMessages();
                    return;
                }
                var deferred = member.bindMobile(model.mobile(), _this.smsId(), model.verifyCode());
                deferred.done(function () {
                    auth.currentMember.mobile(model.mobile());
                });
                return deferred;
            },
            checkMobile: function (mobile) {
                var result = $.Deferred();
                member.mobileCanRegister(mobile).done(function (value) {
                    if (value == false)
                        result.resolve('该手机号码已被注册');
                    result.resolve(value);
                });
                return result;
            },
            smsId: ko.observable()
        };
        requirejs(['UI/VerifyCodeButton'], function () {
            ko.applyBindings(model, page.node());
        });
    };
});
