import { BUTTONS, GameComponent, THREE, Types, XRGameSystem } from 'elixr';

export class UIComponent extends GameComponent {}

UIComponent.schema = {
	container: { type: Types.Ref, default: null },
	raycaster: { type: Types.Ref, default: null },
};

export class UISystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.ui.container = new THREE.Group();
		this.ui.container.position.set(0, 1.1, -1);
		this.ui.raycaster = new THREE.Raycaster();
		this.ui.raycaster.far = 2;
	}

	update() {
		const rightController = this.core.controllers['right'];
		if (!rightController) return;

		if (!this.ui.container.parent) {
			this.core.scene.add(this.ui.container);
		}
		if (!rightController.targetRay) {
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -2], 3),
			);
			geometry.setAttribute(
				'color',
				new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3),
			);
			const material = new THREE.LineBasicMaterial({
				vertexColors: true,
				blending: THREE.AdditiveBlending,
			});

			rightController.targetRay = new THREE.Line(geometry, material);
			rightController.targetRaySpace.add(rightController.targetRay);
		}

		this.ui.raycaster.set(
			rightController.targetRaySpace.getWorldPosition(new THREE.Vector3()),
			rightController.targetRaySpace
				.getWorldDirection(new THREE.Vector3())
				.negate(),
		);

		if (rightController.gamepad.getButtonDown(BUTTONS.XR_STANDARD.SQUEEZE)) {
			if (this.ui.container.position.x > 100) {
				this.ui.container.position.x = 0;
			} else {
				this.ui.container.position.x = 1000;
			}
		}
	}
}

UISystem.queries = {
	ui: { components: [UIComponent] },
};
