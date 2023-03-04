import { Block, Text } from 'three-mesh-ui';
import { COLORS, PROMPT_CATEGORIES } from './constants';
import { GameComponent, THREE, Types, XRGameSystem } from 'elixr';

import { UIComponent } from './UISystem';

export class CategoryComponent extends GameComponent {}

CategoryComponent.schema = {
	key: { type: Types.String, default: '' },
};

export class CategoryPanelSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.category = this.queryGameObjects('category')[0].getMutableComponent(
			CategoryComponent,
		);
		const categoryPanel = new Block({
			fontFamily: 'assets/Roboto-msdf.json',
			fontTexture: 'assets/Roboto-msdf.png',
			width: 0.4,
			height: 0.41,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 0.8,
			borderRadius: 0.03,
			justifyContent: 'center',
		});
		categoryPanel.rotateY(Math.PI / 8);
		this.ui.expandedUIContainer.add(categoryPanel);
		categoryPanel.position.set(-0.695, -0.1, -1.04);

		const buttonOptions = {
			width: 0.17,
			height: 0.055,
			justifyContent: 'center',
			offset: 0.001,
			margin: 0.005,
			padding: 0,
			borderRadius: 0.02,
			backgroundColor: new THREE.Color(COLORS.button),
		};

		this.buttons = [];

		Object.keys(PROMPT_CATEGORIES).forEach((category) => {
			const button = new Block(buttonOptions);
			button.add(
				new Text({ content: category, fontSize: 0.04, offset: 0.001 }),
			);

			button.setupState({
				state: 'idle',
				attributes: {
					offset: 0.01,
					backgroundColor: new THREE.Color(COLORS.button),
					backgroundOpacity: 1,
				},
			});

			button.setupState({
				state: 'hovered',
				attributes: {
					offset: 0.01,
					backgroundColor: new THREE.Color(COLORS.hovered),
					backgroundOpacity: 1,
				},
			});

			button.setupState({
				state: 'selected',
				attributes: {
					offset: 0.005,
					backgroundColor: new THREE.Color(COLORS.selected),
					backgroundOpacity: 1,
				},
				onSet: () => {
					this.category.key = category;
				},
			});
			this.buttons.push(button);
		});

		const rowConfig = {
			height: 0.065,
			width: 1,
			offset: 0,
			contentDirection: 'row',
			justifyContent: 'center',
			backgroundOpacity: 0,
		};

		categoryPanel.add(
			new Block(rowConfig).add(this.buttons[0], this.buttons[1]),
			new Block(rowConfig).add(this.buttons[2], this.buttons[3]),
			new Block(rowConfig).add(this.buttons[4], this.buttons[5]),
			new Block(rowConfig).add(this.buttons[6], this.buttons[7]),
			new Block(rowConfig).add(this.buttons[8], this.buttons[9]),
			new Block(rowConfig).add(this.buttons[10], this.buttons[11]),
		);

		this.selectedButton = this.buttons[0];
		this.buttons[0].setState('selected');
	}

	update() {
		const intersect = this.buttons.reduce((closestIntersection, obj) => {
			const intersection = this.ui.raycaster.intersectObject(obj, true);
			if (!intersection[0]) return closestIntersection;
			if (
				!closestIntersection ||
				intersection[0].distance < closestIntersection.distance
			) {
				intersection[0].object = obj;
				return intersection[0];
			}
			return closestIntersection;
		}, null);

		if (intersect && intersect.object.isUI) {
			this.ui.raycaster.rayLength = Math.min(
				this.ui.raycaster.rayLength,
				intersect.distance,
			);
			if (intersect.object !== this.selectedButton) {
				if (this.ui.selecting && intersect.object.currentState === 'hovered') {
					if (intersect.object.states['selected']) {
						intersect.object.setState('selected');
						this.selectedButton?.setState('idle');
						this.selectedButton = intersect.object;
					}
				} else if (!this.ui.selecting) {
					if (intersect.object.states['hovered'])
						intersect.object.setState('hovered');
				}
			}
		}

		this.buttons.forEach((obj) => {
			if (
				obj.currentState !== 'selected' &&
				(!intersect || obj !== intersect.object) &&
				obj.states['idle']
			) {
				if (obj.states['idle']) obj.setState('idle');
			}
		});
	}
}

CategoryPanelSystem.queries = {
	ui: { components: [UIComponent] },
	category: { components: [CategoryComponent] },
};
