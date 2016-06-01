import member = require('Services/Member');
import account = require('Services/Account');
import services = require('Services/Service');
import ko_val = require('knockout.validation');
import mapping = require('knockout.mapping');

import TopBar = require('UI/TopBar');
import ImageFileResize = require('Core/ImageFileResize')
import app = require('Application');
import site = require('Site');

requirejs(['css!content/css/fontdiao']);


class Model {

    isWeiXin = site.env.isWeiXin

    constructor() {

        this.userInfo.Gender.extend({ required: true });

        this.userInfo['Region'] = ko.computed(() => {
            var region: string = (this.userInfo.Province() || '') + ' ' + (this.userInfo.City() || '');
            region = region.trim();
            return region;
        })

        this.val = ko_val.group(this.userInfo);
    }
    val: KnockoutValidationErrors
    userInfo = member.currentUserInfo
    edit = (name: string) => {
        return () => {
            app.redirect('#User_UserInfoItemEdit_' + name);
        }
    }
}

class UserInfoPage extends chitu.Page {
    private model: Model;
    constructor(html) {
        super(html);
        this.model = new Model();

        this.load.add((page: UserInfoPage, args) => {
            var e = page.element.querySelector('[type="file"]');
            var imageFileResize = new ImageFileResize(<HTMLInputElement>e, { maxWidth: 100, maxHeight: 100 });
            imageFileResize.imageResized = (urls: string[], thumbs1: string[], thumbs2: string[]) => {
                page.model.userInfo.HeadImageUrl(thumbs1[0]);
                member.setUserInfo(mapping.toJS(page.model.userInfo));
            }
            ko.applyBindings(page.model, page.element);

            //==================================================================
            // 说明：当 code 不为空，从微信导入用户信息。
            if (args.code) {
                services['weixin'].getUserInfo(args.code).done((data) => {
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
            //==================================================================
        })
    }
}

export = UserInfoPage;



// export = function (page: chitu.Page) {


//     // $((<TopBar>page['topbar']).element).find('a').remove();
//     // (<TopBar>page['topbar']).createLeftButton('icon-chevron-left', () => location.href = '#User_Index');

//     var model = new Model();

//     page.viewChanged.add(() => {
//         var e = page.element.querySelector('[type="file"]');
//         var imageFileResize = new ImageFileResize(<HTMLInputElement>e, { maxWidth: 100, maxHeight: 100 });
//         imageFileResize.imageResized = (urls: string[], thumbs1: string[], thumbs2: string[]) => {
//             model.userInfo.HeadImageUrl(thumbs1[0]);
//             member.setUserInfo(mapping.toJS(model.userInfo));
//         }
//         ko.applyBindings(model, page.element);
//     })

//     page.load.add((sender, args) => {
//         //==================================================================
//         // 说明：当 code 不为空，从微信导入用户信息。
//         if (args.code) {
//             services['weixin'].getUserInfo(args.code).done((data) => {
//                 var userInfo = {
//                     City: data.City,
//                     Province: data.Province,
//                     Country: data.Country,
//                     Gender: data.Sex == 1 ? 'Male' : (data.Sex == 2 ? 'Female' : 'None'),
//                     HeadImageUrl: data.HeadImgUrl,
//                     NickName: data.NickName
//                 };

//                 mapping.fromJS(userInfo, {}, model.userInfo);
//                 member.setUserInfo(userInfo);
//             });
//         }
//         //==================================================================
//     });

//} 