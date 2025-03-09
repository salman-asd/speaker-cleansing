document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Animate hero section
    gsap.to('.hero-section h1', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.to('.hero-section p', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Animate speaker section
    gsap.to('.speaker-section', {
        scrollTrigger: {
            trigger: '.speaker-section',
            start: 'top 80%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Animate how-to section
    gsap.to('.how-to-section', {
        scrollTrigger: {
            trigger: '.how-to-section',
            start: 'top 80%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Animate steps with staggered effect
    gsap.from('.step', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Speaker cleaner functionality
    class SpeakerCleaner {
        constructor() {
            this.audioContext = null;
            this.oscillator = null;
            this.gainNode = null;
            this.isPlaying = false;
            this.startTime = 0;
            this.duration = 45; // Extended to 45 seconds for better results
            this.currentMode = 'sound';
            this.vibrationPattern = [100, 50]; // vibration pattern in ms
            this.frequencySequence = [
                { freq: 165, time: 10 }, // Low frequency to start
                { freq: 200, time: 10 }, // Medium frequency
                { freq: 440, time: 10 }, // Higher frequency
                { freq: 800, time: 5 },  // Very high frequency
                { freq: 165, time: 10 }  // Back to low for final push
            ];
            this.currentFreqIndex = 0;
            this.frequencyChangeTimer = null;
            this.animationFrame = null;

            // DOM Elements
            this.startButton = document.getElementById('startButton');
            this.soundButton = document.getElementById('soundButton');
            this.vibrateButton = document.getElementById('vibrateButton');
            this.progressCircle = document.querySelector('.circle-progress');
            this.progressText = document.querySelector('.progress-text');
            this.modeText = document.querySelector('.mode-text');

            // Configure circle progress
            const circumference = 2 * Math.PI * 115;
            this.progressCircle.style.strokeDasharray = circumference;
            this.progressCircle.style.strokeDashoffset = circumference;
            this.circumference = circumference;

            // Bind methods
            this.toggleCleaning = this.toggleCleaning.bind(this);
            this.updateProgress = this.updateProgress.bind(this);
            this.switchMode = this.switchMode.bind(this);
            this.changeFrequency = this.changeFrequency.bind(this);

            // Event listeners
            this.startButton.addEventListener('click', this.toggleCleaning);
            this.soundButton.addEventListener('click', () => this.switchMode('sound'));
            this.vibrateButton.addEventListener('click', () => this.switchMode('vibrate'));
        }

        async initAudioContext() {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sine';

            // Start with the first frequency in the sequence
            const initialFreq = this.frequencySequence[0].freq;
            this.oscillator.frequency.setValueAtTime(initialFreq, this.audioContext.currentTime);

            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);

            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
        }

        changeFrequency() {
            if (!this.isPlaying || !this.oscillator) return;

            this.currentFreqIndex++;

            if (this.currentFreqIndex < this.frequencySequence.length) {
                const nextFreq = this.frequencySequence[this.currentFreqIndex];

                // Gradually change to the new frequency over 500ms for smoother transition
                this.oscillator.frequency.linearRampToValueAtTime(
                    nextFreq.freq,
                    this.audioContext.currentTime + 0.5
                );

                // Update the mode text to show current frequency
                this.modeText.textContent = `${this.currentMode.toUpperCase()} - ${nextFreq.freq}Hz`;

                // Schedule the next frequency change
                this.frequencyChangeTimer = setTimeout(
                    this.changeFrequency,
                    nextFreq.time * 1000
                );
            }
        }

        switchMode(mode) {
            this.currentMode = mode;
            this.soundButton.classList.toggle('active', mode === 'sound');
            this.vibrateButton.classList.toggle('active', mode === 'vibrate');
            this.modeText.textContent = mode.toUpperCase();

            if (this.isPlaying) {
                this.stopCleaning();
                this.startCleaning();
            }
        }

        updateProgress() {
            if (!this.isPlaying) return;
            
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const progress = Math.min(100, (elapsed / this.duration) * 100);

            // Update circle progress
            const offset = this.circumference - (progress / 100) * this.circumference;
            this.progressCircle.style.strokeDashoffset = offset;

            // Update percentage text
            this.progressText.textContent = `${Math.round(progress)}%`;

            if (progress < 100 && this.isPlaying) {
                this.animationFrame = requestAnimationFrame(this.updateProgress);
            } else if (progress >= 100) {
                this.stopCleaning();
            }
        }

        async startCleaning() {
            this.isPlaying = true;
            this.startTime = Date.now();
            this.startButton.textContent = 'STOP';
            this.currentFreqIndex = 0;

            // Add button animation with GSAP
            gsap.to(this.startButton, {
                scale: 1.2,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

            if (this.currentMode === 'sound') {
                await this.initAudioContext();
                this.oscillator.start();

                // Update the mode text to show current frequency
                this.modeText.textContent = `${this.currentMode.toUpperCase()} - ${this.frequencySequence[0].freq}Hz`;

                // Schedule frequency changes
                this.frequencyChangeTimer = setTimeout(
                    this.changeFrequency,
                    this.frequencySequence[0].time * 1000
                );
            } else if (this.currentMode === 'vibrate' && navigator.vibrate) {
                // Enhance vibration for better water ejection
                const enhancedVibrate = () => {
                    if (!this.isPlaying) return;

                    // Calculate which frequency phase we're in
                    const elapsed = (Date.now() - this.startTime) / 1000;
                    let totalTime = 0;
                    let currentPhase = 0;

                    for (let i = 0; i < this.frequencySequence.length; i++) {
                        totalTime += this.frequencySequence[i].time;
                        if (elapsed <= totalTime) {
                            currentPhase = i;
                            break;
                        }
                    }

                    // Adjust vibration intensity based on the current phase
                    let intensity = 0;
                    switch (currentPhase) {
                        case 0:
                            intensity = 100;
                            break;
                        case 1:
                            intensity = 150;
                            break;
                        case 2:
                            intensity = 200;
                            break;
                        case 3:
                            intensity = 300;
                            break;
                        case 4:
                            intensity = 100;
                            break;
                        default:
                            intensity = 100;
                    }

                    this.modeText.textContent = `${this.currentMode.toUpperCase()} - PHASE ${currentPhase + 1}`;

                    navigator.vibrate(intensity);
                    if (this.isPlaying) {
                        setTimeout(enhancedVibrate, 150);
                    }
                };

                enhancedVibrate();
            }

            this.animationFrame = requestAnimationFrame(this.updateProgress);
        }

        stopCleaning() {
            // Stop GSAP animation
            gsap.killTweensOf(this.startButton);
            gsap.to(this.startButton, {
                scale: 1,
                duration: 0.3,
                ease: "power1.out"
            });

            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator = null;
            }

            if (this.frequencyChangeTimer) {
                clearTimeout(this.frequencyChangeTimer);
                this.frequencyChangeTimer = null;
            }

            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            if (navigator.vibrate) {
                navigator.vibrate(0); // Stop vibration
            }

            this.isPlaying = false;
            this.startButton.textContent = 'PRESS';
            this.progressText.textContent = '0%';
            this.progressCircle.style.strokeDashoffset = this.circumference;
            this.modeText.textContent = this.currentMode.toUpperCase();
        }

        async toggleCleaning() {
            if (this.isPlaying) {
                this.stopCleaning();
            } else {
                await this.startCleaning();
            }
        }
    }

    // Initialize the speaker cleaner
    new SpeakerCleaner();
});