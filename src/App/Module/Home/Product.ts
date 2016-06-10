import app = require('Application');
import site = require('Site');
import shopping = require('Services/Shopping');
import shoppingCart = require('Services/ShoppingCart');
import mapping = require('knockout.mapping');
import chitu = require('chitu');
import TopBar = require('UI/TopBar');
import ProductPanel = require('Module/Home/Product/ProductPanel');
import ProductDetailPanel = require('Module/Home/Product/ProductDetailPanel');
import auth = require('Services/Auth');
import ScrollViewGesture = require('Core/ScrollViewGesture');

var services = window['services'];

//TODO:以弹出方式显示图片

class ProductModel {
    private page: chitu.Page
    private _product: any
    private _optionPanel: ProductPanel
    private _detailPanel: ProductDetailPanel

    comments = ko.observableArray()

    constructor(page: chitu.Page) {
        this.page = page;
    }

    shoppingCartNumber = shoppingCart.info.itemsCount;

    get panel(): ProductPanel {
        if (this._optionPanel == null)
            this._optionPanel = new ProductPanel(this.page, this);

        return this._optionPanel;
    }
    get detailPanel() {
        if (this._detailPanel == null) {
            this._detailPanel = new ProductDetailPanel(this.page);
        }

        return this._detailPanel;
    }
    isFavored = ko.observable<boolean>(false)
    addToShoppingCart = () => {
        var product = this['product'];
        return shoppingCart.addItem(product, product.Count()).done(() => {
            var shopping_cart_page = app.getPage('Shopping.ShoppingCart');
            if (shopping_cart_page)
                shopping_cart_page.on_load({});
        });
    }
    back = () => {
        app.back().fail(() => {
            app.redirect('#Home_ProductList_category_' + ko.unwrap(this['product'].ProductCategoryId));
        });
    }
    showPanel = () => {
        console.log('showPanel');
        this.panel.open();
    }
    favor = () => {
        if (this.product == null)
            return;

        if (this.isFavored()) {
            shopping.unFavorProduct(ko.unwrap(this.product.Id));
            return;
        }

        shopping.favorProduct(ko.unwrap(this.product.Id), ko.unwrap(this.product.Name));
    }
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
    }
}

chitu.Utility.loadjs('UI/Promotion');

class ProductPage extends chitu.Page {
    private model: ProductModel;
    constructor(html) {
        super(html);

        this.model = new ProductModel(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: ProductPage, args: any) {

        let page = sender;
        var container_width = $(page.container.element).width();

        var $active_item: JQuery;
        var $next_item: JQuery;
        var $prev_item: JQuery;

        var active_item_pos = 0;
        var next_item_pos = container_width;
        var prev_item_pos = 0 - container_width;
        new ScrollViewGesture(this.findControl<chitu.ScrollView>('product'));
       
        return $.when(shopping.getProduct(args.id), services.shopping.getProductStock(args.id),
            shopping.getProductComments(args.id, 4))

            .done(function (product: any, stock, comments) {
                product.Stock = stock.Quantity != null ? stock.Quantity : 1000000; //如果 Quantity 没有，则不限库存
                sender.model.comments(comments);

                sender.model.product = mapping.fromJS(product);

                sender.model.product.Count = ko.observable(1);
                sender.model.product.SelectedText = ko.computed(function () {
                    var str = '';
                    var props: Array<any> = mapping.toJS(this.CustomProperties);
                    for (var i = 0; i < props.length; i++) {
                        var options: Array<any> = props[i].Options;
                        for (var j = 0; j < options.length; j++) {
                            if (options[j].Selected) {
                                str = str + options[j].Name + ' ';
                                break;
                            }
                        }
                    }
                    str = str + this.Count() + '件';
                    return str;

                }, sender.model.product)
                ko.applyBindings(sender.model, sender.element);
            });
    }
}

export = ProductPage;