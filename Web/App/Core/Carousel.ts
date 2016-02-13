import Hammer = require('hammer');
import move = require('move'); // 说明：使用 move.js 框加，比直接使用 webkitTransform 样式要高效，后者在 iphone 真机上会卡。

//TODO: 活动圆点的显示
//TODO: 如果 items 为0,或者为 1 的情况。

var animateTime = 600;//ms
class Carousel {

    private playTimeId: number = 0;// 0 为停止中，－1 为已停止，非 0 为播放中。
    private playing = false;
    private paned = false;
    private window_width = $(window).width();
    private active_position: number; // 记录活动页的位置（按页面的百份比）
    private active_index: number;
    private items: HTMLElement[];

    constructor(element: HTMLElement) {
        if (element == null)
            throw chitu.Errors.argumentNull('element');

        var $carousel = $(element);
        this.items = $carousel.find('.item').toArray();
        this.active_index = $carousel.find('.active').index();// || 0;
        this.active_index = this.active_index >= 0 ? this.active_index : 0;

        var hammer = new Hammer(element);
        hammer.get('pan').set({
            direction: Hammer.DIRECTION_HORIZONTAL,
        });

        $(this.activeItem()).addClass('active');
        hammer.on('panstart', (e: PanEvent) => this.panstart(e))
            .on('panmove', (e: PanEvent) => this.panmove(e))
            .on('panend', (e: PanEvent) => this.panend(e));

        this.play();
    }

    private panstart(e: PanEvent) {
        this.stop();
    }
    private panmove(e: PanEvent) {
        var percent_position = Math.floor(e.deltaX / $(window).width() * 100);
        if (this.active_position == percent_position || this.playing == true) {
            return;
        }

        this.paned = true;
        move(this.activeItem()).x(e.deltaX).duration(0).end();
        this.active_position = percent_position;

        if (percent_position < 0) {
            this.nextItem().className = 'item next';
            move(this.nextItem()).x(this.window_width + e.deltaX).duration(0).end();
        }
        else if (percent_position > 0) {
            this.prevItem().className = 'item prev';
            move(this.prevItem()).x(e.deltaX - this.window_width).duration(0).end();
        }
    }
    private panend(e: PanEvent) {
        if (this.paned == false)
            return;

        this.paned = false;
        var duration_time = 200;
        var p = 50;
        if (this.active_position > 0 && this.active_position >= p) {
            move(this.activeItem()).x(this.window_width).duration(duration_time).end();
            move(this.prevItem()).x(0).duration(duration_time).end();

            window.setTimeout(() => {
                $(this.prevItem()).removeClass('prev next').addClass('active');
                $(this.activeItem()).removeClass('active');
                this.decreaseActiveIndex();

            }, duration_time);
        }
        else if (this.active_position > 0 && this.active_position < p) {
            move(this.activeItem()).x(0).duration(duration_time).end();
            move(this.prevItem()).x(0 - this.window_width).duration(duration_time).end();
        }
        else if (this.active_position <= 0 - p) {
            move(this.activeItem()).x(0 - this.window_width).duration(duration_time).end();
            move(this.nextItem()).x(0).duration(duration_time).end();

            window.setTimeout(() => {
                $(this.nextItem()).removeClass('prev next').addClass('active');
                $(this.activeItem()).removeClass('active');
                this.increaseActiveIndex();

            }, duration_time);
        }
        else {
            // 取消滑动到下一页，还原回原来的位置。
            move(this.activeItem()).x(0).duration(duration_time).end();
            move(this.nextItem()).x(this.window_width).duration(duration_time).end();
        }

        window.setTimeout(() => {
            this.play();
        }, duration_time + 200);
    }
    private increaseActiveIndex() {
        this.active_index = this.active_index + 1;
        if (this.active_index > this.items.length - 1)
            this.active_index = 0;

        return this.active_index;
    }
    private decreaseActiveIndex() {
        this.active_index = this.active_index - 1;
        if (this.active_index < 0)
            this.active_index = this.items.length - 1;
    }
    private nextItemIndex(): number {
        var next = this.active_index + 1;
        if (next > this.items.length - 1)
            next = 0;

        return next;
    }
    private prevItemIndex() {
        var prev = this.active_index - 1;
        if (prev < 0)
            prev = this.items.length - 1;

        return prev;
    }
    private nextItem() {
        var nextIndex = this.active_index + 1;
        if (nextIndex > this.items.length - 1)
            nextIndex = 0;

        return this.items[nextIndex];
    }
    private prevItem() {
        var prevIndex = this.active_index - 1;
        if (prevIndex < 0)
            prevIndex = this.items.length - 1;

        return this.items[prevIndex];
    }
    private activeItem() {
        return this.items[this.active_index];
    }
    private moveNext() {
        if (this.playTimeId == 0)
            return;

        if (this.playing == true)
            return;

        this.playing = true;

        this.nextItem().style.transform = this.nextItem().style.webkitTransform = '';
        this.nextItem().style.transitionDuration = this.nextItem().style.webkitTransitionDuration = '';
        this.activeItem().style.transform = this.activeItem().style.webkitTransform = '';
        this.activeItem().style.transitionDuration = this.activeItem().style.webkitTransitionDuration = '';
                
        //==================================================
        // 加入 next 样式式，使得该 item 在 active item 右边。
        this.activeItem().className = 'item active';
        this.nextItem().className = 'item next';

  
        //==================================================
        // 需要延时，否则第二个动画不生效。
        window.setTimeout(() => {
            $(this.activeItem()).addClass('left');
            $(this.nextItem()).addClass('active');
                    
            //==================================================
            // 动画完成后，清除样式。
            setTimeout(() => {
                //$(this.nextItem()).removeClass('prev next')
                //$(this.activeItem()).removeClass('left active');
                this.nextItem().className = 'item active';
                this.activeItem().className = 'item';
                this.increaseActiveIndex();
                this.playing = false;
            }, animateTime);
            //==================================================
        }, 50);

    }

    private movePrev() {
        if (this.playTimeId == 0)
            return;

        if (this.playing == true)
            return;

        this.playing = true;
        // $active_item = $carousel.find('.item.active');
        // if ($active_item.length == 0)
        //     return;

        //==================================================
        // 加入 next 样式式，使得该 item 在 active item 右边。
        $(this.prevItem()).addClass('prev');

        this.prevItem().style.transform = this.prevItem().style.webkitTransform = '';
        this.activeItem().style.transform = this.activeItem().style.webkitTransform = '';
        //==================================================
        // 需要延时，否则第二个动画不生效。
        window.setTimeout(() => {
            $(this.activeItem()).addClass('right');
            $(this.prevItem()).addClass('active');
                    
            //==================================================
            // 动画完成后，清除样式。
            setTimeout(() => {
                $(this.prevItem()).removeClass('prev next')
                $(this.activeItem()).removeClass('right active');
                this.decreaseActiveIndex();
                this.playing = false;
            }, animateTime);
            //==================================================
                    
        }, 10);

    }

    private stop() {
        if (this.playTimeId == 0) {
            return;
        }


        window.clearInterval(this.playTimeId);
        this.playTimeId = 0;
    }

    private play() {
        if (this.playTimeId != 0)
            return;

        this.playTimeId = window.setInterval(() => {
            this.moveNext();
        }, 2000);
    }
}

export = Carousel;