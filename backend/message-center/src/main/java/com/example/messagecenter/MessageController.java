
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
        return messageRepository.save(message);
    }

    @GetMapping("/byRole")
    public List<Message> getMessagesByRole(@RequestParam String role) {
        if ("customer".equals(role)) {
            return messageRepository.findByReceiverRole("customer");
        } else if ("employee".equals(role)) {
            return messageRepository.findByReceiverRole("employee");
        }
        return List.of(); // Return empty list for invalid role
    }

    

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable String id) {
        messageRepository.deleteById(id);
    }
}
