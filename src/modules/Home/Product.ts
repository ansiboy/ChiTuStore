import app = require('Application');
import shopping = require('services/Shopping');
import shoppingCart = require('services/ShoppingCart');
import mapping = require('knockout.mapping');
import chitu = require('chitu');
import ProductPanel = require('modules/Home/Product/ProductPanel');
import ProductDetailPanel = require('modules/Home/Product/ProductDetailPanel');
import ScrollViewGesture = require('core/ScrollViewGesture');
import site = require('Site');
//TODO:以弹出方式显示图片
chitu.Utility.loadjs('ui/Promotion');

const PRODUCT_PULL_UP_DEFAULT_TEXT = '上拉查看图文详情';
const PRODUCT_PULL_UP_RELEASE_TEXT = '释放查看图文详情';
const IMAGE_TEXT_PULL_DOWN_DEFAULT_TEXT = '下拉查看商品详情';
const IMAGE_TEXT_PULL_DOWN_RELEASE_TEXT = '释放查看商品详情';

class ProductModel {
    private page: ProductPage;
    private _product: any;
    private _optionPanel: ProductPanel;
    private _detailPanel: ProductDetailPanel;

    productPullUpText = ko.observable(PRODUCT_PULL_UP_DEFAULT_TEXT);

    comments = ko.observableArray()

    constructor(page: ProductPage) {
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
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
    }

    private showDetailView() {
        var displayView = this.page.image_text_view2;
        this.page.scroll_view_gesture.showView(displayView, 'left');
    }
}

class ImageTextModel {
    Introduce = ko.observable<string>();
    imageTextPullDownText = ko.observable(IMAGE_TEXT_PULL_DOWN_DEFAULT_TEXT);
    loading = ko.observable<boolean>(true);
}

class CommentsModel {
    comments = ko.observableArray();
    loading = ko.observable<boolean>(true);
}

class ProductPage extends chitu.Page {

    private model: ProductModel;
    private imageTextModel: ImageTextModel;
    private commentsModel: CommentsModel;
    private product_view: chitu.ScrollView;
    private image_text_view: chitu.ScrollView;
    public image_text_view2: chitu.ScrollView;
    public scroll_view_gesture: ScrollViewGesture;
    private product_comments_view: chitu.ScrollView;
    constructor(html) {
        super(html);

        this.model = new ProductModel(this);
        this.imageTextModel = new ImageTextModel();
        this.commentsModel = new CommentsModel();

        this.load.add(this.page_load);

        this.product_view = this.findControl<chitu.ScrollView>('product');
        this.image_text_view = this.findControl<chitu.ScrollView>('image-text');
        this.image_text_view2 = this.findControl<chitu.ScrollView>('image-text2');
        this.product_comments_view = this.findControl<chitu.ScrollView>('product-comments');

        this.product_view.scroll.add($.proxy(this.view_scroll, this));
        this.image_text_view.scroll.add($.proxy(this.view_scroll, this));

        this.scroll_view_gesture = new ScrollViewGesture(this.product_view);
        this.scroll_view_gesture.viewChanged.add((sender, args) => this.view_changed(sender, args));
        this.scroll_view_gesture.offset.pullUp = -50;
        this.scroll_view_gesture.offset.pullDown = 80;
    }

    protected createChild(element: HTMLElement) {
        if (site.env.isIOS && element.tagName == 'SCROLL-VIEW')
            $(element).attr('scroll-type', 'iscroll');

        return super.createChild(element, this);
    }

    private page_load(sender: ProductPage, args: any) {
        ko.applyBindings(this.imageTextModel, this.image_text_view.element);
        ko.applyBindings(this.imageTextModel, this.image_text_view2.element);
        ko.applyBindings(this.commentsModel, this.product_comments_view.element);

        return $.when(shopping.getProduct(args.id), shopping.getProductStock(args.id),
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
                ko.applyBindings(sender.model, sender.product_view.element);
            });
    }

    private view_changed(sender: ScrollViewGesture, args: { view: chitu.ScrollView, direction: string, prev: chitu.ScrollView }) {
        // 切换视图， 根据不同视图加载对应的数据
        this.model.productPullUpText(PRODUCT_PULL_UP_DEFAULT_TEXT);

        let productId = (<chitu.Page>args.view.parent).routeData.values.id;
        if (args.view == this.image_text_view || args.view == this.image_text_view2) {
            if (!this.imageTextModel.Introduce()) {
                shopping.getProductIntroduce(productId).done((data) => {
                    this.imageTextModel.loading(false);
                    this.imageTextModel.Introduce(data.Introduce);
                })
            }
        }
        else if (args.view == this.product_comments_view) {
            shopping.getProductComments(productId, 10).done((comments) => {
                this.commentsModel.loading(false);
                return this.commentsModel.comments(comments);
            });
        }
    }

    private view_scroll(sender: chitu.ScrollView, args: chitu.ScrollArguments) {
        if (sender == this.product_view) {
            // 说明：处理上拉
            let deltaY = (args.scrollHeight + args.scrollTop) - args.clientHeight;
            if (deltaY < this.scroll_view_gesture.offset.pullUp) {
                this.model.productPullUpText(PRODUCT_PULL_UP_RELEASE_TEXT);
            }
            else {
                this.model.productPullUpText(PRODUCT_PULL_UP_DEFAULT_TEXT);
            }
            console.log('deltaY:' + deltaY);
        }
        else if (sender == this.image_text_view) {
            // 说明：处理下拉
            let deltaY = args.scrollTop;
            if (deltaY > this.scroll_view_gesture.offset.pullDown) {
                this.imageTextModel.imageTextPullDownText(IMAGE_TEXT_PULL_DOWN_RELEASE_TEXT);
            }
            else {
                this.imageTextModel.imageTextPullDownText(IMAGE_TEXT_PULL_DOWN_DEFAULT_TEXT);
            }
        }

    }
}

export = ProductPage;