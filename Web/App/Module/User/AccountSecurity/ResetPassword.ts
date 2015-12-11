import ko_val = require('knockout.validation');
import member = require('Services/Member');

class Model {
    constructor() {
        this.mobile.extend({
            validation: [{
                async: true,
                validator: function (value, params, callback) {
                    if (!value)
                        return;

                    return member.isMobileExists(value).done(callback);
                },
                message: '该手机号码不存在'
            }]
        });

        this.confirmPassword.extend({
            equal: {
                onlyIf: () => {
                    return this.password() != null;
                },
                params: this.password,
                message: '两次输入的密码不同'
            }
        })

        this.password.extend({ required: true });
        this.mobile.extend({ required: true, mobile: true })
        this.verifyCode.extend({ required: true })
        this.validation = ko_val.group(this);
    }
    validation: KnockoutValidationErrors
    timeoutID: number
    mobile = ko.observable<string>()
    verifyCode = ko.observable<string>()
    password = ko.observable<string>()
    confirmPassword = ko.observable()
    leftSeconds = ko.observable(0)
    smsId = ko.observable<string>()
    sendVerifyCode = () => {
        var obj = { mobile: this.mobile };
        var mobile_val = ko_val.group(obj);
        debugger;
        if (!obj['isValid']()) {
            mobile_val.showAllMessages();
            return $.Deferred().resolve();
        }

        return member.isMobileExists(this.mobile()).pipe((value) => {
            if (value == false) {
                return $.Deferred().reject();
            }

            this.starButtonCounter();
            member.sendResetPasswordVerifyCode(this.mobile()).done((data) => {
                this.smsId(data);
            });
        })
    }
    submit = () => {
        if (!(<any>this).isValid()) {
            this.validation.showAllMessages();
            return;
        }
        return member.resetPassword(this.smsId(), this.verifyCode(), this.mobile(), this.password());
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
}

export =function (page: chitu.Page) {
    page.load.add(() => { });

    var model = new Model();
    ko.applyBindings(model, page.node());
} 