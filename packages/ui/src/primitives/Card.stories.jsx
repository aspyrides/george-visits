import { Card } from "./Card.jsx";

export default { title: "Primitives/Card", component: Card };

export const Default = { args: { children: "Card content" } };
export const Centered = { args: { centered: true, children: "Centered card content" } };
