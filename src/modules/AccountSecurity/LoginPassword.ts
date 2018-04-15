import ko_val = require('knockout.validation');
import member = require('services/Member');

interface PreviousStepData {
    mobile: string
    verifyCode: string
    smsId: string
}

class Model {
    private data: PreviousStepData
    private _val: KnockoutValidationErrors

    password = ko.observable<string>();//.extend({ required: true });
    confirm_password = ko.observable<string>();//.extend({ required: true });

    constructor(data: PreviousStepData) {

        this.password.extend({ required: true });
        this.confirm_password.extend({ required: true });
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
        //==========================================================
        // 在绑定之后再设置验证
        window.setTimeout(() => this._val = ko_val.group(this), 100);
        //==========================================================
    }

    save = () => {
        if (this._val == null)
            return;

        if (!this['isValid']()) {
            this._val.showAllMessages(true);
            return;
        }

        return member.changePassword(this.password());
    }

    get val() {
        return this._val;
    }
}

class LoginPassword {
    private html: string
    private loadHtmlDeferred = $.Deferred<string>()

    constructor() {
        requirejs(['text!modules/AccountSecurity/LoginPassword.html'], (html) => {
            this.html = html;
            this.loadHtmlDeferred.resolve(html);
        })
    }

    private loadHtml(): JQueryDeferred<string> {
        if (this.html)
            return $.Deferred<string>().resolve(this.html);

        return this.loadHtmlDeferred;
    }

    execute(element: HTMLElement, data: PreviousStepData) {
        this.loadHtml().done((html) => {
            element.innerHTML = html;
            var model = new Model(data);
            ko.applyBindings(model, element);
            //window.setTimeout(() => model.val.showAllMessages(false), 100);
        })
    }
}

export = new LoginPassword();