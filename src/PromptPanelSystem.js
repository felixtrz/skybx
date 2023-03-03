import { Block, Text } from 'three-mesh-ui';
import { THREE, XRGameSystem } from 'elixr';

import { COLORS } from './constants';
import { KeyboardInputComponent } from './KeyboardSystem';
import { UIComponent } from './UISystem';

export class PromptPanelSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.input = this.queryGameObjects('input')[0].getComponent(
			KeyboardInputComponent,
		);
		const textPanel = new Block({
			fontFamily: 'assets/Roboto-msdf.json',
			fontTexture: 'assets/Roboto-msdf.png',
			width: 1,
			height: 0.25,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 0.8,
			borderRadius: 0.03,
		});
		textPanel.position.set(0, -0.18, -1.12);

		const title = new Block({
			width: 1,
			height: 0.1,
			justifyContent: 'center',
			fontSize: 0.045,
			backgroundOpacity: 0,
		}).add(new Text({ content: 'Dream up your world:' }));

		this.userText = new Text({ content: '' });

		const textField = new Block({
			width: 1,
			height: 0.4,
			fontSize: 0.033,
			padding: 0.02,
			backgroundOpacity: 0,
		}).add(this.userText);

		textPanel.add(title, textField);
		this.ui.container.add(textPanel);
	}

	update() {
		if (this.input.changed) {
			this.userText.set({ content: this.input.text });
		}
	}
}

PromptPanelSystem.queries = {
	ui: { components: [UIComponent] },
	input: { components: [KeyboardInputComponent] },
};
