define(["require", "exports", 'move'], function (require, exports, move) {
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Up"] = 2] = "Up";
        Direction[Direction["Down"] = 3] = "Down";
    })(Direction || (Direction = {}));
    var Panel = (function () {
        function Panel(page) {
            this._width = '100%';
            this._height = '100%';
            this._zindex = '1000';
            this._page = page;
            this._element = document.createElement('div');
            this._element.style.position = 'abstract';
            this._element.className = Panel.className;
            this._element.style.width = this._width;
            this._element.style.height = this._height;
            this._element.style.zIndex = this._zindex;
            var body_node = this._bodyNode = document.createElement('div');
            this._element.appendChild(body_node);
            document.body.appendChild(this._element);
        }
        Object.defineProperty(Panel.prototype, "width", {
            get: function () {
                return this._element.style.width;
            },
            set: function (value) {
                this._element.style.width = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "height", {
            get: function () {
                return this._element.style.height;
            },
            set: function (value) {
                this._element.style.height = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "zIndex", {
            get: function () {
                return this._element.style.zIndex;
            },
            set: function (value) {
                this._element.style.zIndex = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "view", {
            get: function () {
                return '';
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        Panel.prototype.show = function (animation) {
            if (animation.time == null)
                animation.time = Panel.defaultShowTime;
            var result = $.Deferred();
            var width = this._element.getBoundingClientRect().width;
            move(this._element).x(width).duration(0).end()
                .x(0 - width).duration(animation.time).end(function () {
                result.resolve();
            });
            return result;
        };
        Panel.prototype.hide = function (animation) {
            var _this = this;
            if (animation.time == null)
                animation.time = Panel.defaultHideTime;
            var result = $.Deferred();
            var width = this._element.getBoundingClientRect().width;
            move(this._element).x(width).duration(animation.time).end(function () {
                _this._element.style.display = 'none';
                result.resolve();
            });
            return result;
        };
        Panel.prototype.on_load = function (args) {
            if (this.load)
                this.load();
        };
        Panel.prototype.open = function (args, animation) {
            this._element.style.display = 'block';
            this.show(animation);
            this.on_load(args);
        };
        Panel.className = 'panel-node';
        Panel.defaultShowTime = 500;
        Panel.defaultHideTime = 500;
        return Panel;
    })();
});
