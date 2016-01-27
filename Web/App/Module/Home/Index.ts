/// <reference path="../../../Scripts/typings/knockout.d.ts"/>

import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');

requirejs(['css!sc/Home/Index']);

export = function (page: chitu.Page) {

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
            args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
        });
    });

    var viewDeferred = page.view;
    page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel']));
    page.viewChanged.add(() => ko.applyBindings(model, page.nodes().content));

    page.loadCompleted.add(() => {
        requirejs(['swiper'], function (Swiper) {
            var mySwiper = new Swiper($(page.node()).find('[name="ad-swiper"]')[0], {
                //direction: 'vertical',
                loop: true,
                autoplay: 5000,
                pagination: $(page.node()).find('[name="ad-pagination"]')[0],
                //onTap: function (swiper, event) {
                //    var url = $(swiper.slides[swiper.activeIndex]).attr('url');
                //    window.location.href = url;
                //}
            });
        });
    });
}