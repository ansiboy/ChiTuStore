import chitu = require('chitu');

class ScrollViewNode {
    private _scrollView: chitu.ScrollView;
    above: ScrollViewNode;
    below: ScrollViewNode;
    left: ScrollViewNode;
    right: ScrollViewNode;

    constructor(scrollView: chitu.ScrollView) {
        this._scrollView = scrollView;
    }

    get scrollView(): chitu.ScrollView {
        return this._scrollView;
    }
}

/** 通用手势切换 ScrollView */
class ScrollViewGesture {
    private active_item: chitu.ScrollView;
    private next_item: chitu.ScrollView;
    private prev_item: chitu.ScrollView;
    private above_item: chitu.ScrollView;
    private below_item: chitu.ScrollView;
    private scroll_args: chitu.ScrollArguments;

    private active_item_pos_x: number = 0;
    private active_item_pos_y: number = 0;
    private next_item_pos: number;
    private prev_item_pos: number;

    private container_width: number;
    private container_height: number;
    private moveType: 'none' | 'horizontal' | 'vertical' = 'none';
    private _offset: { up: number, down: number, left: number, right: number };


    /** 下拉执行 */
    pullDownExecute: () => JQueryPromise<any> | void;

    /** 上拉执行 */
    pullUpExecute: () => JQueryPromise<any> | void;

    /** 左拖动执行 */
    panLeftExecute: () => JQueryPromise<any> | void;

    /** 右拖动执行 */
    panRightExecute: () => JQueryPromise<any> | void;

    /** 上拉、下拉、或左右拖动释放时调用
     * @returns 返回 true 时，执行操作，false 不执行。
     */
    on_release: (deltaX: number, deltaY: number) => boolean;

    /** 滚动视图改变时调用 */
    viewChanged = chitu.Callbacks<ScrollViewGesture, { view: chitu.ScrollView, prev: chitu.ScrollView }>();

    constructor(scroll_view: chitu.ScrollView) {
        if (scroll_view == null) throw chitu.Errors.argumentNull('scroll_view');

        scroll_view.load.add((sender: chitu.ScrollView, args) => this.on_scrollViewLoad(sender, args));

        this.set_activeItem(scroll_view);

        this._offset = {
            up: -100,
            down: 100,
            left: 0 - this.container_width / 2,
            right: this.container_width / 2
        }

        this.on_release = (deltaX: number, deltaY: number) => {
            let allowExecute = (deltaX < 0 && deltaX < this.offset.left) ||
                (deltaX > 0 && deltaX > this.offset.right) ||
                (deltaY < 0 && deltaY < this.offset.up) ||
                (deltaY > 0 && deltaY > this.offset.down);

            return allowExecute;
        };

        this.pullDownExecute = () => {
            move(this.active_item.element).y(this.container_height).end();
            move(this.above_item.element).y(0).end();
            this.set_activeItem(this.above_item);
        };

        this.pullUpExecute = () => {
            move(this.active_item.element).y(0 - this.container_height).end();
            move(this.below_item.element).y(0).end();
            this.set_activeItem(this.below_item);
        };

        this.panLeftExecute = () => {
            move(this.active_item.element).x(this.prev_item_pos).end();
            move(this.next_item.element).x(this.active_item_pos_x).end();
            this.set_activeItem(this.next_item);
        };

        this.panRightExecute = () => {
            move(this.active_item.element).x(this.next_item_pos).end();
            move(this.prev_item.element).x(this.active_item_pos_x).end();
            this.set_activeItem(this.prev_item);
        };
    }


    private createNode(scrollView: chitu.ScrollView) {

    }

    get offset(): { up: number, down: number, left: number, right: number } {
        return this._offset;
    }

    private on_scrollViewLoad(sender: chitu.ScrollView, args) {
        let page_container = sender.page.container;
        $(page_container.element).data('ScrollViewGesture', this);

        this.container_width = $(page_container.element).width();
        this.container_height = $(page_container.element).height();

        var pan = page_container.gesture.createPan();
        pan.start = $.proxy(this.on_panStart, this);
        pan.left = $.proxy(this.on_panLeft, this);
        pan.right = $.proxy(this.on_panRight, this);
        pan.end = $.proxy(this.on_panEnd, this);
    }

