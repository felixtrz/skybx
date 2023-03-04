import { BUTTONS, GameComponent, THREE, Types, XRGameSystem } from 'elixr';

import { COLORS } from './constants';
import { Keyboard } from 'three-mesh-ui';
import { UIComponent } from './UISystem';

export class KeyboardInputComponent extends GameComponent {}

KeyboardInputComponent.schema = {
	text: { type: Types.String, default: '' },
	changed: { type: Types.Boolean, default: false },
};

export class KeyboardSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.keyboard = new Keyboard({
			language: 'eng',
			fontFamily: 'assets/Roboto-msdf.json',
			fontTexture: 'assets/Roboto-msdf.png',
			fontSize: 0.035,
			backgroundColor: new THREE.Color(COLORS.keyboardBack),
			backgroundOpacity: 1,
			backspaceTexture: 'assets/backspace.png',
			shiftTexture: 'assets/shift.png',
			enterTexture: 'assets/enter.png',
		});
		this.keyboard.rotateX(-Math.PI / 6);
		this.ui.expandedUIContainer.add(this.keyboard);
		this.keyboard.position.set(0, -0.5, -1);
		this.keys = [];
		this.text = '';
		this.input = this.queryGameObjects('input')[0].getMutableComponent(
			KeyboardInputComponent,
		);

		this.keyboard.keys.forEach((key) => {
			this.keys.push(key);

			key.setupState({
				state: 'idle',
				attributes: {
					offset: 0,
					backgroundColor: new THREE.Color(COLORS.button),
					backgroundOpacity: 1,
				},
			});

			key.setupState({
				state: 'hovered',
				attributes: {
					offset: 0,
					backgroundColor: new THREE.Color(COLORS.hovered),
					backgroundOpacity: 1,
				},
			});

			key.setupState({
				state: 'selected',
				attributes: {
					offset: -0.009,
					backgroundColor: new THREE.Color(COLORS.selected),
					backgroundOpacity: 1,
				},
				onSet: () => {
					if (key.info.command) {
						switch (key.info.command) {
							case 'enter':
								this.input.text += '\n';
								break;
							case 'space':
								this.input.text += ' ';
								break;
							case 'backspace':
								if (!this.input.text.length) break;
								this.input.text = this.input.text.substring(
									0,
									this.input.text.length - 1,
								);
								break;
							case 'shift':
								this.keyboard.toggleCase();
								break;
						}
					} else if (key.info.input) {
						this.input.text += key.info.input;
					}
					this.input.changed = true;
				},
			});
		});
	}

	update() {
		this.input.changed = false;
		const rightController = this.core.controllers['right'];
		if (!rightController) return;

		const intersect = this.keys.reduce((closestIntersection, obj) => {
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

		const selectState = rightController.gamepad.getButtonUp(
			BUTTONS.XR_STANDARD.TRIGGER,
		);

		if (intersect && intersect.object.isUI) {
			this.ui.raycaster.rayLength = Math.min(
				this.ui.raycaster.rayLength,
				intersect.distance,
			);
			if (selectState && intersect.object.currentState === 'hovered') {
				if (intersect.object.states['selected'])
					intersect.object.setState('selected');
			} else if (!selectState) {
				if (intersect.object.states['hovered'])
					intersect.object.setState('hovered');
			}
		}

		this.keys.forEach((obj) => {
			if ((!intersect || obj !== intersect.object) && obj.isUI) {
				if (obj.states['idle']) obj.setState('idle');
			}
		});
	}
}

KeyboardSystem.queries = {
	ui: { components: [UIComponent] },
	input: { components: [KeyboardInputComponent] },
};
