package com.example.messagecenter;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MessageController.class)
class MessageControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessageRepository messageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Message message1;
    private Message message2;
    private Message replyMessage;

    @BeforeEach
    void setUp() {
        message1 = new Message();
        message1.setId("1");
        message1.setSenderRole("customer");
        message1.setReceiverRole("employee");
        message1.setSubject("Issue with order");
        message1.setContent("My order is delayed.");
        message1.setTimestamp(LocalDateTime.now());

        message2 = new Message();
        message2.setId("2");
        message2.setSenderRole("employee");
        message2.setReceiverRole("customer");
        message2.setSubject("Re: Issue with order");
        message2.setContent("We are looking into it.");
        message2.setTimestamp(LocalDateTime.now());

        replyMessage = new Message();
        replyMessage.setId("3");
        replyMessage.setSenderRole("customer");
        replyMessage.setReceiverRole("employee");
        replyMessage.setSubject("Re: We are looking into it.");
        replyMessage.setContent("Thanks for the update.");
        replyMessage.setParentId("2"); // This is a reply to message2
        replyMessage.setTimestamp(LocalDateTime.now());
    }

    @Test
    void createMessage() throws Exception {
        when(messageRepository.save(any(Message.class))).thenReturn(message1);

        mockMvc.perform(post("/api/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(message1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.senderRole").value("customer"));
    }

    @Test
    void getInboxMessages() throws Exception {
        when(messageRepository.findByReceiverRole("employee")).thenReturn(Arrays.asList(message1, replyMessage));

        mockMvc.perform(get("/api/messages/inbox")
                .param("role", "employee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[1].id").value("3"));
    }

    @Test
    void getOutboxMessages() throws Exception {
        when(messageRepository.findBySenderRole("customer")).thenReturn(Arrays.asList(message1, replyMessage));

        mockMvc.perform(get("/api/messages/outbox")
                .param("role", "customer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[1].id").value("3"));
    }

    @Test
    void getMessageThread() throws Exception {
        when(messageRepository.findByParentId("2")).thenReturn(Arrays.asList(replyMessage));

        mockMvc.perform(get("/api/messages/thread/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("3"));
    }

    @Test
    void deleteMessage() throws Exception {
        mockMvc.perform(delete("/api/messages/1"))
                .andExpect(status().isOk());
    }
}