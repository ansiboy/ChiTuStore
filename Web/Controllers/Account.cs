using ShopColud.UserClient.Controllers;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace ShopColud.UserClient.Controllers
{
    [ShopCloud.Common.ExceptionHandler]
    public class AccountController : Controller
    {
        public static string GetApplicationToken()
        {
            var memberServiceUrl = ConfigurationManager.AppSettings["memberServiceUrl"];
            if (string.IsNullOrEmpty(memberServiceUrl))
                throw Error.AppSettingItemMiss("memberServiceUrl");

            var shop_appid = ConfigurationManager.AppSettings["shop_appid"];
            if (string.IsNullOrEmpty(shop_appid))
                throw Error.AppSettingItemMiss("shop_appid");

            var shop_secret = ConfigurationManager.AppSettings["shop_secret"];
            if (string.IsNullOrEmpty("shop_secret"))
                throw Error.AppSettingItemMiss("shop_secret");

            var url = memberServiceUrl + "Auth/GetAppToken";
            var webClient = new WebClient();
            var values = new NameValueCollection();
            values["appId"] = shop_appid;
            values["appSecret"] = shop_secret;
            var bytes = webClient.UploadValues(url, values);
            var str_result = Encoding.UTF8.GetString(bytes);
            var serializer = new JavaScriptSerializer();
            var obj = serializer.Deserialize<Dictionary<string, object>>(str_result);
            object appToken;
            if (!obj.TryGetValue("AppToken", out appToken))
                throw Error.GetAppTokenFail();

            return (string)appToken;
        }
    }
}