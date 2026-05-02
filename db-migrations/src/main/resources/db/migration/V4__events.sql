-----------------------------------------------------------------------------
-- Filename:  V4__events.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Create this table: events
-----------------------------------------------------------------------------
create table events
(
    id                  integer         not null    default nextval('seq_table_ids'),
    group_id            integer         not null,
    created_by          integer         not null,
    title               varchar(200)    not null,
    description         text                null,
    status              varchar(20)     not null    default 'PROPOSED',
    confirmed_date_id   integer             null,
    created_at          timestamp       not null    default now(),
    updated_at          timestamp       not null    default now(),

    primary key (id),
    constraint fk_events_group_id       foreign key (group_id)   references groups(id)  on delete cascade,
    constraint fk_events_created_by     foreign key (created_by) references members(id) on delete restrict,
    constraint ck_events_status         check (status in ('PROPOSED', 'CONFIRMED'))
);
comment on table events is 'The Events table holds proposed and confirmed group events';

create index ix_events_group_id on events(group_id);
create index ix_events_status   on events(status);


-----------------------------------------------------------------------------
-- Create this table: event_dates
-----------------------------------------------------------------------------
create table event_dates
(
    id              integer     not null    default nextval('seq_table_ids'),
    event_id        integer     not null,
    proposed_date   date        not null,

    primary key (id),
    constraint fk_event_dates_event_id  foreign key (event_id) references events(id) on delete cascade,
    constraint uq_event_dates           unique (event_id, proposed_date)
);
comment on table event_dates is 'The Event Dates table holds candidate dates proposed for an event';

create index ix_event_dates_event_id on event_dates(event_id);


-- Add the confirmed_date_id FK now that event_dates exists
alter table events
    add constraint fk_events_confirmed_date_id
    foreign key (confirmed_date_id) references event_dates(id) on delete set null;


-----------------------------------------------------------------------------
-- Create this table: event_date_votes
-----------------------------------------------------------------------------
create table event_date_votes
(
    id              integer     not null    default nextval('seq_table_ids'),
    event_date_id   integer     not null,
    member_id       integer     not null,
    vote            varchar(10) not null,

    primary key (id),
    constraint fk_event_date_votes_date_id      foreign key (event_date_id) references event_dates(id) on delete cascade,
    constraint fk_event_date_votes_member_id    foreign key (member_id)     references members(id)     on delete cascade,
    constraint uq_event_date_votes              unique (event_date_id, member_id),
    constraint ck_event_date_votes_vote         check (vote in ('YES', 'MAYBE', 'NO'))
);
comment on table event_date_votes is 'The Event Date Votes table holds per-member votes on each proposed event date';

create index ix_event_date_votes_date_id   on event_date_votes(event_date_id);
create index ix_event_date_votes_member_id on event_date_votes(member_id);


-----------------------------------------------------------------------------
-- Create this table: event_rsvps
-----------------------------------------------------------------------------
create table event_rsvps
(
    id          integer     not null    default nextval('seq_table_ids'),
    event_id    integer     not null,
    member_id   integer     not null,
    status      varchar(20) not null,

    primary key (id),
    constraint fk_event_rsvps_event_id      foreign key (event_id)  references events(id)  on delete cascade,
    constraint fk_event_rsvps_member_id     foreign key (member_id) references members(id) on delete cascade,
    constraint uq_event_rsvps               unique (event_id, member_id),
    constraint ck_event_rsvps_status        check (status in ('GOING', 'NOT_GOING', 'MAYBE'))
);
comment on table event_rsvps is 'The Event RSVPs table holds per-member attendance confirmations for confirmed events';

create index ix_event_rsvps_event_id  on event_rsvps(event_id);
create index ix_event_rsvps_member_id on event_rsvps(member_id);
