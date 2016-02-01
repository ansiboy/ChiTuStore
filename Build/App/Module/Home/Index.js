/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
define(["require", "exports", 'knockout', 'Services/Service', 'Services/Home'], function (require, exports, ko, services, home) {
    requirejs(['css!sc/Home/Index']);
    return function (page) {
        var homeProductQueryArguments = {
            pageIndex: 0
        };
        var model = {
            name: ko.observable(''),
            brands: ko.observableArray(),
            advertItems: ko.observableArray(),
            homeProducts: ko.observableArray(),
        };
        var loadComplete = $.Deferred();
        page.load.add(function (sender, args) {
            if (args.loadType == chitu.PageLoadType.open) {
                home.advertItems().done(function (advertItems) {
                    for (var i = 0; i < advertItems.length; i++) {
                        advertItems[i].index = i;
                        advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                        model.advertItems.push(advertItems[i]);
                    }
                });
            }
            return home.homeProducts(homeProductQueryArguments.pageIndex).done(function (homeProducts) {
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
        page.viewChanged.add(function () {
            ko.applyBindings(model, page.nodes().content);
        });
        page.loadCompleted.add(function () {
            requirejs(['scr/unslider', 'scr/jquery.event.move', 'scr/jquery.event.swipe'], function () {
                $('.swiper-container').unslider({
                    dots: true
                });
            });
        });
        var MySwpier = (function () {
            function MySwpier(element) {
                this.current_index = 0;
                this.deltaX = 0;
                this.container = element;
                this.wrapper = $(element).find('.swiper-wrapper')[0];
                this.sliders = $(element).find('.swiper-slide').map(function (index, element) {
                    $(element).width($(window).width());
                    return {
                        element: element,
                        active: function () {
                        }
                    };
                }).toArray();
            }
            MySwpier.prototype.start = function () {
                var _this = this;
                if (this.isFirst && this.isLastest) {
                    return;
                }
                var positive = true;
                this.timeIntervalId = window.setInterval(function () {
                    if (positive)
                        _this.next();
                    else
                        _this.previous();
                    if (_this.isLastest)
                        positive = false;
                    if (_this.isFirst)
                        positive = true;
                }, 1000);
            };
            MySwpier.prototype.stop = function () {
                console.log('stop');
                clearInterval(this.timeIntervalId);
            };
            Object.defineProperty(MySwpier.prototype, "isLastest", {
                get: function () {
                    return this.current_index >= this.sliders.length - 1;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MySwpier.prototype, "isFirst", {
                get: function () {
                    return this.current_index <= 0;
                },
                enumerable: true,
                configurable: true
            });
            MySwpier.prototype.next = function () {
                if (this.isLastest)
                    return;
                var deltaX = $(this.sliders[this.current_index].element).width();
                this.deltaX = this.deltaX - deltaX;
                this.wrapper.style.transform = this.wrapper.style.webkitTransform
                    = 'translateX(' + this.deltaX + 'px)';
                this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
                this.current_index = this.current_index + 1;
            };
            MySwpier.prototype.previous = function () {
                if (this.isFirst)
                    return;
                var deltaX = $(this.sliders[this.current_index].element).width();
                this.deltaX = this.deltaX + deltaX;
                this.wrapper.style.transform = this.wrapper.style.webkitTransform
                    = 'translateX(' + this.deltaX + 'px)';
                this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
                this.current_index = this.current_index - 1;
            };
            return MySwpier;
        })();
    };
});
