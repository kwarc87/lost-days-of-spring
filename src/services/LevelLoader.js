import { GameFactory } from "../factories/GameFactory.js";
import { MapDiscovery } from "./MapDiscovery.js";

// Builds a fresh level's runtime data (platforms, entities, layers, counts) and
// wires it into the level-scoped controllers. Pure w.r.t. the caller: it only
// mutates the controllers it's given and returns the plain data the core class
// needs to store on itself.
export const LevelLoader = {
    load(levelData, controllers) {
        const {
            elevatorController,
            enemyController,
            collectibleController,
            combatController,
            messageController,
            exitController,
            teleportController,
            hiddenWallController,
            checkpointManager,
        } = controllers;

        const worldSize = levelData.worldSize;
        const mapDiscovery = new MapDiscovery(worldSize, GameFactory.GRID * 3);
        const platforms = levelData.platforms ?? [];
        elevatorController.setElevators(levelData.elevators);
        enemyController.setEnemies(levelData.enemies);
        collectibleController.setCollectibles(levelData.collectibles);
        combatController.setSpikes(levelData.spikes);
        messageController.setMessages(levelData.messages);
        exitController.setExits(levelData.exits);
        hiddenWallController.setHiddenWalls(levelData.hiddenWalls);
        const foregroundItems = levelData.foregroundItems ?? [];
        const backgroundItems = levelData.backgroundItems ?? [];
        const preBackgroundItems = levelData.preBackgroundItems ?? [];
        const parallaxItems = levelData.parallax ?? [];
        combatController.setCannons(levelData.cannons);
        teleportController.setTeleports(levelData.teleports);

        const currentLevelCoinsCount = collectibleController.getCoins().length;
        const currentLevelSplintersCount = collectibleController.getSplinters().length;
        const currentLevelArtifactsCount = collectibleController.getArtifacts().length;
        const currentLevelEnemiesCount = enemyController.getEnemies().length;

        // Load checkpoints and extract embedded visual layers / messages
        checkpointManager.setCheckpoints(levelData.checkpoints ?? []);
        const checkpointItems = checkpointManager.extractItems();
        preBackgroundItems.push(...checkpointItems.back);
        foregroundItems.push(...checkpointItems.front);
        messageController.getMessages().push(...checkpointItems.messages);
        platforms.push(...checkpointItems.platforms);
        const teleportItems = teleportController.extractItems();
        foregroundItems.push(...teleportItems.foreground);
        platforms.push(...teleportItems.platforms);
        // Elevators first: same priority order as movePlayerY collision resolution.
        const solids = [...elevatorController.getElevators(), ...platforms];

        // Restore checkpoint state (collected items, killed enemies, etc.)
        checkpointManager.restoreProgress({
            collectibleController,
            enemyController,
            elevatorController,
            messageController,
            mapDiscovery,
        });

        return {
            worldSize,
            mapDiscovery,
            platforms,
            solids,
            foregroundItems,
            backgroundItems,
            preBackgroundItems,
            parallaxItems,
            currentLevelCoinsCount,
            currentLevelSplintersCount,
            currentLevelArtifactsCount,
            currentLevelEnemiesCount,
        };
    },
};
