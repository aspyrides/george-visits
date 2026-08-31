import { Toast } from "./Toast.jsx";

export default {
  title: "Primitives/Toast",
  component: Toast,
  parameters: { layout: "fullscreen" },
};

export const Success = { args: { message: "Visit booked!" } };
export const Error = { args: { message: "Sorry, that slot just filled up.", tone: "error" } };
