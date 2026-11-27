package com.convoke.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "3rs1PJDRvUbfiE69leG8gCWeTF1UL9BM/CRfKCIblfE=";

    private final JwtService jwtService = new JwtService(SECRET, 30);

    @Test
    void issuesAndParsesToken() {
        String token = jwtService.issue(42, "MyGroup");

        Claims claims = jwtService.parse(token);

        assertEquals("42", claims.getSubject());
        assertEquals(42, claims.get("groupId", Integer.class));
        assertEquals("MyGroup", claims.get("groupName", String.class));
        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }

    @Test
    void mapsClaimsToPrincipal() {
        Claims claims = jwtService.parse(jwtService.issue(7, "Foo"));

        GroupPrincipal principal = jwtService.toPrincipal(claims);

        assertEquals(7, principal.getId());
        assertEquals("Foo", principal.getName());
        assertEquals("ROLE_GROUP", principal.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void rejectsExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now - 7_200_000);
        Date expiresAt = new Date(now - 3_600_000);

        String expired = Jwts.builder()
                .subject("1")
                .claim("groupId", 1)
                .claim("groupName", "MyGroup")
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(key)
                .compact();

        assertThrows(JwtException.class, () -> jwtService.parse(expired));
    }

    @Test
    void rejectsTamperedSignature() {
        String token = jwtService.issue(1, "MyGroup");
        String[] parts = token.split("\\.");
        String signature = parts[2];

        // Flip a character in the middle of the signature so every affected byte differs
        // (altering the final base64url char can be a no-op because its low bits are padding).
        int middle = signature.length() / 2;
        char original = signature.charAt(middle);
        char replacement = original == 'A' ? 'B' : 'A';
        String tamperedSignature = signature.substring(0, middle)
                + replacement
                + signature.substring(middle + 1);
        String tampered = parts[0] + "." + parts[1] + "." + tamperedSignature;

        assertThrows(JwtException.class, () -> jwtService.parse(tampered));
    }

    @Test
    void rejectsTokenSignedWithDifferentKey() {
        String otherSecret = Base64.getEncoder()
                .encodeToString("abcdefghijklmnopqrstuvwxyz012345".getBytes(StandardCharsets.UTF_8));
        JwtService otherService = new JwtService(otherSecret, 30);

        String token = otherService.issue(1, "MyGroup");

        assertThrows(JwtException.class, () -> jwtService.parse(token));
    }
}
