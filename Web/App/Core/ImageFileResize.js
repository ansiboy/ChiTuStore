define(["require", "exports"], function (require, exports) {
    var ImageFileResizeResult = (function () {
        function ImageFileResizeResult() {
        }
        return ImageFileResizeResult;
    })();
    var ImageFileResize = (function () {
        function ImageFileResize(fileUploadElement, thumb1, thumb2) {
            var _this = this;
            if (thumb2 === void 0) { thumb2 = null; }
            var maxWidth = thumb1.maxWidth;
            var maxHeight = thumb1.maxHeight;
            if (thumb2 == null) {
                thumb2 = thumb1;
            }
            this.thumb2 = thumb2;
            fileUploadElement.onchange = function () {
                if (!(window['File'] && window['FileReader'] && window['FileList'] && window['Blob'])) {
                    alert('The File APIs are not fully supported in this browser.');
                    return false;
                }
                var job = $.Deferred();
                var urls = new Array();
                var datas = new Array();
                var thumbs = new Array();
                var count = 0;
                for (var i = 0; i < fileUploadElement.files.length; i++) {
                    _this.processfile(fileUploadElement.files[i], i, maxWidth, maxHeight).done(function (data) {
                        urls[data.index] = data.url;
                        datas[data.index] = data.data;
                        thumbs[data.index] = data.thumb;
                        count = count + 1;
                        if (count == fileUploadElement.files.length) {
                            job.resolve();
                        }
                    });
                }
                job.done(function () {
                    if (_this.imageResized)
                        _this.imageResized(urls, datas, thumbs);
                });
            };
        }
        ImageFileResize.prototype.processfile = function (file, index, max_width, max_height) {
            var _this = this;
            var result = $.Deferred();
            if (!(/image/i).test(file.type)) {
                alert("File " + file.name + " is not an image.");
                result.reject();
                return result;
            }
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (ev) {
                var blob = new Blob([event.target['result']]);
                window['URL'] = window['URL'] || window['webkitURL'];
                var blobURL = window['URL'].createObjectURL(blob);
                var image = new Image();
                image.src = blobURL;
                image.onload = function () {
                    var url = _this.resizeMe(image, max_width, max_height);
                    var thumb = _this.resizeMe(image, _this.thumb2.maxWidth, _this.thumb2.maxHeight);
                    result.resolve({ index: index, url: url, data: url, thumb: thumb });
                };
            };
            return result;
        };
        ImageFileResize.prototype.resizeMe = function (img, max_width, max_height) {
            var canvas = document.createElement('canvas');
            var width = img.width;
            var height = img.height;
            if (width > height) {
                if (width > max_width) {
                    height = Math.round(height *= max_width / width);
                    width = max_width;
                }
            }
            else {
                if (height > max_height) {
                    width = Math.round(width *= max_height / height);
                    height = max_height;
                }
            }
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL("image/jpeg", 0.7);
        };
        return ImageFileResize;
    })();
    return ImageFileResize;
});
