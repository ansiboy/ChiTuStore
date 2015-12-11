import move = require('move');
import app = require('Application');
import site = require('Site');

class Control {
    private _element: HTMLElement

    public constructor(element: HTMLElement) {
        this._element = element;
    }

    get element(): HTMLElement {
        return this._element;
    }

    public appendChild(child: Control) {
        this.element.appendChild(child.element);
    }

    calculateHeight(): number {
        var height = 0;
        for (var i = 0; i < this.element.children.length; i++) {
            var child = this.element.children[i];
            var rect = child.getBoundingClientRect();
            height = height + rect.height;
        }

        return height;
    }

    calculateWidth(): number {
        var rect = this.element.getBoundingClientRect();
        return rect.width;
    }

    get visible(): boolean {
        return this.element.style.display == 'block';
    }
    set visible(value: boolean) {
        if (value)
            this.element.style.display = 'block';
        else
            this.element.style.display = 'none';
    }
}

class Page {

    private static PAGE_CLASS_NAME = 'page-node';
    private static PAGE_HEADER_CLASS_NAME = 'page-header';
    private static PAGE_BODY_CLASS_NAME = 'page-body';
    private static PAGE_FOOTER_CLASS_NAME = 'page-footer';
    private static PAGE_LOADING_CLASS_NAME = 'page-loading';
    private static PAGE_CONTENT_CLASS_NAME = 'page-content';

    protected element: HTMLElement
    private is_render: boolean = false;
    private parent: Page;

    static AnimationTime = 500

    header: Control
    footer: Control
    protected body: Control
    protected content: Control
    protected loading: Control

    load = chitu.Callbacks()
    closing = chitu.Callbacks()
    closed = chitu.Callbacks()

    constructor(element: HTMLElement, parent: Page = undefined) {

        this.element = element;
        this.render();
        if (parent) {
            parent.closing.add(() => this.close());
        }
    }

    private render = () => {
        if (this.is_render)
            return;

        this.element.className = Page.PAGE_CLASS_NAME;
        this.element.style.display = 'none';

        //if (site.env.isIOS)
        $(this.element).addClass('ios');

        var header_node = document.createElement('div');
        header_node.className = Page.PAGE_HEADER_CLASS_NAME;
        this.header = new Control(header_node);

        var body_node = document.createElement('div');
        body_node.className = Page.PAGE_BODY_CLASS_NAME;
        this.body = new Control(body_node);

        var footer_node = document.createElement('div');
        footer_node.className = Page.PAGE_FOOTER_CLASS_NAME;
        this.footer = new Control(footer_node);

        var content_node = document.createElement('div');
        content_node.className = Page.PAGE_CONTENT_CLASS_NAME;
        this.content = new Control(content_node);
        this.body.appendChild(this.content);
        this.body.element.style.width = '100%';

        var loading_node = Page.createLoadingNode();
        this.loading = new Control(loading_node);


        this.element.appendChild(header_node);
        this.element.appendChild(body_node);
        this.element.appendChild(loading_node);
        this.element.appendChild(footer_node);

        this.resize();
        this.is_render = true;
    }

    private resize = () => {
        var window_height = window.innerHeight;
        //var header_height = this.header.calculateHeight();
        //var footer_height = this.footer.calculateHeight();

        //var h = window_height - header_height - footer_height;

        this.element.style.height = window_height + 'px';
        this.body.element.style.height = '100%';
        this.body.element.style.height = window_height + 'px'
        //=======================================================
        // IOS 对 fixed 支持不友好，会出现显示不正常
        this.body.element.style.position = 'absolute';
        //=======================================================
        this.body.element.style.overflowY = 'auto';
        this.body.element.style.overflowX = 'hidden';

        //this.loading.element.style.minHeight = h + 'px';
        //this.loading.element.style.position = 'fixed';
        //this.loading.element.style.top = header_height + 'px';

        //this.content.element.style.minHeight = h + 'px';
    }

    on_load(args): JQueryPromise<any> {
        return chitu.fireCallback(this.load, [this, args]).done(() => {
            this.loading.visible = false;
            this.content.visible = true;
            this.resize();
        });
    }

    on_closed(args: any = null) {
        args = args || {};
        return chitu.fireCallback(this.closed, [this, args])
    }

    on_closing(args: any = null) {
        args = args || {}
        return chitu.fireCallback(this.closing, [this, args]);
    }

    show() {
        this.element.style.zIndex = '1000';
        var width = this.element.getBoundingClientRect().width; //this.calculateWidth();
        move(this.element)
            .x(width).duration(0).end()
            .x(0 - width).duration(Page.AnimationTime).end();

        this.loading.visible = true;
    }

    hide(): JQueryPromise<any> {
        var result = $.Deferred();
        var width = this.element.getBoundingClientRect().width;
        move(this.element).x(width).duration(Page.AnimationTime)
            .end(() => {
                this.element.style.display = 'none'
                result.resolve()
            });

        return result;
    }

    private static createLoadingNode(): HTMLElement {
        var loading_node = document.createElement('div');
        loading_node.className = Page.PAGE_LOADING_CLASS_NAME;
        loading_node.innerHTML = '<div class="spin"><i class="icon-spinner icon-spin"></i><div></div></div>';
        return loading_node;
    }

    open(args: any) {
        this.element.style.display = 'block';
        this.show();
        this.on_load(args);

    }

    close() {
        this.on_closing();
        this.hide().done(() => $(this.element).remove());
        this.on_closed();
    }
}

export = Page