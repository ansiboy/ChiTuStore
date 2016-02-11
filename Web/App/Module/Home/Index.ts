/// <reference path="../../../Scripts/typings/require.d.ts"/>
/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
/// <reference path="../../../Scripts/typings/hammer.d.ts"/>
/// <reference path="../../../Scripts/typings/move.d.ts"/>

import ko = require('knockout');
import app = require('Application');
import services = require('Services/Service');
import home = require('Services/Home');

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

    function page_load(sender: chitu.Page, args: chitu.PageLoadArguments) {
        if (args.loadType == chitu.PageLoadType.init) {
            home.advertItems().done(function(advertItems) {
                for (var i = 0; i < advertItems.length; i++) {
                    advertItems[i].index = i;
                    advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                    model.advertItems.push(advertItems[i]);
                }
            });
        }

        var result = home.homeProducts(homeProductQueryArguments.pageIndex)
            .done(function(homeProducts: Array<any>) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    model.homeProducts.push(homeProducts[i]);
                }

                homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });

        return result;
    }

    function page_loadCompleted(sender: chitu.Page, args: chitu.PageLoadArguments) {
        if (args.loadType != chitu.PageLoadType.init)
            return;

        requirejs(['hammer', 'move'], function(HammerClass, m) {
            // 说明：使用 move.js 框加，比直接使用 webkitTransform 样式要高效，后者在 iphone 真机上会卡。
            window['Hammer'] = HammerClass;
            window['move'] = m;


            var carousel_element = $(page.node).find('[name="ad-swiper"]')[0];
            var $carousel = $(carousel_element);


            var hammer = new Hammer(carousel_element);
            hammer.get('pan').set({
                direction: Hammer.DIRECTION_HORIZONTAL,
            });


            var window_width = $(window).width();
            var active_position: number; // 记录活动页的位置（按页面的百份比）
            var active_index = 0;
            var items: HTMLElement[] = $(carousel_element).find('.item').toArray();
            var moving = false;

            $(activeItem()).addClass('active');


            hammer.on('panstart', function(e: PanEvent) {
                stop();

            }).on('panmove', function(e: PanEvent) {

                var percent_position = Math.floor(e.deltaX / $(window).width() * 100);
                if (active_position == percent_position || playing == true) {
                    return;
                }

                move(activeItem()).x(e.deltaX).duration(0).end();
                active_position = percent_position;

                if (percent_position < 0) {
                    nextItem().className = 'item next';
                    move(nextItem()).x(window_width + e.deltaX).duration(0).end();
                }
                else if (percent_position > 0) {
                    prevItem().className = 'item prev';
                    move(prevItem()).x(e.deltaX - window_width).duration(0).end();
                }

            }).on('panend', function() {
                var duration_time = 200;
                var p = 50;
                if (active_position > 0 && active_position >= p) {
                    move(activeItem()).x(window_width).duration(duration_time).end();
                    move(prevItem()).x(0).duration(duration_time).end();

                    window.setTimeout(function() {
                        $(prevItem()).removeClass('prev next').addClass('active');
                        $(activeItem()).removeClass('active');
                        decreaseActiveIndex();

                    }, duration_time);
                }
                else if (active_position > 0 && active_position < p) {
                    // 如果 < 30，取消滑动到下一页，还原回原来的位置。
                    move(activeItem()).x(0).duration(duration_time).end();
                    move(prevItem()).x(0 - window_width).duration(duration_time).end();
                }
                else if (active_position <= 0 - p) {
                    move(activeItem()).x(0 - window_width).duration(duration_time).end();
                    move(nextItem()).x(0).duration(duration_time).end();

                    window.setTimeout(function() {
                        $(nextItem()).removeClass('prev next').addClass('active');
                        $(activeItem()).removeClass('active');//.addClass('next');
                        increaseActiveIndex();

                    }, duration_time);
                }
                else {
                    // 取消滑动到下一页，还原回原来的位置。
                    move(activeItem()).x(0).duration(duration_time).end();
                    move(nextItem()).x(window_width).duration(duration_time).end();
                }

                window.setTimeout(function() {
                    play();
                }, duration_time + 200);
            });

            function increaseActiveIndex() {
                active_index = active_index + 1;
                if (active_index > items.length - 1)
                    active_index = 0;

                return active_index;
            }
            function decreaseActiveIndex() {
                active_index = active_index - 1;
                if (active_index < 0)
                    active_index = items.length - 1;
            }
            function nextItemIndex(): number {
                var next = active_index + 1;
                if (next > items.length - 1)
                    next = 0;

                return next;
            }
            function prevItemIndex() {
                var prev = active_index - 1;
                if (prev < 0)
                    prev = items.length - 1;

                return prev;
            }
            function nextItem() {
                var nextIndex = active_index + 1;
                if (nextIndex > items.length - 1)
                    nextIndex = 0;

                return items[nextIndex];
            }
            function prevItem() {
                var prevIndex = active_index - 1;
                if (prevIndex < 0)
                    prevIndex = items.length - 1;

                return items[prevIndex];
            }
            function activeItem() {
                return items[active_index];
            }

            var animateTime = 600;//ms
            var playTimeId: number = 0;// 0 为停止中，－1 为已停止，非 0 为播放中。
            var playing = false;

            function moveNext() {
                if (playTimeId == 0)
                    return;

                if (playing == true)
                    return;

                playing = true;
                // $active_item = $carousel.find('.item.active');
                // if ($active_item.length == 0)
                //     return;
                    
                nextItem().style.transform = nextItem().style.webkitTransform = '';
                nextItem().style.transitionDuration = nextItem().style.webkitTransitionDuration = '';
                activeItem().style.transform = activeItem().style.webkitTransform = '';
                activeItem().style.transitionDuration = activeItem().style.webkitTransitionDuration = '';
                
                //==================================================
                // 加入 next 样式式，使得该 item 在 active item 右边。
                activeItem().className = 'item active';
                nextItem().className = 'item next';

  
                //==================================================
                // 需要延时，否则第二个动画不生效。
                window.setTimeout(function() {
                    $(activeItem()).addClass('left');
                    $(nextItem()).addClass('active');
                    
                    //==================================================
                    // 动画完成后，清除样式。
                    setTimeout(function() {
                        $(nextItem()).removeClass('prev next')
                        $(activeItem()).removeClass('left active');
                        increaseActiveIndex();
                        playing = false;
                    }, animateTime);
                    //==================================================
                }, 10);

            }

            function movePrev() {
                if (playTimeId == 0)
                    return;

                if (playing == true)
                    return;

                playing = true;
                // $active_item = $carousel.find('.item.active');
                // if ($active_item.length == 0)
                //     return;

                //==================================================
                // 加入 next 样式式，使得该 item 在 active item 右边。
                $(prevItem()).addClass('prev');

                prevItem().style.transform = prevItem().style.webkitTransform = '';
                activeItem().style.transform = activeItem().style.webkitTransform = '';
                //==================================================
                // 需要延时，否则第二个动画不生效。
                window.setTimeout(function() {
                    $(activeItem()).addClass('right');
                    $(prevItem()).addClass('active');
                    
                    //==================================================
                    // 动画完成后，清除样式。
                    setTimeout(function() {
                        $(prevItem()).removeClass('prev next')
                        $(activeItem()).removeClass('right active');
                        decreaseActiveIndex();
                        playing = false;
                    }, animateTime);
                    //==================================================
                    
                }, 10);

            }

            function stop() {
                if (playTimeId == 0) {
                    return;
                }


                window.clearInterval(playTimeId);
                playTimeId = 0;
            }

            function play() {
                if (playTimeId != 0)
                    return;

                playTimeId = window.setInterval(function() {
                    moveNext();
                }, 2000);
            }

            play();
        })
    }

    function page_viewChange(sender: chitu.Page) {
        ko.applyBindings(model, sender.node);
    }

    var viewDeferred = page.view;
    page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel', 'css!sc/Home/Index']));

    page.viewChanged.add(page_viewChange);
    page.load.add(page_load);
    page.loadCompleted.add(page_loadCompleted);
}


