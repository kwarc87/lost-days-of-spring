// Owns the artifact gallery "mode" flag, the frozen background frame, and
// carousel-open/close orchestration around the stateful ArtifactGalleryRenderer.
export class ArtifactGalleryController {
    constructor(gallery) {
        this.gallery = gallery;
        this.active = false;
        this.frozenFrame = null;
        this.lastIndex = 0;
    }

    resetLastIndex() {
        this.lastIndex = 0;
    }

    activate() {
        this.active = true;
    }

    // Snapshots the current canvas into an offscreen frame reused as the
    // static background behind the gallery overlay.
    captureFrame(canvas) {
        if (!this.frozenFrame) {
            this.frozenFrame = document.createElement("canvas");
        }
        this.frozenFrame.width = canvas.width;
        this.frozenFrame.height = canvas.height;
        this.frozenFrame.getContext("2d").drawImage(canvas, 0, 0);
    }

    openGallery(artifacts) {
        this.gallery.open(artifacts, this.lastIndex);
    }

    draw(ctx, canvas, now) {
        ctx.drawImage(this.frozenFrame, 0, 0);
        this.gallery.draw(ctx, canvas, now);
    }

    isAnimating() {
        return this.gallery._animOffset !== 0;
    }

    navigateLeft() {
        this.gallery.navigateLeft();
    }

    navigateRight() {
        this.gallery.navigateRight();
    }

    deactivate() {
        this.active = false;
        this.lastIndex = this.gallery.selectedIndex;
    }
}
