import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [customerInbox, setCustomerInbox] = useState([]);
    const [customerOutbox, setCustomerOutbox] = useState([]);

    const [employeeInbox, setEmployeeInbox] = useState([]);
    const [employeeOutbox, setEmployeeOutbox] = useState([]);

    const [customerNewMessage, setCustomerNewMessage] = useState({ subject: '', content: '' });
    const [employeeNewMessage, setEmployeeNewMessage] = useState({ subject: '', content: '' });

    const fetchMessages = async (role, setter) => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/byRole?role=${role}`);
            const data = await response.json();
            setter(data);
        } catch (error) {
            console.error(`Error fetching ${role}:`, error);
        }
    };

    useEffect(() => {
        fetchMessages('customer', setCustomerInbox);
        fetchMessages('customer', setCustomerOutbox);

        fetchMessages('employee', setEmployeeInbox);
        fetchMessages('employee', setEmployeeOutbox);
    }, []);

    const handleSendMessage = async (senderRole, receiverRole, messageData) => {
        try {
            const response = await fetch('http://localhost:8080/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...messageData, senderRole, receiverRole }),
            });
            const newMessage = await response.json();

            // Update sender's outbox
            if (senderRole === 'customer') {
                setCustomerOutbox(prev => [...prev, newMessage]);
                setCustomerNewMessage({ subject: '', content: '' });
            } else if (senderRole === 'employee') {
                setEmployeeOutbox(prev => [...prev, newMessage]);
                setEmployeeNewMessage({ subject: '', content: '' });
            }

            // Update receiver's inbox
            if (receiverRole === 'customer') {
                setCustomerInbox(prev => [...prev, newMessage]);
            } else if (receiverRole === 'employee') {
                setEmployeeInbox(prev => [...prev, newMessage]);
            }

            
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    

    const handleDeleteMessage = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/messages/${id}`, {
                method: 'DELETE',
            });
            // Refresh all message lists after deletion
            fetchMessages('customer', setCustomerInbox);
            fetchMessages('customer', setCustomerOutbox);

            fetchMessages('employee', setEmployeeInbox);
            fetchMessages('employee', setEmployeeOutbox);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleCustomerInputChange = (name, value) => {
        setCustomerNewMessage(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeInputChange = (name, value) => {
        setEmployeeNewMessage(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Message Center</h1>
            </header>
            <main className="main-content">
                <div className="customer-section">
                    <h2>Customer Portal</h2>
                    <MessageForm
                        senderRole="customer"
                        receiverRole="employee"
                        messageData={customerNewMessage}
                        onInputChange={handleCustomerInputChange}
                        onSendMessage={handleSendMessage}
                    />
                    <MessageList title="Customer Inbox" messages={customerInbox} role="customer" onDelete={handleDeleteMessage} />
                    <MessageList title="Customer Outbox" messages={customerOutbox} role="customer" onDelete={handleDeleteMessage} />
                </div>

                <div className="employee-section">
                    <h2>Employee Portal</h2>
                    <MessageForm
                        senderRole="employee"
                        receiverRole="customer"
                        messageData={employeeNewMessage}
                        onInputChange={handleEmployeeInputChange}
                        onSendMessage={handleSendMessage}
                    />
                    <MessageList title="Employee Inbox" messages={employeeInbox} role="employee" onDelete={handleDeleteMessage} />
                    <MessageList title="Employee Outbox" messages={employeeOutbox} role="employee" onDelete={handleDeleteMessage} />
                </div>
            </main>
        </div>
    );
}

const MessageList = ({ title, messages, role, onDelete }) => (
    <div className="message-section">
        <h3>{title}</h3>
        {messages.length === 0 ? (
            <p>No messages in {title.toLowerCase()}.</p>
        ) : (
            messages.map(message => (
                <div key={message.id} className="message-item">
                    <h4>{message.subject}</h4>
                    <p>From: {message.senderRole}</p>
                    <p>To: {message.receiverRole}</p>
                    <p>{message.content}</p>
                    <p className="timestamp">{new Date(message.timestamp).toLocaleString()}</p>
                    
                </div>
            ))
        )}
    </div>
);

const MessageForm = ({ senderRole, receiverRole, messageData, onInputChange, onSendMessage }) => (
    <div class="message-form-section">
        <h3>Send Message as {senderRole}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSendMessage(senderRole, receiverRole, messageData); }}>
            <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={messageData.subject}
                onChange={(e) => onInputChange(e.target.name, e.target.value)}
                required
            />
            <textarea
                name="content"
                placeholder="Content"
                value={messageData.content}
                onChange={(e) => onInputChange(e.target.name, e.target.value)}
                required
            ></textarea>
            <button type="submit">Send</button>
        </form>
    </div>
);

export default App;