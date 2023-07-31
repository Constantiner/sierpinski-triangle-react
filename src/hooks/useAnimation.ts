import { useCallback, useEffect, useRef } from "react";

/**
 * A callback function that returns a boolean value indicating whether the animation should continue.
 */
type AnimationCallback = () => boolean;

/**
 * A custom React hook that performs an animation with a given FPS using a callback function.
 * @param animationCallback A callback function that returns a boolean value indicating whether the animation should continue.
 * @param fps The number of frames per second to display the animation.
 * @returns A function that starts the animation.
 */
export const useAnimation = (animationCallback: AnimationCallback, fps: number): VoidFunction => {
	// Create a reference to the last timestamp to display animation with given FPS.
	const lastTimestampReference = useRef<number>();

	// Create a reference to the animation callback function.
	const animationCallbackReference = useRef<AnimationCallback>();

	// Update the animation callback reference when the animationCallback prop changes.
	useEffect(() => {
		animationCallbackReference.current = animationCallback;
	}, [animationCallback]);

	// Create a reference to the FPS value.
	const fpsReference = useRef<number>();

	// Update the FPS reference when the fps prop changes.
	useEffect(() => {
		fpsReference.current = fps;
	}, [fps]);

	/**
	 * A function that performs the animation with a given FPS using the callback function.
	 */
	const performAnimation = useCallback(() => {
		// Get the current timestamp.
		const currentTimestamp = Date.now();

		let shouldContinue = true;

		// If enough time has passed since the last frame, call the callback function.
		if (currentTimestamp - lastTimestampReference.current! > 1000 / fpsReference.current!) {
			shouldContinue = animationCallbackReference.current!();

			// Update the last animation timestamp.
			lastTimestampReference.current = Date.now();
		}

		if (shouldContinue) {
			// Request the next animation frame.
			window.requestAnimationFrame(performAnimation);
		}
	}, []);

	/**
	 * A function that starts the animation.
	 */
	const startAnimation = useCallback(() => {
		// Request the first animation frame.
		window.requestAnimationFrame(performAnimation);

		// Set the initial timestamp to calculate next animated drawing.
		lastTimestampReference.current = Date.now();
	}, [performAnimation]);

	return startAnimation;
};
