import services = require('Services/Service');
import wixin = require('Services/WeiXin');
import site = require('Site');


class WeiXinService {
    private call = (method: string, data = undefined) => {
        /// <returns type="jQuery.Deferred"/>
        data = data || {};
        var url = services.config.weixinServiceUrl + method
        //return site.cookies.getAppToken().pipe($.proxy(function (appToken) {
        //
        data.$appToken = site.cookies.appToken();
        return $.ajax({
            url: url,
            data: data,
            method: 'post',
            dataType: 'json',
            traditional: true
        });

        //}, { _data: data }));
    }
    private weixinPay = (prepayId): JQueryPromise<string>=> {
        /// <returns type="jQuery.Deferred"/>
        function getTimeStamp() {
            var timestamp = new Date().getTime();
            var timestampstring = timestamp.toString();//一定要转换字符串
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
                "appId": data.appId,                     //公众号名称，由商户传入
                "nonceStr": nonceStr,          //随机串
                "package": pack,//扩展包
                "timeStamp": timeStamp, //时间戳
                "signType": 'MD5', //微信签名方式
                "paySign": data.paySign //微信签名
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
        })

        return $result;
    }
    jsSignature = (noncestr, url) => {
        var data = { noncestr: noncestr, url: url };
        return this.call('WeiXin/GetJsSignature', data);
    }
    paySignature = (nonceStr, pack, timeStamp) => {
        /// <returns type="jQuery.Deferred"/>
        var data = { nonceStr: nonceStr, 'package': pack, timeStamp: timeStamp };
        return this.call('WeiXin/GetPaySignature', data);
    }
    getConfig = () => {
        return this.call('WeiXin/GetConfig');
    }
    getPrepayId = (total_fee, openid, notify_url, out_trade_no, title) => {
        var data = {
            total_fee: total_fee, openid: openid, notify_url: notify_url,
            out_trade_no: out_trade_no, title: title
        };
        return this.call('WeiXin/GetPrepayId', data);
    }
    pay = (openid, notify_url, out_trade_no, title, amount) => {
        //(amount * 100).toFixed(0)
        return weixin.getPrepayId(1, openid, notify_url, out_trade_no, title)
            .pipe((prepayId) => this.weixinPay(prepayId));
    }
    openid = (value = undefined) => {
        //return null;
        //site.cookies.set_value('openId', 'oOjaNt51NI4srmUm8FTPkr-ywjc0');
        if (value === undefined)
            return site.cookies.get_value('openId');

        site.cookies.set_value('openId', value);
    }
    getUserInfo = (code) => {
        return this.call('WeiXin/GetUserInfo', { code });
    }
}



var weixin = services['weixin'] = services['weixin'] || new WeiXinService()
export = <WeiXinService>weixin

if (!weixin.openid() || !site.cookies.token()) {
    site.cookies.returnUrl(window.location.href);
    window.location.href = 'WeiXin/LoadOpenId/?openIdCookieName=' + site.cookies.get_cookieName('openId') + '&returnUrlCookieName=' + site.cookies.get_cookieName('returnUrl') +
    '&tokenCookieName=' + site.cookies.get_cookieName('token');
}

//alert(weixin.openid());
//alert(site.cookies.token());
