package com.convoke.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Issues and validates HS256 JWTs carrying the group id and group name.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMillis;

    public JwtService(@Value("${convoke.jwt.secret}") String secret,
                      @Value("${convoke.jwt.expiration-days:30}") long expirationDays) {
        byte[] decoded = Base64.getDecoder().decode(secret);
        this.key = Keys.hmacShaKeyFor(decoded);
        this.expirationMillis = TimeUnit.DAYS.toMillis(expirationDays);
    }

    public String issue(int groupId, String groupName) {
        Date now = new Date();

        return Jwts.builder()
                .subject(String.valueOf(groupId))
                .claim("groupId", groupId)
                .claim("groupName", groupName)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMillis))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public GroupPrincipal toPrincipal(Claims claims) {
        Number groupId = claims.get("groupId", Number.class);
        String groupName = claims.get("groupName", String.class);

        if (groupId == null || groupName == null) {
            throw new IllegalArgumentException("Token is missing required claims");
        }

        return new GroupPrincipal(groupId.intValue(), groupName, null);
    }
}
