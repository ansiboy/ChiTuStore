using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace ShopColud.UserClient.Controllers
{
    class WeiXinConfig
    {
        public string AppId { get; set; }

        public string AppSecret { get; set; }
    }

    [ShopCloud.Common.ExceptionHandler]
    public class WeiXinController : Controller
    {
        static WeiXinConfig weixinConfig;

        public ActionResult LoadOpenId(string code, string openIdCookieName, string returnUrlCookieName, string tokenCookieName)
        {

            if (code == null && string.IsNullOrEmpty(openIdCookieName))
                throw Error.ArgumentNull("openIdCookieName");

            if (code == null && string.IsNullOrEmpty(tokenCookieName))
                throw Error.ArgumentNull("tokenCookieName");

            if (code == null && string.IsNullOrEmpty(returnUrlCookieName))
                returnUrlCookieName = Constants.ReturnUrl;



            string cookiePrefix = ConfigurationManager.AppSettings["cookiePrefix"];
            if (string.IsNullOrEmpty(cookiePrefix))
                throw Error.AppSettingItemMiss("cookiePrefix");

            Trace.WriteLine("LoadOpenId " + DateTime.Now.ToString("yyyy-MM-dd HH:mm"));
            try
            {
                var config = GetWeiXinConfig();
                var appid = config.AppId;
                var secret = config.AppSecret;

                Trace.WriteLine("appid:" + appid);
                Trace.WriteLine("secret:" + secret);

                string url;
                if (string.IsNullOrEmpty(code))
                {
                    var redirectUrl = Request.Url.ToString();
                    url = string.Format("https://open.weixin.qq.com/connect/oauth2/authorize?appid={0}&redirect_uri={1}&response_type=code&scope=snsapi_base#wechat_redirect",
                                             appid, HttpUtility.UrlEncode(redirectUrl));

                    Trace.WriteLine("Go to WeiXin Auth Page:" + url);
                    Trace.Flush();
                    return Redirect(url);
                }

                var client = new System.Net.WebClient();
                client.Encoding = System.Text.Encoding.UTF8;

                url = string.Format("https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", appid, secret, code);
                var data = client.DownloadString(url);

                var serializer = new JavaScriptSerializer();
                var obj = serializer.Deserialize<Dictionary<string, object>>(data);
                object accessToken;
                if (!obj.TryGetValue("access_token", out accessToken))
                    return base.Json("Success", JsonRequestBehavior.AllowGet);

                var openid = obj["openid"] as string;
                url = string.Format("https://api.weixin.qq.com/sns/userinfo?access_token={0}&openid={1}&lang=zh_CN", accessToken, openid);
                data = client.DownloadString(url);
                obj = serializer.Deserialize<Dictionary<string, object>>(data);

                var cookie = new HttpCookie(openIdCookieName, openid);
                cookie.Expires = DateTime.Now.AddYears(10);
                Response.Cookies.Add(cookie);

                Trace.WriteLine("Open id:" + openid);


                //if (!string.IsNullOrEmpty(tokenCookieName))
                //{
                string userId;
                var userToken = LoginByOpenId(openid, out userId);
                var userToken_cookie = new HttpCookie(tokenCookieName, userToken);
                Response.Cookies.Add(userToken_cookie);
                //}

                var returnUrlCookie = Request.Cookies[returnUrlCookieName];
                if (returnUrlCookie != null)
                {
                    var returnUrl = HttpUtility.UrlDecode(returnUrlCookie.Value);
                    Trace.WriteLine(returnUrl);

                    return Redirect(returnUrl);
                }

                return Json("Success", JsonRequestBehavior.AllowGet);
            }
            finally
            {
                Trace.Flush();
            }
        }

        private string LoginByOpenId(string openid, out string userId)
        {
            var appToken = AccountController.GetApplicationToken();
            var client = new System.Net.WebClient();
            client.Encoding = System.Text.Encoding.UTF8;
            var url = string.Format("{0}/Member/LoginByOpenId?$appToken={1}&openId={2}", ConfigurationManager.AppSettings["memberserviceurl"], appToken, openid);
            var str_result = client.DownloadString(url);
            Trace.WriteLine(str_result);
            Trace.Flush();
            var serializer = new JavaScriptSerializer();
            var obj = serializer.Deserialize<Dictionary<string, string>>(str_result);
            var token = obj["UserToken"];
            userId = obj["UserId"];
            return token;
        }

        public ActionResult GetAuthCode(string code)
        {
            //var u1 = "../#User_UserInfo";
            //return Redirect(u1);
            Trace.WriteLine("LoadOpenId " + DateTime.Now.ToString("yyyy-MM-dd HH:mm"));
            try
            {
                var config = GetWeiXinConfig();
                var appid = config.AppId;
                var secret = config.AppSecret;

                Trace.WriteLine("appid:" + appid);
                Trace.WriteLine("secret:" + secret);

                string url;
                if (string.IsNullOrEmpty(code))
                {
                    var redirectUrl = Request.Url.ToString();
                    url = string.Format("https://open.weixin.qq.com/connect/oauth2/authorize?appid={0}&redirect_uri={1}&response_type=code&scope=snsapi_userinfo#wechat_redirect",
                                             appid, HttpUtility.UrlEncode(redirectUrl));

                    Trace.WriteLine("Go to WeiXin Auth Page:" + url);
                    Trace.Flush();
                    return Redirect(url);
                }

                var u = "../#User_UserInfo_" + code;

                return Redirect(u);
            }
            finally
            {
                Trace.Flush();
            }
        }

        private WeiXinConfig GetWeiXinConfig()
        {
            if (weixinConfig != null)
            {
                return weixinConfig;
            }

            var weixinServiceUrl = ConfigurationManager.AppSettings["weixinServiceUrl"];
            if (string.IsNullOrEmpty(weixinServiceUrl))
                throw Error.AppSettingItemMiss("weixinServiceUrl");


            var url = weixinServiceUrl + "WeiXin/GetConfig";
            var webClient = new WebClient();
            webClient.Encoding = Encoding.UTF8;

            var values = new NameValueCollection();
            values["$appToken"] = AccountController.GetApplicationToken();
            var bytes = webClient.UploadValues(url, values);
            var str_result = Encoding.UTF8.GetString(bytes);
            var serializer = new JavaScriptSerializer();
            var obj = serializer.Deserialize<WeiXinConfig>(str_result);

            return obj;
        }
    }
}
