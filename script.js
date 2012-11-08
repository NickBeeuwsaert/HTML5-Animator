/*global requestAnimationFrame:false,superCanvas:false,openFile:false */
var setCurrentFrame;
var getCurrentFrame;
var getTotalFrames;
var animatorNamespace = "hi";
var drawTimeline;
var getLayers;

(function(){
    //some defines for frame types
    var FRAME = {
        tween: 1<<1,
        combine: 1<<2,
        blank: 1<<0
    };
        
    /**
     * @description draws a layer with the name specified. the layer will span the width of its container, and the height of drawLayer.height, which defaults to 20px high
     * NOTE: the layer will be from start at (0,0) and move to the (canvas.width, drawLayer.height), so translate before this is called
     * @param name the layers name
     * @param context the HTML5 canvas context to use to draw
     * @param [visible=true] the layers visibility, defaults to true
     * @param [outline=false] whether or not the layer is just drawn as an outline, as opposed to with fill and stroke
     **/
    var drawLayer = function(context, name, visible, outline, options){
        options = options || {};
        var height = options.height || 20;
        var font = options.font || "monospace";
        var fontSize = options.fontSize || "12";
        
        var width = context.canvas.width;
        context.save();
        context.rect(0, 0, width, height);
        context.clip();
        
        context.fillStyle="#eee";
        context.fillRect(0,0,width, height);
        
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(width, 0);
        context.strokeStyle="#333";
        context.stroke();
        context.closePath();
        
        context.beginPath();
        context.moveTo(0, height);
        context.lineTo(width, height);
        context.strokeStyle="#777";
        context.stroke();
        context.closePath();
        context.fillStyle="black";
        context.font = [fontSize+"px", font].join(' ');
        context.fillText(name || "Hi!", 0, height - fontSize/2);
        
        context.restore();
    };
    /**
     * goes through els and gives el[name] a context property for the el[name].canvas
     **/
    var contextulize = function(els){
        for(var itemName in els){
            if(!els.hasOwnProperty(itemName)) continue;
            els[itemName].context = superCanvas(els[itemName].canvas);
        }
    return els;
    };
    /**
     * loops through doc and gets all <g> elements
     * @param doc the element to get the layers from
     * @returns {Array} an array of layers
     **/
    var getLayers = function(doc){
        var i = 0;
        var layers = [];
        for(i = 0; i < doc.childNodes.length; i++){
            var element = doc.childNodes[i];
            if(element.nodeType == 1 && element.nodeName == "g"){
                layers.push(element);
            }
        }
        return layers;
    };
    /**
     * Draws a keyframe at 0,0 
     * @param context the HTML5 canvas context to use
     * @param [options] options to use in the drawing
     * @param [options.length=1] the length of the frame
     * @param [options.type=1<<2] bitmask that is the type of the keyframe, blank (1<<0), tween(1<<1), or combine(1<<2)
     * @param [globalOptions] global options to use
     * @param [globalOptions.height=20] the height of the keyframe
     * @param [globalOptions.ratio=1/2] the height to width ratio
     **/
    var drawKeyframe = function(context, options, globalOptions){
        options = options || {};
        globalOptions = globalOptions || {};
        var frames = options.length||1;
        var height = globalOptions.height || 20;
        var width = height * globalOptions.ratio||0.5;
        context.save();
        
        context.beginPath();
        context.fillStyle="white";
        context.strokeStyle="black";
        context.rect(0,0,(width * frames)-1, height-1);
        context.stroke();
        context.fill();
        context.closePath();
        
        context.beginPath();
        context.fillStyle = "black";
        context.arc(width/2, height-5, 3, 0, Math.PI*2);
        context.closePath();
        context.fill();
        if(frames > 1 && (options.type||FRAME.combine) & FRAME.tween){
            context.beginPath();
            var x =(frames - 1 )*width;
            context.moveTo(x,height - 7);
            context.lineTo( Math.max(1, frames - 3)*width,height - 7);
            context.moveTo(x-3, height - 10);
            context.lineTo(x, height - 7);
            context.lineTo(x-3, height - 4);
            
            context.stroke();
            context.closePath();
        }
        context.restore();
    };
    var options = {
        height: 20,
        font: "monospace",
        fontSize: 12,
        ratio: 1/2,
        frame: 0,
        totalFrames: 0
    };
    getCurrentFrame = function(){return options.frame;}
    setCurrentFrame = function(newFrame){options.frame = newFrame;}
    getTotalFrames = function(){return options.totalFrames;};
    var header = contextulize({layers: {canvas: $("#layerHeader")},
                  frames: {canvas: $("#frameHeader")}
                 });
    var body = contextulize({layers: {canvas: $("#layers")},
                  frames: {canvas: $("#frames")}
                 });
    var drawHeader = function(doc){
        header.layers.canvas.width = header.layers.canvas.parentElement.clientWidth;
        header.layers.canvas.height = 20;
        
        header.frames.canvas.width = header.frames.canvas.parentElement.clientWidth;
        header.frames.canvas.height = 20;
        //create teh grid...
        var frame_width = (options.height * options.ratio);
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = frame_width; 
        canvas.height = options.height;
        
        ctx.moveTo(canvas.width, 0);
        ctx.lineTo(canvas.width, (options.height - options.fontSize)/2);
        ctx.moveTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width, canvas.height - (options.height - options.fontSize)/2);
        ctx.stroke();
        
        var pat = ctx.createPattern(canvas, "repeat");
        header.frames.context.fillStyle=pat;
        header.frames.context.fillRect(0,0, header.frames.canvas.width,  header.frames.canvas.height);
        canvas = pat = ctx = null;
        header.frames.context.fillStyle = "black";
        //number the frames
        header.frames.context.font = [options.fontSize+"px", options.font].join(' ');
        for(var i = 0; i < header.frames.canvas.width / frame_width; i+=5){
            var str = i;
            var pos = i-1;
            if(pos <= 0 ){
                str = 1;
                pos++;
            }
            var textWidth = header.frames.context.measureText(str+"").width;
            header.frames.context.fillText(str, pos*frame_width - textWidth/2 + (frame_width / 2), header.frames.canvas.height-options.fontSize/2);
        };
        //Now, draw the current frame
        header.frames.context.fillStyle="rgba(255,0,0,0.5)";
        header.frames.context.fillRect(options.frame*frame_width, 0,frame_width, options.height);
    };
    var maxWidth = 0;
    var drawBody = function(doc){
        var i = 0;
        //Update the sizes...
        body.layers.canvas.width = body.layers.canvas.parentElement.clientWidth;
        body.layers.canvas.height = body.layers.canvas.parentElement.clientHeight - 20;
        
        body.frames.canvas.width = Math.max(maxWidth, body.frames.canvas.parentElement.clientWidth);
        body.frames.canvas.height = body.frames.canvas.parentElement.clientHeight - 20;
        
        //draw the layers
        var layers = getLayers(doc);
        //console.log(layers);
        for(i = 0; i < layers.length; i++){
            drawLayer(body.layers.context, "Hi!", true, false, options);
            body.layers.context.translate(0, options.height);
        }
        //Okay, now with that out of the way, we can proceed to draw the keyframes
        //Create the grid pattern
        var gridWidth = options.height * options.ratio;
        var gridHeight = options.height;
        
        var canvas = document.createElement("canvas");
        canvas.width = gridWidth;
        canvas.height = gridHeight;
        var context = canvas.getContext("2d");
        context.moveTo(canvas.width, 0);
        context.lineTo(canvas.width, canvas.height);
        context.lineTo(0, canvas.height);
        context.stroke();
        
        var grid = context.createPattern(canvas, "repeat");
        
        body.frames.context.fillStyle = grid;
        body.frames.context.fillRect(0, 0, body.frames.canvas.width, body.frames.canvas.height);
        
        //Draw the keyframes
        var mW = 0;
        body.frames.context.save();
        for(i = 0; i < layers.length; i++){
            var layer = layers[i];
            body.frames.context.save();
            var w = 0;
            for(var f = 0; f < layer.childNodes.length; f++){
                var frame = layer.childNodes[f];
                if(frame.nodeName !== "g") continue;
                var o = {length: frame.getAttributeNS(animatorNamespace, "length") };
                drawKeyframe(body.frames.context, o, options);
                w+=o.length;
                body.frames.context.translate(o.length * (options.height * options.ratio), 0);
            }
            mW = Math.max(w, mW);
            body.frames.context.restore();
            body.frames.context.translate(0, options.height);
        }
        body.frames.context.restore();
        options.totalFrames = mW;
        maxWidth = mW * (o.length * (options.height * options.ratio));
        canvas = null;
        context = null;
        grid = null;
        body.frames.context.setTransform(1,0,0,1,0,0);
        //draw the position of the current frame
        body.frames.context.strokeStyle="red";
        body.frames.context.beginPath();
        
        body.frames.context.moveTo(options.frame*gridWidth + gridWidth/2, 0);
        body.frames.context.lineTo(options.frame*gridWidth + gridWidth/2, body.frames.canvas.height);
        
        body.frames.context.stroke();
        body.frames.context.closePath();
        
    };
    drawTimeline = function(doc){
        drawHeader(doc);
        drawBody(doc);
    };
    //handle when frames are clicked on
    var clickHandler = function(e){
        if(!this.mousedown)return;
        var width = options.height * options.ratio;
        setCurrentFrame(Math.floor(e.offsetX / width));
    };
    var mouseDownHandler = function(){
        this.mousedown = true;
    };
    var mouseUpHandler = function(){
        this.mousedown = false;
    };
    
    header.frames.canvas.addEventListener("mousedown", mouseDownHandler);
    body.frames.canvas.addEventListener("mousedown", mouseDownHandler);
    header.frames.canvas.addEventListener("mouseup", mouseUpHandler);
    body.frames.canvas.addEventListener("mouseup", mouseUpHandler);
    
    header.frames.canvas.addEventListener("mousedown", clickHandler);
    body.frames.canvas.addEventListener("mousedown", clickHandler);
    header.frames.canvas.addEventListener("mouseup", clickHandler);
    body.frames.canvas.addEventListener("mouseup", clickHandler);
    
    
    header.frames.canvas.addEventListener("mousemove", clickHandler);
    body.frames.canvas.addEventListener("mousemove", clickHandler);
    
})();
