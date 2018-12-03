angular.module('orderCloud')
    .factory( 'changeLogService', ChangeLogService );

function ChangeLogService( $resource, devapiurl, OrderCloudSDK ) {
    let service = {
        CreateChangeLog: _create,
        GetChangeLog: _get
    };

    function _create( productChangeModel) {
        return OrderCloudSDK.Me.Get().then( ( currentUser ) => {
            let body = {
                oldProduct: {
                    id: productChangeModel.oldProduct.id == undefined ? null : productChangeModel.oldProduct.id,
                    name: productChangeModel.oldProduct.name == undefined ? null : productChangeModel.oldProduct.name,
                    description: productChangeModel.oldProduct.description == undefined ? null : productChangeModel.oldProduct.description,
                    brand: productChangeModel.oldProduct.brand == undefined ? null : productChangeModel.oldProduct.brand,
                    comments: productChangeModel.oldProduct.comments == undefined ? null : productChangeModel.oldProduct.comments,
                    keywords: productChangeModel.oldProduct.keywords == undefined ? null : productChangeModel.oldProduct.keywords,
                    qtyMultiplier: productChangeModel.oldProduct.qtyMultiplier == undefined ? null : productChangeModel.oldProduct.qtyMultiplier,
                    unitofMeasure: productChangeModel.oldProduct.unitofMeasure == undefined ? null : productChangeModel.oldProduct.unitofMeasure,
                    active: productChangeModel.oldProduct.active == undefined ? null : productChangeModel.oldProduct.active,
                    approvalRequired: productChangeModel.oldProduct.approvalRequired == undefined ? null : productChangeModel.oldProduct.approvalRequired,
                    whileSuppliesLast: productChangeModel.oldProduct.whileSuppliesLast == undefined ? null : productChangeModel.oldProduct.whileSuppliesLast,
                    imageName: productChangeModel.oldProduct.imageName == undefined ? null : productChangeModel.oldProduct.imageName
                  },
                  newProduct: {
                    id: productChangeModel.newProduct.id == undefined ? null : productChangeModel.newProduct.id,
                    name: productChangeModel.newProduct.name == undefined ? null : productChangeModel.newProduct.name,
                    description: productChangeModel.newProduct.description == undefined ? null : productChangeModel.newProduct.description,
                    brand: productChangeModel.newProduct.brand == undefined ? null : productChangeModel.newProduct.brand,
                    comments: productChangeModel.newProduct.comments == undefined ? null : productChangeModel.newProduct.comments,
                    keywords: productChangeModel.newProduct.keywords == undefined ? null : productChangeModel.newProduct.keywords,
                    qtyMultiplier: productChangeModel.newProduct.qtyMultiplier == undefined ? null : productChangeModel.newProduct.qtyMultiplier,
                    unitofMeasure: productChangeModel.newProduct.unitofMeasure == undefined ? null : productChangeModel.newProduct.unitofMeasure,
                    active: productChangeModel.newProduct.active == undefined ? null : productChangeModel.newProduct.active,
                    approvalRequired: productChangeModel.newProduct.approvalRequired == undefined ? null : productChangeModel.newProduct.approvalRequired,
                    whileSuppliesLast: productChangeModel.newProduct.whileSuppliesLast == undefined ? null : productChangeModel.newProduct.whileSuppliesLast,
                    imageName: productChangeModel.newProduct.imageName == undefined ? null : productChangeModel.newProduct.imageName
                  },
                  modifiedBy : currentUser.Username ,
                  modifiedDate : new Date(),
                  applicationName : "PPG-Seller",
                  action : productChangeModel.Action,
                  productId : productChangeModel.productId
            };

            return $resource( `${devapiurl}/savechangelog`, {}, { send: { method: 'POST', headers: { 'Authorization': `Bearer ${OrderCloudSDK.GetToken()}` } } } ).send( body ).$promise;
        } );
    }

    function _get( productId, pageNumber, pageSize,sortBy ) { 
        console.log('test2');       
        return $resource( `${devapiurl}/getchangelog`, { productid : productId, pageNumber: pageNumber,pageSize: pageSize, orderBy: sortBy} , { send: { method: 'GET', headers: { 'Authorization': `Bearer ${OrderCloudSDK.GetToken()}` } } } ).send( ).$promise;
    }

    return service;
}