// Tracks cursor position in world-space coordinates for the debug cursor panel.
// Only listens while attached, so it stays idle outside of debug mode.
export class DebugMouseTracker {
    constructor(canvas, getCamera) {
        this.canvas = canvas;
        this.getCamera = getCamera;
        this.worldX = 0;
        this.worldY = 0;
    }

    attach(onMove) {
        this.mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.worldX = Math.round(
                (e.clientX - rect.left) * scaleX + this.getCamera().x,
            );
            this.worldY = Math.round(
                (e.clientY - rect.top) * scaleY + this.getCamera().y,
            );
            onMove?.();
        };
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    detach() {
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }
}
