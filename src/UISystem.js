import { BUTTONS, GameComponent, THREE, Types, XRGameSystem } from 'elixr';

import { applyPDScalar } from './pdAccelerations';

const Y_DIFF_THRESHOLD = 0.1;
const Y_CONVERGE_THRESHOLD = 0.01;

export class UIComponent extends GameComponent {}

UIComponent.schema = {
	container: { type: Types.Ref, default: null },
	expandedUIContainer: { type: Types.Ref, default: null },
	raycaster: { type: Types.Ref, default: null },
	targetRay: { type: Types.Ref, default: null },
	marker: { type: Types.Ref, default: null },
	selecting: { type: Types.Boolean, default: false },
};

export class UISystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.ui.container = new THREE.Group();
		this.ui.expandedUIContainer = new THREE.Group();
		this.ui.container.add(this.ui.expandedUIContainer);
		this.ui.container.position.set(0, 1.7, 0);
		this.ui.raycaster = new THREE.Raycaster();
		this.ui.raycaster.far = 2;
		this.isFollowing = false;
		this.followingSpeed = 0;
		this.ui.targetRay = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(0, 0, 0),
				new THREE.Vector3(0, 0, -1),
			]),
			new THREE.LineBasicMaterial({
				color: 0xffffff,
			}),
		);
		this.ui.marker = new THREE.Mesh(
			new THREE.SphereGeometry(0.008, 32, 32),
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
			}),
		);
		this.activeController = null;
	}

	initXR() {
		this.core.playerSpace.add(this.ui.container);
	}

	exitXR() {
		this.core.playerSpace.remove(this.ui.container);
	}

	update(delta, _time) {
		this._updateUIContainer(delta);

		const rightController = this.core.controllers['right'];
		const leftController = this.core.controllers['left'];
		this.ui.selecting = false;
		let actvieControllerChanged = false;
		if (rightController?.gamepad.getButtonUp(BUTTONS.XR_STANDARD.TRIGGER)) {
			actvieControllerChanged = this.activeController !== rightController;
			this.activeController = rightController;
			this.ui.selecting = true;
		} else if (
			leftController?.gamepad.getButtonUp(BUTTONS.XR_STANDARD.TRIGGER)
		) {
			actvieControllerChanged = this.activeController !== leftController;
			this.activeController = leftController;
			this.ui.selecting = true;
		} else if (!this.activeController) {
			this.activeController = rightController ?? leftController ?? null;
			if (this.activeController) {
				actvieControllerChanged = true;
			}
		}

		if (!this.activeController) return;

		if (actvieControllerChanged) {
			this.activeController.targetRaySpace.add(this.ui.targetRay);
			this.activeController.targetRaySpace.add(this.ui.marker);
		}

		this.ui.raycaster.set(
			this.activeController.targetRaySpace.getWorldPosition(
				new THREE.Vector3(),
			),
			this.activeController.targetRaySpace
				.getWorldDirection(new THREE.Vector3())
				.negate(),
		);
		this.ui.raycaster.rayLength = 2;
	}

	_updateUIContainer(delta) {
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
