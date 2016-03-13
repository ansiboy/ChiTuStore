define(["require", "exports", 'Services/Service', 'Site'], function (require, exports, services, site) {
    var InfoService = (function () {
        function InfoService() {
        }
        InfoService.prototype.getArticles = function (args) {
            var result = services.callMethod(services.config.siteServiceUrl, 'Info/GetNewsList', args);
            result.done($.proxy(function (items) {
                this.loadCompleted = items.length < site.config.pageSize;
                return items;
            }, result));
            return result;
        };
        InfoService.prototype.getArticleById = function (newsId) {
            var result = services.callMethod(services.config.siteServiceUrl, 'Info/GetNews', { newsId: newsId });
            return result;
        };
        return InfoService;
    })();
    window['services']['info'] = window['services']['info'] || new InfoService();
    return window['services']['info'];
});
