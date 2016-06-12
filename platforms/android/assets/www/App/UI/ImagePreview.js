define(["require", "exports"], function (require, exports) {
    "use strict";
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.back = function () {
                _this.page.hide();
            };
            this.remove = function () {
                var count = _this.page.on_imageRemoved();
                if (count == 0)
                    _this.page.hide();
            };
            this.page = page;
        }
        return Model;
    }());
    var ImagePreviewer = (function () {
        function ImagePreviewer(element) {
            var _this = this;
            this.model = new Model(this);
            this.loadHtml = $.Deferred();
            this.imageRemoved = $.Callbacks();
            this.element = element;
            this.element.style.display = 'none';
            requirejs(['text!UI/ImagePreview.html', 'swiper'], function (html, Swiper) {
                _this.element.innerHTML = html;
                ko.applyBindings(_this.model, _this.element);
                var swiper_container = _this.element.querySelector('.swiper-container');
                var swiper_wraper = _this.element.querySelector('.swiper-wrapper');
                _this.swiper = new Swiper(swiper_container, {
                    loop: false,
                    pagination: $(_this.element).find('[name="ad-pagination"]')[0],
                    onSlideChangeEnd: function (swiper) {
                        _this.updateTitle();
                    }
                });
            });
        }
        ImagePreviewer.prototype.on_imageRemoved = function () {
            var swiper = this.swiper;
            var active_index = swiper.activeIndex;
            swiper.removeSlide(active_index);
            this.updateTitle();
            this.imageRemoved.fire([active_index]);
            return swiper.slides.length;
        };
        ImagePreviewer.prototype.open = function (args) {
            debugger;
            $(this.element).show();
            this.swiper.removeAllSlides();
            var swiper_wraper = this.element.querySelector('.swiper-wrapper');
            for (var i = 0; i < args.imageUrls.length; i++) {
                var slide_element = document.createElement('div');
                slide_element.className = 'swiper-slide';
                slide_element.style.textAlign = 'center';
                var img_element = document.createElement('img');
                img_element.className = 'img-full';
                slide_element.appendChild(img_element);
                img_element.src = args.imageUrls[i];
                if (i == args.currentIndex)
                    slide_element.className = slide_element.className + ' swiper-slide-active';
                this.swiper.appendSlide(slide_element);
            }
            this.swiper.slideTo(args.currentIndex, 0);
            this.updateTitle();
        };
        ImagePreviewer.prototype.updateTitle = function () {
            var title_element = this.element.querySelector('[name="title"]');
            title_element.innerHTML = (this.swiper.activeIndex + 1) + '/' + this.swiper.slides.length;
        };
        ImagePreviewer.prototype.hide = function () {
            $(this.element).hide();
        };
        ImagePreviewer.prototype.close = function () {
            $(this.element).remove();
        };
        ImagePreviewer.createInstance = function () {
            var element = document.createElement('div');
            document.body.appendChild(element);
            var page = new ImagePreviewer(element);
            element.className = element.className + ' UI-ImagePreview';
            return page;
        };
        return ImagePreviewer;
    }());
    return ImagePreviewer;
});
