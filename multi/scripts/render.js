
var SnowflakeCA = (function(){
	"use strict";

  	//Configure all settings here - add new ones here as well
    var Data = (function () {

  	var config = (function() {
  		return {
  			FramesPerSecond: 6,
  			TotalCellRows: 70,
  			CellArmToBodyRatio: 2/3,
  			CellDiameter: 2,
  			CellStrokeStyle: "#fff",
  			CellFillStyle: "cornflowerblue",
  			CanvasFillStyle: "transparent",
  			CanvasShadowColor: "cornflowerblue",
  			CanvasShadowBlur: 7,
  			CanvasShadowsOffset: 4,				
  			PageBackgroundColor: "black"
  		};
  	})();

  	var gridData = function ( zIndex, canvas, framesPerSecond ){

  		var frames;
  		var gridCanvas = canvas[0];
  		var width = canvas.width();
  		var fps = framesPerSecond;
  		
  		var unlocked = true;

  		
  		function setFrames(value){
  			frames = value;
  		}

  		//Animation event handler 
  		function animate(){
  			if( frames !== undefined ){
  				var frameIndex = 0;			
  				var frameCount = frames.length;	
  				var context = gridCanvas.getContext("2d");	
  
  				var animateLoop = function() {		
  					setTimeout(function() {
  							if(frameIndex < frameCount){ 
  								unlocked = false;
  								context.clearRect(0,0, gridCanvas.width, gridCanvas.height);
  								var imageHeight = frames[frameIndex].height;
  								var imageWidth = frames[frameIndex].width;
  								context.drawImage( frames[frameIndex], (gridCanvas.width/2) - (imageWidth/2), (gridCanvas.height/2) - (imageHeight/2) );
  								requestAnimationFrame(animateLoop);
  								frameIndex++;
  							}else{
  								unlocked = true;
  							}
  					}, 1000 / fps);
  	
  				};

  				animateLoop();			
  			}
  		}

  		canvas.hover( 
  				function (){ 
  					//console.log(canvas.position().left);
  					//canvas.css({transform: 'translate3d('+width+', '+width+', '+ 0 +'px)'});					
  					if(unlocked)
  						animate();
  											 
  				}
  				, 
  				function (){
  					//canvas.css({transform: 'translate3d('+width+', '+width+', '+  baseZIndex +'px)'});
  				}
  		);

  		return {
  			Animate: animate,
  			SetFrames: setFrames
  		};

  	}; 

        return {
  		GridData:gridData,
  		Config:config
        };

    })();


  //Things responsible for drawing and animation go here.
  var Renderer = (function(){

  	function DrawCell( x, y, radius, color, context ){

  		context.fillStyle = color;
  		context.beginPath();
  		context.moveTo (x +  radius * Math.cos(0), y +  radius *  Math.sin(0));          

  		var angle; var c = 2 * Math.PI / 6;

  		for (var i = 1; i <= 6; i++) {		
  			angle = i * c;
  			context.lineTo (x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  		}

  		context.closePath();
  		context.strokeStyle = "#fff";
  		context.lineWidth = 1;
  		context.stroke();
  		context.fill();
  	}


  	function GetCellImage(diameter){

  		var imageCanvas = document.createElement('canvas');
  		var radius = diameter/2;
  		imageCanvas.height = imageCanvas.width = (diameter);
  		DrawCell(radius, radius, radius, Data.Config.CellFillStyle, imageCanvas.getContext("2d"));
  		return imageCanvas;
  	}

  	function RenderGridImage( grid, maxGridRows, centerCellCount, diameter, image ){

  		var renderCanvas = document.createElement('canvas');
  		var context = renderCanvas.getContext("2d");	
  		var radius = diameter/2;
  		var maxCellsWidth = maxGridRows * 2;

  		if( centerCellCount === 1 )
  			maxCellsWidth--;

  		renderCanvas.width = renderCanvas.height = (maxCellsWidth * diameter) + 10;

  		var gridLength = grid.length;
  		var currentWidth = 0;
  		var x; var y;
  		var offset;
  		var visualOffset = 0.86;

  		var dead = 0;
  		var alive = 1;			

  		for( var i = 0; i < gridLength; i++ ){

  			currentWidth = grid[i].length;
  			offset = radius * (maxCellsWidth - currentWidth + 1);

  			for( var j = 0; j < currentWidth; j++ ){

  				if( grid[i][j] > 0 ){
  					x =  offset + (diameter * j);				
  					y =  (radius + (diameter * i)) * visualOffset;
  					context.drawImage(image, x, y);
  				}				
  			}
  		}

  		return renderCanvas;

  	}	

  	function GetRenderFrames( maxGridRows, centerCellCount, diameter, padding, frameArrays, cellImage ){

  		var totalRows = maxGridRows + padding;
  		
  		var renderFrames = [];
  		
  		for( var i = 0; i < maxGridRows; i++)
  			renderFrames.push(RenderGridImage(frameArrays[i], totalRows, centerCellCount, diameter, cellImage));	

  		return renderFrames;
  	}


  	return { 
  		GetCellImage: GetCellImage,
  		GetRenderFrames : GetRenderFrames
  	};

  })();

    var Controller = (function () {

        function GetRandomInt (min, max) {
            return ~~(Math.random() * (max - min + 1)) + min;
        }
  	//Appends individual canvases to the "parallax" div, 
  	//then returns a collection of objects contianing references to the canvases as well as animation data 
  	function GenerateCanvases(parentDivId, layers, items_per_layer, fps, maxCells, maxGridRows, padding, centerCellCount, diameter){
  
  		var gridDataArray = [];			
  		var radius = diameter/2;
  		var maxCellsWidth = (maxGridRows + padding)* 2;
  		var canvasWidth = (maxCellsWidth * diameter) + 10;

  		if( centerCellCount === 1 )
  			maxCellsWidth--;

  		var gridArraysIndex = 0;
  		
            for(var zIndex = -1*layers; zIndex < 0 ; zIndex++){

                for(var j = 0; j > -items_per_layer; j--){

  				var canvas = $('<canvas class = \'c\'></canvas>');
  				var context = canvas[0].getContext("2d");	
  				canvas[0].width = canvas[0].height = canvasWidth;
  				context.fillStyle = Data.Config.CanvasFillStyle;

  				var gridData = new Data.GridData(zIndex, canvas, fps); 

  				canvas.css({transform: 'translateZ( '+ zIndex/4 +'px)'});
  				$("#"+parentDivId).append( canvas );

  				gridDataArray.push( gridData );

  				gridArraysIndex++;
                }
            }
  		return gridDataArray;
  	}

  	return {
  		GetRandomInt: GetRandomInt,
  		GenerateCanvases: GenerateCanvases
  	};

    })();

  //console.log(Controller)

  return {
  	Data:Data,
  	Renderer:Renderer,
  	Controller:Controller
  };	

})();



