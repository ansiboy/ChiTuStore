//import html = require('text!Module/Home/ProductList/ProductsFilter.html');
import coupon = require('Services/Coupon');
import move = require('move');
import site = require('Site');
import IScroll = require('iscroll');

var show_time = site.config.pageAnimationTime;

class Model {
    private coupons = ko.observableArray()
    private node: HTMLElement
    private dialog_element: HTMLElement
    private width: number
    private iscroll: IScroll
    private html_load = $.Deferred<HTMLElement>()

    public couponCodeSelected: Function;//$.Callbacks();

    constructor() {

        requirejs(['text!Module/Shopping/OrderProduct/Coupons.html', 'ui/CouponListItem'], (html) => {
            var $html = $(html).appendTo($('#footer'));
            var win_width = $(window).width();
            this.width = win_width;// * site.config.panelWithRate;
            $html.find('.modal-dialog').css('width', this.width + 'px');

            var $wrapper = $html.find('.modal-body');
            var TOP_BAR_HEIGHT = 50;
            $wrapper.css('height', ($(window).height() - TOP_BAR_HEIGHT) + 'px');

            this.iscroll = new IScroll($wrapper[0], { tap: true });

            this.node = $html[0];
            ko.applyBindings(this, $html[0]);
            this.dialog_element = $($html[0]).find('.modal-dialog')[0];

            this.html_load.resolve(this.node);

        })
    }
    close = () => {
        var m = move(this.dialog_element)
        m.x($(window).width()).duration(show_time).end(() => this.node.style.display = 'none');
    }
    open = (orderId: string) => {

        return $.when(coupon.getAvailableCoupons(orderId), this.html_load).done((coupons) => {
            debugger;
            var m = move(this.dialog_element)
            m.x($(window).width()).duration(0).end();
            this.node.style.display = 'block';


            m.x(0 - $(window).width()).duration(show_time).end(() => {
                window.setTimeout(() => this.iscroll.refresh(), 1000);
            });
            this.coupons(coupons);
        })
    }
    selectCouponCode = (item) => {
        debugger;
        if (this.couponCodeSelected) {
            this.couponCodeSelected(item);
        }

        this.close();
    }
}



export = Model;



