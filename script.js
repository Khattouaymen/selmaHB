document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const flame = document.getElementById('flame');
    const statusElement = document.getElementById('status');
    const birthdaySong = document.getElementById('birthdaySong');
    
    // Variables pour l'analyse audio
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;
    let isBlowing = false;
    let blowingTimeout;
    let musicStarted = false;
    
    // Fonction pour tenter de jouer la musique
    function tryPlayMusic() {
        if (!musicStarted) {
            birthdaySong.volume = 0.7; // Volume à 70%
            birthdaySong.play().then(() => {
                musicStarted = true;
                console.log("Musique démarrée avec succès");
            }).catch(error => {
                console.log("Lecture automatique bloquée. Réessaierons à la prochaine interaction.", error);
            });
        }
    }
    
    // Essayer de démarrer la musique au chargement de la page
    tryPlayMusic();
    
    // Événements pour tenter de démarrer la musique après différentes interactions utilisateur
    document.addEventListener('click', tryPlayMusic);
    document.addEventListener('touchstart', tryPlayMusic);
    document.addEventListener('keydown', tryPlayMusic);
    window.addEventListener('scroll', tryPlayMusic);
      // Constantes pour la détection du souffle
    const BLOW_THRESHOLD = 35; // Seuil pour détecter un souffle
    const BLOW_DURATION = 400; // Durée minimale du souffle en ms
    
    // Désactiver le bouton de réinitialisation au début
    resetButton.disabled = true;    // Fonction pour démarrer l'analyse du microphone
    startButton.addEventListener('click', async () => {
        // Essayer de démarrer la musique quand l'utilisateur clique sur le bouton du microphone
        tryPlayMusic();
        
        try {
            // Demander l'autorisation d'accéder au microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Créer le contexte audio
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            
            // Configurer l'analyseur
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            microphone.connect(analyser);
            
            // Créer le nœud pour traiter les données audio
            javascriptNode = audioContext.createScriptProcessor(1024, 1, 1);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);
            
            // Traiter les données audio
            javascriptNode.onaudioprocess = processAudio;
            
            // Mettre à jour l'interface
            startButton.disabled = true;
            statusElement.textContent = "Listening... Blow hard into the microphone!";
        } catch (error) {
            console.error("Erreur d'accès au microphone:", error);
            statusElement.textContent = "Erreur: impossible d'accéder au microphone";
        }
    });
    
    // Fonction pour traiter les données audio
    function processAudio(event) {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        
        // Calculer le volume moyen
        let average = getAverageVolume(array);
        
        // Détecter un souffle (volume élevé)
        if (average > BLOW_THRESHOLD && !isBlowing) {
            isBlowing = true;
            statusElement.textContent = "Blow detected! Keep going...";
            
            // Mettre en place un minuteur pour vérifier si le souffle dure assez longtemps
            blowingTimeout = setTimeout(() => {
                extinguishCandle();
            }, BLOW_DURATION);
        } else if (average <= BLOW_THRESHOLD && isBlowing) {
            // Arrêter si le souffle s'arrête avant la durée requise
            isBlowing = false;
            clearTimeout(blowingTimeout);
            statusElement.textContent = "sotiii mzyaannn 3la mic!";
        }
    }
    
    // Fonction pour calculer le volume moyen
    function getAverageVolume(array) {
        let values = 0;
        let length = array.length;
        
        for (let i = 0; i < length; i++) {
            values += array[i];
        }
        
        return values / length;
    }    // Fonction pour éteindre la bougie
    function extinguishCandle() {
        // Arrêter l'analyse audio
        if (javascriptNode) {
            javascriptNode.onaudioprocess = null;
            microphone.disconnect();
            javascriptNode.disconnect();
        }
        
        // Animer l'extinction de la bougie
        flame.classList.add('extinguished');
        
        // Mettre à jour l'interface
        statusElement.textContent = "sf baraka 3lik tfitiha hhhh";
        resetButton.disabled = false;
        
        // Jouer un son d'applaudissement (mais s'assurer que la musique continue)
        playApplauseSound();
        
        // Créer les effets de célébration
        createCelebrationEffects();
        
        // S'assurer que la musique continue à jouer
        tryPlayMusic();
    }
    
    // Fonction pour jouer un son d'applaudissement
    function playApplauseSound() {
        try {
            const applause = new Audio('https://freesound.org/data/previews/277/277021_5324723-lq.mp3');
            applause.volume = 0.8; // Volume à 80%
            applause.play();
        } catch (error) {
            console.error("Impossible de jouer le son:", error);
        }
    }
    
    // Fonction pour créer les effets de célébration (ballons et éléments colorés)
    function createCelebrationEffects() {
        const celebrationContainer = document.getElementById('celebration-container');
        celebrationContainer.innerHTML = ''; // Vider le conteneur
        celebrationContainer.classList.remove('hidden');
        
        const colors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4'];
        const itemCount = 30; // Nombre total d'éléments

        // Créer des ballons, confettis et étoiles
        for (let i = 0; i < itemCount; i++) {
            const type = Math.random() < 0.33 ? 'balloon' : (Math.random() < 0.66 ? 'confetti' : 'star');
            const item = document.createElement('div');
            
            item.classList.add('celebration-item');
            item.classList.add(type);
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            item.style.backgroundColor = color;
            
            // Position aléatoire horizontale
            item.style.left = `${Math.random() * 100}%`;
            
            // Délai d'animation aléatoire
            item.style.animationDelay = `${Math.random() * 2}s`;
            
            celebrationContainer.appendChild(item);
        }
        
        // Supprimer les effets après un délai (pour nettoyer la mémoire)
        setTimeout(() => {
            celebrationContainer.classList.add('hidden');
        }, 6000);
    }
    
    // Fonction pour rallumer la bougie
    resetButton.addEventListener('click', () => {
        // Réinitialiser la bougie
        flame.classList.remove('extinguished');
        
        // Réinitialiser l'interface
        resetButton.disabled = true;
        startButton.disabled = false;
        statusElement.textContent = "Click on 'Activate microphone' and blow!";
        
        // Réinitialiser les variables
        isBlowing = false;
        if (blowingTimeout) {
            clearTimeout(blowingTimeout);
        }
        
        // S'assurer que la musique continue à jouer
        tryPlayMusic();
    });

    // Function to handle the countdown and display messages
    function startCountdown() {
        const countdownDisplay = document.getElementById('countdown-display');
        const messages = ['1', '2', '3', 'tfi chma3', 'sotee mzyannnn'];
        let index = 0;

        countdownDisplay.classList.remove('hidden');

        const interval = setInterval(() => {
            if (index < messages.length) {
                countdownDisplay.textContent = messages[index];
                index++;
            } else {
                clearInterval(interval);
                countdownDisplay.classList.add('hidden');
                // Add logic to activate the microphone here
            }
        }, 1000);
    }

    // Attach the countdown to the existing startButton instead of micButton
    if (startButton) {
        startButton.addEventListener('click', startCountdown);
    }
});