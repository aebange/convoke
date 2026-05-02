-----------------------------------------------------------------------------
-- Filename:  V5__comments.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Create this table: comments
-----------------------------------------------------------------------------
create table comments
(
    id          integer     not null    default nextval('seq_table_ids'),
    event_id    integer     not null,
    member_id   integer     not null,
    body        text        not null,
    created_at  timestamp   not null    default now(),

    primary key (id),
    constraint fk_comments_event_id     foreign key (event_id)  references events(id)  on delete cascade,
    constraint fk_comments_member_id    foreign key (member_id) references members(id) on delete cascade
);
comment on table comments is 'The Comments table holds flat comment threads on events';

create index ix_comments_event_id on comments(event_id);
