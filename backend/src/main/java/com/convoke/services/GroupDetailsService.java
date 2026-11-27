package com.convoke.services;

import com.convoke.security.GroupPrincipal;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Loads a group (by name, case-insensitively) so Spring Security can verify the shared
 * group password. The BCrypt hash is exposed as the user's credentials.
 */
@Service
public class GroupDetailsService implements UserDetailsService {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public GroupDetailsService(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String name = username != null ? username.trim() : "";

        if (name.isEmpty()) {
            throw new UsernameNotFoundException("Group not found");
        }

        String sql = "SELECT id, name, password_hash FROM groups WHERE lower(name) = lower(:name)";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name);

        SqlRowSet rs = namedParameterJdbcTemplate.queryForRowSet(sql, params);

        if (!rs.next()) {
            throw new UsernameNotFoundException("Group not found");
        }

        return new GroupPrincipal(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("password_hash")
        );
    }
}
