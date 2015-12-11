define(["require", "exports", 'move', 'Site', 'knockout'], function (require, exports, move, site, ko) {
    var ProductPanel = (function () {
        function ProductPanel() {
            var _this = this;
            this.ready = $.Deferred();
            this.is_ready = false;
            this.is_doing = false;
            this.count = ko.observable(1);
            this.confirmed = $.Callbacks();
            this.open = function () {
                if (_this.is_doing)
                    return;
                _this.is_doing = true;
                var deferred = _this.is_ready ? $.Deferred().resolve() : _this.ready;
                deferred.done(function () {
                    //window.setTimeout(() => {
                    //var move = this.create_move();
                    _this.node.style.display = 'block';
                    move(_this.dialog_element).x(_this.width).duration(site.config.pageAnimationTime).end();
                    //================================================
                    //必须重新创建一个 move
                    move(_this.dialog_element)
                        .x(0)
                        .duration(site.config.pageAnimationTime)
                        .end(function () {
                        _this.is_doing = false;
                    });
                    //================================================
                });
            };
            this.close = function () {
                if (_this.is_doing)
                    return;
                _this.is_doing = true;
                move(_this.dialog_element)
                    .x(_this.width)
                    .duration(site.config.pageAnimationTime)
                    .end(function () {
                    _this.node.style.display = 'none';
                    _this.is_doing = false;
                });
            };
            this.ok = function () {
                _this.close();
                _this.confirmed.fire();
            };
            this.increaseCount = function () {
                _this.count(_this.count() + 1);
            };
            this.decreaseCount = function () {
                if (_this.count() <= 1)
                    return;
                _this.count(_this.count() - 1);
            };
            this.width = $(window).width() * 0.9;
            this.node = document.createElement('div');
            this.node.style.display = 'none';
            document.getElementById('footer').appendChild(this.node);
            requirejs(['text!ui/ProductPanel.html'], function (html) {
                _this.node.innerHTML = html;
                _this.dialog_element = $(_this.node).find('.modal-dialog')[0];
                _this.dialog_element.style.width = _this.width + 'px';
                _this.is_ready = true;
                _this.ready.resolve();
                ko.applyBindings(_this, _this.node);
            });
        }
        return ProductPanel;
    })();
    return new ProductPanel();
});
//# sourceMappingURL=ProductPanel.js.map