
import auth = require('services/Auth');
import member = require('services/Member');

import ko_val = require('knockout.validation');

class PageModel {
    mobile = ko.observable<string>();
    verifyCode = ko.observable<string>();
    smsId = ko.observable<string>();

    submit(model: PageModel) {
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
    }
    checkMobile(mobile: string) {
        var result = $.Deferred<string | boolean>();
        member.mobileCanRegister(mobile).done((value: boolean) => {
            if (value == false)
                result.resolve('该手机号码已被注册');

            result.resolve(value);
        });
        return result;
    }
}

export = class AccountSecurityMobileSettingPage extends chitu.Page {
    private model: PageModel;
    constructor(html) {
        super(html);
        this.model = new PageModel();
        requirejs(['ui/VerifyCodeButton'], () => {
            ko.applyBindings(this.model, this.element);
        });
    }
}


// export = function (page: chitu.Page) {

//     var model = {
//         mobile: ko.observable<string>(),
//         verifyCode: ko.observable<string>(),
//         submit: () => {
//             var val = ko_val.group(model);
//             if (!model['isValid']()) {
//                 val.showAllMessages();
//                 return;
//             }

//             var deferred = member.bindMobile(model.mobile(), this.smsId(), model.verifyCode())
//             deferred.done(() => {
//                 auth.currentMember.mobile(model.mobile());
//             });

//             return deferred;
//         },
//         checkMobile: (mobile: string) => {
//             var result = $.Deferred<string | boolean>();
//             member.mobileCanRegister(mobile).done((value: boolean) => {
//                 if (value == false)
//                     result.resolve('该手机号码已被注册');

//                 result.resolve(value);
//             });
//             return result;
//         },
//         smsId: ko.observable<string>()
//     };

//     requirejs(['ui/VerifyCodeButton'], function () {
//         ko.applyBindings(model, page.element);
//     });
// } 