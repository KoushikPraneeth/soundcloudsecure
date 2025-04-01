package com.soundvaultpro.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.soundvaultpro.api.config.SupabaseConfig;
import com.soundvaultpro.api.dto.UserDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class SupabaseService {

    private final RestTemplate restTemplate;
    private final SupabaseConfig supabaseConfig;
    private final ObjectMapper objectMapper;

    public SupabaseService(RestTemplate restTemplate, SupabaseConfig supabaseConfig, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.supabaseConfig = supabaseConfig;
        this.objectMapper = objectMapper;
    }

    /**
     * Save user profile and encryption keys to Supabase
     */
    public UserDto saveUserProfile(String supabaseId, String email, String name, String profilePicture, 
                                  String publicKey, String encryptedPrivateKey) {
        try {
            HttpHeaders headers = createHeaders();
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("id", supabaseId);
            requestBody.put("email", email);
            requestBody.put("name", name);
            
            if (profilePicture != null) {
                requestBody.put("profile_picture", profilePicture);
            }
            
            if (publicKey != null) {
                requestBody.put("public_key", publicKey);
            }
            
            if (encryptedPrivateKey != null) {
                requestBody.put("encrypted_private_key", encryptedPrivateKey);
            }
            
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            // Upsert the user profile (insert if not exists, update if exists)
            String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/user_profiles?on_conflict=id";
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            // Parse the response and return as UserDto
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return UserDto.builder()
                    .id(Long.parseLong(supabaseId))
                    .email(email)
                    .name(name)
                    .profilePicture(profilePicture)
                    .publicKey(publicKey)
                    .build();
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Get user profile from Supabase by supabaseId
     */
    public UserDto getUserProfile(String supabaseId) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/user_profiles?id=eq." + supabaseId;
        ResponseEntity<String> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            String.class
        );
        
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            if (jsonNode.isArray() && jsonNode.size() > 0) {
                JsonNode userNode = jsonNode.get(0);
                return UserDto.builder()
                        .id(Long.parseLong(userNode.get("id").asText()))
                        .email(userNode.get("email").asText())
                        .name(userNode.get("name").asText())
                        .profilePicture(userNode.has("profile_picture") ? userNode.get("profile_picture").asText() : null)
                        .publicKey(userNode.has("public_key") ? userNode.get("public_key").asText() : null)
                        .build();
            }
            return null;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Save user encryption keys to Supabase
     */
    public UserDto saveUserKeys(String supabaseId, String publicKey, String encryptedPrivateKey) {
        try {
            HttpHeaders headers = createHeaders();
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("public_key", publicKey);
            requestBody.put("encrypted_private_key", encryptedPrivateKey);
            
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            // Update the user profile with the keys
            String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/user_profiles?id=eq." + supabaseId;
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.PATCH, 
                entity, 
                String.class
            );
            
            // Get the updated user profile
            return getUserProfile(supabaseId);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Create HTTP headers for Supabase API requests
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseConfig.getSupabaseKey());
        headers.set("Authorization", "Bearer " + supabaseConfig.getSupabaseKey());
        headers.set("Content-Type", "application/json");
        headers.set("Prefer", "return=representation");
        return headers;
    }
    
    /**
     * Validate a JWT token from Supabase
     * @param token The JWT token to validate
     * @return Map containing the JWT claims if token is valid, null otherwise
     */
    public Map<String, Object> validateToken(String token) {
        try {
            // Parse the token
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            
            // Decode the payload
            String payload = parts[1];
            String decodedPayload = new String(Base64.getUrlDecoder().decode(payload));
            Map<String, Object> claims = objectMapper.readValue(decodedPayload, Map.class);
            
            // TODO: Add proper JWT validation with JWK verification
            // For now, just check if the token is expired
            if (claims.containsKey("exp")) {
                long expTime = ((Number) claims.get("exp")).longValue();
                long currentTime = System.currentTimeMillis() / 1000;
                
                if (currentTime > expTime) {
                    return null; // Token expired
                }
            }
            
            return claims;
        } catch (Exception e) {
            return null;
        }
    }
}
