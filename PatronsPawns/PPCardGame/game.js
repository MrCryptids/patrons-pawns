const cardToEmoji = {
    'Ace of Spades': '🂡', '2 of Spades': '🂢', '3 of Spades': '🂣', '4 of Spades': '🂤',
    '5 of Spades': '🂥', '6 of Spades': '🂦', '7 of Spades': '🂧', '8 of Spades': '🂨',
    '9 of Spades': '🂩', '10 of Spades': '🂪', 'Jack of Spades': '🂫', 'Queen of Spades': '🂭',
    'King of Spades': '🂮', 'Ace of Hearts': '🂱', '2 of Hearts': '🂲', '3 of Hearts': '🂳',
    '4 of Hearts': '🂴', '5 of Hearts': '🂵', '6 of Hearts': '🂶', '7 of Hearts': '🂷',
    '8 of Hearts': '🂸', '9 of Hearts': '🂹', '10 of Hearts': '🂺', 'Jack of Hearts': '🂻',
    'Queen of Hearts': '🂽', 'King of Hearts': '🂾', 'Ace of Diamonds': '🃁', '2 of Diamonds': '🃂',
    '3 of Diamonds': '🃃', '4 of Diamonds': '🃄', '5 of Diamonds': '🃅', '6 of Diamonds': '🃆',
    '7 of Diamonds': '🃇', '8 of Diamonds': '🃈', '9 of Diamonds': '🃉', '10 of Diamonds': '🃊',
    'Jack of Diamonds': '🃋', 'Queen of Diamonds': '🃍', 'King of Diamonds': '🃎',
    'Ace of Clubs': '🃑', '2 of Clubs': '🃒', '3 of Clubs': '🃓', '4 of Clubs': '🃔',
    '5 of Clubs': '🃕', '6 of Clubs': '🃖', '7 of Clubs': '🃗', '8 of Clubs': '🃘',
    '9 of Clubs': '🃙', '10 of Clubs': '🃚', 'Jack of Clubs': '🃛', 'Queen of Clubs': '🃝',
    'King of Clubs': '🃞'
};

let selectedCardIndexes = [];
let selectedCardIndex = null;
let selectedAction = null;
let selectedPatronIndex = null;
let targetPlayerId = null;
let deck; // Initialized in initializeGame function
let discardPile = [];
let currentPlayerId = 'player1'; // Start with player1's turn


function enforceHandLimit(playerId) {
    const player = players[playerId];
    while (player.hand.length > 4) {
        // This assumes you have a discard function implemented, change this to match your discard logic
        discardCard(player.hand.shift()); // Discard the first card in hand if over the limit
    }
}

function endTurn() {
    console.log("Ending turn for", currentPlayerId);
    clearSelection();
    enforceHandLimit(currentPlayerId); // Check and enforce the hand limit at the end of the turn
    updateAllDisplays(); // Ensure this function is correctly defined
    players[currentPlayerId].resetTurnState();

    // Switch to the next player
    currentPlayerId = currentPlayerId === 'player1' ? 'player2' : 'player1';
    players[currentPlayerId].resetTurnState();
    startTurn(currentPlayerId);
    console.log("Starting turn for", currentPlayerId);
}

function startTurn(playerId) {
    players[playerId].hasDrawnCard = false; // Reset the drawn card state for the new turn
    document.getElementById('statusMessage').textContent = `It is ${playerId}'s turn`;
    updateInteractionsForTurn(playerId);
    // The player can now draw 2 new cards
}

function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

class Player {
    constructor(id) {
        this.id = id;
        this.hand = [];
        this.patrons = [];
        this.selectedPawnsValue = 0;
        this.pawns = []
        this.hasDrawnCard = false; // New property to track if a card was drawn this turn
    }

    // Call this method at the beginning of the player's turn
    resetTurnState() {
        this.hasDrawnCard = false;
    }
}


function dealCards(numCards) {
    for (let i = 0; i < numCards; i++) {
        for (let playerId in players) {
            players[playerId].hand.push(deck.pop());
        }
    }
}

