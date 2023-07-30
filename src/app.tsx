import { useEffect, useRef, type CanvasHTMLAttributes, type FunctionComponent, type RefObject } from "react";
import "./app.css";

type DrawFunction = (context: CanvasRenderingContext2D, frameCount: number) => void;

const draw = (context: CanvasRenderingContext2D, frameCount: number): void => {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.fillStyle = "#FFFFFF";
	context.beginPath();
	context.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
	context.fill();
};

const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): boolean => {
	const { width, height } = canvas.getBoundingClientRect();

	if (canvas.width !== width || canvas.height !== height) {
		const { devicePixelRatio: ratio = 1 } = window;
		canvas.width = width;
		canvas.height = height;
		context.scale(ratio, ratio);
		return true; // here you can return some useful information like delta width and delta height instead of just true
		// this information can be used in the next redraw...
	}

	return false;
};

type CanvasProperties = {
	draw: DrawFunction;
} & CanvasHTMLAttributes<HTMLCanvasElement>;

const useCanvas = (draw: DrawFunction): RefObject<HTMLCanvasElement> => {
	const canvasReference = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let frameCount = 0;
		let animationFrameId: number | undefined;

		const canvas = canvasReference.current;

		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				const render = (): void => {
					frameCount++;
					resizeCanvasToDisplaySize(canvas, context);
					draw(context, frameCount);
					animationFrameId = window.requestAnimationFrame(render);
				};
				render();
			}
		}

		return (): void => {
			if (animationFrameId) {
				window.cancelAnimationFrame(animationFrameId);
			}
		};
	}, [draw]);

	return canvasReference;
};

const Canvas: FunctionComponent<CanvasProperties> = properties => {
	const { draw, ...rest } = properties;
	const canvasReference = useCanvas(draw);

	return <canvas ref={canvasReference} {...rest} />;
};

export const App: FunctionComponent<Record<string, never>> = () => {
	return <Canvas draw={draw} className="canvas" />;
};
