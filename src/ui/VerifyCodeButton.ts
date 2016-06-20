
import ko = require('knockout');
import member = require('services/Member');
import ko_val = require('knockout.validation');
import site = require('Site');

interface Arguments {
    checkMobile: (mobile: string) => JQueryPromise<boolean>
    verifyType: string
    mobile: KnockoutObservable<string>
    verifyCode: KnockoutObservable<string>
}

interface Result {
    smsId: KnockoutObservable<string>
}

class Model {
    constructor(args: Arguments) {
        //window.setTimeout(() => {
        var mobile_error: string = '该手机号码不允许使用';
        args.mobile.extend({ required: true, mobile: true });
        args.mobile.extend({
            validation: [{
                async: true,
                validator: function (value, params, callback) {
                    return args.checkMobile(value).done((chekcResult: string | boolean) => {
                        if (typeof chekcResult == 'string') {
                            mobile_error = <string>chekcResult;
                            return callback(false);
                        }
                        return callback(chekcResult);
                    });
                },
                message: function () {
                    return mobile_error;
                }
            }]
        });

        args.verifyCode.extend({
            required: true,
            validation: [{
                async: true,
                validator: (value, params, callback) => {
                    value = value || '';
                    const VERIFY_CODE_MIN_LENGTH = 4;
                    if (value.length < VERIFY_CODE_MIN_LENGTH) {
                        return callback(false);
                    }
                    if (!this.smsId()) {
                        return callback(false);
                    }
                    return member.checkVerifyCode(this.smsId(), args.verifyCode(), args.mobile()).done((checkResult) => {
                        callback(checkResult);
                    });
                    //}
                },
                message: '验证码不正确'
            }]
        });
        //}, 1000);

        this.args = args;
    }
    args: Arguments
    //get val(): KnockoutValidationErrors {
    //    if (!this['_val']) {
    //        this['_val'] = ko_val.group(this.args);
    //    }
    //    return this['_val'];
    //}
    timeoutID = 0
    leftSeconds = ko.observable<number>(0)
    buttonText = ko.computed(() => {
        if (this.leftSeconds() == 0) {
            return '发送验证码';
        }
        return '发送验证码(' + this.leftSeconds() + ')';
    })
    sendVerifyCode = () => {
        debugger;

        var obj = { mobile: this.args.mobile };
        var val = ko_val.group(obj);
        if (!obj['isValid']()) {
            val.showAllMessages();
            return $.Deferred().reject();
        }

        var result = this.args.checkMobile(this.args.mobile()).pipe((mobileAllowed) => {
            if (!mobileAllowed)
                return $.Deferred().reject();

            return member.sendVerifyCode(this.args.mobile(), this.args.verifyType);
        }).done((data) => {
            this.starButtonCounter();
            this.smsId(data);
        })

        return result;
    }
    starButtonCounter = () => {
        this.leftSeconds(60);
        this.timeoutID = window.setInterval(() => {
            var value = this.leftSeconds() - 1;
            this.leftSeconds(value);
            if (value == 0) {
                window.clearInterval(this.timeoutID);
            }
        }, 1000);
    }
    get smsIdName(): string {
        return this.args.verifyType + '_' + 'SmsId';
    }
    smsId = ko.pureComputed({
        write: (value: any) => {
            site.cookies.set_value(this.smsIdName, value)
        },
        read: () => {
            return site.cookies.get_value(this.smsIdName);
        }
    });
}

ko.components.register('verify-code-button', {
    viewModel: function (params: Arguments) {
        if (params.checkMobile == null)
            params.checkMobile = (mobile: string) => $.Deferred().resolve(true);

        var model = new Model(params);
        $.extend(this, model);
    },
    template:
    '<button data-bind="click:sendVerifyCode, disable:leftSeconds()>0, text:buttonText" \
             type="button" \
             class="btn btn-block btn-warning"> 发送验证码 </button>'
});

