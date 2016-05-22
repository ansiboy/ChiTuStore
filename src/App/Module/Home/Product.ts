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

chitu.Utility.loadjs(['css!content/Home/Product', 'UI/Promotion']);

class ProductPage extends chitu.Page {
    private model: ProductModel;
    constructor() {
        super();

        //var productId = this.routeData.values.id;
        //auth.whenLogin(() => shopping.isFavored(productId).done((value) => this.model.isFavored(value)));
        this.model = new ProductModel(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: ProductPage, args: any) {
        return $.when(shopping.getProduct(args.id), services.shopping.getProductStock(args.id),
            shopping.getProductComments(args.id, 4), chitu.Utility.loadjs([]))

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
                //$(sender.container.element).find('.page-loading').hide();
            });
    }
}

export = ProductPage;

// export = function (page: chitu.Page) {

//     //var viewDeferred = page.view;
//     //page.view = $.when(viewDeferred, ));






//     function on_load(sender: chitu.Page, args) {
//         return result;
//     }

//     page.viewChanged.add(() => {
//         var scroll_view = page.findControl<chitu.ScrollView>('product');
//         scroll_view.load.add(on_load);
//         scroll_view.scroll.add(() => console.log('scroll'));
//         //window.setTimeout(() => {

//         //requirejs(['hammer'], function(hammer_func) {
//         var container_width = $(page.container.element).width();

//         var $active_item: JQuery;
//         var $next_item: JQuery;
//         var $prev_item: JQuery;

//         var active_item_pos = 0;
//         var next_item_pos = container_width;
//         var prev_item_pos = 0 - container_width;

//         var pan = page.container.gesture.createPan(page.container.element);
//         pan.start = (e: PanEvent) => {
//             console.log('start');
//             $active_item = $(page.element).find('scroll-view.active');
//             if ($active_item.length == 0 || chitu.ScrollView.scrolling) {
//                 return false;
//             }

//             //==================================================
//             // 说明：计算角度，超过了水平滑动角度，则认为不是水平滑动。
//             var d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
//             if (d > 20)
//                 return false;
//             //==================================================

//             $next_item = $active_item.next('scroll-view');
//             $prev_item = $active_item.prev('scroll-view');

//             var index = $(page.element).find('scroll-view').index($active_item);
//             var started = (index == 0 && (e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT) || (index == 1) ||
//                 (index == 2 && (e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT);
//             return started;
//         };

//         pan.left = (e: PanEvent) => {
//             move($active_item[0]).x(active_item_pos + e.deltaX).duration(0).end();
//             if ($next_item.length > 0)
//                 move($next_item[0]).x(next_item_pos + e.deltaX).duration(0).end();

//             if ($prev_item.length > 0)
//                 move($prev_item[0]).x(prev_item_pos + e.deltaX).duration(0).end();

//         };

//         pan.right = (e: PanEvent) => {
//             move($active_item[0]).x(active_item_pos + e.deltaX).duration(0).end();
//             if ($next_item.length > 0)
//                 move($next_item[0]).x(next_item_pos + e.deltaX).duration(0).end();

//             if ($prev_item.length > 0)
//                 move($prev_item[0]).x(prev_item_pos + e.deltaX).duration(0).end();

//             page.container.gesture.prevent.pan(Hammer.DIRECTION_RIGHT);
//         }

//         pan.end = (e: PanEvent) => {
//             console.log('end');
//             if (Math.abs(e.deltaX) / container_width < 0.5) {
//                 move($active_item[0]).x(active_item_pos).end();
//                 if ($next_item.length > 0)
//                     move($next_item[0]).x(next_item_pos).end();
//                 if ($prev_item.length > 0)
//                     move($prev_item[0]).x(prev_item_pos).end();

//                 return;
//             }

//             if (e.deltaX < 0 && $next_item.length > 0) { // 向左移动
//                 move($active_item[0]).x(prev_item_pos).end();
//                 move($next_item[0]).x(active_item_pos).end();
//                 $next_item.addClass('active');
//                 $active_item.removeClass('active');
//             }
//             else if (e.deltaX > 0 && $prev_item.length > 0) { // 向右移动
//                 move($active_item[0]).x(next_item_pos).end();
//                 move($prev_item[0]).x(active_item_pos).end();
//                 $prev_item.addClass('active');
//                 $active_item.removeClass('active');
//             }

//             $active_item = $(page.element).find('scroll-view.active');
//             $next_item = $active_item.next('scroll-view');
//             $prev_item = $active_item.prev('scroll-view');
//         }


//     });



// };