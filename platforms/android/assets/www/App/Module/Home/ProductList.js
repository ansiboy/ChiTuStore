/// <reference path='../../../Scripts/typings/require.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'Services/Shopping', 'knockout.mapping', 'knockout', 'Site'], function (require, exports, app, shopping, mapping, ko, site) {
    requirejs(['UI/PromotionLabel', 'css!content/Home/ProductList']);
    var BRAND_NONE_NAME = '全部品牌';
    var PageModel = (function () {
        function PageModel(page) {
            var _this = this;
            this.loadFilterDialog = $.Deferred();
            this.firstLoad = true;
            this.queryArguments = {
                brandId: null,
                categoryId: null,
                pageIndex: 0,
                searchText: null,
                sort: ko.observable(''),
                filter: ko.observable('')
            };
            this.title = ko.observable();
            this.isLoading = ko.observable(false);
            this.products = ko.observableArray();
            this.brands = ko.observableArray();
            this.isFilteByCategory = ko.observable();
            this.page = page;
            requirejs(['mod/Home/ProductList/ProductsFilter'], function (filterDialog) {
                _this.loadFilterDialog.resolve(filterDialog);
                filterDialog.after_ok.add(function (args) {
                    _this.queryArguments.pageIndex = 0;
                    _this.queryArguments.filter(args.filter);
                    _this.products.removeAll();
                    _this.page.on_load({ loadType: chitu.PageLoadType.scroll });
                });
            });
        }
        PageModel.prototype.resetQueryArguments = function () {
            this.queryArguments.brandId = null;
            this.queryArguments.categoryId = null;
            this.queryArguments.pageIndex = 0;
            this.queryArguments.sort('');
            this.queryArguments.filter('');
        };
        ;
        PageModel.prototype.back = function () {
            return app.back().fail(function () {
                app.redirect('#Home_Class');
            });
        };
        PageModel.prototype.loadProducts = function (clear) {
            var _this = this;
            clear = (clear === undefined) ? true : clear;
            var args = $.extend({}, mapping.toJS(this.queryArguments));
            return shopping.getProducts(args).done(function (items, filter) {
                if (clear == true)
                    _this.products.removeAll();
                for (var i = 0; i < items.length; i++) {
                    _this.products.push(items[i]);
                }
            });
        };
        PageModel.prototype.sort = function (model, event) {
            var type = $(event.target).attr('data-type') || $(event.target).parent().attr('data-type');
            switch (type) {
                case 'Default':
                    model.queryArguments.sort('');
                    break;
                case 'SalesNumber':
                    model.queryArguments.sort('SalesNumber asc');
                    break;
                case 'Price':
                    if (model.queryArguments.sort() == 'Price asc') {
                        model.queryArguments.sort('Price desc');
                    }
                    else {
                        model.queryArguments.sort('Price asc');
                    }
                    break;
            }
            model.queryArguments.pageIndex = 0;
            model.products.removeAll();
            var scroll_view = model.page.findControl('products');
            return scroll_view.on_load({});
        };
        PageModel.prototype.showFilterDialog = function (model, event) {
            model.loadFilterDialog.done(function (filterDialog) {
                filterDialog.brands(model.brands());
                filterDialog.filter.minPrice(null);
                filterDialog.filter.maxPrice(null);
                filterDialog.show();
                filterDialog.event = event;
            });
        };
        return PageModel;
    })();
    var ProductListPage = (function (_super) {
        __extends(ProductListPage, _super);
        function ProductListPage(html) {
            _super.call(this, html);
            this.model = new PageModel(this);
            this.load.add(this.page_load);
        }
        ProductListPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            var scroll_view = sender.findControl('products');
            scroll_view.scrollLoad = sender.scrollView_load;
            if (args.type == 'category')
                sender.model.queryArguments.categoryId = args.id;
        };
        ProductListPage.prototype.scrollView_load = function (sender, args) {
            var model = sender.page.model;
            model.isLoading(true);
            return model.loadProducts(false).done(function (items, filter) {
                model.isLoading(false);
                if (model.queryArguments.filter().indexOf('BrandId') < 0) {
                    filter.Brands.unshift({ Id: '', Name: BRAND_NONE_NAME });
                    model.brands(filter.Brands);
                }
                model.queryArguments.pageIndex = model.queryArguments.pageIndex + 1;
                args.enableScrollLoad = items.length == site.config.pageSize;
            });
        };
        return ProductListPage;
    })(chitu.Page);
    return ProductListPage;
});
