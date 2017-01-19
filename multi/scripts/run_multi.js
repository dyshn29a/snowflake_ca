var RunMulti = (function () {

  "use strict";

  var layers = 5;
  var itemsPerLayer = 5;
  var fps = SnowflakeCA.Data.Config.FramesPerSecond;
  var totalRows = SnowflakeCA.Data.Config.TotalCellRows;

  //Padding represents the sparser outer area of the snowflake grid where there are less live cells.
  //This is where the branches or arms of the snowflake usually appear.
  var armToBodyRatio = SnowflakeCA.Data.Config.CellArmToBodyRatio;
  var padding =  Math.floor(totalRows * armToBodyRatio);
  var maxGridRows = totalRows - padding;

  //centerCellCount should be only one or three, because there must be either 
  //one cell or the center point of three cells at the center of a hexagonal grid.					
  var centerCellCount = (SnowflakeCA.Controller.GetRandomInt(0,2) === 1 ? 1 : 3 ); 
  var diameter = SnowflakeCA.Data.Config.CellDiameter;
  var canvasData;
  
  var cellImage = SnowflakeCA.Renderer.GetCellImage(diameter);

  //Web workers allow all the abstract processing to be done in another thread.
  function StartGeneratorThread(){

  	var worker = new Worker("scripts/generate.js");

  	worker.addEventListener('message', OnGeneratorEnd, false);

  	worker.postMessage( { 
  		TotalRows:totalRows, 
  		MaxGridRows: maxGridRows,
  		CenterCellCount: centerCellCount,
  		Diameter:diameter,
  		Padding:padding 
  	} );

  	canvasData = SnowflakeCA.Controller.GenerateCanvases("parallax", layers, itemsPerLayer, fps, totalRows, maxGridRows, padding, centerCellCount, diameter); 
  	$("html").width(window.screen.width);

  }

  //This callback runs once the Generator in the worker thread finishes.
  function OnGeneratorEnd(e){

  	$("#load").css({ display : "none" });
  	
  	var allGridArrays = e.data;

  	var canvasCount = canvasData.length;

  	var currentFrameArray;

  	//Slow.
  	//There's no easy way to render a canvas in a worker thread, since it doesn't have access to the DOM. Sad!
  	for( var i = 0; i < canvasCount; i++ ){
  		currentFrameArray = SnowflakeCA.Renderer.GetRenderFrames( maxGridRows, centerCellCount, diameter, padding, allGridArrays[i], cellImage );
  		canvasData[i].SetFrames(currentFrameArray); 
  	}

  	$("body").css("background-color", SnowflakeCA.Data.Config.PageBackgroundColor);
  	$("html").hide().show(0);

  	for( var i = 0; i < canvasCount; i++ )
  		canvasData[i].Animate(); 

  	setTimeout( 
      function(){ window.scrollTo(0,document.body.scrollHeight); }, 10 );
  }

  StartGeneratorThread();
  

})();

