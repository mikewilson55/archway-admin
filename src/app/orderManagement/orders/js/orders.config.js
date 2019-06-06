angular.module('orderCloud')
    .config(OrdersConfig)
;

function OrdersConfig($stateProvider) {
    $stateProvider
        .state('orders', {
            parent: 'base',
            url: '/orders?buyerID&fromDate&toDate&search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'orderManagement/orders/templates/orders.html',
            controller: 'OrdersCtrl',
            controllerAs: 'orders',
            data: {
                pageTitle: 'Orders'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                OrderList: function(ocOrdersService, Parameters) {
                   let result=ocOrdersService.List( Parameters);
                    Parameters.filters.status = (Parameters.filters[ 'xp.orderStatus' ] ? (Parameters.filters[ 'xp.orderStatus' ].toLowerCase() === 'shipped' ? 'Shipped' : (Parameters.filters[ 'xp.orderStatus' ].toLowerCase() === 'cancel*'  ? 'Canceled':(Parameters.filters.status.toLowerCase()==='!unsubmitted'? '!Unsubmitted':Parameters.filters.status))) : (Parameters.filters.status.toLowerCase()==='!unsubmitted'? '!Unsubmitted':Parameters.filters.status));
                    return result;
                },
                BuyerCompanies: function(OrderCloudSDK) {
                    var options = {
                        page: 1,
                        pageSize: 100
                    };
                    return OrderCloudSDK.Buyers.List(options);
                }
            }
        })
    ;
}