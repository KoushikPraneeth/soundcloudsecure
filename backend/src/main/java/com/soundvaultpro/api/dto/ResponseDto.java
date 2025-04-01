package com.soundvaultpro.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDto<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> ResponseDto<T> success(T data) {
        ResponseDto<T> response = new ResponseDto<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }
    
    public static <T> ResponseDto<T> success(String message, T data) {
        ResponseDto<T> response = new ResponseDto<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        return response;
    }
    
    public static <T> ResponseDto<T> error(String message) {
        ResponseDto<T> response = new ResponseDto<>();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}
