import type { FunctionComponent } from "react";
import "./app.scss";
import { GithubLink } from "./components/githubLink";
import { SierpinskiTriangle } from "./components/sierpinskiTriangle";

export const App: FunctionComponent<Record<string, never>> = () => {
	return (
		<main className="sierpinski-triangle">
			<SierpinskiTriangle />
			<GithubLink />
		</main>
	);
};
