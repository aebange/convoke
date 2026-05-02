-----------------------------------------------------------------------------
-- Filename:  V1.0__baseline.sql
-----------------------------------------------------------------------------

-- Create sequences used for  ids and for transactions
Create sequence seq_table_ids increment by 1 START WITH 5000;
Create sequence seq_transaction_ids increment by 1 START WITH 1000;


-----------------------------------------------------------------------------
-- Create this table:  system_parameters
-----------------------------------------------------------------------------
create table system_parameters
(
    name              varchar(100)    not null,
    value             varchar         not null,
    primary key(name)
);
comment on table system_parameters is 'This table holds certain system parameters and data -- e.g., when the niss data was last refreshed';



-----------------------------------------------------------------------------
-- Create this table:  exceptions
-----------------------------------------------------------------------------
create table exceptions
(
    id               integer      not null,
    app_name         varchar(100) not null,
    app_version      varchar(100) not null,
    url              varchar(200) not null,
    event_date       timestamp    not null,
    message          text             null,
    cause            text             null,
    stack_trace      text             null,
    primary key(id)
);
comment on table exceptions is 'The Exceptions table holds information about exceptions raised during web app operation';

-- Add an index so that filtering on this table by event_date runs faster
create index on exceptions(event_date);
;