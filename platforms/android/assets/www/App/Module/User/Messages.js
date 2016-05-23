var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    requirejs(['css!content/User/Messages'], function () { });
    var MessagesPage = (function (_super) {
        __extends(MessagesPage, _super);
        function MessagesPage() {
            _super.call(this);
        }
        return MessagesPage;
    })(chitu.Page);
    return MessagesPage;
});
