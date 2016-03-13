using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace ShopCloud.Common
{
    public class ExceptionHandlerAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            var exc = filterContext.Exception;
            var error = new ErrorObject();
            //error.Code = ErrorCode.UnknownError;
            error.Message = exc.Message;

            var excTypeName = exc.GetType().Name;
            if (excTypeName.EndsWith("Exception"))
                excTypeName = excTypeName.Substring(0, excTypeName.Length - "Exception".Length);

            error.Code = excTypeName;
            filterContext.ExceptionHandled = true;

            filterContext.Result = new JsonResult()
            {
                Data = error,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

            Trace.WriteLine(exc.Message);
            Trace.WriteLine(exc.Source);
            Trace.WriteLine(exc.StackTrace);
            Trace.Flush();
        }
    }
}
