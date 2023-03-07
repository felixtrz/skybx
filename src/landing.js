export const landingPageLogic = () => {
	const uiPanel = document.getElementById('ui-panel');
	const inlineButton = document.getElementById('2d-button');
	const promptGroup = document.getElementById('prompt-group');
	inlineButton.onclick = () => {
		uiPanel.style.transform = `translateY(${uiPanel.offsetHeight}px)`;
		promptGroup.style.opacity = 0.9;
	};
	const exitPromptButton = document.getElementById('exit-prompt');
	exitPromptButton.onclick = () => {
		uiPanel.style.transform = `translateY(0px)`;
		promptGroup.style.opacity = 0;
	};
	const webLaunchButton = document.getElementById('web-launch-button');
	webLaunchButton.onclick = () => {
		window.open(
			'https://www.oculus.com/open_url/?url=' +
				encodeURIComponent(window.location.href),
		);
	};
	const foldLinksButton = document.getElementById('fold-links');
	const foldLinksVerticalLine = foldLinksButton.getElementsByClassName(
		'fold-vertical-line',
	)[0];
	const linksPanel = document.getElementsByClassName('links-panel')[0];
	foldLinksButton.onclick = () => {
		if (foldLinksVerticalLine.style.display === 'none') {
			linksPanel.style.display = 'none';
			foldLinksVerticalLine.style.display = 'block';
		} else {
			linksPanel.style.display = 'block';
			foldLinksVerticalLine.style.display = 'none';
		}
	};
	fetch('https://api.countapi.xyz/hit/felixtrz-skybx/visit', {
		method: 'GET',
	});

	fetchVisitCount();
	setInterval(fetchVisitCount, 5000);

	fetchGenCount();
	setInterval(fetchGenCount, 5000);
};

const fetchVisitCount = () => {
	const visitCounter = document.getElementById('visit-counter');
	fetch('https://api.countapi.xyz/get/felixtrz-skybx/visit', {
		method: 'GET',
	})
		.then((response) => response.json())
		.then((result) => {
			visitCounter.innerHTML = result.value;
		})
		.catch((error) => console.log('error', error));
};

const fetchGenCount = () => {
	const genCounter = document.getElementById('gen-counter');
	fetch('https://api.countapi.xyz/get/felixtrz-skybx/gen', {
		method: 'GET',
	})
		.then((response) => response.json())
		.then((result) => {
			genCounter.innerHTML = result.value;
		})
		.catch((error) => console.log('error', error));
};
