-----------------------------------------------------------------------------
-- Filename:  V2__groups_and_members.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Create this table: groups
-----------------------------------------------------------------------------
create table groups
(
    id              integer         not null    default nextval('seq_table_ids'),
    name            varchar(100)    not null,
    password_hash   varchar(255)    not null,
    created_at      timestamp       not null    default now(),

    primary key (id),
    constraint uq_groups_name unique (name)
);
comment on table groups is 'The Groups table holds friend group boards, each protected by a shared password';


-----------------------------------------------------------------------------
-- Create this table: members
-----------------------------------------------------------------------------
create table members
(
    id              integer         not null    default nextval('seq_table_ids'),
    group_id        integer         not null,
    display_name    varchar(50)     not null,
    avatar          varchar(100)    not null,
    created_at      timestamp       not null    default now(),

    primary key (id),
    constraint fk_members_group_id   foreign key (group_id) references groups(id) on delete cascade,
    constraint uq_members_name_group unique (group_id, display_name)
);
comment on table members is 'The Members table holds trust-based identities within a group. Avatar stores JSON e.g. {"type":"emoji","value":"🐻"} or {"type":"color","value":"#FF5733"}';

create index ix_members_group_id on members(group_id);
