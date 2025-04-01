package com.soundvaultpro.api.security;

import com.soundvaultpro.api.dto.UserDto;
import com.soundvaultpro.api.service.SupabaseService;
import com.soundvaultpro.api.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseAuthFilter extends OncePerRequestFilter {

    private final SupabaseService supabaseService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = extractTokenFromRequest(request);
        
        if (StringUtils.hasText(token)) {
            try {
                // Validate token with Supabase
                Map<String, Object> userData = supabaseService.validateToken(token);
                if (userData != null && userData.containsKey("sub")) {
                    String supabaseId = (String) userData.get("sub");
                    
                    // Try to find user in our database
                    UserDto user = userService.findBySupabaseId(supabaseId);
                    
                    if (user != null) {
                        // Create authentication object
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                        
                        // Set authentication in context
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.debug("User authenticated: {}", supabaseId);
                    } else {
                        log.warn("User with Supabase ID {} not found in database", supabaseId);
                    }
                }
            } catch (Exception e) {
                log.error("Could not authenticate user: {}", e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
