using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ShopColud.UserClient.Controllers
{
    public class NotConfigConnectionStringException : Exception
    {
        public NotConfigConnectionStringException(string connectionName)
            : base(string.Format("The connection string is not config in the config file.", connectionName))
        {

        }
    }

    class AppSettingItemMissException : Exception
    {
        public AppSettingItemMissException(string name)
            : base(GetMessage(name))
        {

        }

        static string GetMessage(string name)
        {
            var msg = string.Format("The app setting item '{0}' is not config.", name);
            return msg;
        }
    }

    class CookieRequiredException : Exception
    {
        const string msg = "The open id cookie is not exists.";
        public CookieRequiredException(string cookieName)
            : base(string.Format("The cookie named {0} is not exists.", cookieName))
        {

        }
    }

    class MemberNotExistsException : Exception
    {
        public MemberNotExistsException(string username)
            : base(string.Format("用户'{0}'不存在", username))
        {

        }
    }

    class PasswordIncorrectException : Exception
    {
        public PasswordIncorrectException()
            : base("密码不正确")
        {

        }
    }

    class UserRecordNotExistsException : Exception
    {
        public UserRecordNotExistsException(string openId)
            : base(string.Format("The user record with openid '{0}' is not exists.", openId))
        {

        }
    }

    class NotAllowCallException : Exception
    {
        public NotAllowCallException(string msg)
            : base(msg)
        {

        }
    }

    class GetAppTokenFailException : Exception
    {
        public GetAppTokenFailException()
            : base("Get application token fail")
        {

        }
    }

    public static class Error
    {
        public static Exception NotConfigConnectionString(string connectionName)
        {
            return new NotConfigConnectionStringException(connectionName);
        }

        public static Exception ArgumentNull(string paramName)
        {
            return new ArgumentNullException(paramName);
        }

        public static Exception AppSettingItemMiss(string name)
        {
            return new AppSettingItemMissException(name);
        }

        internal static Exception CookieNotExists(string cookieName)
        {
            return new CookieRequiredException(cookieName);
        }

        internal static Exception MemberNotExists(string username)
        {
            return new MemberNotExistsException(username);
        }

        internal static Exception PasswordIncorrect()
        {
            return new PasswordIncorrectException();
        }

        internal static Exception UserRecordNotExists(string openId)
        {
            return new UserRecordNotExistsException(openId);
        }

        internal static Exception NotAllowCall(string msg)
        {
            return new NotAllowCallException(msg);
        }

        internal static Exception GetAppTokenFail()
        {
            return new GetAppTokenFailException();
        }
    }
}