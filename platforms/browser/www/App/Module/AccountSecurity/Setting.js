var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    return (function (_super) {
        __extends(AccountSecuritySettingPage, _super);
        function AccountSecuritySettingPage(html) {
            _super.call(this, html);
            this.model = new Model();
            this.load.add(this.page_load);
        }
        AccountSecuritySettingPage.prototype.page_load = function (sender, args) {
            var _this = this;
            switch (this.routeData.values.type) {
                case 'MobileBinding':
                    this.model.stepTwoName('手机绑定');
                    requirejs(['Module/User/AccountSecurity/MobileBinding'], function (result) {
                        _this.next_step = result;
                    });
                    break;
                case 'LoginPassword':
                    this.model.stepTwoName('设置密码');
                    requirejs(['Module/User/AccountSecurity/LoginPassword'], function (result) {
                        _this.next_step = result;
                    });
                    break;
                case 'PaymentPassword':
                    this.model.stepTwoName('设置密码');
                    requirejs(['Module/User/AccountSecurity/PaymentPassword'], function (result) {
                        _this.next_step = result;
                    });
                    break;
            }
            this.model.step(Step.Verify);
            requirejs(['UI/VerifyCodeButton'], function () {
                ko.applyBindings(_this.model, _this.element.querySelector('[name="stepOne"]'));
                ko.applyBindings(_this.model, _this.element.querySelector('[class="step"]'));
            });
            this.model.after_next.add(function () {
                var element = _this.element.querySelector('[name="stepTwo"]');
                ko.cleanNode(element);
                _this.next_step.execute(element, { mobile: _this.model.mobile(), verifyCode: _this.model.verifyCode(), smsId: _this.model.smsId() });
            });
        };
        return AccountSecuritySettingPage;
    })(chitu.Page);
});
