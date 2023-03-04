export const updateButtons = (buttons, uiComponent) => {
	const intersect = buttons.reduce((closestIntersection, obj) => {
		const intersection = uiComponent.raycaster.intersectObject(obj, true);
		if (!intersection[0]) return closestIntersection;
		if (
			!closestIntersection ||
			intersection[0].distance < closestIntersection.distance
		) {
			intersection[0].object = obj;
			return intersection[0];
		}
		return closestIntersection;
	}, null);

	if (intersect && intersect.object.isUI) {
		uiComponent.raycaster.rayLength = Math.min(
			uiComponent.raycaster.rayLength,
			intersect.distance,
		);
		if (uiComponent.selecting && intersect.object.currentState === 'hovered') {
			if (intersect.object.states['selected'])
				intersect.object.setState('selected');
		} else if (!uiComponent.selecting) {
			if (intersect.object.states['hovered'])
				intersect.object.setState('hovered');
		}
	}

	buttons.forEach((obj) => {
		if ((!intersect || obj !== intersect.object) && obj.isUI) {
			if (obj.states['idle']) obj.setState('idle');
		}
	});
};
