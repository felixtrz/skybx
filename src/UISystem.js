import { BUTTONS, GameComponent, THREE, Types, XRGameSystem } from 'elixr';

import { applyPDScalar } from './pdAccelerations';

const Y_DIFF_THRESHOLD = 0.1;
const Y_CONVERGE_THRESHOLD = 0.01;

export class UIComponent extends GameComponent {}

UIComponent.schema = {
	container: { type: Types.Ref, default: null },
	raycaster: { type: Types.Ref, default: null },
	targetRay: { type: Types.Ref, default: null },
	marker: { type: Types.Ref, default: null },
};

export class UISystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.ui.container = new THREE.Group();
		this.ui.container.position.set(0, 1.7, 0);
		this.ui.raycaster = new THREE.Raycaster();
		this.ui.raycaster.far = 2;
		this.isFollowing = false;
		this.followingSpeed = 0;
		this.ui.marker = new THREE.Mesh(
			new THREE.SphereGeometry(0.008, 32, 32),
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
			}),
		);
	}

	update(delta, _time) {
		const rightController = this.core.controllers['right'];
		if (!rightController) return;

		if (!this.ui.container.parent) {
			this.core.playerSpace.add(this.ui.container);
		}
		if (!this.ui.targetRay) {
			const material = new THREE.LineBasicMaterial({
				color: 0xffffff,
			});

			const points = [];
			points.push(new THREE.Vector3(0, 0, 0));
			points.push(new THREE.Vector3(0, 0, -1));

			const geometry = new THREE.BufferGeometry().setFromPoints(points);

			this.ui.targetRay = new THREE.Line(geometry, material);
			rightController.targetRaySpace.add(this.ui.targetRay);
			rightController.targetRaySpace.add(this.ui.marker);
		}

		this.ui.raycaster.set(
			rightController.targetRaySpace.getWorldPosition(new THREE.Vector3()),
			rightController.targetRaySpace
				.getWorldDirection(new THREE.Vector3())
				.negate(),
		);
		this.ui.raycaster.rayLength = 2;

		if (rightController.gamepad.getButtonDown(BUTTONS.XR_STANDARD.SQUEEZE)) {
			if (this.ui.container.position.x > 100) {
				this.ui.container.position.x = 0;
			} else {
				this.ui.container.position.x = 1000;
			}
		}

		if (
			!this.isFollowing &&
			Math.abs(this.ui.container.position.y - this.core.playerHead.position.y) >
				Y_DIFF_THRESHOLD
		) {
			this.isFollowing = true;
		}

		if (this.isFollowing) {
			const [newSpeed, newY] = applyPDScalar(
				this.ui.container.position.y,
				this.followingSpeed,
				this.core.playerHead.position.y,
				0,
				0.8,
				1,
				delta,
			);
			this.ui.container.position.y = newY;
			this.followingSpeed = newSpeed;
			if (
				Math.abs(
					this.ui.container.position.y - this.core.playerHead.position.y,
				) < Y_CONVERGE_THRESHOLD
			) {
				this.isFollowing = false;
			}
		}
	}
}

UISystem.queries = {
	ui: { components: [UIComponent] },
};
