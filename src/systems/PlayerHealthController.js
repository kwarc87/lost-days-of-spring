// Owns player health/damage: applying hits (life loss, recoil, knockback lock),
// the death transition, and the post-hit invulnerability cooldown.
export class PlayerHealthController {
    constructor(verticalHitRecoilMultiplier) {
        this.verticalHitRecoilMultiplier = verticalHitRecoilMultiplier;
    }

    applyDamage(now, player, source, hitFromAbove, hitFromBelow, onDeath) {
        player.life -= source.damage;
        player.lastHitTime = now;
        player.isHit = true;
        player.knockbackUntil = now + player.knockbackControlLock;

        const recoilXForce =
            hitFromAbove || hitFromBelow
                ? source.recoilX / this.verticalHitRecoilMultiplier
                : source.recoilX;
        const recoilYForce = hitFromAbove
            ? source.recoilY * this.verticalHitRecoilMultiplier
            : source.recoilY;

        player.jumpPressedByUser = false;
        const hitFromLeft = player.x + player.w / 2 < source.x + source.w / 2;
        player.vx = hitFromLeft ? -recoilXForce : recoilXForce;
        player.vy = hitFromBelow ? 0 : -recoilYForce;

        this.checkDeath(now, player, onDeath);
    }

    checkDeath(now, player, onDeath) {
        if (player.life > 0) {
            return;
        }
        player.dying = true;
        player.dyingStartedAt = now;
        player.vx = 0;
        player.vy = 0;
        player.shooting = false;
        player.isHit = false;
        onDeath();
    }

    updateDamageCooldown(now, player) {
        if (player.isHit && now - player.lastHitTime >= player.hitCooldown) {
            player.isHit = false;
        }
    }
}
