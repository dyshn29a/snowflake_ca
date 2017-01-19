var Game = (function(){

	var Data = (function(){

		return {
			CellSpace: 1,
			CellSide: 8,
			CellLiveColor: "cornflowerblue",
			CellDeadColor: "black",	
			CellSpaceColor: "#353535",
			FramesPerSecond: 15
		};

	})();

	var Generator = (function(){

        function GetRandomInt (min, max) {
            return ~~(Math.random() * (max - min + 1)) + min;
        }

		function GetThing(height, width){
			var thing = 
			[
				[0,0,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,0],
				[0,1,1,1,0,0,0,0],
				[1,0,0,1,0,0,0,0],
				[1,1,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,1,0,0,0,0],
				[1,0,1,0,0,0,0,0],
				[1,0,1,0,0,0,0,0],
				[1,1,0,1,0,0,0,0],
				[0,0,1,1,0,0,0,0]
			];

			var board = GetEmptyBoard(height, width);
			
			for(var i = 0; i < 13; i++){
				for(var j = 0; j < 8; j++){
					board[i][j] = thing[i][j];
				}
			}

			return board;
		}

		function GetGliderGun(height, width){

			var glider = 
			[
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
				[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			];

			var board = GetEmptyBoard(height, width);
			
			for(var i = 0; i < 11; i++){
				for(var j = 0; j < 41; j++)
					board[i][j] = glider[i][j];
			}

			return board;
			
		}

		function GetRandomBoard( height, width ){
			var board = [];

			for(var i = 0; i < height; i++){
				var row = [];

				for(var j = 0; j < width; j++)
					row.push(GetRandomInt(0,1));					

				board.push(row);
			}
			return board;
		}

		function GetEmptyBoard( height, width ){
			var board = [];

			for(var i = 0; i < height; i++){
				var row = [];

				for(var j = 0; j < width; j++)
					row.push(0);					

				board.push(row);
			}
			return board;
		}

		function ClearBoard(grid, height, width){
			for(var i = 0; i < height; i++){
				for(var j = 0; j < width; j++){
					grid[i][j] = 0;
				}
			}
		}

		var coords = [ 
			[-1, -1], [-1,  0], [-1,  1], 
			[ 0, -1], /*[y, x]*/[ 0,  1], 
			[ 1, -1], [ 1,  0], [ 1,  1] 
		];

		function ProcessCell(grid, gridLength, gridHeight, cellX, cellY){
			var count = 0;
			var x; var y;
			for (var  i = 0; i < 8; i++) {

				y = (coords[i][0] + cellY);
				x = (coords[i][1] + cellX);

				if( !(grid[y] === undefined || grid[y][x] === undefined) ){
					count += grid[y][x];	
				}

			}

			var alive = (grid[cellY][cellX] === 1);

			var newValue = 0;

			if(alive){
				if(count === 2 || count === 3)
					newValue = 1;
			}else{
				if(count === 3)	
					newValue = 1;
			}

			return newValue;
		}

		function ProcessGrid(gridA, gridB, gridLength, gridHeight){
			for(var  y = 0; y < gridHeight; y++){
				for(var  x = 0; x < gridLength; x++){
					gridB[y][x] = ProcessCell(gridA, gridLength, gridHeight, x, y);
				}
			}
		}

		return {
			GetThing: GetThing,
			GetGliderGun: GetGliderGun, 
			ClearBoard: ClearBoard,
			ProcessGrid: ProcessGrid,
			GetEmptyBoard: GetEmptyBoard,
			GetRandomBoard: GetRandomBoard
		};

	})();


	var Renderer = (function(){

		function ProcessCanvas(grid, canvas, heightCells, widthCells, cellSpace, cellSide){
			var context = canvas[0].getContext("2d");
			//context.fillRect(0,0,);
			var x; var y;
			for(var i = 0; i < heightCells; i++ ){

				y = ( (i+1) * cellSpace ) + (i * cellSide);

				for(var j = 0; j < widthCells; j++ ){

					x = ( (j+1) * cellSpace ) + (j * cellSide);	
					if( grid[i][j] === 1 ){
						context.fillStyle = Data.CellLiveColor;
					}else{
						context.fillStyle = Data.CellDeadColor;
					}
									
					context.fillRect(x, y, cellSide, cellSide);
				}
				
			}
		}

		return {
			ProcessCanvas: ProcessCanvas
		};

	})();

	var Panel = (function(){

		function Create(goClick, stopClick, resetClick, clearClick){
			var controlPanel = $('<div class="panel" ></div>');
			var center = $('<div class="center" ></div>');
			var goButton = $('<input type="button" class="go" value="Go"/>');
			var stopButton = $('<input type="button" class="stop" value="Stop"/>');
			var resetButton = $('<input type="button" class="reset" value="Reset"/>');
			var clearButton = $('<input type="button" class="clear" value="Clear"/>');

			goButton.on("click", goClick);
			stopButton.on("click", stopClick);
			resetButton.on("click", resetClick);
			clearButton.on("click", clearClick);

			center.append(goButton);
			center.append(stopButton);	
			center.append(resetButton);	
			center.append(clearButton);			
			controlPanel.append(center);

			return controlPanel;
		}

		return {
			Create: Create
		};
	})();


	var Run = (function(){


		var cellSpace = Data.CellSpace;
		var cellSide = Data.CellSide;



		var mouseCellArea = cellSpace + cellSide;
	
		function RunCanvas(canvasId, containerId, gridFunction, height, width){

			var grid = gridFunction(height, width);
			//console.log(grid);

			var widthCells = width;
			var heightCells = height;
			var canvasWidth = (widthCells * cellSide) + ( (widthCells + 1) * cellSpace ); 
			var canvasHeight = (heightCells * cellSide) + ( (heightCells + 1) * cellSpace ); 

			var canvas = $("#"+canvasId);
			canvas.prop({ width:canvasWidth, height:canvasHeight })
			var context = canvas[0].getContext("2d");
			context.fillStyle = Data.CellSpaceColor;
			context.fillRect(0,0, canvas.width(), canvas.height());

			var proceed = false;

			var gridB = Generator.GetEmptyBoard(heightCells, widthCells);
			Renderer.ProcessCanvas(grid, canvas, heightCells, widthCells, cellSpace, cellSide);
	
			var go = function(){
				if(!proceed){
					proceed = true;
					var h = 0;
					var fps = Data.FramesPerSecond;

					var animateLoop = function () {
						setTimeout(function() {
							if(proceed){ 
								Generator.ProcessGrid(grid, gridB, widthCells, heightCells);
								Renderer.ProcessCanvas(gridB, canvas, heightCells, widthCells, cellSpace, cellSide);
								temp = grid;
								grid = gridB;
								gridB = temp;
								requestAnimationFrame(animateLoop);
								h++;					
							}
						}, 1000 / fps);
					}
					animateLoop();
				}
			}		

			var stop = function(){
				proceed = false;
			}

			var reset = function(){
				proceed = false;
				grid = gridFunction(height, width);
				gridB = Generator.GetEmptyBoard(heightCells, widthCells);
				Renderer.ProcessCanvas(grid, canvas, heightCells, widthCells, cellSpace, cellSide);
			}

			var clear = function(){
				proceed = false;
				Generator.ClearBoard(grid, heightCells, widthCells);
				Renderer.ProcessCanvas(grid, canvas, heightCells, widthCells, cellSpace, cellSide);
			}

			var canvasMouseDown = function(e){
				if((!proceed)){
					var mouseX = e.pageX - this.offsetLeft;
					var mouseY = e.pageY - this.offsetTop;
					var yIndex = ~~((e.pageY - this.offsetTop)/mouseCellArea); 
					var xIndex = ~~((e.pageX - this.offsetLeft)/mouseCellArea);
					var value; 
					if( !(grid[yIndex] === undefined || grid[yIndex][xIndex] === undefined) ){
						value = grid[yIndex][xIndex];
						grid[yIndex][xIndex] = 1 - value;  
						Renderer.ProcessCanvas(grid, canvas, heightCells, widthCells, cellSpace, cellSide);
						previousYIndex = yIndex;
						previousXIndex = xIndex;
					}
				}
			}

			$("#"+containerId).append(Panel.Create( go, stop, reset, clear ));		
			canvas.on( "mousedown", canvasMouseDown);
	
		}

		RunCanvas("canvas1", "outer1", Generator.GetRandomBoard, 30, 60);
		RunCanvas("canvas2", "outer2", Generator.GetGliderGun, 25, 40);
		RunCanvas("canvas3", "outer3", Generator.GetThing, 25, 40);

	})();

})();