    private on_panStart(e: Hammer.PanEvent) {
        let $active_item = $(this.active_item.element);

        //==================================================
        // 说明：计算角度，超过了水平滑动角度，则认为不是水平滑动。
        let d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
        if (d > 20 && d < 70)
            return false;
        //==================================================

        if ((e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT || (e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT)
            this.moveType = "horizontal";
        else if ((e.direction & Hammer.DIRECTION_UP) == Hammer.DIRECTION_UP || (e.direction & Hammer.DIRECTION_DOWN) == Hammer.DIRECTION_DOWN)
            this.moveType = "vertical";

        let started: boolean = (this.next_item != null && (e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT) ||
            (this.prev_item != null && (e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT) ||
            (this.below_item != null && (e.direction & Hammer.DIRECTION_UP) == Hammer.DIRECTION_UP) ||
            (this.above_item != null && (e.direction & Hammer.DIRECTION_DOWN) == Hammer.DIRECTION_DOWN);

        return started;
    }

    private on_panLeft(e: Hammer.PanEvent) {
        if (this.moveType != "horizontal")
            return;

        move(this.active_item.element).x(this.active_item_pos_x + e.deltaX).duration(0).end();
        if (this.next_item != null)
            move(this.next_item.element).x(this.next_item_pos + e.deltaX).duration(0).end();

        if (this.prev_item != null)
            move(this.prev_item.element).x(this.prev_item_pos + e.deltaX).duration(0).end();
    }

    private on_panRight(e: Hammer.PanEvent) {
        if (this.moveType != "horizontal")
            return;

        move(this.active_item.element).x(this.active_item_pos_x + e.deltaX).duration(0).end();
        if (this.next_item != null)
            move(this.next_item.element).x(this.next_item_pos + e.deltaX).duration(0).end();

        if (this.prev_item != null)
            move(this.prev_item.element).x(this.prev_item_pos + e.deltaX).duration(0).end();
    }

    private on_panEnd(e: Hammer.PanEvent) {
        if (this.moveType == "horizontal") {
            this.processHorizontalMove(e.deltaX);
        }
        else if (this.moveType == "vertical" && this.scroll_args != null) {
            let deltaY = (this.scroll_args.scrollTop + this.scroll_args.scrollHeight) - this.scroll_args.clientHeight;
            this.processVerticalMove(deltaY);
        }
    }

    private processVerticalMove(deltaY: number) {
        let cancel = this.on_release(0, deltaY) == false;
        if (cancel) {
            //move(this.active_item.element).y(this.active_item_pos_y);
            return;
        }

        if (deltaY < 0 && this.below_item != null) {
            this.pullUpExecute();
        }
        else if (deltaY > 0 && this.above_item != null) {
            this.pullDownExecute();
        }
    }

    private processHorizontalMove(deltaX: number) {
        let cancel = this.on_release(deltaX, 0) == false;
        if (cancel) {
            move(this.active_item.element).x(this.active_item_pos_x).end();
            if (this.next_item != null)
                move(this.next_item.element).x(this.next_item_pos).end();
            if (this.prev_item != null)
                move(this.prev_item.element).x(this.prev_item_pos).end();

            return;
        }

        if (deltaX < 0 && this.next_item != null && this.panLeftExecute != null) { // 向左移动
            this.panLeftExecute();
        }
        else if (deltaX > 0 && this.prev_item != null && this.panRightExecute != null) { // 向右移动
            this.panRightExecute();
        }
    }

    private on_scroll(sender: chitu.ScrollView, args: chitu.ScrollArguments) {
        //console.log(sender.name + ' scrollTop:' + args.scrollTop);
        var self = <ScrollViewGesture><any>$(sender.page.container.element).data('ScrollViewGesture');
        self.scroll_args = args;
    }

    private set_activeItem(active_item: chitu.ScrollView) {
        if (active_item == null) throw chitu.Errors.argumentNull('active_item');

        let prev_view = this.active_item;
        if (this.active_item != null) {
            this.active_item.scroll.remove(this.on_scroll);
        }
        this.active_item = active_item;
        this.active_item.scroll.add(this.on_scroll);
        chitu.fireCallback(this.viewChanged, this, { view: active_item, prev: prev_view });

        var pos = $(this.active_item.element).position();
        this.next_item_pos = this.container_width;
        this.prev_item_pos = 0 - this.next_item_pos;

        let $active_item = $(active_item.element);
        let next_name = $active_item.attr('next');
        let prev_name = $active_item.attr('prev');
        let above_name = $active_item.attr('above');
        let below_name = $active_item.attr('below');
        let page = active_item.page;
        if (next_name) {
            this.next_item = page.findControl<chitu.ScrollView>(next_name);
            if (this.next_item == null)
                throw Errors.controlNotExists(next_name);
        }
        else {
            this.next_item = null;
        }

        if (prev_name) {
            this.prev_item = page.findControl<chitu.ScrollView>(prev_name);
            if (this.prev_item == null)
                throw Errors.controlNotExists(prev_name);
        }
        else {
            this.prev_item = null;
        }

        if (above_name) {
            this.above_item = page.findControl<chitu.ScrollView>(above_name);
            if (this.above_item == null)
                throw Errors.controlNotExists(above_name);
        }
        else {
            this.above_item = null;
        }

        if (below_name) {
            this.below_item = page.findControl<chitu.ScrollView>(below_name);
            if (this.below_item == null)
                throw Errors.controlNotExists(below_name);
        }
        else {
            this.below_item = null;
        }
    }
}

class Errors {
    static controlNotExists(name) {
        let msg = chitu.Utility.format('Control named "{0}" is not exists.', name);
        return new Error(msg);
    }
}

export = ScrollViewGesture;