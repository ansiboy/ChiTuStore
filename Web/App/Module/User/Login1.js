define(["require", "exports", 'Services/Member', 'Application', 'knockout.validation'], function (require, exports, services, app, validation) {
    exports.func = function (page) {
        /// <param name="page" type="chitu.Page"/>
        chitu['scrollLoad'](page);
        var redirectUrl = '';
        var model = {
            username: ko.observable().extend({ required: { message: '请输入用户名' } }),
            password: ko.observable().extend({ required: { message: '请输入密码' } }),
            login: function () {
                if (!model['isValid']()) {
                    val.showAllMessages();
                    return;
                }
                return services.member.login(model.username(), model.password())
                    .done(function (data) {
                    if (redirectUrl)
                        return app.showPage(redirectUrl, undefined);
                    app.redirect('User_Index');
                });
            }
        };
        page.load.add(function (sender, args) {
            redirectUrl = args.redirectUrl;
        });
        ko.applyBindings(model, page.node());
        var val = validation.group(model);
        //model.username('18502146746');
        //model.password('1');
    };
});
//# sourceMappingURL=Login1.js.map