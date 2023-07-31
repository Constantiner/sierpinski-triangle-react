import { useEffect, useRef, useState, type RefObject } from "react";
import { getRealDimensions, resizeCanvasToDisplaySize } from "../util/canvasUtil";

type Dimensions = {
	width: number;
	height: number;
};

/**
 * This custom hook creates and sets up a canvas element in a React component.
 * @returns A tuple containing the canvas reference, context reference, width, and height.
 */
export const useCanvas = (): [
	canvasReference: RefObject<HTMLCanvasElement>,
	contextReference: RefObject<CanvasRenderingContext2D | undefined>,
	width: number | undefined,
	height: number | undefined
] => {
	// Create a reference to the canvas element.
	const canvasReference = useRef<HTMLCanvasElement>(null);

	// Create a reference to the canvas rendering context.
	const contextReference = useRef<CanvasRenderingContext2D>();

	const [dimensions, setDimensions] = useState<Dimensions>();

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
				setDimensions({ width, height });
			}
		}
	}, []);

	return [canvasReference, contextReference, dimensions?.width, dimensions?.height];
};
