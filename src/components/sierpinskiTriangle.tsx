import { useCallback, useEffect, useRef, type CanvasHTMLAttributes, type FunctionComponent } from "react";
import { useAnimation } from "../hooks/useAnimation";
import { useCanvas } from "../hooks/useCanvas";
import { drawTriangle, type Coordinates, type FillStyle, type TriangleCoordinates } from "../util/canvasUtil";
import "./sierpinskiTriangle.scss";

/**
 * Recursively draws Sierpiński triangles within a bounding triangle.
 * @param context The canvas rendering context to draw on.
 * @param boundingTriangle The coordinates of the bounding triangle.
 * @param fillStyle The fill style to use for the triangles.
 * @returns An array of three triangle coordinates that make up the Sierpiński triangle.
 */
const drawSierpinskiTriangle = (
	context: CanvasRenderingContext2D,
	boundingTriangle: TriangleCoordinates,
	fillStyle: FillStyle
): [TriangleCoordinates, TriangleCoordinates, TriangleCoordinates] | undefined => {
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

	// Check if the width of the bounding triangle is less than 1 pixel to finish this recursive call.
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

	return [firstTriangleCoordinates, secondTriangleCoordinates, thirdTriangleCoordinates];
};

/**
 * Recursively draws Sierpiński triangles within an array of bounding triangles. It used on the inner recursion steps to be able to use animated representation of the process.
 * @param context The canvas rendering context to draw on.
 * @param fillStyle The fill style to use for the triangles.
 * @param boundingTriangles An optional array of triangle coordinates that make up the bounding triangles.
 * @returns An array of triangle coordinates that make up the Sierpiński triangle.
 */
const drawSierpinskiTriangles = (
	context: CanvasRenderingContext2D,
	fillStyle: FillStyle,
	boundingTriangles?: TriangleCoordinates[]
): TriangleCoordinates[] | undefined =>
	// If there are bounding triangles, recursively draw Sierpiński triangles within each bounding triangle.
	boundingTriangles?.reduce(
		(currentBoundingTriangles: TriangleCoordinates[], boundingTriangle: TriangleCoordinates) => [
			...currentBoundingTriangles,
			...(drawSierpinskiTriangle(context, boundingTriangle, fillStyle) ?? [])
		],
		[]
	);

// Set the frames per second for the animation.
const FPS = 2;
// Define the background color for the base triangle.
const BACKGROUND_COLOR: FillStyle = "darkslategray";
// Define the fill style for the inner Sierpiński triangles.
const TRIANGLES_COLOR: FillStyle = "snow";

// Define a canvas component that draws Sierpiński triangles.
export const SierpinskiTriangle: FunctionComponent<CanvasHTMLAttributes<HTMLCanvasElement>> = properties => {
	// Create a reference to the current triangles being drawn.
	const currentTriangles = useRef<TriangleCoordinates[]>();

	const [canvasReference, contextReference, width, height] = useCanvas();

	// Define a function to draw the Sierpiński triangles.
	const drawTriangles = useCallback(() => {
		// If there are current triangles and a canvas rendering context, draw the triangles.
		if (currentTriangles.current && currentTriangles.current.length > 0 && contextReference.current) {
			// Draw the Sierpiński triangles inside the current base bounding triangles (next step of recursion).
			currentTriangles.current = drawSierpinskiTriangles(
				contextReference.current,
				TRIANGLES_COLOR,
				currentTriangles.current
			);
			return true;
		}
		return false;
	}, [contextReference]);

	const startAnimation = useAnimation(drawTriangles, FPS);

	// Set up the canvas when the component mounts.
	useEffect(() => {
		if (contextReference.current && width && height) {
			// Calculate the height and base of the bounding triangle.
			const boundingTriangleHeight = Math.min(height, (Math.tan(Math.PI / 3) * width) / 2);
			const boundingTriangleBase = (boundingTriangleHeight * 2) / Math.tan(Math.PI / 3);

			// Calculate the coordinates of the base bounding triangle to place it in the center of canvas.
			const baseBoundingTriangleCoordinates: TriangleCoordinates = [
				{ x: width / 2, y: (height - boundingTriangleHeight) / 2 }, // top
				{ x: (width - boundingTriangleBase) / 2, y: height - (height - boundingTriangleHeight) / 2 }, // bottom left
				{ x: width - (width - boundingTriangleBase) / 2, y: height - (height - boundingTriangleHeight) / 2 } // bottom right
			];

			// Draw the base bounding triangle.
			drawTriangle(contextReference.current, baseBoundingTriangleCoordinates, BACKGROUND_COLOR);

			// Draw the initial Sierpiński triangle.
			currentTriangles.current = drawSierpinskiTriangle(
				contextReference.current,
				baseBoundingTriangleCoordinates,
				TRIANGLES_COLOR
			);

			startAnimation();
		}
	}, [contextReference, height, startAnimation, width]);

	// Return the canvas element.
	return <canvas className="sierpinski-triangle-canvas" ref={canvasReference} {...properties} />;
};
