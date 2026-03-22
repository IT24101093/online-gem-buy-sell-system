package com.example.chatbot.controller;

import com.example.chatbot.entity.Conversation;
import com.example.chatbot.repository.ConversationRepository;
import com.example.chatbot.service.AIService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ChatController {

    @Autowired
    private AIService aiService;

    @Autowired
    private ConversationRepository repo;

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> req) {

        String msg = req.get("message");
        String reply = aiService.getReply(msg);

        Conversation c = new Conversation();
        c.setUserMessage(msg);
        c.setBotReply(reply);

        repo.save(c);

        return Map.of("reply", reply);
    }
}