function onCardClick(cardIndex, playerId) {
    const player = players[playerId];
    const card = player.hand[cardIndex];
    const cardElement = document.getElementById(`${playerId}Hand`).children[cardIndex];
    
    // Calculate the card's value (consider Ace as 1 for this operation)
    const cardValue = isNaN(card.value) ? (card.value === 'Ace' ? 1 : 0) : parseInt(card.value);
    
    if (selectedCardIndexes.includes(cardIndex)) {
        // Deselect the card
        const index = selectedCardIndexes.indexOf(cardIndex);
        selectedCardIndexes.splice(index, 1);
        player.selectedPawnsValue -= cardValue; // Subtract its value
        cardElement.classList.remove('selected');
    } else {
        // Select the card
        selectedCardIndexes.push(cardIndex);
        player.selectedPawnsValue += cardValue; // Add its value
        cardElement.classList.add('selected');
    }

    if (playerId === currentPlayerId) {
        updateSelectedPawnsDisplay(playerId);
    }
}


function updateSelectedPawnsDisplay(playerId) {
    const player = players[playerId];
    const pawnsValueDisplay = document.getElementById(`${playerId}PawnsValue`);
    document.getElementById('player1PawnsValue').style.display = 'block';
    document.getElementById('player2PawnsValue').style.display = 'block';
    pawnsValueDisplay.textContent = `Pawn Purchasing Power: ${player.selectedPawnsValue}`;
    // You'll need to create this element in your HTML or dynamically create it in your JS
}



function displayPlayerHand(playerId) {
    const player = players[playerId];
    const handElementId = `${playerId}Hand`;
    const handElement = document.getElementById(handElementId);
    handElement.innerHTML = ''; // Clear existing cards
    player.hand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.textContent = cardToEmoji[`${card.value} of ${card.suit}`];
        cardElement.classList.add('card');
        // Ensure card click is correctly handled based on currentPlayerId
        if (playerId === currentPlayerId) {
            cardElement.onclick = () => onCardClick(index, playerId);
        } else {
            cardElement.onclick = null;
            cardElement.classList.add('disabled'); // Optionally add a 'disabled' class for styling
        }
        handElement.appendChild(cardElement);
    });
}

function initializeGame() {
    deck = createDeck(); // Create and shuffle the deck at game start
    dealCards(3); // Deal 3 cards to each player
    Object.keys(players).forEach(playerId => displayPlayerHand(playerId));
    document.getElementById('player1Patrons').style.display = 'block'; // Or 'flex', 'grid', etc., depending on your layout
    document.getElementById('player2Patrons').style.display = 'block';
    document.getElementById('deck').style.display = 'inline-block';
    document.getElementById('handLabel1').style.display = 'inline-block';
    document.getElementById('handLabel2').style.display = 'inline-block';
    document.getElementById('actionButtons').style.display = 'inline-block';
    //document.getElementById('gameRules').style.display = 'inline-block';
    document.getElementById('endTurnButton').style.display = 'inline-block';
    document.getElementById('statusMessage').style.display = 'block';
    document.getElementById('startGameButton').style.display = 'none';
    startTurn(currentPlayerId);
}

let players = {
    player1: new Player('player1'),
    player2: new Player('player2')
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startGameButton').onclick = initializeGame;
});

// Additional game logic for actions like playing a card, purchasing patrons, etc.






function drawCard(playerId) {
    const player = players[playerId];

    // Check if it's the current player's turn
    if (playerId !== currentPlayerId) {
        console.log("It's not this player's turn.");
        return;
    }

    // Check if the player has already drawn two cards this turn
    if (player.hasDrawnCard) {
        alert('You have already drawn 2 cards this turn.');
        return;
    }

    // Check if the deck has cards left
    if (deck.length === 0) {
        alert('No more cards in the deck.');
        return;
    }

    // Draw two cards from the deck if possible
    let cardsDrawn = 0;
    while(cardsDrawn < 2 && deck.length > 0) {
        const card = deck.pop();
        player.hand.push(card);
        cardsDrawn++;
    }
    player.hasDrawnCard = true; // Set the flag to indicate cards have been drawn

    // Update the display of the player's hand
    displayPlayerHand(playerId);

    console.log(`Player ${playerId} drew ${cardsDrawn} card(s).`);
}






/*function playCard(cardIndex) {
    const card = players[playerId].hand.splice(cardIndex, 1)[0]; // Remove the card from the hand
    // Assuming you have a function or logic to handle the played card
    // For example, adding it to a play area or applying its effects
    displayPlayerHand(players[playerId].hand, 'player1Hand'); // Update the display
}*/

