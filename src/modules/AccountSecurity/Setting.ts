
import shopping = require('services/Shopping');
import auth = require('services/Auth');
import member = require('services/Member');
import ko_val = require('knockout.validation');
import app = require('Application');
import TopBar = require('ui/TopBar');

import registerVerifyCodeButton = require('ui/VerifyCodeButton');

requirejs(['css!content/User/AccountSecurity/Setting']);

enum Step {
    Verify,
    Binding,
    Success
}

interface NextStep {
    execute(element: HTMLElement, data);
}

class Model {
    private oldMobile;
    private oldSmsId;
    private oldCode;
    private timeoutID: number

    private _val: KnockoutValidationErrors
    step = ko.observable<Step>(Step.Verify)
    mobile = auth.currentMember.mobile //ko.observable<string>().extend({ required: true, mobile: true })
    smsId = ko.observable<string>()
    verifyCode = ko.observable<string>()
    errorMessage = ko.observable<string>('')
    leftSeconds = ko.observable(0)
    stepTwoName = ko.observable<string>()

    after_next = $.Callbacks();

    constructor() {
        this._val = ko_val.group(this);
    }
    next = () => {
        if (!this['isValid']()) {
            this.val.showAllMessages(true);
            return;
        }

        this.val.showAllMessages(false);
        this.step(Step.Binding);
        this.after_next.fire();
    }
    get val(): KnockoutValidationErrors {
        return this._val;
    }
    back() {
        app.back();
    }
}



export = class AccountSecuritySettingPage extends chitu.Page {
    private next_step: NextStep;
    private model = new Model();
    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(sender: AccountSecuritySettingPage, args: any) {
        switch (this.routeData.values.type) {
            case 'MobileBinding':
                this.model.stepTwoName('手机绑定');
                //(<TopBar>page['topbar']).title('手机绑定');
                requirejs(['Module/User/AccountSecurity/MobileBinding'], (result: NextStep) => {
                    this.next_step = result;
                });
                break;
            case 'LoginPassword':
                this.model.stepTwoName('设置密码');
                //(<TopBar>page['topbar']).title('登录密码');
                requirejs(['Module/User/AccountSecurity/LoginPassword'], (result) => {
                    this.next_step = result;
                });
                break;
            case 'PaymentPassword':
                //(<TopBar>page['topbar']).title('支付密码');
                this.model.stepTwoName('设置密码');
                requirejs(['Module/User/AccountSecurity/PaymentPassword'], (result) => {
                    this.next_step = result;
                });
                break;
        }
        this.model.step(Step.Verify);

        requirejs(['ui/VerifyCodeButton'], () => {
            ko.applyBindings(this.model, this.element.querySelector('[name="stepOne"]'));
            ko.applyBindings(this.model, this.element.querySelector('[class="step"]'));
        });



        this.model.after_next.add(() => {
            var element = <HTMLElement>this.element.querySelector('[name="stepTwo"]');
            ko.cleanNode(element);
            this.next_step.execute(element, { mobile: this.model.mobile(), verifyCode: this.model.verifyCode(), smsId: this.model.smsId() });
        });
    }
}

// export = function (page: chitu.Page) {

//     //page.load.add(page_load);

//     var next_step: NextStep;

//     switch (page.routeData.values.type) {
//         case 'MobileBinding':
//             model.stepTwoName('手机绑定');
//             //(<TopBar>page['topbar']).title('手机绑定');
//             requirejs(['Module/User/AccountSecurity/MobileBinding'], function (result) {
//                 next_step = result;
//             });
//             break;
//         case 'LoginPassword':
//             model.stepTwoName('设置密码');
//             //(<TopBar>page['topbar']).title('登录密码');
//             requirejs(['Module/User/AccountSecurity/LoginPassword'], function (result) {
//                 next_step = result;
//             });
//             break;
//         case 'PaymentPassword':
//             //(<TopBar>page['topbar']).title('支付密码');
//             model.stepTwoName('设置密码');
//             requirejs(['Module/User/AccountSecurity/PaymentPassword'], function (result) {
//                 next_step = result;
//             });
//             break;


//     }

//     page.load.add(() => {
//         model.step(Step.Verify);
//     });

//     requirejs(['ui/VerifyCodeButton'], function () {
//         ko.applyBindings(model, page.element.querySelector('[name="stepOne"]'));
//         ko.applyBindings(model, page.element.querySelector('[class="step"]'));
//     });



//     model.after_next.add(() => {
//         var element = <HTMLElement>page.element.querySelector('[name="stepTwo"]');
//         ko.cleanNode(element);
//         next_step.execute(element, { mobile: model.mobile(), verifyCode: model.verifyCode(), smsId: model.smsId() });
//     });


//     //c.scrollLoad(page);
// }
