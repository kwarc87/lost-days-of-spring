const mainUrl = new URL(import.meta.url);
const version = mainUrl.searchParams.get("v");
const coreModulePath = version
	? `./core/LostDaysOfSpring.js?v=${version}`
	: "./core/LostDaysOfSpring.js";

const { LostDaysOfSpring } = await import(coreModulePath);

const game = new LostDaysOfSpring("game", true);
game.start();
