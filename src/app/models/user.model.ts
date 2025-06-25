export interface SteamUser {
  steamid: string;
  username: string;
  displayName: string;
  avatar: {
    small: string;
    medium: string;
    full: string;
  };
  profile: string;
  _json?: {
    personastate?: number;
    lastlogoff?: number;
    timecreated?: number;
    loccountrycode?: string;
    locstatecode?: string;
    loccityid?: string;
  };
}
