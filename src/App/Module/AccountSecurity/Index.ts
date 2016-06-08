requirejs(['css!content/User/AccountSecurity/Index']);
import auth = require('Services/Auth');
import ko = require('knockout');
import services = require('Services/Service');


class Model {
    mobile = auth.currentMember.mobile;
    passwordSetted = auth.currentMember.passwordSetted;
    paymentPasswordSetted = auth.currentMember.paymentPasswordSetted;

    isWeiXin = ko.computed<boolean>(() => {
        return services['weixin'] != null;
    })
    mobileBindingUrl = ko.computed<string>(() => {
        if (!this.mobile()) {
            return '#AccountSecurity_MobileSetting';
        }
        return '#AccountSecurity_Setting_MobileBinding';
    })
}
export = class AccountSecurityIndexPage extends chitu.Page {
    private model: Model;
    constructor(html) {
        super(html);
        this.model = new Model();
        ko.applyBindings(this.model, this.element);
    }
}