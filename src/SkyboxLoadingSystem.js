import { GameComponent, GameSystem, THREE, Types } from 'elixr';

const SKYBOX_GEOMETRY = new THREE.SphereGeometry(500, 128, 128);
const ANIMATION_DURATION = 1;
const ANIMATION_STATES = {
	Ready: 'ready',
	Idle: 'idle',
	Vanishing: 'vanishing',
	Appearing: 'appearing',
};

const myHeaders = new Headers();
myHeaders.append('Accept', 'application/json, text/plain, */*');
myHeaders.append('Connection', 'keep-alive');
myHeaders.append('If-None-Match', 'W/"98-L7/uq9tatz+fUEzn0dhKgiyN1q4"');
myHeaders.append('Origin', 'https://skybox.blockadelabs.com');
myHeaders.append('Referer', 'https://skybox.blockadelabs.com/');

export class SkyboxComponent extends GameComponent {}

SkyboxComponent.schema = {
	currentId: {
		type: Types.String,
		default: '',
	},
	requestedId: {
		type: Types.String,
		default: 'a5e75cc559613840906e9d4ee1935589',
	},
};

export class SkyboxLoadingSystem extends GameSystem {
	init() {
		this.requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow',
		};
		this.fetchTimeout = 0;
		this.fetchInProgress = false;
		this.sphere = null;
		this.core.inlineCamera.far = 1000;
		this.mask = new THREE.Mesh(
			new THREE.IcosahedronGeometry(520, 2),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.BackSide,
			}),
		);
		this.mask.frustumCulled = false;
		this.core.scene.add(this.mask);
		this.newTexture = null;
		this.state = 'idle';
		this.prevState = 'idle';
		this.animationTimer = 0;
	}

	update(delta, _time) {
		this.fetchTimeout -= delta;
		const skyboxComponent = this.queryGameObjects(
			'game',
		)[0].getMutableComponent(SkyboxComponent);

		if (
			!this.fetchInProgress &&
			this.fetchTimeout <= 0 &&
			skyboxComponent.requestedId !== skyboxComponent.currentId
		) {
			console.log('fetching skybox', skyboxComponent.requestedId);
			this.fetchInProgress = true;
			fetch(
				'https://assetforger.blockadelabs.com/api/skybox/getSkyboxImage?id=' +
					skyboxComponent.requestedId,
				this.requestOptions,
			)
				.then((response) => response.text())
				.then((result) => {
					this.fetchInProgress = false;
					this.fetchTimeout = 2;
					const skyboxUrl = JSON.parse(result).file_url;
					if (skyboxUrl) {
						skyboxComponent.currentId = skyboxComponent.requestedId;
						const loader = new THREE.TextureLoader();
						loader.load(
							skyboxUrl,
							(texture) => {
								this.newTexture = texture;
								this.state = ANIMATION_STATES.Ready;
							},
							undefined,
							function () {
								console.error('An error happened.');
							},
						);

						loader.load(
							skyboxUrl,
							(texture) => {
								texture.mapping = THREE.EquirectangularReflectionMapping;
								this.core.scene.background = texture;
								this.core.scene.environment = texture;
							},
							undefined,
							function () {
								console.error('An error happened.');
							},
						);
					} else {
						console.log('skybox not ready', skyboxComponent.requestedId);
					}
				})
				.catch((error) => console.log('error', error));
		}

		if (this.state === ANIMATION_STATES.Ready) {
			this.state = ANIMATION_STATES.Vanishing;
			this.animationTimer = ANIMATION_DURATION;
		} else if (this.state === ANIMATION_STATES.Vanishing) {
			this.animationTimer -= delta;
			if (this.animationTimer <= 0) {
				this.state = ANIMATION_STATES.Appearing;
				this.animationTimer = ANIMATION_DURATION;

				if (this.sphere) {
					this.core.scene.remove(this.sphere);
				}
				const material = new THREE.MeshBasicMaterial({
					map: this.newTexture,
					side: THREE.BackSide,
				});
				this.sphere = new THREE.Mesh(SKYBOX_GEOMETRY, material);
				this.sphere.frustumCulled = false;
				this.core.scene.add(this.sphere);

				console.log('skybox loaded', skyboxComponent.currentId);
			} else {
				this.mask.scale.setScalar(
					(this.animationTimer / ANIMATION_DURATION) * 0.05 + 0.95,
				);
			}
		} else if (this.state === ANIMATION_STATES.Appearing) {
			this.animationTimer -= delta;
			if (this.animationTimer <= 0) {
				this.state = ANIMATION_STATES.Idle;
				this.mask.scale.setScalar(1);
			} else {
				this.mask.scale.setScalar(
					(1 - this.animationTimer / ANIMATION_DURATION) * 0.05 + 0.95,
				);
			}
		}
	}
}

SkyboxLoadingSystem.queries = {
	game: { components: [SkyboxComponent] },
};
