-----------------------------------------------------------------------------
-- Filename:  V6__member_event_views.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Create this table: member_event_views
-----------------------------------------------------------------------------
create table member_event_views
(
    id          integer     not null    default nextval('seq_table_ids'),
    member_id   integer     not null,
    event_id    integer     not null,
    viewed_at   timestamp   not null    default now(),

    primary key (id),
    constraint fk_member_event_views_member_id  foreign key (member_id) references members(id) on delete cascade,
    constraint fk_member_event_views_event_id   foreign key (event_id)  references events(id)  on delete cascade,
    constraint uq_member_event_views            unique (member_id, event_id)
);
comment on table member_event_views is 'The Member Event Views table tracks when each member last viewed an event, used to surface unseen activity indicators on the board';

create index ix_member_event_views_member_id on member_event_views(member_id);
create index ix_member_event_views_event_id  on member_event_views(event_id);
