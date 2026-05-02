-----------------------------------------------------------------------------
-- Filename:  V3__sessions.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Create this table: sessions
-----------------------------------------------------------------------------
create table sessions
(
    id              integer         not null    default nextval('seq_table_ids'),
    group_id        integer         not null,
    token           varchar(64)     not null,
    created_at      timestamp       not null    default now(),
    expires_at      timestamp       not null,

    primary key (id),
    constraint fk_sessions_group_id  foreign key (group_id) references groups(id) on delete cascade,
    constraint uq_sessions_token     unique (token)
);
comment on table sessions is 'The Sessions table holds active group session tokens issued on successful password verification';

create index ix_sessions_token    on sessions(token);
create index ix_sessions_group_id on sessions(group_id);
