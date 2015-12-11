define(["require", "exports", 'Application', 'Services/Auth', 'Services/Member', 'Services/Service', 'knockout.validation', 'knockout.mapping'], function (require, exports, app, auth, member, services, ko_val, mapping) {
    return function (page) {
        var pageNode;
        var model = {
            register: function () {
                if (!model.user['isValid']()) {
                    validation.showAllMessages();
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
            },
            back: function () {
                app.back().fail(function () {
                    app.redirect('Home_Index');
                });
            },
            sendVerifyCode: function () {
                var obj = { mobile: model.user.mobile };
                var mobile_val = ko.validation.group(obj);
                if (!obj['isValid']()) {
                    mobile_val.showAllMessages();
                    return $.Deferred().resolve();
                }
                starButtonCounter();
                return member.sendRegisterVerifyCode(model.user.mobile()).done(function (data) {
                    $.cookie('RegisterVerifyCodeSmsId', data);
                });
            },
            user: {
                mobile: ko.observable().extend({
                    required: true,
                    validation: [{
                            validator: function (value, params) {
                                value = value || '';
                                return value.length == 11 && /^1[34578]\d{9}$/.test(value);
                            },
                            message: '请输入正确的手机号码'
                        }]
                }),
                openid: ko.observable(),
                verifyCode: ko.observable().extend({ required: true }),
                password: ko.observable().extend({ required: true }),
                confirmPassword: ko.observable().extend({ required: true })
            },
            leftSeconds: ko.observable(0)
        };
        function starButtonCounter() {
            model.leftSeconds(60);
            this.timeoutID = window.setInterval(function () {
                var value = model.leftSeconds() - 1;
                model.leftSeconds(value);
                if (value == 0) {
                    window.clearInterval(this.timeoutID);
                }
            }, 1000);
        }
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
        model.user.confirmPassword.extend({ equal: model.user.password });
        model.user.mobile.extend({
            validation: [{
                    async: true,
                    validator: function (value, params, callback) {
                        return member.mobileCanRegister(value).done(callback);
                    },
                    message: '该手机号码已被注册'
                }]
        });
        model.user.verifyCode.extend({
            validation: [{
                    async: true,
                    validator: function (value, params, callback) {
                        return member.checkVerifyCode($.cookie('RegisterVerifyCodeSmsId'), value, model.user.mobile()).done(function () { return callback; });
                    },
                    message: '验证码不正确或已失效'
                }]
        });
        var validation = ko_val.group(model.user);
    };
});
