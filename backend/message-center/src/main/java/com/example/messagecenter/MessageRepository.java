
package com.example.messagecenter;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByReceiverRole(String receiverRole);
    List<Message> findBySenderRole(String senderRole);
}
