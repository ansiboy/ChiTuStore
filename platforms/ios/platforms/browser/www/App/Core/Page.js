define(["require", "exports", 'move'], function (require, exports, move) {
    var Control = (function () {
        function Control(element) {
            this._element = element;
        }
        Object.defineProperty(Control.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Control.prototype.appendChild = function (child) {
            this.element.appendChild(child.element);
        };
        Control.prototype.calculateHeight = function () {
            var height = 0;
            for (var i = 0; i < this.element.children.length; i++) {
                var child = this.element.children[i];
                var rect = child.getBoundingClientRect();
                height = height + rect.height;
            }
            return height;
        };
        Control.prototype.calculateWidth = function () {
            var rect = this.element.getBoundingClientRect();
            return rect.width;
        };
        Object.defineProperty(Control.prototype, "visible", {
            get: function () {
                return this.element.style.display == 'block';
            },
            set: function (value) {
                if (value)
                    this.element.style.display = 'block';
                else
                    this.element.style.display = 'none';
            },
            enumerable: true,
            configurable: true
        });
        return Control;
    })();
    var Page = (function () {
        function Page(element, parent) {
            var _this = this;
            if (parent === void 0) { parent = undefined; }
            this.is_render = false;
            this.load = chitu.Callbacks();
            this.closing = chitu.Callbacks();
            this.closed = chitu.Callbacks();
            this.render = function () {
                if (_this.is_render)
                    return;
                _this.element.className = Page.PAGE_CLASS_NAME;
                _this.element.style.display = 'none';
                var header_node = document.createElement('div');
                header_node.className = Page.PAGE_HEADER_CLASS_NAME;
                _this.header = new Control(header_node);
                var body_node = document.createElement('div');
                body_node.className = Page.PAGE_BODY_CLASS_NAME;
                _this.body = new Control(body_node);
                var footer_node = document.createElement('div');
                footer_node.className = Page.PAGE_FOOTER_CLASS_NAME;
                _this.footer = new Control(footer_node);
                var content_node = document.createElement('div');
                content_node.className = Page.PAGE_CONTENT_CLASS_NAME;
                _this.content = new Control(content_node);
                _this.body.appendChild(_this.content);
                _this.body.element.style.width = '100%';
                var loading_node = Page.createLoadingNode();
                _this.loading = new Control(loading_node);
                _this.element.appendChild(header_node);
                _this.element.appendChild(body_node);
                _this.element.appendChild(loading_node);
                _this.element.appendChild(footer_node);
                _this.resize();
                _this.is_render = true;
            };
            this.resize = function () {
                var window_height = window.innerHeight;
                _this.element.style.height = window_height + 'px';
                _this.body.element.style.height = '100%';
                _this.body.element.style.height = window_height + 'px';
                _this.body.element.style.position = 'absolute';
                _this.body.element.style.overflowY = 'auto';
                _this.body.element.style.overflowX = 'hidden';
            };
            this.element = element;
            this.render();
            if (parent) {
                parent.closing.add(function () { return _this.close(); });
            }
        }
        Page.prototype.on_load = function (args) {
            var _this = this;
            return chitu.fireCallback(this.load, [this, args]).done(function () {
                _this.loading.visible = false;
                _this.content.visible = true;
                _this.resize();
            });
        };
        Page.prototype.on_closed = function (args) {
            if (args === void 0) { args = null; }
            args = args || {};
            return chitu.fireCallback(this.closed, [this, args]);
        };
        Page.prototype.on_closing = function (args) {
            if (args === void 0) { args = null; }
            args = args || {};
            return chitu.fireCallback(this.closing, [this, args]);
        };
        Page.prototype.show = function () {
            this.element.style.zIndex = '1000';
            var width = this.element.getBoundingClientRect().width;
            move(this.element)
                .x(width).duration(0).end()
                .x(0 - width).duration(Page.AnimationTime).end();
            this.loading.visible = true;
        };
        Page.prototype.hide = function () {
            var _this = this;
            var result = $.Deferred();
            var width = this.element.getBoundingClientRect().width;
            move(this.element).x(width).duration(Page.AnimationTime)
                .end(function () {
                _this.element.style.display = 'none';
                result.resolve();
            });
            return result;
        };
        Page.createLoadingNode = function () {
            var loading_node = document.createElement('div');
            loading_node.className = Page.PAGE_LOADING_CLASS_NAME;
            loading_node.innerHTML = '<div class="spin"><i class="icon-spinner icon-spin"></i><div></div></div>';
            return loading_node;
        };
        Page.prototype.open = function (args) {
            this.element.style.display = 'block';
            this.show();
            this.on_load(args);
        };
        Page.prototype.close = function () {
            var _this = this;
            this.on_closing();
            this.hide().done(function () { return $(_this.element).remove(); });
            this.on_closed();
        };
        Page.PAGE_CLASS_NAME = 'page-node';
        Page.PAGE_HEADER_CLASS_NAME = 'page-header';
        Page.PAGE_BODY_CLASS_NAME = 'page-body';
        Page.PAGE_FOOTER_CLASS_NAME = 'page-footer';
        Page.PAGE_LOADING_CLASS_NAME = 'page-loading';
        Page.PAGE_CONTENT_CLASS_NAME = 'page-content';
        Page.AnimationTime = 500;
        return Page;
    })();
    return Page;
});
