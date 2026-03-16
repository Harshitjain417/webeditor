export class TimelineManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.playBtn = document.getElementById('btn-play');
        this.timeDisplay = document.querySelector('.time-display');
        this.tracksContainer = document.getElementById('timeline-tracks');

        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 5;
        this.rafId = null;

        this.setupListeners();
        this.renderTracks();
    }

    setupListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        document.addEventListener('canvas:update', () => this.renderTracks());
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
            if (window.gsap) gsap.globalTimeline.time(0);
        }

        if (window.gsap) gsap.globalTimeline.play();
        this.lastTimestamp = null;
        this.rafId = requestAnimationFrame((ts) => this.tick(ts));
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        if (window.gsap) gsap.globalTimeline.pause();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }

    tick(timestamp) {
        if (!this.isPlaying) return;

        if (this.lastTimestamp) {
            this.currentTime += (timestamp - this.lastTimestamp) / 1000;
        }
        this.lastTimestamp = timestamp;

        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
            this.pause();
            if (window.gsap) gsap.globalTimeline.time(0);
            this.updateDisplay(0);
            this.updatePlayhead(0);
            return;
        }

        this.updateDisplay(this.currentTime);
        this.updatePlayhead(this.currentTime);

        if (this.canvasManager && this.canvasManager.canvas) {
            this.canvasManager.canvas.requestRenderAll();
        }

        this.rafId = requestAnimationFrame((ts) => this.tick(ts));
    }

    updateDisplay(time) {
        const seconds = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        this.timeDi
