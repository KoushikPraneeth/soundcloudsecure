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

@Service
@RequiredArgsConstructor
@Slf4j
public class LyricsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${lyrics.api.key:dummy_key_for_development}")
    private String lyricsApiKey;
    
    @Value("${lyrics.api.url:https://api.musixmatch.com/ws/1.1}")
    private String lyricsApiUrl;
    
    /**
     * Search for lyrics by track name and artist
     * 
     * @param trackName The name of the track
     * @param artist The artist name
     * @return The lyrics if found, null otherwise
     */
    public String searchLyrics(String trackName, String artist) {
        try {
            // First search for the track to get the track ID
            String trackId = searchTrack(trackName, artist);
            if (trackId == null) {
                log.warn("Track not found: {} by {}", trackName, artist);
                return null;
            }
            
            // Then get the lyrics using the track ID
            return getLyricsByTrackId(trackId);
        } catch (Exception e) {
            log.error("Error searching for lyrics: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Search for a track by name and artist
     * 
     * @param trackName The name of the track
     * @param artist The artist name
     * @return The track ID if found, null otherwise
     */
    private String searchTrack(String trackName, String artist) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(lyricsApiUrl + "/matcher.track.get")
                    .queryParam("apikey", lyricsApiKey)
                    .queryParam("q_track", trackName)
                    .queryParam("q_artist", artist)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    entity, 
                    String.class
            );
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode message = root.path("message");
            JsonNode body = message.path("body");
            
            if (body.path("track").isMissingNode()) {
                return null;
            }
            
            return body.path("track").path("track_id").asText();
        } catch (Exception e) {
            log.error("Error searching for track: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get lyrics by track ID
     * 
     * @param trackId The track ID
     * @return The lyrics if found, null otherwise
     */
    private String getLyricsByTrackId(String trackId) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(lyricsApiUrl + "/track.lyrics.get")
                    .queryParam("apikey", lyricsApiKey)
                    .queryParam("track_id", trackId)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    entity, 
                    String.class
            );
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode message = root.path("message");
            JsonNode body = message.path("body");
            
            if (body.path("lyrics").isMissingNode()) {
                return null;
            }
            
            return body.path("lyrics").path("lyrics_body").asText();
        } catch (Exception e) {
            log.error("Error getting lyrics: {}", e.getMessage(), e);
            return null;
        }
    }
}
