document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const musicButton = document.getElementById('musicButton');
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
    let isMusicPlaying = false;
    
    // Constantes pour la détection du souffle
    const BLOW_THRESHOLD = 50; // Seuil pour détecter un souffle
    const BLOW_DURATION = 500; // Durée minimale du souffle en ms
    
    // Désactiver le bouton de réinitialisation au début
    resetButton.disabled = true;
    
    // Fonction pour démarrer l'analyse du microphone
    startButton.addEventListener('click', async () => {
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
            statusElement.textContent = "Écoutant... Soufflez fort dans le microphone!";
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
            statusElement.textContent = "Souffle détecté! Continuez...";
            
            // Mettre en place un minuteur pour vérifier si le souffle dure assez longtemps
            blowingTimeout = setTimeout(() => {
                extinguishCandle();
            }, BLOW_DURATION);
        } else if (average <= BLOW_THRESHOLD && isBlowing) {
            // Arrêter si le souffle s'arrête avant la durée requise
            isBlowing = false;
            clearTimeout(blowingTimeout);
            statusElement.textContent = "Essayez de souffler plus fort et plus longtemps!";
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
    }
    
    // Fonction pour éteindre la bougie
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
        statusElement.textContent = "Bravo! Vous avez éteint la bougie!";
        resetButton.disabled = false;
        
        // Jouer un son d'applaudissement et la chanson d'anniversaire si elle n'est pas déjà en cours
        playApplauseSound();
        if (!isMusicPlaying) {
            playBirthdaySong();
        }
    }
    
    // Fonction pour jouer un son d'applaudissement
    function playApplauseSound() {
        try {
            const applause = new Audio('https://freesound.org/data/previews/277/277021_5324723-lq.mp3');
            applause.play();
        } catch (error) {
            console.error("Impossible de jouer le son:", error);
        }
    }
    
    // Fonction pour gérer la lecture de la musique d'anniversaire
    musicButton.addEventListener('click', () => {
        if (isMusicPlaying) {
            pauseBirthdaySong();
        } else {
            playBirthdaySong();
        }
    });
    
    // Fonction pour jouer la chanson d'anniversaire
    function playBirthdaySong() {
        birthdaySong.play();
        isMusicPlaying = true;
        musicButton.textContent = "Arrêter la musique";
        statusElement.textContent = "Joyeux anniversaire! Profitez de la musique!";
    }
    
    // Fonction pour arrêter la chanson d'anniversaire
    function pauseBirthdaySong() {
        birthdaySong.pause();
        isMusicPlaying = false;
        musicButton.textContent = "Jouer la musique";
        statusElement.textContent = "Musique arrêtée. Cliquez sur 'Activer le microphone' et soufflez!";
    }
    
    // Fonction pour rallumer la bougie
    resetButton.addEventListener('click', () => {
        // Réinitialiser la bougie
        flame.classList.remove('extinguished');
        
        // Réinitialiser l'interface
        resetButton.disabled = true;
        startButton.disabled = false;
        statusElement.textContent = "Cliquez sur 'Activer le microphone' et soufflez!";
        
        // Réinitialiser les variables
        isBlowing = false;
        if (blowingTimeout) {
            clearTimeout(blowingTimeout);
        }
    });
});