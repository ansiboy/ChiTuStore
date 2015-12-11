define(["require", "exports", 'Services/Service', 'Site'], function (require, exports, services, site) {
    var Recharge = (function () {
        function Recharge() {
        }
        Recharge.prototype.createRechargeRecord = function (amount) {
            return services.callMethod(site.config.accountServiceUrl, 'Account/CreateRechargeRecord', { amount: amount });
        };
        Recharge.prototype.getRechargeRecords = function (pageIndex) {
            pageIndex = pageIndex || 0;
            var pageSize = 20;
            var args = { StartRowIndex: pageIndex * pageSize, MaximumRows: pageSize };
            var result = services.callMethod(site.config.accountServiceUrl, 'Account/GetRechargeRecord', args)
                .then(function (data) {
                return data.DataItems;
            });
            result.done(function (records) {
                result.loadCompleted = records.length < pageSize;
            });
            return result;
        };
        return Recharge;
    })();
    services['recharge'] = services['recharge'] || new Recharge();
    return services['recharge'];
});
