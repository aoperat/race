
document.addEventListener('DOMContentLoaded', async () => {
    const startGameButton = document.getElementById('start-game');
    const gameContainer = document.getElementById('game-container');
    const userList = document.getElementById('user-list');
    const participantList = document.getElementById('participant-list');
    const numberOfLosers = parseInt(document.getElementById('loser-count').value);
    const applySettingsButton = document.getElementById('apply-settings');

    let finishedParticipants = [];
    
    let users = await fetchUsers();
    let participants = [];

    applySettingsButton.addEventListener('click', () => {

        resetGame();

        participants.forEach(user => {
            createRunner(user);
        });


        const speedBoostCount = parseInt(document.getElementById('speed-boost-count').value);
        const whirlwindCount = parseInt(document.getElementById('whirlwind-count').value);
        const switchPlacesCount = parseInt(document.getElementById('switch-places-count').value);

        createPowerUps('speed-boost', speedBoostCount);
        createPowerUps('whirlwind', whirlwindCount);
        createPowerUps('switch-places', switchPlacesCount);

        numberOfLosers = parseInt(document.getElementById('loser-count').value);
    });

    displayQueue();
    const speedBoostCount = parseInt(document.getElementById('speed-boost-count').value);
    const whirlwindCount = parseInt(document.getElementById('whirlwind-count').value);
    const switchPlacesCount = parseInt(document.getElementById('switch-places-count').value);

    createPowerUps('speed-boost', speedBoostCount);
    createPowerUps('whirlwind', whirlwindCount);
    createPowerUps('switch-places', switchPlacesCount);

    animatePowerUps();


    function checkGameEndCondition() {
        const numberOfParticipants = participants.length;
        const numberOfWinnersNeeded = numberOfParticipants - numberOfLosers;
    
        if (finishedParticipants.length >= numberOfWinnersNeeded) {
            displayResults();
        }
    }
    
    startGameButton.addEventListener('click', () => {
        participants.forEach((user, index) => {
            moveRunner(user, index);
        });
    });

    function displayQueue() {
        userList.innerHTML = '<h2>대기열</h2>';
        users.forEach(user => {
            const userElement = document.createElement('div');
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

            const powerUps = document.querySelectorAll('.power-up');
            const directions = Array.from({ length: powerUps.length }, () => Math.random() < 0.5 ? -1 : 1);

            powerUps.forEach((powerUp, index) => {
                if (powerUp.style.display === 'none') return; // Skip hidden power-ups

                const randomSpeed = Math.floor(Math.random() * 3) + 1; // Change 3 to adjust the speed range
                let currentTop = parseInt(powerUp.style.top);
                currentTop += directions[index] * randomSpeed;
                powerUp.style.top = `${currentTop}%`;

                if (currentTop >= 100 || currentTop <= 0) {
                    directions[index] *= -1;
                }
            });
        }, 50);
    }
      


    function addUserToParticipants(user) {

        const maxRunners = Math.floor(gameContainer.clientHeight / 35);
        if (participants.length >= maxRunners) {
            alert('Maximum number of runners reached.');
            return;
        }

        
        if (participants.includes(user)) return;
        participants.push(user);
        createRunner(user);
        const participantElement = document.createElement('div');
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

    async function fetchUsers() {
        try {
            const response = await fetch('users.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    function createRunner(user) {
        const runner = document.createElement('div');
        runner.classList.add('runner');
        runner.dataset.username = user.name;
        runner.style.left = '0';
        runner.style.bottom = `${participants.indexOf(user) * 35}px`;

        const runnerImage = document.createElement('img');
        runnerImage.src = user.picture;
        runnerImage.alt = user.name;
        runnerImage.style.width = '100%';
        runnerImage.style.height = '100%';
        runnerImage.style.borderRadius = '50%';

        runner.appendChild(runnerImage);
        gameContainer.appendChild(runner);
    }


    function moveRunner(user) {
        const runner = gameContainer.querySelector(`.runner[data-username="${user.name}"]`);
        if (!runner) return;

        let currentPosition = parseInt(runner.style.left);
        const targetPosition = gameContainer.clientWidth - runner.clientWidth;

        const intervalId = setInterval(() => {
            const randomSpeed = Math.floor(Math.random() * 10 * user.speed) + 1;

            currentPosition += randomSpeed;
            runner.style.left = `${currentPosition}px`;

            const powerUpType = checkPowerUpCollision(runner);
            if (powerUpType) {
                if (powerUpType === 'speed-boost') {
                    currentPosition += 50;
                } else if (powerUpType === 'whirlwind') {
                    currentPosition = 0;
                    runner.style.left = `${currentPosition}px`;
                } else if (powerUpType === 'switch-places') {
                    const otherRunner = participants[Math.floor(Math.random() * participants.length)];
                    if (otherRunner !== user) {
                        const otherRunnerElement = gameContainer.querySelector(`.runner[data-username="${otherRunner.name}"]`);
                        const tempPosition = currentPosition;
                        currentPosition = parseInt(otherRunnerElement.style.left);
                        otherRunnerElement.style.left = `${tempPosition}px`;
                    }
                }
            }

            if (currentPosition >= targetPosition) {
                clearInterval(intervalId);
                finishedParticipants.push(user);
                console.log(`User ${user.name} has finished!`);
                checkGameEndCondition(); // Call this function here to check the end condition after each user finishes


            }

        }, 100);

    }

    function checkForWinners() {
        let numLosers = parseInt(document.getElementById("num-losers").value, 10);
        let numFinishersNeeded = participants.length - numLosers;
    
        if (finishedParticipants.length >= numFinishersNeeded) {
            clearInterval(gameInterval);
            displayResults();
        }
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
        const powerUps = document.querySelectorAll('.power-up');

        for (const powerUp of powerUps) {
            const runnerRect = runner.getBoundingClientRect();
            const powerUpRect = powerUp.getBoundingClientRect();

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
            const powerUp = document.createElement('div');
            powerUp.className = `power-up ${type}`;
            powerUp.textContent = type === 'speed-boost' ? 'S' : type === 'whirlwind' ? 'W' : 'C';
            powerUp.style.top = `${10 + Math.random() * 80}%`;
            powerUp.style.left = `${10 + Math.random() * 80}%`;
            gameContainer.appendChild(powerUp);
        }
    }

    function resetGame() {
        // Remove existing power-ups
        const existingPowerUps = document.querySelectorAll('.power-up');
        existingPowerUps.forEach(powerUp => {
            powerUp.remove();
        });
    
        // Remove existing runners
        const existingRunners = document.querySelectorAll('.runner');
        existingRunners.forEach(runner => {
            runner.remove();
        });
    
        // Reset finishedParticipants array
        finishedParticipants = [];
        animatePowerUps();

    }
      
});


