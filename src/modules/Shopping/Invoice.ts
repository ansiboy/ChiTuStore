import app = require('Application');
import ko_val = require('knockout.validation');

requirejs(['css!content/Shopping/Invoice']);

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

    confirm(model: PageModel) {
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
            ko.applyBindings(sender.model, sender.element);
        });
        // this.showing.add(function (sender: InvoicePage, args) {
        //     if (sender.model.validation)
        //         sender.model.validation.showAllMessages(false);
        // });
    }
    private page_load(sender: InvoicePage, args) {

    }
}

// export = function (page: chitu.Page) {
//     /// <param name="page" type="chitu.Page"/>


//     var model = {
//         invoice: {
//             type: ko.observable('个人'),
//             title: ko.observable('').extend({ required: true })
//         },
//         confirm: function () {
//             validation = ko_val.group(model.invoice);
//             if (!(<any>model.invoice).isValid()) {
//                 validation.showAllMessages();
//                 return;
//             }
//             var text = chitu.Utility.format('类型：{0}，抬头：{1}', model.invoice.type(), model.invoice.title());
//             (<any>page).params.order.Invoice(text);
//             app.back();
//         },
//         back: function () {
//             app.back();
//         }
//     };

//     page.load.add(function (sender, args) {
//         (<any>page).params = args;
//     });

//     page.showing.add(function () {
//         if (validation)
//             validation.showAllMessages(false);
//     });

//     page.viewChanged.add(() => ko.applyBindings(model, page.element));
// }