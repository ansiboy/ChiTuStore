/// <reference path="../../../Scripts/typings/require.d.ts"/>
/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
/// <reference path="../../../Scripts/typings/hammer.d.ts"/>
/// <reference path="../../../Scripts/typings/move.d.ts"/>
define(["require", "exports", 'knockout', 'Services/Service', 'Services/Home'], function (require, exports, ko, services, home) {
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
        function page_load(sender, args) {
            if (args.loadType == chitu.PageLoadType.init) {
                home.advertItems().done(function (advertItems) {
                    for (var i = 0; i < advertItems.length; i++) {
                        advertItems[i].index = i;
                        advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                        model.advertItems.push(advertItems[i]);
                    }
                });
            }
            var result = home.homeProducts(homeProductQueryArguments.pageIndex)
                .done(function (homeProducts) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    model.homeProducts.push(homeProducts[i]);
                }
                homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });
            return result;
        }
        function page_loadCompleted(sender, args) {
            if (args.loadType != chitu.PageLoadType.init)
                return;
            requirejs(['hammer', 'move'], function (HammerClass, m) {
                window['Hammer'] = HammerClass;
                window['move'] = m;
                var carousel_element = $(page.node).find('[name="ad-swiper"]')[0];
                var $carousel = $(carousel_element);
                var hammer = new Hammer(carousel_element);
                hammer.get('pan').set({
                    direction: Hammer.DIRECTION_HORIZONTAL,
                });
                var window_width = $(window).width();
                var active_position;
                var active_index = 0;
                var items = $(carousel_element).find('.item').toArray();
                var moving = false;
                $(activeItem()).addClass('active');
                hammer.on('panstart', function (e) {
                    stop();
                }).on('panmove', function (e) {
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
                }).on('panend', function () {
                    var duration_time = 200;
                    var p = 50;
                    if (active_position > 0 && active_position >= p) {
                        move(activeItem()).x(window_width).duration(duration_time).end();
                        move(prevItem()).x(0).duration(duration_time).end();
                        window.setTimeout(function () {
                            $(prevItem()).removeClass('prev next').addClass('active');
                            $(activeItem()).removeClass('active');
                            decreaseActiveIndex();
                        }, duration_time);
                    }
                    else if (active_position > 0 && active_position < p) {
                        move(activeItem()).x(0).duration(duration_time).end();
                        move(prevItem()).x(0 - window_width).duration(duration_time).end();
                    }
                    else if (active_position <= 0 - p) {
                        move(activeItem()).x(0 - window_width).duration(duration_time).end();
                        move(nextItem()).x(0).duration(duration_time).end();
                        window.setTimeout(function () {
                            $(nextItem()).removeClass('prev next').addClass('active');
                            $(activeItem()).removeClass('active');
                            increaseActiveIndex();
                        }, duration_time);
                    }
                    else {
                        move(activeItem()).x(0).duration(duration_time).end();
                        move(nextItem()).x(window_width).duration(duration_time).end();
                    }
                    window.setTimeout(function () {
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
                function nextItemIndex() {
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
                var animateTime = 600;
                var playTimeId = 0;
                var playing = false;
                function moveNext() {
                    if (playTimeId == 0)
                        return;
                    if (playing == true)
                        return;
                    playing = true;
                    nextItem().style.transform = nextItem().style.webkitTransform = '';
                    nextItem().style.transitionDuration = nextItem().style.webkitTransitionDuration = '';
                    activeItem().style.transform = activeItem().style.webkitTransform = '';
                    activeItem().style.transitionDuration = activeItem().style.webkitTransitionDuration = '';
                    activeItem().className = 'item active';
                    nextItem().className = 'item next';
                    window.setTimeout(function () {
                        $(activeItem()).addClass('left');
                        $(nextItem()).addClass('active');
                        setTimeout(function () {
                            $(nextItem()).removeClass('prev next');
                            $(activeItem()).removeClass('left active');
                            increaseActiveIndex();
                            playing = false;
                        }, animateTime);
                    }, 10);
                }
                function movePrev() {
                    if (playTimeId == 0)
                        return;
                    if (playing == true)
                        return;
                    playing = true;
                    $(prevItem()).addClass('prev');
                    prevItem().style.transform = prevItem().style.webkitTransform = '';
                    activeItem().style.transform = activeItem().style.webkitTransform = '';
                    window.setTimeout(function () {
                        $(activeItem()).addClass('right');
                        $(prevItem()).addClass('active');
                        setTimeout(function () {
                            $(prevItem()).removeClass('prev next');
                            $(activeItem()).removeClass('right active');
                            decreaseActiveIndex();
                            playing = false;
                        }, animateTime);
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
                    playTimeId = window.setInterval(function () {
                        moveNext();
                    }, 2000);
                }
                play();
            });
        }
        function page_viewChange(sender) {
            ko.applyBindings(model, sender.node);
        }
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel', 'css!sc/Home/Index']));
        page.viewChanged.add(page_viewChange);
        page.load.add(page_load);
        page.loadCompleted.add(page_loadCompleted);
    };
});
