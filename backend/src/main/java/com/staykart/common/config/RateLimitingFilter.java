package com.staykart.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.staykart.common.dto.ErrorResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> bookingBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> uploadBuckets = new ConcurrentHashMap<>();

    private final long authCapacity;
    private final long bookingCapacity;
    private final long uploadCapacity;

    public RateLimitingFilter(
            ObjectMapper objectMapper,
            @Value("${app.rate-limit.auth-capacity:10}") long authCapacity,
            @Value("${app.rate-limit.booking-capacity:5}") long bookingCapacity,
            @Value("${app.rate-limit.upload-capacity:15}") long uploadCapacity) {
        this.objectMapper = objectMapper;
        this.authCapacity = authCapacity;
        this.bookingCapacity = bookingCapacity;
        this.uploadCapacity = uploadCapacity;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = resolveClientIp(request);

        Bucket bucket = null;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            bucket = authBuckets.computeIfAbsent(clientIp, k -> createBucket(authCapacity, Duration.ofMinutes(1)));
        } else if (path.equals("/api/bookings") && "POST".equalsIgnoreCase(method)) {
            bucket = bookingBuckets.computeIfAbsent(clientIp, k -> createBucket(bookingCapacity, Duration.ofMinutes(1)));
        } else if (path.contains("/images") && "POST".equalsIgnoreCase(method)) {
            bucket = uploadBuckets.computeIfAbsent(clientIp, k -> createBucket(uploadCapacity, Duration.ofMinutes(1)));
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ErrorResponse error = new ErrorResponse(
                OffsetDateTime.now(ZoneId.of("Asia/Kolkata")).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "RATE_LIMIT_EXCEEDED",
                "Too many requests. Please slow down and try again after a moment.",
                Collections.emptyList(),
                path
            );
            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket createBucket(long capacity, Duration duration) {
        Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(capacity, duration));
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