function playCard(actionType) {
    if (selectedCardIndex === null) {
        alert("Please select a card first.");
        return;
    }

    const card = players[playerId].hand[selectedCardIndex];

    switch (actionType) {
        case 'playPatron':
            if (['King', 'Queen', 'Jack'].includes(card.value)) {
                // This assumes you have an array to store the player's patrons
                currentPlayer.patrons.push(players[playerId].hand.splice(selectedCardIndex, 1)[0]);
                updatePatronsDisplay('player1', currentPlayer.patrons);
            } else {
                alert("This card cannot be played as a patron.");
            }
            break;
        // Implement cases for 'purchasePatron' and 'eliminatePatron'
    }
    displayPlayerHand(players[playerId].hand, 'player1Hand');
    selectedCardIndex = null; // Reset selected card
}


// This function attempts to purchase the selected Patron
// This function will be called when the "Purchase Patron" button is clicked.
function attemptPurchasePatron() {
    const currentPlayer = players[currentPlayerId];
    if (currentPlayer.selectedPawnsValue < 11) {
        alert("Not enough Pawn value to purchase a Patron.");
        return;
    }

    const targetPatronIndex = getSelectedPatronIndex(); // Retrieve the selected patron index from UI
    if (targetPatronIndex === null) {
        alert("No Patron selected.");
        return;
    }

    const targetPatron = players[targetPlayerId].patrons[targetPatronIndex];
    if (!targetPatron) {
        alert("Invalid Patron selected.");
        return;
    }

    // Add the patron to the current player's patrons
    currentPlayer.patrons.push(targetPatron);
    // Remove the patron from the other player
    players[targetPlayerId].patrons.splice(targetPatronIndex, 1);
    
    // Add the selected pawns to the selling player's pawn pile and remove from current player's hand
    selectedCardIndexes.forEach(index => {
        const pawn = currentPlayer.hand[index];
        players[targetPlayerId].pawns.push(pawn); // Assuming this is where you store points
        currentPlayer.hand.splice(index, 1);
    });

    // Reset the selection and pawn value
    selectedCardIndexes = [];
    currentPlayer.selectedPawnsValue = 0;
    
    // Update the UI
    clearSelection();
    updateAllDisplays();
}



function clearSelection() {
    selectedCardIndexes = [];
    selectedCardIndex = null;
    selectedAction = null;
    selectedPatronIndex = null;
    targetPlayerId = null;
    players[currentPlayerId].selectedPawnsValue = 0;
    document.querySelectorAll('.selected').forEach(card => card.classList.remove('selected'));
    updateSelectedPawnsDisplay(currentPlayerId);
}
    

// Example snippet for transferring a patron (simplified)
function transferPatron(fromPlayerId, toPlayerId, patronIndex) {
    const patron = players[fromPlayerId].patrons.splice(patronIndex, 1)[0];
    players[toPlayerId].patrons.push(patron);
    // Remember to update the display for both players



    // Calculate the total value of selected Pawns (numbered cards) and Aces (valued as 1)
    let totalValue = selectedCardIndexes.reduce((total, index) => {
        const card = players[playerId].hand[index];
        if (card.value === 'Ace') {
            return total + 1;
        } else if (!isNaN(parseInt(card.value))) {
            return total + parseInt(card.value);
        } else {
            // For Kings, Queens, and Jacks, which cannot be used for purchasing
            return total;
        }
    }, 0);

    // Check if total value meets or exceeds the required value to purchase a Patron
    if (totalValue >= 11) {
        // Proceed with purchasing logic
        console.log("Proceeding with purchase. Total value:", totalValue);
        // Add logic to select and purchase a Patron from another player
    } else {
        alert("Selected cards' total value is less than 11. Please select more or different cards.");
    }
}

    // Example cleanup after attempting action
    // Deselect all cards and clear selectedCardIndexes
