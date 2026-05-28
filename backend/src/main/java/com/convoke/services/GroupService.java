package com.convoke.services;

import com.convoke.models.groups.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class GroupService {

    private static final int NAME_MAX_LENGTH = 50;
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+$");

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder;

    public GroupService(NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                        BCryptPasswordEncoder passwordEncoder) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    public GetGroupDTO createGroup(CreateGroupDTO createGroupDTO) throws Exception {
        validateCreateGroupDTO(createGroupDTO);

        String name = createGroupDTO.getName().trim();
        String passwordHash = passwordEncoder.encode(createGroupDTO.getPassword());

        assertGroupNameAvailable(name);

        String sql = """
                INSERT INTO groups (name, password_hash)
                VALUES (:name, :passwordHash)
                RETURNING id, name, created_at
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name)
                .addValue("passwordHash", passwordHash);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        if (!rs.next()) {
            throw new RuntimeException("Group insert returned no row");
        }

        return mapRowToGetGroupDTO(rs);
    }

    public List<GetGroupDTO> getGroups() throws Exception {
        String sql = "SELECT id, name, created_at FROM groups ORDER BY created_at DESC";

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, new MapSqlParameterSource());

        List<GetGroupDTO> groups = new ArrayList<>();
        while (rs.next()) {
            groups.add(mapRowToGetGroupDTO(rs));
        }

        return groups;
    }

    public GetGroupNameAvailabilityDTO checkGroupName(String name) throws Exception {
        String trimmed = name != null ? name.trim() : "";

        if (trimmed.isEmpty()) {
            return new GetGroupNameAvailabilityDTO(trimmed, false, "Name is required");
        }
        if (trimmed.length() > NAME_MAX_LENGTH) {
            return new GetGroupNameAvailabilityDTO(trimmed, false, "Name must be " + NAME_MAX_LENGTH + " characters or fewer");
        }
        if (!NAME_PATTERN.matcher(trimmed).matches()) {
            return new GetGroupNameAvailabilityDTO(trimmed, false, "Name may only contain letters, numbers, hyphens, and underscores");
        }

        String sql = "SELECT id FROM groups WHERE name = :name";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", trimmed);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        if (rs.next()) {
            return new GetGroupNameAvailabilityDTO(trimmed, false, "That name is already taken");
        }

        return new GetGroupNameAvailabilityDTO(trimmed, true, "Name is available");
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private void validateCreateGroupDTO(CreateGroupDTO dto) throws Exception {
        String name = dto.getName() != null ? dto.getName().trim() : "";
        String password = dto.getPassword() != null ? dto.getPassword().trim() : "";

        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group name is required");
        }
        if (name.length() > NAME_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group name must be " + NAME_MAX_LENGTH + " characters or fewer");
        }
        if (!NAME_PATTERN.matcher(name).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group name may only contain letters, numbers, hyphens, and underscores");
        }
        if (password.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
    }

    private void assertGroupNameAvailable(String name) throws Exception {
        String sql = "SELECT id FROM groups WHERE name = :name";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        if (rs.next()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A group with that name already exists");
        }
    }

    private GetGroupDTO mapRowToGetGroupDTO(SqlRowSet rs) {
        GetGroupDTO dto = new GetGroupDTO();
        dto.setId(rs.getInt("id"));
        dto.setName(rs.getString("name"));
        dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return dto;
    }

    public GetGroupDetailDTO getGroup(String name) throws Exception {
        GetGroupDetailDTO group = fetchGroup(name);
        group.setMemberIds(fetchMemberIds(group.getId()));
        group.setEvents(fetchEvents(group.getId()));
        return group;
    }

    private GetGroupDetailDTO fetchGroup(String name) throws Exception {
        String sql = "SELECT id, name, created_at FROM groups WHERE name = :name";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        if (!rs.next()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found");
        }

        GetGroupDetailDTO dto = new GetGroupDetailDTO();
        dto.setId(rs.getInt("id"));
        dto.setName(rs.getString("name"));
        dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return dto;
    }

    private List<Integer> fetchMemberIds(int groupId) {
        String sql = "SELECT id FROM members WHERE group_id = :groupId ORDER BY created_at ASC";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("groupId", groupId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<Integer> memberIds = new ArrayList<>();
        while (rs.next()) {
            memberIds.add(rs.getInt("id"));
        }
        return memberIds;
    }

    private List<GetGroupEventDTO> fetchEvents(int groupId) {
        String sql = """
                SELECT id, created_by, title, description, status, confirmed_date_id, created_at, updated_at
                FROM events
                WHERE group_id = :groupId
                ORDER BY created_at DESC
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("groupId", groupId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<GetGroupEventDTO> events = new ArrayList<>();
        while (rs.next()) {
            GetGroupEventDTO event = new GetGroupEventDTO();
            event.setId(rs.getInt("id"));
            event.setCreatedBy(rs.getInt("created_by"));
            event.setTitle(rs.getString("title"));
            event.setDescription(rs.getString("description"));
            event.setStatus(rs.getString("status"));
            event.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            event.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

            int confirmedDateId = rs.getInt("confirmed_date_id");
            event.setConfirmedDateId(rs.wasNull() ? null : confirmedDateId);

            event.setDates(fetchEventDates(event.getId()));
            event.setRsvps(fetchEventRsvps(event.getId()));
            event.setComments(fetchEventComments(event.getId()));

            events.add(event);
        }
        return events;
    }

    private List<GetGroupEventDateDTO> fetchEventDates(int eventId) {
        String sql = "SELECT id, proposed_date FROM event_dates WHERE event_id = :eventId ORDER BY proposed_date ASC";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("eventId", eventId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<GetGroupEventDateDTO> dates = new ArrayList<>();
        while (rs.next()) {
            GetGroupEventDateDTO date = new GetGroupEventDateDTO();
            date.setId(rs.getInt("id"));
            date.setProposedDate(rs.getDate("proposed_date").toLocalDate());
            date.setVotes(fetchEventDateVotes(date.getId()));
            dates.add(date);
        }
        return dates;
    }

    private List<GetGroupEventDateVoteDTO> fetchEventDateVotes(int eventDateId) {
        String sql = "SELECT member_id, vote FROM event_date_votes WHERE event_date_id = :eventDateId";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("eventDateId", eventDateId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<GetGroupEventDateVoteDTO> votes = new ArrayList<>();
        while (rs.next()) {
            GetGroupEventDateVoteDTO vote = new GetGroupEventDateVoteDTO();
            vote.setMemberId(rs.getInt("member_id"));
            vote.setVote(rs.getString("vote"));
            votes.add(vote);
        }
        return votes;
    }

    private List<GetGroupEventRsvpDTO> fetchEventRsvps(int eventId) {
        String sql = "SELECT member_id, status FROM event_rsvps WHERE event_id = :eventId";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("eventId", eventId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<GetGroupEventRsvpDTO> rsvps = new ArrayList<>();
        while (rs.next()) {
            GetGroupEventRsvpDTO rsvp = new GetGroupEventRsvpDTO();
            rsvp.setMemberId(rs.getInt("member_id"));
            rsvp.setStatus(rs.getString("status"));
            rsvps.add(rsvp);
        }
        return rsvps;
    }

    private List<GetGroupEventCommentDTO> fetchEventComments(int eventId) {
        String sql = """
                SELECT id, member_id, body, created_at
                FROM comments
                WHERE event_id = :eventId
                ORDER BY created_at ASC
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("eventId", eventId);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        List<GetGroupEventCommentDTO> comments = new ArrayList<>();
        while (rs.next()) {
            GetGroupEventCommentDTO comment = new GetGroupEventCommentDTO();
            comment.setId(rs.getInt("id"));
            comment.setMemberId(rs.getInt("member_id"));
            comment.setBody(rs.getString("body"));
            comment.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            comments.add(comment);
        }
        return comments;
    }
}
