// Owns player health/damage: applying hits (life loss, recoil, knockback lock),
// the death transition, and the post-hit invulnerability cooldown.
export class PlayerHealthController {
    constructor(verticalHitRecoilMultiplier, playerPhysicsController, combatController) {
        this.verticalHitRecoilMultiplier = verticalHitRecoilMultiplier;
        this.playerPhysicsController = playerPhysicsController;
        this.combatController = combatController;
    }

    applyDamage(now, player, source, hitFromAbove, hitFromBelow, onDeath) {
        player.life -= source.damage;
        player.lastHitTime = now;
        player.isHit = true;
        this.applyRecoil(now, player, source, hitFromAbove, hitFromBelow);

        this.checkDeath(now, player, onDeath);
    }

    // Knockback away from `source` (needs x, y, w, h, recoilX, recoilY) without any damage.
    applyRecoil(now, player, source, hitFromAbove = false, hitFromBelow = false) {
        player.knockbackUntil = now + player.knockbackControlLock;

        const recoilXForce =
            hitFromAbove || hitFromBelow
                ? source.recoilX / this.verticalHitRecoilMultiplier
                : source.recoilX;
        const recoilYForce = hitFromAbove
            ? source.recoilY * this.verticalHitRecoilMultiplier
            : source.recoilY;

        const hitFromLeft = player.x + player.w / 2 < source.x + source.w / 2;
        const vx = hitFromLeft ? -recoilXForce : recoilXForce;
        const vy = hitFromBelow ? 0 : -recoilYForce;
        this.playerPhysicsController.applyKnockback(player, vx, vy);
    }

    canHeal(player) {
        return player.life < player.maxLife;
    }

    // Heals the player by one life point, capped at maxLife.
    heal(player) {
        if (this.canHeal(player)) {
            player.life++;
        }
    }

    // Permanently adds one heart slot and fills it.
    increaseMaxLife(player) {
        player.maxLife++;
        player.life++;
    }

    checkDeath(now, player, onDeath) {
        if (player.life > 0) {
            return;
        }
        player.dying = true;
        player.dyingStartedAt = now;
        this.playerPhysicsController.stopMovement(player);
        this.combatController.stopShooting(player);
        player.isHit = false;
        onDeath();
    }

    updateDamageCooldown(now, player) {
        if (player.isHit && now - player.lastHitTime >= player.hitCooldown) {
            player.isHit = false;
        }
    }

    // Completes the death animation, transitioning from dying to fully dead.
    finishDying(player) {
        player.dying = false;
        player.dead = true;
    }
}
