
enum OS {
    ios,
    android,
    other
}

class SiteCookies {
    constructor() {
    }

    sourceOpenId(value) {
        var name = this.get_cookieName('sourceOpenId');
        if (value === undefined)
            return site.cookies.get_value(name);

        if (!site.cookies.get_value(name))
            site.cookies.set_value(name, value);
    }
    returnUrl(value) {
        var name = 'returnUrl';
        if (value === undefined)
            return site.cookies.get_value(name);

        site.cookies.set_value(name, value);
    }
    //appToken(value: string = undefined): string {
    //    //只读，数据由服务端写入
    //    var name = 'appToken';
    //    if (value === undefined)
    //        return site.cookies.get_value(name);

    //    $.cookie(name, value);
    //    site.cookies.set_value(name, value);
    //}
    //token(value: string = undefined) {
    //    var name = 'token';
    //    if (value === undefined)
    //        return site.cookies.get_value(name);

    //    site.cookies.set_value(name, value);
    //}
    set_value(name: string, value: string, expires: number = 7) {
        var cookieName = site.cookies.get_cookieName(name);
        $.cookie(cookieName, value, { expires });
    }
    get_value(name: string) {
        var cookieName = site.cookies.get_cookieName(name);
        //return localStorage.getItem(cookieName);
        return $.cookie(cookieName);
    }
    get_cookieName(name) {
        return site.config.cookiePrefix + "_" + name;
    }
    //getAppToken() {
    //    /// <returns type="jQuery.Deferred"/>
    //    //debugger;
    //    if (site.cookies.appToken() != null)
    //        return $.Deferred().resolve(site.cookies.appToken());

    //    return $.ajax({
    //        url: 'Account/GetAppToken'

    //    }).then(function (data) {
    //        site.cookies.appToken(data.AppToken);//DA4A5B44C12F4E9D8E0872C4FDA8A6ABA2C0334CDB81CF84F12E29F7FB129F72F6EA604995785165
    //        return data.AppToken;
    //    });
    //}
}

class SiteStorage {
    private get_itemName(name) {
        return site.config.cookiePrefix + "_" + name;
    }
    get_item<T>(name: string) {
        var item_name = this.get_itemName(name);
        var str = window.localStorage.getItem(item_name);
        var obj = JSON.parse(str);
        return obj;
    }
    set_item<T>(name: string, value: T) {
        var item_name = this.get_itemName(name);
        var str = JSON.stringify(value);
        window.localStorage.setItem(item_name, str);
    }
    get historyKeywords(): string[] {
        var result = this.get_item('historyKeywords');
        if (result == null) {
            result = [];
            this.set_item('historyKeywords', result);
        }
        return result;
    }
    set historyKeywords(value: string[]) {
        this.set_item('historyKeywords', value);
    }
    get token(): string {
        return this.get_item('token');
    }
    set token(value: string) {
        this.set_item('token', value);
    }
}

class SiteConfig {
    storeName = '零食有约'
    pageSize = 10
    defaultUrl = 'Index'
    baseUrl = 'u.alinq.cn/test/Index.html'
    purchaseUrlFormat = 'pay/Purchase.html#{0}'

    cookiePrefix = 'lsyy'//该值需要设置
    //serviceUrl = ''
    //siteServiceUrl = ''
    //memberServiceUrl = ''
    //weixinServiceUrl = ''
    //accountServiceUrl = ''
    imageBaseUrl = 'http://shop.alinq.cn/AdminServices/Shop'

    pageAnimationTime = 500
    get animationSpeed() {
        return $(window).width() / this.pageAnimationTime;
    }
    panelWithRate = 0.9
    imageDataSpliter = '#'
}

class SiteEnvironment {
    private _environmentType;
    private _isIIS: boolean;
    private _os: OS;
    private _version: number;

    constructor() {
        var userAgent = navigator.userAgent;
        if (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0) {
            this._os = OS.ios;
            var match = userAgent.match(/iPhone OS\s([0-9\-]*)/);
            if (match) {
                var major_version = parseInt(match[1], 10);
                this._version = major_version;
            }
        }
        else if (userAgent.indexOf('Android') > 0) {
            this._os = OS.android;

            var match = userAgent.match(/Android\s([0-9\.]*)/);
            if (match) {
                var major_version = parseInt(match[1], 10);
                this._version = major_version;
            }
        }
        else {
            this._os = OS.other;
        }
    }
    get version(): number {
        return this._version;
    }

    get os(): OS {
        return this._os;
    }

    get isIOS() {
        return this.os == OS.ios;
    }
    get isAndroid() {
        return this.os == OS.android;
    }
    /// <summary>
    /// 判断是否为 APP
    /// </summary>
    get isApp() {
        return window['plus'] != null;
    }
    /// <summary>
    /// 是否需要降级
    /// </summary>
    get isDegrade(): boolean {
        if ((this.isWeiXin || this.version <= 4) && this.isAndroid)
            return true;

        if (navigator.userAgent.indexOf('MQQBrowser') >= 0) {
            return true;
        }
        return false;
    }
    get isWeiXin(): boolean {
        var ua = navigator.userAgent.toLowerCase();
        return <any>(ua.match(/MicroMessenger/i)) == 'micromessenger';
    }
    get isIPhone() {
        return window.navigator.userAgent.indexOf('iPhone') > 0
    }


}

class Site {
    config: SiteConfig
    cookies: SiteCookies
    storage: SiteStorage
    env: SiteEnvironment
    //ready: JQueryDeferred<any>;
    //browser = new Browser(navigator.userAgent);
    //error = $.Callbacks()

    private ready_funcs: Function[] = []
    private is_ready = false;

    constructor() {
        //this.ready = $.Deferred()
        this.config = new SiteConfig()
        this.cookies = new SiteCookies()
        this.storage = new SiteStorage()

        this.env = new SiteEnvironment()
    }

    //private invokeReadyFunc(func: Function) {
    //    func();
    //}

    //set_config(config) {
    //    site.config.cookiePrefix = config.CookiePrefix;
    //    //site.config.serviceUrl = config.ShopServiceUrl;
    //    //site.config.memberServiceUrl = config.MemberServiceUrl;
    //    //site.config.weixinServiceUrl = config.WeixinServiceUrl;
    //    //site.config.siteServiceUrl = config.SiteServiceUrl;
    //    //site.config.accountServiceUrl = config.AccountServiceUrl;
    //    site.config.imageBaseUrl = config.ImageBaseUrl;
    //    //site.cookies.appToken(config.AppToken);

    //    this.is_ready = true;
    //    for (var i = 0; i < this.ready_funcs.length; i++) {
    //        this.invokeReadyFunc(this.ready_funcs[i]);
    //    }
    //}

    //ready(func: Function) {

    //    if (func == null)
    //        throw new Error('Argument func is null');

    //    if (this.is_ready) {
    //        this.invokeReadyFunc(func);
    //        return;
    //    }

    //    this.ready_funcs.push(func);
    //}
}

var site: Site = window['site'] = window['site'] || new Site();


export =site;


