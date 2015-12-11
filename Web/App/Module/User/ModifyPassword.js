define(['sv/Member', 'ko.val'], function () {
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
     
        page.showing.add(function () {
            //app.header.title('修改密码');
            //app.header.returnUrl('User/Index');
        })


        var model = {
            back: function () {
                app.back().fail(function () {
                    app.redirect('User_Index');
                });
            },
            confirm_password: ko.observable(),
            password: ko.observable(),
            save: function () {
                if (!model.isValid()) {
                    validation.showAllMessages();
                    return $.Deferred().reject();
                }
                return services.member.changePassword(model.password());
            }
        };


        model.confirm_password.extend({
            equal: {
                onlyIf: function () {
                    return model.password() != null;
                },
                params: model.password,
                message: '两次输入的密码不同'
            }
        });
        model.password.extend({ required: true });
        var validation = ko.validation.group(model);

        ko.applyBindings(model, page.node());

    }
});
