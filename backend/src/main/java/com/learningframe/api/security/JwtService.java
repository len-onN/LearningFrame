package com.learningframe.api.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long ttlSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${learningframe.jwt.secret}") String secret,
            @Value("${learningframe.jwt.ttl-seconds}") long ttlSeconds
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
    }

    public String issue(AppUser user) {
        Instant now = Instant.now();
        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getId().toString());
        payload.put("email", user.getEmail());
        payload.put("name", user.getDisplayName());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(ttlSeconds).getEpochSecond());

        String unsigned = encodeJson(header) + "." + encodeJson(payload);
        return unsigned + "." + sign(unsigned);
    }

    public AuthenticatedUser verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid token shape");
            }
            String unsigned = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(unsigned), parts[2])) {
                throw new IllegalArgumentException("Invalid signature");
            }
            Map<String, Object> payload = objectMapper.readValue(DECODER.decode(parts[1]), MAP_TYPE);
            long exp = ((Number) payload.get("exp")).longValue();
            if (Instant.now().getEpochSecond() >= exp) {
                throw new IllegalArgumentException("Expired token");
            }
            return new AuthenticatedUser(
                    Long.valueOf(payload.get("sub").toString()),
                    payload.get("email").toString(),
                    payload.get("name").toString()
            );
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token invalido ou expirado.");
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT serialization failed", exception);
        }
    }

    private String sign(String unsigned) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(unsigned.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT signing failed", exception);
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        if (left.length() != right.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < left.length(); i++) {
            result |= left.charAt(i) ^ right.charAt(i);
        }
        return result == 0;
    }
}
