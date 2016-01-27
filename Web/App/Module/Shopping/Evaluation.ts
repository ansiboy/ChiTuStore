import account = require('Services/Account');
import shopping = require('Services/Shopping');

import Page = require('Core/Page');
import ProductEvaluatePage = require('Module/Shopping/ProductEvaluate');
import app = require('Application');
import services = require('Services/Service');

requirejs(['css!content/Shopping/Evaluation']);

class Model {
    products = ko.observableArray()
    //evaluatePage = ProductEvaluatePage.createInstance()
    status = ko.observable('ToEvaluate')
    isLoading = ko.observable(false);

    page: chitu.Page

    constructor(page: chitu.Page) {
        this.page = page;
        page.closed.add(() => {
            //this.evaluatePage.close();
        })
    }

    loadProducts = () => {
        var deferred: LoadListPromise<any>;
        this.isLoading(true);

        var status = this.status();
        if (status == 'ToEvaluate') {
            deferred = account.getToCommentProducts();
        }
        else {
            deferred = account.getCommentedProducts();
        }

        return deferred.done((products) => {
            for (var i = 0; i < products.length; i++) {
                products[i].Status = ko.observable(status);
            }

            if (this.page['iscroller']) {
                window.setTimeout(() => this.page['iscroller'].refresh(), 200);
            }

            this.isLoading(false);
            this.products(products);
        })
    }

    getLoadProducts = (status) => {
        return () => {
            this.products.removeAll();
            this.status(status);
            return this.page.on_load({ loadType: chitu.PageLoadType.scroll });
        }
    }

    evaluate = (item) => {
        var evaluatePage = app.redirect('Shopping_ProductEvaluate', { orderDetailId: item.OrderDetailId, productImageUrl: item.ImageUrl });
        evaluatePage['submited'] = () => {
            debugger;
            item.Status('Evaluated');
        }
    }

    showProduct = (item) => {
        debugger;
        return app.redirect('Home_Product_' + ko.unwrap(item.Id));
    }

}



export = function (page: chitu.Page) {

    var model = new Model(page);
    page.viewChanged.add(() => ko.applyBindings(model, page.node()));

    page.load.add((sender:chitu.Page,args:chitu.PageLoadArguments) => {
        return model.loadProducts().done((items) => {
            args.enableScrollLoad = items.length < services.defaultPageSize;
        });
    });

}