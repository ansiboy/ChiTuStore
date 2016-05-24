
import chitu = require('chitu');
import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');
import Carousel = require('Core/Carousel');

chitu.Utility.loadjs('UI/PromotionLabel');

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

    constructor(html) {
        super(html);

        this.findControl<chitu.ScrollView>('products').scrollLoad = IndexPage.scrollView_load;
        this.load.add(this.page_load);

        ko.applyBindings(this.model, this.element);
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
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
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
