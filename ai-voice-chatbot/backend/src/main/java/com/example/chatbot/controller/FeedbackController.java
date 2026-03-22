package com.example.chatbot.controller;

import com.example.chatbot.entity.Feedback;
import com.example.chatbot.repository.FeedbackRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        Feedback saved = feedbackRepository.save(feedback);
        if (saved == null) {
            throw new IllegalArgumentException("Failed to save feedback");
        }
        return saved;
    }

    @GetMapping
    public List<Feedback> listFeedback() {
        return feedbackRepository.findAll();
    }
}