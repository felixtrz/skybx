import './styles/index.css';

import { CategoryComponent, CategoryPanelSystem } from './CategoryPanelSystem';
import { Core, GameObject, VRButton, XRSnapTurnSystem } from 'elixr';
import { KeyboardInputComponent, KeyboardSystem } from './KeyboardSystem';
import { SkyboxComponent, SkyboxLoadingSystem } from './SkyboxLoadingSystem';
import { UIComponent, UISystem } from './UISystem';

import { BannerPanelSystem } from './BannerPanelSystem';
import { PromptPanelSystem } from './PromptPanelSystem';
import { UIRenderSystem } from './UIRenderSystem';
import { WorldPanelSystem } from './WorldPanelSystem';
import { landingPageLogic } from './landing';

Core.init(document.getElementById('scene-container')).then((core) => {
	const game = new GameObject();

	core.registerGameComponent(UIComponent);
	game.addComponent(UIComponent);
	core.registerGameComponent(CategoryComponent);
	game.addComponent(CategoryComponent);
	core.registerGameSystem(UISystem);
	core.registerGameComponent(SkyboxComponent);
	game.addComponent(SkyboxComponent);
	core.registerGameSystem(SkyboxLoadingSystem);
	core.registerGameComponent(KeyboardInputComponent);
	game.addComponent(KeyboardInputComponent);
	core.registerGameSystem(KeyboardSystem);
	core.registerGameSystem(BannerPanelSystem);
	core.registerGameSystem(PromptPanelSystem);
	core.registerGameSystem(CategoryPanelSystem);
	core.registerGameSystem(WorldPanelSystem);
	core.registerGameSystem(XRSnapTurnSystem);
	core.registerGameSystem(UIRenderSystem);

	const vrButton = document.getElementById('vr-button');
	const webLaunchButton = document.getElementById('web-launch-button');
	webLaunchButton.style.display = 'none';
	VRButton.convertToVRButton(vrButton, core.renderer, {
		VR_NOT_ALLOWED_TEXT: 'VR BLOCKED',
		VR_NOT_SUPPORTED_TEXT: 'VR UNSUPPORTED',
		onSessionStarted: () => {},
		onSessionEnded: () => {},
		onUnsupported: () => {
			vrButton.style.display = 'none';
			webLaunchButton.style.display = 'block';
		},
	});

	landingPageLogic();
});
