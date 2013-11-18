/* USAGE
 * 
 * <div id="upload-{{ $index }}" data-tyaslab-upload
 *      data-name="filename"
 *      data-action="/upload/image/"
 *      data-accept="image/*">
 * </div>
 * 
 */

// TODO : onSuccess, onFail, onProgress

angular.module('tyaslab.upload', [])
.directive('tyaslabUpload', function($parse) {
    return {
        restrict : 'A',
        template :
            '<div class="fakeUpload">' +
                '<input name="{{ name }}" accept="{{ accept }}" data-action="{{ action }}" type="file">' +
                '<a class="fakeLink" href="javascript:void(0);"><span ng-transclude></span></a>' +
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
            
            element.find('a').on('click', function() {
                element.find('[type=file]').click();
            });
            
            scope.$watch('id', function(newVal, oldVal) {
                scope.id = newVal;
                
                document.getElementById(scope.id).getElementsByTagName('input')[0].onchange = function(evt) {
                    var file = this.files[0];
                    var formdata = new FormData();
                    var name = this.getAttribute('name');
                    var action = this.getAttribute('data-action');
                    
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
                                if (attrs.ngModel) {
                                    $parse(attrs.ngModel).assign(scope.$parent, responseText);
                                }
                            });
                        }
                    });
                };
            });
        }
    };
});
