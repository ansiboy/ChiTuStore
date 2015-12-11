requirejs(['css!content/User/AccountSecurity/Index']);
import auth = require('Services/Auth');
import ko = require('knockout');
import services = require('Services/Service');
//import c = require('ui/ScrollLoad');

class Model {
    mobile = auth.currentMember.mobile;
    passwordSetted = auth.currentMember.passwordSetted;
    paymentPasswordSetted = auth.currentMember.paymentPasswordSetted;

    isWeiXin = ko.computed<boolean>(() => {
        return services['weixin'] != null;
    })
    mobileBindingUrl = ko.computed<string>(() => {
        if (!this.mobile()) {
            return '#User_AccountSecurity_MobileSetting';
        }
        return '#User_AccountSecurity_Setting_MobileBinding';
    })
}
export = function (page: chitu.Page) {
    var model = new Model();
    ko.applyBindings(model, page.nodes().content);
    //c.scrollLoad(page);
    //window.setTimeout(() => model.mobile(null), 200);
}