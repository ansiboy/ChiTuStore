import ko_val = require('knockout.validation');
import member = require('Services/Member');
import CryptoJS = require('md5');

interface PreviousStepData {
    mobile: string
    verifyCode: string
    smsId: string
}

class Model {
    private data: PreviousStepData
    private _val: KnockoutValidationErrors

    password = ko.observable<string>().extend({ required: true });
    confirm_password = ko.observable<string>().extend({ required: true });

    constructor(data: PreviousStepData) {
        this.confirm_password.extend({
            equal: {
                onlyIf: () => {
                    return this.password() != null;
                },
                params: this.password,
                message: '两次输入的密码不同'
            }
        });

        this.data = data;
        this._val = ko_val.group(this);
    }

    save = () => {
        if (!this['isValid']()) {
            this._val.showAllMessages(true);
            return;
        }

        return member.changePaymentPassword(CryptoJS.MD5(this.password()).toString());
    }
}

class LoginPassword {
    private html: string
    private loadHtmlDeferred = $.Deferred<string>()

    constructor() {
        requirejs(['text!Module/User/AccountSecurity/PaymentPassword.html'], (html) => {
            this.html = html;
            this.loadHtmlDeferred.resolve(html);
        })
    }

    private loadHtml(): JQueryDeferred<string> {
        if (this.html)
            return $.Deferred().resolve(this.html);

        return this.loadHtmlDeferred;
    }

    execute(element: HTMLElement, data: PreviousStepData) {
        this.loadHtml().done((html) => {
            element.innerHTML = html;
            var model = new Model(data);
            ko.applyBindings(model, element);
        })
    }
}

export = new LoginPassword();