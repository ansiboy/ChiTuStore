/// <reference path="../../../Scripts/typings/knockout.d.ts"/>

import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');

requirejs(['css!sc/Home/Index']);

export = function(page: chitu.Page) {

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
    page.load.add(function(sender: chitu.Page, args: chitu.PageLoadArguments) {
        if (args.loadType == chitu.PageLoadType.open) {
            home.advertItems().done(function(advertItems) {
                for (var i = 0; i < advertItems.length; i++) {
                    advertItems[i].index = i;
                    advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                    model.advertItems.push(advertItems[i]);
                }
            });
        }


        return home.homeProducts(homeProductQueryArguments.pageIndex).done(function(homeProducts: Array<any>) {
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
    page.viewChanged.add(() => {
        ko.applyBindings(model, page.nodes().content);



    });

    page.loadCompleted.add(() => {
        requirejs(['scr/unslider', 'scr/jquery.event.move', 'scr/jquery.event.swipe'], function() {
            (<any>$('.swiper-container')).unslider({
                dots: true
            });
        });
        
//         var swiper = new MySwpier(<HTMLElement>document.getElementsByClassName('swiper-container')[0]);
//         swiper.start();
// 
//         requirejs(['hammer'], function(HammerClass) {
//             window['Hammer'] = HammerClass;
//             var x = 0;
//             var node: HTMLElement = <HTMLElement>page.nodes().content.querySelector('.swiper-wrapper');
//             var hammer = new Hammer(node);
//             hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL || Hammer.DIRECTION_VERTICAL });
//             console.log('pan');
//             var ctr_deltaX = 0;
//             var pan_left_right = function(e: PanEvent) {
//                 var transform = 'translateX(' + (x + e.deltaX) + 'px)';
//                 node.style.transform = transform;
//                 node.style.webkitTransform = transform;
//                 swiper.stop();
//                 e.preventDefault();
//             }
//             var pan_end = function(e: PanEvent) {
//                 //if(e.deltaX>)
//                 //x = x + e.deltaX;
//                 //swiper.start();
//             }
//             hammer.on('panleft', pan_left_right);
//             hammer.on('panright', pan_left_right);
//             hammer.on('panend', pan_end);
//             hammer.on('panstart', function() {
//                 swiper.stop();
//             });
//             hammer.on('panup', (e) => e.preventDefault());
//             hammer.on('pandown', (e) => e.preventDefault());
//             $(node).on('touchmove',function(e){
//                return e.preventDefault();
//             });
//         });
    });

    class MySwpier {
        private container: HTMLElement;
        private wrapper: HTMLElement;
        private sliders: Array<any>;
        private current_index: number = 0;
        private deltaX: number = 0;
        private timeIntervalId: number;

        constructor(element: HTMLElement) {
            this.container = element;
            this.wrapper = $(element).find('.swiper-wrapper')[0];
            this.sliders = $(element).find('.swiper-slide').map(function(index, element: HTMLElement) {
                $(element).width($(window).width());
                return {
                    element: element,
                    active: function() {
                        //this.element
                    }
                };
            }).toArray();
        }

        start() {
            if (this.isFirst && this.isLastest) {
                return;
            }

            var positive = true;//正向移动
            this.timeIntervalId = window.setInterval(() => {
                if (positive)
                    this.next();
                else
                    this.previous();

                if (this.isLastest)
                    positive = false;

                if (this.isFirst)
                    positive = true

            }, 1000);
        }

        stop() {
            console.log('stop');
            clearInterval(this.timeIntervalId);
        }

        get isLastest() {
            return this.current_index >= this.sliders.length - 1;
        }

        get isFirst() {
            return this.current_index <= 0;
        }

        next() {
            if (this.isLastest)
                return;

            var deltaX = $(this.sliders[this.current_index].element).width();
            this.deltaX = this.deltaX - deltaX;
            this.wrapper.style.transform = this.wrapper.style.webkitTransform
                = 'translateX(' + this.deltaX + 'px)';
            this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
            this.current_index = this.current_index + 1;
        }

        previous() {
            if (this.isFirst)
                return;

            var deltaX = $(this.sliders[this.current_index].element).width();
            this.deltaX = this.deltaX + deltaX;
            this.wrapper.style.transform = this.wrapper.style.webkitTransform
                = 'translateX(' + this.deltaX + 'px)';
            this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
            this.current_index = this.current_index - 1;
        }
    }


}