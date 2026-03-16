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
        if (this.isPlaying) { this.pause(); } else { this.play(); }
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
        this.timeDisplay.textContent = `00:${seconds.toString().padStart(2,'0')}:${ms.toString().padStart(2,'0')}`;
    }

    updatePlayhead(time) {
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.style.left = `${(time / this.duration) * 100}%`;
        }
    }

    startPlayback() { this.play(); }
    stopPlayback() { this.pause(); }

    renderTracks() {
        if (!this.tracksContainer) return;
        const playhead = document.getElementById('playhead');
        this.tracksContainer.innerHTML = '';
        if (playhead) this.tracksContainer.appendChild(playhead);
        const objects = this.canvasManager.canvas.getObjects();
        if (objects.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'Add objects to see them on timeline';
            this.tracksContainer.appendChild(empty);
            return;
        }
        [...objects].reverse().forEach(obj => {
            const track = document.createElement('div');
            track.style.cssText = 'height:36px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;padding-left:16px;font-size:0.75rem;position:relative;cursor:pointer;';
            track.textContent = obj.name || 'Object';
            track.addEventListener('click', () => {
                this.canvasManager.canvas.setActiveObject(obj);
                this.canvasManager.canvas.requestRenderAll();
                this.canvasManager.handleSelectionChange();
            });
            if (obj.animations && obj.animations.length > 0) {
                const block = document.createElement('div');
                block.style.cssText = 'position:absolute;left:20%;top:6px;height:22px;width:30%;background:var(--accent-glow);border:1px solid var(--accent-primary);border-radius:4px;';
                track.appendChild(block);
            }
            this.tracksContainer.appendChild(track);
        });
    }
}
