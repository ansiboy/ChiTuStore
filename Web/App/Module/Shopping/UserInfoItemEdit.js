var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'Core/Page'], function (require, exports, Page) {
    var UserInfoEditorPage = (function (_super) {
        __extends(UserInfoEditorPage, _super);
        function UserInfoEditorPage() {
            _super.apply(this, arguments);
        }
        return UserInfoEditorPage;
    })(Page);
    return UserInfoEditorPage;
});
