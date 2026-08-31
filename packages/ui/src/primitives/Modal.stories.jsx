import { Modal } from "./Modal.jsx";

export default {
  title: "Primitives/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
};

export const Default = {
  args: {
    title: "Book this slot",
    subtitle: "Saturday, August 29 at 9:00 AM",
    onClose: () => {},
    children: "Modal body content goes here.",
  },
};
export const TitleOnly = {
  args: { title: "Book this slot", onClose: () => {}, children: "Modal body content goes here." },
};
