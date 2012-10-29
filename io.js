var openFile = function(url, callback){
    var req = new XMLHttpRequest();
    req.onload = callback;

    req.open("GET", url);

    req.send();
}