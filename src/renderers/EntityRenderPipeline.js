import {
    MapPlayerRenderer,
    MapPlatformRenderer,
    MapEnemyRenderer,
    MapCoinRenderer,
    MapSplinterRenderer,
    MapArtifactRenderer,
    MapHeartRenderer,
    MapCannonRenderer,
    MapSpikeRenderer,
    MapCheckpointRenderer,
    MapExitRenderer,
} from "./MapRenderers.js";
import { DefaultPlatformRenderer } from "./PlatformRenderers.js";
import { DefaultEnemyRenderer } from "./EnemyRenderers.js";
import { DefaultCollectibleRenderer } from "./CollectibleRenderers.js";
import { DefaultWeaponRenderer } from "./WeaponRenderers.js";
import { CannonRenderer, CannonBulletRenderer } from "./CannonRenderers.js";
import { DefaultSpikeRenderer } from "./SpikeRenderers.js";
import { DefaultWorldRenderer } from "./WorldRenderers.js";
import { DefaultExitRenderer } from "./ExitRenderers.js";
import { CheckpointRenderer } from "./CheckpointRenderer.js";
import { DefaultPlayerRenderer } from "./PlayerRenderers.js";

// Declarative table replacing the game's former per-entity drawX()/decorateDrawMethods()
// wrapper methods. Every renderer's draw(ctx, obj, opts) shares the same call
// shape, so entries here reference the drawing methods directly (bound to their
// owning object, since some renderers call sibling methods via `this`):
// - draw(ctx, obj, opts): the normal (non-map-view) rendering call
// - mapDraw(ctx, obj, opts): used instead while map view is active; null if there is none
// - cull: camera-cull outside map view
export const ENTITY_RENDERERS = {
    platform: {
        draw: DefaultPlatformRenderer.draw.bind(DefaultPlatformRenderer),
        mapDraw: MapPlatformRenderer.draw.bind(MapPlatformRenderer),
        cull: true,
    },
    elevator: {
        draw: DefaultPlatformRenderer.draw.bind(DefaultPlatformRenderer),
        mapDraw: MapPlatformRenderer.draw.bind(MapPlatformRenderer),
        cull: true,
    },
    hiddenWall: {
        draw: DefaultPlatformRenderer.drawHiddenWall.bind(DefaultPlatformRenderer),
        mapDraw: MapPlatformRenderer.draw.bind(MapPlatformRenderer),
        cull: true,
    },
    enemy: {
        draw: DefaultEnemyRenderer.draw.bind(DefaultEnemyRenderer),
        mapDraw: MapEnemyRenderer.draw.bind(MapEnemyRenderer),
        cull: true,
    },
    coin: {
        draw: DefaultCollectibleRenderer.drawCoin.bind(DefaultCollectibleRenderer),
        mapDraw: MapCoinRenderer.draw.bind(MapCoinRenderer),
        cull: true,
    },
    splinter: {
        draw: DefaultCollectibleRenderer.drawSplinter.bind(DefaultCollectibleRenderer),
        mapDraw: MapSplinterRenderer.draw.bind(MapSplinterRenderer),
        cull: true,
    },
    artifact: {
        draw: DefaultCollectibleRenderer.drawArtifact.bind(DefaultCollectibleRenderer),
        mapDraw: MapArtifactRenderer.draw.bind(MapArtifactRenderer),
        cull: true,
    },
    heart: {
        draw: DefaultCollectibleRenderer.drawHeart.bind(DefaultCollectibleRenderer),
        mapDraw: MapHeartRenderer.draw.bind(MapHeartRenderer),
        cull: true,
    },
    weaponUpgrade: {
        draw: DefaultCollectibleRenderer.drawWeaponUpgrade.bind(DefaultCollectibleRenderer),
        mapDraw: null,
        cull: true,
    },
    bullet: {
        draw: DefaultWeaponRenderer.draw.bind(DefaultWeaponRenderer),
        mapDraw: null,
        cull: true,
    },
    cannon: {
        draw: CannonRenderer.draw.bind(CannonRenderer),
        mapDraw: MapCannonRenderer.draw.bind(MapCannonRenderer),
        cull: true,
    },
    cannonBullet: {
        draw: CannonBulletRenderer.draw.bind(CannonBulletRenderer),
        mapDraw: null,
        cull: true,
    },
    spike: {
        draw: DefaultSpikeRenderer.draw.bind(DefaultSpikeRenderer),
        mapDraw: MapSpikeRenderer.draw.bind(MapSpikeRenderer),
        cull: true,
    },
    envPreBackground: {
        draw: DefaultWorldRenderer.drawEnvironmentItem.bind(DefaultWorldRenderer),
        mapDraw: null,
        cull: true,
    },
    envBackground: {
        draw: DefaultWorldRenderer.drawEnvironmentItem.bind(DefaultWorldRenderer),
        mapDraw: null,
        cull: true,
    },
    envForeground: {
        draw: DefaultWorldRenderer.drawEnvironmentItem.bind(DefaultWorldRenderer),
        mapDraw: null,
        cull: true,
    },
    envParallax: {
        draw: DefaultWorldRenderer.drawParallaxEnvironmentItem.bind(DefaultWorldRenderer),
        mapDraw: null,
        cull: false,
    },
    exit: {
        draw: DefaultExitRenderer.draw.bind(DefaultExitRenderer),
        mapDraw: MapExitRenderer.draw.bind(MapExitRenderer),
        cull: true,
    },
    checkpoint: {
        draw: CheckpointRenderer.draw.bind(CheckpointRenderer),
        mapDraw: MapCheckpointRenderer.draw.bind(MapCheckpointRenderer),
        cull: false,
    },
    player: {
        draw: DefaultPlayerRenderer.draw.bind(DefaultPlayerRenderer),
        mapDraw: MapPlayerRenderer.draw.bind(MapPlayerRenderer),
        cull: false,
    },
};

// Dispatches to the right renderer for `key`, handling map-view switching and
// camera culling uniformly so callers (SceneRenderer) stay a flat draw list.
export function drawEntity(ctx, game, key, obj, now) {
    const e = ENTITY_RENDERERS[key];
    const opts = {
        debug: game.showDebug,
        now,
        camera: game.cameraController.camera,
        player: game.player,
        type: obj.sprite,
    };
    if (game.mapView && e.mapDraw) {
        e.mapDraw(ctx, obj, opts);
        return;
    }
    if (e.cull && !game.mapView && !game.cameraController.isVisible(obj)) {
        return;
    }
    e.draw(ctx, obj, opts);
}
