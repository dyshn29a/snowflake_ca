var RunSingle = (function () {

	var AppendTo = function(parentDivId, centerCellCount){

		var layers = 1;
		var itemsPerLayer = 1;
		var fps = SnowflakeCA.Data.Config.FramesPerSecond;
		var totalRows = SnowflakeCA.Data.Config.TotalCellRows;

		//Padding represents the sparser outer area of the snowflake grid where there are less live cells.
		//This is where the branches or arms of the snowflake usually appear.
		var armToBodyRatio = SnowflakeCA.Data.Config.CellArmToBodyRatio;
		var padding =  Math.floor(totalRows * armToBodyRatio);
		var maxGridRows = totalRows - padding;
		var diameter = SnowflakeCA.Data.Config.CellDiameter;
		var cellImage = SnowflakeCA.Renderer.GetCellImage(diameter);

		var canvasData;

		function StartGeneratorThread(){

			var worker = new Worker("multi/scripts/generate.js");

			worker.addEventListener('message', OnGeneratorEnd, false);

			worker.postMessage( { 
				TotalRows:totalRows, 
				MaxGridRows: maxGridRows,
				CenterCellCount: centerCellCount,
				Diameter:diameter,
				Padding:padding 
			} );

			canvasData = SnowflakeCA.Controller.GenerateCanvases(parentDivId, layers, itemsPerLayer, fps, totalRows, maxGridRows, padding, centerCellCount, diameter); 

		}

		//This callback runs once the Generator in the worker thread finishes.
		function OnGeneratorEnd(e){

			$("#load").css({ display : "none" });
		
			var allGridArrays = e.data;

			var canvasCount = canvasData.length;

			var currentFrameArray;

			for( var i = 0; i < canvasCount; i++ ){
				currentFrameArray = SnowflakeCA.Renderer.GetRenderFrames( maxGridRows, centerCellCount, diameter, padding, allGridArrays[i], cellImage );
				canvasData[i].SetFrames(currentFrameArray); 
			}
			for( var i = 0; i < canvasCount; i++ )
				canvasData[i].Animate(); 

		}

		StartGeneratorThread();

	}

	return { AppendTo: AppendTo };
})();

Run = (function(){
	RunSingle.AppendTo("outer4", 1);
	RunSingle.AppendTo("outer5", 3);
})();








