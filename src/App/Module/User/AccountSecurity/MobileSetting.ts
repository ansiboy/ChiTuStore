/// <reference path='../../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../../Scripts/typings/chitu.d.ts' />

import auth = require('Services/Auth');
import member = require('Services/Member');

import ko_val = require('knockout.validation');


export = function (page: chitu.Page) {

    var model = {
        mobile: ko.observable<string>(),
        verifyCode: ko.observable<string>(),
        submit: () => {
            var val = ko_val.group(model);
            if (!model['isValid']()) {
                val.showAllMessages();
                return;
            }

            var deferred = member.bindMobile(model.mobile(), this.smsId(), model.verifyCode())
            deferred.done(() => {
                auth.currentMember.mobile(model.mobile());
            });

            return deferred;
        },
        checkMobile: (mobile: string) => {
            var result = $.Deferred<string | boolean>();
            member.mobileCanRegister(mobile).done((value: boolean) => {
                if (value == false)
                    result.resolve('该手机号码已被注册');

                result.resolve(value);
            });
            return result;
        },
        smsId: ko.observable<string>()
    };

    requirejs(['UI/VerifyCodeButton'], function () {
        ko.applyBindings(model, page.element);
    });
} 