/* USAGE
 * 
 * <div id="upload-{{ $index }}" data-tyaslab-upload
 *      data-name="filename"
 *      data-action="/upload/image/"
 *      data-accept="image/*">
 * </div>
 * 
 */

angular.module('tyaslab.upload', [])
.directive('tyaslabUpload', ['$parse', '$rootScope', function($parse, $rootScope) {
    return {
        restrict : 'A',
        template :
            '<div class="fakeUpload">' +
                '<input name="{{ name }}" accept="{{ accept }}" data-action="{{ action }}" type="file">' +
                '<span ng-transclude class="fakeLink"></span>' +
            '</div>',
        transclude : true,
        scope : {
            id : '@',
            ngModel : '=',
            index : '@',
            action : '@',
            accept : '@',
            name : '@'
        },
        link : function(scope, element, attrs, ctrls) {
            scope.$watch('index', function(newVal, oldVal) {
                scope.index = parseInt(newVal);
            });

            element.find('.fakeLink').bind('click tap', function() {
                element.find('[type=file]').trigger('click');
            });
            
            scope.$watch('id', function(newVal, oldVal) {
                scope.id = newVal;
                
                document.getElementById(scope.id).getElementsByTagName('input')[0].onchange = function(evt) {
                    var thisElement = angular.element(this).closest('.fakeUpload'),
                        file = this.files[0],
                        formdata = new FormData(),
                        name = this.getAttribute('name'),
                        action = this.getAttribute('data-action');
                    
                    formdata.append(name, file);
                    // TODO: USE NATIVE JAVASCRIPT
                    $.ajax({
                        url : action,
                        type : 'POST',
                        data : formdata,
                        processData: false,
                        contentType : false,
                        success : function(responseText) {
                            scope.$apply(function() {
                                $rootScope.$broadcast('upload_success', responseText);
                                if (attrs.ngModel) {
                                    $parse(attrs.ngModel).assign(scope.$parent, responseText);
                                }
                            });
                        },
                        beforeSend : function() {
                            scope.$apply(function() {
                                $rootScope.$broadcast('upload_before_send', thisElement);
                            });
                        },
                        complete : function() {
                            scope.$apply(function() {
                                $rootScope.$broadcast('upload_complete', thisElement);
                            });
                        }
                    });
                };
            });
        }
    };
}])

.run(['$rootScope', function($rootScope) {
    $rootScope.$on('upload_before_send', function(evt, element) {
        console.log('Upload is going up');
    });

    $rootScope.$on('upload_complete', function(evt, element) {
        console.log('Upload complete');
    });

    $rootScope.$on('upload_success', function(evt, responseText) {
        console.log('File upload succeed resulting: ' + responseText);
    });
}]);