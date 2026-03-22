package com.example.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class LanguageService {

    public String detectLanguage(String text) {
        if (text == null || text.isBlank()) {
            return "unknown";
        }
        return text.matches(".*[\\u0D80-\\u0DFF].*") ? "si" : "en";
    }
}
