export class CanvasManager {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.currentTool = 'select';
        this.objectCounter = 1;
        this.CANVAS_W = 800;
        this.CANVAS_H = 450;

        this.canvas = new fabric.Canvas(canvasId, {
            width: this.CANVAS_W,
            height: this.CANVAS_H,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
        });

        this.canvas.on('selection:created', () => this.handleSelectionChange());
        this.canvas.on('selection:updated', () => this.handleSelectionChange());
        this.canvas.on('selection:cleared', () => this.handleSelectionChange());
        this.canvas.on('mouse:down', (opt) => this.handleMouseDown(opt));
        this.canvas.on('object:modified', () => this.dispatchCanvasChange());

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    setTool(tool) {
        this.currentTool = tool;
        if (tool === 'select') {
            this.canvas.defaultCursor = 'default';
            this.canvas.selection = true;
            this.canvas.forEachObject(o => o.selectable = true);
        } else {
            this.canvas.defaultCursor = 'crosshair';
            this.canvas.selection = false;
            this.canvas.forEachObject(o => o.selectable = false);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
        }
    }

    handleMouseDown(options) {
        if (this.currentTool === 'select') return;

        const pointer = this.canvas.getPointer(options.e);
        let newObj = null;
        const base = {
            left: pointer.x,
            top: pointer.y,
            fill: '#6366f1',
            originX: 'center',
            originY: 'center',
            id: `obj-${this.objectCounter}`,
            name: `${this.currentTool.charAt(0).toUpperCase() + this.currentTool.slice(1)} ${this.objectCounter}`
        };
        this.objectCounter++;

        switch (this.currentTool) {
            case 'rect':
                newObj = new fabric.Rect({ ...base, width: 120, height: 120, rx: 8, ry: 8 });
                break;
            case 'circle':
                newObj = new fabric.Circle({ ...base, radius: 60 });
                break;
            case 'text':
                newObj = new fabric.IText('Text', {
                    ...base,
                    fontFamily: 'Inter',
                    fontSize: 40,
                    fontWeight: 700,
                    fill: '#1a1b23'
                });
                break;
        }

        if (newObj) {
            this.canvas.add(newObj);
            this.canvas.setActiveObject(newObj);
            if (window.app && window.app.uiManager) {
                window.app.uiManager.selectTool('select');
            }
            this.dispatchCanvasChange();
        }
    }

    handleSelectionChange() {
        const event = new CustomEvent('canvas:selection', {
            detail: { objects: this.canvas.getActiveObjects() }
        });
        document.dispatchEvent(event);
    }

    dispatchCanvasChange() {
        const event = new CustomEvent('canvas:update', {
            detail: { objects: this.canvas.getObjects() }
        });
        document.dispatchEvent(event);
    }

    deleteSelected() {
        const active = this.canvas.getActiveObjects();
        if (active.length) {
            active.forEach(obj => this.canvas.remove(obj));
            this.canvas.discardActiveObject();
            this.dispatchCanvasChange();
        }
    }

    resize() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;

        const availW = container.clientWidth - 80;
        const availH = container.clientHeight - 80;
        const scaleX = availW / this.CANVAS_W;
        const scaleY = availH / this.CANVAS_H;
        const scale = Math.min(scaleX, scaleY, 1.5);

        const wrapper = document.querySelector('.canvas-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.transformOrigin = 'center center';
        }
    }
}