document.querySelectorAll('.player-hand .card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    selectedCardIndexes = [];

function resetSelectedPawns(playerId) {
        const player = players[playerId];
        player.selectedPawnsValue = 0;
        selectedCardIndexes = [];
        // Make sure to also update the UI accordingly
        updateSelectedPawnsDisplay(playerId);
    }
    

function playPatron(playerId) {
        if (selectedCardIndexes.length === 0) {
            alert("Please select at least one card to play as a Patron.");
            return;
        }
    
        // Temporarily store cards to be moved to the Patron area
        let cardsToMove = [];
    
        // Iterate through selected cards and move valid Patron cards
        selectedCardIndexes.forEach(index => {
            const card = players[playerId].hand[index];
            if (['King', 'Queen', 'Jack'].includes(card.value)) {
                cardsToMove.push(...players[playerId].hand.splice(index, 1));
            }
        });
    
        if (cardsToMove.length === 0) {
            alert("Selected cards cannot be played as Patrons. Please select Kings, Queens, or Jacks.");
            return;
        }
    
        // Add valid Patron cards to the player's Patron area
        players[playerId].patrons.push(...cardsToMove);
    
        // Reset selections
        selectedCardIndexes = [];
    
        // Update UI
        displayPlayerHand(playerId);
        updatePatronsDisplay(playerId);
    }
    
    // Attach event listener to the "Play Patron" button
    document.getElementById('playPatronButton').addEventListener('click', function() {
        playPatron(currentPlayerId); // Ensure currentPlayerId is correctly defined and updated
    });
   
    function discardCard(card) {
        discardPile.push(card); // Add the card to the discard pile
        console.log(`Discarded card: ${card.value} of ${card.suit}`);
    }

function selectAceAndPatronForElimination(aceIndex, targetPlayerId, targetPatronIndex) {
        // Ensure a valid Ace is selected
        const selectedAce = players[currentPlayerId].hand[aceIndex];
        if (selectedAce.value !== 'Ace') {
            alert("You must select an Ace to eliminate a Patron.");
            return;
        }
    
        // Store selections for action execution
        selectedCardIndex = aceIndex;
        selectedPatronIndex = targetPatronIndex;
        this.targetPlayerId = targetPlayerId;
    
        // Indicate that the elimination action is selected
        selectedAction = 'eliminatePatron';
    }
    
    function attemptEliminatePatron() {
        if (selectedCardIndex == null || !targetPlayerId || selectedPatronIndex == null) {
            alert("Please select an Ace and a target Patron for elimination.");
            return;
        }
    
        const selectedAce = players[currentPlayerId].hand[selectedCardIndex];
        if (selectedAce.value !== 'Ace') {
            alert("A non-Ace card was selected for elimination. Please select an Ace.");
            return;
        }
    
        const targetPatron = players[targetPlayerId].patrons[selectedPatronIndex];
        if (!targetPatron) {
            alert("Invalid patron selection.");
            return;
        }
    
        // Check for suit match
        if (selectedAce.suit === targetPatron.suit) {
            // Remove the Ace used for elimination
            players[currentPlayerId].hand.splice(selectedCardIndex, 1);
            discardPile.push(selectedAce);
    
            // Remove the target patron
            players[targetPlayerId].patrons.splice(selectedPatronIndex, 1);
    
            console.log(`Patron eliminated by ${currentPlayerId} using ${selectedAce.value} of ${selectedAce.suit}`);
    
            // Reset selections and update UI accordingly
            clearSelection();
            updateAllDisplays();
        } else {
            alert("The suit of the Ace does not match the suit of the target Patron.");
        }
    }
    
    

function selectPatronForAction(playerId, patronIndex) {
    // Ensure an action and a card have been selected
    if (!selectedAction || selectedCardIndex === null) {
        alert("Please select a card and an action first.");
        return;
    }

    // Highlight the selected patron
    // Similar logic to onCardClick, may need to adjust based on your setup
    // ...

    // Store the selection
    selectedPatronIndex = patronIndex;
    targetPlayerId = playerId;

    console.log(`Selected patron ${patronIndex} from player ${playerId} for ${selectedAction}`);
}


function updatePatronsDisplay(playerId) {
    const patronArea = document.getElementById(`${playerId}Patrons`);
    patronArea.innerHTML = ''; // Clear current display

    players[playerId].patrons.forEach(patron => {
        const patronElement = document.createElement('div');
        patronElement.textContent = cardToEmoji[`${patron.value} of ${patron.suit}`];
        patronElement.classList.add('patron', 'selectable-patron'); // Add classes for styling and selection
        patronArea.appendChild(patronElement);
    });

    // After updating the display, set up the click listeners
    setupPatronClickListeners(playerId);
}


function updateAllDisplays() {
    Object.keys(players).forEach(playerId => {
        displayPlayerHand(playerId); // Corrected from earlier versions that may have had a wrong function call
        updatePatronsDisplay(playerId);
        updateSelectedPawnsDisplay(currentPlayerId);
    });
}

function updateInteractionsForTurn(playerId) {
    // First, disable all card interactions to reset the state
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null; // Remove the click listener from all cards
    });

    // Now, enable interactions only for the current player's cards
    document.querySelectorAll(`#${playerId}Hand .card`).forEach(card => {
        card.classList.remove('disabled');
        card.onclick = function() {
            // Replace this with the actual function that handles card selection
            onCardClick(getCardIndex(card), playerId);
        };
    });
}

