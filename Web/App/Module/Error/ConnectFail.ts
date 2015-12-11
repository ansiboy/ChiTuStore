import TopBar = require('ui/TopBar');
import app = require('Application');
//import c = require('ui/ScrollLoad');

requirejs(['css!sc/Error/ConnectFail']);


export = function (page: chitu.Page) {

    //c.scrollLoad(page);

    console.log('scrollload');

    //var return_url: string;
    page.load.add((sender, args) => {
        page['return_url'] = args.hash;
    });

    page['redirec'] = () => {
        var url = (<string>page['return_url'] || '#Home_Index').substr(1);

        app.showPage(url, {});
    }

    page.viewChanged.add(() => ko.applyBindings(page, page.nodes().content));


    var topbar: TopBar = page['topbar'];
    if (topbar) {
        $(topbar.element).find('.leftButton').hide();
    }
} 