// class MySwpier {
//     private container: HTMLElement;
//     private wrapper: HTMLElement;
//     private sliders: Array<any>;
//     private current_index: number = 0;
//     private deltaX: number = 0;
//     private timeIntervalId: number;
// 
//     constructor(element: HTMLElement) {
//         this.container = element;
//         this.wrapper = $(element).find('.swiper-wrapper')[0];
//         this.sliders = $(element).find('.swiper-slide').map(function(index, element: HTMLElement) {
//             $(element).width($(window).width());
//             return {
//                 element: element,
//                 active: function() {
//                     //this.element
//                 }
//             };
//         }).toArray();
//     }
// 
//     start() {
//         if (this.isFirst && this.isLastest) {
//             return;
//         }
// 
//         var positive = true;//正向移动
//         this.timeIntervalId = window.setInterval(() => {
//             if (positive)
//                 this.next();
//             else
//                 this.previous();
// 
//             if (this.isLastest)
//                 positive = false;
// 
//             if (this.isFirst)
//                 positive = true
// 
//         }, 1000);
//     }
// 
//     stop() {
//         console.log('stop');
//         clearInterval(this.timeIntervalId);
//     }
// 
//     get isLastest() {
//         return this.current_index >= this.sliders.length - 1;
//     }
// 
//     get isFirst() {
//         return this.current_index <= 0;
//     }
// 
//     next() {
//         if (this.isLastest)
//             return;
// 
//         var deltaX = $(this.sliders[this.current_index].element).width();
//         this.deltaX = this.deltaX - deltaX;
//         this.wrapper.style.transform = this.wrapper.style.webkitTransform
//             = 'translateX(' + this.deltaX + 'px)';
//         this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
//         this.current_index = this.current_index + 1;
//     }
// 
//     previous() {
//         if (this.isFirst)
//             return;
// 
//         var deltaX = $(this.sliders[this.current_index].element).width();
//         this.deltaX = this.deltaX + deltaX;
//         this.wrapper.style.transform = this.wrapper.style.webkitTransform
//             = 'translateX(' + this.deltaX + 'px)';
//         this.wrapper.style.webkitTransitionDuration = this.wrapper.style.transitionDuration = '0.3s';
//         this.current_index = this.current_index - 1;
//     }
// }