// Helper function to find the index of the card within the player's hand
function getCardIndex(cardElement) {
    return Array.from(cardElement.parentNode.children).indexOf(cardElement);
}


// Call this function whenever the turn changes
function changeTurn() {
    // ... rest of the change turn logic ...
    updateInteractionsForTurn(currentPlayerId);
}

// Helper function to get the index of the selected patron from the UI
function getSelectedPatronIndex() {
    // Assuming each player has a patron area with an id like 'player1Patrons', 'player2Patrons', etc.
    // And a selected patron will have a class 'selected-patron'.
    const patronArea = document.getElementById(`${targetPlayerId}Patrons`);
    const selectedPatrons = patronArea.getElementsByClassName('selected-patron');

    if (selectedPatrons.length === 0) {
        // If no patron is selected, return null or an indication that no selection has been made
        return null;
    } else {
        // If there is a selected patron, find its index within the patron area
        const selectedPatron = selectedPatrons[0]; // Assuming only one can be selected at a time
        const patrons = Array.from(patronArea.children); // Get all patron elements as an array
        const selectedPatronIndex = patrons.indexOf(selectedPatron); // Find the index of the selected patron
        return selectedPatronIndex; // Return the index
    }
}


function onPatronClick(patronElement, playerId, patronIndex) {
    // Toggle the 'selected-patron' class on click
    const isSelected = patronElement.classList.contains('selected-patron');
    const patronArea = document.getElementById(`${playerId}Patrons`);

    // First, remove selection from all patrons
    patronArea.querySelectorAll('.patron').forEach(el => el.classList.remove('selected-patron'));

    // Then, if the patron was not already selected, add the class back
    if (!isSelected) {
        patronElement.classList.add('selected-patron');
    }

    // Set the selectedPatronIndex and targetPlayerId for use in purchasing logic
    selectedPatronIndex = isSelected ? null : patronIndex;
    targetPlayerId = isSelected ? null : playerId;
}


// This function should be called whenever the patron display is updated
function setupPatronInteractions() {
    // Assuming each patron element has a class 'patron'
    document.querySelectorAll('.patron').forEach(patron => {
        patron.addEventListener('click', function() {
            // Remove the 'selected-patron' class from all patrons
            document.querySelectorAll('.patron').forEach(p => p.classList.remove('selected-patron'));
            // Add the 'selected-patron' class to the clicked patron
            patron.classList.add('selected-patron');
        });
    });
}


// Set up the event listeners for each Patron card when the game starts or when the display is updated
function setupPatronClickListeners(playerId) {
    const patronArea = document.getElementById(`${playerId}Patrons`);
    const patrons = patronArea.getElementsByClassName('selectable-patron');

    Array.from(patrons).forEach((patron, index) => {
        patron.onclick = () => onPatronClick(patron, playerId, index);
    });
}

document.getElementById('hiderules').addEventListener('click', function() {
    if ((document.getElementById('gameRules').style.display = 'none') === true) {
        document.getElementById('gameRules').style.display = 'inline-block';
    }
    else {
        document.getElementById('gameRules').style.display = 'none'
    }
});

document.getElementById('showrules').addEventListener('click', function() {
    if ((document.getElementById('gameRules').style.display = 'inline-block') === true) {
        document.getElementById('gameRules').style.display = 'none';
    }
    else {
        document.getElementById('gameRules').style.display = 'inline-block'
    }
});

document.getElementById('deck').addEventListener('click', function() {
    drawCard(currentPlayerId);
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('purchasePatronButton').addEventListener('click', () => {
        const targetPatronIndex = getSelectedPatronIndex(); // You need to implement this function
        if(targetPatronIndex === null || targetPlayerId === null) {
            alert("No target Patron or player selected.");
            return;
        }
        attemptPurchasePatron(targetPatronIndex, targetPlayerId);
    });
});


document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('purchasePatron').addEventListener('click', function() {
        selectedAction = 'purchasePatron';
        // Optionally, provide visual feedback for the selected action
    });
});

document.getElementById('endTurnButton').addEventListener('click', endTurn);

// This could be part of your startTurn function
document.getElementById('statusMessage').textContent = `Player ${playerId}'s turn`;




document.getElementById('eliminatePatron').addEventListener('click', function() {
    selectedAction = 'eliminatePatron';
    // Optionally, provide visual feedback for the selected action
});


document.getElementById('playPatron').addEventListener('click', () => playPatron('player1')); // Adjust as necessary for player ID


document.getElementById('confirmPurchase').addEventListener('click', attemptPurchasePatron);
// Add event listeners for other actions similarly

