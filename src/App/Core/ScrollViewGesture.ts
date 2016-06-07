import chitu = require('chitu');

/** 通用手势切换 ScrollView */
class ScrollViewGesture {
    private container: chitu.PageContainer;
    private page: chitu.Page;

    private active_item: chitu.ScrollView;
    private next_item: chitu.ScrollView;
    private prev_item: chitu.ScrollView;

    private active_item_pos: number;
    private next_item_pos: number;
    private prev_item_pos: number;

    private container_width: number;

    constructor(scroll_view: chitu.ScrollView) {
        if (scroll_view == null) throw chitu.Errors.argumentNull('scroll_view');

        this.container = scroll_view.page.container;
        this.page = scroll_view.page;
        this.active_item = scroll_view;

        this.container_width = $(this.container.element).width();
        this.active_item_pos = 0;
        this.next_item_pos = this.container_width;
        this.prev_item_pos = 0 - this.next_item_pos;

        var pan = this.container.gesture.createPan(this.container.element);
        pan.start = (e: PanEvent) => {
            console.log('start');

            let $active_item = $(this.active_item.element);
            if (chitu.ScrollView.scrolling) {
                return false;
            }

            //==================================================
            // 说明：计算角度，超过了水平滑动角度，则认为不是水平滑动。
            let d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
            if (d > 20)
                return false;
            //==================================================

            let next_name = $active_item.attr('next');
            let prev_name = $active_item.attr('prev');
            if (next_name) {
                this.next_item = this.page.findControl<chitu.ScrollView>(next_name);
            }
            else {
                this.next_item = null;
            }

            if (prev_name) {
                this.prev_item = this.page.findControl<chitu.ScrollView>(prev_name);
            }
            else {
                this.prev_item = null;
            }

            let started: boolean = (this.next_item != null && (e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT) ||
                (this.prev_item != null && (e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT);

            return started;
        }

        pan.left = (e: PanEvent) => {
            move(this.active_item.element).x(this.active_item_pos + e.deltaX).duration(0).end();
            if (this.next_item != null)
                move(this.next_item.element).x(this.next_item_pos + e.deltaX).duration(0).end();

            if (this.prev_item != null)
                move(this.prev_item.element).x(this.prev_item_pos + e.deltaX).duration(0).end();

            //this.container.gesture.prevent.pan(Hammer.DIRECTION_LEFT);
        }

        pan.right = (e: PanEvent) => {
            move(this.active_item.element).x(this.active_item_pos + e.deltaX).duration(0).end();
            if (this.next_item != null)
                move(this.next_item.element).x(this.next_item_pos + e.deltaX).duration(0).end();

            if (this.prev_item != null)
                move(this.prev_item.element).x(this.prev_item_pos + e.deltaX).duration(0).end();

            this.container.gesture.prevent.pan(Hammer.DIRECTION_RIGHT);
        }

        pan.end = (e: PanEvent) => {
            console.log('end');
            if (Math.abs(e.deltaX) / this.container_width < 0.5) {
                move(this.active_item.element).x(this.active_item_pos).end();
                if (this.next_item != null)
                    move(this.next_item.element).x(this.next_item_pos).end();
                if (this.prev_item != null)
                    move(this.prev_item.element).x(this.prev_item_pos).end();

                return;
            }

            if (e.deltaX < 0 && this.next_item != null) { // 向左移动
                move(this.active_item.element).x(this.prev_item_pos).end();
                move(this.next_item.element).x(this.active_item_pos).end();
                // $next_item.addClass('active');
                // $active_item.removeClass('active');
                this.active_item = this.next_item;
            }
            else if (e.deltaX > 0 && this.prev_item != null) { // 向右移动
                move(this.active_item.element).x(this.next_item_pos).end();
                move(this.prev_item.element).x(this.active_item_pos).end();
                // $prev_item.addClass('active');
                // $active_item.removeClass('active');
                this.active_item = this.prev_item;
            }
        }
    }
}

export = ScrollViewGesture;