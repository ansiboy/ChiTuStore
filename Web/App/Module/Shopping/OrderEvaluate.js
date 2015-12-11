var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'Core/Page', 'knockout', 'Services/Account', 'Core/ImageFileResize', 'UI/ImagePreview', 'Site'], function (require, exports, Page, ko, account, ImageFileResize, CreateImagePreview, site) {
    var Start = (function () {
        function Start() {
            this.selected = ko.observable(true);
        }
        return Start;
    })();
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.starts = [];
            this.imageUrls = ko.observableArray();
            this.imageDatas = ko.observableArray();
            this.imageThumbs = ko.observableArray();
            this.evaluation = ko.observable();
            this.maxImageCount = 6;
            this.minWordCount = 10;
            this.maxWordCount = 100;
            this.productImageUrl = ko.observable();
            this.orderDetailId = ko.observable();
            this.back = function () {
                _this.page.hide();
            };
            this.submit = function () {
                var imageDatas = _this.imageDatas().join(site.config.imageDataSpliter);
                var imageThumbs = _this.imageThumbs().join(site.config.imageDataSpliter);
                var orderDetailId = _this.orderDetailId();
                return account.evaluateProduct(orderDetailId, _this.score(), _this.evaluation(), imageDatas, imageThumbs)
                    .done(function (data) {
                    _this.page.hide();
                    if (_this.page.submited)
                        _this.page.submited(data);
                });
            };
            this.switchStart = function (item) {
                var MIN_SCORE = 1;
                var score;
                var item_index = 0;
                for (var i = 0; i < _this.starts.length; i++) {
                    if (item == _this.starts[i]) {
                        item_index = i;
                        break;
                    }
                }
                if (item_index == _this.score() - 1) {
                    if (item.selected()) {
                        score = _this.score() - 1;
                    }
                    else {
                        score = _this.score() + 1;
                    }
                }
                else {
                    score = item_index + 1;
                }
                if (score < MIN_SCORE)
                    score = MIN_SCORE;
                _this.score(score);
                for (var i = 0; i < _this.starts.length; i++) {
                    _this.starts[i].selected(i < _this.score());
                }
            };
            this.showImagePage = function (item) {
                var index = $.inArray(item, _this.imageUrls());
                _this.imagePreview.open({ imageUrls: _this.imageUrls(), currentIndex: index });
            };
            this.page = page;
            for (var i = 0; i < 5; i++) {
                this.starts[i] = new Start();
                this.starts[i].selected(true);
            }
            this.score = ko.observable(this.starts.length);
            var p = this.imagePreview = CreateImagePreview(page);
            p.imageRemoved.add(function (index) {
                var item = _this.imageUrls()[index];
                _this.imageUrls.remove(item);
                var data = _this.imageDatas()[index];
                _this.imageDatas.remove(data);
            });
        }
        return Model;
    })();
    var OrderEvaluatePage = (function (_super) {
        __extends(OrderEvaluatePage, _super);
        function OrderEvaluatePage(element) {
            var _this = this;
            _super.call(this, element);
            this.loadHtml = function () {
                if (_this.html)
                    return $.Deferred().resolve(_this.html);
                var deferred = $.Deferred();
                requirejs(['text!Module/Shopping/OrderEvaluate.html'], function (html) {
                    deferred.resolve(html);
                });
                return deferred;
            };
            this.page_load = function (sender, args) {
                _this.loadHtml().done(function (html) {
                    _this.header.element.innerHTML = '';
                    _this.footer.element.innerHTML = '';
                    _this.content.element.innerHTML = html;
                    var q = _this.content.element.querySelector('[ch-part="header"]');
                    if (q)
                        _this.header.element.appendChild(q);
                    q = _this.content.element.querySelector('[ch-part="footer"]');
                    if (q)
                        _this.footer.element.appendChild(q);
                    var e = _this.content.element.querySelector('[type="file"]');
                    var imageFileResize = new ImageFileResize(e, 800, 800);
                    imageFileResize.imageResized = _this.image_resized;
                    _this.model = new Model(_this);
                    _this.model.productImageUrl(args.productImageUrl);
                    _this.model.orderDetailId(args.orderDetailId);
                    ko.cleanNode(_this.element);
                    ko.applyBindings(_this.model, _this.element);
                });
            };
            this.image_resized = function (urls, datas, thumbs) {
                for (var i = 0; i < urls.length; i++)
                    _this.model.imageUrls.push(urls[i]);
                for (var i = 0; i < datas.length; i++)
                    _this.model.imageDatas.push(datas[i]);
                for (var i = 0; i < thumbs.length; i++)
                    _this.model.imageThumbs.push(thumbs[i]);
            };
            this.load.add(this.page_load);
        }
        OrderEvaluatePage.prototype.open = function (args) {
            return _super.prototype.open.call(this, args);
        };
        OrderEvaluatePage.createInstance = function () {
            var element = document.createElement('div');
            document.body.appendChild(element);
            var page = new OrderEvaluatePage(element);
            element.className = element.className + ' Shopping-OrderEvaluate';
            return page;
        };
        return OrderEvaluatePage;
    })(Page);
    return OrderEvaluatePage;
});
