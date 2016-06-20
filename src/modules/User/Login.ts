
import member = require('services/Auth');
import app = require('Application');
import validation = require('knockout.validation');

class PageModel {
    private username = ko.observable<string>().extend({ required: { message: '请输入用户名' } });
    private password = ko.observable<string>().extend({ required: { message: '请输入密码' } });
    private val: KnockoutValidationErrors;
    
    public login(model: PageModel) {
        if (!model['isValid']()) {
            model.val.showAllMessages();
            return;
        }

        return member.login(model.username(), model.password())
            .done(function (data) {
                if (this.redirectUrl)
                    return app.showPage(this.redirectUrl, undefined);

                app.redirect('#User_Index');
            })
    }
    
    constructor() {
        this.val = validation.group(this);
    }
}

class LoginPage extends chitu.Page {
    private redirectUrl = '';
    private model :PageModel;

    constructor(html) {
        super(html);
        this.model = new PageModel();
        this.load.add(this.page_load);
    }

    private page_load(sender: LoginPage, args: any) {
        sender.redirectUrl = args.redirectUrl;
        ko.applyBindings(sender.model, sender.element);
    }
}

export = LoginPage;

