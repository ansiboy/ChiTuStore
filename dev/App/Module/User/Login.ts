/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />

import member = require('Services/Auth');
import app = require('Application');
import validation = require('knockout.validation');


requirejs(['css!content/User/Login']);

export var func = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    var redirectUrl = '';
    var model = {
        username: ko.observable<string>().extend({ required: { message: '请输入用户名' } }),
        password: ko.observable<string>().extend({ required: { message: '请输入密码' } }),
        val: undefined,
        login: function (): JQueryPromise<any> {
            if (!model['isValid']()) {
                model.val.showAllMessages();
                return;
            }

            return member.login(model.username(), model.password())
                .done(function (data) {
                    if (redirectUrl)
                        return app.showPage(redirectUrl, undefined);

                    app.redirect('User_Index');
                })
        }
    };

    page.load.add(function (sender, args) {
        redirectUrl = args.redirectUrl;

        model.val = validation.group(model);

    });

    page.viewChanged.add(() => ko.applyBindings(model, page.element));



    //model.username('18502146746');
    //model.password('1');

}  