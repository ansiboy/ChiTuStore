import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');

//import c = require('ui/ScrollLoad');



export var func = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    //var scroll_config = {
    //    pullDown: {
    //statusText: {
    //    init: '下拉可以刷新',
    //    ready: '松开后刷新',
    //    doing: '<div><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>',
    //    done: '更新完毕',
    //},
    //element: page.nodes().content.querySelector('.pull-down'),
    //text: function (status) {
    //    var node: HTMLElement = <HTMLElement>(<HTMLElement>this.element).querySelector('[name="status-text"]');
    //    node.innerHTML = this.statusText[status];
    //}
    //}
    //};

    var homeProductQueryArguments = {
        pageIndex: 0
    }

    var model = {
        name: ko.observable(''),
        brands: ko.observableArray(),
        advertItems: ko.observableArray(),
        homeProducts: ko.observableArray(),
    };

    var loadComplete = $.Deferred();
    page.load.add(function (sender: chitu.Page, args: chitu.PageLoadArguments) {
        if (args.loadType == chitu.PageLoadType.open) {
            home.advertItems().done(function (advertItems) {
                for (var i = 0; i < advertItems.length; i++) {
                    advertItems[i].index = i;
                    advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                    model.advertItems.push(advertItems[i]);
                }
            });
        }


        return home.homeProducts(homeProductQueryArguments.pageIndex).done(function (homeProducts: Array<any>) {
            for (var i = 0; i < homeProducts.length; i++) {
                homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                model.homeProducts.push(homeProducts[i]);
            }

            homeProductQueryArguments.pageIndex++;
            sender.enableScrollLoad = homeProducts.length == services.defaultPageSize;
        });


    });

    var viewDeferred = page.view;
    page.view = $.when(viewDeferred, chitu.Utility.loadjs(['css!sc/Home/Index', 'ui/PromotionLabel']));
    page.viewChanged.add(() => ko.applyBindings(model, page.nodes().content));

    page.loadCompleted.add(() => {
        requirejs(['swiper'], function (Swiper) {
            var mySwiper = new Swiper($(page.node()).find('[name="ad-swiper"]')[0], {
                //direction: 'vertical',
                loop: false,
                autoplay: 5000,
                pagination: $(page.node()).find('[name="ad-pagination"]')[0],
                onTap: function (swiper, event) {
                    var url = $(swiper.slides[swiper.activeIndex]).attr('url');
                    window.location.href = url;
                }
            });
        });
    });
}