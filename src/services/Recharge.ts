import services = require('services/Service');
import site = require('Site');

class Recharge {
    createRechargeRecord(amount: number): JQueryPromise<any> {
        /// <returns type="jQuery.Deferred"/>
        return services.callMethod(services.config.accountServiceUrl, 'Account/CreateRechargeRecord', { amount: amount });
    }
    getRechargeRecords(pageIndex): LoadListPromise<any> {
        //获取充值记录
        pageIndex = pageIndex || 0;
        var pageSize = 20;  
        var args = { StartRowIndex: pageIndex * pageSize, MaximumRows: pageSize };
        var result = <LoadListPromise<any>>services.callMethod(services.config.accountServiceUrl, 'Account/GetRechargeRecord', args)
            .then(function (data) {
                return data.DataItems;
            });
        result.done((records) => {
            result.loadCompleted = records.length < pageSize;
        });

        return result;
    }
   
}

//export var recharge = {

//}

services['recharge'] = services['recharge'] || new Recharge();
export = <Recharge>services['recharge'];