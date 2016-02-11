/// <reference path='../../../../Scripts/typings/move.d.ts' />
/// <reference path='../../../../Scripts/typings/iscroll.d.ts' />
/// <reference path='../../../../Scripts/typings/chitu.d.ts' />

import move = require('move');
import site = require('Site');
import Hammer = require('hammer');
import shopping = require('Services/Shopping');
import ko = require('knockout');
import IScroll = require('iscroll');
import mapping = require('knockout.mapping');

var show_time = site.config.pageAnimationTime;

class ProductDetailPanel {
    private _node: HTMLElement;
    private _page: chitu.Page
    private _hammer: Hammer;
    private _loaded = false;
    //private _productId: string;
    private model: any

    private pre_deltaY: number
    private pan_move: Move
    private start_pos: number;
    private enablePullDown: boolean = false;
    private content_node: HTMLElement;
    private iscroll: IScroll;
    private disable_iscroll: boolean;

    constructor(page: chitu.Page) {

        this._page = page;
        //this._productId = productId;
        this._node = document.createElement('div');
        this._node.style.position = 'fixed';
        this._node.style.height = ($(window).height() - 50) + 'px';
        this._node.className = 'product-detail wrapper';
        //this._node.style.zIndex = this._page.nodes().body.style.zIndex;

        //$(page.nodes().content).append(this._node);
        document.body.appendChild(this._node);

        this._hammer = new Hammer(this._node);
        this._hammer.get('pan').set({ direction: Hammer.DIRECTION_DOWN | Hammer.DIRECTION_UP })
        this._hammer.on('panstart', this.on_panstart);
        this._hammer.on('pan', this.on_pan);
        this._hammer.on('panend', this.on_panend);


        this.pan_move = move(this._node);
        this.hide();
        debugger;
        this._page.closed.add(this.on_pageClosed);
    }

    show = (productId: string) => {
        var result = $.Deferred();
        this.pan_move = move(this._node);
        this.pan_move.y(0).duration(show_time).end(() => {
            result.resolve();
            //======================================
            // 说明：必须隐藏，否则苹果真机会出现问题
            //$(this._page.nodes().body).hide();
            //======================================
        });

        if (!this._loaded) {
            var load_html = $.Deferred();
            requirejs(['text!Module/Home/Product/ProductDetailPanel.html'], (html) => {
                this._node.innerHTML = html;
                load_html.resolve(html);
                this.content_node = $(this._node).find('.container')[0];
                var rect = this.content_node.getBoundingClientRect();
                this.start_pos = rect.top;
            })

            $.when(shopping.getProductIntroduce(productId), load_html).done(this.on_dataLoad);
        }
        else {
            this.model.Introduce('<div class="spin"><i class="icon-spinner icon-spin" ></i><div></div></div>');
            shopping.getProductIntroduce(productId).done((data) => {
                mapping.fromJS(data, {}, this.model);
            })
        }



        var iscroll: IScroll = this._page['iscroller'];
        if (iscroll != null && iscroll.enable()) {
            iscroll.disable();
            this.disable_iscroll = true;
            console.log('disable page iscroll');
        }

        return result;

    }

    private on_pageClosed = (sender: chitu.Page) => {
        debugger;
        $(this._node).remove();
    }

    private on_dataLoad = (data) => {
        this.model = mapping.fromJS(data[0]);
        ko.applyBindings(this.model, this._node);
        if (site.env.isIOS) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,   // 必须设置为 True，否是在微信环境下，页面位置在上拉，或下拉时，会移动。
                //probeType: 1,
                //bounce: false,
                //bounceTime: 600
            }
            this.iscroll = new IScroll(this._node, options);
            //======================================================
            // 延迟1秒，再刷新一次，确保页面高度正确
            window.setTimeout(() => this.iscroll.refresh(), 1000);
            //======================================================
        }

        this._loaded = true;
    }

    hide = () => {
        this._node.style.transform = '';
        this.pan_move.y($(window).height()).duration(show_time).end(() => {
            //======================================
            // 说明：必须再 show 一次，否则会自动隐藏
            //$(this._page.nodes().body).show()
            if (this.disable_iscroll == true) {
                (<IScroll>this._page['iscroller']).enable();
            }
            //======================================
        });

        //======================================
        // 说明：
        // 1、为了有好的视觉效果，在这里就显示
        // 2、必须禁用页面中的 iscroll，以防止触页面的滚动
        //$(this._page.nodes().body).show();

        //======================================
    }

    private on_panstart = (e) => {
        this.enablePullDown = this.content_node != null &&
            Math.abs(this.content_node.getBoundingClientRect().top - this.start_pos) <= 20 &&
            e['direction'] == Hammer.DIRECTION_DOWN;

        if (this.enablePullDown && this.iscroll != null) {
            this.iscroll.enabled = false;
        }

        this.pre_deltaY = e['deltaY'];
    }

    private on_pan = (e) => {
        //e.preventDefault();
        if (e.deltaY >= 65 || !this.enablePullDown)
            return;

        console.log('deltaY:' + e['deltaY']);
        var d = e['deltaY'] - this.pre_deltaY;
        console.log('d:' + d);
        this.pan_move.y(d).duration(0).end();

        this.pre_deltaY = e['deltaY'];
    }

    private on_panend = (e) => {
        //e.preventDefault();
        if (this.enablePullDown == false)
            return;

        if (e.deltaY > 30) {
            this.hide();
        }
        else {
            //this.show();
            move(this._node).duration(show_time).end();
        }

        if (this.iscroll) {
            this.iscroll.enabled = true;
        }
    }
}

export = ProductDetailPanel;