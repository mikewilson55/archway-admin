angular.module('orderCloud')
.directive('ocFileUpload', ordercloudFileUpload)
;

function ordercloudFileUpload($uibModal, $ocFiles, OrderCloudSDK, toastr, ocConfirm, imagestorageurl, changeLogService) {
let directive = {
    scope: {
        model: '<fileUploadModel',
        options: '<fileUploadOptions',
        product: '='
    },
    restrict: 'E',
    require: '^?ocPrettySubmit',
    template: '<div ng-include="fileUploadTemplate"></div>',
    replace: true,
    link: link
};

function link(scope, element, attrs, formCtrl) {
    scope.imagestorageurl = imagestorageurl;
    // if (!ocFiles.Enabled()) return;
    (function mergeOptions() {
        var globalOptions = $ocFiles.GetFileUploadOptions();
        scope.fileUploadOptions = scope.options ?  _.merge({}, globalOptions, scope.options) : globalOptions;
        scope.fileUploadTemplate = scope.fileUploadOptions.multiple ? 'common/directives/oc-file-upload/templates/oc-files-upload.html' : 'common/directives/oc-file-upload/templates/oc-file-upload.html';
        scope.model ? scope.fileUploadModel = angular.copy(scope.model) : scope.fileUploadModel = [];
    })();

    scope.openModal = function(index) {
        $uibModal.open({
            templateUrl: 'common/directives/oc-file-upload/templates/oc-file-upload.modal.html',
            controller: 'FileUploadModalCtrl',
            controllerAs: 'fileUploadModal',
            size: 'lg',
            resolve: {
                CurrentValue: function() {
                    return scope.fileUploadOptions.multiple ? (index > -1 ? scope.fileUploadModel[scope.fileUploadOptions.keyname][index] : {}) : scope.fileUploadModel[scope.fileUploadOptions.keyname][0];
                },
                FileUploadOptions: function() {
                    return scope.fileUploadOptions;
                },
                Product: function() {
                    scope.xpImages = scope.product.xp.Images;
                    return scope.product;
                }
            }
        }).result.then(function(data) {
            if (scope.fileUploadOptions.multiple) {
                index > -1 
                    ? (scope.fileUploadModel[index] = data) 
                    : scope.fileUploadModel[scope.fileUploadOptions.keyname] ? scope.fileUploadModel[scope.fileUploadOptions.keyname].push(data) : scope.fileUploadModel[scope.fileUploadOptions.keyname] = [data];
            } else {
                if (scope.fileUploadOptions.action == 'create') {
                    scope.product.Image = data;
                    return;
                } else {
                    let oldImageName = "";
                    let newImageName = data.xp.Images[0].StorageName;
                    let action = "Create";
                    if (scope.xpImages.length > 0) {
                        action = "Edit"
                        oldImageName = scope.fileUploadModel[scope.fileUploadOptions.keyname][0].StorageName;
                    }
                    scope.fileUploadModel[scope.fileUploadOptions.keyname][0] = data.xp.Images[0];
                    SaveProductChangeLog(oldImageName, newImageName, action, scope.product.ID);
                    scope.product.xp.Images = data.xp.Images;
                    scope.xpImages = data.xp.Images;
                }
            }
            toastr.success('Product image updated');
        });
    };

    scope.addImage = function() {
        if (!scope.fileUploadOptions.multiple) return;
        scope.openModal(-1);
    };

    function SaveProductChangeLog(oldImageName, newImageName, action, productId) {
        let changeLogRequest = {
            oldProduct: {
                imageName: oldImageName 
            },
            newProduct: {
                imageName: newImageName 
            },
            Action : action,
            productId : productId
          }
          changeLogService.CreateChangeLog( changeLogRequest )
            .then( () => {
                console.log("Saved Sucessfully");
            } )
            .catch( ( ex ) => {
                $exceptionHandler( ex );
            } );
    }


    scope.fileUploadModelCopy = angular.copy(scope.fileUploadModel);
    scope.dropped = function(index) {
        scope.fileUploadModel[scope.fileUploadOptions.keyname].splice(index, 1);
        // callOnUpdate();
        scope.fileUploadModelCopy = angular.copy(scope.fileUploadModel);
    };

    scope.removeFile = function(index) {
        ocConfirm.Confirm({
            message: 'Are you sure you want to delete this file?',
            confirmText: 'Delete file',
            type: 'delete'})
            .then(function() {
                let oldImageName = scope.fileUploadModel[scope.fileUploadOptions.keyname][0].StorageName;
                let newImageName = "";
                let action = "Delete";
                if (scope.fileUploadOptions.multiple) {
                    if (scope.fileUploadModel && scope.fileUploadModel[scope.fileUploadOptions.keyname] && scope.fileUploadModel[scope.fileUploadOptions.keyname] && scope.fileUploadModel[scope.fileUploadOptions.keyname][index]) {
                        scope.fileUploadModel[scope.fileUploadOptions.keyname].splice(index, 1);
                        scope.product.xp.Images = scope.fileUploadModel[scope.fileUploadOptions.keyname];
                    }
                }
                else {
                    if (scope.fileUploadModel && scope.fileUploadModel[scope.fileUploadOptions.keyname]) scope.fileUploadModel[scope.fileUploadOptions.keyname][0] = null;
                    scope.product.xp.Images = [];
                }

                return OrderCloudSDK.Products.Patch( scope.product.ID, {xp: scope.product.xp}).then( () => {
                    // callOnUpdate();
                    dirtyModel();
                    SaveProductChangeLog(oldImageName, newImageName, action, scope.product.ID);
                    toastr.success('Product image deleted');
                    scope.fileUploadModel[scope.fileUploadOptions.keyname] = scope.product.xp.Images && scope.product.xp.Images.length ? scope.product.xp.Images : [{}]; 
                });
            });
    };

    // function callOnUpdate() {
    //     if (scope.fileUploadOptions.onUpdate && (typeof scope.fileUploadOptions.onUpdate == 'function')) scope.fileUploadOptions.onUpdate(scope.fileUploadModel);
    // }

    function dirtyModel() {
        if (formCtrl && formCtrl.setDirty) formCtrl.setDirty();
    }
}

return directive;
}

