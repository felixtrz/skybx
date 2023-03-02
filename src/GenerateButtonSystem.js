import { BUTTONS, GameSystem, THREE } from 'elixr';
import { Block, Text } from 'three-mesh-ui';
import { COLORS, PROMPT_CATEGORIES } from './constants';

import { CategoryComponent } from './CategoryPanelSystem';
import { KeyboardInputComponent } from './KeyboardSystem';
import { SkyboxComponent } from './SkyboxLoadingSystem';
import { UIComponent } from './UISystem';

const myHeaders = new Headers();
myHeaders.append('Accept', 'application/json, text/plain, */*');
myHeaders.append('Accept-Language', 'en-US,en;q=0.5');
myHeaders.append('Connection', 'keep-alive');
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Origin', 'https://skybox.blockadelabs.com');
myHeaders.append('Referer', 'https://skybox.blockadelabs.com/');
myHeaders.append('Sec-Fetch-Dest', 'empty');
myHeaders.append('Sec-Fetch-Mode', 'cors');
myHeaders.append('Sec-Fetch-Site', 'same-site');
myHeaders.append('Sec-GPC', '1');
myHeaders.append(
	'User-Agent',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
);
myHeaders.append(
	'sec-ch-ua',
	'"Chromium";v="110", "Not A(Brand";v="24", "Brave";v="110"',
);
myHeaders.append('sec-ch-ua-mobile', '?0');
myHeaders.append('sec-ch-ua-platform', '"macOS"');

export class GenerateButtonSystem extends GameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.input = this.queryGameObjects('input')[0].getComponent(
			KeyboardInputComponent,
		);
		this.category = this.queryGameObjects('category')[0].getComponent(
			CategoryComponent,
		);
		this.skybox = this.queryGameObjects('skybox')[0].getMutableComponent(
			SkyboxComponent,
		);
		const rightPanel = new Block({
			fontFamily: 'assets/Roboto-msdf.json',
			fontTexture: 'assets/Roboto-msdf.png',
			width: 0.6,
			height: 0.41,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 1,
			borderRadius: 0.03,
		});
		rightPanel.rotateY(-Math.PI / 8);
		rightPanel.position.set(0.8, -0.1, -1.01);

		const title = new Block({
			width: 1,
			height: 0.1,
			justifyContent: 'center',
			fontSize: 0.045,
			backgroundOpacity: 0,
			margin: 0.02,
		}).add(
			new Text({
				content: 'Powered by\nBlockade Labs',
			}),
		);

		const instruction = new Block({
			width: 1,
			height: 0.06,
			justifyContent: 'center',
			fontSize: 0.03,
			backgroundOpacity: 0,
			margin: 0.02,
		}).add(
			new Text({
				content: 'Ray to point, Trigger to select\nGrip to toggle UI',
			}),
		);

		this.generateButton = new Block({
			width: 0.5,
			height: 0.12,
			justifyContent: 'center',
			offset: 0.01,
			margin: 0.01,
			padding: 0,
			borderRadius: 0.03,
			backgroundColor: new THREE.Color(COLORS.button),
		});

		this.buttonText = new Text({ content: 'Generate', fontSize: 0.04 });

		this.generateButton.add(this.buttonText);
		this.generateButton.setupState({
			state: 'idle',
			attributes: {
				offset: 0.01,
				backgroundColor: new THREE.Color(COLORS.button),
				backgroundOpacity: 1,
			},
		});

		this.generateButton.setupState({
			state: 'hovered',
			attributes: {
				offset: 0.01,
				backgroundColor: new THREE.Color(COLORS.hovered),
				backgroundOpacity: 1,
			},
		});

		this.generateButton.setupState({
			state: 'selected',
			attributes: {
				offset: 0.005,
				backgroundColor: new THREE.Color(COLORS.selected),
				backgroundOpacity: 1,
			},
			onSet: () => {
				const raw = JSON.stringify({
					prompt: this.input.text.length > 0 ? this.input.text : 'nothing',
					styleId: PROMPT_CATEGORIES[this.category.key].styleId,
				});

				this.requestOptions.body = raw;

				fetch('https://api.countapi.xyz/hit/felixtrz-skybx/gen', {
					method: 'GET',
				});

				fetch(
					'https://assetforger.blockadelabs.com/api/skybox/generateSkyboxImage',
					this.requestOptions,
				)
					.then((response) => response.text())
					.then((result) => {
						const skyboxId = JSON.parse(result).id;
						this.skybox.requestedId = skyboxId;
						console.log('skybox generation requested', skyboxId);
					})
					.catch((error) => console.log('error', error));
			},
		});

		rightPanel.add(title, instruction, this.generateButton);
		this.ui.container.add(rightPanel);

		this.requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: null,
			redirect: 'follow',
		};

		this.wasGenerating = false;
	}

	update() {
		const rightController = this.core.controllers['right'];
		if (!rightController) return;

		const generating = this.skybox.currentId !== this.skybox.requestedId;
		if (generating && !this.wasGenerating) {
			this.buttonText.set({ content: 'Generating...' });
		} else if (!generating && this.wasGenerating) {
			this.buttonText.set({ content: 'Generate' });
		}
		this.wasGenerating = generating;

		if (generating) return;

		const intersects = this.ui.raycaster.intersectObject(
			this.generateButton,
			true,
		);
		const selectState = rightController.gamepad.getButtonUp(
			BUTTONS.XR_STANDARD.TRIGGER,
		);

		if (intersects.length > 0) {
			this.ui.raycaster.rayLength = Math.min(
				this.ui.raycaster.rayLength,
				intersects[0].distance,
			);
			if (selectState) {
				this.generateButton.setState('selected');
			} else {
				this.generateButton.setState('hovered');
			}
		} else {
			this.generateButton.setState('idle');
		}
	}
}

GenerateButtonSystem.queries = {
	ui: { components: [UIComponent] },
	input: { components: [KeyboardInputComponent] },
	category: { components: [CategoryComponent] },
	skybox: { components: [SkyboxComponent] },
};
