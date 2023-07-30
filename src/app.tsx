import { useEffect, useRef, type CanvasHTMLAttributes, type FunctionComponent } from "react";
import "./app.css";

type FillStyle = string | CanvasGradient | CanvasPattern;
type Coordinates = {
	x: number;
	y: number;
};
type TriangleCoordinates = [Coordinates, Coordinates, Coordinates];

/**
 * Draws a triangle on the canvas.
 * @param context The canvas rendering context to draw on.
 * @param triangleCoordinates The coordinates of the triangle.
 * @param fillStyle The fill style to use for the triangle.
 */
const drawTriangle = (
	context: CanvasRenderingContext2D,
	triangleCoordinates: TriangleCoordinates,
	fillStyle: FillStyle
): void => {
	// Get the coordinates of the three points of the triangle.
	const [firstCoordinate, secondCoordinate, thirdCoordinate] = triangleCoordinates;

	// Set the fill style for the triangle.
	context.fillStyle = fillStyle;

	// Begin the path for the triangle and move to the first coordinate.
	context.beginPath();
	context.moveTo(firstCoordinate.x, firstCoordinate.y);

	// Draw lines to the second and third coordinates and fill the path.
	context.lineTo(secondCoordinate.x, secondCoordinate.y);
	context.lineTo(thirdCoordinate.x, thirdCoordinate.y);
	context.fill();
};

/**
 * Gets the real dimensions of the canvas.
 * @param context The canvas rendering context to get the dimensions from.
 * @returns An object containing the width and height of the canvas.
 */
const getRealDimensions = (context: CanvasRenderingContext2D): { width: number; height: number } => {
	// Get the bounding rectangle of the canvas.
	const { width, height } = context.canvas.getBoundingClientRect();

	// Get the device pixel ratio of the window.
	const { devicePixelRatio: ratio = 1 } = window;

	// Return the real dimensions of the canvas.
	return {
		width: width / ratio,
		height: height / ratio
	};
};

/**
 * Resizes the canvas to the display size.
 * @param context The canvas rendering context to resize.
 * @returns A boolean indicating whether the canvas was resized.
 */
const resizeCanvasToDisplaySize = (context: CanvasRenderingContext2D): boolean => {
	// Get the canvas element.
	const canvas = context.canvas;

	// Get the bounding rectangle of the canvas.
	const { width, height } = canvas.getBoundingClientRect();

	// Check if the canvas needs to be resized.
	if (canvas.width !== width || canvas.height !== height) {
		// Get the device pixel ratio of the window.
		const { devicePixelRatio: ratio = 1 } = window;

		// Resize the canvas and scale the context.
		canvas.width = width;
		canvas.height = height;
		context.scale(ratio, ratio);

		// Return true to indicate that the canvas was resized.
		return true;
	}

	// Return false to indicate that the canvas was not resized.
	return false;
};

/**
 * Recursively draws Sierpiński triangles within a bounding rectangle.
 * @param context The canvas rendering context to draw on.
 * @param boundingTriangle The coordinates of the bounding triangle.
 * @param fillStyle The fill style to use for the triangles.
 */
const drawSierpinskiTriangle = (
	context: CanvasRenderingContext2D,
	boundingTriangle: TriangleCoordinates,
	fillStyle: FillStyle
): void => {
	// Get the coordinates of the three points of the bounding triangle.
	const [firstCoordinate, secondCoordinate, thirdCoordinate] = boundingTriangle;

	// Calculate the coordinates of the three midpoints of the sides of the bounding triangle.
	const firstMiddleCoordinate: Coordinates = {
		x: (firstCoordinate.x + secondCoordinate.x) / 2,
		y: (firstCoordinate.y + secondCoordinate.y) / 2
	};
	const secondMiddleCoordinate: Coordinates = {
		x: (secondCoordinate.x + thirdCoordinate.x) / 2,
		y: (secondCoordinate.y + thirdCoordinate.y) / 2
	};
	const thirdMiddleCoordinate: Coordinates = {
		x: (thirdCoordinate.x + firstCoordinate.x) / 2,
		y: (thirdCoordinate.y + firstCoordinate.y) / 2
	};

	// Check if the width of the bounding rectangle is less than 1 pixel to finish this recursive call.
	const { devicePixelRatio: ratio = 1 } = window;
	if (firstMiddleCoordinate.x - secondCoordinate.x < 1 / ratio) {
		return;
	}

	// Calculate the coordinates of the three triangles that make up the Sierpiński triangle.
	const firstTriangleCoordinates: TriangleCoordinates = [
		firstCoordinate,
		firstMiddleCoordinate,
		thirdMiddleCoordinate
	];
	const secondTriangleCoordinates: TriangleCoordinates = [
		firstMiddleCoordinate,
		secondCoordinate,
		secondMiddleCoordinate
	];
	const thirdTriangleCoordinates: TriangleCoordinates = [
		thirdMiddleCoordinate,
		secondMiddleCoordinate,
		thirdCoordinate
	];

	// Draw the center triangle.
	const centerTriangle: TriangleCoordinates = [firstMiddleCoordinate, secondMiddleCoordinate, thirdMiddleCoordinate];
	drawTriangle(context, centerTriangle, fillStyle);

	// Recursively draw the three smaller triangles.
	drawSierpinskiTriangle(context, firstTriangleCoordinates, fillStyle);
	drawSierpinskiTriangle(context, secondTriangleCoordinates, fillStyle);
	drawSierpinskiTriangle(context, thirdTriangleCoordinates, fillStyle);
};

const Canvas: FunctionComponent<CanvasHTMLAttributes<HTMLCanvasElement>> = properties => {
	const canvasReference = useRef<HTMLCanvasElement>(null);

	// This useEffect hook calculates the coordinates of the base bounding triangle to draw Sierpiński triangle inside it.
	// It uses the canvasReference to get the canvas element and its context to draw on.
	// It also uses the resizeCanvasToDisplaySize and getRealDimensions functions to get the real dimensions of the canvas.
	// Finally, it draws the base bounding triangle and the Sierpiński triangle inside it.
	useEffect(() => {
		const canvas = canvasReference.current;
		const context = canvas?.getContext("2d");

		if (context) {
			// Resize the canvas to the display size.
			resizeCanvasToDisplaySize(context);

			// Get the real dimensions of the canvas.
			const { width, height } = getRealDimensions(context);

			// Calculate the height and base of the bounding triangle.
			const boundingTriangleHeight = Math.min(height, (Math.tan(Math.PI / 3) * width) / 2);
			const boundingTriangleBase = (boundingTriangleHeight * 2) / Math.tan(Math.PI / 3);

			// Calculate the coordinates of the base bounding triangle.
			const baseBoundingTriangleCoordinates: TriangleCoordinates = [
				{ x: width / 2, y: (height - boundingTriangleHeight) / 2 }, // top
				{ x: (width - boundingTriangleBase) / 2, y: height - (height - boundingTriangleHeight) / 2 }, // bottom left
				{ x: width - (width - boundingTriangleBase) / 2, y: height - (height - boundingTriangleHeight) / 2 } // bottom right
			];

			// Draw the base bounding triangle.
			drawTriangle(context, baseBoundingTriangleCoordinates, "black");

			// Draw the Sierpiński triangle inside the base bounding triangle.
			drawSierpinskiTriangle(context, baseBoundingTriangleCoordinates, "white");
		}
	}, []);
	return <canvas ref={canvasReference} {...properties} />;
};

export const App: FunctionComponent<Record<string, never>> = () => {
	return <Canvas className="canvas" />;
};
