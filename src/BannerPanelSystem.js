import { THREE, XRGameSystem } from 'elixr';

import { Block } from 'three-mesh-ui';
import { COLORS } from './constants';
import { SkyboxComponent } from './SkyboxLoadingSystem';
import { UIComponent } from './UISystem';
import { updateButtons } from './buttonUtil';

const GENERATE_ICON_ROTATION_SPEED = -Math.PI;
const EXPANDED_POSITION = new THREE.Vector3(0, 0.045, -1.12);
const EXPANDED_QUATERNION = new THREE.Quaternion();
const COLLAPSED_POSITION = new THREE.Vector3(0, -0.6, -0.8);
const MENU_BAR_STATE = {
	EXPANDED: 'expanded',
	COLLAPSED: 'collapsed',
	EXPANDING: 'expanding',
	COLLAPSING: 'collapsing',
};
const CONVERGE_THRESHOLD = 0.001;

export class BannerPanelSystem extends XRGameSystem {
	init() {
		this.ui = this.queryGameObjects('ui')[0].getMutableComponent(UIComponent);
		this.skybox = this.queryGameObjects('skybox')[0].getComponent(
			SkyboxComponent,
		);

		const textureLoader = new THREE.TextureLoader();

		const menuBar = new Block({
			width: 1,
			height: 0.12,
			backgroundOpacity: 0,
			margin: 0,
			padding: 0,
			justifyContent: 'center',
			borderRadius: 0,
			contentDirection: 'row',
		});
		menuBar.position.copy(EXPANDED_POSITION);

		const bannerPanel = new Block({
			width: 0.74,
			height: 0.12,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 0.5,
			borderRadius: 0.03,
			textAlign: 'center',
			justifyContent: 'center',
			offset: 0.001,
		});

		const title = new Block({
			height: 0.1,
			width: 0.66,
			margin: 0,
			padding: 0,
			textAlign: 'center',
			borderRadius: 0,
			offset: 0.001,
		});

		textureLoader.load('assets/logo.png', (texture) => {
			title.set({ backgroundTexture: texture });
		});

		bannerPanel.add(title);

		const squareButtonConfig = {
			height: 0.12,
			width: 0.12,
			backgroundColor: new THREE.Color(COLORS.panelBack),
			backgroundOpacity: 0.5,
			borderRadius: 0.03,
			textAlign: 'center',
			justifyContent: 'center',
			margin: 0.01,
			offset: 0.001,
		};

		const buttonIconConfig = {
			height: 0.1,
			width: 0.1,
			margin: 0,
			padding: 0,
			textAlign: 'center',
			justifyContent: 'center',
			borderRadius: 0,
			offset: 0.001,
		};

		this.statusBlock = this._createStatusBlock(
			textureLoader,
			squareButtonConfig,
			buttonIconConfig,
		);

		this.resizeButton = this._createResizeButton(
			textureLoader,
			squareButtonConfig,
			buttonIconConfig,
		);

		menuBar.add(this.statusBlock, bannerPanel, this.resizeButton);
		this.ui.container.add(menuBar);
		this.buttons = [this.resizeButton];
		this.menuBar = menuBar;

		this.wasGenerating = true;
	}

	_createStatusBlock(textureLoader, squareButtonConfig, buttonIconConfig) {
		const statusBlock = new Block(squareButtonConfig);
		statusBlock.icon = new Block(JSON.parse(JSON.stringify(buttonIconConfig)));
		statusBlock.add(statusBlock.icon);

		textureLoader.load('assets/check-lg.png', (texture) => {
			statusBlock.readyIconTexture = texture;
		});

		textureLoader.load('assets/arrow-repeat.png', (texture) => {
			statusBlock.generatingIconTexture = texture;
		});

		return statusBlock;
	}

