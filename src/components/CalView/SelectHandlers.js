import Event from "../../model/Event.js";
import * as Utils from "../../utils/Misc.js"

let prevClickX = -1;
let prevClickY = -1;

let borderDrag = 0;

function getComponentCoordinates(e, component) {
	const bounds = component.getBoundingClientRect()
	return [
		e.clientX - bounds.left,
		e.clientY - bounds.top,
	]
}

export const mouseDown = (component) => {
	return (e) => {

		[prevClickX, prevClickY] = getComponentCoordinates(e, component.topLayerRef.current)
	}
}

export const mouseMove = (component) => {
	return (e) => {
		if (prevClickX == -1 || prevClickY == -1)
			return;
		if (e.buttons == 1) {
			const canvas = component.topLayerRef.current;
			const context = canvas.getContext("2d");
			context.setLineDash([10, 10]);
			context.clearRect(0, 0, canvas.width, canvas.height);
			const [currX, currY] = getComponentCoordinates(e, canvas)
			context.strokeRect(prevClickX, prevClickY, currX - prevClickX, currY - prevClickY);
		}
	}
}

export const mouseUp = (component) => {
	return (e) => {
		if (prevClickX == -1 || prevClickY == -1)
			return;
		const canvas2 = component.topLayerRef.current;
		const context2 = canvas2.getContext("2d");
		context2.clearRect(0, 0, canvas2.width, canvas2.height)

		const [width, height] = component.getCanvasActualSize(component.topLayerRef.current)

		const colWidth = width / 7;

		const [currX, currY] = getComponentCoordinates(e, component.topLayerRef.current)

		if (currX > component.eventLPadding && (currX < width + component.eventLPadding) &&
			(Math.floor((currX - component.eventLPadding) / colWidth) === Math.floor((prevClickX - component.eventLPadding) / colWidth))) {

			const [minX, minY, , maxY] = Utils.normalizeRect(prevClickX, currX, prevClickY, currY);
			component.cal.addEvent(new Event(
				Math.floor((minX - component.eventLPadding) / colWidth) + 1,
				Math.max((minY - component.eventTPadding) / height * 10, 0),
				Math.min((maxY - component.eventTPadding) / height * 10, 10)));
			component.drawCal();
			component.setState({ forceRender: true })

		}

		//console.log(e.clientX);

		prevClickY = -1;
		prevClickX = -1;
	}
}

export const dragHandler = (component) => {
	return (event) => {
		console.log(component.cal[event.target.key])
	}
}

export const handleBorders = () => {
	return (event) => {

		const borderThickness = 6;

		const eventBox = event.currentTarget.getBoundingClientRect()

		const innerDiv = event.currentTarget.children[0].style
		if (event.clientY <= eventBox.y + borderThickness) {
			innerDiv.borderTop = "5px solid black"
			innerDiv.borderRadius = "0 0 10px 10px"
			innerDiv.backgroundColor = "var(--mfdarkgray)"
			document.body.style.cursor = 'row-resize';
		}
		else if (event.clientY >= eventBox.y + eventBox.height - borderThickness) {
			innerDiv.borderBottom = "5px solid black"
			innerDiv.borderRadius = "10px 10px 0 0"
			innerDiv.backgroundColor = "var(--mfdarkgray)"
			document.body.style.cursor = 'row-resize';
		}
		else {
			event.target.style.backgroundColor = "black"
			innerDiv.border = "5px solid transparent"
			innerDiv.borderRadius = "10px"
			document.body.style.cursor = 'default';
		}
	}
}
export const handleMouseLeave = () => {
	return (event) => {
		document.body.style.cursor = 'default'
		const innerDiv = event.currentTarget.children[0].style
		innerDiv.backgroundColor = "var(--mfdarkgray)"
		innerDiv.border = "5px solid transparent"
		innerDiv.borderRadius = "10px"
	}
}