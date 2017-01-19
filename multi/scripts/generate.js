
/*
  Beware:

  Nothing graceful here.
  This entire program is just a first draft to prove to myself that this 
  thing works, and there are innumerable improvements that have yet to be made.
  
*/

var SnowflakeCAWorker = (function(){

"use strict";

/*
   Generates most of the random data used to seed each grid.

   Most, as in there's one number in a function that doesn't 
   get precomputed yet. Have to fix in the next version.

*/

  var RandomPool = (function(){

  	var binaryPool; //Contains random values for cells in grid
  	var binaryCount = 0;

  	var r1Pool; //Contains random values for rule 1
  	var r1Count = 0;

  	var r2Pool; //Contains random values for rule 2
  	var r2Count = 0;

  	var r1Min = 2;
  	var r1Max = 3;

  	var r2Min = 0;
  	var r2Max = 5;

  	var binaryNext = 0;
  	var r1Next = 0;
  	var r2Next = 0;	

  	function GetRandomInt (inclusiveMin, inclusiveMax) {
  		return ~~(Math.random() * (inclusiveMax - inclusiveMin + 1)) + inclusiveMin;
  	}

  	function GetBinary(){
  		var result = binaryPool[binaryNext];
  		binaryNext++;
  		return result;
  	}

  	function GetR1(){
  		var result = r1Pool[r1Next];
  		r1Next++;
  		return result;
  	}

  	function GetR2(){
  		var result = r2Pool[r2Next];
  		r2Next++;
  		return result;
  	}

  	function R1Init( canvasCount ){
  		r1Count = 0;
  		r1Pool = [];
  		R1Append(canvasCount);
  	}

  	function R1Append( canvasCount ){
  		for( var i = 0; i < canvasCount; i++ ){
  			r1Pool.push(GetRandomInt(r1Min, r1Max));
  			r1Count++;
  		}
  	}

  	function R2Init( canvasCount ){
  		r2Count = 0;
  		r2Pool = [];
  		R2Append(canvasCount);
  	}

  	function R2Append( canvasCount ){
  		for( var i = 0; i < canvasCount; i++ ){
  			r2Pool.push(GetRandomInt(r2Min, r2Max));
  			r2Count++;
  		}
  	}

  	function BinaryAppend( canvasCount, maxRows ){

  		var maxEntries = canvasCount * ((maxRows*3) + ((maxRows*(maxRows+1))/2));
  		var entriesCount = 0;
  		var stringLength;
  		var binString;

  		while ( entriesCount < maxEntries ) {

  			binString = Math.random().toString(2).substring(2);
  			stringLength = binString.length;

  			for(var j = 0; j < stringLength; j++){
  				binaryPool.push(Number( binString.charAt(j) ));
  				entriesCount++;
  				binaryCount++;
  			}
  		}
  	}

  	function BinaryInit( canvasCount, maxRows ){

  		binaryCount = 0;
  		binaryPool = [];
  		BinaryAppend( canvasCount, maxRows );

  	}

  	function GetBinaryPool(){ return binaryPool; }
  	function GetBinaryCount(){ return binaryCount; }
  	function GetR1Pool(){ return r1Pool; }
  	function GetR1Count(){ return r1Count; }
  	function GetR2Pool(){ return r2Pool; }
  	function GetR2Count(){ return r2Count; }

  	return {
  		BinaryAppend: BinaryAppend,
  		BinaryInit: BinaryInit,
  		R1Init: R1Init,
  		R1Append: R1Append,
  		R2Init: R2Init,
  		R2Append: R2Append,
  		GetBinaryPool: GetBinaryPool,
  		GetBinaryCount: GetBinaryCount,
  		GetBinary: GetBinary,
  		GetR1: GetR1,
  		GetR2: GetR2
  	};

  })();

  //Generates 2d arrays used that represent single animation frames.
  var Generator = (function(){

  	var cellCoords = [
  		[[-1,-1], [-1,0], [ 0,-1], [0,1] , [1,0], [1,1]],
  		[[-1,-1], [-1,0],[ 0,-1], [0,1],[ 1,-1], [1,0]],
  		[[-1,0], [-1,1],[ 0,-1], [0,1],[ 1,-1], [1,0]]
  	];

  	var live = 1;
  	var die = -1;

  	//Use this function to debug any problems that arise in this class.
  	//Each snowflake grid is represented in the abstract as a 2d array.
  	//This function can be used to print out said array.
  	function PrintGrid( grid ){

  		var rowCount = grid.length;
  		var currentRow; var currentRowLength;
  		var message = "";

  		for( var i = 0; i < rowCount; i++ ){

  			currentRow = grid[i];

  			currentRowLength = currentRow.length;

  			for( var j = 0; j < currentRowLength; j++ ){

  				var temp = currentRow[j];							
  				if(temp > -1){
  					message += " ";
  				}
  				message += currentRow[j];
  			}		

  			message += "\n";

  		}
  		console.log(message);

  	}

  	//Cells at the corners of each hexagonal ring in a given grid are represented as the numbers 1 or 2. 
  	//Non-corner / edge cells are represented as 3's.
  	//Dead cells have negative values.
  	function IsCorner( cellSymbol ){
  		return (cellSymbol === 1 || cellSymbol === 2 || cellSymbol === -1 || cellSymbol === -2 );
  	}

  	function OutOfBounds(y, x, grid){
  		return (grid[y] === undefined || grid[y][x] === undefined);//(y === -1 || x === -1 || y >= gridHeight || x >= rowLength );
  	}

  	function GetRules(){

  		var c1 = RandomPool.GetR1();
  		var c2 = RandomPool.GetR2();
  		var c3 = 2; 

  		if(c2 === c1) c2++;

  		return [ c1, c2, c3 ];
  	}

  	//Each cell has to be processed individually to determine if it lives or dies in the next round.
  	function ProcessCell( y, x, grid, maxGridRows, centerCellCount, rowLength, rules ){

  		var newValue = grid[y][x];	
  		var count = CountNeighbors(y, x, grid, maxGridRows, centerCellCount);
  		var r1 = rules[0]; var r2 = rules[1]; var r3 = rules[2];

  		var alive = (newValue >= 0); 
  	
  		if(alive){
  			if(count === r1 || count === r2)
  				newValue = live;
  			else
  				newValue = die;

  		}else{
  			if(count === r3 )
  				newValue = live;				
  		}

  		return newValue;
  	}



  	function CountNeighbors(y, x, grid, maxGridRows, centerCellCount){

  		var count = 0;

  		var midpoint = maxGridRows / 2;

  		if( centerCellCount === 1 )
  			midpoint = Math.floor(midpoint);

  		var coords;

  		if(y < midpoint)
  			coords = cellCoords[0];
  		else if(y === midpoint)
  			coords = cellCoords[1];
  		else if(y > midpoint)
  			coords = cellCoords[2];

  		var xTemp; var yTemp;
  		for(var i = 0; i < coords.length; i++){
  			yTemp = coords[i][0];	
  			xTemp = coords[i][1];	
  
  			if( !OutOfBounds(yTemp+y, xTemp+x, grid ) && grid[yTemp+y][xTemp+x] > -1  )
  					count++;				
  		}

  		return count;
  	}

  	function GetRandomInt (min, max) {
  	    return ~~(Math.random() * (max - min + 1)) + min;
  	}

  	function GetRandomArray(length){

  		var arr = [];
  		var temp;
  		for(var i = 0; i < length; i++){
  			var live = (RandomPool.GetBinary() === 1);
  			temp = -1;
  			if(live) temp = 1;
  	
  			if(i === 0)
  				arr.push(1 * temp);
  			else
  				arr.push(3 * temp);
  		}
  		return arr;
  	}

  	//This is the one function that does not use precomputed random values - will be fixed in a later version.
  	function GetPaddingArray(length){
  		var arr = [];
  		for(var i = 0; i < length; i++)
  			arr.push(-3);

  		arr[GetRandomInt(1,length)] = 3;			
  		arr[0] = (RandomPool.GetBinary() === 1)?1:-1;	
  		return arr;
  	}

  	//Snowflakes are represented in this program as concentric rings of hexagonal cells.
  	//This function represents each ring as its own array of numbers.
  	//Afterwards, the rings still have to be wrapped concentrically, 
  	//with the smallest ring at the center of a 2d array representing cells
  	//in the order they should appear on the canvas.
  	function GenerateGrid(maxGridRows, centerCellCount, padding ){

  		var outer = [];

  		var segmentEnd = centerCellCount;
  		var mid1; var mid2; var nextRowNumber;

  		var start = 1;
  		var end = maxGridRows;

  		end += padding;

  		if(centerCellCount === 1){
  			segmentEnd = 6;
  			outer.push([1]);
  		}else{
  			outer.push([1,1,1]);
  		}

  		for(var rowNumber = start; rowNumber < end; rowNumber++){

  			var inner = [];

  			mid1 = (rowNumber/2>>0);
  			nextRowNumber = rowNumber + 1;
  			mid2 = (nextRowNumber/2>>0);

  			var randArr = GetRandomArray(mid2+1);

  			if(rowNumber > maxGridRows)
  				randArr = GetPaddingArray(mid2+1);
  		

  			for(var h = 0; h < segmentEnd; h++){
          for(var i = 0; i < mid1  + (rowNumber % 2); i++)
  					inner.push(randArr[i]);
          
  				for(var i = mid1; i >= 1; i--)
  					inner.push(randArr[i]);

  				if(centerCellCount === 3){			

  					for(var i = 0; i < mid2  + (nextRowNumber % 2); i++)
  						inner.push(randArr[i]);

  					for(var i = mid2; i >= 1; i--)
  						inner.push(randArr[i]);
  				}
  			}

  			outer.push(inner);

  		}

  		return outer;

  	}

  	//Creates an empty hexagonal 2d array to receive the output from the function before this one.
  	function GetEmptyGridArray( gridRowCount, centerCellCount ){

  		var result;

  		if( centerCellCount === 1 || centerCellCount === 3 ){

  			result = [];

  			var currentLength = gridRowCount;

  			var end = gridRowCount;

  			for( var i = 0; i < end; i++ ){
  				result.push( (new Array(currentLength)).fill(0) );
  				currentLength++;
  			}

  			if ( centerCellCount === 1 ){
  				end--;
  				currentLength -= 2;
  			}

  			for( var i = 0; i < end; i++ ){
  				result.push( (new Array(currentLength)).fill(0) );
  				currentLength--;
  			}
  		}

  		return result;
  	}

  	//Treats each row of an input array as a ring of cells, and wraps the cells
  	//around each other, to represent their layout in the actual rendered frame.
  	function InitGridArray( structureGrid ){

  		var turns = [ [0,1], [1,1], [1,-1], [0,-1], [-1,0], [-1,0] ];			

  		var rowCount = structureGrid.length;
  		var x =  rowCount - 1; 
  		var y =  x;

  		var end = rowCount;

  		var centerCellCount = structureGrid[0].length;

  		var gridArray = GetEmptyGridArray(rowCount, centerCellCount);

  		gridArray[y][x] = 1;

  		if( centerCellCount === 3 ){
  			gridArray[y+1][x+1] = 1;
  			gridArray[y+1][x] = 1;
  		}

  		var currentRowLength = 0;	
  		var currentSymbol;
  		var turnIndex;

  		for( var i = 1; i < end; i++ ){

  			currentRowLength = structureGrid[i].length;
  			x = y = end - i - 1;
  			turnIndex = -1;

  			for( var j = 0; j < currentRowLength; j++ ){

  				currentSymbol = structureGrid[i][j];

  				gridArray[y][x] = currentSymbol;
  
  				if(IsCorner(currentSymbol))
  					turnIndex++;		

  				y += turns[turnIndex][0];					
  				x += turns[turnIndex][1];			
  			}				
  		}

  		return gridArray;

  	}

  	//Takes a hexagonal array, kills or births cells according to rules, and returns a hexagonal array with this next round of cells. 		
  	function ProcessGridArray(inGrid, centerCellCount, rules){

  		var newGrid = [];
  		var currentRow;
  		var outerLength = inGrid.length;
  		var innerLength;

  		for( var i = 0; i < outerLength; i++ ){

  			var newRow = [];
  			currentRow = inGrid[i];
  			innerLength = currentRow.length;

  			for( var j = 0; j < innerLength; j++ )
  				newRow.push(ProcessCell(i, j, inGrid, outerLength, centerCellCount, innerLength, rules));
  						
  			newGrid.push(newRow);
  		}
  		return newGrid;
  	}

  	//Generates all 2d arrays representing animation frames for a single snowflake.
  	function GetGridArrays( maxGridRows, centerCellCount, diameter, padding ){

  		var gridArrays = [];
  		var scaffold = GenerateGrid( maxGridRows, centerCellCount, padding );
  		var gridArray = InitGridArray( scaffold );			
  		var rules = GetRules();

  		for( var i = 0; i < maxGridRows; i++){
  			gridArray = ProcessGridArray(gridArray, centerCellCount, rules);
  			gridArrays.push(gridArray);
  		}

  		return gridArrays;

  	}

  	//Generates all 2d arrays representing animation frames for all snowflakes requested by the main thread.
  	function GetAllGridArrays(itemCount, maxGridRows, centerCellCount, diameter, padding){

  		RandomPool.BinaryInit( itemCount, maxGridRows + padding );
  		RandomPool.R1Init(itemCount);	
  		RandomPool.R2Init(itemCount);	

  		var allGridArrays = [];

  			for(var i = 0; i < itemCount; i++)
  				allGridArrays.push(GetGridArrays(maxGridRows, centerCellCount, diameter, padding));			

  		return allGridArrays;
  	}

  	return {
  		GetAllGridArrays: GetAllGridArrays
  	};

  })();

  return {
  	RandomPool: RandomPool,
  	Generator: Generator
  };

})();

self.onmessage = function(e) {

  var allGridArrays = SnowflakeCAWorker.Generator.GetAllGridArrays(e.data.TotalRows, e.data.MaxGridRows, e.data.CenterCellCount, e.data.Diameter, e.data.Padding);
    self.postMessage(allGridArrays);
  close();
};
