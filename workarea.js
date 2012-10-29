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
            for(var k = 0; k < layerNode.childNodes.length; k++){
                frameNode = layerNode.childNodes[k];
                if(frameNode.nodeName !== "g") continue;
                l = k;
                var length = parseFloat(frameNode.getAttributeNS(animatorNamespace, "length"))||1;
                var s = at;
                var e = at+length;
                if(frame  >= s && frame < e){
                    frames.push(frameNode);
                    f = true;
                    break;
                }
                at+=length;
            }
            if(!f){
                frames.push(layerNode.childNodes[l]);
            }
        }
        return frames;
    }
    function drawGroup(ctx, group){
        for(var i = 0; i < group.childNodes.length; i++){
            var element = group.childNodes[i];
            if(element.nodeName == "g"){
                drawGroup(ctx, element);
            }else if(element.nodeName == "path"){
                ctx.beginPath();
                ctx.drawPath(element.getAttribute("d"));
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
    function draw(doc){
        width = parseFloat(doc.documentElement.getAttribute("width"));
        height = parseFloat(doc.documentElement.getAttribute("height"));
        canvas.width = Math.max(width, parent.clientWidth)*2;
        canvas.height = Math.max(height, parent.clientHeight)*2;
        
        
        // draw a white square for the canvas
        
        var x = (canvas.width - width)/2;
        var y = (canvas.height - height)/2;
        context.beginPath();
        context.fillStyle="#777";
        context.rect(x+4, y+4, width, height);
        context.fill();
        context.closePath();
        
        context.beginPath();
        context.fillStyle="black";
        context.rect(x-1, y-1, width+2, height+2);
        context.fill();
        context.closePath();
        
        context.beginPath();
        context.fillStyle="white";
        context.rect(x, y, width, height);
        context.fill();
        context.closePath();
        
        //draw the frame...
        
        var layers = getAtFrame(doc, getCurrentFrame());
        context.translate(x, y);
        context.fillStyle = "black";
        context.strokeStyle = "black";
        
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            drawGroup(context, layer);
        }
        //requestAnimationFrame(function(){draw(doc);});
    }
    
    // draw();
    drawWorkspace = draw;
    
})();