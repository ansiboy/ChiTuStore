using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ShopColud.UserClient.Controllers
{
    [ShopCloud.Common.ExceptionHandler]
    public class HomeController : Controller
    {
        public ActionResult GetSiteConfig()
        {
            var cookiePrefix = ConfigurationManager.AppSettings["cookiePrefix"];
            if (cookiePrefix == null)
                throw Error.AppSettingItemMiss("cookiePrefix");

            var shopServiceUrl = ConfigurationManager.AppSettings["shopServiceUrl"];
            if (string.IsNullOrEmpty(shopServiceUrl))
                throw Error.AppSettingItemMiss("shopServiceUrl");

            var weixinServiceUrl = ConfigurationManager.AppSettings["weixinServiceUrl"];
            if (string.IsNullOrEmpty(weixinServiceUrl))
                throw Error.AppSettingItemMiss("weixinServiceUrl");

            var memberServiceUrl = ConfigurationManager.AppSettings["memberServiceUrl"];
            if (string.IsNullOrEmpty(memberServiceUrl))
                throw Error.AppSettingItemMiss("memberServiceUrl");

            var siteServiceUrl = ConfigurationManager.AppSettings["siteServiceUrl"];
            if (string.IsNullOrEmpty(siteServiceUrl))
                throw Error.AppSettingItemMiss("siteServiceUrl");

            var accountServiceUrl = ConfigurationManager.AppSettings["accountServiceUrl"];
            if (string.IsNullOrEmpty(siteServiceUrl))
                throw Error.AppSettingItemMiss("accountServiceUrl");

            var imageBaseUrl = ConfigurationManager.AppSettings["imageBaseUrl"];
            if (string.IsNullOrEmpty(imageBaseUrl))
                throw Error.AppSettingItemMiss("imageBaseUrl");

            //====================================================================
            // 注：敏感信息，不能直接以 JSON 数据返回
            var appToken = AccountController.GetApplicationToken();
            Response.Cookies.Add(new HttpCookie(cookiePrefix + "_appToken", appToken) { Expires = DateTime.Now.AddYears(10) });
            //====================================================================

            return Json(new
            {
                CookiePrefix = cookiePrefix,
                ShopServiceUrl = shopServiceUrl,
                WeixinServiceUrl = weixinServiceUrl,
                MemberServiceUrl = memberServiceUrl,
                SiteServiceUrl = siteServiceUrl,
                AccountServiceUrl = accountServiceUrl,
                ImageBaseUrl = imageBaseUrl,
                AppToken = appToken
            }, JsonRequestBehavior.AllowGet);
        }
    }
}