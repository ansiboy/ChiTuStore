
import app = require('Application');
import auth = require('Services/Auth');
import member = require('Services/Member');
import services = require('Services/Service');
import site = require('Site');
import ko_val = require('knockout.validation');
import mapping = require('knockout.mapping');
import ko = require('knockout');

class PageModel {
    private validation: KnockoutValidationErrors;
    private timeoutID: number;

    constructor() {

        this.user.confirmPassword.extend({ equal: this.user.password });
        this.user.mobile.extend({
            validation: [{
                async: true,
                validator: function (value, params, callback) {
                    return member.mobileCanRegister(value).done(callback);
                },
                message: '该手机号码已被注册'
            }]
        });
        this.user.verifyCode.extend({
            validation: [{
                async: true,
                validator: (value, params, callback) => {
                    return member.checkVerifyCode($.cookie('RegisterVerifyCodeSmsId'), value, this.user.mobile()).done(() => callback);
                },
                message: '验证码不正确或已失效'
            }]
        });

        this.validation = ko_val.group(this.user);
    }

    register(model: PageModel): JQueryPromise<any> {
        if (!model.user['isValid']()) {
            model.validation.showAllMessages();
            return $.Deferred().resolve();
        }

        if (services['weixin']) {
            var openid = services['weixin'].openid();
            model.user.openid(openid);
        }

        var verifyCode = model.user.verifyCode();
        return member
            .register(mapping.toJS(model.user), verifyCode, $.cookie('RegisterVerifyCodeSmsId'))
            .pipe(function () {
                return auth.login(model.user.mobile(), model.user.password());
            })
            .done(function () {
                location.href = "#User_Index";
            });

        //===============================================================
    }
    back() {
        app.back().fail(function () {
            app.redirect('Home_Index')
        });
    }
    sendVerifyCode(model: PageModel) {
        var obj = { mobile: model.user.mobile };
        var mobile_val = ko_val.group(obj);
        if (!obj['isValid']()) {
            mobile_val.showAllMessages();
            return $.Deferred().resolve();
        }

        model.starButtonCounter(model);
        //return $.Deferred().resolve();
        return member.sendRegisterVerifyCode(model.user.mobile()).done(function (data) {
            $.cookie('RegisterVerifyCodeSmsId', data)
        });
    }
    user = {
        mobile: ko.observable<string>().extend({
            required: true,
            validation: [{
                validator: function (value, params) {
                    value = value || '';
                    return value.length == 11 && /^1[34578]\d{9}$/.test(value);
                },
                message: '请输入正确的手机号码'
            }]
        }),
        openid: ko.observable<string>(),
        verifyCode: ko.observable<string>().extend({ required: true }),
        password: ko.observable<string>().extend({ required: true }),
        confirmPassword: ko.observable<string>().extend({ required: true })
    }
    leftSeconds = ko.observable(0)
    starButtonCounter(model: PageModel) {
        model.leftSeconds(60);
        model.timeoutID = window.setInterval(function () {
            var value = model.leftSeconds() - 1;
            model.leftSeconds(value);
            if (value == 0) {
                window.clearInterval(model.timeoutID);
            }
        }, 1000);
    }
}

class RegisterPage extends chitu.Page {
    private model: PageModel;

    constructor() {
        super();
        this.model = new PageModel();
        this.load.add((sender: RegisterPage, args) => {
            ko.applyBindings(sender.model, sender.element)
        });
    }
}

export = RegisterPage;

// export = function (page: chitu.Page) {
//     /// <param name="page" type="chitu.Page"/>
//     //chitu.scrollLoad(page);
//     var pageNode;
//     var model = {
//         register: function (): JQueryPromise<any> {

//             if (!model.user['isValid']()) {
//                 validation.showAllMessages();
//                 return $.Deferred().resolve();
//             }

//             if (services['weixin']) {
//                 var openid = services['weixin'].openid();
//                 model.user.openid(openid);
//             }

//             var verifyCode = model.user.verifyCode();
//             return member
//                 .register(mapping.toJS(model.user), verifyCode, $.cookie('RegisterVerifyCodeSmsId'))
//                 .pipe(function () {
//                     return auth.login(model.user.mobile(), model.user.password());
//                 })
//                 .done(function () {
//                     location.href = "#User_Index";
//                 });

//             //===============================================================
//         },
//         back: function () {
//             app.back().fail(function () {
//                 app.redirect('Home_Index')
//             });
//         },
//         sendVerifyCode: function () {
//             var obj = { mobile: model.user.mobile };
//             var mobile_val = ko_val.group(obj);
//             if (!obj['isValid']()) {
//                 mobile_val.showAllMessages();
//                 return $.Deferred().resolve();
//             }

//             starButtonCounter();
//             //return $.Deferred().resolve();
//             return member.sendRegisterVerifyCode(model.user.mobile()).done(function (data) {
//                 $.cookie('RegisterVerifyCodeSmsId', data)
//             });
//         },
//         user: {
//             mobile: ko.observable<string>().extend({
//                 required: true,
//                 validation: [{
//                     validator: function (value, params) {
//                         value = value || '';
//                         return value.length == 11 && /^1[34578]\d{9}$/.test(value);
//                     },
//                     message: '请输入正确的手机号码'
//                 }]
//             }),
//             openid: ko.observable<string>(),
//             verifyCode: ko.observable<string>().extend({ required: true }),
//             password: ko.observable<string>().extend({ required: true }),
//             confirmPassword: ko.observable<string>().extend({ required: true })
//         },
//         leftSeconds: ko.observable(0)
//     };

//     function starButtonCounter() {
//         model.leftSeconds(60);
//         this.timeoutID = window.setInterval(function () {
//             var value = model.leftSeconds() - 1;
//             model.leftSeconds(value);
//             if (value == 0) {
//                 window.clearInterval(this.timeoutID);
//             }
//         }, 1000);
//     }

//     page.viewChanged.add(() => ko.applyBindings(model, page.element));

//     model.user.confirmPassword.extend({ equal: model.user.password });
//     model.user.mobile.extend({
//         validation: [{
//             async: true,
//             validator: function (value, params, callback) {
//                 return member.mobileCanRegister(value).done(callback);
//             },
//             message: '该手机号码已被注册'
//         }]
//     });
//     model.user.verifyCode.extend({
//         validation: [{
//             async: true,
//             validator: (value, params, callback) => {
//                 //site.getAppToken().pipe(function (appToken) {
//                 //return $.ajax({
//                 //    dataType: 'json',
//                 //    data: {
//                 //        smsId: $.cookie('RegisterVerifyCodeSmsId'),
//                 //        verifyCode: value
//                 //    },
//                 //    url: site.config.memberServiceUrl + 'Member/CheckVerifyCode?$appToken=' + site.cookies.appToken()
//                 //})
//                 ////})
//                 //    .done(callback);
//                 return member.checkVerifyCode($.cookie('RegisterVerifyCodeSmsId'), value, model.user.mobile()).done(() => callback);
//             },
//             message: '验证码不正确或已失效'
//         }]
//     });
//     var validation = ko_val.group(model.user);

// } 