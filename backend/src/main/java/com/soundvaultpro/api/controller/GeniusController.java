package com.soundvaultpro.api.controller;

import com.soundvaultpro.api.dto.ResponseDto;
import com.soundvaultpro.api.service.GeniusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/genius")
@RequiredArgsConstructor
@Slf4j
public class GeniusController {
    
    private final GeniusService geniusService;
    
    /**
     * Search for songs on Genius
     * 
     * @param query The search query (title and optionally artist)
     * @return List of search results
     */
    @GetMapping("/search")
    public ResponseEntity<ResponseDto<List<Map<String, Object>>>> searchSongs(@RequestParam String query) {
        log.info("Received request to search songs with query: {}", query);
        try {
            List<Map<String, Object>> results = geniusService.searchSongs(query);
            return ResponseEntity.ok(ResponseDto.success(results));
        } catch (Exception e) {
            log.error("Error searching songs: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(ResponseDto.error("Error searching songs: " + e.getMessage()));
        }
    }
    
    /**
     * Get song details by Genius song ID
     * 
     * @param songId The Genius song ID
     * @return Song details
     */
    @GetMapping("/songs/{songId}")
    public ResponseEntity<ResponseDto<Map<String, Object>>> getSongDetails(@PathVariable int songId) {
        log.info("Received request to get song details for ID: {}", songId);
        try {
            Map<String, Object> songDetails = geniusService.getSongDetails(songId);
            return ResponseEntity.ok(ResponseDto.success(songDetails));
        } catch (Exception e) {
            log.error("Error getting song details: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(ResponseDto.error("Error getting song details: " + e.getMessage()));
        }
    }
}
