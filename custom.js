/**
a 8-digit problom
Author : ChenFeng
Date   : Oct 22 2013
**/
var size = 3;
var randit = 100;
var targetboard = 123456780;
var tararr = [8,0,1,2,3,4,5,6,7];
var open = [];
var close = [];
var route = [];
var moves = [];
var counter = 1;
var limit = 50000;
var snode = {}
snode.nid = 1;
snode.parent = 0;
snode.board = 123456780;
snode.deep = 0;
snode.direc = 0;
snode.f = 0;
snode.g = 0;
snode.h = 0;

var openhash = [];
var closehash = [];
var tt = 0;
var tih;
var evalfunc = 0;
// Convert Array to Number
function encode_board(board)
{
	var str = '';
	for(i in board)
		str += board[i];
	var number = parseInt(str);
	return number;
}

// Convert Number to Array
function decode_board(number)
{
	var board = [];
	str = number.toString();
	if(str.length != 9)
		board.push(0);
	for(i in str)
	{
		board.push(str[i]-'0');
	}
	return board;
}

function solve(evaltype)
{
	evalfunc = evaltype;
	tt = 0;
	open = [];
	close = [];
	openhash = [];
	closehash = [];
	counter = 1;
	if(has_solution())
	{
		alert("No solution!");
		return -1;
	}	
	
	// Add first node
	open.push(snode);
	openhash[snode.board] = 1;
	var deep;
	deep = 0;
	while(counter<limit)
	{
		// is open empty?
		if (open.length==0)
		{
			failure();
			return -1;
		}
		else
		{
			//Get the fist node of open
			var node = open.shift();
			openhash[node.board] = 0;
			//Put it in close
			close.unshift(node);
			closehash[node.board] = 1;
			if (node.board == targetboard)
			{
				success();
				return 0;
			}

			deep = node.deep;
			// Generate moves
			expand_board(node);
			// Sort open list by f
			open_sort();
		}
	}
	// Too mush steps
	failure();
	//console.log("Timeout Steps:",counter,"can_resolve",has_solution());
}

// Expand Board
function expand_board(node)
{
	var nid = node.nid;
	var board = decode_board(node.board);
	var deep = node.deep;
	var direc = node.direc;
	var nf = node.f;
	var ng = node.g;
	var nh = node.h;

	// 4 directions
	var i = 0;
	for(i=0;i<4;i++)
	{
	//运行缓慢
		var boardtmp = board.concat();
		var diren = 0;
		var posx = node.zx;
		var posy = node.zy;
		switch(i)
		{
			case 0:
			//Up
			if (posy != 0 && direc != 3)
			{
				var t=boardtmp[posy*size+posx];
				boardtmp[posy*size+posx] = boardtmp[(posy-1)*size+posx];
				boardtmp[(posy-1)*size+posx] = t;
				diren = 1;
				posy -= 1;
			}
			break;
			case 1:
			//Right
			if (posx != size-1 && direc != 4)
			{
				var t=boardtmp[posy*size+posx];
				boardtmp[posy*size+posx] = boardtmp[posy*size+posx+1];
				boardtmp[posy*size+posx+1] = t;
				diren = 2;
				posx += 1;
			}
			break;
			case 2:
			//Down
			if (posy != size-1 && direc != 1)
			{
				var t=boardtmp[posy*size+posx];
				boardtmp[posy*size+posx] = boardtmp[(posy+1)*size+posx];
				boardtmp[(posy+1)*size+posx] = t;
				diren = 3;
				posy += 1;
			}
			break;
			case 3:
			//Left
			if (posx != 0 && direc != 2)
			{
				var t=boardtmp[posy*size+posx];
				boardtmp[posy*size+posx] = boardtmp[posy*size+posx-1];
				boardtmp[posy*size+posx-1] = t;
				diren = 4;
				posx -= 1;
			}
		}
		if (diren)
		{
			// New node
			var nodet = {};
			nodet.board = encode_board(boardtmp);

			counter += 1;
			nodet.nid = counter;
			nodet.parent = nid;
			nodet.deep = deep + 1;
			nodet.direc = diren;
			nodet.g = nodet.deep;
			if(evalfunc==1)
				nodet.h = eval1(boardtmp);
			else if(evalfunc==2)
				nodet.h = eval2(boardtmp);
			else
				console.log("bad evalfunc!");
			nodet.f = nodet.g + nodet.h;
			nodet.zx = posx;
			nodet.zy = posy;
			
			// Exist in close
			if (tc = in_close(nodet))
			{
				//console.log("in_close",tc);
				// f of new node less than exist node
				if(nodet.f<close[tc].f)
				{
					close.splice(tc,1);
					closehash[nodet.board] = 0;
					open.unshift(nodet);
					openhash[nodet.board] = 1;
				}
			}
			// Exist in open
			else if(tx = in_open(nodet))
			{
				//console.log("in_open",tx);
				// f of new node less than exist node
				if(nodet.f<open[tx].f)
				{
					open.splice(tx,1);
					open.unshift(nodet);
				}
			}
			// Add to open
			else
			{
				open.unshift(nodet);
				openhash[nodet.board] = 1;
			}
		}
	}
}

// Evalue function(s)
// function1 
// number of different blocks
function eval1(board)
{
	var dist = 0;
	var rb = decode_board(targetboard);
	for(i=0;i<size*size;i++)
		if(board[i] != rb[i])
			dist += 1;
	return dist;
}

