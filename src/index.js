import './styles/index.css';

import { CategoryComponent, CategoryPanelSystem } from './CategoryPanelSystem';
import { Core, GameObject, GameSystem, THREE, VRButton } from 'elixr';
import { KeyboardInputComponent, KeyboardSystem } from './KeyboardSystem';
import { SkyboxComponent, SkyboxLoadingSystem } from './SkyboxLoadingSystem';
import { UIComponent, UISystem } from './UISystem';

import { GenerateButtonSystem } from './GenerateButtonSystem';
import { PromptPanelSystem } from './PromptPanelSystem';
// import { SkyboxGenerationSystem } from './SkyboxGenerationSystem';
import { landingPageLogic } from './landing';
import { update as uiUpdate } from 'three-mesh-ui';

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
	// core.registerGameSystem(SkyboxGenerationSystem);
	core.registerGameComponent(KeyboardInputComponent);
	game.addComponent(KeyboardInputComponent);
	core.registerGameSystem(KeyboardSystem);
	core.registerGameSystem(PromptPanelSystem);
	core.registerGameSystem(CategoryPanelSystem);
	core.registerGameSystem(GenerateButtonSystem);

	core.registerGameSystem(
		class extends GameSystem {
			update() {
				uiUpdate();
			}
		},
	);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
	core.scene.add(directionalLight, hemisphereLight);

	const vrButton = document.getElementById('vr-button');
	VRButton.convertToVRButton(vrButton, core.renderer, {
		VR_NOT_ALLOWED_TEXT: 'VR BLOCKED',
		VR_NOT_SUPPORTED_TEXT: 'VR UNSUPPORTED',
		onSessionStarted: () => {},
		onSessionEnded: () => {},
		onUnsupported: () => {
			vrButton.style.display = 'none';
		},
	});

	landingPageLogic();
});
