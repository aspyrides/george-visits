import { AppHeader } from "./AppHeader.jsx";

export default {
  title: "Domain/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
};

export const WithProfile = {
  args: {
    title: "Visit George",
    emoji: "👶",
    profileName: "Aunt Maria · Auntie",
    editLabel: "Edit",
    onEditProfile: () => {},
  },
};
export const NameOnly = {
  args: { title: "Visit George", emoji: "👶", profileName: "Aunt Maria", editLabel: "Edit", onEditProfile: () => {} },
};
export const NoProfile = { args: { title: "Visit George", emoji: "👶" } };