// function2
// sum of Manhattan distance
function eval2(board)
{
	var dist = 0;
	var rb = decode_board(targetboard);
	for(i=1;i<size*size;i++)
	{
		for(j=0;j<size*size;j++)
		{
			if(board[j]==i)
				break;
		}
		//console.log(" ",i,j);
		dist += man_dis(j,tararr[i]);
		//console.log(j,tararr[i],man_dis(j,tararr[i]));
	}
	return dist;
}

// Caculate Manhattan distance
function man_dis(a,b)
{
	var y1 = a / size | 0;
	var x1 = a % size;
	var y2 = b / size | 0;
	var x2 = b % size;
	return Math.abs(x1-x2) + Math.abs(y1-y2);
}

// Sort open list by f value
function open_sort()
{
	//运行缓慢
	open.sort(function(a,b){return a.f-b.f;});
}

// Randomize board
function randomize_board()
{
	board = decode_board(snode.board);
	for(i=0;i<randit;i++)
	{
		t1 = Math.floor(Math.random()*size*size);
		t2 = Math.floor(Math.random()*size*size);
		t = board[t1];
		board[t1] = board[t2];
		board[t2] = t;
	}
	snode.board = encode_board(board);
	var pos;
	for(i=0;i<size*size;i++)
	{
		if (board[i]==0)
		{
			pos = i;
			break;
		}
	}
	snode.zx = pos % size;
	snode.zy = pos / size | 0;
}
// 耗时很多
// Find node in close list
function in_close(node)
{
	if(closehash[node.board])
	{
		for(i in close)
			if(close[i].board == node.board)
				return i;
	}
	return false;
}

// Find node in open list
function in_open(node)
{
	if(openhash[node.board])
	{
		for(i in open)
			if(open[i].board == node.board)
				return i;
	}
	return false;
}


function failure()
{
	alert("falure! \nMax step "+counter+"exceed!");
}

function success()
{
	route = [];
	moves = [];
	pp = close[0].nid;
	de = close[0].deep;
	while(pp!=1)
	{
		for(i in close)
		{
			if(close[i].nid==pp)
				break;
		}
		route.unshift(close[i]);
		pp = close[i].parent;
	}
	route.unshift(snode);
	var str = '';
	for(j in route)
	{
		var barr = decode_board(route[j].board);
		str += '<div class="leftb" >'
			for(ji=0;ji<size;ji++)
			{
				for(jj=0;jj<size;jj++)
				{
					str += '<span class="bnum" >'+(barr[ji*size+jj]!=0?barr[ji*size+jj]:'&nbsp;')+'</span>';
				}
				str += '<br />';
			}
		str += '</div>';
		if(route[j].direc)
		{
			moves.push([barr[route[j-1].zy*size+route[j-1].zx],route[j].direc]);
			//console.log(route[j-1].zy*size+route[j-1].zx,route[j].direc);
		}
	}
	document.getElementById('disp-route').innerHTML=str;
	document.getElementById('node-open').innerHTML=close.length;
	document.getElementById('least-step').innerHTML=close[0].deep;
	
	alert("Success!\nGenerate"+ counter+"nodes\nDeep:"+de);
	move_board();
}

// Judge whether the initial node has solution
function has_solution()
{
	var gsum = 0;
	var board = decode_board(snode.board);
	for(i=0;i<size*size;i++)
	{
		if(board[i]==0)
			continue;
		for(j=0;j<i;j++)
		{
			if(board[j]>board[i])
				gsum += 1;
		}
	}
	return gsum%2;
}

function paint_board(board)
{
	for(i=0;i<size*size;i++)
	{
		if(board[i]!=0)
		{
			//console.log(i,board[i],(i/size|0),(i%size));
			document.getElementById("b-"+board[i]).style.top = 200*(i/size|0)+"px";
			document.getElementById("b-"+board[i]).style.left = 200*(i%size)+"px";
		}
	}
}

function move_board()
{
	paint_board(decode_board(snode.board));
	tih = setInterval(move_block,1);
}

function move_block()
{
	//console.log(tt);
	if(tt>=moves.length*150)
	{
		clearInterval(tih);
		return;
	}

	st = tt/150|0;
	i = tt%150;
	num = moves[st][0];
	dire = moves[st][1];
	if (i<=100)
	{
		switch(dire)
		{
			//Down
			case 1:
				var t = parseInt(document.getElementById("b-"+num).style.top);
				document.getElementById("b-"+num).style.top = t+2+"px";
				break;
			//Left
			case 2:
				var t = parseInt(document.getElementById("b-"+num).style.left);
				document.getElementById("b-"+num).style.left = t-2+"px";
				break;
			//Up
			case 3:
				var t = parseInt(document.getElementById("b-"+num).style.top);
				document.getElementById("b-"+num).style.top = t-2+"px";
				break;
			//Right
			case 4:
				var t = parseInt(document.getElementById("b-"+num).style.left);
				document.getElementById("b-"+num).style.left = t+2+"px";
				break;
		}
	}
	tt += 1;
	if(tt>moves.length*150)
		clearInterval(tih);
}

function random_onclick()
{
	randomize_board();
	paint_board(decode_board(snode.board));
}