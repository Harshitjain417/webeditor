export class TemplateManager {
    constructor(canvasManager, uiManager) {
        this.canvasManager = canvasManager;
        this.uiManager = uiManager;
        this.templateBtn = document.getElementById('btn-templates');
        this.setupListeners();
    }

    setupListeners() {
        this.templateBtn.addEventListener('click', () => this.showTemplateModal());
    }

    showTemplateModal() {
        const existing = document.getElementById('template-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'template-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

        overlay.innerHTML = `
            <div style="background:var(--bg-panel);border:1px solid var(--border-light);border-radius:16px;padding:32px;width:600px;max-width:90vw;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <h2 style="font-size:1.25rem;font-weight:700;">Choose a template</h2>
                    <button id="close-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.5rem;line-height:1;">×</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                    <div class="tmpl-card" data-template="blank" style="cursor:pointer;border-radius:10px;border:1px solid var(--border-light);overflow:hidden;transition:border-color 0.15s;">
                        <div style="height:100px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--text-muted);">+</div>
                        <div style="padding:10px;font-size:0.85rem;font-weight:500;">Blank canvas</div>
                    </div>
                    <div class="tmpl-card" data-template="social" style="cursor:pointer;border-radius:10px;border:1px solid var(--border-light);overflow:hidden;transition:border-color 0.15s;">
                        <div style="height:100px;background:linear-gradient(135deg,#4f46e5,#1a1b23);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;">Social Promo</div>
                        <div style="padding:10px;font-size:0.85rem;font-weight:500;">Social media promo</div>
                    </div>
                    <div class="tmpl-card" data-template="title" style="cursor:pointer;border-radius:10px;border:1px solid var(--border-light);overflow:hidden;transition:border-color 0.15s;">
                        <div style="height:100px;background:linear-gradient(135deg,#0f1015,#10b981);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;">Title Card</div>
                        <div style="padding:10px;font-size:0.85rem;font-weight:500;">Title card</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('close-modal').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelectorAll('.tmpl-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.style.borderColor = 'var(--accent-primary)');
            card.addEventListener('mouseleave', () => card.style.borderColor = 'var(--border-light)');
            card.addEventListener('click', () => {
                this.loadTemplate(card.dataset.template);
                overlay.remove();
            });
        });
    }

    loadTemplate(name) {
        const canvas = this.canvasManager.canvas;
        canvas.clear();

        if (name === 'blank') {
            canvas.backgroundColor = '#ffffff';
            canvas.requestRenderAll();
            this.canvasManager.dispatchCanvasChange();
            return;
        }

        if (name === 'social') {
            canvas.backgroundColor = '#0f1015';
            const card = new fabric.Rect({
                left: 400, top: 225, width: 340, height: 220,
                fill: '#6366f1', rx: 16, ry: 16,
                originX: 'center', originY: 'center', name: 'Card'
            });
            const title = new fabric.IText('Hello World', {
                left: 400, top: 205, fontFamily: 'Inter',
                fontSize: 48, fontWeight: 700, fill: '#ffffff',
                originX: 'center', originY: 'center', name: 'Title'
            });
            const sub = new fabric.IText('Made with JitterClone', {
                left: 400, top: 258, fontFamily: 'Inter',
                fontSize: 20, fill: 'rgba(255,255,255,0.7)',
                originX: 'center', originY: 'center', name: 'Subtitle'
            });
            canvas.add(card, title, sub);
            if (window.gsap) {
                this.uiManager.applyAnimation(card, 'scale-in');
                setTimeout(() => this.uiManager.applyAnimation(title, 'fade-in'), 400);
                setTimeout(() => this.uiManager.applyAnimation(sub, 'fade-in'), 700);
            }
        }

        if (name === 'title') {
            canvas.backgroundColor = '#0a0a0a';
            const line = new fabric.Rect({
                left: 400, top: 200, width: 60, height: 6,
                fill: '#10b981', rx: 3, ry: 3,
                originX: 'center', originY: 'center', name: 'Accent line'
            });
            const title = new fabric.IText('Your Title Here', {
                left: 400, top: 240, fontFamily: 'Inter',
                fontSize: 52, fontWeight: 800, fill: '#ffffff',
                originX: 'center', originY: 'center', name: 'Title'
            });
            const sub = new fabric.IText('Subtitle goes here', {
                left: 400, top: 295, fontFamily: 'Inter',
                fontSize: 22, fill: 'rgba(255,255,255,0.5)',
                originX: 'center', originY: 'center', name: 'Subtitle'
            });
            canvas.add(line, title, sub);
            if (window.gsap) {
                this.uiManager.applyAnimation(line, 'scale-in');
                setTimeout(() => this.uiManager.applyAnimation(title, 'slide-in'), 300);
                setTimeout(() => this.uiManager.applyAnimation(sub, 'fade-in'), 600);
            }
        }

        canvas.requestRenderAll();
        this.canvasManager.dispatchCanvasChange();
    }
}
