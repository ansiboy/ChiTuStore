class ImageFileResizeResult {
    ImageData: string
}

interface FileData {
    index: number
    url: string
    data: string
    thumb: string
}

interface ImageFileResizeCallback {
    (urls: string[], base64: string[], thumbs: string[]): void;
}

interface ImageThumb {
    maxWidth: number,
    maxHeight: number
}

class ImageFileResize {
    //private THUMB_SIZE = 100;
    private thumb2: ImageThumb;
    constructor(fileUploadElement: HTMLInputElement, thumb1: ImageThumb, thumb2: ImageThumb = null) {
        // maxWidth: number, maxHeight: number
        var maxWidth = thumb1.maxWidth;
        var maxHeight = thumb1.maxHeight;
        if (thumb2 == null) {
            thumb2 = thumb1;
        }
        this.thumb2 = thumb2;

        fileUploadElement.onchange = () => {
            if (!(window['File'] && window['FileReader'] && window['FileList'] && window['Blob'])) {
                alert('The File APIs are not fully supported in this browser.');
                return false;
            }

            var job = $.Deferred();
            var urls = new Array<string>();
            var datas = new Array<string>();
            var thumbs = new Array<string>();
            var count = 0;
            for (var i = 0; i < fileUploadElement.files.length; i++) {
                this.processfile(fileUploadElement.files[i], i, maxWidth, maxHeight).done((data: FileData) => {
                    urls[data.index] = data.url;
                    datas[data.index] = data.data;
                    thumbs[data.index] = data.thumb;

                    count = count + 1;
                    if (count == fileUploadElement.files.length) {
                        job.resolve();
                    }
                });
            }

            job.done(() => {
                if (this.imageResized)
                    this.imageResized(urls, datas, thumbs);
            })
        }
    }

    imageResized: ImageFileResizeCallback

    private processfile(file: File, index, max_width: number, max_height: number): JQueryPromise<FileData> {

        var result = $.Deferred<FileData>();

        if (!(/image/i).test(file.type)) {
            alert("File " + file.name + " is not an image.");
            result.reject();
            return result;
        }

        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev: Event) => {
            var blob = new Blob([event.target['result']]);
            window['URL'] = window['URL'] || window['webkitURL'];
            var blobURL = window['URL'].createObjectURL(blob); // and get it's URL
            var image = new Image();
            image.src = blobURL;
            image.onload = () => {
                var url = this.resizeMe(image, max_width, max_height);
                var thumb = this.resizeMe(image, this.thumb2.maxWidth, this.thumb2.maxHeight);
                result.resolve({ index: index, url: url, data: url, thumb: thumb });
            }
        }

        return result;
    }

    private resizeMe(img: HTMLImageElement, max_width: number, max_height: number): string {

        var canvas = document.createElement('canvas');

        var width: number = img.width;
        var height: number = img.height;

        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > max_width) {
                height = Math.round(height *= max_width / width);
                width = max_width;
            }
        } else {
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

    }
}

export = ImageFileResize;