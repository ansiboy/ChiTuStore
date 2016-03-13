/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/jquery.cookie.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.mapping.d.ts' />
define(["require", "exports", 'Services/Member', 'Services/Service', 'knockout.validation', 'knockout.mapping', 'Core/ImageFileResize', 'Application', 'Site'], function (require, exports, member, services, ko_val, mapping, ImageFileResize, app, site) {
    requirejs(['css!content/User/UserInfo', 'css!content/css/fontdiao']);
    var Model = (function () {
        function Model() {
            var _this = this;
            this.isWeiXin = site.env.isWeiXin;
            this.userInfo = member.currentUserInfo;
            this.edit = function (name) {
                return function () {
                    app.redirect('User_UserInfoItemEdit_' + name);
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
    })();
    return function (page) {
        $(page['topbar'].element).find('a').remove();
        page['topbar'].createLeftButton('icon-chevron-left', function () { return location.href = '#User_Index'; });
        var model = new Model();
        page.viewChanged.add(function () {
            var e = page.element.querySelector('[type="file"]');
            var imageFileResize = new ImageFileResize(e, { maxWidth: 100, maxHeight: 100 });
            imageFileResize.imageResized = function (urls, thumbs1, thumbs2) {
                model.userInfo.HeadImageUrl(thumbs1[0]);
                member.setUserInfo(mapping.toJS(model.userInfo));
            };
            ko.applyBindings(model, page.element);
        });
        page.load.add(function (sender, args) {
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
                    mapping.fromJS(userInfo, {}, model.userInfo);
                    member.setUserInfo(userInfo);
                });
            }
        });
    };
});
