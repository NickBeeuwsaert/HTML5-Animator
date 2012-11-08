/*global requestAnimationFrame:false,superCanvas:false,openFile:false */
var setCurrentFrame;
var getCurrentFrame;
var getTotalFrames;
var animatorNamespace = "hi";
var drawTimeline;


(function(){
    var mousedown = false;
    var currentFrameNo = 0;
    var totalFrames = 0;
    getTotalFrames = function(){
        return totalFrames;
    };
    var frameSelect = document.querySelector("#frameRange");
    setCurrentFrame = function(newFrame){
        frameSelect.value = currentFrameNo = newFrame;
    };
    frameSelect.addEventListener("change", function(){
        setCurrentFrame(parseInt(this.value, 10));
    }, false);
    getCurrentFrame = function(){
        return currentFrameNo;
    };
    var layerHeader = document.querySelector(".layers .layerHeader");
    var frameHeader = document.querySelector(".keyframes .frameHeader");
    
    var frames = document.querySelector(".keyframes .frames");
    var layers = document.querySelector(".layers .layers");
    
    
    var layerHCtx = superCanvas(layerHeader);
    var frameHCtx = superCanvas(frameHeader);
    
    var frameCtx = superCanvas(frames);
    var layerCtx = superCanvas(layers);
    //Preperation, create some patterns
    var canvas = document.createElement("canvas");
    var context = superCanvas(canvas);
    canvas.width = 10;
    canvas.height = 20;
    
    context.drawPath("M10,0 10,20 0,20");
    context.stroke();
    var grid = context.createPattern(canvas, "repeat");
    
    canvas.width = 10*5;
    canvas.height = 20;
    
    context.drawPath("M40,0 50,0 50,20 40,20");
    context.fillStyle="#eee";
    context.fill();
    var visibleLayer = superCanvas.bakeMatrixIntoPath(superCanvas.Matrix().scale(1/28,1/28).scale(20,20), superCanvas.parsePath("M16,8.286C8.454,8.286,2.5,16,2.5,16s5.954,7.715,13.5,7.715c5.771,0,13.5-7.715,13.5-7.715S21.771,8.286,16,8.286zM16,20.807c-2.649,0-4.807-2.157-4.807-4.807s2.158-4.807,4.807-4.807s4.807,2.158,4.807,4.807S18.649,20.807,16,20.807zM16,13.194c-1.549,0-2.806,1.256-2.806,2.806c0,1.55,1.256,2.806,2.806,2.806c1.55,0,2.806-1.256,2.806-2.806C18.806,14.451,17.55,13.194,16,13.194z"));
    var invisibleLayer = superCanvas.bakeMatrixIntoPath(superCanvas.Matrix().scale(1/28,1/28).scale(20,20),superCanvas.parsePath("M11.478,17.568c-0.172-0.494-0.285-1.017-0.285-1.568c0-2.65,2.158-4.807,4.807-4.807c0.552,0,1.074,0.113,1.568,0.285l2.283-2.283C18.541,8.647,17.227,8.286,16,8.286C8.454,8.286,2.5,16,2.5,16s2.167,2.791,5.53,5.017L11.478,17.568zM23.518,11.185l-3.056,3.056c0.217,0.546,0.345,1.138,0.345,1.76c0,2.648-2.158,4.807-4.807,4.807c-0.622,0-1.213-0.128-1.76-0.345l-2.469,2.47c1.327,0.479,2.745,0.783,4.229,0.783c5.771,0,13.5-7.715,13.5-7.715S26.859,13.374,23.518,11.185zM25.542,4.917L4.855,25.604L6.27,27.02L26.956,6.332L25.542,4.917z"));
    var everyfill = context.createPattern(canvas, "repeat");
    var timelineGradient = context.createLinearGradient(0, 0, 0, 20);
    timelineGradient.addColorStop(0, "#d0d0d0");
    timelineGradient.addColorStop(0.7, "#d0d0d0");
    timelineGradient.addColorStop(1, "#b4b4b4");
    var draw = function(doc){
        //Draw the headers....
        //layers
        layerHeader.width = layerHeader.parentNode.clientWidth;
        layerHeader.height=20;
        layerHCtx.fillStyle=timelineGradient;
        layerHCtx.fillRect(0,0, layerHeader.width, layerHeader.height);
        
        frameHeader.width = frameHeader.parentNode.clientWidth;
        frameHeader.height=20;
        frameHCtx.fillStyle=timelineGradient;
        frameHCtx.fillRect(0,0, frameHeader.width, frameHeader.height);
        frameHCtx.save();
        frameHCtx.rect(0,0,frameHeader.width,3);
        frameHCtx.rect(0,17,frameHeader.width, 3);
        frameHCtx.clip();
        frameHCtx.translate(-frameHeader.parentNode.scrollLeft, 0);
        frameHCtx.fillStyle=grid;
        frameHCtx.fillRect(frameHeader.parentNode.scrollLeft,0,frameHeader.width, 20);
        frameHCtx.restore();
        frameHCtx.font = "12px monospace";
        //Draw the frame numbers...
        frameHCtx.fillStyle="black";
        frameHCtx.translate(-frameHeader.parentNode.scrollLeft, 0);
        for(var i = 0; i < frameHeader.parentNode.scrollWidth; i+=5){
            var width = frameHCtx.measureText(i).width/2;
            frameHCtx.fillText(i, i*10-width+5, 20-6);
        }
        //Draw the current Frame
        frameHCtx.fillStyle = "rgba(255,0,0,0.5)";
        frameHCtx.fillRect(currentFrameNo*10, 0, 10, 20);
        //Draw te bodies
        
        // layers...
        layers.width=layers.parentNode.clientWidth;
        layers.height=layers.parentNode.clientHeight-20;
        layerCtx.font = "12px monospace";
        layerCtx.fillStyle="rgb(230,230,230)";
        layerCtx.fillRect(0,0,layers.width, layers.height);
        layerCtx.translate(0, -frames.parentNode.scrollTop);
        var layersArray = [];
        if(doc){
            var docRoot = doc.documentElement;
            var layerNum = 0;
            for(var i = 0; i != docRoot.childNodes.length; i++){
                var node = docRoot.childNodes[i];
                if(node.nodeName == "g"){
                    layersArray.push(node);
                    layerCtx.save();
                    layerCtx.translate(0,layerNum*20);
                    layerCtx.save();
                    layerCtx.beginPath();
                    layerCtx.rect(0,0,layers.width,20);
                    layerCtx.closePath();
                    layerCtx.clip();
                    layerCtx.rect(0,0,layers.width,20);
                    
                    layerCtx.fillStyle="rgba(212,208,200,1)";
                    layerCtx.fill();
                    layerCtx.strokeStyle="white";
                    layerCtx.beginPath();
                    layerCtx.moveTo(0,0);
                    layerCtx.lineTo(layers.width,0);
                    layerCtx.stroke();
                    layerCtx.closePath();
                    
                    layerCtx.strokeStyle="rgb(128,128,128)";
                    layerCtx.beginPath();
                    layerCtx.moveTo(0,20);
                    layerCtx.lineTo(layers.width,20);
                    layerCtx.stroke();
                    layerCtx.closePath();
                    
                    layerCtx.restore();
                    layerCtx.fillStyle="black";
                    layerCtx.fillText(node.getAttributeNS(animatorNamespace,"label") || ("layer"+layerNum), 0, 20-6);
                    
                    layerCtx.save();
                    layerCtx.translate(layers.width-28,0);
                    if(layers.mousedown === true && layers.x > 180)
                        node.style.display = node.style.display=="none"?"block":"none";
                    if(node.style.display=="none"){
                        layerCtx.drawPath(invisibleLayer);
                    }else{
                        layerCtx.drawPath(visibleLayer);
                    }
                    layerCtx.fill();
                    layerCtx.restore();
                    layerCtx.restore();
                    layerNum++;
                }
            }
        }
        //frames...
        var maxWidth = frames.parentNode.clientWidth/10;
        for(i = 0; i < layersArray.length; i++){
            var mLength = 0;
            var L = layersArray[i];
            for(k = 0; k < L.childNodes.length; k++){
                if(L.childNodes[k].nodeName!="g") continue;
                mLength += parseInt(L.childNodes[k].getAttributeNS(animatorNamespace, "length"), 10)||0;
            }
            maxWidth = Math.max(mLength, maxWidth);
        }
        //add 10 to maxWidth so that the user can see a bit past the end
        totalFrames = maxWidth;
        frames.width = (maxWidth + 10) * 10;
        frames.height = Math.max((frames.parentNode.clientHeight-20), layersArray.length*10);
        frameCtx.fillStyle = grid;
        frameCtx.fillRect(0,0,frames.width, frames.height);
        
        //Now, draw the keyframes
        for(i = 0; i < layersArray.length; i++){
            var at = 0;
            var L = layersArray[i];
            for(var k = 0; k < L.childNodes.length; k++){
                var frame = L.childNodes[k];
                if(frame.nodeName != "g")continue;
                var l = parseInt(frame.getAttributeNS(animatorNamespace, "length"),10)||1;
                frameCtx.fillStyle="white";
                frameCtx.strokeStyle="black";
                //frameCtx.lineWidth = 0.5;
                frameCtx.save();
                frameCtx.translate(at*10, i * 20);
                frameCtx.beginPath();
                frameCtx.rect(1,0,l*10-2, 20-1);
                frameCtx.closePath();
                frameCtx.fill();
                //frameCtx.stroke();
                frameCtx.beginPath();
                frameCtx.arc(5,15, 2, 0, Math.PI*2, false);
                frameCtx.fillStyle="black";
                frameCtx.fill();
                frameCtx.stroke();
                frameCtx.closePath();
                frameCtx.restore();
                at+=l;
            }
        }
        frameCtx.beginPath();
        frameCtx.strokeStyle = "rgba(255,0,0,0.5)";
        frameCtx.moveTo(currentFrameNo*10 + 5,0);
        frameCtx.lineTo(currentFrameNo*10 + 5, frames.height);
        frameCtx.stroke();
        frameCtx.closePath();
        
        //requestAnimationFrame(function(){draw(doc);});
    };
    var frameClickHandler = function(e){
        var x = (e.offsetX||e.layerX) + e.target.parentElement.scrollLeft;
        var frameN = Math.floor(x/10);
        //console.log(x, frameN);
        setCurrentFrame(frameN);
    };
    frameHeader.addEventListener("mousedown", frameClickHandler, false);
    frameHeader.addEventListener("mousedown", function(){ mousedown = true; }, false);
    frameHeader.addEventListener("mouseup", function(){ mousedown = false; }, false);
    frameHeader.addEventListener("mousemove", function(e){
        if(mousedown) frameClickHandler(e);
    }, false);
    layers.addEventListener("mousedown", function(e){
        this.mousedown = true;
        
    }, false);
    layers.addEventListener("mousemove", function(e){
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    layers.addEventListener("mouseup", function(e){
        layers.mousedown = false;
    }, false);
    drawTimeline = draw;
    //
    //draw();
})();
