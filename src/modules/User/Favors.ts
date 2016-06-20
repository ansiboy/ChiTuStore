
import shopping = require('services/Shopping')

requirejs(['css!content/User/Favors']);

export = class FavorPage extends chitu.Page {
    private config = {
        pullDown: {}
    }

    private model = {
        favors: ko.observableArray(),
        loading: ko.observable(),
        unfavor: (item) => {
            shopping.unFavorProduct(item.ProductId).done(() => {
                item.Status('UnFavor');
            });
        },
        showProduct: (item) => {
            window.location.href = '#Home_Product_' + ko.unwrap(item.ProductId);
        }
    }

    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(sender: FavorPage, args: any) {
        ko.applyBindings(sender.model, sender.element);
        sender.model.loading(true);
        return shopping.getFavorProducts()
            .done((data) => {
                for (var i = 0; i < data.length; i++) {
                    data[i].Status = ko.observable('Favor');
                    sender.model.favors.push(data[i]);
                }
            })
            .always(() => {
                sender.model.loading(false);
            });
    }
}

// function(page: chitu.Page) {
//     var config = {
//         pullDown: {}
//     }

//     var model = {
//         favors: ko.observableArray(),
//         loading: ko.observable(),
//         unfavor: (item) => {
//             shopping.unFavorProduct(item.ProductId).done(() => {
//                 item.Status('UnFavor');
//             });
//         },
//         showProduct: (item) => {
//             window.location.href = '#Home_Product_' + ko.unwrap(item.ProductId);
//         }
//     }

//     page.viewChanged.add(() => {
//         page.findControl('favors').load.add(() => {
//             model.loading(true);
//             return shopping.getFavorProducts()
//                 .done((data) => {
//                     for (var i = 0; i < data.length; i++) {
//                         data[i].Status = ko.observable('Favor');
//                         model.favors.push(data[i]);
//                     }
//                 })
//                 .always(() => {
//                     model.loading(false);
//                 });
//         });
//         ko.applyBindings(model, page.element);
//     });
// } 