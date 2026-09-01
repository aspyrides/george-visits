import { Button } from "../primitives/Button.jsx";

export function AppHeader({ title, emoji, profileName, editLabel, onEditProfile }) {
  return (
    <header className="app-header">
      <div className="header-title">
        {emoji && <span className="emoji">{emoji}</span>}
        <h1>{title}</h1>
      </div>
      <div className="header-profile">
        {profileName && <span className="profile-badge">{profileName}</span>}
        {onEditProfile && (
          <Button variant="link" onClick={onEditProfile}>
            {editLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
