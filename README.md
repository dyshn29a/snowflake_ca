# Introduction

This project generates random snowflakes with the HTML5 canvas and Web Worker APIs. It was prompted by this thread on the Mathematica StackExchange about generating random snowflakes: https://mathematica.stackexchange.com/questions/39361/how-to-generate-a-random-snowflake

Some of the responses in the thread approach the problem using cellular automata. I decided to take that approach as well. If you're familiar with Conway's Game of Life, all I've done here is make it work on a hexagonal grid, seeding the grid with a random 6-sided pattern, with randomized rules.

>### Conway's Game of Life, explained briefly:
>
>Take a grid of cells and play a game with rules and rounds.
>
>- Cells are either *alive* (filled) or *dead* (empty).
>- Rules: Count a cell's neighbors. *Kill*, *resurrect*, or *ignore* cells based on this count.
>- Rounds: The next round is the grid after all the rules have been applied. Repeat.		

# Implementation

Again, what we're doing here is applying the ideas in Conway's Game of Life to a hexagonal grid of cells. We have to seed a random, six-sided pattern onto the grid, and then start running the game. The code that takes care of this random pattern generation can be found in the [generate.js](multi/scripts/generate.js) file.

The rules governing life and death on a hexagonal grid now look like this:

```javascript
if(alive){
	if(count === r1 || count === r2)
		newValue = live;
	else
		newValue = die;
}else{
	if(count === r3 )
		newValue = live;				
}
```

The first two rules are randomly selected from a range of numbers. Both numbers are inclusive.

```javascript
var r1Min = 2;
var r1Max = 3;

var r2Min = 0;
var r2Max = 5;

[...]

var c1 = RandomPool.GetR1();
var c2 = RandomPool.GetR2();
var c3 = 2; 
```				

After some trial-and-error, I went with whatever ranges yielded the best-looking patterns.

Since a cell in a hexagonal grid can have 6 neighbors, I had to observe 6x6x6 combinations before settling on the above ranges for the three rules. Values outside these ranges are more likely to create patterns that flash rapidly or patterns that don't grow.
