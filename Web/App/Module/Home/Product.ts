import app = require('Application');
import site = require('Site');
import shopping = require('Services/Shopping');
import shoppingCart = require('Services/ShoppingCart');
import mapping = require('knockout.mapping');

import TopBar = require('UI/TopBar');
import ProductPanel = require('Module/Home/Product/ProductPanel');
import ProductDetailPanel = require('Module/Home/Product/ProductDetailPanel');
import auth = require('Services/Auth');

var services = window['services'];

//requirejs(['css!content/Home/Product'], function () { });

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
                shopping_cart_page.on_load(<chitu.PageLoadArguments>{});
        });
    }
    back = () => {
        app.back().fail(() => {
            app.redirect('Home_ProductList_category_' + ko.unwrap(this['product'].ProductCategoryId));
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

export = function (page: chitu.Page) {

    var viewDeferred = page.view;
    page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/Promotion','css!content/Home/Product']));

    var model = new ProductModel(page);
    page.load.add(function (sender, args) {
        var productId = args.id;
        auth.whenLogin(() => shopping.isFavored(productId).done((value) => model.isFavored(value)));
        //page['iscroller'].disable()
        return $.when(shopping.getProduct(productId), services.shopping.getProductStock(productId),
            shopping.getProductComments(args.id, 4))
            .done(function (product: any, stock, comments) {
                product.Stock = stock.Quantity != null ? stock.Quantity : 1000000; //如果 Quantity 没有，则不限库存
                model.comments(comments);

                model.product = mapping.fromJS(product);

                model.product.Count = ko.observable(1);
                model.product.SelectedText = ko.computed(function () {
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

                }, model.product)

            });
    });

    //======================================================================
    // 实现顶部图片切换
    page.viewChanged.add(() => {
        //=============================================
        // 移除掉原来的 TopBar
        //$(page.nodes().header).find('.topbar').first().remove();
        //=============================================

//         requirejs(['swiper'], function (Swiper) {
//             var mySwiper = new Swiper($(page.node()).find('[name="productImages"]')[0], {
//                 pagination: $(page.node()).find('[name="productImages-pagination"]')[0],
//                 onTap: function (swiper, event) {
//                     //TODO:以弹出方式显示图片
//                 }
//             });
// 
//         })
    });
    //======================================================================
    // 说明：必须是视图，和加载都加完成了，才进行绑定。
    page.loadCompleted.add(() => ko.applyBindings(model, page.node));


};