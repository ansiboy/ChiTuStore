define(["require", "exports", 'Services/Service', 'Application', 'Site'], function (require, exports, services, app, site) {
    services.error.add(function (error) {
        if (error.Code == 'NotLogin' || error.Code == 'TokenRequired') {
            var return_url = '';
            if (location.hash.length > 1)
                return_url = location.hash.substr(1);
            return app.showPage('User_Login', { redirectUrl: return_url });
        }
        ;
        showError(error);
    });
    requirejs(['bootbox'], function (bootbox) {
        window['bootbox'] = bootbox;
    });
    function alert(msg) {
        if (window['bootbox'])
            window['bootbox'].alert(msg);
        else
            window.alert(msg);
    }
    function showConnectFailPage() {
        app.showPage('Error_ConnectFail', { hash: location.hash });
    }
    function showError(data) {
        var msg;
        if (data.status !== undefined) {
            switch (data.status) {
                case 0:
                case 404:
                    msg = '您的网络不佳，请稍后再试';
                    if (data.element == null) {
                        showConnectFailPage();
                        return;
                    }
                    break;
                default:
                    if (!data.Message)
                        msg = '未知的错误(Code:' + data.Code + ',' + data.Message || '' + ')';
                    else
                        msg = data.Message;
                    break;
            }
        }
        else if (data.Code) {
            switch (data.Code) {
                case 'PasswordIncorect':
                    msg = '用户名或密码不正确';
                    break;
                case 'NotLogin':
                    msg = '尚未登录';
                    break;
                case 'AllCouponsReceived':
                    msg = '优惠券已经领取完毕';
                    break;
                case 'MemberExists':
                    msg = '该会员已经存在';
                    break;
                case 'MemberNotExists':
                    msg = '该会员不存在';
                    break;
                case 'EmailExists':
                    msg = '该邮箱已经注册';
                    break;
                case 'User':
                    msg = '提示：' + data.Message;
                    break;
                case 'Web':
                case 'Sql':
                    console.warn(data.Message);
                    if (data.element == null) {
                        msg = '连接服务器错误';
                        showConnectFailPage();
                        return;
                    }
                    msg = data.Message;
                    break;
                case 'InvalidToken':
                case 'AppTokenRequired':
                    debugger;
                    if (site.env.isWeiXin) {
                        window.location.href = '#Home_Index';
                    }
                    else {
                        app.showPage('User_Login', {});
                    }
                    return;
                default:
                    if (!data.Message)
                        msg = '未知的错误(Code:' + data.Code + ',' + data.Message || '' + ')';
                    else
                        msg = data.Message;
                    break;
            }
        }
        else {
            msg = '未知的错误(' + data.url + ')';
        }
        alert(msg);
        return;
    }
});
