import { useCallback, useEffect, useRef, type CanvasHTMLAttributes, type FunctionComponent } from "react";

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
	// Create a reference to the canvas element.
	const canvasReference = useRef<HTMLCanvasElement>(null);

	// Create a reference to the current triangles being drawn.
	const currentTriangles = useRef<TriangleCoordinates[]>();

	// Create a reference to the canvas rendering context.
	const contextReference = useRef<CanvasRenderingContext2D>();

	// Create a reference to the last timestamp to display animation with given FPS.
	const lastTimeStampReference = useRef<number>();

	// Define a function to draw the Sierpiński triangles.
	const drawTriangles = useCallback(() => {
		// If there are current triangles and a canvas rendering context, draw the triangles.
		if (currentTriangles.current && currentTriangles.current.length > 0 && contextReference.current) {
			// Request the next animation frame.
			window.requestAnimationFrame(drawTriangles);

			// Get the current timestamp.
			const timestamp = Date.now();

			// If enough time has passed since the last frame, draw the triangles.
			if (timestamp - lastTimeStampReference.current! > 1000 / FPS) {
				// Draw the Sierpiński triangles inside the current base bounding triangles (next step of recursion).
				currentTriangles.current = drawSierpinskiTriangles(
					contextReference.current,
					TRIANGLES_COLOR,
					currentTriangles.current
				);

				// Update the last animation timestamp.
				lastTimeStampReference.current = Date.now();
			}
		}
	}, []);

	// Set up the canvas when the component mounts.
	useEffect(() => {
		// If there is no canvas rendering context, create one.
		if (!contextReference.current) {
			// Get the canvas element and its rendering context.
			const canvas = canvasReference.current;
			const context = canvas?.getContext("2d");

			// If there is a rendering context, set up the canvas.
			if (context) {
				// Set the canvas rendering context reference.
				contextReference.current = context;

				// Resize the canvas to the display size.
				resizeCanvasToDisplaySize(context);

				// Get the real dimensions of the canvas.
				const { width, height } = getRealDimensions(context);

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
				drawTriangle(context, baseBoundingTriangleCoordinates, BACKGROUND_COLOR);

				// Draw the initial Sierpiński triangle.
				currentTriangles.current = drawSierpinskiTriangle(
					context,
					baseBoundingTriangleCoordinates,
					TRIANGLES_COLOR
				);

				// Request the first animation frame.
				window.requestAnimationFrame(drawTriangles);

				// Set the initial timestamp to calculate next animated drawing.
				lastTimeStampReference.current = Date.now();
			}
		}
	}, [drawTriangles]);

	// Return the canvas element.
	return <canvas ref={canvasReference} {...properties} />;
};
