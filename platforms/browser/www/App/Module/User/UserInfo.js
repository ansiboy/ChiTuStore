var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Member', 'Services/Service', 'knockout.validation', 'knockout.mapping', 'Core/ImageFileResize', 'Application', 'Site'], function (require, exports, member, services, ko_val, mapping, ImageFileResize, app, site) {
    "use strict";
    requirejs(['css!content/css/fontdiao']);
    var Model = (function () {
        function Model() {
            var _this = this;
            this.isWeiXin = site.env.isWeiXin;
            this.userInfo = member.currentUserInfo;
            this.edit = function (name) {
                return function () {
                    app.redirect('#User_UserInfoItemEdit_' + name);
                };
            };
            this.userInfo.Gender.extend({ required: true });
            this.userInfo['Region'] = ko.computed(function () {
                var region = (_this.userInfo.Province() || '') + ' ' + (_this.userInfo.City() || '');
                region = region.trim();
                return region;
            });
            this.val = ko_val.group(this.userInfo);
        }
        return Model;
    }());
    var UserInfoPage = (function (_super) {
        __extends(UserInfoPage, _super);
        function UserInfoPage(html) {
            _super.call(this, html);
            this.model = new Model();
            this.load.add(function (page, args) {
                var e = page.element.querySelector('[type="file"]');
                var imageFileResize = new ImageFileResize(e, { maxWidth: 100, maxHeight: 100 });
                imageFileResize.imageResized = function (urls, thumbs1, thumbs2) {
                    page.model.userInfo.HeadImageUrl(thumbs1[0]);
                    member.setUserInfo(mapping.toJS(page.model.userInfo));
                };
                ko.applyBindings(page.model, page.element);
                if (args.code) {
                    services['weixin'].getUserInfo(args.code).done(function (data) {
                        var userInfo = {
                            City: data.City,
                            Province: data.Province,
                            Country: data.Country,
                            Gender: data.Sex == 1 ? 'Male' : (data.Sex == 2 ? 'Female' : 'None'),
                            HeadImageUrl: data.HeadImgUrl,
                            NickName: data.NickName
                        };
                        mapping.fromJS(userInfo, {}, page.model.userInfo);
                        member.setUserInfo(userInfo);
                    });
                }
            });
        }
        return UserInfoPage;
    }(chitu.Page));
    return UserInfoPage;
});
