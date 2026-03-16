export class Exporter {
    constructor(canvasManager, timelineManager) {
        this.canvasManager = canvasManager;
        this.timelineManager = timelineManager;
        this.exportBtn = document.getElementById('btn-export');
        this.isExporting = false;
        this.setupListeners();
    }

    setupListeners() {
        this.exportBtn.addEventListener('click', () => this.showExportModal());
    }

    showExportModal() {
        const existing = document.getElementById('export-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'export-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

        overlay.innerHTML = `
            <div style="background:var(--bg-panel);border:1px solid var(--border-light);border-radius:16px;padding:32px;width:420px;max-width:90vw;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <h2 style="font-size:1.25rem;font-weight:700;">Export</h2>
                    <button id="close-export" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.5rem;line-height:1;">×</button>
                </div>
                <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
                    <button class="export-opt" data-type="png" style="padding:14px 16px;background:var(--bg-surface);border:1px solid var(--border-light);border-radius:10px;color:var(--text-main);cursor:pointer;text-align:left;font-size:0.9rem;font-weight:500;transition:border-color 0.15s;">
                        PNG — Single frame snapshot
                    </button>
                    <button class="export-opt" data-type="webm" style="padding:14px 16px;background:var(--bg-surface);border:1px solid var(--border-light);border-radius:10px;color:var(--text-main);cursor:pointer;text-align:left;font-size:0.9rem;font-weight:500;transition:border-color 0.15s;">
                        WebM video — Full animation (5s)
                    </button>
                </div>
                <div id="export-status" style="display:none;padding:12px;background:var(--bg-surface);border-radius:8px;font-size:0.85rem;color:var(--text-muted);text-align:center;"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('close-export').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelectorAll('.export-opt').forEach(btn => {
            btn.addEventListener('mouseenter', () => btn.style.borderColor = 'var(--accent-primary)');
            btn.addEventListener('mouseleave', () => btn.style.borderColor = 'var(--border-light)');
            btn.addEventListener('click', () => {
                if (btn.dataset.type === 'png') this.exportPNG();
                if (btn.dataset.type === 'webm') this.exportWebM(overlay);
            });
        });
    }

    exportPNG() {
        const dataURL = this.canvasManager.canvas.toDataURL({ format: 'png', multiplier: 2 });
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `jitterclone-${Date.now()}.png`;
        a.click();
    }

    exportWebM(overlay) {
        if (this.isExporting) return;
        this.isExporting = true;

        const status = document.getElementById('export-status');
        status.style.display = 'block';
        status.textContent = 'Recording... please wait 5 seconds';

        const canvasEl = document.getElementById('main-canvas');
        if (!canvasEl) return;

        this.timelineManager.pause();
        if (window.gsap) gsap.globalTimeline.time(0);

        const stream = canvasEl.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks = [];

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jitterclone-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            this.isExporting = false;
            status.textContent = 'Done! File downloaded.';
            setTimeout(() => { if (overlay) overlay.remove(); }, 1500);
        };

        recorder.start();
        this.timelineManager.play();

        setTimeout(() => {
            recorder.stop();
            this.timelineManager.pause();
        }, this.timelineManager.duration * 1000);
    }
}
