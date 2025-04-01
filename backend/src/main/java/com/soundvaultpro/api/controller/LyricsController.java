package com.soundvaultpro.api.controller;

import com.soundvaultpro.api.dto.ResponseDto;
import com.soundvaultpro.api.service.LyricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/lyrics")
@RequiredArgsConstructor
public class LyricsController {

    private final LyricsService lyricsService;
    
    @GetMapping("/search")
    public ResponseEntity<ResponseDto<Map<String, String>>> searchLyrics(
            @RequestParam("track") String trackName,
            @RequestParam("artist") String artist) {
        
        try {
            String lyrics = lyricsService.searchLyrics(trackName, artist);
            
            if (lyrics == null) {
                return ResponseEntity.ok(ResponseDto.error("Lyrics not found"));
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("lyrics", lyrics);
            
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Error searching for lyrics: " + e.getMessage()));
        }
    }
}
