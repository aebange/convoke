-----------------------------------------------------------------------------
-- Filename:  V7__drop_sessions.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Drop this table: sessions
-- Group authentication now uses stateless JWTs, so server-side session tokens
-- are no longer required.
-----------------------------------------------------------------------------
drop table if exists sessions;
