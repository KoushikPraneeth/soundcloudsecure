package com.soundvaultpro.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.soundvaultpro.api.dto.PlaylistDto;
import com.soundvaultpro.api.config.SupabaseConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    
    private final RestTemplate restTemplate;
    private final SupabaseConfig supabaseConfig;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    
    /**
     * Get all playlists for a user
     */
    public List<PlaylistDto> getPlaylistsByUser(String supabaseId) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists?user_id=eq." + supabaseId + "&order=created_at.desc";
        ResponseEntity<String> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            String.class
        );
        
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            List<PlaylistDto> playlists = new ArrayList<>();
            
            if (jsonNode.isArray()) {
                for (JsonNode node : jsonNode) {
                    PlaylistDto dto = PlaylistDto.builder()
                            .id(node.get("id").asLong())
                            .name(node.get("name").asText())
                            .description(node.has("description") ? node.get("description").asText() : null)
                            .userId(node.get("user_id").asText())
                            .userName(node.has("user_name") ? node.get("user_name").asText() : "")
                            .createdAt(LocalDateTime.parse(node.get("created_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                            .updatedAt(LocalDateTime.parse(node.get("updated_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                            .build();
                    playlists.add(dto);
                }
            }
            
            return playlists;
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Create a new playlist
     */
    public PlaylistDto createPlaylist(String supabaseId, String name, String description) {
        try {
            HttpHeaders headers = createHeaders();
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("user_id", supabaseId);
            requestBody.put("name", name);
            
            if (description != null) {
                requestBody.put("description", description);
            }
            
            // Get user details to store user name
            try {
                var userDto = userService.findBySupabaseId(supabaseId);
                if (userDto != null) {
                    requestBody.put("user_name", userDto.getName());
                }
            } catch (Exception e) {
                // Continue even if we can't get the user name
            }
            
            LocalDateTime now = LocalDateTime.now();
            requestBody.put("created_at", now.format(DateTimeFormatter.ISO_DATE_TIME));
            requestBody.put("updated_at", now.format(DateTimeFormatter.ISO_DATE_TIME));
            
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists";
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return PlaylistDto.builder()
                    .id(jsonNode.get("id").asLong())
                    .name(jsonNode.get("name").asText())
                    .description(jsonNode.has("description") ? jsonNode.get("description").asText() : null)
                    .userId(jsonNode.get("user_id").asText())
                    .userName(jsonNode.has("user_name") ? jsonNode.get("user_name").asText() : "")
                    .createdAt(LocalDateTime.parse(jsonNode.get("created_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                    .updatedAt(LocalDateTime.parse(jsonNode.get("updated_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                    .build();
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Update a playlist
     */
    public PlaylistDto updatePlaylist(String supabaseId, Long playlistId, String name, String description) {
        try {
            // First check if the playlist exists and belongs to the user
            verifyPlaylistOwnership(supabaseId, playlistId);
            
            HttpHeaders headers = createHeaders();
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("name", name);
            
            if (description != null) {
                requestBody.put("description", description);
            }
            
            requestBody.put("updated_at", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists?id=eq." + playlistId;
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.PATCH, 
                entity, 
                String.class
            );
            
            // Get the updated playlist
            return getPlaylist(playlistId);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Delete a playlist
     */
    public void deletePlaylist(String supabaseId, Long playlistId) {
        // First check if the playlist exists and belongs to the user
        verifyPlaylistOwnership(supabaseId, playlistId);
        
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists?id=eq." + playlistId;
        restTemplate.exchange(
            url, 
            HttpMethod.DELETE, 
            entity, 
            String.class
        );
    }
    
    /**
     * Get a playlist by ID
     */
    private PlaylistDto getPlaylist(Long playlistId) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists?id=eq." + playlistId;
        ResponseEntity<String> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            String.class
        );
        
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            if (jsonNode.isArray() && jsonNode.size() > 0) {
                JsonNode node = jsonNode.get(0);
                return PlaylistDto.builder()
                        .id(node.get("id").asLong())
                        .name(node.get("name").asText())
                        .description(node.has("description") ? node.get("description").asText() : null)
                        .userId(node.get("user_id").asText())
                        .userName(node.has("user_name") ? node.get("user_name").asText() : "")
                        .createdAt(LocalDateTime.parse(node.get("created_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                        .updatedAt(LocalDateTime.parse(node.get("updated_at").asText(), DateTimeFormatter.ISO_DATE_TIME))
                        .build();
            }
            throw new RuntimeException("Playlist not found");
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }
    }
    
    /**
     * Verify that a playlist exists and belongs to the user
     */
    private void verifyPlaylistOwnership(String supabaseId, Long playlistId) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        String url = supabaseConfig.getSupabaseUrl() + "/rest/v1/playlists?id=eq." + playlistId + "&user_id=eq." + supabaseId;
        ResponseEntity<String> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            String.class
        );
        
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            if (!jsonNode.isArray() || jsonNode.size() == 0) {
                throw new RuntimeException("Playlist not found or not owned by user");
            }
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
}
