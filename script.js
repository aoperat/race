import {User} from './user.js';

document.addEventListener('DOMContentLoaded', async () => {
    let startGameButton = document.getElementById('start-game');
    let gameContainer = document.getElementById('game-container');
    let userList = document.getElementById('user-list');
    let participantList = document.getElementById('participant-list');
    let numberOfLosers = parseInt(document.getElementById('loser-count').value);
    let applySettingsButton = document.getElementById('apply-settings');

    let finishedParticipants = [];
    
    let users = await User.fetchUsers();

    let participants = [];

    applySettingsButton.addEventListener('click', () => {

        resetGame();

        participants.forEach(user => {
            createRunner(user);
        });

        let speedBoostCount = parseInt(document.getElementById('speed-boost-count').value);
        let whirlwindCount = parseInt(document.getElementById('whirlwind-count').value);
        let switchPlacesCount = parseInt(document.getElementById('switch-places-count').value);

        createPowerUps('speed-boost', speedBoostCount);
        createPowerUps('whirlwind', whirlwindCount);
        createPowerUps('switch-places', switchPlacesCount);

        numberOfLosers = parseInt(document.getElementById('loser-count').value);
    });

    displayQueue();
    let speedBoostCount = parseInt(document.getElementById('speed-boost-count').value);
    let whirlwindCount = parseInt(document.getElementById('whirlwind-count').value);
    let switchPlacesCount = parseInt(document.getElementById('switch-places-count').value);

    createPowerUps('speed-boost', speedBoostCount);
    createPowerUps('whirlwind', whirlwindCount);
    createPowerUps('switch-places', switchPlacesCount);

    animatePowerUps();


    function startCountdown() {
        let countdownElement = document.getElementById('countdown');
        let countdownValue = 3;
      
        let countdownInterval = setInterval(() => {
          countdownElement.textContent = countdownValue;
      
          if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';


            participants.forEach((user, index) => {
            
                let gameContainer = document.querySelector('#game-container');
                let runners = Array.from(gameContainer.querySelectorAll('.runner'));
                runners.forEach((runner, index) => {
                    runner.classList.remove('runner-shuffle-animation'); // Apply the shuffling animation
                  });
                
                moveRunner(user, index);
            });

          } else {
            shuffleRunners();
          }
      
          countdownValue--;
        }, 1000);
      }
      
      function shuffleRunners() {
        let gameContainer = document.querySelector('#game-container');
        let runners = Array.from(gameContainer.querySelectorAll('.runner'));
      
        let availableBottomValues = [];
        for (let i = 0; i < runners.length; i++) {
          availableBottomValues.push(i * 60);
        }
      
        // Shuffle availableBottomValues
        for (let i = availableBottomValues.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableBottomValues[i], availableBottomValues[j]] = [availableBottomValues[j], availableBottomValues[i]];
        }
      
        runners.forEach((runner, index) => {
          runner.classList.add('runner-shuffle-animation'); // Apply the shuffling animation
          runner.style.bottom = `${availableBottomValues[index]}px`;
        });
      }
      
      
      
      
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      
      
    function checkGameEndCondition() {
        let numberOfParticipants = participants.length;
        let numberOfWinnersNeeded = numberOfParticipants - numberOfLosers;
    
        if (finishedParticipants.length >= numberOfWinnersNeeded) {
            displayResults();
        }
    }
    
    startGameButton.addEventListener('click', () => {

        startCountdown();
        
    });

    function displayQueue() {
        userList.innerHTML = '<h2>대기열</h2>';
        users.forEach(user => {
            let userElement = document.createElement('div');
            userElement.classList.add('user');
            userElement.innerHTML = `
          <img src="${user.picture}" alt="${user.name}">
          <span>${user.name} - ${user.title}</span>
        `;
            userElement.addEventListener('click', () => {
                addUserToParticipants(user);
                userElement.remove();
            });
            userList.appendChild(userElement);
        });
    }

    function animatePowerUps() {
        setInterval(() => {
            let powerUps = document.querySelectorAll('.power-up');
    
            powerUps.forEach(powerUp => {
                if (powerUp.style.display === 'none') return;
    
                if (!powerUp.classList.contains('fadeIn')) {
                    powerUp.classList.add('fadeIn');
                }
    
                let randomSpeed = Math.floor(Math.random() * 30) + 1;
                let currentTop = parseInt(powerUp.style.top);
                let newTop = currentTop + (Math.random() < 0.5 ? -randomSpeed : randomSpeed);
    
                // Calculate the maximum top position based on the game container's dimensions
                let maxTop = gameContainer.clientHeight - powerUp.clientHeight;
    
                // Adjust newTop if it goes beyond the boundaries
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop > maxTop) {
                    newTop = maxTop;
                }
    
                powerUp.style.transition = 'top 0.5s ease-out';
                powerUp.style.top = `${newTop}px`;
    
                // Remove the power-up if it reaches the top boundary
                if (newTop <= 0) {
                    powerUp.classList.add('fadeOut');
                    setTimeout(() => {
                        powerUp.remove();
                    }, 500);
                }
            });
        }, 1000);
    }
    
    

    function addUserToParticipants(user) {

        let maxRunners = Math.floor(gameContainer.clientHeight / 60);
        if (participants.length >= maxRunners) {
            alert('Maximum number of runners reached.');
            return;
        }
        
        if (participants.includes(user)) return;
        participants.push(user);
        createRunner(user);
        let participantElement = document.createElement('div');
        participantElement.classList.add('participant');
        participantElement.innerHTML = `
        <img src="${user.picture}" alt="${user.name}">
        <span>${user.name} - ${user.title}</span>
      `;
        participantElement.addEventListener('click', () => {
            removeUserFromParticipants(user);
            participantElement.remove();
        });
        participantList.appendChild(participantElement);
    }

    function removeUserFromParticipants(user) {
        participants = participants.filter(p => p !== user);
        removeRunner(user);
        displayQueue();
    }

    function createRunner(user) {
        let runner = document.createElement('div');
        runner.classList.add('runner');
        runner.dataset.username = user.name;
        runner.style.left = '0';
        runner.style.bottom = `${participants.indexOf(user) * 60}px`;
    
        // Create a wrapper div for both images
        let imageWrapper = document.createElement('div');
        imageWrapper.style.position = 'relative';
        imageWrapper.style.width = '100%';
        imageWrapper.style.height = '100%';
    
        let runnerImage = document.createElement('img');
        runnerImage.src = user.picture;
        runnerImage.alt = user.name;
        runnerImage.style.width = '60%';
        runnerImage.style.height = '60%';
        runnerImage.style.borderRadius = '50%';
        runnerImage.style.position = 'absolute';
        runnerImage.style.left = '12%';
        runnerImage.style.top = '24%';
        runnerImage.style.zIndex = '1';
    
        let snailImage = document.createElement('img');
        snailImage.src = '/images/snail.gif';
        snailImage.alt = 'Snail';
        snailImage.style.width = '100%';
        snailImage.style.height = '100%';
        snailImage.style.position = 'absolute';
        snailImage.style.zIndex = '0';
    
        imageWrapper.appendChild(runnerImage);
        imageWrapper.appendChild(snailImage);
        runner.appendChild(imageWrapper);
        gameContainer.appendChild(runner);
    }
    

    function applyPowerUp(powerUpType, runner) {
        if (powerUpType === 'speed-boost') {
            applyAnimation(runner, 'speed-boost-Ef');
        } else if (powerUpType === 'whirlwind') {
            applyAnimation(runner, 'whirlwind-Ef');
        } else if (powerUpType === 'switch-places') {
            applyAnimation(runner, 'switch-places-Ef');
        }
    }
    
    function applyAnimation(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 1000);
    }
    
    function moveRunner(user) {
        let runner = gameContainer.querySelector(`.runner[data-username="${user.name}"]`);
        if (!runner) return;
    
        let currentPosition = user.currentPosition;
        let targetPosition = gameContainer.clientWidth - runner.clientWidth;
    
        let intervalId = setInterval(() => {
            let randomSpeed = Math.floor(Math.random() * 10 * user.speed) + 1;
    
            currentPosition += randomSpeed;
            user.updatePosition(currentPosition);
            runner.style.left = `${currentPosition}px`;
    
            let powerUpType = checkPowerUpCollision(runner);
            if (powerUpType) {
                if (powerUpType === 'speed-boost') {
                    currentPosition += 50;
                    user.updatePosition(currentPosition);
                } else if (powerUpType === 'whirlwind') {
                    currentPosition -= 100;
                    user.updatePosition(currentPosition);
                    runner.style.left = `${currentPosition}px`;
                } else if (powerUpType === 'switch-places') {
                    let activeRunners = participants.filter(p => !finishedParticipants.includes(p));
                    let otherRunner = activeRunners[Math.floor(Math.random() * activeRunners.length)];
    
                    if (otherRunner !== user) {
                        let otherRunnerElement = gameContainer.querySelector(`.runner[data-username="${otherRunner.name}"]`);
                        let tempPosition = currentPosition;
                        currentPosition = otherRunner.currentPosition;
                        user.updatePosition(currentPosition);
                        otherRunner.updatePosition(tempPosition);
                        otherRunnerElement.style.left = `${tempPosition}px`;
                    }
                }
                applyPowerUp(powerUpType, runner);
            }
    
            if (currentPosition >= targetPosition) {
                clearInterval(intervalId);
                finishedParticipants.push(user);
                console.log(`User ${user.name} has finished!`);
                checkGameEndCondition(); 
            }
    
        }, 100);
    }
    

    function displayResults() {
        let winners = finishedParticipants;
        let losers = participants.filter(p => !finishedParticipants.includes(p));
    
        let winnersNames = winners.map(user => user.name).join(', ');
        let losersNames = losers.map(user => user.name).join(', ');
    
        alert(`Game Over!\nWinners: ${winnersNames}\nLosers: ${losersNames}`);
        resetGame();
    }

    function checkPowerUpCollision(runner) {
        let powerUps = document.querySelectorAll('.power-up');

        for (let powerUp of powerUps) {
            let runnerRect = runner.getBoundingClientRect();
            let powerUpRect = powerUp.getBoundingClientRect();

            if (
                runnerRect.left < powerUpRect.right &&
                runnerRect.right > powerUpRect.left &&
                runnerRect.top < powerUpRect.bottom &&
                runnerRect.bottom > powerUpRect.top
            ) {
                powerUp.style.display = 'none';
                return powerUp.classList.contains('speed-boost')
                    ? 'speed-boost'
                    : powerUp.classList.contains('whirlwind')
                        ? 'whirlwind'
                        : 'switch-places';
            }
        }
        return null;
    }

    function createPowerUps(type, count) {
        for (let i = 0; i < count; i++) {
            let powerUp = document.createElement('div');
            powerUp.className = `power-up ${type}`;
    
            let icon = document.createElement('i');
    
            // Set the appropriate icon class for each power-up type
            if (type === 'speed-boost') {
                icon.className = 'fas fa-bolt'; // Lightning icon
            } else if (type === 'whirlwind') {
                icon.className = 'fas fa-wind'; // Wind icon
            } else {
                icon.className = 'fas fa-exchange-alt'; // Switch icon
            }
    
            powerUp.appendChild(icon);
    
            // Calculate a more uniformly random top position based on the game container's dimensions
            let maxTop = gameContainer.clientHeight * 0.9;
            let randomTop = Math.floor(Math.random() * maxTop);
    
            powerUp.style.top = `${randomTop}px`;
            powerUp.style.left = `${10 + Math.random() * 80}%`;
            gameContainer.appendChild(powerUp);
        }
    }
    

    

    function resetGame() {
        
        let existingPowerUps = document.querySelectorAll('.power-up');
        existingPowerUps.forEach(powerUp => {
            powerUp.remove();
        });
        
        let existingRunners = document.querySelectorAll('.runner');
        existingRunners.forEach(runner => {
            runner.remove();
        });
        
        finishedParticipants = [];
        animatePowerUps();

    }
      
});


