// Don't pollute the global namespace...
(function(){
/* these will probably be needed again as the file grows, so make them available everywhere */
var prefix = [
    "o",
    "ms",
    "moz",
    "webkit"
];
if(!window.requestAnimationFrame){
    for(var i = 0; i < prefix.length; i++){
        if(window[prefix[i]+"RequestAnimationFrame"] !== undefined){
            window.requestAnimationFrame = window[prefix[i]+"RequestAnimationFrame"];
            break;
        }
    }
    //if all else fails
    if(!window.requestAnimationFrame){
        //define a fallback if all else fails
        window.requestAnimationFrame = function(callback){window.setTimeout(callback, 1000/60);};
    }
}
})();
var $ = function(){
    var cache = {};
    /**
     * @param selector the selector to query
     * @param [docache=true] whether or not use the cache defaults to `true`
     * @param [doc=document] the document to use, defaults to `document`
     **/
    return function(selector, doCache, doc){
        doCache = doCache || true;
        doc = doc || document;
        if(doCache){
            return cache[selector]===undefined?cache[selector] = doc.querySelector(selector) : cache[selector];
        }
        return cache[selector] = doc.querySelector(selector);
    };
}();