define(["require", "exports", 'Services/Service'], function (require, exports, services) {
    var Recharge = (function () {
        function Recharge() {
        }
        Recharge.prototype.createRechargeRecord = function (amount) {
            return services.callMethod(services.config.accountServiceUrl, 'Account/CreateRechargeRecord', { amount: amount });
        };
        Recharge.prototype.getRechargeRecords = function (pageIndex) {
            pageIndex = pageIndex || 0;
            var pageSize = 20;
            var args = { StartRowIndex: pageIndex * pageSize, MaximumRows: pageSize };
            var result = services.callMethod(services.config.accountServiceUrl, 'Account/GetRechargeRecord', args)
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
