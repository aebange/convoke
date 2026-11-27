package com.convoke.services;

import com.convoke.security.GroupPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupDetailsServiceTest {

    @Mock
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @InjectMocks
    private GroupDetailsService groupDetailsService;

    @Test
    void loadsGroupByName() {
        SqlRowSet rowSet = mock(SqlRowSet.class);
        when(namedParameterJdbcTemplate.queryForRowSet(anyString(), any(SqlParameterSource.class)))
                .thenReturn(rowSet);
        when(rowSet.next()).thenReturn(true);
        when(rowSet.getInt("id")).thenReturn(5);
        when(rowSet.getString("name")).thenReturn("MyGroup");
        when(rowSet.getString("password_hash")).thenReturn("$2a$10$hash");

        UserDetails details = groupDetailsService.loadUserByUsername("  mygroup  ");

        assertTrue(details instanceof GroupPrincipal);
        GroupPrincipal principal = (GroupPrincipal) details;
        assertEquals(5, principal.getId());
        assertEquals("MyGroup", principal.getName());
        assertEquals("MyGroup", principal.getUsername());
        assertEquals("$2a$10$hash", principal.getPassword());

        ArgumentCaptor<SqlParameterSource> paramsCaptor = ArgumentCaptor.forClass(SqlParameterSource.class);
        verify(namedParameterJdbcTemplate).queryForRowSet(anyString(), paramsCaptor.capture());
        assertEquals("mygroup", paramsCaptor.getValue().getValue("name"));
    }

    @Test
    void throwsWhenGroupNotFound() {
        SqlRowSet rowSet = mock(SqlRowSet.class);
        when(namedParameterJdbcTemplate.queryForRowSet(anyString(), any(SqlParameterSource.class)))
                .thenReturn(rowSet);
        when(rowSet.next()).thenReturn(false);

        assertThrows(UsernameNotFoundException.class,
                () -> groupDetailsService.loadUserByUsername("missing"));
    }

    @Test
    void throwsWhenUsernameIsBlank() {
        assertThrows(UsernameNotFoundException.class,
                () -> groupDetailsService.loadUserByUsername("   "));
    }
}
