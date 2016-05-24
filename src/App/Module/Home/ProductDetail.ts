
import shopping = require('Services/Shopping');
import mapping = require('knockout.mapping');
import IScroll = require('iscroll');

class ProductDetailPage extends chitu.Page {
    private model;
    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(sender: ProductDetailPage,args:any) {
        var productId = args.id;
        var result = shopping.getProductIntroduce(productId).done((data) => {
            if (sender.model == null) {
                sender.model = mapping.fromJS(data);
                ko.applyBindings(sender.model, sender.element);
            }
            else {
                mapping.fromJS(data, {}, sender.model);
            }
        })
        return result;
    }

}

export = ProductDetailPage;

// function(page: chitu.Page) {

//     var model;

//     var productId = page.routeData.values.id;
//     var result = shopping.getProductIntroduce(productId).done((data) => {
//         if (model == null) {
//             model = mapping.fromJS(data);
//             ko.applyBindings(model, page.element);
//         }
//         else {
//             mapping.fromJS(data, {}, model);
//         }
//     })

//     page.viewChanged.add(() => {
//         (<chitu.IScrollView>page.findControl('introduce')).load.add(() => result);
//     });
// } 