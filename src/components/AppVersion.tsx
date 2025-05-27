import React from 'react';

interface AppVersionProps { version: string; }

export const AppVersion: React.FC<AppVersionProps> = ({ version }) => {
  return (
    <div className="version-display">
      Version: <b>{version}</b>
    </div>
  );
};