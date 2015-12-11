define(["require", "exports", 'Services/Service', 'Site'], function (require, exports, services, site) {
    var WeiXinService = (function () {
        function WeiXinService() {
            var _this = this;
            this.call = function (method, data) {
                if (data === void 0) { data = undefined; }
                data = data || {};
                var url = site.config.weixinServiceUrl + method;
                data.$appToken = site.cookies.appToken();
                return $.ajax({
                    url: url,
                    data: data,
                    method: 'post',
                    dataType: 'json',
                    traditional: true
                });
            };
            this.weixinPay = function (prepayId) {
                function getTimeStamp() {
                    var timestamp = new Date().getTime();
                    var timestampstring = timestamp.toString();
                    return timestampstring;
                }
                function getNonceStr() {
                    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    var maxPos = $chars.length;
                    var noceStr = "";
                    for (var i = 0; i < 32; i++) {
                        noceStr += $chars.charAt(Math.floor(Math.random() * maxPos));
                    }
                    return noceStr;
                }
                var $result = $.Deferred();
                var nonceStr = getNonceStr();
                var timeStamp = getTimeStamp();
                var pack = "prepay_id=" + prepayId;
                var paySignatureDeferred = weixin.paySignature(nonceStr, pack, timeStamp);
                paySignatureDeferred.done(function (data) {
                    window['WeixinJSBridge'].invoke('getBrandWCPayRequest', {
                        "appId": data.appId,
                        "nonceStr": nonceStr,
                        "package": pack,
                        "timeStamp": timeStamp,
                        "signType": 'MD5',
                        "paySign": data.paySign
                    }, function (res) {
                        if (res.err_msg == "get_brand_wcpay_request:ok") {
                            $result.resolve();
                        }
                        else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                            $result.reject();
                        }
                        else {
                            alert(res.err_msg);
                            $result.reject();
                        }
                    });
                });
                return $result;
            };
            this.jsSignature = function (noncestr, url) {
                var data = { noncestr: noncestr, url: url };
                return _this.call('WeiXin/GetJsSignature', data);
            };
            this.paySignature = function (nonceStr, pack, timeStamp) {
                var data = { nonceStr: nonceStr, 'package': pack, timeStamp: timeStamp };
                return _this.call('WeiXin/GetPaySignature', data);
            };
            this.getConfig = function () {
                return _this.call('WeiXin/GetConfig');
            };
            this.getPrepayId = function (total_fee, openid, notify_url, out_trade_no, title) {
                var data = {
                    total_fee: total_fee, openid: openid, notify_url: notify_url,
                    out_trade_no: out_trade_no, title: title
                };
                return _this.call('WeiXin/GetPrepayId', data);
            };
            this.pay = function (openid, notify_url, out_trade_no, title, amount) {
                return weixin.getPrepayId(1, openid, notify_url, out_trade_no, title)
                    .pipe(function (prepayId) { return _this.weixinPay(prepayId); });
            };
            this.openid = function (value) {
                if (value === void 0) { value = undefined; }
                if (value === undefined)
                    return site.cookies.get_value('openId');
                site.cookies.set_value('openId', value);
            };
            this.getUserInfo = function (code) {
                return _this.call('WeiXin/GetUserInfo', { code: code });
            };
        }
        return WeiXinService;
    })();
    var weixin = services['weixin'] = services['weixin'] || new WeiXinService();
    if (!weixin.openid() || !site.cookies.token()) {
        site.cookies.returnUrl(window.location.href);
        window.location.href = 'WeiXin/LoadOpenId/?openIdCookieName=' + site.cookies.get_cookieName('openId') + '&returnUrlCookieName=' + site.cookies.get_cookieName('returnUrl') +
            '&tokenCookieName=' + site.cookies.get_cookieName('token');
    }
    return weixin;
});
