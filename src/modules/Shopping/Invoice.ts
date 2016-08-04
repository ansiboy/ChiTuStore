import app = require('Application');
import ko_val = require('knockout.validation');

class PageModel {
    private invoice = {
        type: ko.observable('个人'),
        title: ko.observable('').extend({ required: true })
    }
    private page: InvoicePage;

    public validation: KnockoutValidationErrors;
    public order: any;

    constructor(page: InvoicePage) {
        this.page = page;
    }

    confirm = (model: PageModel) => {
        model.validation = ko_val.group(model.invoice);
        if (!(<any>model.invoice).isValid()) {
            model.validation.showAllMessages();
            return;
        }
        var text = chitu.Utility.format('类型：{0}，抬头：{1}', model.invoice.type(), model.invoice.title());
        model.order.Invoice(text);
        app.back();
    }
    back() {
        app.back();
    }
}
class InvoicePage extends chitu.Page {
    private model: PageModel;
    constructor(html) {
        super(html);
        this.model = new PageModel(this);
        this.load.add((sender: InvoicePage, args) => {
            this.model.order = args.order;
            ko.applyBindings(sender.model, sender.element);
        });
    }
}

export = InvoicePage;
