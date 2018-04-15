requirejs(['css!content/AccountSecurity/MobileBinding']);
import shopping = require('services/Shopping');
import member = require('services/Member');
import ko_val = require('knockout.validation');
import app = require('Application');

interface PreviousStepData {
    mobile: string
    verifyCode: string
    smsId: string
}

class Model {

    status = ko.observable<string>('start')
    errorMessage = ko.observable()
    leftSeconds = ko.observable(0)
    verifyCode = ko.observable<string>()
    mobile = ko.observable<string>().extend({ required: true })
    smsId = ko.observable<string>()
    timeoutID: number
    private _val: KnockoutValidationErrors

    private data: PreviousStepData

    constructor(data: PreviousStepData) {
        this.data = data;
        this._val = ko_val.group(this);
        this.verifyCode.subscribe((value: string) => {
            const VERIFY_CODE_MIN_LENGTH = 4;
            value = (value || '').trim();
            if (value.length >= VERIFY_CODE_MIN_LENGTH && this.smsId() != null) {
                member.checkVerifyCode(this.smsId(), this.verifyCode(), this.mobile()).done((data) => {
                    if (data === true)
                        this.errorMessage(null)
                    else
                        this.errorMessage('验证码不正确')
                });
            }
        })
    }

    sendVerifyCode = () => {
        if (!this['isValid']()) {
            this._val.showAllMessages();
            return;
        }

        return member.mobileCanRegister(this.mobile())
            .pipe((data) => {
                if (data == false) {
                    this.errorMessage('该手机号码已被绑定');
                    return $.Deferred().reject();
                }
                return member.sendBindingVerifyCode(this.mobile())
            })
            .done((data) => {
                this.starButtonCounter();
                this.smsId(data);
            });
    }
    starButtonCounter() {
        this.leftSeconds(60);
        this.timeoutID = window.setInterval(() => {
            var value = this.leftSeconds() - 1;
            this.leftSeconds(value);
            if (value == 0) {
                window.clearInterval(this.timeoutID);
            }
        }, 1000);
    }
    enableBind = ko.computed(() => {
        return this.errorMessage() == null;
    })
    bind = () => {
        return member.rebindMobile(this.data.mobile, this.data.smsId, this.data.verifyCode, this.mobile(), this.smsId(), this.verifyCode())
            .done(() => this.status('done'));
    }
    back = () => {
        app.back();
    }
}

class MobileBinding {
    private html: string
    private loadHtmlDeferred = $.Deferred<string>()

    constructor() {
        requirejs(['text!modules/AccountSecurity/MobileBinding.html'], (html) => {
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
        })
    }
}

export = new MobileBinding();

