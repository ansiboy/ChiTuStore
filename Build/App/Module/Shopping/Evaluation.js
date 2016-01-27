define(["require", "exports", 'Services/Account', 'Application', 'Services/Service'], function (require, exports, account, app, services) {
    requirejs(['css!content/Shopping/Evaluation']);
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.products = ko.observableArray();
            this.status = ko.observable('ToEvaluate');
            this.isLoading = ko.observable(false);
            this.loadProducts = function () {
                var deferred;
                _this.isLoading(true);
                var status = _this.status();
                if (status == 'ToEvaluate') {
                    deferred = account.getToCommentProducts();
                }
                else {
                    deferred = account.getCommentedProducts();
                }
                return deferred.done(function (products) {
                    for (var i = 0; i < products.length; i++) {
                        products[i].Status = ko.observable(status);
                    }
                    if (_this.page['iscroller']) {
                        window.setTimeout(function () { return _this.page['iscroller'].refresh(); }, 200);
                    }
                    _this.isLoading(false);
                    _this.products(products);
                });
            };
            this.getLoadProducts = function (status) {
                return function () {
                    _this.products.removeAll();
                    _this.status(status);
                    return _this.page.on_load({ loadType: chitu.PageLoadType.scroll });
                };
            };
            this.evaluate = function (item) {
                var evaluatePage = app.redirect('Shopping_ProductEvaluate', { orderDetailId: item.OrderDetailId, productImageUrl: item.ImageUrl });
                evaluatePage['submited'] = function () {
                    debugger;
                    item.Status('Evaluated');
                };
            };
            this.showProduct = function (item) {
                debugger;
                return app.redirect('Home_Product_' + ko.unwrap(item.Id));
            };
            this.page = page;
            page.closed.add(function () {
            });
        }
        return Model;
    })();
    return function (page) {
        var model = new Model(page);
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
        page.load.add(function (sender, args) {
            return model.loadProducts().done(function (items) {
                args.enableScrollLoad = items.length < services.defaultPageSize;
            });
        });
    };
});
