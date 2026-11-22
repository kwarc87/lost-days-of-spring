// Owns temporary platform definitions. They are solid only while active: the controller keeps
// the shared `solids` collision list in sync (adds on activation, removes on deactivation).
export class TemporaryPlatformController {
    constructor() {
        this.temporaryPlatforms = [];
        this.solids = [];
    }

    // `solids` must be the live array the game uses for collisions; it is mutated in place.
    setTemporaryPlatforms(temporaryPlatforms, solids = []) {
        this.temporaryPlatforms = temporaryPlatforms ?? [];
        this.solids = solids;
        for (const platform of this.temporaryPlatforms) {
            if (platform.active) {
                this.solids.push(platform);
            }
        }
    }

    getTemporaryPlatforms() {
        return this.temporaryPlatforms;
    }

    setActive(ids, active) {
        for (const platform of this.temporaryPlatforms) {
            if (!ids.includes(platform.id) || platform.active === active) {
                continue;
            }
            platform.active = active;
            if (active) {
                this.solids.push(platform);
            } else {
                const index = this.solids.indexOf(platform);
                if (index !== -1) {
                    this.solids.splice(index, 1);
                }
            }
        }
    }
}
