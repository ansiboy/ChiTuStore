
import chitu = require('chitu');
import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');
import Carousel = require('Core/Carousel');

chitu.Utility.loadjs(['UI/PromotionLabel', 'css!sc/Home/Index']);//

class IndexPage extends chitu.Page {
    private homeProductQueryArguments = {
        pageIndex: 0
    }

    private model = {
        name: ko.observable(''),
        brands: ko.observableArray(),
        advertItems: ko.observableArray(),
        homeProducts: ko.observableArray(),
        pay: function () {
            (<any>window).alipay.pay({
                tradeNo: 'g1239aaga1142f',//tradeNo,
                subject: "测试标题",
                body: "我是测试内容",
                price: 0.01,
                notifyUrl: "http://your.server.notify.url"
            },
                function (successResults) {
                    alert(successResults)
                },
                function (errorResults) {
                    alert(errorResults)
                });
        }
    };

    constructor() {
        super();

        //this.load.add(this.page_load);
        this.viewChanged.add(this.page_viewChanged);
    }

    private page_load(sender: chitu.ScrollView | IndexPage, args) {
        var page: IndexPage;
        if (sender instanceof IndexPage)
            page = <IndexPage>sender;
        else
            page = <IndexPage>((<chitu.ScrollView>sender).page);

        var result = home.homeProducts(page.homeProductQueryArguments.pageIndex)
            .done(function (homeProducts: Array<any>) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    page.model.homeProducts.push(homeProducts[i]);
                }

                page.homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
                $(page.container.element).find('.page-loading').hide();
            });

        return result;
    }

    private page_viewChanged(sender: IndexPage, args) {
        ko.applyBindings(sender.model, sender.element);
        var scroll_view = (<chitu.ScrollView>sender.findControl('products'));
        scroll_view.scrollLoad = sender.page_load;

        var items_deferred = home.advertItems().done(function (advertItems) {
            for (var i = 0; i < advertItems.length; i++) {
                advertItems[i].index = i;
                advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                sender.model.advertItems.push(advertItems[i]);
            }

            //requirejs(['Core/Carousel'], function(Carousel) {
            var c = new Carousel($(sender.element).find('[name="ad-swiper"]')[0]);
            scroll_view.scroll.add((sender, e) => {
                //if (e.scrollTop < 0) {
                c.pause = e.scrollTop < 0;
                // }
                // else {
                //     c.pause = false;
                // }
            });
            //})
        });
    }
}

export = IndexPage;
