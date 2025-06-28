
package com.example.messagecenter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String senderRole; // "customer" or "employee"
    private String receiverRole; // "customer" or "employee"
    private String subject;
    private String content;
    private String parentId; // New field to link to the original message in a conversation
    private LocalDateTime timestamp;
}
