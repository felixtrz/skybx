import { THREE, XRGameSystem } from 'elixr';

import { Block } from 'three-mesh-ui';
import { COLORS } from './constants';
import { UIComponent } from './UISystem';

export class BannerPanelSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);

		const textPanel = new Block({
			fontFamily: 'assets/Roboto-msdf.json',
			fontTexture: 'assets/Roboto-msdf.png',
			width: 1,
			height: 0.15,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 0.5,
			borderRadius: 0.03,
			textAlign: 'center',
			justifyContent: 'center',
		});
		textPanel.position.set(0, 0.03, -1.12);

		const title = new Block({
			height: 0.13,
			width: 0.92,
			margin: 0,
			padding: 0,
			textAlign: 'center',
		});

		new THREE.TextureLoader().load('assets/logo.png', (texture) => {
			title.set({ backgroundTexture: texture });
		});

		textPanel.add(title);
		this.ui.container.add(textPanel);
	}
}

BannerPanelSystem.queries = {
	ui: { components: [UIComponent] },
};
