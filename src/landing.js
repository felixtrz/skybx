export const landingPageLogic = () => {
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
