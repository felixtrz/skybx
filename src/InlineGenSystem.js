import { GameSystem } from 'elixr';
import { PROMPT_CATEGORIES } from './constants';
import { SkyboxComponent } from './SkyboxLoadingSystem';

const myHeaders = new Headers();
myHeaders.append('Accept', 'application/json, text/plain, */*');
myHeaders.append('Accept-Language', 'en-US,en;q=0.5');
myHeaders.append('Connection', 'keep-alive');
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Origin', 'https://skybox.blockadelabs.com');
myHeaders.append('Referer', 'https://skybox.blockadelabs.com/');
myHeaders.append('Sec-Fetch-Dest', 'empty');
myHeaders.append('Sec-Fetch-Mode', 'cors');
myHeaders.append('Sec-Fetch-Site', 'same-site');
myHeaders.append('Sec-GPC', '1');
myHeaders.append(
	'User-Agent',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
);
myHeaders.append(
	'sec-ch-ua',
	'"Chromium";v="110", "Not A(Brand";v="24", "Brave";v="110"',
);
myHeaders.append('sec-ch-ua-mobile', '?0');
myHeaders.append('sec-ch-ua-platform', '"macOS"');

export class InlineGenSystem extends GameSystem {
	init() {
		this.skybox = this.queryGameObjects('skybox')[0].getMutableComponent(
			SkyboxComponent,
		);
		const promptText = document.getElementById('prompt-text');
		this.promptSend = document.getElementById('prompt-send');
		this.promptSend.onclick = () => {
			const generating = this.skybox.currentId !== this.skybox.requestedId;
			if (generating) return;
			const raw = JSON.stringify({
				prompt: promptText.value.length > 0 ? promptText.value : 'nothing',
				styleId: PROMPT_CATEGORIES.none.styleId,
			});

			const requestOptions = {
				method: 'POST',
				headers: myHeaders,
				body: raw,
				redirect: 'follow',
			};

			fetch('https://api.countapi.xyz/hit/felixtrz-skybx/gen', {
				method: 'GET',
			});

			fetch(
				'https://assetforger.blockadelabs.com/api/skybox/generateSkyboxImage',
				requestOptions,
			)
				.then((response) => response.text())
				.then((result) => {
					const skyboxId = JSON.parse(result).id;
					this.skybox.requestedId = skyboxId;
					console.log('skybox generation requested', skyboxId);
				})
				.catch((error) => {
					console.log('error', error);
				});
		};
	}

	update() {
		const generating = this.skybox.currentId !== this.skybox.requestedId;
		this.promptSend.disabled = generating;
		const spinner = document.getElementById('gen-spinner');
		spinner.style.display = generating ? 'block' : 'none';
		const sendIcon = document.getElementById('send-icon');
		sendIcon.style.display = generating ? 'none' : 'block';
	}
}

InlineGenSystem.queries = {
	skybox: { components: [SkyboxComponent] },
};
