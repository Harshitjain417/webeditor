export class UIManager {
    constructor(canvasManager, timelineManager) {
        this.canvasManager = canvasManager;
        this.timelineManager = timelineManager;
        this.toolBtns = document.querySelectorAll('.tool-btn');
        this.layerList = document.getElementById('layer-list');
        this.propertyPanel = document.getElementById('property-panel');
        this.animEmptyState = document.getElementById('anim-empty-state');
        this.animControls = document.getElementById('anim-controls');
        this.setupToolbar();
        this.setupEventListeners();
        this.setupAnimationPresets();
        this.setupPropertyInputs();
    }

    setupToolbar() {
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.id.replace('btn-', '');
                this.selectTool(toolName);
            });
        });
    }

    selectTool(toolName) {
        this.toolBtns.forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`btn-${toolName}`);
        if (btn) btn.classList.add('active');
        this.canvasManager.setTool(toolName);
    }

    setupEventListeners() {
        document.addEventListener('canvas:selection', (e) => {
            this.updatePropertiesPanel(e.detail.objects);
            this.updateAnimationPanel(e.detail.objects);
        });
        document.addEventListener('canvas:update', (e) => {
            this.updateLayersPanel(e.detail.objects);
        });
    }

    setupPropertyInputs() {
        const colorPicker = document.getElementById('prop-fill');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                const objs = this.canvasManager.canvas.getActiveObjects();
                objs.forEach(obj => obj.set('fill', e.target.value));
                this.canvasManager.canvas.requestRenderAll();
            });
        }
        const opacityInput = document.getElementById('prop-opacity');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                const objs = this.canvasManager.canvas.getActiveObjects();
                objs.forEach(obj => obj.set('opacity', val));
                this.canvasManager.canvas.requestRenderAll();
                const label = document.getElementById('opacity-label');
                if (label) label.textContent = e.target.value + '%';
            });
        }
    }

    updatePropertiesPanel(activeObjects) {
        const content = document.getElementById('properties-content');
        const emptyState = this.propertyPanel.querySelector('.empty-state');
        if (!activeObjects || activeObjects.length === 0) {
            emptyState.style.display = 'block';
            content.style.display = 'none';
            return;
        }
        emptyState.style.display = 'none';
        content.style.display = 'block';
        const obj = activeObjects[0];
        const colorPicker = document.getElementById('prop-fill');
        if (colorPicker && obj.fill && typeof obj.fill === 'string' && obj.fill.startsWith('#')) {
            colorPicker.value = obj.fill;
        }
        const opacityInput = document.getElementById('prop-opacity');
        const opacityLabel = document.getElementById('opacity-label');
        if (opacityInput) {
            const val = Math.round((obj.opacity !== undefined ? obj.opacity : 1) * 100);
            opacityInput.value = val;
            if (opacityLabel) opacityLabel.textContent = val + '%';
        }
        const wLabel = document.getElementById('prop-w');
        const hLabel = document.getElementById('prop-h');
        if (wLabel) wLabel.textContent = Math.round(obj.getScaledWidth()) + 'px';
        if (hLabel) hLabel.textContent = Math.round(obj.getScaledHeight()) + 'px';
        const xLabel = document.getElementById('prop-x');
        const yLabel = document.getElementById('prop-y');
        if (xLabel) xLabel.textContent = Math.round(obj.left) + 'px';
        if (yLabel) yLabel.textContent = Math.round(obj.top) + 'px';
    }

    updateAnimationPanel(activeObjects) {
        if (!activeObjects || activeObjects.length === 0) {
            this.animEmptyState.style.display = 'block';
            this.animControls.style.display = 'none';
        } else {
            this.animEmptyState.style.display = 'none';
            this.animControls.style.display = 'block';
        }
    }

    updateLayersPanel(objects) {
        this.layerList.innerHTML = '';
        if (objects.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No objects on canvas';
            this.layerList.appendChild(empty);
            return;
        }
        [...objects].reverse().forEach(obj => {
            const div = document.createElement('div');
            div.style.cssText = 'padding:8px 12px;margin-bottom:4px;background:var(--bg-dark);border-radius:4px;font-size:0.8rem;display:flex;justify-content:
