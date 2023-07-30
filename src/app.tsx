import type { FunctionComponent } from "react";
import "./app.css";
import { SierpinskiTriangle } from "./sierpinskiTriangle";

export const App: FunctionComponent<Record<string, never>> = () => {
	return <SierpinskiTriangle className="canvas" />;
};
