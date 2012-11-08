/*globals requestAnimationFrame:false,superCanvas:false */
var drawWorkspace;
(function(){
    var canvas = document.querySelector("#anim-canvas");
    var parent = canvas.parentNode;
    
    var context = superCanvas(canvas);
    //for now, get use these dimensions
    var width = 480;
    var height = 280;
    var rMargin, bMargin, lMargin, tMargin;
    lMargin = rMargin = width  / 2;
    tMargin = bMargin = height / 2;
    function getAtFrame(doc, frame){
        var frames = [];
        for(var i = 0; i < doc.documentElement.childNodes.length; i++){
            var layerNode = doc.documentElement.childNodes[i];
            if(layerNode.nodeName !== "g") continue;
            var at = 0;
            var f = false;
            var l = 0;
            var listOfFrames = [];
            for(var k = 0; k < layerNode.childNodes.length; k++){
                var frameNode = layerNode.childNodes[k];
                if(frameNode.nodeName !== "g") continue;
                l = k;
                var length = parseFloat(frameNode.getAttributeNS(animatorNamespace, "length"))||1;
                var s = at;
                var e = at+length;
                if(frameNode.getAttributeNS(animatorNamespace, "type") == "keyframe"){
                    listOfFrames = [];
                }
                listOfFrames.push(frameNode);
                if(frame  >= s && frame < e){
                    break;
                }
                at+=length;
            }
            frames.push(listOfFrames);
            //if(!f){
            //    frames.push(layerNode.childNodes[l]);
            //}
        }
        return frames;
    }
    function applyTransformString(ctx, transform){
        var transform = transform.match(/[a-z]+\(.+?\)/gi);
        var SVGTransforms = ["scale", "translate", "skewX", "skewY", "matrix"];
        for(var i = 0; i < transform.length; i++){
            var args = transform[i].match(/([a-z]+|[\-]?(0|[1-9]\d*)(\.\d*)?([e][+\-]?\d+)?)/gi);
            var cmd = args.shift();
            if(SVGTransforms.indexOf(cmd) !== -1){
                ctx[cmd].apply(ctx, args);
            }
        }
    }
    function drawGroup(ctx, group){
        for(var i = 0; i < group.childNodes.length; i++){
            var element = group.childNodes[i];
            if(element.nodeType != 1) continue;
            ctx.save();
            if(element.hasAttribute("transform")){
                applyTransformString(ctx, element.getAttribute("transform"));
            }
            if(element.nodeName == "g"){
                drawGroup(ctx, element);
            }else if(element.nodeName == "path"){
                ctx.beginPath();
                ctx.drawPath(element.getAttribute("d"));
                ctx.strokeStyle = element.getAttribute("stroke") || element.style.stroke || "black";
                ctx.strokeStyle = element.getAttribute("stroke-width") || element.style.strokeWidth || 1;
                ctx.fillStyle =  element.getAttribute("fill") || element.style.fill || "transparent";
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
            ctx.restore();
        }
    }
    var zoomControl = document.querySelector("#zoom");
    function draw(doc){
        var zoom = zoomControl.value/100;
        width = parseFloat(doc.documentElement.getAttribute("width"));
        height = parseFloat(doc.documentElement.getAttribute("height"));
        canvas.width = (Math.max(width, parent.clientWidth)*2)*(zoom);
        canvas.height = (Math.max(height, parent.clientHeight)*2)*(zoom);
        
        
        
        
        // draw a white square for the canvas
        
        var x = (canvas.width - width*zoom)/2;
        var y = (canvas.height - height*zoom)/2;
        
        context.translate(x, y);
        context.scale(zoom,zoom);
        context.beginPath();
        context.fillStyle="#777";
        context.rect(4*zoom, 4*zoom, width, height);
        context.fill();
        context.closePath();
        
        context.beginPath();
        context.fillStyle="black";
        context.rect(0, 0, width, height);
        context.stroke();
        
        context.closePath();
        
        context.beginPath();
        context.fillStyle="white";
        context.rect(0, 0, width, height);
        context.fill();
        context.closePath();
        
        //draw the frame...
        
        var layers = getAtFrame(doc, getCurrentFrame());
        context.fillStyle = "gray";
        context.strokeStyle = "gray";
        /*for(var i = 0; i < layers.length; i++){
            var el = layers[i].previousSibling;
            while(el!==null && el.nodeName!=="g") el = el.previousSibling;
            if(el == null)continue;
            var layer = el;
            drawGroup(context, layer);
        }*/
        //context.translate(x, y);
        
        context.fillStyle = "black";
        context.strokeStyle = "black";
        for(var i = 0; i < layers.length; i++){
            var framesBefore = layers[i];
            
            for(var j = 0; j < framesBefore.length; j++){
                drawGroup(context, framesBefore[j]);
            }
        }
        //requestAnimationFrame(function(){draw(doc);});
    }
    
    // draw();
    drawWorkspace = draw;
    
})();