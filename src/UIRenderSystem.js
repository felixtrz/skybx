import { UIComponent } from './UISystem';
import { XRGameSystem } from 'elixr';
import { update as uiUpdate } from 'three-mesh-ui';

export class UIRenderSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
	}

	update() {
		uiUpdate();
		if (!this.ui.targetRay || !this.ui.marker) return;
		this.ui.targetRay.scale.set(1, 1, this.ui.raycaster.rayLength);
		if (this.ui.raycaster.rayLength < 2) {
			this.ui.marker.visible = true;
			this.ui.marker.position.z = -this.ui.raycaster.rayLength;
		} else {
			this.ui.marker.visible = false;
		}
	}
}

UIRenderSystem.queries = {
	ui: { components: [UIComponent] },
};
