/// <reference path='../../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'Services/Auth', 'knockout.validation', 'Application'], function (require, exports, auth, ko_val, app) {
    requirejs(['css!content/User/AccountSecurity/Setting']);
    var Step;
    (function (Step) {
        Step[Step["Verify"] = 0] = "Verify";
        Step[Step["Binding"] = 1] = "Binding";
        Step[Step["Success"] = 2] = "Success";
    })(Step || (Step = {}));
    var Model = (function () {
        function Model() {
            var _this = this;
            this.step = ko.observable(Step.Verify);
            this.mobile = auth.currentMember.mobile;
            this.smsId = ko.observable();
            this.verifyCode = ko.observable();
            this.errorMessage = ko.observable('');
            this.leftSeconds = ko.observable(0);
            this.stepTwoName = ko.observable();
            this.after_next = $.Callbacks();
            this.next = function () {
                if (!_this['isValid']()) {
                    _this.val.showAllMessages(true);
                    return;
                }
                _this.val.showAllMessages(false);
                _this.step(Step.Binding);
                _this.after_next.fire();
            };
            this._val = ko_val.group(this);
        }
        Object.defineProperty(Model.prototype, "val", {
            get: function () {
                return this._val;
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.back = function () {
            app.back();
        };
        return Model;
    })();
    var model = new Model();
    return function (page) {
        //page.load.add(page_load);
        var next_step;
        switch (page.routeData.values().type) {
            case 'MobileBinding':
                model.stepTwoName('手机绑定');
                page['topbar'].title('手机绑定');
                requirejs(['Module/User/AccountSecurity/MobileBinding'], function (result) {
                    next_step = result;
                });
                break;
            case 'LoginPassword':
                model.stepTwoName('设置密码');
                page['topbar'].title('登录密码');
                requirejs(['Module/User/AccountSecurity/LoginPassword'], function (result) {
                    next_step = result;
                });
                break;
            case 'PaymentPassword':
                page['topbar'].title('支付密码');
                model.stepTwoName('设置密码');
                requirejs(['Module/User/AccountSecurity/PaymentPassword'], function (result) {
                    next_step = result;
                });
                break;
        }
        page.load.add(function () {
            model.step(Step.Verify);
        });
        requirejs(['UI/VerifyCodeButton'], function () {
            ko.applyBindings(model, page.node.querySelector('[name="stepOne"]'));
            ko.applyBindings(model, page.node.querySelector('[class="step"]'));
        });
        model.after_next.add(function () {
            var element = page.node.querySelector('[name="stepTwo"]');
            ko.cleanNode(element);
            next_step.execute(element, { mobile: model.mobile(), verifyCode: model.verifyCode(), smsId: model.smsId() });
        });
    };
});
