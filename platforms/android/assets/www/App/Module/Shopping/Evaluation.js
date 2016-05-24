/// <reference path='../../../Scripts/typings/require.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    var EvaluationPage = (function (_super) {
        __extends(EvaluationPage, _super);
        function EvaluationPage(html) {
            _super.call(this, html);
            this.model = new Model(this);
            this.load.add(this.page_load);
        }
        EvaluationPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            return sender.model.loadProducts().done(function (items) {
                args.enableScrollLoad = items.length < services.defaultPageSize;
            });
        };
        return EvaluationPage;
    })(chitu.Page);
    return EvaluationPage;
});
