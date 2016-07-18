
import chitu = require('chitu');
import ko = require('knockout');
import app = require('Application');
import services = require('services/Service');
import home = require('services/Home');
import Carousel = require('core/Carousel');
import ScrollBottomLoad = require('core/ScrollBottomLoad');

chitu.Utility.loadjs('ui/PromotionLabel');

class IndexPage extends chitu.Page {
    private homeProductQueryArguments = {
        pageIndex: 0
    }

    private model = {
        name: ko.observable(''),
        brands: ko.observableArray(),
        advertItems: ko.observableArray(),
        homeProducts: ko.observableArray()
    };

    private scrollBottomLoad: ScrollBottomLoad;

    constructor(params) {
        super(params);

        let productsView = this.findControl<chitu.ScrollView>('products');
        this.load.add(this.page_load);

        ko.applyBindings(this.model, this.element);
        this.scrollBottomLoad = new ScrollBottomLoad(productsView, IndexPage.scrollView_load);
        IndexPage.scrollView_load(productsView, {});
    }

    private static scrollView_load(sender: chitu.ScrollView, args) {
        var page = <IndexPage>sender.page;

        var result = home.homeProducts(page.homeProductQueryArguments.pageIndex)
            .done(function (homeProducts: Array<any>) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    page.model.homeProducts.push(homeProducts[i]);
                }

                page.homeProductQueryArguments.pageIndex++;
                page.scrollBottomLoad.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });

        return result;
    }

    private page_load(sender: IndexPage, args) {
        return home.advertItems().done(function (advertItems) {
            for (var i = 0; i < advertItems.length; i++) {
                advertItems[i].index = i;
                advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                sender.model.advertItems.push(advertItems[i]);
            }

            var c = new Carousel($(sender.element).find('[name="ad-swiper"]')[0]);
        });
    }
}

export = IndexPage;
