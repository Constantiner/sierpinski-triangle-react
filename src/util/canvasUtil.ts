// The fill style for a canvas element can be a string, a CanvasGradient object, or a CanvasPattern object.
export type FillStyle = string | CanvasGradient | CanvasPattern;

// The coordinates of a point on the canvas.
export type Coordinates = {
	x: number; // The x-coordinate of the point.
	y: number; // The y-coordinate of the point.
};

// The coordinates of the three points of a triangle on the canvas.
export type TriangleCoordinates = [Coordinates, Coordinates, Coordinates];

/**
 * Draws a triangle on the canvas.
 * @param context The canvas rendering context to draw on.
 * @param triangleCoordinates The coordinates of the triangle.
 * @param fillStyle The fill style to use for the triangle.
 */
export const drawTriangle = (
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
export const getRealDimensions = (context: CanvasRenderingContext2D): { width: number; height: number } => {
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
export const resizeCanvasToDisplaySize = (context: CanvasRenderingContext2D): boolean => {
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
