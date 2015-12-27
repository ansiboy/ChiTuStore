import member = require('Services/Member');
import account = require('Services/Account');
import services = require('Services/Service');
import ko_val = require('knockout.validation');
import mapping = require('knockout.mapping');

import TopBar = require('ui/TopBar');
import ImageFileResize = require('Core/ImageFileResize')
import app = require('Application');
import c = require('ui/ScrollLoad');
import site = require('Site');

requirejs(['css!content/User/UserInfo', 'css!content/css/fontdiao']);


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
            app.redirect('User_UserInfoItemEdit_' + name);
        }
    }
}



export = function (page: chitu.Page) {


    $((<TopBar>page['topbar']).element).find('a').remove();
    (<TopBar>page['topbar']).createLeftButton('icon-chevron-left', () => location.href = '#User_Index');

    var model = new Model();

    page.viewChanged.add(() => {
        var e = page.nodes().content.querySelector('[type="file"]');
        var imageFileResize = new ImageFileResize(<HTMLInputElement>e, { maxWidth: 100, maxHeight: 100 });
        imageFileResize.imageResized = (urls: string[], thumbs1: string[], thumbs2: string[]) => {
            model.userInfo.HeadImageUrl(thumbs1[0]);
            member.setUserInfo(mapping.toJS(model.userInfo));
        }
        ko.applyBindings(model, page.node());
    })

    page.load.add((sender, args) => {
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
           
                mapping.fromJS(userInfo, {}, model.userInfo);
                member.setUserInfo(userInfo);
            });
        }
        //==================================================================
    });

} 