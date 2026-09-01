import { StatusDot } from "./StatusDot.jsx";

export default { title: "Domain/StatusDot", component: StatusDot };

export const Available = { args: { status: "available" } };
export const Limited = { args: { status: "limited" } };
export const Full = { args: { status: "full" } };
