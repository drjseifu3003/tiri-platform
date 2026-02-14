export type SessionRole = "ADMIN" | "STAFF";

export type SessionUser = {
  id: string;
  phone: string;
  role: SessionRole;
  studioId: string;
};

export type SessionStudio = {
  id: string;
  name: string;
};

export type SessionData = {
  user: SessionUser;
  studio: SessionStudio | null;
};

export type LoginPayload = {
  phone: string;
  password: string;
};
