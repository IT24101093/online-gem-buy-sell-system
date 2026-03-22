package com.example.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    public String getReply(String msg) {



        if (msg.contains("hello") || msg.contains("hi")) {
            return "Hello! Welcome to Gem Market 💎 How can I help you?";
        }

        // Buying
        if (msg.contains("buy")) {
            return "Great! What type of gem are you looking for? (Ruby, Sapphire, Emerald)";
        }

        // Selling
        if (msg.contains("sell")) {
            return "Awesome! Please upload your gem details and certification.";
        }

        // Price
        if (msg.contains("price")) {
            return "Gem prices depend on quality, size, and origin. Please specify the gem type.";
        }

        // Certification
        if (msg.contains("certified")) {
            return "Yes, all our gems come with trusted certification 💎";
        }

        return "You said: " + msg;
    }
}