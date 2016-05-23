var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Auth', 'Application', 'knockout.validation'], function (require, exports, member, app, validation) {
    requirejs(['css!content/User/Login']);
    var PageModel = (function () {
        function PageModel() {
            this.username = ko.observable().extend({ required: { message: '请输入用户名' } });
            this.password = ko.observable().extend({ required: { message: '请输入密码' } });
            this.val = validation.group(this);
        }
        PageModel.prototype.login = function (model) {
            if (!model['isValid']()) {
                model.val.showAllMessages();
                return;
            }
            return member.login(model.username(), model.password())
                .done(function (data) {
                if (this.redirectUrl)
                    return app.showPage(this.redirectUrl, undefined);
                app.redirect('#User_Index');
            });
        };
        return PageModel;
    })();
    var LoginPage = (function (_super) {
        __extends(LoginPage, _super);
        function LoginPage() {
            _super.call(this);
            this.redirectUrl = '';
            this.model = new PageModel();
            this.load.add(this.page_load);
        }
        LoginPage.prototype.page_load = function (sender, args) {
            sender.redirectUrl = args.redirectUrl;
            ko.applyBindings(sender.model, sender.element);
        };
        return LoginPage;
    })(chitu.Page);
    return LoginPage;
});
