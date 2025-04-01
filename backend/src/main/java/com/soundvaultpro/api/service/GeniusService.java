package com.soundvaultpro.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeniusService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${genius.api.url:https://api.genius.com}")
    private String geniusApiUrl;
    
    @Value("${genius.access.token:p38MQWLSReGkHxRoaKh6LKbqYVUWplF5DU5O_xMZLjUyMfBC8jAC7F7h31QUqp8u}")
    private String geniusAccessToken;
    
    /**
     * Search for songs on Genius by title and artist
     * 
     * @param query The search query (title and optionally artist)
     * @return List of search results
     */
    public List<Map<String, Object>> searchSongs(String query) {
        log.info("Searching for song with query: {}", query);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + geniusAccessToken);
        
        UriComponentsBuilder uriBuilder = UriComponentsBuilder
            .fromHttpUrl(geniusApiUrl + "/search")
            .queryParam("q", query);
            
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                uriBuilder.toUriString(),
                HttpMethod.GET,
                entity,
                String.class
            );
            
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode hitsNode = rootNode.path("response").path("hits");
            
            List<Map<String, Object>> results = new ArrayList<>();
            
            for (JsonNode hit : hitsNode) {
                JsonNode result = hit.path("result");
                
                Map<String, Object> songData = new HashMap<>();
                songData.put("id", result.path("id").asInt());
                songData.put("title", result.path("title").asText());
                songData.put("artist", result.path("primary_artist").path("name").asText());
                songData.put("imageUrl", result.path("song_art_image_url").asText());
                songData.put("lyricsUrl", result.path("url").asText());
                
                results.add(songData);
            }
            
            return results;
        } catch (Exception e) {
            log.error("Error searching Genius API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search Genius API", e);
        }
    }
    
    /**
     * Get song details by Genius song ID
     * 
     * @param songId The Genius song ID
     * @return Song details
     */
    public Map<String, Object> getSongDetails(int songId) {
        log.info("Getting song details for ID: {}", songId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + geniusAccessToken);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                geniusApiUrl + "/songs/" + songId,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode songNode = rootNode.path("response").path("song");
            
            Map<String, Object> songDetails = new HashMap<>();
            songDetails.put("id", songNode.path("id").asInt());
            songDetails.put("title", songNode.path("title").asText());
            songDetails.put("artist", songNode.path("primary_artist").path("name").asText());
            songDetails.put("album", songNode.path("album").path("name").asText(""));
            songDetails.put("releaseDate", songNode.path("release_date").asText(""));
            songDetails.put("imageUrl", songNode.path("song_art_image_url").asText());
            songDetails.put("lyricsUrl", songNode.path("url").asText());
            
            // Extract lyrics state from the API response if available
            if (songNode.has("lyrics_state")) {
                songDetails.put("lyricsState", songNode.path("lyrics_state").asText());
            }
            
            return songDetails;
        } catch (Exception e) {
            log.error("Error getting song details from Genius API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get song details from Genius API", e);
        }
    }
}
