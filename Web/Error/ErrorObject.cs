using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace ShopCloud.Common
{
    class ErrorCode
    {
        public const string Success = "Success";
        public const string UnknownError = "UnknownError";
        public static string NotLogin = "NotLogin";
        public static string SendMobileMessageFail = "SendMobileMessageFail";
    }

    class ErrorObject
    {
        private static ErrorObject success = new ErrorObject();

        public ErrorObject()
        {
            Code = ErrorCode.Success;
            Message = string.Empty;
        }

        public ErrorObject(Exception exc)
        {
            if (exc == null)
                throw new ArgumentNullException("exc"); //Error.ArgumentNull(() => exc);

            Code = exc.GetType().Name;
            if (Code.EndsWith("Exception"))
                Code = Code.Substring(0, Code.Length - "Exception".Length);

            Message = exc.Message;
        }

        public string Code { get; set; }

        public string Message { get; set; }

        public string Type
        {
            get
            {
                return "ErrorObject";
            }
        }

        public static ErrorObject Success
        {
            get { return success; }
        }
    }


}
