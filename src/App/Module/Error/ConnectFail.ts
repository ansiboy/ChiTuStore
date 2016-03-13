import TopBar = require('UI/TopBar');
import app = require('Application');

requirejs(['css!sc/Error/ConnectFail']);


export = function (page: chitu.Page) {

    page.load.add((sender, args) => {
        page['return_url'] = args.hash;
    });

    page['redirec'] = () => {
        var url = (<string>page['return_url'] || '#Home_Index').substr(1);

        app.showPage(url, {});
    }

    page.viewChanged.add(() => ko.applyBindings(page, page.element));


    var topbar: TopBar = page['topbar'];
    if (topbar) {
        $(topbar.element).find('.leftButton').hide();
    }
} 