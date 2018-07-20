/**
 * 自制toast组件
 * @param {Object} $scope   作用域对象
 */
function weToast(options) {
    var opt = {
        text: 'sucess!',
        toast_visible: !1
    };
    
    for(var i in options){
        opt[i] = options[i];
    }

    function show(){
        
    }
}