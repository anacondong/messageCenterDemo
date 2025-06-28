
package com.example.messagecenter;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @PostMapping
    public Message createMessage(@RequestBody Message message) {
        message.setTimestamp(LocalDateTime.now());
        // If a parentId is provided, ensure it's not empty
        if (message.getParentId() != null && message.getParentId().isEmpty()) {
            message.setParentId(null); // Set to null if empty string
        }
        return messageRepository.save(message);
    }

    @GetMapping("/thread/{parentId}")
    public List<Message> getMessageThread(@PathVariable String parentId) {
        return messageRepository.findByParentId(parentId);
    }

    @GetMapping("/inbox")
    public List<Message> getInboxMessages(@RequestParam String role) {
        return messageRepository.findByReceiverRole(role);
    }

    @GetMapping("/outbox")
    public List<Message> getOutboxMessages(@RequestParam String role) {
        return messageRepository.findBySenderRole(role);
    }

    

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable String id) {
        messageRepository.deleteById(id);
    }
}
