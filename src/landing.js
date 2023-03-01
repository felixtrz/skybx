export const landingPageLogic = () => {
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
};
