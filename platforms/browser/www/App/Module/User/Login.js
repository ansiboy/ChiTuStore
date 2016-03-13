/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />
define(["require", "exports", 'Services/Auth', 'Application', 'knockout.validation'], function (require, exports, member, app, validation) {
    requirejs(['css!content/User/Login']);
    exports.func = function (page) {
        /// <param name="page" type="chitu.Page"/>
        var redirectUrl = '';
        var model = {
            username: ko.observable().extend({ required: { message: '请输入用户名' } }),
            password: ko.observable().extend({ required: { message: '请输入密码' } }),
            val: undefined,
            login: function () {
                if (!model['isValid']()) {
                    model.val.showAllMessages();
                    return;
                }
                return member.login(model.username(), model.password())
                    .done(function (data) {
                    if (redirectUrl)
                        return app.showPage(redirectUrl, undefined);
                    app.redirect('User_Index');
                });
            }
        };
        page.load.add(function (sender, args) {
            redirectUrl = args.redirectUrl;
            model.val = validation.group(model);
        });
        page.viewChanged.add(function () { return ko.applyBindings(model, page.element); });
    };
});