	_createResizeButton(textureLoader, squareButtonConfig, buttonIconConfig) {
		const resizeButton = new Block(squareButtonConfig);
		const icon = new Block(JSON.parse(JSON.stringify(buttonIconConfig)));
		resizeButton.add(icon);
		resizeButton.isExpanded = true;

		textureLoader.load('assets/arrows-angle-contract.png', (texture) => {
			resizeButton.contractIconTexture = texture;
			icon.set({ backgroundTexture: texture });
		});

		textureLoader.load('assets/arrows-angle-expand.png', (texture) => {
			resizeButton.expandIconTexture = texture;
		});

		resizeButton.setupState({
			state: 'idle',
			attributes: {
				backgroundOpacity: 0.5,
			},
		});

		resizeButton.setupState({
			state: 'hovered',
			attributes: {
				backgroundOpacity: 0.7,
			},
		});

		resizeButton.setupState({
			state: 'selected',
			attributes: {
				backgroundOpacity: 1,
			},
			onSet: () => {
				if (resizeButton.isExpanded) {
					icon.set({ backgroundTexture: resizeButton.expandIconTexture });
					this.ui.expandedUIContainer.visible = false;
					this.ui.expandedUIContainer.position.set(0, 0, -100);
				} else {
					icon.set({ backgroundTexture: resizeButton.contractIconTexture });
				}
				resizeButton.isExpanded = !resizeButton.isExpanded;
			},
		});

		return resizeButton;
	}

	update(delta) {
		this._updateStatusBlock(delta);
		updateButtons(this.buttons, this.ui);
		let menuBarState = '';
		if (this.resizeButton.isExpanded) {
			menuBarState =
				this.menuBar.position.distanceTo(EXPANDED_POSITION) > CONVERGE_THRESHOLD
					? MENU_BAR_STATE.EXPANDING
					: MENU_BAR_STATE.EXPANDED;
		} else {
			menuBarState =
				this.menuBar.position.distanceTo(COLLAPSED_POSITION) >
				CONVERGE_THRESHOLD
					? MENU_BAR_STATE.COLLAPSING
					: MENU_BAR_STATE.COLLAPSED;
		}

		switch (menuBarState) {
			case MENU_BAR_STATE.EXPANDING:
				this.menuBar.position.lerp(EXPANDED_POSITION, 0.1);
				this.menuBar.quaternion.slerp(EXPANDED_QUATERNION, 0.1);
				break;
			case MENU_BAR_STATE.EXPANDED:
				if (this.menuBar.state !== MENU_BAR_STATE.EXPANDED) {
					this.menuBar.position.copy(EXPANDED_POSITION);
					this.menuBar.quaternion.copy(EXPANDED_QUATERNION);
					this.ui.expandedUIContainer.visible = true;
					this.ui.expandedUIContainer.position.set(0, 0, 0);
				}
				break;
			case MENU_BAR_STATE.COLLAPSING:
				this.menuBar.position.lerp(COLLAPSED_POSITION, 0.1);
				this.menuBar.lookAt(this.core.playerHead.position);
				break;
			case MENU_BAR_STATE.COLLAPSED:
				if (this.menuBar.state !== MENU_BAR_STATE.COLLAPSED) {
					this.menuBar.position.copy(COLLAPSED_POSITION);
				}
				break;
		}
	}

	_updateStatusBlock(delta) {
		const generating = this.skybox.currentId !== this.skybox.requestedId;
		if (generating && !this.wasGenerating) {
			this.statusBlock.icon.set({
				backgroundTexture: this.statusBlock.generatingIconTexture,
			});
		} else if (!generating && this.wasGenerating) {
			this.statusBlock.icon.quaternion.set(0, 0, 0, 1);
			this.statusBlock.icon.set({
				backgroundTexture: this.statusBlock.readyIconTexture,
			});
		}
		if (generating) {
			this.statusBlock.icon.rotateZ(delta * GENERATE_ICON_ROTATION_SPEED);
		}
		this.wasGenerating = generating;
	}
}

BannerPanelSystem.queries = {
	ui: { components: [UIComponent] },
	skybox: { components: [SkyboxComponent] },
};
