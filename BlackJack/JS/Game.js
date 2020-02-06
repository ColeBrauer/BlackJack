var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var deck;
var player;
var dealer;
var cash=100;
var bet;

function createDeck()
{
    deck = new Array();
    for (var i = 0 ; i < values.length; i++)
    {
        for(var x = 0; x < suits.length; x++)
        {
            var card = { Value: values[i], Suit: suits[x]};
            deck.push(card);
        }
    }
}

function shuffle()
{
	//Fischer-yates suffle
	for(var i=deck.length-1;i>=0;i--){
		var swap=Math.floor(Math.random() * (i+1));
		var tmp = deck[i];

		deck[i] = deck[swap];
		deck[swap] = tmp;
	}
}

function startblackjack()
{	
	GameInProgress();
	createDeck();
	shuffle();
	initPlayers();
	
	createPlayerUI();
	createDealerUI();
	dealHands();
	getPlayerPoints();
}

function GameInProgress(){
	document.getElementById('btnStart').disabled=true;
	document.getElementById('bet').disabled=true;
	document.getElementById('btnHit').disabled=false;
	document.getElementById('btnStay').disabled=false;
	document.getElementById("status").style.display="none";
	bet=parseInt(document.getElementById('bet').value);
}

function initPlayers()
{
    var playerhand = new Array();
	var dealerhand = new Array();
    player = { Hand: playerhand, Points: 0};
    dealer = {Hand: dealerhand, Points: 0};
}

function createPlayerUI()
{
	document.getElementById('player').innerHTML = '';
	var div_player =document.getElementById('player');
    var div_playerid = document.createElement('div');
    var div_hand = document.createElement('div');
    var div_points = document.createElement('div');

    div_points.className = 'points';
    div_points.id = 'points_player';
    div_hand.id = 'hand_player';

    div_playerid.innerHTML = 'Your Hand';
    
	div_player.appendChild(div_hand);
    div_player.appendChild(div_points);
	div_player.appendChild(div_playerid);
}
function createDealerUI()
{
	document.getElementById('dealer').innerHTML = '';
	var div_dealer =document.getElementById('dealer');
    var div_dealerid = document.createElement('div');
    var div_hand = document.createElement('div');
    var div_points = document.createElement('div');

    div_points.className = 'points';
    div_points.id = 'points_dealer';

    div_hand.id = 'hand_dealer';

    div_dealerid.innerHTML = 'Dealer\'s Hand';
	
    div_dealer.appendChild(div_dealerid);
    div_dealer.appendChild(div_points);
	div_dealer.appendChild(div_hand);
    
}

function dealHands()
{
	var playerhand = document.getElementById('hand_player');
	var dealerhand = document.getElementById('hand_dealer');
	
	var card = deck.pop();
	player.Hand.push(card);
	playerhand.appendChild(getCardUI(card));
	
	card = deck.pop();
	dealer.Hand.push(card);
	dealerhand.appendChild(getCardUI(card));
	
	card = deck.pop();
	player.Hand.push(card);
	playerhand.appendChild(getCardUI(card));
	
	card = deck.pop();
	dealer.Hand.push(card);
	var el = getCardUI(card);
	el.className = 'card_hidden';
	el.id='card_hidden';
	dealerhand.appendChild(el);
	
	getPlayerPoints();		
	updateDeck();
}

function dealCard(person)
{
	var card = deck.pop();
	if(person=='dealer'){
	dealer.Hand.push(card);
	renderCard(card, person);
	getDealerPoints();
	}else{
		player.Hand.push(card);
		renderCard(card, person);
		getPlayerPoints();
	}
	updateDeck();
	try{
	checkBlackJack();
	}catch(err){
		gameComplete();
	}
	
}

function renderCard(card, player)
{
	var hand = document.getElementById('hand_'+player);
	hand.appendChild(getCardUI(card));
}

function getCardUI(card)
{
	var el = document.createElement('div');
	var icon = '';
	if (card.Suit == 'Hearts'){
		icon='&hearts;';
	}
	else if (card.Suit == 'Spades'){
		icon = '&spades;';
	}
	else if (card.Suit == 'Diamonds'){
		icon = '&diams;';
	}
	else{
		icon = '&clubs;';
	}
	el.className = 'card';
	el.innerHTML = card.Value + ' ' + icon;
	return el;
}

// returns the number of points that a player has in hand
function getPlayerPoints()
{
	var points = 0;
	var curr=0;
	var ace=false;
	for(var i = 0; i < player.Hand.length; i++)
	{
		curr=cardValue(player.Hand[i].Value);
		points += curr;
		if(curr==11){
			if(ace){points-=10;}
			ace=true;}
		if(points>21&&ace){
			points-=10;
			ace=false
		}
	}
	player.Points = points;
	document.getElementById('points_player').innerHTML = player.Points;
	return points;
}

function getDealerPoints(){
	var points = 0;
	var curr=0;
	var ace=false;
	for(var i = 0; i < dealer.Hand.length; i++)
	{
		curr=cardValue(dealer.Hand[i].Value);
		points += curr;
		if(curr==11){
			if(ace){points-=10;}
			ace=true;}
		if(points>21&&ace){
			points-=10;
			ace=false
		}
	}
	dealer.Points=points;
	document.getElementById('points_dealer').innerHTML = dealer.Points;
	return points;
}

function cardValue(value){
	var weight = parseInt(value);
    if (value == "J" || value == "Q" || value == "K"){
		weight = 10;
	}
    if (value == "A"){
        weight = 11;
	}
	return weight;
}


function updatePoints()
{
	getPoints();
	document.getElementById('points_dealer').innerHTML = dealer.Points;
}

function hitMe()
{
	// pop a card from the deck to the current player
	// checkBlackJack if current player new points are over 21
	dealCard('player');
}

function stay()
{
	// dealer goes
	getPlayerPoints();
	getDealerPoints();
	document.getElementById('card_hidden').className='card';
	try{
	while(dealer.Points<player.Points){
		var card = deck.pop();
		dealer.Hand.push(card);
		renderCard(card, 'dealer');
		getDealerPoints();
		updateDeck();
		checkBlackJack();	
	}
	check();
	}catch(err){
		gameComplete();
	}
}

function checkBlackJack()
{
	if (player.Points > 21)
	{
		loss();
	}else if (dealer.Points > 21)
	{
		win();
	}
}

function check(){
	if (player.Points > 21)
	{
		loss();
	}else if (dealer.Points > 21)
	{
		win();
	}else if (player.Points > dealer.Points)
	{
		win();
	}else{	
		loss();
	}
}


function win()
{
	cash+=bet;
	document.getElementById('cashamt').innerHTML =cash;
	document.getElementById('status').innerHTML = 'You Win! Nice hand... ';
	document.getElementById("status").style.display = "inline-block";
	document.getElementById('bet').disabled=false;
	throw "Win";
}

function loss()
{
	cash-=bet;
	document.getElementById('btnHit').disabled=true;
	document.getElementById('btnStay').disabled=true;
	document.getElementById('cashamt').innerHTML =cash;
	document.getElementById('status').innerHTML = 'Unlucky, mate. Try again';
	document.getElementById("status").style.display = "inline-block";
	document.getElementById('bet').disabled=false;
	throw "Loss";
}

function gameComplete(){
	document.getElementById('btnStart').disabled=false;
	document.getElementById('bet').disabled=false;
	document.getElementById('btnHit').disabled=true;
	document.getElementById('btnStay').disabled=true;
}

function updateDeck()
{
	document.getElementById('deckcount').innerHTML = deck.length;
}

window.addEventListener('load', function(){
	createDeck();
	shuffle();

});