using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Mvc;
using System.Web.Http;
using System.Configuration;
using E = ShopColud.UserClient.Controllers.Error;
using ShopColud.UserClient.Controllers;

namespace ShopColud.UserClient
{
    public class MvcApplication : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {

            AreaRegistration.RegisterAllAreas();
            RegisterRoutes(RouteTable.Routes);
            RegisterGlobalFilters(GlobalFilters.Filters);
            
            //this.BeginRequest
        }

        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());            
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // 路由名称
                "{controller}/{action}/{id}", // 带有参数的 URL
                new { id = UrlParameter.Optional } //new { controller = "Home", action = "Index", id = UrlParameter.Optional } // 参数默认值
            );

        }

    }
}