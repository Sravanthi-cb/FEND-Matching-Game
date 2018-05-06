class GameObject {
    constructor() {
        this.allCards = ['fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-bicycle', 'fa-leaf', 'fa-diamond', 'fa-bomb', 'fa-anchor', 'fa-bolt', 'fa-paper-plane-o', 'fa-cube', 'fa-bicycle', 'fa-leaf', 'fa-diamond', 'fa-bomb', 'fa-anchor'];
        this.openCards = [];
        this.shuffle(this.allCards);
        this.moves = 0;
    }
// randomly shuffle the input array in place
    shuffle(array) {
        let currentIndex = array.length,
            temporaryValue, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    gameDone() {
        return this.allCards.length === this.openCards.length;
    }    
    appendToOpenCards(item) {
        this.openCards.push(item);
        if (this.numOpenCardsEven()) {
            this.moves += 1;
        }
    }
    popFromOpenCards() {
        this.openCards.pop();
        this.moves += 1;
    }
    getMoves() {
        return this.moves;
    }
    numOpenCardsEven() {
        return this.openCards.length % 2 === 0;
    }
    lastOpenCard() {
        let lastOpenCard = this.openCards[this.openCards.length - 1];
        return lastOpenCard;
    }
}

class MatchingGame {
    constructor() {
        this.object = new GameObject();
    }
    initializeGrid() {       
        let ul = $('.deck');        
        this.handledTimer = false;
        ul.empty();
        this.object.allCards.forEach(function(item, index) {
            let htmlString = '<li class="card"><i class="fa ' + item + '"></i></li>';
            ul.append(htmlString);

        });
       
        $('.card').click({ matchingGame: this }, function(event) { // obscure syntax for passing in user data in JQuery
            event.data.matchingGame.clickHandler(event);
        });

        $('.restart').click({ matchingGame: this }, function(event) { // obscure syntax for passing in user data in JQuery
            event.data.matchingGame.reset(event);
        });

        $('#playAgain').click({ matchingGame: this }, function(event) { // obscure syntax for passing in user data in JQuery
            event.data.matchingGame.reset(event);
        });

        this.updateStars();
    }

// Update star method is used to based on number of moves the star will be highlighted
    updateStars() {
        let moves = this.object.getMoves();
        $('.moves').text(moves);
        if (moves < 10) {
            // three stars            
            $('.stars').children().css('color', '#ffa500');
            
        } else if (moves < 15) {
            // two stars
            $('.stars').children().eq(2).css('color', '#000');
        } else {
            // one star
            $('.stars').children().eq(1).css('color', '#000');
        }
    }

    showCard(target) {
        target.addClass('show');
        var showStyle = {
            'transform': 'rotateY(0)',
            'background': '#02b3e4',
            'cursor': 'default',
            'font-size': '33px',
            'animation-name': '', // jQuery does not handle background animation; reset animation
            'animation-duration': '0s'

        };

        target.css(showStyle);
    }
    hideCard(target) {
        target.removeClass('show');
        let hideStyle = {
            'transform': 'rotateY(0)',
            'background': '#2e3d49',
            'cursor': 'pointer',
            'font-size': '0px',
            'animation-name': 'coloranimate', // jQuery does not handle background animation
            'animation-duration': '3s'

        };
        
        // flag to indicate animating status that can be used to prevent click during animation
        this.animating = true;
        let matchingGame = this; // trick to use this in the animate call back function
                                 // directly using 'this' does not work
        
        target.animate({ 'font-size': '0px' }, 1000, function(){matchingGame.animating = false;});
        target.css(hideStyle);
    }
    clickHandler(event) {        

        // no-op if the target is not a LI tag
        if (event.target.nodeName !== 'LI'){
            return;
        }

        // no-op during animation
        if(this.animating){
            return;
        }

        let target = $(event.target);

        // no-op for already shown cards
        if(target.hasClass('show')){
            return;
        }

        if (!this.handledTimer){
            this.handledTimer = true;
            this.handleTimer();
        }
        
        this.showCard(target);          
        let newCard = target.find('i').attr('class').split(' ')[1]; // find whats clicked

        if (this.object.numOpenCardsEven()) {
            this.object.appendToOpenCards(newCard);
        } 
        else {
            let lastOpenCard = this.object.lastOpenCard();
            if (lastOpenCard === newCard) {
                this.object.appendToOpenCards(newCard);                
            } 
            else {
                let lastTarget = $('.' + lastOpenCard).parent('.show');                
                this.hideCard(target);
                this.hideCard(lastTarget);
                this.object.popFromOpenCards();
            }
            this.updateStars();
        }
        if (this.object.gameDone()) {
            this.handleGameDone();
        }
    }
    reset(event) {
        this.object = new GameObject();  
        this.resetTimer();
        this.initializeGrid();
        
    }
    handleGameDone(){
        this.confettiAnime();
        $('.modal').modal('show');
        $('.won').text('You Won!! ').append('<i class="em-svg em-trophy"></i>');
        $('.winMoves').text('You took ' + this.object.getMoves() + ' moves.').append('<i class="em-svg em-clap"></i>'); 
        let timerText = $('.timer').text();
        $('.winTime').text('You took ' + timerText + ' time.').append('<i class="em-svg em-alarm_clock"></i>');   
        $('.winstars').html($('.stars').html());
        this.resetTimer();    
    }
    
    confettiAnime() {
        let end = Date.now() + (5 * 1000);
        let interval = setInterval(function() {
        if (Date.now() > end) {
            return clearInterval(interval);
        }
        confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
            x: Math.random(),
            y: Math.random() - 0.2
        }
        });
        }, 200);    
    }
    resetTimer(){
        // if there is already a setInterval defined, reset it
        if (this.interval ){
            clearInterval(this.interval); 
        }
        let textContent = '00:00';
        $('.timer').text(textContent);

    }
    handleTimer(){
        // if there is already a setInterval defined, reset it
        if (this.interval ){
            clearInterval(this.interval); 
        }

        let seconds = 0;
        let minutes = 0;
        let timer = 1;
        this.interval = setInterval(function(){

        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        let textContent = minutes + ":" + seconds;
        
        $('.timer').text(textContent);
        timer += 1;

        }, 1000);
    }
}  
$(document).ready(function() {
    let matchingGame = new MatchingGame();
    matchingGame.initializeGrid();

});