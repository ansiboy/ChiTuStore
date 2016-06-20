import services = require('services/Service');
import app = require('Application');
import shopping = require('services/Shopping');
import mapping = require('knockout.mapping');
import ko = require('knockout');
import site = require('Site');
import ScrollBottomLoad = require('core/ScrollBottomLoad');

requirejs(['ui/PromotionLabel', 'css!content/Home/ProductList']);

var BRAND_NONE_NAME = '全部品牌';

class PageModel {
    private page: ProductListPage;
    private loadFilterDialog = $.Deferred();

    constructor(page: ProductListPage) {
        this.page = page;

        requirejs(['mod/Home/ProductList/ProductsFilter'], (filterDialog: any) => {

            this.loadFilterDialog.resolve(filterDialog);

            filterDialog.after_ok.add((args) => {
                this.queryArguments.pageIndex = 0;
                this.queryArguments.filter(args.filter);
                this.products.removeAll();
                this.page.on_load({ loadType: chitu.PageLoadType.scroll });
            });
        });
    }

    firstLoad = true;
    queryArguments = {
        brandId: null,
        categoryId: null,
        pageIndex: 0,
        searchText: null,
        sort: ko.observable(''),
        filter: ko.observable('')
    };
    resetQueryArguments() {
        this.queryArguments.brandId = null;
        this.queryArguments.categoryId = null;
        this.queryArguments.pageIndex = 0;
        this.queryArguments.sort('');
        this.queryArguments.filter('');
    };
    title = ko.observable();
    isLoading = ko.observable(false);
    products = ko.observableArray();
    brands = ko.observableArray();
    back() {
        return app.back().fail(function () {
            app.redirect('#Home_Class');
        });
    }
    isFilteByCategory = ko.observable();
    loadProducts(clear) {
        clear = (clear === undefined) ? true : clear;
        var args = $.extend({}, mapping.toJS(this.queryArguments));
        return shopping.getProducts(args).done((items: any[], filter) => {
            if (clear == true)
                this.products.removeAll();

            for (var i = 0; i < items.length; i++) {
                this.products.push(items[i]);
            }
        });
    }
    sort(model: PageModel, event) {

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
        let scroll_view = model.page.findControl<chitu.ScrollView>('products');
        return scroll_view.on_load({}); //page['scrollLoad']();
    }
    showFilterDialog(model: PageModel, event) {
        model.loadFilterDialog.done(function (filterDialog: any) {
            filterDialog.brands(model.brands());
            filterDialog.filter.minPrice(null);
            filterDialog.filter.maxPrice(null);
            filterDialog.show();
            filterDialog.event = event;
        });
    }
}

class ProductListPage extends chitu.Page {
    private model: PageModel;
    private scrollBottomLoad: ScrollBottomLoad;

    constructor(html) {
        super(html);

        this.model = new PageModel(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: ProductListPage, args: any) {
        ko.applyBindings(sender.model, sender.element);
        let scroll_view = sender.findControl<chitu.ScrollView>('products');
        this.scrollBottomLoad = new ScrollBottomLoad(scroll_view, (s, a) => (this.scrollView_load(s, a)));
        if (args.type == 'category')
            sender.model.queryArguments.categoryId = args.id;


        return sender.scrollView_load(scroll_view, {});
    }

    scrollView_load(sender: chitu.ScrollView, args) {
        var model = (<ProductListPage>sender.page).model;
        model.isLoading(true);
        return model.loadProducts(false).done((items: Array<any>, filter) => {
            model.isLoading(false);
            if (model.queryArguments.filter().indexOf('BrandId') < 0) {
                filter.Brands.unshift({ Id: '', Name: BRAND_NONE_NAME });
                model.brands(filter.Brands);
            }

            model.queryArguments.pageIndex = model.queryArguments.pageIndex + 1;
            this.scrollBottomLoad.enableScrollLoad = items.length == services.defaultPageSize;

        });
    }
}

export = ProductListPage;
