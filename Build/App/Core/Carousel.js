define(["require", "exports", 'hammer', 'move'], function (require, exports, Hammer, move) {
    var animateTime = 600;
    var Carousel = (function () {
        function Carousel(element) {
            var _this = this;
            this.playTimeId = 0;
            this.playing = false;
            this.window_width = $(window).width();
            this.active_index = 0;
            if (element == null)
                throw chitu.Errors.argumentNull('element');
            var $carousel = $(element);
            this.items = $carousel.find('.item').toArray();
            var hammer = new Hammer(element);
            hammer.get('pan').set({
                direction: Hammer.DIRECTION_HORIZONTAL,
            });
            $(this.activeItem()).addClass('active');
            hammer.on('panstart', function (e) {
                _this.stop();
            }).on('panmove', function (e) {
                var percent_position = Math.floor(e.deltaX / $(window).width() * 100);
                if (_this.active_position == percent_position || _this.playing == true) {
                    return;
                }
                move(_this.activeItem()).x(e.deltaX).duration(0).end();
                _this.active_position = percent_position;
                if (percent_position < 0) {
                    _this.nextItem().className = 'item next';
                    move(_this.nextItem()).x(_this.window_width + e.deltaX).duration(0).end();
                }
                else if (percent_position > 0) {
                    _this.prevItem().className = 'item prev';
                    move(_this.prevItem()).x(e.deltaX - _this.window_width).duration(0).end();
                }
            }).on('panend', function () {
                var duration_time = 200;
                var p = 50;
                if (_this.active_position > 0 && _this.active_position >= p) {
                    move(_this.activeItem()).x(_this.window_width).duration(duration_time).end();
                    move(_this.prevItem()).x(0).duration(duration_time).end();
                    window.setTimeout(function () {
                        $(_this.prevItem()).removeClass('prev next').addClass('active');
                        $(_this.activeItem()).removeClass('active');
                        _this.decreaseActiveIndex();
                    }, duration_time);
                }
                else if (_this.active_position > 0 && _this.active_position < p) {
                    move(_this.activeItem()).x(0).duration(duration_time).end();
                    move(_this.prevItem()).x(0 - _this.window_width).duration(duration_time).end();
                }
                else if (_this.active_position <= 0 - p) {
                    move(_this.activeItem()).x(0 - _this.window_width).duration(duration_time).end();
                    move(_this.nextItem()).x(0).duration(duration_time).end();
                    window.setTimeout(function () {
                        $(_this.nextItem()).removeClass('prev next').addClass('active');
                        $(_this.activeItem()).removeClass('active');
                        _this.increaseActiveIndex();
                    }, duration_time);
                }
                else {
                    move(_this.activeItem()).x(0).duration(duration_time).end();
                    move(_this.nextItem()).x(_this.window_width).duration(duration_time).end();
                }
                window.setTimeout(function () {
                    _this.play();
                }, duration_time + 200);
            });
            this.play();
        }
        Carousel.prototype.increaseActiveIndex = function () {
            this.active_index = this.active_index + 1;
            if (this.active_index > this.items.length - 1)
                this.active_index = 0;
            return this.active_index;
        };
        Carousel.prototype.decreaseActiveIndex = function () {
            this.active_index = this.active_index - 1;
            if (this.active_index < 0)
                this.active_index = this.items.length - 1;
        };
        Carousel.prototype.nextItemIndex = function () {
            var next = this.active_index + 1;
            if (next > this.items.length - 1)
                next = 0;
            return next;
        };
        Carousel.prototype.prevItemIndex = function () {
            var prev = this.active_index - 1;
            if (prev < 0)
                prev = this.items.length - 1;
            return prev;
        };
        Carousel.prototype.nextItem = function () {
            var nextIndex = this.active_index + 1;
            if (nextIndex > this.items.length - 1)
                nextIndex = 0;
            return this.items[nextIndex];
        };
        Carousel.prototype.prevItem = function () {
            var prevIndex = this.active_index - 1;
            if (prevIndex < 0)
                prevIndex = this.items.length - 1;
            return this.items[prevIndex];
        };
        Carousel.prototype.activeItem = function () {
            return this.items[this.active_index];
        };
        Carousel.prototype.moveNext = function () {
            var _this = this;
            if (this.playTimeId == 0)
                return;
            if (this.playing == true)
                return;
            this.playing = true;
            this.nextItem().style.transform = this.nextItem().style.webkitTransform = '';
            this.nextItem().style.transitionDuration = this.nextItem().style.webkitTransitionDuration = '';
            this.activeItem().style.transform = this.activeItem().style.webkitTransform = '';
            this.activeItem().style.transitionDuration = this.activeItem().style.webkitTransitionDuration = '';
            this.activeItem().className = 'item active';
            this.nextItem().className = 'item next';
            window.setTimeout(function () {
                $(_this.activeItem()).addClass('left');
                $(_this.nextItem()).addClass('active');
                setTimeout(function () {
                    _this.nextItem().className = 'item active';
                    _this.activeItem().className = 'item';
                    _this.increaseActiveIndex();
                    _this.playing = false;
                }, animateTime);
            }, 50);
        };
        Carousel.prototype.movePrev = function () {
            var _this = this;
            if (this.playTimeId == 0)
                return;
            if (this.playing == true)
                return;
            this.playing = true;
            $(this.prevItem()).addClass('prev');
            this.prevItem().style.transform = this.prevItem().style.webkitTransform = '';
            this.activeItem().style.transform = this.activeItem().style.webkitTransform = '';
            window.setTimeout(function () {
                $(_this.activeItem()).addClass('right');
                $(_this.prevItem()).addClass('active');
                setTimeout(function () {
                    $(_this.prevItem()).removeClass('prev next');
                    $(_this.activeItem()).removeClass('right active');
                    _this.decreaseActiveIndex();
                    _this.playing = false;
                }, animateTime);
            }, 10);
        };
        Carousel.prototype.stop = function () {
            if (this.playTimeId == 0) {
                return;
            }
            window.clearInterval(this.playTimeId);
            this.playTimeId = 0;
        };
        Carousel.prototype.play = function () {
            var _this = this;
            if (this.playTimeId != 0)
                return;
            this.playTimeId = window.setInterval(function () {
                _this.moveNext();
            }, 2000);
        };
        return Carousel;
    })();
    return Carousel;
});
