import move = require('move');
import site = require('Site');
import ko = require('knockout');
import shopping = require('Services/Shopping');
import IScroll = require('iscroll');
import Hammer = require('hammer');
import mapping = require('knockout.mapping');

//var v = site.config.dialogAnimationTime;
var product_number_input_html =
    '<div style="width:100%;height:100%;z-index:2000;display:none;"> \
    <div style= "position:fixed;width:100%;z-index:2000;bottom:0px;" class="container" > \
        <input name="product_number_input" type= "number" class="form-control"/> \
    </div> \
    <div class="modal-backdrop" style= "opacity:0"> \
    </div> \
</div>';

class ProductPanelModel {
    private panel: ProductPanel
    private product: any
    private parent_model: any
    private produtNumberInput: JQuery

    constructor(panel: ProductPanel, parent_model: any) {
        this.panel = panel;
        this.product = parent_model.product;
        this.parent_model = parent_model;
        this.produtNumberInput = $(product_number_input_html).appendTo(document.body);
        //this.produtNumberInput.css('z-index', 2000);
        //this.produtNumberInput.hide();

        this.produtNumberInput.on('touck,click', this.hideProdutNumberInput);
        this.produtNumberInput.find('input').focusout(this.hideProdutNumberInput);
    }

    increaseCount = () => {
        this.product.Count(new Number(this.product.Count()).valueOf() + 1);
    }

    decreaseCount = () => {
        if (this.product.Count() <= 1)
            return;

        this.product.Count(new Number(this.product.Count()).valueOf() - 1);
    }

    close = () => {
        this.panel.close();
    }

    select_property = (item) => {
        var selected_options = [];
        var selected_property_index: number;
        var properties: Array<any> = ko.unwrap(this.product.CustomProperties);
        for (var i = 0; i < properties.length; i++) {
            var p = properties[i];
            var options: Array<any> = ko.unwrap(p.Options);
            for (var j = 0; j < options.length; j++) {
                if (options[j].Selected()) {
                    selected_options[i] = options[j];
                }

                if (options[j] == item) {
                    selected_property_index = i;
                }
            }
        }

        selected_options[selected_property_index] = item;

        var data = {};
        for (var i = 0; i < selected_options.length; i++) {
            data['Value' + (i + 1)] = selected_options[i].Value();
            data['Name' + (i + 1)] = properties[i].Name();
        }

        var groupId = <string>ko.unwrap(this.product.GroupId);
        shopping.getProductByNumberValues(groupId, data).done((data) => {
            if (data.Id == null) {
                mapping.fromJS(data.CustomProperties, {}, this.product.CustomProperties);
            }
            else {
                mapping.fromJS(data, {}, this.product);
            }
            var iscroll: IScroll = this.panel.page['iscroller']
            if (iscroll != null) {
                //说明： 必须延时，以便数据完全绑定好到页面。
                window.setTimeout(() => iscroll.refresh(), 100);
            }
        });
    }

    addToShoppingCart = () => {
        return this.parent_model.addToShoppingCart().done(() => {
            this.panel.close()
        });
    }

    showProdutNumberInput = () => {
        this.panel.hide();
        this.produtNumberInput.show();

        //window.setTimeout(() => {
        //    debugger;
        //    //this.produtNumberInput.scrollTop(40);
        //    //console.log('scrollTop:' + this.produtNumberInput.scrollTop());
        //    var input = this.produtNumberInput.find('input[name="product_number_input"]');
        //    //console.log('input lenght', input.length);
        //    input.parent().css('bottom', '0px');
        //}, 300);

        this.produtNumberInput.find('input[name="product_number_input"]').focus();
        console.log('produtNumberInput focus');
    }

    hideProdutNumberInput = () => {
        this.panel.show();
        this.produtNumberInput.hide();
    }
}

class ProductPanel {

    private node: HTMLElement
    private dialog_element: HTMLElement
    private width: number
    private ready = $.Deferred()
    private is_ready = false
    private is_doing = false
    private _page: chitu.Page;
    private page_model: any

    public confirmed = $.Callbacks();
    public customProperties = ko.observableArray();

    constructor(page: chitu.Page, model) {
        this._page = page;
        this.page_model = model;

        this.width = $(window).width() * site.config.panelWithRate;
        this.node = document.createElement('div');
        this.node.style.display = 'none';

        //==========================================
        // 说明：不能添加到 page 的 container，容易卡死
        //page.nodes().container.appendChild(this.node);
        document.body.appendChild(this.node);
        //==========================================
        this._page.closed.add(this.page_closed);

        requirejs(['text!Module/Home/Product/ProductPanel.html'], this.html_loaded);
    }

    get page() {
        return this._page;
    }

    private get show_time() {
        var showTime = Math.floor(this.width / site.config.animationSpeed);
        return showTime;
    }

    private html_loaded = (html: string) => {
        console.log('html_loaded');
        this.node.innerHTML = html;

        this.dialog_element = $(this.node).find('.modal-dialog')[0];
        this.dialog_element.style.width = this.width + 'px';

        this.is_ready = true;
        this.ready.resolve();

        var m = new ProductPanelModel(this, this.page_model);
        ko.applyBindings(m, this.node);

        var TOP_BAR_HEIGHT = 50;
        var BOTTOM_BAR_HEIGHT = 120;
        var $wrapper = $(this.node).find('.modal-body');
        $wrapper.height($(window).height() - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT);

        var iscroll = new IScroll($wrapper[0], { tap: true });
        if (site.env.isIOS) {
            //=====================================================
            // 修正弹出键盘时，document 位置发生偏移。
            var $input = $(this.node).find('input[type="text"]');
            var fix_doc_pos = () => {
                $(document).scrollTop(0);
                $(document).scrollLeft(0);
            };

            $input.focus(fix_doc_pos);
            $input.focusout(fix_doc_pos);
            //=================================================
        }

        //=====================================================
        // 禁用滑动，防止在弹出面板时，可以滑动底页面。
        $(this.node).on('touchmove', (e) => e.preventDefault());
    }

    private page_closed = () => {
        console.log('page_closed, remove node.');
        $(this.node).remove();
    }

    open = () => {
        if (this.is_doing)
            return;

        this.is_doing = true;
        var deferred = this.is_ready ? $.Deferred().resolve() : this.ready;
        deferred
            .done(() => {

                this.node.style.display = 'block';
                move(this.dialog_element).x(this.width).duration(0).end();

                //================================================
                //必须重新创建一个 move
                move(this.dialog_element)
                    .x(0)
                    .duration(this.show_time)
                    .end(() => {
                        this.is_doing = false
                    });
                //================================================
            })
            .fail(() => {
                this.is_doing = false;
            });
    }

    close = () => {
        if (this.is_doing)
            return;

        this.is_doing = true;
        move(this.dialog_element)
            .x(this.width)
            .duration(this.show_time)
            .end(() => {
                this.node.style.display = 'none';
                this.is_doing = false;
            });
    }

    hide() {
        this.node.style.display = 'none';
        this.page.nodes().container.style.display = 'none';
    }

    show() {
        this.node.style.display = 'block';
        this.page.nodes().container.style.display = 'block';
    }
}


export = ProductPanel;